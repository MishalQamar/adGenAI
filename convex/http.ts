import { httpRouter } from 'convex/server';
import { httpAction } from './_generated/server';
import { internal } from './_generated/api';
import type { WebhookEvent } from '@clerk/backend';
import { Webhook } from 'svix';

const http = httpRouter();

http.route({
  path: '/webhook/clerk',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    const event = await validateRequest(request);
    if (!event) {
      return new Response('Error occured', { status: 400 });
    }
    switch (event.type) {
      case 'user.created': // intentional fallthrough
      case 'user.updated':
        await ctx.runMutation(internal.users.upsertFromClerk, {
          data: event.data,
        });
        break;

      case 'user.deleted': {
        const clerkUserId = event.data.id!;
        await ctx.runMutation(internal.users.deleteFromClerk, {
          clerkUserId,
        });
        break;
      }
      default:
        console.log('Ignored Clerk webhook event', event.type);
    }

    return new Response(null, { status: 200 });
  }),
});

http.route({
  path: '/webhook/kie-image',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    const payload = await request.json();
    console.log(
      'KIE webhook payload:',
      JSON.stringify(payload, null, 2)
    );

    const { taskId, state, resultJson, failCode, failMsg } =
      payload.data;

    if (!taskId) {
      return new Response('Missing taskId', { status: 400 });
    }

    if (state == 'success') {
      try {
        const result = JSON.parse(resultJson);
        console.log(
          'Parsed result:',
          JSON.stringify(result, null, 2)
        );

        // Try different possible field names for the image URL
        const imageUrl =
          result.resultUrls?.[0] || result.resultUrl || result.url;

        if (!imageUrl) {
          console.error('No image URL found in result:', result);
          return new Response('No image URL in result', {
            status: 400,
          });
        }

        await ctx.runMutation(
          internal.image_generations.mutations.update,
          {
            externalJobId: taskId,
            status: 'success',
            resultsImageUrls: imageUrl,
          }
        );

        console.log(
          'Image generation updated successfully with URL:',
          imageUrl
        );
      } catch (error) {
        console.error('Error processing success webhook:', error);
        return new Response('Error processing webhook', {
          status: 500,
        });
      }
    } else if (state == 'failed') {
      const errorMessage =
        failMsg ||
        `Failed to generate image with code: ${failCode}` ||
        'Unknown error';
      console.error(failCode, errorMessage);

      //update the image generation to failed status
      await ctx.runMutation(
        internal.image_generations.mutations.update,
        {
          externalJobId: taskId,
          status: 'fail',
        }
      );

      // get the image generation record Id
      const imageGeneration = await ctx.runQuery(
        internal.image_generations.queries.getByExternalJobId,
        {
          externalJobId: taskId,
        }
      );
      if (!imageGeneration) {
        console.error('Image generation not found', taskId);
        return new Response('Image generation not found', {
          status: 400,
        });
      }

      // refund the credits to the user
      await ctx.runMutation(internal.users.refundCredits, {
        clerkId: imageGeneration.userId,
        amount: imageGeneration.creditsUsage,
      });
    }

    return new Response(null, { status: 200 });
  }),
});

async function validateRequest(
  req: Request
): Promise<WebhookEvent | null> {
  const payloadString = await req.text();
  const svixHeaders = {
    'svix-id': req.headers.get('svix-id')!,
    'svix-timestamp': req.headers.get('svix-timestamp')!,
    'svix-signature': req.headers.get('svix-signature')!,
  };
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
  try {
    return wh.verify(
      payloadString,
      svixHeaders
    ) as unknown as WebhookEvent;
  } catch (error) {
    console.error('Error verifying webhook event', error);
    return null;
  }
}

export default http;

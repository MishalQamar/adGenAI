import { httpRouter } from 'convex/server';
import { httpAction } from './_generated/server';
import { internal } from './_generated/api';
import { Webhook } from 'svix';
import { polar } from './lib/polar';
import type { UserJSON } from '@clerk/backend';

const http = httpRouter();

interface ClerkWebhookEvent {
  type: string;
  data: UserJSON | { id?: string; [key: string]: unknown };
}

async function validateRequest(
  request: Request
): Promise<ClerkWebhookEvent | null> {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('CLERK_WEBHOOK_SECRET is not set');
    return null;
  }

  const svixHeaders = {
    'svix-id': request.headers.get('svix-id') ?? '',
    'svix-timestamp': request.headers.get('svix-timestamp') ?? '',
    'svix-signature': request.headers.get('svix-signature') ?? '',
  };

  const payload = await request.text();
  const wh = new Webhook(webhookSecret);

  try {
    const evt = wh.verify(payload, svixHeaders) as ClerkWebhookEvent;
    return evt;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return null;
  }
}

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
          data: event.data as UserJSON,
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

        const imageUrl = result.resultUrls?.[0];
        let finalUrl = imageUrl;
        const filename = `${taskId}.png`;

        const folderPath = 'image_generations';

        const uploadResult = await ctx.runAction(
          internal.image_generations.actions.uploadImage,
          {
            fileUrl: finalUrl,
            fileName: filename,
            folderPath: folderPath,
          }
        );
        finalUrl = uploadResult.url;

        await ctx.runMutation(
          internal.image_generations.mutations.update,
          {
            externalJobId: taskId,
            status: 'success',
            resultsImageUrls: finalUrl,
          }
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

http.route({
  path: '/webhook/kie-video',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    const payload = await request.json();

    const { code, data, msg } = payload;
    const { taskId } = data;

    if (!taskId) {
      return new Response('Missing taskId', { status: 400 });
    }

    if (code == 200) {
      try {
        const { info } = data;

        const imageUrl = info.resultUrls[0];
        let finalUrl = imageUrl;
        const filename = `${taskId}.mp4`;

        const folderPath = 'video_generations';

        const uploadResult = await ctx.runAction(
          internal.image_generations.actions.uploadImage,
          {
            fileUrl: finalUrl,
            fileName: filename,
            folderPath: folderPath,
          }
        );
        finalUrl = uploadResult.url;

        await ctx.runMutation(
          internal.video_generations.mutations.update,
          {
            externalJobId: taskId,
            status: 'success',
            resultsVideoUrls: finalUrl,
          }
        );
      } catch (error) {
        console.error('Error processing success webhook:', error);
        return new Response('Error processing webhook', {
          status: 500,
        });
      }
    } else {
      const errorMessage =
        msg ||
        `Failed to generate video with code: ${code}` ||
        'Unknown error';
      console.error(code, errorMessage);

      //update the image generation to failed status
      await ctx.runMutation(
        internal.video_generations.mutations.update,
        {
          externalJobId: taskId,
          status: 'fail',
        }
      );

      const videoGeneration = await ctx.runQuery(
        internal.video_generations.queries.getByExternalJobId,
        {
          externalJobId: taskId,
        }
      );
      if (!videoGeneration) {
        console.error('Video generation not found', taskId);
        return new Response('Video generation not found', {
          status: 400,
        });
      }

      // refund the credits to the user
      await ctx.runMutation(internal.users.refundCredits, {
        clerkId: videoGeneration.userId,
        amount: videoGeneration.creditsUsage,
      });
    }

    return new Response(null, { status: 200 });
  }),
});

polar.registerRoutes(http, {
  path: '/webhook/polar',
  onSubscriptionCreated: async (ctx, event) => {
    console.log('Subscription created', event.data);

    const subscription = event.data;

    const credits = subscription.product.metadata.credits
      ? parseInt(subscription.product.metadata.credits as string, 10)
      : 0;

    const userId = subscription.customer.metadata.userId;

    if (!userId) {
      console.error('User ID not found', subscription.customer.id);
      return;
    }
    const userIdString = userId.toString();
    if (typeof userId !== 'string') {
      console.error('User ID is not a string', userId);
      return;
    }
    let currentPeriodStart: number;
    if (subscription.currentPeriodStart) {
      if (typeof subscription.currentPeriodStart === 'string') {
        currentPeriodStart = parseInt(
          subscription.currentPeriodStart,
          10
        );
      } else if (subscription.currentPeriodStart instanceof Date) {
        currentPeriodStart =
          subscription.currentPeriodStart.getTime();
      } else if (
        typeof subscription.currentPeriodStart === 'number'
      ) {
        currentPeriodStart = subscription.currentPeriodStart;
      } else {
        currentPeriodStart = Date.now();
      }
    } else {
      currentPeriodStart = Date.now();
    }
    const cancelAtPeriodEnd = subscription.cancelAtPeriodEnd
      ? true
      : false;
    await ctx.runMutation(internal.subscriptions.mutations.create, {
      userId: userIdString,
      polarSubscriptionId: subscription.id,
      polarCustomerId: subscription.customer.id,
      polarProductId: subscription.product.id as string,
      status: subscription.status as 'active' | 'cancelled',
      credits,
      currentPeriodStart,
      cancelAtPeriodEnd,
    });
  },
  onSubscriptionUpdated: async (ctx, event) => {
    console.log('Subscription updated', event.data);
    const subscription = event.data;

    let currentPeriodStart: number | undefined;
    if (subscription.currentPeriodStart) {
      if (typeof subscription.currentPeriodStart === 'string') {
        currentPeriodStart = parseInt(
          subscription.currentPeriodStart,
          10
        );
      } else if (subscription.currentPeriodStart instanceof Date) {
        currentPeriodStart =
          subscription.currentPeriodStart.getTime();
      } else if (
        typeof subscription.currentPeriodStart === 'number'
      ) {
        currentPeriodStart = subscription.currentPeriodStart;
      }
    }

    let currentPeriodEnd: number | undefined;
    if (subscription.currentPeriodEnd) {
      if (typeof subscription.currentPeriodEnd === 'string') {
        currentPeriodEnd = parseInt(
          subscription.currentPeriodEnd,
          10
        );
      } else if (subscription.currentPeriodEnd instanceof Date) {
        currentPeriodEnd = subscription.currentPeriodEnd.getTime();
      } else if (typeof subscription.currentPeriodEnd === 'number') {
        currentPeriodEnd = subscription.currentPeriodEnd;
      }
    }

    await ctx.runMutation(internal.subscriptions.mutations.update, {
      polarSubscriptionId: subscription.id,
      polarProductId: subscription.product?.id,
      status:
        subscription.status == 'active' ? 'active' : 'cancelled',
      currentPeriodStart: currentPeriodStart
        ? new Date(currentPeriodStart).getTime()
        : undefined,
      currentPeriodEnd: currentPeriodEnd
        ? new Date(currentPeriodEnd).getTime()
        : undefined,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd
        ? true
        : false,
      updatedAt: Date.now(),
    });
  },
});

export default http;

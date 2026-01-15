'use node';

import { action, internalAction } from '../_generated/server';
import { v } from 'convex/values';
import { createImageWithKie } from '../lib/kie';

import { api, internal } from '../_generated/api';

export const generate = action({
  args: {
    prompt: v.string(),
    model: v.string(),
    aspectRatio: v.string(),
    characterImageUrl: v.optional(v.string()),

    objectImageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('user not authenticated');
    }

    const userId = identity.subject;
    const creditsUsed = 1;

    //deduct the credits from the user
    await ctx.runMutation(internal.users.deductCredits, {
      clerkId: userId,
      amount: creditsUsed,
    });

    //construct the image urls array for the kie api

    const imageUrls: string[] = [];

    if (args.characterImageUrl) {
      imageUrls.push(args.characterImageUrl);
    }

    if (args.objectImageUrl) {
      imageUrls.push(args.objectImageUrl);
    }
    //generate the image with the kie api
    const taskId = await createImageWithKie({
      model: args.model,
      prompt: args.prompt,
      imageUrls: imageUrls,
      aspectRatio: args.aspectRatio,
    });

    //save the image generation to the database
    await ctx.runMutation(
      internal.image_generations.mutations.create,
      {
        ...args,
        userId,
        creditsUsage: creditsUsed,
        externalJobId: taskId,
      }
    );

    return { success: true, taskId: taskId };
  },
});

export const uploadImage = internalAction({
  args: {
    fileUrl: v.string(),
    fileName: v.string(),
    folderPath: v.string(),
  },
  handler: async (ctx, args): Promise<{ url: string }> => {
    const result = await ctx.runAction(
      api.lib.imagekit.uploadImageToImageKit,
      {
        fileUrl: args.fileUrl,
        fileName: args.fileName,
        folderPath: args.folderPath,
      }
    );
    return result;
  },
});

import { v } from 'convex/values';
import { internalMutation } from '../_generated/server';

export const create = internalMutation({
  args: {
    userId: v.string(),
    model: v.string(),
    prompt: v.string(),
    aspectRatio: v.string(),
    characterImageUrl: v.optional(v.string()),
    objectImageUrl: v.optional(v.string()),
    creditsUsage: v.number(),
    externalJobId: v.string(),
  },
  handler: async (ctx, args) => {
    const imageGeneration = await ctx.db.insert('imageGenerations', {
      ...args,
      status: 'processing',
      createdAt: Date.now(),
    });
    return imageGeneration;
  },
});

export const update = internalMutation({
  args: {
    externalJobId: v.string(),
    status: v.union(v.literal('success'), v.literal('fail')),
    resultsImageUrls: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const imageGeneration = await ctx.db
      .query('imageGenerations')
      .withIndex('by_external_job_id', (q) =>
        q.eq('externalJobId', args.externalJobId)
      )
      .first();

    if (imageGeneration) {
      await ctx.db.patch(imageGeneration._id, args);
    }
  },
});

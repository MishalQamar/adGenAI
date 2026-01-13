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
    const videoGeneration = await ctx.db.insert('videoGenerations', {
      ...args,
      status: 'processing',
      createdAt: Date.now(),
    });
    return videoGeneration;
  },
});

export const update = internalMutation({
  args: {
    externalJobId: v.string(),
    status: v.union(v.literal('success'), v.literal('fail')),
    resultsVideoUrls: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const videoGeneration = await ctx.db
      .query('videoGenerations')
      .withIndex('by_external_job_id', (q) =>
        q.eq('externalJobId', args.externalJobId)
      )
      .first();

    if (videoGeneration) {
      await ctx.db.patch(videoGeneration._id, args);
    }
  },
});

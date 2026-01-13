import { v } from 'convex/values';
import { internalQuery, query } from '../_generated/server';
import { getCurrentUserOrThrow } from '../users';

export const getByExternalJobId = internalQuery({
  args: {
    externalJobId: v.string(),
  },
  handler: async (ctx, args) => {
    const videoGeneration = await ctx.db
      .query('videoGenerations')
      .withIndex('by_external_job_id', (q) =>
        q.eq('externalJobId', args.externalJobId)
      )
      .first();
    return videoGeneration;
  },
});

export const getRecent = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { limit = 10 }) => {
    const user = await getCurrentUserOrThrow(ctx);
    const videos = await ctx.db
      .query('videoGenerations')
      .withIndex('by_user_id', (q) => q.eq('userId', user.clerkId))
      .order('desc')
      .take(limit);

    return videos;
  },
});

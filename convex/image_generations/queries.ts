import { v } from 'convex/values';
import { internalQuery, query } from '../_generated/server';
import { getCurrentUserOrThrow } from '../users';

export const getByExternalJobId = internalQuery({
  args: {
    externalJobId: v.string(),
  },
  handler: async (ctx, args) => {
    const imageGeneration = await ctx.db
      .query('imageGenerations')
      .withIndex('by_external_job_id', (q) =>
        q.eq('externalJobId', args.externalJobId)
      )
      .first();
    return imageGeneration;
  },
});

export const getRecent = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { limit = 10 }) => {
    const user = await getCurrentUserOrThrow(ctx);
    const images = await ctx.db
      .query('imageGenerations')
      .withIndex('by_user_id', (q) => q.eq('userId', user.clerkId))
      .order('desc')
      .take(limit);

    return images;
  },
});

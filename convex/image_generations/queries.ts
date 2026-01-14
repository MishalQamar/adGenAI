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

export const getPaginatedImages = query({
  args: {
    paginationOpts: v.any(),
  },
  handler: async (ctx, { paginationOpts }) => {
    const paginatedGenerations = await ctx.db
      .query('imageGenerations')
      .withIndex('by_status', (q) => q.eq('status', 'success'))
      .order('desc')
      .paginate(paginationOpts);

    // collect all unique ids we saw
    const uniqueUserIds = [
      ...new Set(
        paginatedGenerations.page.map(
          (generation) => generation.userId
        )
      ),
    ];

    //batch fetch all users in parallel using index
    const users = await Promise.all(
      uniqueUserIds.map((userId) =>
        ctx.db
          .query('users')
          .withIndex('by_clerk_id', (q) => q.eq('clerkId', userId))
          .first()
      )
    );

    //lookup map for access
    const userMap = new Map(
      users.map((user) => [user!.clerkId, user])
    );

    //combine generations with user details

    const enrichedGenerations = paginatedGenerations.page.map(
      (generation) => {
        const user = userMap.get(generation.userId);
        return {
          ...generation,
          user: {
            name: user?.name,
            imageUrl: user?.imageUrl,
          },
        };
      }
    );

    return {
      ...paginatedGenerations,
      page: enrichedGenerations,
    };
  },
});

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

export const getPaginatedVideos = query({
  args: {
    paginationOpts: v.any(),
  },
  handler: async (ctx, { paginationOpts }) => {
    const paginatedVideos = await ctx.db
      .query('videoGenerations')
      .withIndex('by_status', (q) => q.eq('status', 'success'))
      .order('desc')
      .paginate(paginationOpts);

    // collect all unique ids we saw
    const uniqueUserIds = [
      ...new Set(
        paginatedVideos.page.map((generation) => generation.userId)
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
      users
        .filter((user): user is NonNullable<typeof user> => user !== null && user !== undefined)
        .map((user) => [user.clerkId, user])
    );

    //combine generations with user details

    const enrichedVideos = paginatedVideos.page.map((generation) => {
      const user = userMap.get(generation.userId);
      return {
        ...generation,
        user: {
          name: user?.name,
          imageUrl: user?.imageUrl,
        },
      };
    });

    return {
      ...paginatedVideos,
      page: enrichedVideos,
    };
  },
});

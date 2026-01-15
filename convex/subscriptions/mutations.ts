import { v } from 'convex/values';
import { internalMutation } from '../_generated/server';

export const create = internalMutation({
  args: {
    userId: v.string(),
    polarSubscriptionId: v.string(),
    polarCustomerId: v.string(),
    polarProductId: v.string(),
    status: v.union(v.literal('active'), v.literal('cancelled')),
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.optional(v.number()),
    cancelAtPeriodEnd: v.boolean(),
    credits: v.number(),
  },
  handler: async (ctx, args) => {
    const { credits, ...subscriptionArgs } = args;

    const existingSubscription = await ctx.db
      .query('subscriptions')
      .withIndex('by_polar_subscription_id', (q) =>
        q.eq('polarSubscriptionId', args.polarSubscriptionId)
      )
      .first();

    if (existingSubscription) {
      return existingSubscription._id;
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', args.userId))
      .unique();

    if (!user) {
      console.warn('User not found', args.userId);
      throw new Error('User not found');
    }
    const subscriptionId = await ctx.db.insert('subscriptions', {
      ...subscriptionArgs,
      updatedAt: Date.now(),
    });

    await ctx.db.patch(user._id, {
      subscriptionId,
      credits,
      polarCustomerId: args.polarCustomerId,
      updatedAt: Date.now(),
    });

    return subscriptionId;
  },
});

export const update = internalMutation({
  args: {
    polarSubscriptionId: v.string(),
    polarProductId: v.optional(v.string()),
    status: v.optional(
      v.union(v.literal('active'), v.literal('cancelled'))
    ),
    currentPeriodStart: v.optional(v.number()),
    currentPeriodEnd: v.optional(v.number()),
    cancelAtPeriodEnd: v.optional(v.boolean()),
    updatedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { polarSubscriptionId, ...updateArgs } = args;

    const existingSubscription = await ctx.db
      .query('subscriptions')
      .withIndex('by_polar_subscription_id', (q) =>
        q.eq('polarSubscriptionId', polarSubscriptionId)
      )
      .first();

    if (!existingSubscription) {
      console.warn('Subscription not found', polarSubscriptionId);
      throw new Error('Subscription not found');
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) =>
        q.eq('clerkId', existingSubscription.userId)
      )
      .unique();

    if (user) {
      await ctx.db.patch(user._id, {
        credits: updateArgs.status === 'cancelled' ? 0 : user.credits,
        updatedAt: Date.now(),
      });
    }
    const filteredUpdateArgs = Object.fromEntries(
      Object.entries(updateArgs).filter(
        ([, value]) => value !== undefined
      )
    );
    await ctx.db.patch(existingSubscription._id, filteredUpdateArgs);

    return existingSubscription._id;
  },
});

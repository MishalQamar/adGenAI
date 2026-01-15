import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    polarCustomerId: v.optional(v.string()),
    subscriptionId: v.optional(v.id('subscriptions')),
    credits: v.optional(v.number()),

    updatedAt: v.number(),
  })
    .index('by_clerk_id', ['clerkId'])
    .index('by_email', ['email']),

  characters: defineTable({
    name: v.string(),
    imageUrl: v.string(),
    imageFileId: v.optional(v.string()),
    userId: v.optional(
      v.string()
    ) /* optional because characters can be created by system, stores Clerk user ID */,
  }).index('by_user_id', ['userId']),

  imageGenerations: defineTable({
    userId: v.string(),
    model: v.string(),
    prompt: v.string(),
    aspectRatio: v.string(),
    characterImageUrl: v.optional(v.string()),
    objectImageUrl: v.optional(v.string()),
    status: v.union(
      v.literal('processing'),
      v.literal('success'),
      v.literal('fail')
    ),
    resultsImageUrls: v.optional(v.string()),
    creditsUsage: v.number(),
    createdAt: v.number(),
    externalJobId: v.string(),
  })
    .index('by_user_id', ['userId'])
    .index('by_status', ['status'])
    .index('by_created_at', ['createdAt'])
    .index('by_external_job_id', ['externalJobId']),

  videoGenerations: defineTable({
    userId: v.string(),
    model: v.string(),
    prompt: v.string(),
    aspectRatio: v.string(),
    characterImageUrl: v.optional(v.string()),
    objectImageUrl: v.optional(v.string()),
    status: v.union(
      v.literal('processing'),
      v.literal('success'),
      v.literal('fail')
    ),
    resultsVideoUrls: v.optional(v.string()),
    creditsUsage: v.number(),
    createdAt: v.number(),
    externalJobId: v.string(),
  })
    .index('by_user_id', ['userId'])
    .index('by_status', ['status'])
    .index('by_created_at', ['createdAt'])
    .index('by_external_job_id', ['externalJobId']),

  subscriptions: defineTable({
    userId: v.string(),
    polarSubscriptionId: v.string(),
    polarCustomerId: v.string(),
    polarProductId: v.string(),
    status: v.union(v.literal('active'), v.literal('cancelled')),
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.optional(v.number()),
    cancelAtPeriodEnd: v.boolean(),
    updatedAt: v.number(),
  })
    .index('by_user_id', ['userId'])
    .index('by_polar_subscription_id', ['polarSubscriptionId']),
});

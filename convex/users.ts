import {
  internalMutation,
  query,
  QueryCtx,
} from './_generated/server';
import { UserJSON } from '@clerk/backend';
import { v, Validator } from 'convex/values';

export const current = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});

export const upsertFromClerk = internalMutation({
  args: { data: v.any() as Validator<UserJSON> }, // no runtime validation, trust Clerk
  async handler(ctx, { data }) {
    const userAttributes = {
      clerkId: data.id,
      email: data.email_addresses[0]?.email_address || '',
      imageUrl: data.image_url || '',
      updatedAt: Date.now(),
      name: `${data.first_name} ${data.last_name}`,
    };

    const user = await userByExternalId(ctx, data.id);
    if (user === null) {
      await ctx.db.insert('users', { ...userAttributes, credits: 2 });
    } else {
      await ctx.db.patch(user._id, userAttributes);
    }
  },
});

export const deleteFromClerk = internalMutation({
  args: { clerkUserId: v.string() },
  async handler(ctx, { clerkUserId }) {
    const user = await userByExternalId(ctx, clerkUserId);

    if (user !== null) {
      await ctx.db.delete(user._id);
    } else {
      console.warn(
        `Can't delete user, there is none for Clerk user ID: ${clerkUserId}`
      );
    }
  },
});

export async function getCurrentUserOrThrow(ctx: QueryCtx) {
  const userRecord = await getCurrentUser(ctx);
  if (!userRecord) throw new Error("Can't get current user");
  return userRecord;
}

export async function getCurrentUser(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) {
    return null;
  }
  return await userByExternalId(ctx, identity.subject);
}

async function userByExternalId(ctx: QueryCtx, externalId: string) {
  return await ctx.db
    .query('users')
    .withIndex('by_clerk_id', (q) => q.eq('clerkId', externalId))
    .unique();
}

export const deductCredits = internalMutation({
  args: {
    clerkId: v.string(),
    amount: v.number(),
  },
  handler: async (ctx, { clerkId, amount }) => {
    const user = await userByExternalId(ctx, clerkId);
    if (!user) {
      throw new Error('User not found');
    }
    const currentCredits = user.credits ?? 0;

    if (currentCredits < amount) {
      throw new Error('Insufficient credits');
    }
    await ctx.db.patch(user._id, {
      credits: currentCredits - amount,
      updatedAt: Date.now(),
    });
  },
});

export const refundCredits = internalMutation({
  args: {
    clerkId: v.string(),
    amount: v.number(),
  },
  handler: async (ctx, { clerkId, amount }) => {
    const user = await userByExternalId(ctx, clerkId);
    if (!user) {
      throw new Error('User not found');
    }
    const currentCredits = user.credits ?? 0;
    await ctx.db.patch(user._id, {
      credits: currentCredits + amount,
      updatedAt: Date.now(),
    });
  },
});

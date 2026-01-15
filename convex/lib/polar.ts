import { Polar } from '@convex-dev/polar';
import type {
  GenericQueryCtx,
  GenericDataModel,
} from 'convex/server';
import { api, components } from '../_generated/api';

type RunQueryCtx = {
  runQuery: GenericQueryCtx<GenericDataModel>['runQuery'];
};

export const polar = new Polar(components.polar, {
  getUserInfo: async (
    ctx: RunQueryCtx
  ): Promise<{ userId: string; email: string }> => {
    const user = await ctx.runQuery(api.users.current);
    if (!user) {
      throw new Error('User not found');
    }
    return {
      userId: user.clerkId,
      email: user.email,
    };
  },

  products: {
    pro: process.env.POLAR_PRO_PRODUCT_ID!,
    enterprise: process.env.POLAR_ENTERPRISE_PRODUCT_ID!,
  },
  organizationToken: process.env.POLAR_ORGANIZATION_TOKEN!,
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
  server: 'sandbox',
});

// Export API functions from the Polar client
export const {
  getConfiguredProducts,
  generateCheckoutLink,
  generateCustomerPortalUrl,
} = polar.api();

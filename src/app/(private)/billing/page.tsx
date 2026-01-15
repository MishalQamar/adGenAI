'use client';

import { useQuery, useAction } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Calendar,
  CreditCard,
} from 'lucide-react';
import { PRICING_PLANS } from '@/lib/constants';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { toast } from 'sonner';

export default function BillingPage() {
  const subscriptionData = useQuery(
    api.subscriptions.queries.getUserSubscriptions
  );
  const generatedCheckoutLink = useAction(
    api['lib/actions'].generateCheckoutLink
  );
  const [isLoading, setIsLoading] = useState(false);

  if (subscriptionData === undefined) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="animate-spin size-8 text-muted-foreground" />
      </div>
    );
  }

  const { subscription, isPro, isEnterprise } = subscriptionData;

  // Fix: Only consider subscribed if subscription exists AND is active
  const isSubscriptionActive = subscription?.status === 'active';
  const isSubscribed =
    isSubscriptionActive && (isPro || isEnterprise);

  // Determine current plan - default to Starter if not subscribed
  const planName = isSubscribed
    ? isPro
      ? 'Professional'
      : isEnterprise
      ? 'Enterprise'
      : 'Starter'
    : 'Starter';

  const currentPlan =
    isSubscribed && subscription
      ? PRICING_PLANS.find(
          (plan) => plan.productId === subscription.polarProductId
        )
      : PRICING_PLANS.find((plan) => plan.name === 'Starter');

  const status = subscription?.status ?? null;
  const renewalDate =
    subscription?.currentPeriodEnd && isSubscriptionActive
      ? new Date(subscription.currentPeriodEnd).toLocaleDateString(
          'en-US',
          { year: 'numeric', month: 'long', day: 'numeric' }
        )
      : null;

  const handleUpgrade = async (productId: string) => {
    if (!productId || productId === 'starter') {
      toast.error('Please select a paid plan to upgrade.');
      return;
    }

    try {
      setIsLoading(true);
      const { url } = await generatedCheckoutLink({
        productIds: [productId],
        origin: window.location.origin,
        successUrl: `${window.location.origin}/billing`,
      });
      window.location.href = url;
    } catch (error) {
      console.error(error);
      toast.error('Failed to start checkout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Billing & Subscription</h1>
        <p className="text-muted-foreground mt-2">
          Manage your subscription and billing information
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">
                {planName} Plan
              </CardTitle>
              <CardDescription className="mt-1">
                {currentPlan?.description ||
                  'Current subscription plan'}
              </CardDescription>
            </div>
            {status ? (
              <Badge
                variant={
                  status === 'active' ? 'default' : 'secondary'
                }
                className="text-sm"
              >
                {status === 'active' ? (
                  <>
                    <CheckCircle2 className="size-3 mr-1" />
                    Active
                  </>
                ) : (
                  <>
                    <XCircle className="size-3 mr-1" />
                    Cancelled
                  </>
                )}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-sm">
                <XCircle className="size-3 mr-1" />
                Not Subscribed
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <CreditCard className="size-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Plan Price</p>
                <p className="text-2xl font-semibold mt-1">
                  {currentPlan?.price || '$0 / mo'}
                </p>
              </div>
            </div>

            {renewalDate && (
              <div className="flex items-start gap-3">
                <Calendar className="size-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Renewal Date</p>
                  <p className="text-lg font-medium mt-1">
                    {renewalDate}
                  </p>
                </div>
              </div>
            )}

            {subscription && !isSubscriptionActive && (
              <div className="flex items-start gap-3">
                <XCircle className="size-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <p className="text-lg font-medium mt-1 text-muted-foreground">
                    Subscription cancelled
                  </p>
                </div>
              </div>
            )}
          </div>

          {currentPlan && currentPlan.features && (
            <div className="border-t pt-6">
              <h3 className="text-sm font-semibold mb-4">
                Plan Features
              </h3>
              <ul className="grid gap-2 md:grid-cols-2">
                {currentPlan.features
                  .slice(0, 6)
                  .map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm"
                    >
                      <CheckCircle2 className="size-4 text-green-500 mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t pt-6">
          {!isSubscribed ? (
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button
                onClick={() => {
                  const proPlan = PRICING_PLANS.find(
                    (p) => p.name === 'Professional'
                  );
                  if (proPlan) handleUpgrade(proPlan.productId);
                }}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" />
                    Loading...
                  </>
                ) : (
                  'Upgrade to Professional'
                )}
              </Button>
              <Button
                onClick={() => {
                  const enterprisePlan = PRICING_PLANS.find(
                    (p) => p.name === 'Enterprise'
                  );
                  if (enterprisePlan)
                    handleUpgrade(enterprisePlan.productId);
                }}
                disabled={isLoading}
                variant="outline"
                className="flex-1"
              >
                View Enterprise Plans
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <p className="text-sm text-muted-foreground">
                Your subscription is active. You can manage it through
                your billing portal.
              </p>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

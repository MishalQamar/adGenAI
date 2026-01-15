'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Check, Loader2 } from 'lucide-react';
import { PricingPlan } from '@/lib/constants';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useAction } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { toast } from 'sonner';

interface PricingCardProps {
  plan: PricingPlan;
}

export function PricingCard({ plan }: PricingCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { isSignedIn } = useUser();
  const generatedCheckoutLink = useAction(
    api['lib/actions'].generateCheckoutLink
  );

  const handleCheckout = async () => {
    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }

    if (!plan.productId) {
      toast.error(
        'Product ID is not configured. Please contact support.'
      );
      return;
    }

    try {
      setIsLoading(true);
      const { url } = await generatedCheckoutLink({
        productIds: [plan.productId],
        origin: window.location.origin,
        successUrl: `${window.location.origin}/dashboard`,
      });
      window.location.href = url;
    } catch (error) {
      console.error(error);
      toast.error('Failed to checkout');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="relative flex flex-col">
      {plan.isPopular && (
        <span className="absolute inset-x-0 -top-3 mx-auto flex h-6 w-fit items-center rounded-full bg-gradient-to-br from-purple-400 to-amber-300 px-3 py-1 text-xs font-medium text-amber-950 ring-1 ring-inset ring-white/20 ring-offset-1 ring-offset-gray-950/5">
          Popular
        </span>
      )}

      <CardHeader>
        <CardTitle className="font-medium">{plan.name}</CardTitle>
        <span className="my-3 block text-2xl font-semibold">
          {plan.price}
        </span>
        <CardDescription className="text-sm">
          {plan.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <hr className="border-dashed" />

        <ul className="list-outside space-y-3 text-sm">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <Check className="size-3" />
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="mt-auto">
        <Button
          variant={plan.isPopular ? 'default' : 'outline'}
          className="w-full"
          onClick={handleCheckout}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Loading...</span>
            </>
          ) : (
            'Get Started'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

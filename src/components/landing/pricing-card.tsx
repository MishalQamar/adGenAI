import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Check } from 'lucide-react';
import { PricingPlan } from '@/lib/constants';

interface PricingCardProps {
  plan: PricingPlan;
}

export function PricingCard({ plan }: PricingCardProps) {
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
          asChild
          variant={plan.isPopular ? 'default' : 'outline'}
          className="w-full"
        >
          <Link href="">Get Started</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

import { PricingCard } from '@/components/landing/pricing-card';
import { PRICING_PLANS } from '@/lib/constants';

export default function Pricing() {
  return (
    <section className="py-16 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl space-y-6 text-center">
          <h1 className="text-center text-4xl font-semibold lg:text-5xl">
            Simple Pricing for Every Business
          </h1>
          <p>
            Start generating high-converting ads today. Choose the
            plan that fits your needs, from solo marketers to large
            agencies.
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:mt-20 md:grid-cols-3">
          {PRICING_PLANS.map((plan) => (
            <PricingCard key={plan.productId} plan={plan} />
          ))}
        </div>
      </div>
    </section>
  );
}

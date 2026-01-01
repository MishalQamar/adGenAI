export interface PricingPlan {
  name: string;
  price: string;
  description: string;
  features: string[];
  productId: string;
  isPopular?: boolean;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    name: 'Starter',
    price: '$0 / mo',
    description: 'Perfect for trying out AI ads',
    features: [
      '10 AI-generated ads per month',
      'Basic ad templates',
      'Single platform support',
      'Email support',
    ],
    productId: 'starter',
  },
  {
    name: 'Professional',
    price: '$49 / mo',
    description: 'For growing businesses',
    features: [
      'Everything in Starter',
      'Unlimited AI-generated ads',
      'All ad platforms (Facebook, Google, Instagram, LinkedIn, TikTok)',
      'Advanced A/B testing',
      'Performance analytics dashboard',
      'Custom brand voice training',
      'Priority email support',
      'Team collaboration (up to 5 users)',
      'Export to ad platforms',
      'Advanced targeting suggestions',
    ],
    productId: 'professional',
    isPopular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For agencies and large teams',
    features: [
      'Everything in Professional',
      'Unlimited team members',
      'Dedicated account manager',
      'Custom AI model training',
      'API access',
      'White-label options',
      '24/7 priority support',
      'Custom integrations',
      'Advanced security & compliance',
      'SLA guarantee',
    ],
    productId: 'enterprise',
  },
];

export const IMAGE_GENERATION_MODELS = [
  {
    value: 'flux',
    label: 'Flux',
  },
  {
    value: 'dall-e-3',
    label: 'DALL-E 3',
  },
  {
    value: 'nano-banana',
    label: 'Nano Banana',
  },
];

export const IMAGE_ASPECT_RATIOS = [
  {
    value: '1:1',
    label: '1:1',
  },
  {
    value: '16:9',
    label: '16:9',
  },
  {
    value: '9:16',
    label: '9:16',
  },
  {
    value: '4:3',
    label: '4:3',
  },
  {
    value: '3:4',
    label: '3:4',
  },
];

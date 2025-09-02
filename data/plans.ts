import { Plan } from '../types';

export const plans: Plan[] = [
  {
    name: 'Free',
    price: '$0',
    pricePeriod: '/ month',
    description: 'Get started and explore the basics of trend discovery.',
    features: [
      'View top 8 trends',
      'Generate 1 content idea at a time',
      'Basic monetization tips',
    ],
  },
  {
    name: 'Starter',
    price: '$19',
    pricePeriod: '/ month',
    description: 'For creators ready to level up their content game.',
    features: [
      'View all 48 trends',
      'Keyword Research Tool',
      'Generate 3 content ideas at once',
      'Unlock AI script generation',
      'Personalized monetization strategies',
    ],
    isFeatured: true,
  },
  {
    name: 'Pro',
    price: '$49',
    pricePeriod: '/ month',
    description: 'The ultimate toolkit for professional creators and agencies.',
    features: [
      'All features in Starter',
      'AI Video Generator',
      'AI Animation Creator',
      'AI GIF Creator',
      'AI Logo Creator',
      'AI Image Editor',
      'Full Content Strategy Reports',
      'Personalized Channel Growth Plan',
      'Competitor Channel Analysis',
      'AI Sponsorship Finder & Pitch Generator',
      'Priority support',
    ],
  },
];
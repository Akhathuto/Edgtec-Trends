export enum Tab {
  Trends = 'trends',
  Ideas = 'ideas',
  Monetization = 'monetization',
  Report = 'report',
  Video = 'video',
  About = 'about',
  Profile = 'profile',
  Admin = 'admin',
  Pricing = 'pricing',
  Support = 'support',
  Contact = 'contact',
}

export interface User {
  id: string;
  name: string;
  email: string;
  plan: 'free' | 'starter' | 'pro';
  role: 'admin' | 'user';
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signUp: (name: string, email: string, pass: string, plan: 'free' | 'starter' | 'pro') => Promise<void>;
  logout: () => void;
  upgradePlan: (plan: 'starter' | 'pro') => void;
  getAllUsers: () => User[];
  updateUser: (userId: string, updates: Partial<Pick<User, 'plan' | 'role'>>) => void;
}

export interface Plan {
  name: 'Free' | 'Starter' | 'Pro';
  price: string;
  pricePeriod: string;
  description: string;
  features: string[];
  isFeatured?: boolean;
}


export interface Trend {
  title: string;
  description: string;
  platform: 'YouTube' | 'TikTok';
}

export interface GroundingSource {
    uri: string;
    title: string;
}

export interface ContentIdea {
    title: string;
    hook: string;
    script_outline: string[];
    hashtags: string[];
    virality_potential: {
      score: string;
      reasoning: string;
    };
    detailed_script?: string;
}

export interface MonetizationStrategy {
    strategy: string;
    description: string;
    potential: string;
    requirements: string;
}

export interface FullReport {
  trendAnalysis: string;
  contentIdeas: ContentIdea[];
  monetizationStrategies: MonetizationStrategy[];
}

export interface TrendingChannel {
  name: string;
  platform: 'YouTube' | 'TikTok';
  description: string;
  channel_url: string;
  subscriber_count: string;
  view_count: string;
}

export interface TrendingTopic {
  name: string;
  platform: 'YouTube' | 'TikTok';
  description: string;
}
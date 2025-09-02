export enum Tab {
  Dashboard = 'dashboard',
  Trends = 'trends',
  Ideas = 'ideas',
  Monetization = 'monetization',
  Report = 'report',
  Prompt = 'prompt',
  Video = 'video',
  AnimationCreator = 'animation-creator',
  ImageEditor = 'image-editor',
  Keywords = 'keywords',
  Chat = 'chat',
  Analytics = 'analytics',
  ChannelGrowth = 'channel-growth',
  About = 'about',
  Profile = 'profile',
  Admin = 'admin',
  Pricing = 'pricing',
  Support = 'support',
  Contact = 'contact',
  TermsOfUse = 'terms-of-use',
  License = 'license',
  BrandConnect = 'brand-connect',
  ContentHistory = 'content-history',
  GifCreator = 'gif-creator',
  LogoCreator = 'logo-creator',
}

export interface Channel {
  id: string;
  platform: 'YouTube' | 'TikTok' | 'X' | 'Instagram' | 'Facebook' | 'Website';
  url: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  plan: 'free' | 'starter' | 'pro';
  role: 'admin' | 'user';
  country?: string;
  phone?: string;
  company?: string;
  channels?: Channel[];
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  icon: string;
  timestamp: string; // ISO string
}

export interface KeywordUsage {
  count: number;
  resetDate: string; // ISO string
}

export type HistoryContentType =
  | 'Content Idea'
  | 'Strategy Report'
  | 'Video Transcript'
  | 'Generated Prompt'
  | 'Image Edit'
  | 'Keyword Analysis'
  | 'Channel Growth Plan'
  | 'Sponsorship Opportunities'
  | 'Brand Pitch'
  | 'Animation'
  | 'GIF'
  | 'Logo';

export interface HistoryItem {
  id: string;
  timestamp: string; // ISO string
  type: HistoryContentType;
  summary: string;
  content: any;
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
  updateProfile: (userId: string, updates: Partial<Pick<User, 'name' | 'email' | 'country' | 'phone' | 'company' | 'channels'>>) => Promise<void>;
  logActivity: (action: string, icon: string) => void;
  getAllActivities: () => ActivityLog[];
  deleteUser: (userId: string) => void;
  getKeywordUsage: () => { remaining: number; limit: number | 'unlimited' };
  logKeywordAnalysis: () => void;
  getContentHistory: () => HistoryItem[];
  addContentToHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
}

export interface GroundingSource {
  uri: string;
  title: string;
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

export interface TrendingVideo {
  title: string;
  videoUrl: string;
  thumbnailUrl: string;
  channelName: string;
  viewCount: string;
  publishedTime: string;
}

export interface TrendingCreator {
  name: string;
  channelUrl: string;
  subscriberCount: string;
  category: string;
  reason: string;
}

export interface TrendingMusic {
  trackTitle: string;
  artistName: string;
  videosUsingSound: string;
  reason: string;
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
  // Fix: Replaced 'action_steps' with 'requirements' to match the Gemini API schema and component usage.
  requirements: string;
}

export interface FullReport {
    trendAnalysis: string;
    contentIdeas: Omit<ContentIdea, 'virality_potential' | 'detailed_script'>[];
    monetizationStrategies: MonetizationStrategy[];
}

export interface KeywordAnalysis {
    keyword: string;
    searchVolume: 'High' | 'Medium' | 'Low' | 'Very High' | 'Very Low';
    competition: 'High' | 'Medium' | 'Low';
    relatedKeywords: string[];
    contentIdeas: string[];
}

export interface ChannelAnalyticsData {
  platform: 'YouTube' | 'TikTok';
  channelName: string;
  followerCount: string;
  followerTrend: 'up' | 'down' | 'stable';
  totalViews: string;
  viewsTrend: 'up' | 'down' | 'stable';
  totalLikes?: string;
  aiSummary: string;
  recentVideos?: {
    title: string;
    videoUrl: string;
    viewCount: string;
  }[];
}

export interface ChannelGrowthPlan {
  contentStrategy: {
    analysis: string;
    recommendations: string[];
  };
  seoAndDiscoverability: {
    analysis: string;
    recommendations: string[];
  };
  audienceEngagement: {
    analysis: string;
    recommendations: string[];
  };
  thumbnailCritique: {
    analysis: string;
    recommendations: string[];
  };
}

export interface Plan {
  name: 'Free' | 'Starter' | 'Pro';
  price: string;
  pricePeriod: string;
  description: string;
  features: string[];
  isFeatured?: boolean;
}

export interface SponsorshipOpportunity {
  brandName: string;
  industry: string;
  relevance: string;
  sponsorMatchScore: string;
}

export interface BrandPitch {
  subject: string;
  body: string;
}
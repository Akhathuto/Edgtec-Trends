import type React from 'react';

export type PlanName = 'free' | 'starter' | 'pro';
export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  plan: PlanName;
  role: UserRole;
  country?: string;
  phone?: string;
  company?: string;
  channels?: Channel[];
}

export interface Channel {
  id: string;
  platform: 'YouTube' | 'TikTok' | string;
  url: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  icon: string;
  timestamp: string;
}

export interface KeywordUsage {
    count: number;
    resetDate: string;
}

export interface HistoryItem {
    id: string;
    timestamp: string;
    type: HistoryContentType;
    summary: string;
    content: any;
}

export type HistoryContentType = 'Content Idea' | 'Strategy Report' | 'Video Transcript' | 'Generated Prompt' | 'Image Edit' | 'Keyword Analysis' | 'Channel Growth Plan' | 'Sponsorship Opportunities' | 'Brand Pitch' | 'Video Analysis' | 'Animation' | 'GIF' | 'Logo' | 'Generated Image' | 'Repurposed Content' | 'Thumbnail Idea' | 'Comment Reply' | 'Avatar' | 'Avatar Conversation';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signUp: (name: string, email: string, pass: string, plan: PlanName) => Promise<void>;
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

export interface Plan {
  name: string;
  price: string;
  pricePeriod: string;
  description: string;
  features: string[];
  isFeatured?: boolean;
}

export enum Tab {
  Dashboard = 'dashboard',
  Trends = 'trends',
  Keywords = 'keywords',
  Analytics = 'analytics',
  Chat = 'chat',
  Agents = 'agents',
  Ideas = 'ideas',
  Video = 'video',
  Monetization = 'monetization',
  Report = 'report',
  ChannelGrowth = 'channel-growth',
  BrandConnect = 'brand-connect',
  Profile = 'profile',
  Pricing = 'pricing',
  Admin = 'admin',
  Support = 'support',
  Contact = 'contact',
  About = 'about',
  Terms = 'terms',
  License = 'license',
  ContentHistory = 'content-history',
  VideoAnalyzer = 'video-analyzer',
  RepurposeContent = 'repurpose-content',
  Prompt = 'prompt',
  AnimationCreator = 'animation-creator',
  GifCreator = 'gif-creator',
  ImageEditor = 'image-editor',
  LogoCreator = 'logo-creator',
  ImageGenerator = 'image-generator',
  AvatarCreator = 'avatar-creator',
  VideoEditor = 'video-editor',
  ThumbnailGenerator = 'thumbnail-generator',
  CommentResponder = 'comment-responder',
}

export interface GroundingSource {
    uri: string;
    title: string;
}

export interface TrendingChannel {
    name: string;
    platform: 'YouTube' | 'TikTok';
    channel_url: string;
}

export interface TrendingTopic {
    name: string;
    platform: 'YouTube' | 'TikTok';
    description: string;
}

export interface TrendingVideo {
    title: string;
    channelName: string;
    videoUrl: string;
    thumbnailUrl: string;
    viewCount: string;
    publishedTime: string;
}

export interface TrendingMusic {
    trackTitle: string;
    artistName: string;
    videosUsingSound: string;
    reason: string;
}

export interface TrendingCreator {
    name: string;
    category: string;
    subscriberCount: string;
    channelUrl: string;
    reason: string;
}

export interface ContentIdea {
    title: string;
    hook: string;
    script_outline: string[];
    hashtags: string[];
    virality_potential: {
        score: number;
        reasoning: string;
    };
}

export interface MonetizationStrategy {
    strategy: string;
    description: string;
    requirements: string;
    potential: string;
}

export interface FullReport {
    trendAnalysis: string;
    contentIdeas: ContentIdea[];
    monetizationStrategies: MonetizationStrategy[];
}

export interface KeywordAnalysis {
    searchVolume: 'Very High' | 'High' | 'Medium' | 'Low' | 'Very Low';
    competition: 'Very High' | 'High' | 'Medium' | 'Low' | 'Very Low';
    relatedKeywords: string[];
    contentIdeas: string[];
}

export interface ChannelAnalyticsData {
    channelName: string;
    platform: 'YouTube' | 'TikTok';
    followerCount: string;
    totalViews: string;
    totalLikes: string;
    followerTrend: 'up' | 'down' | 'stable';
    viewsTrend: 'up' | 'down' | 'stable';
    aiSummary: string;
    recentVideos: {
        title: string;
        viewCount: string;
        videoUrl: string;
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

export interface VideoAnalysis {
    title: string;
    aiSummary: string;
    contentAnalysis: string;
    engagementAnalysis: string;
    improvementSuggestions: string[];
}

export interface RepurposedContent {
    blogPost: string;
    tweetThread: string[];
    linkedInPost: string;
}

export interface ThumbnailIdea {
    style: string;
    textOverlay: string;
    visualDescription: string;
    imageGenPrompt: string;
}

export interface AgentSettings {
  model: 'gemini-2.5-flash' | 'gemini-2.5-pro-latest';
  temperature: number;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  systemInstruction: string;
  color: string;
  starterPrompts: string[];
  keywords: string[];
  externalTools?: {
    name: string;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
  }[];
  tools?: any[];
}

export interface AvatarProfile {
    gender: string;
    avatarStyle: string;
    hairStyle: string;
    hairColor: string;
    eyeColor: string;
    facialHair: string;
    glasses: string;
    otherFacialFeatures: string;
    clothingTop: string;
    clothingBottom: string;
    clothingShoes: string;
    outerwear: string;
    accessoriesHat: string;
    accessoriesJewelry: string;
    handheldItem: string;
    extraDetails: string;
    background: string;
    shotType: string;
    personality: string;
}
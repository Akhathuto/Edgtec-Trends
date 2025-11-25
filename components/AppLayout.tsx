import React, { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Header from './Header';
import TrendingTicker from './TrendingTicker';
import { Tab } from '../types';
import {
  LayoutDashboard, TrendingUp, Search, BarChart2, MessageSquare, Bot, History,
  Lightbulb, Video, DollarSign, FileText, Rocket, Briefcase, User as UserIcon, Star,
  HelpCircle, Mail, Info, Shield, Wand, Clapperboard, Gif, PenTool, Image, Scissors,
  Type as TypeIcon, MessageSquare as CommentIcon, RefreshCw, Sparkles, Mic
} from './Icons';

import Dashboard from './Dashboard';
import TrendDiscovery from './TrendDiscovery';
import KeywordResearch from './KeywordResearch';
import ChannelAnalytics from './ChannelAnalytics';
import { AIChat } from './AIChat';
import AIAgents from './AIAgents';
import AIVoiceCoPilot from './AIVoiceCoPilot';
import ContentHistory from './ContentHistory';
import ContentGenerator from './ContentGenerator';
import VideoGenerator from './VideoGenerator';
import MonetizationGuide from './MonetizationGuide';
import StrategyReport from './StrategyReport';
import ChannelGrowth from './ChannelGrowth';
import BrandConnect from './BrandConnect';
import UserProfile from './UserProfile';
import PricingPage from './PricingPage';
import AdminDashboard from './AdminDashboard';
import SupportPage from './SupportPage';
import ContactPage from './ContactPage';
import About from './About';
import LegalPage from './LegalPage';
import PromptGenerator from './PromptGenerator';
import AnimationCreator from './AnimationCreator';
import GifCreator from './GifCreator';
import ImageEditor from './ImageEditor';
import { LogoCreator } from './LogoCreator';
import { ImageGenerator } from './ImageGenerator';
import { AvatarCreator } from './AvatarCreator';
import VideoEditor from './VideoEditor';
import ThumbnailGenerator from './ThumbnailGenerator';
import CommentResponder from './CommentResponder';
import VideoAnalyzer from './VideoAnalyzer';
import RepurposeContent from './RepurposeContent';
import AffiliateProgram from './AffiliateProgram';

import CheckoutModal from './CheckoutModal';
import { User } from '../types';

const AppLayout: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Dashboard);
  const [activeAnalyticsChannelId, setActiveAnalyticsChannelId] = useState<string | null>(null);
  
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [planToUpgrade, setPlanToUpgrade] = useState<User['plan'] | null>(null);

  const handleUpgradeClick = useCallback((plan: User['plan']) => {
    if (plan !== 'free') {
      setPlanToUpgrade(plan);
      setIsCheckoutOpen(true);
    }
  }, []);
  
  const handleCheckoutClose = () => {
    setIsCheckoutOpen(false);
    setPlanToUpgrade(null);
  }

  const navStructure = [
    {
      label: 'Discovery',
      items: [
        { id: Tab.Trends, label: 'Trend Discovery', icon: <TrendingUp className="w-5 h-5" />, title: 'Discover viral trends' },
        { id: Tab.Keywords, label: 'Keyword Research', icon: <Search className="w-5 h-5" />, title: 'Find SEO opportunities' },
        { id: Tab.Analytics, label: 'Channel Analytics', icon: <BarChart2 className="w-5 h-5" />, title: 'Analyze any channel' },
        { id: Tab.VideoAnalyzer, label: 'Video Analyzer', icon: <Video className="w-5 h-5" />, title: 'Get an AI breakdown of any video' },
      ]
    },
    {
      label: 'Create',
      items: [
        { id: Tab.Ideas, label: 'Content Generator', icon: <Lightbulb className="w-5 h-5" />, title: 'Generate viral ideas & scripts' },
        { id: Tab.Prompt, label: 'Prompt Generator', icon: <Wand className="w-5 h-5" />, title: 'Craft the perfect AI prompt' },
        { id: Tab.Video, label: 'Video Generator', icon: <Clapperboard className="w-5 h-5" />, title: 'Create videos from text or images' },
        { id: Tab.AnimationCreator, label: 'Animation Creator', icon: <Sparkles className="w-5 h-5" />, title: 'Generate animated clips' },
        { id: Tab.GifCreator, label: 'GIF Creator', icon: <Gif className="w-5 h-5" />, title: 'Create short, looping GIFs' },
        { id: Tab.VideoEditor, label: 'Video Editor', icon: <Scissors className="w-5 h-5" />, title: 'Edit videos with text prompts' },
        { id: Tab.ImageGenerator, label: 'Image Generator', icon: <Image className="w-5 h-5" />, title: 'Create unique images' },
        { id: Tab.ImageEditor, label: 'Image Editor', icon: <PenTool className="w-5 h-5" />, title: 'Edit images with text prompts' },
        { id: Tab.LogoCreator, label: 'Logo Creator', icon: <PenTool className="w-5 h-5" />, title: 'Design a professional brand logo' },
        { id: Tab.AvatarCreator, label: 'Avatar Creator', icon: <UserIcon className="w-5 h-5" />, title: 'Design and chat with an AI avatar' },
        { id: Tab.ThumbnailGenerator, label: 'Thumbnail Ideas', icon: <TypeIcon className="w-5 h-5" />, title: 'Generate click-worthy thumbnail concepts' },
        { id: Tab.CommentResponder, label: 'Comment Responder', icon: <CommentIcon className="w-5 h-5" />, title: 'Generate replies to comments' },
      ]
    },
     {
      label: 'AI Agents',
      items: [
        { id: Tab.Chat, label: 'AI Chat (Nolo)', icon: <MessageSquare className="w-5 h-5" />, title: 'Chat with your AI Co-pilot' },
        { id: Tab.Agents, label: 'Expert Agents', icon: <Bot className="w-5 h-5" />, title: 'Consult with a team of AI specialists' },
        { id: Tab.AIVoiceCoPilot, label: 'Voice Co-Pilot', icon: <Mic className="w-5 h-5" />, title: 'Have a real-time voice conversation with your AI' },
      ]
    },
    {
      label: 'Strategy',
      items: [
        { id: Tab.Monetization, label: 'Monetization Guide', icon: <DollarSign className="w-5 h-5" />, title: 'Find revenue strategies' },
        { id: Tab.Report, label: 'Strategy Report', icon: <FileText className="w-5 h-5" />, title: 'Get a full content strategy document' },
        { id: Tab.ChannelGrowth, label: 'Channel Growth Plan', icon: <Rocket className="w-5 h-5" />, title: 'Get a personalized growth plan' },
        { id: Tab.BrandConnect, label: 'Brand Connect', icon: <Briefcase className="w-5 h-5" />, title: 'Find sponsors & generate pitches' },
        { id: Tab.RepurposeContent, label: 'Repurpose Content', icon: <RefreshCw className="w-5 h-5" />, title: 'Turn one video into multiple assets' },
      ]
    }
  ];
  
  const userMenuTabs = [
    { id: Tab.Profile, label: 'My Profile', icon: <UserIcon className="w-5 h-5 mr-2" />, title: 'View and edit your profile' },
    { id: Tab.Pricing, label: 'Plans & Billing', icon: <Star className="w-5 h-5 mr-2" />, title: 'View and manage your subscription' },
    { id: Tab.ContentHistory, label: 'My Content', icon: <History className="w-5 h-5 mr-2" />, title: 'View your generated content history' },
    ...(user?.role === 'admin' ? [{ id: Tab.Admin, label: 'Admin Dashboard', icon: <Shield className="w-5 h-5 mr-2" />, title: 'Manage users and platform settings' }] : []),
    { id: Tab.Support, label: 'Help & Support', icon: <HelpCircle className="w-5 h-5 mr-2" />, title: 'Get help and support' },
    { id: Tab.Contact, label: 'Contact Us', icon: <Mail className="w-5 h-5 mr-2" />, title: 'Contact our support team' },
    { id: Tab.About, label: 'About utrend', icon: <Info className="w-5 h-5 mr-2" />, title: 'Learn more about utrend' },
    { id: Tab.Terms, label: 'Terms of Use', icon: <FileText className="w-5 h-5 mr-2" />, title: 'Read our terms of use' },
    { id: Tab.License, label: 'License', icon: <Shield className="w-5 h-5 mr-2" />, title: 'View license information' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case Tab.Dashboard: return <Dashboard setActiveTab={setActiveTab} setActiveAnalyticsChannelId={setActiveAnalyticsChannelId} />;
      case Tab.Trends: return <TrendDiscovery />;
      case Tab.Keywords: return <KeywordResearch />;
      case Tab.Analytics: return <ChannelAnalytics setActiveTab={setActiveTab} activeChannelId={activeAnalyticsChannelId} setActiveChannelId={setActiveAnalyticsChannelId}/>;
      case Tab.Chat: return <AIChat setActiveTab={setActiveTab} />;
      case Tab.Agents: return <AIAgents setActiveTab={setActiveTab} />;
      case Tab.AIVoiceCoPilot: return <AIVoiceCoPilot setActiveTab={setActiveTab} />;
      case Tab.Ideas: return <ContentGenerator />;
      case Tab.Video: return <VideoGenerator setActiveTab={setActiveTab} />;
      case Tab.Monetization: return <MonetizationGuide />;
      case Tab.Report: return <StrategyReport setActiveTab={setActiveTab} />;
      case Tab.ChannelGrowth: return <ChannelGrowth setActiveTab={setActiveTab} />;
      case Tab.BrandConnect: return <BrandConnect setActiveTab={setActiveTab} />;
      case Tab.Profile: return <UserProfile onUpgradeClick={() => handleUpgradeClick(user!.plan === 'starter' ? 'pro' : 'starter')} />;
      case Tab.Pricing: return <PricingPage onUpgradeClick={handleUpgradeClick} />;
      case Tab.Admin: return <AdminDashboard />;
      case Tab.Support: return <SupportPage setActiveTab={setActiveTab} />;
      case Tab.Contact: return <ContactPage />;
      case Tab.About: return <About />;
      case Tab.Terms: return <LegalPage type="terms" />;
      case Tab.License: return <LegalPage type="license" />;
      case Tab.ContentHistory: return <ContentHistory />;
      case Tab.VideoAnalyzer: return <VideoAnalyzer />;
      case Tab.RepurposeContent: return <RepurposeContent />;
      case Tab.Prompt: return <PromptGenerator />;
      case Tab.AnimationCreator: return <AnimationCreator setActiveTab={setActiveTab} />;
      case Tab.GifCreator: return <GifCreator setActiveTab={setActiveTab} />;
      case Tab.ImageEditor: return <ImageEditor setActiveTab={setActiveTab} />;
      case Tab.LogoCreator: return <LogoCreator setActiveTab={setActiveTab} />;
      case Tab.ImageGenerator: return <ImageGenerator setActiveTab={setActiveTab} />;
      case Tab.AvatarCreator: return <AvatarCreator setActiveTab={setActiveTab} />;
      case Tab.VideoEditor: return <VideoEditor setActiveTab={setActiveTab} />;
      case Tab.ThumbnailGenerator: return <ThumbnailGenerator />;
      case Tab.CommentResponder: return <CommentResponder />;
      case Tab.Affiliate: return <AffiliateProgram />;
      default: return <Dashboard setActiveTab={setActiveTab} setActiveAnalyticsChannelId={setActiveAnalyticsChannelId} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header setActiveTab={setActiveTab} navStructure={navStructure} userMenuTabs={userMenuTabs} />
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        {renderContent()}
      </main>
      <TrendingTicker />
       <CheckoutModal 
        isOpen={isCheckoutOpen}
        onClose={handleCheckoutClose}
        plan={planToUpgrade}
      />
    </div>
  );
};

export default AppLayout;
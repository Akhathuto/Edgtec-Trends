import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import Header from './Header.tsx';
import Sidebar from './Sidebar.tsx';
import TrendingTicker from './TrendingTicker.tsx';
import { Tab } from '../types.ts';
import {
  LayoutDashboard, TrendingUp, Search, BarChart2, MessageSquare, Bot, History,
  Lightbulb, Video, DollarSign, FileText, Rocket, Briefcase, User as UserIcon, Star,
  HelpCircle, Mail, Info, Shield, Wand, Clapperboard, Gif, PenTool, Image, Scissors,
  Type as TypeIcon, MessageSquare as CommentIcon, RefreshCw
} from './Icons.tsx';

import Dashboard from './Dashboard.tsx';
import TrendDiscovery from './TrendDiscovery.tsx';
import KeywordResearch from './KeywordResearch.tsx';
import ChannelAnalytics from './ChannelAnalytics.tsx';
import AIChat from './AIChat.tsx';
import AIAgents from './AIAgents.tsx';
import ContentHistory from './ContentHistory.tsx';
import ContentGenerator from './ContentGenerator.tsx';
import VideoGenerator from './VideoGenerator.tsx';
import MonetizationGuide from './MonetizationGuide.tsx';
import StrategyReport from './StrategyReport.tsx';
import ChannelGrowth from './ChannelGrowth.tsx';
import BrandConnect from './BrandConnect.tsx';
import UserProfile from './UserProfile.tsx';
import PricingPage from './PricingPage.tsx';
import AdminDashboard from './AdminDashboard.tsx';
import SupportPage from './SupportPage.tsx';
import ContactPage from './ContactPage.tsx';
import About from './About.tsx';
import LegalPage from './LegalPage.tsx';
import PromptGenerator from './PromptGenerator.tsx';
import AnimationCreator from './AnimationCreator.tsx';
import GifCreator from './GifCreator.tsx';
import ImageEditor from './ImageEditor.tsx';
import LogoCreator from './LogoCreator.tsx';
import ImageGenerator from './ImageGenerator.tsx';
import AvatarCreator from './AvatarCreator.tsx';
import VideoEditor from './VideoEditor.tsx';
import ThumbnailGenerator from './ThumbnailGenerator.tsx';
import CommentResponder from './CommentResponder.tsx';
import VideoAnalyzer from './VideoAnalyzer.tsx';
import RepurposeContent from './RepurposeContent.tsx';

import CheckoutModal from './CheckoutModal.tsx';
import { User } from '../types.ts';

const AppLayout: React.FC = () => {
  const { user, upgradePlan } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Dashboard);
  const [activeAnalyticsChannelId, setActiveAnalyticsChannelId] = useState<string | null>(null);
  
  // State for checkout modal
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

  const mainTabs = [
    { id: Tab.Dashboard, label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5 mr-3" />, title: 'Your main hub' },
    { id: Tab.Trends, label: 'Trend Discovery', icon: <TrendingUp className="w-5 h-5 mr-3" />, title: 'Discover viral trends' },
    { id: Tab.Keywords, label: 'Keyword Research', icon: <Search className="w-5 h-5 mr-3" />, title: 'Find SEO opportunities' },
    { id: Tab.Analytics, label: 'Channel Analytics', icon: <BarChart2 className="w-5 h-5 mr-3" />, title: 'Analyze channel performance' },
    { id: Tab.Chat, label: 'AI Chat (Nolo)', icon: <MessageSquare className="w-5 h-5 mr-3" />, title: 'Chat with your AI co-pilot' },
    { id: Tab.Agents, label: 'AI Agents', icon: <Bot className="w-5 h-5 mr-3" />, title: 'Consult with AI experts' },
    { id: Tab.ContentHistory, label: 'My Content', icon: <History className="w-5 h-5 mr-3" />, title: 'View your generated content' },
  ];
  
  const createTabs = [
    { id: Tab.Ideas, label: 'Content Generator', icon: <Lightbulb className="w-5 h-5 mr-3" />, title: 'Generate content ideas and scripts' },
    { id: Tab.Prompt, label: 'Prompt Generator', icon: <Wand className="w-5 h-5 mr-3" />, title: 'Craft the perfect AI prompt' },
    { id: Tab.ThumbnailGenerator, label: 'Thumbnail Ideas', icon: <Image className="w-5 h-5 mr-3" />, title: 'Generate thumbnail concepts' },
    { id: Tab.CommentResponder, label: 'Comment Responder', icon: <CommentIcon className="w-5 h-5 mr-3" />, title: 'AI-powered comment replies' },
    { id: Tab.Video, label: 'Video Generator', icon: <Video className="w-5 h-5 mr-3" />, title: 'Create videos from text or images' },
    { id: Tab.AnimationCreator, label: 'Animation Creator', icon: <Clapperboard className="w-5 h-5 mr-3" />, title: 'Generate custom animations' },
    { id: Tab.GifCreator, label: 'GIF Creator', icon: <Gif className="w-5 h-5 mr-3" />, title: 'Create animated GIFs' },
    { id: Tab.LogoCreator, label: 'Logo Creator', icon: <PenTool className="w-5 h-5 mr-3" />, title: 'Design a logo for your brand' },
    { id: Tab.AvatarCreator, label: 'Avatar Creator', icon: <UserIcon className="w-5 h-5 mr-3" />, title: 'Create a custom AI avatar' },
    { id: Tab.ImageGenerator, label: 'Image Generator', icon: <Image className="w-5 h-5 mr-3" />, title: 'Generate unique images from text' },
    { id: Tab.ImageEditor, label: 'Image Editor', icon: <TypeIcon className="w-5 h-5 mr-3" />, title: 'Edit images with text prompts' },
    { id: Tab.VideoEditor, label: 'Video Editor', icon: <Scissors className="w-5 h-5 mr-3" />, title: 'Edit videos with text prompts' },
  ];
  
  const strategyTabs = [
    { id: Tab.Monetization, label: 'Monetization Guide', icon: <DollarSign className="w-5 h-5 mr-3" />, title: 'Get monetization strategies' },
    { id: Tab.Report, label: 'Strategy Report', icon: <FileText className="w-5 h-5 mr-3" />, title: 'Generate a full content strategy' },
    { id: Tab.ChannelGrowth, label: 'Channel Growth Plan', icon: <Rocket className="w-5 h-5 mr-3" />, title: 'Get a personalized growth plan' },
    { id: Tab.BrandConnect, label: 'Brand Connect', icon: <Briefcase className="w-5 h-5 mr-3" />, title: 'Find sponsors and generate pitches' },
    { id: Tab.VideoAnalyzer, label: 'Video Analyzer', icon: <Video className="w-5 h-5 mr-3" />, title: 'AI breakdown of any video' },
    // FIX: Imported the missing RefreshCw icon.
    { id: Tab.RepurposeContent, label: 'Repurpose Content', icon: <RefreshCw className="w-5 h-5 mr-3" />, title: 'Turn one video into many assets' },
  ];

  const userMenuTabs = [
    { id: Tab.Profile, label: 'Profile', icon: <UserIcon className="w-5 h-5 mr-3" />, title: 'View your profile' },
    { id: Tab.Pricing, label: 'Plans & Billing', icon: <Star className="w-5 h-5 mr-3" />, title: 'Manage your subscription' },
    { id: Tab.Support, label: 'Help Center', icon: <HelpCircle className="w-5 h-5 mr-3" />, title: 'Get help and support' },
    { id: Tab.Contact, label: 'Contact Us', icon: <Mail className="w-5 h-5 mr-3" />, title: 'Contact our team' },
    { id: Tab.About, label: 'About', icon: <Info className="w-5 h-5 mr-3" />, title: 'About utrend' },
    ...(user?.role === 'admin' ? [{ id: Tab.Admin, label: 'Admin Dashboard', icon: <Shield className="w-5 h-5 mr-3" />, title: 'Admin Dashboard' }] : [])
  ];

  const renderContent = () => {
    switch (activeTab) {
      case Tab.Dashboard:
        return <Dashboard setActiveTab={setActiveTab} setActiveAnalyticsChannelId={setActiveAnalyticsChannelId} />;
      case Tab.Trends:
        return <TrendDiscovery />;
      case Tab.Keywords:
        return <KeywordResearch />;
      case Tab.Analytics:
        return <ChannelAnalytics setActiveTab={setActiveTab} activeChannelId={activeAnalyticsChannelId} setActiveChannelId={setActiveAnalyticsChannelId} />;
      case Tab.Chat:
        return <AIChat setActiveTab={setActiveTab} />;
      case Tab.Agents:
        return <AIAgents setActiveTab={setActiveTab} />;
      case Tab.ContentHistory:
        return <ContentHistory />;
      case Tab.Ideas:
        return <ContentGenerator />;
      case Tab.Video:
        return <VideoGenerator setActiveTab={setActiveTab} />;
      case Tab.Monetization:
        return <MonetizationGuide />;
      case Tab.Report:
        return <StrategyReport setActiveTab={setActiveTab} />;
      case Tab.ChannelGrowth:
        return <ChannelGrowth setActiveTab={setActiveTab} />;
      case Tab.BrandConnect:
        return <BrandConnect setActiveTab={setActiveTab} />;
      case Tab.Profile:
        return <UserProfile onUpgradeClick={() => setActiveTab(Tab.Pricing)} />;
      case Tab.Pricing:
        return <PricingPage onUpgradeClick={handleUpgradeClick} />;
      case Tab.Admin:
        return <AdminDashboard />;
      case Tab.Support:
        return <SupportPage setActiveTab={setActiveTab} />;
      case Tab.Contact:
        return <ContactPage />;
      case Tab.About:
        return <About />;
      case Tab.Terms:
        return <LegalPage type="terms" />;
      case Tab.License:
        return <LegalPage type="license" />;
      case Tab.Prompt:
        return <PromptGenerator />;
      case Tab.AnimationCreator:
        return <AnimationCreator setActiveTab={setActiveTab} />;
      case Tab.GifCreator:
        return <GifCreator setActiveTab={setActiveTab} />;
      case Tab.ImageEditor:
        return <ImageEditor setActiveTab={setActiveTab} />;
      case Tab.LogoCreator:
        return <LogoCreator setActiveTab={setActiveTab} />;
      case Tab.AvatarCreator:
        return <AvatarCreator setActiveTab={setActiveTab} />;
      case Tab.ImageGenerator:
        return <ImageGenerator setActiveTab={setActiveTab} />;
      case Tab.VideoEditor:
        return <VideoEditor setActiveTab={setActiveTab} />;
      case Tab.ThumbnailGenerator:
        return <ThumbnailGenerator />;
      case Tab.CommentResponder:
        return <CommentResponder />;
      case Tab.VideoAnalyzer:
        return <VideoAnalyzer />;
      case Tab.RepurposeContent:
        return <RepurposeContent />;
      default:
        return <Dashboard setActiveTab={setActiveTab} setActiveAnalyticsChannelId={setActiveAnalyticsChannelId} />;
    }
  };

  return (
    <div className="bg-slate-900 text-slate-200 min-h-screen font-sans">
      <Header setActiveTab={setActiveTab} userMenuTabs={userMenuTabs} />
      <div className="flex">
        <Sidebar 
            mainTabs={mainTabs} 
            createTabs={createTabs}
            strategyTabs={strategyTabs}
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
        />
        <main className="flex-1 p-6 sm:p-8">
            <div className="container mx-auto">
                {renderContent()}
            </div>
        </main>
      </div>
      <TrendingTicker />
      <CheckoutModal isOpen={isCheckoutOpen} onClose={handleCheckoutClose} plan={planToUpgrade} />
       <footer className="text-center py-4 px-6 text-xs text-slate-500 border-t border-slate-800/50 mt-auto">
          <button onClick={() => setActiveTab(Tab.Terms)} className="hover:text-slate-300 transition-colors">Terms of Use</button>
          <span className="mx-2">|</span>
          <button onClick={() => setActiveTab(Tab.License)} className="hover:text-slate-300 transition-colors">License</button>
          <p className="mt-1">&copy; {new Date().getFullYear()} utrend. All rights reserved.</p>
        </footer>
    </div>
  );
};

export default AppLayout;
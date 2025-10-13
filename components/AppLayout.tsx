

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Header from './Header';
import Sidebar from './Sidebar';
import TrendingTicker from './TrendingTicker';
import { Tab } from '../types';
import {
  LayoutDashboard, TrendingUp, Search, BarChart2, MessageSquare, Bot, History,
  Lightbulb, Video, DollarSign, FileText, Rocket, Briefcase, User as UserIcon, Star,
  HelpCircle, Mail, Info, Shield, Wand, Clapperboard, Gif, PenTool, Image, Scissors,
  Type as TypeIcon, MessageSquare as CommentIcon, RefreshCw
} from './Icons';

import Dashboard from './Dashboard';
import TrendDiscovery from './TrendDiscovery';
import KeywordResearch from './KeywordResearch';
import ChannelAnalytics from './ChannelAnalytics';
// FIX: Changed to named import for consistency.
import { AIChat } from './AIChat';
import AIAgents from './AIAgents';
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
// FIX: Change to a named import as LogoCreator does not have a default export.
import { LogoCreator } from './LogoCreator';
// FIX: Change to named import as ImageGenerator does not have a default export.
import { ImageGenerator } from './ImageGenerator';
// FIX: Changed to named import as AvatarCreator will be changed to a named export.
import { AvatarCreator } from './AvatarCreator';
import VideoEditor from './VideoEditor';
import ThumbnailGenerator from './ThumbnailGenerator';
import CommentResponder from './CommentResponder';
import VideoAnalyzer from './VideoAnalyzer';
import RepurposeContent from './RepurposeContent';

import CheckoutModal from './CheckoutModal';
import { User } from '../types';

const AppLayout: React.FC = () => {
  const { user, upgradePlan } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Dashboard);
  const [activeAnalyticsChannelId, setActiveAnalyticsChannelId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
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

  const handleSetTab = (tab: Tab) => {
    setActiveTab(tab);
    if (window.innerWidth < 1024) { // lg breakpoint
        setIsSidebarOpen(false);
    }
  };

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
    <div className="text-slate-200 min-h-screen font-sans">
      <Header 
        setActiveTab={handleSetTab} 
        userMenuTabs={userMenuTabs} 
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
      />
      <div className="flex">
        <Sidebar 
            mainTabs={mainTabs} 
            createTabs={createTabs}
            strategyTabs={strategyTabs}
            activeTab={activeTab} 
            setActiveTab={handleSetTab} 
            isOpen={isSidebarOpen}
            setIsOpen={setIsSidebarOpen}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full min-w-0">
            <div className="container mx-auto">
                {renderContent()}
            </div>
        </main>
      </div>
      <TrendingTicker />
      <CheckoutModal isOpen={isCheckoutOpen} onClose={handleCheckoutClose} plan={planToUpgrade} />
       <footer className="text-center py-4 px-6 text-xs text-slate-500 border-t border-slate-800/50 mt-auto pb-16 sm:pb-4">
          <button onClick={() => setActiveTab(Tab.Terms)} className="hover:text-slate-300 transition-colors">Terms of Use</button>
          <span className="mx-2">|</span>
          <button onClick={() => setActiveTab(Tab.License)} className="hover:text-slate-300 transition-colors">License</button>
          <p className="mt-1">&copy; {new Date().getFullYear()} utrend. All rights reserved.</p>
          <p className="mt-2 text-slate-600">Powered by Edgtec by Nolotec</p>
        </footer>
    </div>
  );
};

export default AppLayout;
import React, { useState, useEffect } from 'react';
import Header from './Header';
import TrendDiscovery from './TrendDiscovery';
import ContentGenerator from './ContentGenerator';
import MonetizationGuide from './MonetizationGuide';
import StrategyReport from './StrategyReport';
import VideoGenerator from './VideoGenerator';
import ImageEditor from './ImageEditor';
import AIChat from './AIChat';
import About from './About';
import UserProfile from './UserProfile';
import AdminDashboard from './AdminDashboard';
import PricingPage from './PricingPage';
import CheckoutModal from './CheckoutModal';
import SupportPage from './SupportPage';
import ContactPage from './ContactPage';
import PromptGenerator from './PromptGenerator';
import KeywordResearch from './KeywordResearch';
import ChannelAnalytics from './ChannelAnalytics';
import { Tab, User } from '../types';
import Sidebar from './Sidebar';
import { TrendingUp, Lightbulb, DollarSign, FileText, Video, Info, User as UserIcon, Sliders, Star, HelpCircle, Mail, Wand, Edit, Search, MessageSquare, BarChart2 } from './Icons';
import TrendingTicker from './TrendingTicker';
import { useAuth } from '../contexts/AuthContext';

const AppLayout: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    const savedTab = localStorage.getItem('utrend-active-tab');
    return savedTab ? (savedTab as Tab) : Tab.Trends;
  });
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<User['plan'] | null>(null);

  useEffect(() => {
    localStorage.setItem('utrend-active-tab', activeTab);
  }, [activeTab]);

  const handleUpgradeClick = (plan: User['plan']) => {
    setSelectedPlan(plan);
    setIsCheckoutModalOpen(true);
  };
  
  const renderContent = () => {
    switch (activeTab) {
      case Tab.Trends:
        return <TrendDiscovery onUpgradeClick={() => setActiveTab(Tab.Pricing)} />;
      case Tab.Ideas:
        return <ContentGenerator onUpgradeClick={() => setActiveTab(Tab.Pricing)} />;
      case Tab.Keywords:
        return <KeywordResearch onUpgradeClick={() => setActiveTab(Tab.Pricing)} />;
      case Tab.Chat:
        return <AIChat setActiveTab={setActiveTab} />;
      case Tab.Monetization:
        return <MonetizationGuide />;
      case Tab.Report:
        return <StrategyReport setActiveTab={setActiveTab} />;
      case Tab.Prompt:
        return <PromptGenerator />;
      case Tab.Video:
        return <VideoGenerator setActiveTab={setActiveTab} />;
      case Tab.ImageEditor:
        return <ImageEditor setActiveTab={setActiveTab} />;
      case Tab.Analytics:
        return <ChannelAnalytics setActiveTab={setActiveTab} />;
      case Tab.Pricing:
        return <PricingPage onUpgradeClick={handleUpgradeClick} />;
      case Tab.About:
        return <About />;
      case Tab.Profile:
        return <UserProfile onUpgradeClick={() => setActiveTab(Tab.Pricing)} />;
       case Tab.Admin:
        return user?.role === 'admin' ? <AdminDashboard /> : null;
      case Tab.Support:
        return <SupportPage setActiveTab={setActiveTab} />;
      case Tab.Contact:
        return <ContactPage />;
      default:
        return <TrendDiscovery onUpgradeClick={() => setActiveTab(Tab.Pricing)} />;
    }
  };

  const mainNavTabs = [
    { id: Tab.Trends, label: 'Trends', icon: <TrendingUp className="w-5 h-5 mr-3" />, title: "Discover current trends" },
    { id: Tab.Analytics, label: 'Analytics', icon: <BarChart2 className="w-5 h-5 mr-3" />, title: "View channel analytics" },
    { id: Tab.Keywords, label: 'Keywords', icon: <Search className="w-5 h-5 mr-3" />, title: "Research keywords" },
    { id: Tab.Chat, label: 'Chat', icon: <MessageSquare className="w-5 h-5 mr-3" />, title: "Chat with an AI Assistant" },
  ];

  const createTabs = [
    { id: Tab.Ideas, label: 'Ideas', icon: <Lightbulb className="w-5 h-5 mr-3" />, title: "Generate viral video ideas" },
    { id: Tab.Prompt, label: 'Prompt Generator', icon: <Wand className="w-5 h-5 mr-3" />, title: "Generate optimized prompts" },
    { id: Tab.Video, label: 'Video Generator', icon: <Video className="w-5 h-5 mr-3" />, title: "Generate video content" },
    { id: Tab.ImageEditor, label: 'Image Editor', icon: <Edit className="w-5 h-5 mr-3" />, title: "Edit images with AI" },
  ];

  const strategyTabs = [
     { id: Tab.Monetization, label: 'Monetize', icon: <DollarSign className="w-5 h-5 mr-3" />, title: "Get monetization strategies" },
    { id: Tab.Report, label: 'Strategy Report', icon: <FileText className="w-5 h-5 mr-3" />, title: "Generate a content strategy report" },
  ];

  const userMenuTabs = [
      { id: Tab.Profile, label: 'Profile', icon: <UserIcon className="w-5 h-5 mr-2" />, title: "View your user profile" },
      { id: Tab.Pricing, label: 'Pricing', icon: <Star className="w-5 h-5 mr-2" />, title: "View plans and upgrade" },
      { id: Tab.Support, label: 'Support', icon: <HelpCircle className="w-5 h-5 mr-2" />, title: "Get help and view FAQs" },
      { id: Tab.Contact, label: 'Contact', icon: <Mail className="w-5 h-5 mr-2" />, title: "Contact our support team" },
      { id: Tab.About, label: 'About', icon: <Info className="w-5 h-5 mr-2" />, title: "View company information" },
  ];

  if (user?.role === 'admin') {
    userMenuTabs.push({ id: Tab.Admin, label: 'Admin', icon: <Sliders className="w-5 h-5 mr-2" />, title: "Manage users and settings" });
  }

  return (
    <div className="min-h-screen text-slate-100 font-sans flex flex-col">
      <Header setActiveTab={setActiveTab} userMenuTabs={userMenuTabs} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
            mainTabs={mainNavTabs}
            createTabs={createTabs}
            strategyTabs={strategyTabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
        />
        <main className="flex-1 p-8 overflow-y-auto">
          {renderContent()}
          <footer className="text-center py-6 text-slate-500 text-sm mt-12">
            <p>Copyright © utrend. Powered by Gemini API.</p>
          </footer>
        </main>
      </div>
      <TrendingTicker />
      <CheckoutModal 
        isOpen={isCheckoutModalOpen} 
        onClose={() => setIsCheckoutModalOpen(false)} 
        plan={selectedPlan}
      />
    </div>
  );
};

export default AppLayout;
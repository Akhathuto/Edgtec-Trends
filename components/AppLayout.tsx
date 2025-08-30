import React, { useState } from 'react';
import Header from './Header';
import TrendDiscovery from './TrendDiscovery';
import ContentGenerator from './ContentGenerator';
import MonetizationGuide from './MonetizationGuide';
import StrategyReport from './StrategyReport';
import VideoGenerator from './VideoGenerator';
import About from './About';
import UserProfile from './UserProfile';
import AdminDashboard from './AdminDashboard';
import PricingPage from './PricingPage';
import CheckoutModal from './CheckoutModal';
import SupportPage from './SupportPage';
import ContactPage from './ContactPage';
import { Tab, User } from '../types';
import Tabs from './Tabs';
import { TrendingUp, Lightbulb, DollarSign, FileText, Video, Info, User as UserIcon, Sliders, Star, HelpCircle, Mail } from './Icons';
import TrendingTicker from './TrendingTicker';
import { useAuth } from '../contexts/AuthContext';

const AppLayout: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Trends);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<User['plan'] | null>(null);

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
      case Tab.Monetization:
        return <MonetizationGuide />;
      case Tab.Report:
        return <StrategyReport setActiveTab={setActiveTab} />;
      case Tab.Video:
        return <VideoGenerator setActiveTab={setActiveTab} />;
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

  const baseTabs = [
    { id: Tab.Trends, label: 'Trends', icon: <TrendingUp className="w-5 h-5 mr-2" />, title: "Discover current trends on YouTube and TikTok" },
    { id: Tab.Ideas, label: 'Ideas', icon: <Lightbulb className="w-5 h-5 mr-2" />, title: "Generate viral video ideas with AI" },
    { id: Tab.Video, label: 'Video', icon: <Video className="w-5 h-5 mr-2" />, title: "Generate video content with AI" },
    { id: Tab.Monetization, label: 'Monetize', icon: <DollarSign className="w-5 h-5 mr-2" />, title: "Get personalized monetization strategies" },
    { id: Tab.Report, label: 'Report', icon: <FileText className="w-5 h-5 mr-2" />, title: "Generate a complete content strategy report" },
    { id: Tab.Pricing, label: 'Pricing', icon: <Star className="w-5 h-5 mr-2" />, title: "View plans and upgrade" },
  ];

  const finalTabs = [...baseTabs];
  
  const utilityTabs = [
      { id: Tab.Profile, label: 'Profile', icon: <UserIcon className="w-5 h-5 mr-2" />, title: "View your user profile" },
      { id: Tab.Support, label: 'Support', icon: <HelpCircle className="w-5 h-5 mr-2" />, title: "Get help and view FAQs" },
      { id: Tab.Contact, label: 'Contact', icon: <Mail className="w-5 h-5 mr-2" />, title: "Contact our support team" },
      { id: Tab.About, label: 'About', icon: <Info className="w-5 h-5 mr-2" />, title: "View company and ownership information" },
  ]
  
  if (user?.role === 'admin') {
    utilityTabs.push({ id: Tab.Admin, label: 'Admin', icon: <Sliders className="w-5 h-5 mr-2" />, title: "Manage users and settings" });
  }
  
  finalTabs.push(...utilityTabs);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white font-sans pb-20">
      <Header setActiveTab={setActiveTab} />
      <main className="container mx-auto px-4 py-8">
        <Tabs tabs={finalTabs} activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="mt-8">
          {renderContent()}
        </div>
      </main>
      <TrendingTicker />
      <footer className="text-center py-6 text-gray-400 text-sm absolute bottom-0 left-0 right-0">
        <p>Copyright © EdgTec. Powered by Gemini API.</p>
      </footer>
      <CheckoutModal 
        isOpen={isCheckoutModalOpen} 
        onClose={() => setIsCheckoutModalOpen(false)} 
        plan={selectedPlan}
      />
    </div>
  );
};

export default AppLayout;
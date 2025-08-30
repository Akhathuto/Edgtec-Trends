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
import { Tab } from '../types';
import Tabs from './Tabs';
import { TrendingUp, Lightbulb, DollarSign, FileText, Video, Info, User, Sliders } from './Icons';
import TrendingTicker from './TrendingTicker';
import UpgradeModal from './UpgradeModal';
import { useAuth } from '../contexts/AuthContext';

const AppLayout: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Trends);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const onUpgradeClick = () => setIsUpgradeModalOpen(true);

  const renderContent = () => {
    switch (activeTab) {
      case Tab.Trends:
        return <TrendDiscovery onUpgradeClick={onUpgradeClick} />;
      case Tab.Ideas:
        return <ContentGenerator onUpgradeClick={onUpgradeClick} />;
      case Tab.Monetization:
        return <MonetizationGuide />;
      case Tab.Report:
        return <StrategyReport />;
      case Tab.Video:
        return <VideoGenerator />;
      case Tab.About:
        return <About />;
      case Tab.Profile:
        return <UserProfile onUpgradeClick={onUpgradeClick} />;
       case Tab.Admin:
        return user?.role === 'admin' ? <AdminDashboard /> : null;
      default:
        return <TrendDiscovery onUpgradeClick={onUpgradeClick} />;
    }
  };

  const baseTabs = [
    { id: Tab.Trends, label: 'Trends', icon: <TrendingUp className="w-5 h-5 mr-2" />, title: "Discover current trends on YouTube and TikTok" },
    { id: Tab.Ideas, label: 'Ideas', icon: <Lightbulb className="w-5 h-5 mr-2" />, title: "Generate viral video ideas with AI" },
    { id: Tab.Video, label: 'Video', icon: <Video className="w-5 h-5 mr-2" />, title: "Generate video content with AI" },
    { id: Tab.Monetization, label: 'Monetize', icon: <DollarSign className="w-5 h-5 mr-2" />, title: "Get personalized monetization strategies" },
    { id: Tab.Report, label: 'Report', icon: <FileText className="w-5 h-5 mr-2" />, title: "Generate a complete content strategy report" },
    { id: Tab.About, label: 'About', icon: <Info className="w-5 h-5 mr-2" />, title: "View company and ownership information" },
    { id: Tab.Profile, label: 'Profile', icon: <User className="w-5 h-5 mr-2" />, title: "View your user profile" },
  ];

  if (user?.role === 'admin') {
    baseTabs.push({ id: Tab.Admin, label: 'Admin', icon: <Sliders className="w-5 h-5 mr-2" />, title: "Manage users and settings" });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white font-sans pb-20">
      <Header onUpgradeClick={onUpgradeClick} setActiveTab={setActiveTab} />
      <main className="container mx-auto px-4 py-8">
        <Tabs tabs={baseTabs} activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="mt-8">
          {renderContent()}
        </div>
      </main>
      <TrendingTicker />
      <footer className="text-center py-6 text-gray-400 text-sm absolute bottom-0 left-0 right-0">
        <p>Copyright © EdgTec. Powered by Gemini API.</p>
      </footer>
      <UpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} />
    </div>
  );
};

export default AppLayout;
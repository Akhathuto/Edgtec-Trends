import React, { useState, useCallback, useEffect } from 'react';
import { Tab, User } from '../types.ts';
import Header from './Header.tsx';
import Sidebar from './Sidebar.tsx';
import Dashboard from './Dashboard.tsx';
import TrendDiscovery from './TrendDiscovery.tsx';
import ContentGenerator from './ContentGenerator.tsx';
import MonetizationGuide from './MonetizationGuide.tsx';
import StrategyReport from './StrategyReport.tsx';
import VideoGenerator from './VideoGenerator.tsx';
import PromptGenerator from './PromptGenerator.tsx';
import UserProfile from './UserProfile.tsx';
import AdminDashboard from './AdminDashboard.tsx';
import PricingPage from './PricingPage.tsx';
import CheckoutModal from './CheckoutModal.tsx';
import SupportPage from './SupportPage.tsx';
import ContactPage from './ContactPage.tsx';
import LegalPage from './LegalPage.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { 
    LayoutDashboard, TrendingUp, Lightbulb, DollarSign, FileText, Video, Wand, User as UserIcon, HelpCircle, Mail, Shield,
    MessageSquare, Search, BarChart2, Rocket, Briefcase, History, Film, RefreshCw, Scissors, Clapperboard, Gif, PenTool, Image
} from './Icons.tsx';
import TrendingTicker from './TrendingTicker.tsx';
import KeywordResearch from './KeywordResearch.tsx';
import ChannelAnalytics from './ChannelAnalytics.tsx';
import ChannelGrowth from './ChannelGrowth.tsx';
import BrandConnect from './BrandConnect.tsx';
import ContentHistory from './ContentHistory.tsx';
import VideoAnalyzer from './VideoAnalyzer.tsx';
import RepurposeContent from './RepurposeContent.tsx';
import AIAgents from './AIAgents.tsx';
import AnimationCreator from './AnimationCreator.tsx';
import GifCreator from './GifCreator.tsx';
import LogoCreator from './LogoCreator.tsx';
import ImageEditor from './ImageEditor.tsx';
import VideoEditor from './VideoEditor.tsx';
import ThumbnailGenerator from './ThumbnailGenerator.tsx';

const mainTabs = [
  { id: Tab.Dashboard, label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5 mr-3" />, title: 'View your main dashboard and analytics overview' },
  { id: Tab.Trends, label: 'Trend Discovery', icon: <TrendingUp className="w-5 h-5 mr-3" />, title: 'Discover the latest trends on YouTube and TikTok' },
  { id: Tab.Keywords, label: 'Keyword Research', icon: <Search className="w-5 h-5 mr-3" />, title: 'Find high-potential keywords for your content' },
  { id: Tab.ContentHistory, label: 'My Content', icon: <History className="w-5 h-5 mr-3" />, title: 'View and manage all your generated content' },
];

const createTabs = [
  { id: Tab.Ideas, label: 'Content Idea Gen', icon: <Lightbulb className="w-5 h-5 mr-3" />, title: 'Generate viral content ideas and scripts' },
  { id: Tab.Prompt, label: 'Prompt Generator', icon: <Wand className="w-5 h-5 mr-3" />, title: 'Create optimized prompts for AI tools' },
  { id: Tab.ThumbnailGenerator, label: 'Thumbnail Ideas', icon: <Image className="w-5 h-5 mr-3" />, title: 'Generate compelling thumbnail concepts' },
  { id: Tab.Video, label: 'Video Generator', icon: <Video className="w-5 h-5 mr-3" />, title: 'Create videos from text prompts (Pro)' },
  { id: Tab.AnimationCreator, label: 'Animation Creator', icon: <Clapperboard className="w-5 h-5 mr-3" />, title: 'Create animated clips (Pro)' },
  { id: Tab.GifCreator, label: 'GIF Creator', icon: <Gif className="w-5 h-5 mr-3" />, title: 'Create animated GIFs (Pro)' },
  { id: Tab.ImageEditor, label: 'Image Editor', icon: <PenTool className="w-5 h-5 mr-3" />, title: 'Edit images with text prompts (Pro)' },
  { id: Tab.VideoEditor, label: 'Video Editor', icon: <Scissors className="w-5 h-5 mr-3" />, title: 'Edit videos with text prompts (Pro)' },
  { id: Tab.LogoCreator, label: 'Logo Creator', icon: <PenTool className="w-5 h-5 mr-3" />, title: 'Design a professional logo (Pro)' },
];

const strategyTabs = [
  { id: Tab.Monetization, label: 'Monetization Guide', icon: <DollarSign className="w-5 h-5 mr-3" />, title: 'Discover monetization strategies for your channel' },
  { id: Tab.Report, label: 'Strategy Report', icon: <FileText className="w-5 h-5 mr-3" />, title: 'Generate a comprehensive content strategy report (Pro)' },
  { id: Tab.Analytics, label: 'Channel Analytics', icon: <BarChart2 className="w-5 h-5 mr-3" />, title: 'Analyze your channel or competitors (Pro)' },
  { id: Tab.ChannelGrowth, label: 'Channel Growth Plan', icon: <Rocket className="w-5 h-5 mr-3" />, title: 'Get a personalized growth plan for your channel (Pro)' },
  { id: Tab.BrandConnect, label: 'Brand Connect', icon: <Briefcase className="w-5 h-5 mr-3" />, title: 'Find sponsors and generate pitches (Pro)' },
  { id: Tab.VideoAnalyzer, label: 'Video Analyzer', icon: <Film className="w-5 h-5 mr-3" />, title: 'Get AI insights on any video' },
  { id: Tab.RepurposeContent, label: 'Repurpose Content', icon: <RefreshCw className="w-5 h-5 mr-3" />, title: 'Turn one video into multiple content pieces' },
  { id: Tab.Agents, label: 'AI Agents', icon: <MessageSquare className="w-5 h-5 mr-3" />, title: 'Chat with specialized AI experts (Pro)' },
];

const userMenuTabs = [
  { id: Tab.Profile, label: 'Profile', icon: <UserIcon className="w-5 h-5 mr-3" />, title: 'View and edit your profile' },
  { id: Tab.Pricing, label: 'Plans & Billing', icon: <DollarSign className="w-5 h-5 mr-3" />, title: 'View and manage your subscription' },
  { id: Tab.Support, label: 'Support', icon: <HelpCircle className="w-5 h-5 mr-3" />, title: 'Get help and support' },
  { id: Tab.Contact, label: 'Contact Us', icon: <Mail className="w-5 h-5 mr-3" />, title: 'Contact our team' },
  { id: Tab.TermsOfUse, label: 'Terms of Use', icon: <FileText className="w-5 h-5 mr-3" />, title: 'Read our Terms of Use' },
  { id: Tab.License, label: 'License', icon: <Shield className="w-5 h-5 mr-3" />, title: 'View license information' },
];


const AppLayout: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, _setActiveTab] = useState<Tab>(() => {
        const savedTab = localStorage.getItem('utrend-active-tab');
        return savedTab ? (savedTab as Tab) : Tab.Dashboard;
    });

    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<User['plan'] | null>(null);
    const [activeAnalyticsChannelId, setActiveAnalyticsChannelId] = useState<string | null>(null);
    const [initialToolInput, setInitialToolInput] = useState<string | null>(null);

    const setActiveTab = (tab: Tab) => {
        setInitialToolInput(null); // Clear any pending action input on normal navigation
        _setActiveTab(tab);
    };

    const handleAgentAction = (tool: Tab, parameter: string) => {
        setInitialToolInput(parameter);
        _setActiveTab(tool);
    };

    useEffect(() => {
        localStorage.setItem('utrend-active-tab', activeTab);
    }, [activeTab]);

    const handleUpgradeClick = useCallback((plan: User['plan']) => {
        if (plan === 'free') return;
        setSelectedPlan(plan);
        setIsCheckoutOpen(true);
    }, []);

    const handleCheckoutClose = () => {
        setIsCheckoutOpen(false);
        setSelectedPlan(null);
    };

    const renderContent = () => {
        switch (activeTab) {
            case Tab.Dashboard:
                return <Dashboard setActiveTab={setActiveTab} setActiveAnalyticsChannelId={setActiveAnalyticsChannelId} />;
            case Tab.Trends:
                return <TrendDiscovery initialInput={initialToolInput} />;
            case Tab.Ideas:
                return <ContentGenerator initialInput={initialToolInput} />;
            case Tab.Monetization:
                return <MonetizationGuide />;
            case Tab.Report:
                return <StrategyReport setActiveTab={setActiveTab} initialInput={initialToolInput} />;
            case Tab.Video:
                return <VideoGenerator setActiveTab={setActiveTab} />;
            case Tab.Prompt:
                return <PromptGenerator />;
            case Tab.Keywords:
                return <KeywordResearch initialInput={initialToolInput} />;
            case Tab.Profile:
                return <UserProfile onUpgradeClick={() => setActiveTab(Tab.Pricing)} />;
            case Tab.Admin:
                 return user?.role === 'admin' ? <AdminDashboard /> : <p>Access Denied.</p>;
            case Tab.Pricing:
                return <PricingPage onUpgradeClick={handleUpgradeClick} />;
            case Tab.Support:
                return <SupportPage setActiveTab={setActiveTab} />;
            case Tab.Contact:
                return <ContactPage />;
            case Tab.TermsOfUse:
                return <LegalPage type="terms" />;
            case Tab.License:
                return <LegalPage type="license" />;
            case Tab.Analytics:
                 return <ChannelAnalytics activeChannelId={activeAnalyticsChannelId} setActiveChannelId={setActiveAnalyticsChannelId} setActiveTab={setActiveTab} initialInput={initialToolInput} />;
            case Tab.ChannelGrowth:
                return <ChannelGrowth setActiveTab={setActiveTab} />;
            case Tab.BrandConnect:
                return <BrandConnect setActiveTab={setActiveTab} />;
            case Tab.ContentHistory:
                return <ContentHistory />;
            case Tab.VideoAnalyzer:
                return <VideoAnalyzer initialInput={initialToolInput} />;
            case Tab.RepurposeContent:
                return <RepurposeContent initialInput={initialToolInput} />;
            case Tab.Agents:
                return <AIAgents setActiveTab={setActiveTab} onAction={handleAgentAction} />;
            case Tab.AnimationCreator:
                return <AnimationCreator setActiveTab={setActiveTab} />;
            case Tab.GifCreator:
                return <GifCreator setActiveTab={setActiveTab} />;
            case Tab.LogoCreator:
                return <LogoCreator setActiveTab={setActiveTab} />;
            case Tab.ImageEditor:
                return <ImageEditor setActiveTab={setActiveTab} />;
            case Tab.VideoEditor:
                return <VideoEditor setActiveTab={setActiveTab} />;
            case Tab.ThumbnailGenerator:
                return <ThumbnailGenerator />;
            default:
                return <Dashboard setActiveTab={setActiveTab} setActiveAnalyticsChannelId={setActiveAnalyticsChannelId} />;
        }
    };
    
    let adminTabs = [];
    if (user?.role === 'admin') {
      adminTabs.push({ id: Tab.Admin, label: 'Admin', icon: <Shield className="w-5 h-5 mr-3" />, title: 'Admin Dashboard' });
    }
    const finalUserMenuTabs = userMenuTabs.slice(0, 1).concat(adminTabs, userMenuTabs.slice(1));


    return (
        <div className="bg-slate-950 text-slate-100 min-h-screen font-sans">
            <Header setActiveTab={setActiveTab} userMenuTabs={finalUserMenuTabs} />
            <div className="flex">
                <Sidebar
                    mainTabs={mainTabs}
                    createTabs={createTabs}
                    strategyTabs={strategyTabs}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                />
                <main className="flex-1 p-6 sm:p-8 overflow-y-auto h-[calc(100vh-65px)]">
                    {renderContent()}
                </main>
            </div>
            <TrendingTicker />
            <CheckoutModal
                isOpen={isCheckoutOpen}
                onClose={handleCheckoutClose}
                plan={selectedPlan}
            />
        </div>
    );
};

export default AppLayout;
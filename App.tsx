import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { Breadcrumbs } from './components/Breadcrumbs';
import { GlobalSearch } from './components/GlobalSearch';
import { MenuIcon, Bell, Search, Command, Sun, Moon, Plus, ChevronDown, LogOut, User, CreditCard, LifeBuoy, Settings as SettingsIcon, Sparkles, Video, Image as ImageIcon, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UtrendLogo } from './components/Logo';
import { Login } from './components/Login';
import { LandingPage } from './components/LandingPage';
import { Loader2 } from 'lucide-react';
import { ToolId, PlanName } from './types';
import { useAuth } from './contexts/AuthContext';
import { useLocalStorage } from './hooks/useLocalStorage';

// Import all tool components
import { Dashboard } from './tools/Dashboard';
import { ContentRepurposing } from './tools/ContentRepurposing';
import { GrowthPlanner } from './tools/GrowthPlanner';
import { EngagementTools } from './tools/EngagementTools';
import { AvatarStudio } from './tools/AvatarStudio';
import { MediaEditor } from './tools/MediaEditor';
import { ImageEditor } from './tools/ImageEditor';
import { MediaGenerator } from './tools/MediaGenerator';
import { ScriptWriter } from './tools/ScriptWriter';
import { ContentAnalyzer } from './tools/ContentAnalyzer';
import { TrendsKeywords } from './tools/TrendsKeywords';
import { NoloAI } from './tools/NoloAI';
import AIVoiceCoPilot from './tools/AIVoiceCoPilot';
import { MyContent } from './tools/MyContent';
import { ThumbnailIdeas } from './tools/ThumbnailIdeas';
import { VideoEditor } from './tools/VideoEditor';
import { MonetizationGuide } from './tools/MonetizationGuide';
import { ContentCalendar } from './tools/ContentCalendar';
import { Collaboration } from './tools/Collaboration';
import { Analytics } from './tools/Analytics';
import { SEOAutomation } from './tools/SEOAutomation';
import { BrandConnect } from './tools/BrandConnect';
import { StrategyReport } from './tools/StrategyReport';
import { Settings } from './tools/Settings';
import { Profile } from './tools/Profile';
import { Pricing } from './tools/Pricing';
import { Support } from './tools/Support';
import { History } from './tools/History';
import { About } from './tools/About';
import { Contact } from './tools/Contact';
import { Legal } from './tools/Legal';
import { Admin } from './tools/Admin';
import { PromptGenerator } from './tools/PromptGenerator';
import AIAgents from './components/AIAgents';

const App: React.FC = () => {
  const { user, loading, logout, upgradePlan } = useAuth();
  const [activeTool, setActiveTool] = useState<ToolId>('dashboard');

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('utrend-theme', 'dark');
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [initialInput, setInitialInput] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Handle navigation from tools
  const handleNavigate = (toolId: ToolId, state?: any) => {
    setActiveTool(toolId);
    if (state) {
      if (state.channelId) setActiveChannelId(state.channelId);
      if (state.input) setInitialInput(state.input);
    } else {
      setInitialInput(null);
    }
    window.scrollTo(0, 0);
  };

  const handleUpgradeClick = (plan: PlanName) => {
    setActiveTool('pricing');
    window.scrollTo(0, 0);
  };

  const renderActiveTool = () => {
    const props = { onNavigate: handleNavigate };

    switch (activeTool) {
      case 'dashboard':
        return <Dashboard {...props} />;
      case 'content-repurposing':
        return <ContentRepurposing {...props} />;
      case 'growth-planner':
        return <GrowthPlanner {...props} />;
      case 'engagement-tools':
        return <EngagementTools {...props} />;
      case 'avatar-studio':
        return <AvatarStudio {...props} />;
      case 'media-editor':
        return <MediaEditor {...props} />;
      case 'image-editor':
        return <ImageEditor {...props} />;
      case 'media-generator':
        return <MediaGenerator {...props} />;
      case 'script-writer':
        return <ScriptWriter {...props} />;
      case 'content-analyzer':
        return <ContentAnalyzer {...props} />;
      case 'trends-keywords':
        return <TrendsKeywords {...props} initialInput={initialInput} />;
      case 'nolo-ai':
        return <NoloAI {...props} />;
      case 'ai-voice-copilot':
        return <AIVoiceCoPilot {...props} />;
      case 'my-content':
        return <MyContent {...props} />;
      case 'thumbnail-ideas':
        return <ThumbnailIdeas {...props} />;
      case 'video-editor':
        return <VideoEditor {...props} />;
      case 'monetization-guide':
        return <MonetizationGuide {...props} />;
      case 'content-calendar':
        return <ContentCalendar {...props} />;
      case 'collaboration':
        return <Collaboration {...props} />;
      case 'analytics':
        return <Analytics onNavigate={handleNavigate} activeChannelId={activeChannelId} setActiveChannelId={setActiveChannelId} initialInput={initialInput} />;
      case 'seo-automation':
        return <SEOAutomation {...props} />;
      case 'brand-connect':
        return <BrandConnect {...props} />;
      case 'video-analyzer':
        return <ContentAnalyzer {...props} initialTab="video" />;
      case 'strategy-report':
        return <StrategyReport {...props} initialInput={initialInput} />;
      case 'settings':
        return <Settings theme={theme} setTheme={setTheme} onNavigate={handleNavigate} />;
      case 'profile':
        return <Profile {...props} />;
      case 'pricing':
        return <Pricing onUpgradeClick={handleUpgradeClick} onNavigate={handleNavigate} />;
      case 'support':
        return <Support onNavigate={handleNavigate} />;
      case 'content-history':
        return <History {...props} />;
      case 'about':
        return <About {...props} />;
      case 'contact':
        return <Contact {...props} />;
      case 'terms':
        return <Legal type="terms" {...props} />;
      case 'license':
        return <Legal type="license" {...props} />;
      case 'admin':
        return <Admin {...props} />;
      case 'prompt':
        return <PromptGenerator {...props} />;
      case 'ai-agents':
        return <AIAgents setActiveTab={(tab) => handleNavigate(tab as ToolId)} />;
      default:
        return <Dashboard {...props} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-violet-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    if (showAuth) {
      return <Login />;
    }
    return <LandingPage onGetStarted={() => setShowAuth(true)} />;
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden relative">
      <div className="aurora-bg" />
      <Sidebar 
        activeTool={activeTool} 
        setActiveTool={setActiveTool} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
      />

      <BottomNav 
        activeTool={activeTool} 
        setActiveTool={setActiveTool} 
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-4 md:px-8 bg-slate-900/40 backdrop-blur-xl z-30">
          <div className="flex items-center gap-4 flex-1">
            <div className="md:hidden flex items-center gap-1">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <MenuIcon className="w-6 h-6" />
              </button>
              {activeTool !== 'dashboard' && (
                <button 
                  onClick={() => handleNavigate('dashboard')}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <ChevronDown className="w-5 h-5 rotate-90" />
                </button>
              )}
            </div>
            <div className="md:hidden flex items-center gap-2" onClick={() => handleNavigate('dashboard')}>
              <UtrendLogo className="h-8 w-8 cursor-pointer" />
              <span className="text-xl font-bold text-white tracking-tighter cursor-pointer">uTrends</span>
            </div>
            <div className="hidden md:flex flex-col">
              <h2 className="text-xl font-bold text-white capitalize min-w-[150px] tracking-tight">
                {activeTool.replace(/-/g, ' ')}
              </h2>
              <Breadcrumbs activeTool={activeTool} onNavigate={handleNavigate} />
            </div>
            
            {/* Global Search Bar */}
            <div className="hidden md:flex flex-1 justify-center max-w-2xl px-8">
              <GlobalSearch onNavigate={handleNavigate} />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {/* Theme Toggle */}
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-all"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Quick Actions */}
            <div className="hidden sm:block relative group">
              <button className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-violet-900/40 active:scale-95">
                <Plus className="w-4 h-4" />
                <span>Create</span>
              </button>
              <div className="absolute right-0 mt-3 w-52 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 p-2">
                <button onClick={() => handleNavigate('media-generator')} className="w-full text-left px-3 py-2.5 text-xs text-slate-300 hover:bg-white/5 hover:text-white rounded-xl transition-colors flex items-center gap-3">
                  <Video className="w-4 h-4 text-violet-400" /> Generate Video
                </button>
                <button onClick={() => handleNavigate('image-editor')} className="w-full text-left px-3 py-2.5 text-xs text-slate-300 hover:bg-white/5 hover:text-white rounded-xl transition-colors flex items-center gap-3">
                  <ImageIcon className="w-4 h-4 text-violet-400" /> Edit Image
                </button>
                <button onClick={() => handleNavigate('script-writer')} className="w-full text-left px-3 py-2.5 text-xs text-slate-300 hover:bg-white/5 hover:text-white rounded-xl transition-colors flex items-center gap-3">
                  <FileText className="w-4 h-4 text-violet-400" /> Write Script
                </button>
              </div>
            </div>

            <button 
              className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-all relative"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-violet-500 rounded-full border-2 border-slate-900" />
            </button>

            {/* User Menu */}
            <div className="relative group">
              <button 
                className="flex items-center gap-2 p-1 pr-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-inner">
                  {user.name.charAt(0)}
                </div>
                <span className="hidden sm:block text-sm font-semibold text-slate-200">{user.name}</span>
                <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
              </button>

              <div className="absolute right-0 mt-3 w-60 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 overflow-hidden">
                <div className="p-5 border-b border-white/5 bg-white/5">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1.5">Account</p>
                  <p className="text-sm font-bold text-white truncate">{user.name}</p>
                  <p className="text-xs text-slate-400 truncate">{user.email}</p>
                </div>
                <div className="p-2">
                  <button onClick={() => handleNavigate('profile')} className="w-full text-left px-3 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white rounded-xl transition-colors flex items-center gap-3">
                    <User className="w-4 h-4 text-slate-500" /> My Profile
                  </button>
                  <button onClick={() => handleNavigate('pricing')} className="w-full text-left px-3 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white rounded-xl transition-colors flex items-center gap-3">
                    <CreditCard className="w-4 h-4 text-slate-500" /> Subscription
                  </button>
                  <button onClick={() => handleNavigate('settings')} className="w-full text-left px-3 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white rounded-xl transition-colors flex items-center gap-3">
                    <SettingsIcon className="w-4 h-4 text-slate-500" /> Settings
                  </button>
                  <button onClick={() => handleNavigate('support')} className="w-full text-left px-3 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white rounded-xl transition-colors flex items-center gap-3">
                    <LifeBuoy className="w-4 h-4 text-slate-500" /> Help & Support
                  </button>
                </div>
                <div className="p-2 border-t border-white/5">
                  <button onClick={logout} className="w-full text-left px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-colors flex items-center gap-3">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {renderActiveTool()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;

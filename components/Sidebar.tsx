import React, { useMemo, useState } from 'react';
import { ToolId } from '../types';
import { UtrendLogo } from './Logo';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  RefreshCcw, 
  TrendingUp, 
  MessageSquare, 
  UserCircle, 
  PenTool, 
  Video, 
  FileText, 
  BarChart3, 
  Search, 
  Bot, 
  Mic2, 
  FolderOpen, 
  Image, 
  Clapperboard, 
  DollarSign, 
  Calendar, 
  Users, 
  PieChart, 
  SearchCode, 
  Settings,
  X,
  Briefcase,
  Target,
  History as HistoryIcon,
  Wand2,
  Shield,
  ChevronDown,
  ChevronRight,
  LogOut,
  Sparkles,
  Menu
} from 'lucide-react';
import { Youtube } from './Icons';

interface SidebarProps {
  activeTool: ToolId;
  setActiveTool: (tool: ToolId) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

interface SidebarItem {
  id: ToolId;
  name: string;
  icon: React.FC<any>;
  isPro?: boolean;
}

interface SidebarCategory {
  name: string;
  items: SidebarItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTool, setActiveTool, isOpen, setIsOpen }) => {
  const { user, logout } = useAuth();
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (name: string) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const categories = useMemo(() => {
    const cats: SidebarCategory[] = [
      {
        name: 'Main',
        items: [
          { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
          { id: 'my-content', name: 'My Content', icon: FolderOpen },
          { id: 'content-history', name: 'History', icon: HistoryIcon },
        ]
      },
      {
        name: 'Creation',
        items: [
          { id: 'media-generator', name: 'Media Gen', icon: Video, isPro: true },
          { id: 'script-writer', name: 'Script Writer', icon: FileText },
          { id: 'thumbnail-ideas', name: 'Thumbnails', icon: Image },
          { id: 'prompt', name: 'Prompt Gen', icon: Wand2 },
        ]
      },
      {
        name: 'Editing',
        items: [
          { id: 'media-editor', name: 'Media Editor', icon: PenTool },
          { id: 'image-editor', name: 'Image Editor', icon: Image, isPro: true },
          { id: 'video-editor', name: 'Video Editor', icon: Clapperboard, isPro: true },
        ]
      },
      {
        name: 'Growth',
        items: [
          { id: 'growth-planner', name: 'Growth', icon: TrendingUp, isPro: true },
          { id: 'engagement-tools', name: 'Engagement', icon: MessageSquare },
          { id: 'trends-keywords', name: 'Trends & SEO', icon: Search },
          { id: 'seo-automation', name: 'SEO Auto', icon: SearchCode, isPro: true },
          { id: 'strategy-report', name: 'Full Report', icon: Target, isPro: true },
        ]
      },
      {
        name: 'Analytics',
        items: [
          { id: 'content-analyzer', name: 'Analyzer', icon: BarChart3 },
          { id: 'video-analyzer', name: 'Video Analyzer', icon: Youtube },
          { id: 'analytics', name: 'Analytics', icon: PieChart, isPro: true },
        ]
      },
      {
        name: 'AI Assistants',
        items: [
          { id: 'ai-agents', name: 'AI Agents', icon: Sparkles },
          { id: 'nolo-ai', name: 'Nolo AI', icon: Bot },
          { id: 'ai-voice-copilot', name: 'Voice Co-Pilot', icon: Mic2, isPro: true },
          { id: 'avatar-studio', name: 'Avatar Studio', icon: UserCircle, isPro: true },
        ]
      },
      {
        name: 'Business',
        items: [
          { id: 'monetization-guide', name: 'Monetization', icon: DollarSign },
          { id: 'brand-connect', name: 'Brand Connect', icon: Briefcase, isPro: true },
          { id: 'collaboration', name: 'Collaboration', icon: Users },
          { id: 'content-calendar', name: 'Calendar', icon: Calendar },
        ]
      },
      {
        name: 'Account',
        items: [
          { id: 'profile', name: 'My Profile', icon: UserCircle },
          { id: 'pricing', name: 'Pricing', icon: DollarSign },
          { id: 'support', name: 'Support', icon: MessageSquare },
          { id: 'settings', name: 'Settings', icon: Settings },
        ]
      }
    ];

    if (user?.role === 'admin') {
      cats.push({
        name: 'Admin',
        items: [{ id: 'admin', name: 'Admin Panel', icon: Shield }]
      });
    }

    return cats;
  }, [user]);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        flex flex-col h-full
      `}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UtrendLogo className="h-8 w-8" />
            <span className="text-xl font-bold text-white">uTrends</span>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="md:hidden text-slate-400 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-6 custom-scrollbar">
          {categories.map((category) => (
            <div key={category.name} className="space-y-1">
              <button 
                onClick={() => toggleCategory(category.name)}
                className="w-full flex items-center justify-between px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-slate-300 transition-colors group"
              >
                <span>{category.name}</span>
                {collapsedCategories[category.name] ? (
                  <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-slate-400" />
                ) : (
                  <ChevronDown className="w-3 h-3 text-slate-600 group-hover:text-slate-400" />
                )}
              </button>
              
              <AnimatePresence initial={false}>
                {!collapsedCategories[category.name] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    className="overflow-hidden space-y-1"
                  >
                    {category.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTool(item.id);
                          setIsOpen(false);
                        }}
                        className={`
                          w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all group
                          ${activeTool === item.id 
                            ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/20' 
                            : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className={`h-4 w-4 ${activeTool === item.id ? 'text-white' : 'text-slate-500 group-hover:text-violet-400'}`} />
                          {item.name}
                        </div>
                        {item.isPro && user?.plan !== 'pro' && (
                          <Sparkles className="w-3 h-3 text-yellow-500" />
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-4">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800/30 border border-slate-700/50 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-inner">
              {user?.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                {user?.plan ? user.plan : 'Free'} Plan
              </p>
            </div>
            <button 
              onClick={logout}
              className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
          
          {user?.plan !== 'pro' && (
            <button 
              onClick={() => setActiveTool('pricing')}
              className="w-full py-3 px-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl flex items-center justify-center gap-2 text-yellow-500 text-xs font-bold hover:from-yellow-500/20 hover:to-orange-500/20 transition-all group"
            >
              <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Upgrade to Pro
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

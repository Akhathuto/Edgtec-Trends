import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, X, Command } from 'lucide-react';
import { ToolId } from '../types';
import { useAuth } from '../contexts/AuthContext';
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
  Search as SearchIcon, 
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
  Briefcase,
  Target,
  History as HistoryIcon,
  Wand2,
  Shield,
  Sparkles
} from 'lucide-react';
import { Youtube } from './Icons';

interface GlobalSearchProps {
  onNavigate: (toolId: ToolId) => void;
}

interface SearchItem {
  id: ToolId;
  name: string;
  description: string;
  icon: React.FC<any>;
  category: string;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const allItems = useMemo(() => {
    const items: SearchItem[] = [
      { id: 'dashboard', name: 'Dashboard', description: 'Overview of your content performance', icon: LayoutDashboard, category: 'General' },
      { id: 'content-repurposing', name: 'Repurpose Content', description: 'Turn long videos into shorts/reels', icon: RefreshCcw, category: 'Content' },
      { id: 'growth-planner', name: 'Growth Planner', description: 'AI-powered strategy for channel growth', icon: TrendingUp, category: 'Growth' },
      { id: 'engagement-tools', name: 'Engagement Tools', description: 'Manage comments and audience interaction', icon: MessageSquare, category: 'Growth' },
      { id: 'avatar-studio', name: 'Avatar Studio', description: 'Create and customize your AI avatar', icon: UserCircle, category: 'AI Tools' },
      { id: 'media-editor', name: 'Media Editor', description: 'Edit images and videos with AI', icon: PenTool, category: 'Content' },
      { id: 'image-editor', name: 'Image Editor', description: 'AI-powered image editing and style changes', icon: Image, category: 'Content' },
      { id: 'media-generator', name: 'Media Generator', description: 'Generate AI images and videos', icon: Video, category: 'AI Tools' },
      { id: 'script-writer', name: 'Script Writer', description: 'AI script generation for your videos', icon: FileText, category: 'Content' },
      { id: 'strategy-report', name: 'Full Report', description: 'Comprehensive content strategy report', icon: Target, category: 'Growth' },
      { id: 'content-analyzer', name: 'Content Analyzer', description: 'Analyze your content performance', icon: BarChart3, category: 'Analytics' },
      { id: 'video-analyzer', name: 'Video Analyzer', description: 'Deep dive into video performance', icon: Youtube, category: 'Analytics' },
      { id: 'trends-keywords', name: 'Trends & SEO', description: 'Discover trending topics and keywords', icon: SearchIcon, category: 'Growth' },
      { id: 'nolo-ai', name: 'Nolo AI', description: 'Your personal AI creative assistant', icon: Bot, category: 'AI Tools' },
      { id: 'ai-agents', name: 'AI Agents', description: 'Specialized AI agents for content, growth, and analytics', icon: Sparkles, category: 'AI Tools' },
      { id: 'ai-voice-copilot', name: 'Voice Co-Pilot', description: 'Real-time AI voice conversation', icon: Mic2, category: 'AI Tools' },
      { id: 'my-content', name: 'My Content', description: 'Manage your generated assets', icon: FolderOpen, category: 'General' },
      { id: 'thumbnail-ideas', name: 'Thumbnail Ideas', description: 'AI-generated thumbnail concepts', icon: Image, category: 'Content' },
      { id: 'video-editor', name: 'Video Editor', description: 'Advanced AI video editing', icon: Clapperboard, category: 'Content' },
      { id: 'monetization-guide', name: 'Monetization', description: 'Strategies to earn more', icon: DollarSign, category: 'Monetization' },
      { id: 'content-calendar', name: 'Content Calendar', description: 'Plan your posting schedule', icon: Calendar, category: 'General' },
      { id: 'collaboration', name: 'Collaboration', description: 'Work with your team', icon: Users, category: 'General' },
      { id: 'analytics', name: 'Analytics', description: 'Detailed performance metrics', icon: PieChart, category: 'Analytics' },
      { id: 'seo-automation', name: 'SEO Automation', description: 'Automate your video SEO', icon: SearchCode, category: 'Growth' },
      { id: 'brand-connect', name: 'Brand Connect', description: 'Find sponsorship opportunities', icon: Briefcase, category: 'Monetization' },
      { id: 'prompt', name: 'Prompt Generator', description: 'Create perfect AI prompts', icon: Wand2, category: 'AI Tools' },
      { id: 'content-history', name: 'History', description: 'View your past generations', icon: HistoryIcon, category: 'General' },
      { id: 'profile', name: 'My Profile', description: 'Manage your account details', icon: UserCircle, category: 'Settings' },
      { id: 'pricing', name: 'Pricing', description: 'View and upgrade your plan', icon: DollarSign, category: 'Settings' },
      { id: 'support', name: 'Support', description: 'Get help and contact us', icon: MessageSquare, category: 'Settings' },
      { id: 'settings', name: 'Settings', description: 'Platform preferences', icon: Settings, category: 'Settings' },
    ];

    if (user?.role === 'admin') {
      items.push({ id: 'admin', name: 'Admin Panel', description: 'Platform administration', icon: Shield, category: 'Settings' });
    }

    return items;
  }, [user]);

  const filteredItems = useMemo(() => {
    if (!query) return [];
    const lowerQuery = query.toLowerCase();
    return allItems.filter(item => 
      item.name.toLowerCase().includes(lowerQuery) || 
      item.description.toLowerCase().includes(lowerQuery) ||
      item.category.toLowerCase().includes(lowerQuery)
    ).slice(0, 8);
  }, [query, allItems]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setIsOpen(true);
      }
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSelect = (toolId: ToolId) => {
    onNavigate(toolId);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className="relative w-full max-w-md" ref={searchRef}>
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search tools, content, or features..."
          className="w-full bg-slate-800/50 border border-slate-700 rounded-full py-2 pl-10 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 bg-slate-700 rounded border border-slate-600 text-[10px] font-bold text-slate-400 pointer-events-none">
          <Command className="w-2.5 h-2.5" />
          <span>K</span>
        </div>
      </div>

      {isOpen && query && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2">
            {filteredItems.length > 0 ? (
              <div className="space-y-1">
                {filteredItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-colors text-left group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center group-hover:bg-violet-500/10 group-hover:border-violet-500/30 transition-colors">
                      <item.icon className="w-5 h-5 text-slate-400 group-hover:text-violet-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-white group-hover:text-violet-300">{item.name}</p>
                        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">{item.category}</span>
                      </div>
                      <p className="text-xs text-slate-400 truncate">{item.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                  <X className="w-6 h-6 text-slate-500" />
                </div>
                <p className="text-sm font-medium text-slate-300">No results found for "{query}"</p>
                <p className="text-xs text-slate-500 mt-1">Try searching for something else</p>
              </div>
            )}
          </div>
          
          <div className="p-3 bg-slate-800/50 border-t border-slate-700 flex items-center justify-between">
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Quick Navigation</p>
            <div className="flex gap-2">
              {['Dashboard', 'Trends', 'Analytics'].map(tag => (
                <button 
                  key={tag}
                  onClick={() => setQuery(tag)}
                  className="text-[10px] px-2 py-0.5 bg-slate-700 hover:bg-slate-600 rounded text-slate-300 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Tab } from '../types';
import { Search, ChevronDown, X, Star } from './Icons';
import { useAuth } from '../contexts/AuthContext';

interface TabItem {
  id: Tab;
  label: string;
  icon: React.ReactNode;
  title: string;
}

interface SidebarProps {
  mainTabs: TabItem[];
  createTabs: TabItem[];
  strategyTabs: TabItem[];
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const proTabs: Tab[] = [
  Tab.Chat, Tab.Analytics, Tab.Report, Tab.ChannelGrowth, Tab.BrandConnect,
  Tab.Video, Tab.AnimationCreator, Tab.GifCreator, Tab.ImageEditor, Tab.LogoCreator,
  Tab.ImageGenerator, Tab.AvatarCreator, Tab.VideoEditor
];

const NavItem: React.FC<{
    item: TabItem;
    isActive: boolean;
    onClick: () => void;
    isPro: boolean;
    userPlan: string;
}> = ({ item, isActive, onClick, isPro, userPlan }) => (
    <button
        onClick={onClick}
        title={isPro && userPlan !== 'pro' ? `${item.title} (Pro Feature)` : item.title}
        className={`w-full flex items-center py-2.5 px-3 text-sm font-semibold rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-light focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
        isActive
            ? 'bg-gradient-to-r from-violet-rich to-violet text-white shadow-glow-md'
            : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
        }`}
    >
        {item.icon}
        <span className="whitespace-nowrap flex-grow text-left">{item.label}</span>
         {isPro && userPlan !== 'pro' && (
            <span className="ml-2 flex items-center gap-1 text-xs font-bold bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 px-1.5 py-0.5 rounded-full">
                <Star className="w-3 h-3" />
                PRO
            </span>
        )}
    </button>
);

const Sidebar: React.FC<SidebarProps> = ({ mainTabs, createTabs, strategyTabs, activeTab, setActiveTab, isOpen, setIsOpen }) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [collapsedSections, setCollapsedSections] = useState<{ [key: string]: boolean }>({ create: false, strategy: false });
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node) && window.innerWidth < 1024) {
            setIsOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setIsOpen]);

  const toggleSection = (section: 'create' | 'strategy') => {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const filterTabs = (tabs: TabItem[]) => {
    if (!searchTerm) return tabs;
    return tabs.filter(tab => tab.label.toLowerCase().includes(searchTerm.toLowerCase()));
  };

  const filteredCreateTabs = useMemo(() => filterTabs(createTabs), [createTabs, searchTerm]);
  const filteredStrategyTabs = useMemo(() => filterTabs(strategyTabs), [strategyTabs, searchTerm]);
  
  const handleTabClick = (tab: TabItem) => {
    if (proTabs.includes(tab.id) && user?.plan !== 'pro') {
        setActiveTab(Tab.Pricing);
    } else {
        setActiveTab(tab.id);
    }
  };

  const sidebarClasses = `
    w-80 flex-shrink-0 bg-brand-glass p-3 h-[calc(100vh-65px)] overflow-y-auto
    transition-transform duration-300 ease-in-out
    fixed lg:sticky top-[65px] z-40
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    lg:translate-x-0
  `;

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/50 z-30 lg:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />
      <aside ref={sidebarRef} className={sidebarClasses}>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search tools..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            title="Search for tools and features"
            className="w-full bg-slate-800/80 border border-slate-700 rounded-lg py-2 pl-10 pr-8 focus:outline-none focus:ring-2 focus:ring-violet-light transition-all shadow-inner"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} title="Clear search" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <nav className="flex flex-col space-y-1">
          <div>
            <h3 className="px-3 pt-2 pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Main</h3>
            <div className="space-y-1">
              {mainTabs.map((tab) => (
                  <NavItem 
                      key={tab.id} 
                      item={tab} 
                      isActive={activeTab === tab.id} 
                      onClick={() => handleTabClick(tab)}
                      isPro={proTabs.includes(tab.id)}
                      userPlan={user!.plan}
                  />
              ))}
            </div>
          </div>
          
          <div>
              <button onClick={() => toggleSection('create')} title="Toggle Create tools section" className="w-full flex justify-between items-center px-3 pt-4 pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-300 transition-colors">
                  <span>Create</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${collapsedSections.create ? '-rotate-90' : ''}`} />
              </button>
              <div className={`transition-[max-height,padding] duration-300 ease-in-out overflow-hidden ${collapsedSections.create ? 'max-h-0' : 'max-h-screen'}`}>
                  <div className="space-y-1 pt-1">
                      {filteredCreateTabs.map((tab) => (
                          <NavItem 
                              key={tab.id} 
                              item={tab} 
                              isActive={activeTab === tab.id} 
                              onClick={() => handleTabClick(tab)}
                              isPro={proTabs.includes(tab.id)}
                              userPlan={user!.plan}
                          />
                      ))}
                  </div>
              </div>
          </div>

          <div>
              <button onClick={() => toggleSection('strategy')} title="Toggle Strategy tools section" className="w-full flex justify-between items-center px-3 pt-4 pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-300 transition-colors">
                  <span>Strategy</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${collapsedSections.strategy ? '-rotate-90' : ''}`} />
              </button>
              <div className={`transition-[max-height,padding] duration-300 ease-in-out overflow-hidden ${collapsedSections.strategy ? 'max-h-0' : 'max-h-screen'}`}>
                  <div className="space-y-1 pt-1">
                      {filteredStrategyTabs.map((tab) => (
                          <NavItem 
                              key={tab.id} 
                              item={tab} 
                              isActive={activeTab === tab.id} 
                              onClick={() => handleTabClick(tab)}
                              isPro={proTabs.includes(tab.id)}
                              userPlan={user!.plan}
                          />
                      ))}
                  </div>
              </div>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
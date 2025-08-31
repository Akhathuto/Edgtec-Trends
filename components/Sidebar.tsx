import React from 'react';
import { Tab } from '../types';

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
}

const NavSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div>
    <h3 className="px-3 pt-4 pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</h3>
    <div className="space-y-1">
        {children}
    </div>
  </div>
);

const NavItem: React.FC<{
    item: TabItem;
    isActive: boolean;
    onClick: () => void;
}> = ({ item, isActive, onClick }) => (
    <button
        onClick={onClick}
        title={item.title}
        className={`w-full flex items-center py-2.5 px-3 text-sm font-semibold rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-light focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
        isActive
            ? 'bg-violet text-white shadow-md'
            : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
        }`}
    >
        {item.icon}
        <span className="whitespace-nowrap">{item.label}</span>
    </button>
);


const Sidebar: React.FC<SidebarProps> = ({ mainTabs, createTabs, strategyTabs, activeTab, setActiveTab }) => {
  return (
    <aside className="w-60 flex-shrink-0 bg-brand-glass border-r border-slate-700/50 p-3 h-[calc(100vh-65px)] sticky top-[65px] overflow-y-auto">
      <nav className="flex flex-col space-y-2">
        <NavSection title="Main">
            {mainTabs.map((tab) => (
                <NavItem 
                    key={tab.id} 
                    item={tab} 
                    isActive={activeTab === tab.id} 
                    onClick={() => setActiveTab(tab.id)} 
                />
            ))}
        </NavSection>
        <NavSection title="Create">
            {createTabs.map((tab) => (
                <NavItem 
                    key={tab.id} 
                    item={tab} 
                    isActive={activeTab === tab.id} 
                    onClick={() => setActiveTab(tab.id)} 
                />
            ))}
        </NavSection>
        <NavSection title="Strategy">
            {strategyTabs.map((tab) => (
                <NavItem 
                    key={tab.id} 
                    item={tab} 
                    isActive={activeTab === tab.id} 
                    onClick={() => setActiveTab(tab.id)} 
                />
            ))}
        </NavSection>
      </nav>
    </aside>
  );
};

export default Sidebar;


import React, { useState, useRef, useEffect } from 'react';
import { Tab } from '../types';
import { ChevronDown, Wand, FileText } from './Icons';

interface TabItem {
  id: Tab;
  label: string;
  icon: React.ReactNode;
  title: string;
}

interface TabsProps {
  mainTabs: TabItem[];
  createTabs: TabItem[];
  strategyTabs: TabItem[];
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const NavDropdown: React.FC<{
  label: string;
  icon: React.ReactNode;
  items: TabItem[];
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}> = ({ label, icon, items, activeTab, setActiveTab }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const isActive = items.some(item => item.id === activeTab);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex-shrink-0 flex items-center justify-center py-2.5 px-4 text-sm font-semibold rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-light focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
          isActive
            ? 'bg-violet text-white shadow-md'
            : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
        }`}
      >
        {icon}
        <span className="whitespace-nowrap mr-1">{label}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-56 origin-top bg-slate-800/80 backdrop-blur-lg border border-slate-700 rounded-lg shadow-2xl z-50 animate-fade-in">
          <div className="py-1">
            {items.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left flex items-center px-4 py-2 text-sm transition-colors ${
                    activeTab === item.id ? 'bg-violet-500/50 text-white' : 'text-slate-300 hover:bg-violet-500/50 hover:text-white'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const Tabs: React.FC<TabsProps> = ({ mainTabs, createTabs, strategyTabs, activeTab, setActiveTab }) => {
  return (
    <div className="flex justify-center mb-8 animate-fade-in">
      <div className="flex items-center justify-center flex-wrap gap-2 p-2 rounded-2xl bg-slate-900/50 border border-slate-700/50">
        {mainTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            title={tab.title}
            className={`flex-shrink-0 flex items-center justify-center py-2.5 px-4 text-sm font-semibold rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-light focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
              activeTab === tab.id
                ? 'bg-violet text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
            }`}
          >
            {tab.icon}
            <span className="whitespace-nowrap">{tab.label}</span>
          </button>
        ))}
        <NavDropdown 
            label="Create" 
            icon={<Wand className="w-5 h-5 mr-2" />}
            items={createTabs} 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
        />
        <NavDropdown 
            label="Strategy" 
            icon={<FileText className="w-5 h-5 mr-2" />}
            items={strategyTabs} 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
        />
      </div>
    </div>
  );
};

export default Tabs;

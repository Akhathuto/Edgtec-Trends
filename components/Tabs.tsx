
import React from 'react';
import { Tab } from '../types';

interface TabItem {
  id: Tab;
  label: string;
  icon: React.ReactNode;
  title: string;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <div className="flex justify-center mb-8 bg-dark-card backdrop-blur-sm border border-gray-700 rounded-full p-1.5 max-w-md mx-auto animate-fade-in">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          title={tab.title}
          className={`w-full flex items-center justify-center py-2.5 px-4 text-sm font-semibold rounded-full transition-colors duration-300 focus:outline-none ${
            activeTab === tab.id
              ? 'bg-brand-purple text-white shadow-lg'
              : 'text-gray-300 hover:bg-gray-700'
          }`}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { ToolId } from '../types';

interface BreadcrumbsProps {
  activeTool: ToolId;
  onNavigate: (toolId: ToolId) => void;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ activeTool, onNavigate }) => {
  const getToolName = (id: ToolId) => {
    return id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  if (activeTool === 'dashboard') return null;

  return (
    <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 overflow-hidden whitespace-nowrap">
      <button 
        onClick={() => onNavigate('dashboard')}
        className="flex items-center gap-1.5 hover:text-white transition-colors group"
      >
        <Home className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
        <span>Dashboard</span>
      </button>
      
      <ChevronRight className="w-3 h-3 text-slate-700 flex-shrink-0" />
      
      <span className="text-slate-300 font-bold truncate">
        {getToolName(activeTool)}
      </span>
    </nav>
  );
};

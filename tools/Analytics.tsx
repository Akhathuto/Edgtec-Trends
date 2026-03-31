import React from 'react';
import { ChannelAnalytics } from './ChannelAnalytics';
import { ToolId } from '../types';

interface AnalyticsProps {
  onNavigate: (toolId: ToolId, state?: any) => void;
  activeChannelId: string | null;
  setActiveChannelId: (id: string | null) => void;
  initialInput?: string | null;
}

export const Analytics: React.FC<AnalyticsProps> = ({ onNavigate, activeChannelId, setActiveChannelId, initialInput }) => {
  return (
    <ChannelAnalytics 
      onNavigate={onNavigate} 
      activeChannelId={activeChannelId} 
      setActiveChannelId={setActiveChannelId} 
      initialInput={initialInput}
    />
  );
};

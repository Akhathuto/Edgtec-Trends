import React, { useState } from 'react';
import { ChannelAnalytics } from './ChannelAnalytics';
import { VideoAnalyzer } from './VideoAnalyzer';

import { ToolId } from '../types';

interface ContentAnalyzerProps {
  initialTab?: 'channel' | 'video';
  onNavigate: (toolId: ToolId, state?: any) => void;
}

export const ContentAnalyzer: React.FC<ContentAnalyzerProps> = ({ initialTab = 'channel', onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'channel' | 'video'>(initialTab);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex border-b border-slate-700">
        <button
          onClick={() => setActiveTab('channel')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'channel'
              ? 'text-violet-400 border-b-2 border-violet-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Channel Analytics
        </button>
        <button
          onClick={() => setActiveTab('video')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'video'
              ? 'text-violet-400 border-b-2 border-violet-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Video Analyzer
        </button>
      </div>

      <div className="mt-6">
        {activeTab === 'channel' ? (
          <ChannelAnalytics 
            onNavigate={onNavigate} 
            activeChannelId={activeChannelId} 
            setActiveChannelId={setActiveChannelId} 
          />
        ) : (
          <VideoAnalyzer onNavigate={onNavigate} />
        )}
      </div>
    </div>
  );
};

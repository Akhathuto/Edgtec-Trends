import React, { useState } from 'react';
import { AIChat } from './AIChat';
import { AIAgents } from './AIAgents';
import { ToolId } from '../types';

interface NoloAIProps {
  initialTab?: 'chat' | 'agents';
  onNavigate: (toolId: ToolId, state?: any) => void;
}

export const NoloAI: React.FC<NoloAIProps> = ({ initialTab = 'chat', onNavigate }) => {
  const [activeTab, setActiveTabLocal] = useState<'chat' | 'agents'>(initialTab);

  return (
    <div className="space-y-6">
      <div className="flex border-b border-slate-700">
        <button
          onClick={() => setActiveTabLocal('chat')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'chat'
              ? 'text-violet-400 border-b-2 border-violet-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          AI Chat
        </button>
        <button
          onClick={() => setActiveTabLocal('agents')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'agents'
              ? 'text-violet-400 border-b-2 border-violet-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          AI Agents
        </button>
      </div>

      <div className="mt-6">
        {activeTab === 'chat' ? <AIChat onNavigate={onNavigate} /> : <AIAgents onNavigate={onNavigate} />}
      </div>
    </div>
  );
};

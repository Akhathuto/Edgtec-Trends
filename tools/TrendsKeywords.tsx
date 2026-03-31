import React, { useState } from 'react';
import { TrendDiscovery } from './TrendDiscovery';
import { KeywordResearch } from './KeywordResearch';
import { ToolId } from '../types';

interface TrendsKeywordsProps {
  initialTab?: 'trends' | 'keywords';
  onNavigate: (toolId: ToolId, state?: any) => void;
  initialInput?: string | null;
}

export const TrendsKeywords: React.FC<TrendsKeywordsProps> = ({ initialTab = 'trends', onNavigate, initialInput }) => {
  const [activeTab, setActiveTab] = useState<'trends' | 'keywords'>(initialInput ? 'keywords' : initialTab);

  return (
    <div className="space-y-6">
      <div className="flex border-b border-slate-700">
        <button
          onClick={() => setActiveTab('trends')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'trends'
              ? 'text-violet-400 border-b-2 border-violet-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Trend Discovery
        </button>
        <button
          onClick={() => setActiveTab('keywords')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'keywords'
              ? 'text-violet-400 border-b-2 border-violet-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Keyword Research
        </button>
      </div>

      <div className="mt-6">
        {activeTab === 'trends' ? (
          <TrendDiscovery onNavigate={onNavigate} />
        ) : (
          <KeywordResearch onNavigate={onNavigate} initialInput={initialInput} />
        )}
      </div>
    </div>
  );
};

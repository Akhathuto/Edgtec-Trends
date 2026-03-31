import React from 'react';

import { ToolId } from '../types';

interface CollaborationProps {
  onNavigate: (toolId: ToolId, state?: any) => void;
}

export const Collaboration: React.FC<CollaborationProps> = ({ onNavigate }) => {
  return (
    <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
      <h2 className="text-2xl font-bold mb-4">Collaboration</h2>
      <p className="text-slate-400">Connect with other creators and brands.</p>
    </div>
  );
};

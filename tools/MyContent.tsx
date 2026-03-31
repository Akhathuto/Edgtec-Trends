import React from 'react';

import { ToolId } from '../types';

interface MyContentProps {
  onNavigate: (toolId: ToolId, state?: any) => void;
}

export const MyContent: React.FC<MyContentProps> = ({ onNavigate }) => {
  return (
    <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
      <h2 className="text-2xl font-bold mb-4">My Content</h2>
      <p className="text-slate-400">Manage your generated content and history here.</p>
    </div>
  );
};

import React from 'react';

import { ToolId } from '../types';

interface ContentCalendarProps {
  onNavigate: (toolId: ToolId, state?: any) => void;
}

export const ContentCalendar: React.FC<ContentCalendarProps> = ({ onNavigate }) => {
  return (
    <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
      <h2 className="text-2xl font-bold mb-4">Content Calendar</h2>
      <p className="text-slate-400">Plan and schedule your content across platforms.</p>
    </div>
  );
};

import React from 'react';
import { ToolId } from '../types';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Plus, 
  BarChart3, 
  UserCircle,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';

interface BottomNavProps {
  activeTool: ToolId;
  setActiveTool: (tool: ToolId) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTool, setActiveTool }) => {
  const items = [
    { id: 'dashboard', name: 'Home', icon: LayoutDashboard },
    { id: 'trends-keywords', name: 'Trends', icon: TrendingUp },
    { id: 'create-hub', name: 'Create', icon: Plus, isCenter: true },
    { id: 'analytics', name: 'Stats', icon: BarChart3 },
    { id: 'ai-agents', name: 'AI', icon: Sparkles },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-slate-950/80 backdrop-blur-2xl border-t border-white/5 z-50 px-4 pb-4">
      <div className="flex items-center justify-between h-full max-w-lg mx-auto relative">
        {items.map((item) => {
          const isActive = activeTool === item.id;
          
          if (item.isCenter) {
            return (
              <button
                key={item.id}
                onClick={() => setActiveTool('media-generator')}
                className="relative -top-6 flex items-center justify-center w-14 h-14 bg-violet-600 rounded-2xl shadow-xl shadow-violet-900/40 text-white active:scale-90 transition-transform"
              >
                <item.icon className="w-7 h-7" />
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => setActiveTool(item.id as ToolId)}
              className="flex flex-col items-center justify-center gap-1.5 flex-1 h-full group"
            >
              <div className={`relative p-1.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-violet-500/10 text-violet-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                <item.icon className="w-5 h-5" />
                {isActive && (
                  <motion.div
                    layoutId="bottom-nav-active"
                    className="absolute inset-0 bg-violet-500/20 rounded-xl -z-10"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${isActive ? 'text-violet-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                {item.name}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

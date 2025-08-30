
import React from 'react';
import { EdgTecLogo } from './Logo';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Star, User as UserIcon } from './Icons';
import { Tab } from '../types';

interface HeaderProps {
  setActiveTab: (tab: Tab) => void;
}

const Header: React.FC<HeaderProps> = ({ setActiveTab }) => {
  const { user, logout } = useAuth();

  const getPlanStyles = () => {
    if (!user) return '';
    switch(user.plan) {
        case 'pro': return 'bg-yellow-500/20 text-yellow-300';
        case 'starter': return 'bg-blue-500/20 text-blue-300';
        default: return 'bg-gray-700 text-gray-300';
    }
  }

  return (
    <header className="py-4 px-4 sm:px-6">
      <div className="container mx-auto flex items-center justify-between">
        <div title="EdgTec Trends: Your AI-powered content strategy assistant">
            <EdgTecLogo className="h-12" />
        </div>

        {user && (
          <div className="flex items-center gap-4">
             <div className="hidden sm:flex items-center gap-2">
                <span className="text-sm text-gray-300">Welcome, {user.name}</span>
                <span className={`inline-block font-bold text-xs px-2 py-0.5 rounded-full ${getPlanStyles()}`}>
                    {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
                </span>
            </div>
             {user.plan !== 'pro' && (
              <button
                onClick={() => setActiveTab(Tab.Pricing)}
                className="flex items-center gap-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 font-semibold text-sm px-4 py-2 rounded-full transition-colors"
              >
                <Star className="w-4 h-4" />
                Upgrade Plan
              </button>
            )}
            <button
                onClick={() => setActiveTab(Tab.Profile)}
                className="p-2 rounded-full hover:bg-gray-700/50 transition-colors"
                title="View Profile"
              >
                <UserIcon className="w-5 h-5 text-gray-400" />
            </button>
            <button
              onClick={logout}
              className="p-2 rounded-full hover:bg-gray-700/50 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

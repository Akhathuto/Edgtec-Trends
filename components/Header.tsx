import React from 'react';
import { EdgTecLogo } from './Logo';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Star, User } from './Icons';
import { Tab } from '../types';

interface HeaderProps {
  onUpgradeClick: () => void;
  setActiveTab: (tab: Tab) => void;
}

const Header: React.FC<HeaderProps> = ({ onUpgradeClick, setActiveTab }) => {
  const { user, logout } = useAuth();
  return (
    <header className="py-4 px-4 sm:px-6">
      <div className="container mx-auto flex items-center justify-between">
        <div title="EdgTec Trends: Your AI-powered content strategy assistant">
            <EdgTecLogo className="h-12" />
        </div>

        {user && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-300 hidden sm:block">Welcome, {user.name}</span>
             {user.plan === 'free' && (
              <button
                onClick={onUpgradeClick}
                className="flex items-center gap-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 font-semibold text-sm px-4 py-2 rounded-full transition-colors"
              >
                <Star className="w-4 h-4" />
                Upgrade to Pro
              </button>
            )}
            <button
                onClick={() => setActiveTab(Tab.Profile)}
                className="p-2 rounded-full hover:bg-gray-700/50 transition-colors"
                title="View Profile"
              >
                <User className="w-5 h-5 text-gray-400" />
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
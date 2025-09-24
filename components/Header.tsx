
import React, { useState, useRef, useEffect } from 'react';
import { UtrendLogo } from './Logo.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { LogOut, Star, User as UserIcon, ChevronDown } from './Icons.tsx';
import { Tab } from '../types.ts';

interface HeaderProps {
  setActiveTab: (tab: Tab) => void;
  userMenuTabs: { id: Tab; label: string; icon: React.ReactNode; title: string; }[];
}

const Header: React.FC<HeaderProps> = ({ setActiveTab, userMenuTabs }) => {
  const { user, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  const getPlanStyles = () => {
    if (!user) return '';
    switch(user.plan) {
        case 'pro': return 'bg-yellow-400/10 text-yellow-300 border border-yellow-400/20';
        case 'starter': return 'bg-blue-400/10 text-blue-300 border border-blue-400/20';
        default: return 'bg-slate-700/50 text-slate-300 border border-slate-600';
    }
  }

  return (
    <header className="sticky top-0 z-30 py-3 px-4 sm:px-6 bg-slate-950/60 backdrop-blur-lg border-b border-slate-800/50">
      <div className="container mx-auto flex items-center justify-between">
        <div title="utrend: Your AI-powered content suite for creators">
            <UtrendLogo className="h-10" />
        </div>

        {user && (
          <div className="flex items-center gap-4">
             <div className="hidden sm:flex items-center gap-3">
                <span className={`inline-block font-bold text-xs px-2.5 py-1 rounded-full ${getPlanStyles()}`}>
                    {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
                </span>
            </div>
             {user.plan !== 'pro' && (
              <button
                onClick={() => setActiveTab(Tab.Pricing)}
                className="flex items-center gap-2 bg-yellow-400/10 hover:bg-yellow-400/20 border border-yellow-400/20 text-yellow-300 font-semibold text-sm px-4 py-2 rounded-full transition-all duration-300 shadow-md hover:shadow-yellow-400/20"
              >
                <Star className="w-4 h-4" />
                Upgrade
              </button>
            )}
            <div className="relative" ref={menuRef}>
                <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-2 rounded-full text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors"
                    title="Open user menu"
                >
                    <UserIcon className="w-5 h-5" />
                    <ChevronDown className={`w-4 h-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 origin-top-right bg-slate-800/80 backdrop-blur-lg border border-slate-700 rounded-lg shadow-2xl z-50 animate-fade-in">
                        <div className="py-1">
                            <div className="px-4 py-2 border-b border-slate-700">
                                <p className="text-sm text-slate-400">Signed in as</p>
                                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                            </div>
                            <div className="py-1">
                                {userMenuTabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => {
                                            setActiveTab(tab.id);
                                            setIsUserMenuOpen(false);
                                        }}
                                        className="w-full text-left flex items-center px-4 py-2 text-sm text-slate-300 hover:bg-violet-500/50 hover:text-white transition-colors"
                                    >
                                        {tab.icon}
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                            <div className="py-1 border-t border-slate-700">
                                <button
                                    onClick={logout}
                                    className="w-full text-left flex items-center px-4 py-2 text-sm text-red-400 hover:bg-red-500/50 hover:text-white transition-colors"
                                    title="Logout"
                                >
                                    <LogOut className="w-5 h-5 mr-2" />
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
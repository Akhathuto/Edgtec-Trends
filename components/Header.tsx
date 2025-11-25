import React, { useState, useRef, useEffect } from 'react';
import { UtrendLogo } from './Logo';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Star, User as UserIcon, ChevronDown, Mic } from './Icons';
import { Tab } from '../types';

interface NavItem {
  id: Tab;
  label: string;
  icon: React.ReactNode;
  title: string;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

interface HeaderProps {
  setActiveTab: (tab: Tab) => void;
  navStructure: NavSection[];
  userMenuTabs: NavItem[];
}

const NavDropdown: React.FC<{
  label: string;
  items: NavItem[];
  setActiveTab: (tab: Tab) => void;
  userPlan: string;
}> = ({ label, items, setActiveTab, userPlan }) => {
  const [isOpen, setIsOpen] = useState(false);
  const proTabs: Tab[] = [
    Tab.Chat, Tab.Agents, Tab.AIVoiceCoPilot, Tab.Analytics, Tab.Report, Tab.ChannelGrowth, Tab.BrandConnect,
    Tab.Video, Tab.AnimationCreator, Tab.GifCreator, Tab.ImageEditor, Tab.LogoCreator,
    Tab.ImageGenerator, Tab.AvatarCreator, Tab.VideoEditor
  ];

  return (
    <div className="relative" onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
      <button className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors rounded-md">
        {label}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute top-full mt-2 w-72 origin-top-left bg-slate-900/80 backdrop-blur-lg border border-slate-700 rounded-lg shadow-2xl z-50 animate-fade-in p-2">
          <div className="grid grid-cols-1 gap-1">
            {items.map(item => {
              const isPro = proTabs.includes(item.id);
              const isDisabled = isPro && userPlan !== 'pro';
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(isDisabled ? Tab.Pricing : item.id);
                    setIsOpen(false);
                  }}
                  className="w-full text-left flex items-center p-3 text-sm rounded-md text-slate-300 hover:bg-violet-500/30 hover:text-white transition-colors"
                  title={isDisabled ? `${item.title} (Pro Feature)` : item.title}
                >
                  <div className="w-8 h-8 flex items-center justify-center mr-3 bg-slate-700/50 rounded-lg">{item.icon}</div>
                  <span className="flex-grow">{item.label}</span>
                  {isDisabled && (
                    <span className="ml-2 flex items-center gap-1 text-xs font-bold bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 px-1.5 py-0.5 rounded-full">
                      <Star className="w-3 h-3" /> PRO
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const Header: React.FC<HeaderProps> = ({ setActiveTab, navStructure, userMenuTabs }) => {
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
    <header className="sticky top-0 z-30 py-3 px-4 sm:px-6 bg-slate-950/70 backdrop-blur-lg border-b border-slate-800/50">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button onClick={() => setActiveTab(Tab.Dashboard)} title="utrend: Your AI-powered content suite for creators">
              <UtrendLogo className="h-8" />
          </button>
          <nav className="hidden lg:flex items-center gap-2">
            <button 
              onClick={() => setActiveTab(Tab.Dashboard)}
              className="px-3 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors rounded-md"
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab(Tab.Affiliate)}
              className="px-3 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors rounded-md"
            >
              Affiliate Program
            </button>
            {navStructure.map(section => (
              <NavDropdown 
                key={section.label}
                label={section.label}
                items={section.items}
                setActiveTab={setActiveTab}
                userPlan={user!.plan}
              />
            ))}
          </nav>
        </div>

        {user && (
          <div className="flex items-center gap-4">
            {user.plan === 'pro' && (
                 <button
                    onClick={() => setActiveTab(Tab.AIVoiceCoPilot)}
                    className="hidden lg:flex items-center gap-2 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 text-teal-300 font-semibold text-sm px-4 py-2 rounded-full transition-all duration-300 animate-glow-pulse"
                    title="Start a real-time voice conversation with your AI Co-Pilot (Pro Feature)"
                  >
                    <Mic className="w-4 h-4" />
                    AI Voice Co-Pilot
                </button>
            )}
            <div className="hidden sm:flex items-center gap-3">
                <span className={`inline-block font-bold text-xs px-2.5 py-1 rounded-full ${getPlanStyles()}`}>
                    {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
                </span>
            </div>
             {user.plan !== 'pro' && (
              <button
                onClick={() => setActiveTab(Tab.Pricing)}
                className="flex items-center gap-2 bg-yellow-400/10 hover:bg-yellow-400/20 border border-yellow-400/20 text-yellow-300 font-semibold text-sm px-4 py-2 rounded-full transition-all duration-300 shadow-md hover:shadow-yellow-400/20"
                title="Upgrade your plan to unlock more features"
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
                    <div className="absolute right-0 mt-2 w-56 origin-top-right bg-slate-900/80 backdrop-blur-lg border border-slate-700 rounded-lg shadow-2xl z-50 animate-fade-in">
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
                                        className="w-full text-left flex items-center px-4 py-2 text-sm text-slate-300 hover:bg-violet-500/30 hover:text-white transition-colors"
                                        title={tab.title}
                                    >
                                        {tab.icon}
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                            <div className="py-1 border-t border-slate-700">
                                <button
                                    onClick={logout}
                                    className="w-full text-left flex items-center px-4 py-2 text-sm text-red-400 hover:bg-red-500/30 hover:text-white transition-colors"
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
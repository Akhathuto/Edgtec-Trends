import React, { useState } from 'react';
import { ToolId } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { 
  User, 
  Bell, 
  Globe, 
  Lock, 
  Link as LinkIcon, 
  Trash2, 
  Info, 
  CreditCard,
  Moon,
  Sun,
  ChevronRight,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';

interface SettingsProps {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  onNavigate: (toolId: ToolId, state?: any) => void;
}

export const Settings: React.FC<SettingsProps> = ({ theme, setTheme, onNavigate }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    marketing: false
  });

  const handleToggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    showToast(`${key.charAt(0).toUpperCase() + key.slice(1)} notifications updated.`);
  };

  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure you want to delete your account? This action is irreversible and all your content will be lost.")) {
      showToast("Account deletion request submitted. Our team will contact you shortly.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-slide-in-up">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Settings</h2>
          <p className="text-slate-400">Manage your account preferences and platform settings.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-violet-500/10 border border-violet-500/20 rounded-full">
          <ShieldCheck className="w-4 h-4 text-violet-400" />
          <span className="text-xs font-medium text-violet-300 uppercase tracking-wider">Secure Session</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar Navigation for Settings (Optional, but let's use sections) */}
        <div className="md:col-span-1 space-y-2">
          <nav className="space-y-1">
            {['Account', 'Preferences', 'Security', 'Integrations', 'Danger Zone', 'About'].map((section) => (
              <a
                key={section}
                href={`#${section.toLowerCase().replace(' ', '-')}`}
                className="flex items-center justify-between px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              >
                {section}
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100" />
              </a>
            ))}
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Account Section */}
          <section id="account" className="bg-brand-glass border border-slate-700/50 rounded-xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-slate-700/50 flex items-center gap-3">
              <User className="w-5 h-5 text-violet-400" />
              <h3 className="text-lg font-bold text-white">Account</h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">{user?.name || 'User Name'}</p>
                  <p className="text-xs text-slate-400">{user?.email || 'user@example.com'}</p>
                </div>
                <button 
                  onClick={() => onNavigate('profile')}
                  className="text-xs font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1"
                >
                  Edit Profile <ExternalLink className="w-3 h-3" />
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-800/40 rounded-lg border border-slate-700/50">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-white">Current Plan</p>
                    <p className="text-xs text-slate-400 capitalize">{user?.plan || 'Free'} Plan</p>
                  </div>
                </div>
                <button 
                  onClick={() => onNavigate('pricing')}
                  className="button-primary py-1.5 px-4 text-xs"
                >
                  Upgrade
                </button>
              </div>
            </div>
          </section>

          {/* Preferences Section */}
          <section id="preferences" className="bg-brand-glass border border-slate-700/50 rounded-xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-slate-700/50 flex items-center gap-3">
              <Globe className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-bold text-white">Preferences</h3>
            </div>
            <div className="p-6 space-y-6">
              {/* Theme Toggle */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">Interface Theme</label>
                <div className="flex p-1 bg-slate-800/60 rounded-lg border border-slate-700/50 w-fit">
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      theme === 'light' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Sun className="w-4 h-4" /> Light
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      theme === 'dark' ? 'bg-violet-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Moon className="w-4 h-4" /> Dark
                  </button>
                </div>
              </div>

              {/* Language Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Display Language</label>
                <select className="form-input w-full max-w-xs bg-slate-800/50">
                  <option value="en">English (US)</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>

              {/* Notifications */}
              <div className="space-y-4 pt-4 border-t border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-white">Email Notifications</p>
                      <p className="text-xs text-slate-400">Receive weekly reports and trend alerts.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleToggleNotification('email')}
                    className={`w-10 h-5 rounded-full transition-colors relative ${notifications.email ? 'bg-violet-600' : 'bg-slate-700'}`}
                  >
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${notifications.email ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Security Section */}
          <section id="security" className="bg-brand-glass border border-slate-700/50 rounded-xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-slate-700/50 flex items-center gap-3">
              <Lock className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-bold text-white">Security</h3>
            </div>
            <div className="p-6 space-y-4">
              <button className="w-full text-left p-4 bg-slate-800/40 rounded-lg border border-slate-700/50 hover:bg-slate-800/60 transition-colors flex items-center justify-between group">
                <div>
                  <p className="text-sm font-medium text-white">Change Password</p>
                  <p className="text-xs text-slate-400">Update your account password regularly.</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
              </button>
              <button className="w-full text-left p-4 bg-slate-800/40 rounded-lg border border-slate-700/50 hover:bg-slate-800/60 transition-colors flex items-center justify-between group">
                <div>
                  <p className="text-sm font-medium text-white">Two-Factor Authentication</p>
                  <p className="text-xs text-slate-400">Add an extra layer of security to your account.</p>
                </div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Disabled</span>
              </button>
            </div>
          </section>

          {/* Integrations Section */}
          <section id="integrations" className="bg-brand-glass border border-slate-700/50 rounded-xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-slate-700/50 flex items-center gap-3">
              <LinkIcon className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-bold text-white">Integrations</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-400 mb-4">Manage your connected social media channels and external tools.</p>
              <button 
                onClick={() => onNavigate('profile')}
                className="button-secondary w-full flex items-center justify-center gap-2"
              >
                Manage Connected Channels <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </section>

          {/* Danger Zone */}
          <section id="danger-zone" className="bg-red-500/5 border border-red-500/20 rounded-xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-red-500/20 flex items-center gap-3">
              <Trash2 className="w-5 h-5 text-red-500" />
              <h3 className="text-lg font-bold text-red-500">Danger Zone</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-400 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
              <button 
                onClick={handleDeleteAccount}
                className="px-4 py-2 bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg text-sm font-bold hover:bg-red-500 hover:text-white transition-all"
              >
                Delete Account
              </button>
            </div>
          </section>

          {/* About Section */}
          <section id="about" className="text-center py-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-slate-800 rounded-full border border-slate-700">
                <Info className="w-6 h-6 text-slate-400" />
              </div>
            </div>
            <p className="text-sm font-bold text-white">uTrends v1.4.2</p>
            <p className="text-xs text-slate-500 mt-1">© 2026 uTrends AI. All rights reserved.</p>
            <div className="flex justify-center gap-4 mt-4">
              <button className="text-xs text-violet-400 hover:underline">Terms of Service</button>
              <button className="text-xs text-violet-400 hover:underline">Privacy Policy</button>
              <button className="text-xs text-violet-400 hover:underline">Cookie Policy</button>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

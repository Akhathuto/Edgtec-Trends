import React from 'react';
import { UtrendLogo } from './Logo';
import { useAuth } from '../contexts/AuthContext';

export const LandingPage: React.FC = () => {
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center space-y-8 animate-fade-in">
        <div className="flex justify-center">
          <UtrendLogo className="h-24 w-24" />
        </div>
        <h1 className="text-6xl font-extrabold tracking-tight text-glow">
          utrend
        </h1>
        <p className="text-2xl text-slate-400 max-w-2xl mx-auto">
          The ultimate AI-powered content suite for modern creators. 
          Grow your channel, repurpose content, and monetize your influence.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <button 
            onClick={() => window.location.href = '/login'}
            className="px-8 py-4 bg-violet-600 hover:bg-violet-500 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-lg shadow-violet-900/40"
          >
            Get Started for Free
          </button>
          <button className="px-8 py-4 bg-slate-800 hover:bg-slate-700 rounded-full font-bold text-lg transition-all">
            Watch Demo
          </button>
        </div>
        <div className="pt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800">
            <h3 className="text-xl font-bold mb-2 text-violet-400">AI Content Repurposing</h3>
            <p className="text-slate-400">Turn one video into 10+ pieces of content for all platforms instantly.</p>
          </div>
          <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800">
            <h3 className="text-xl font-bold mb-2 text-cyan-400">Growth Planner</h3>
            <p className="text-slate-400">Data-driven strategies to explode your reach on YouTube and TikTok.</p>
          </div>
          <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800">
            <h3 className="text-xl font-bold mb-2 text-teal-400">Monetization Suite</h3>
            <p className="text-slate-400">Connect with brands and unlock new revenue streams for your channel.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

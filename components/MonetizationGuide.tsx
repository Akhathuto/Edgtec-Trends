import React, { useState, useEffect, useCallback } from 'react';
import { getMonetizationStrategies } from '../services/geminiService';
import { MonetizationStrategy, Platform } from '../types';
import Spinner from './Spinner';
import { Youtube, Film, DollarSign, Users, Target, CheckCircle, TikTok } from './Icons';
import * as Icons from './Icons';

const MonetizationGuide: React.FC = () => {
  const [platform, setPlatform] = useState<Platform>('YouTube');
  const [followers, setFollowers] = useState(1000);
  const [debouncedFollowers, setDebouncedFollowers] = useState(followers);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [strategies, setStrategies] = useState<MonetizationStrategy[]>([]);

  // Debounce follower input to prevent excessive API calls
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFollowers(followers);
    }, 500); // 500ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [followers]);

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getMonetizationStrategies(platform, debouncedFollowers);
      setStrategies(result);
    } catch (e: any) {
      setError(e.message || 'An error occurred while fetching strategies.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [platform, debouncedFollowers]);

  useEffect(() => {
    handleGenerate();
  }, [handleGenerate]);

  const formatFollowers = (num: number) => {
      if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
      if (num >= 1000) return `${(num/1000).toFixed(0)}K`;
      return num;
  }

  return (
    <div className="animate-slide-in-up">
      <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl">
        <h2 className="text-2xl font-bold text-center mb-1 text-slate-100">Unlock Your Earnings</h2>
        <p className="text-center text-slate-400 mb-6">Get personalized monetization strategies based on your channel size.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div>
            <label className="font-semibold text-slate-300 mb-2 block">Platform</label>
            <div className="segmented-control overflow-x-auto pb-2">
              <button onClick={() => setPlatform('YouTube')} title="Get monetization strategies for YouTube" className={platform === 'YouTube' ? 'active' : ''}>
                <Youtube className="w-5 h-5"/> YouTube
              </button>
              <button onClick={() => setPlatform('TikTok')} title="Get monetization strategies for TikTok" className={platform === 'TikTok' ? 'active' : ''}>
                <TikTok className="w-5 h-5"/> TikTok
              </button>
              <button onClick={() => setPlatform('Instagram')} title="Get monetization strategies for Instagram" className={platform === 'Instagram' ? 'active' : ''}>
                <Icons.Instagram className="w-5 h-5"/> Instagram
              </button>
              <button onClick={() => setPlatform('Facebook')} title="Get monetization strategies for Facebook" className={platform === 'Facebook' ? 'active' : ''}>
                <Icons.Facebook className="w-5 h-5"/> Facebook
              </button>
              <button onClick={() => setPlatform('Twitch')} title="Get monetization strategies for Twitch" className={platform === 'Twitch' ? 'active' : ''}>
                <Icons.Twitch className="w-5 h-5"/> Twitch
              </button>
              <button onClick={() => setPlatform('LinkedIn')} title="Get monetization strategies for LinkedIn" className={platform === 'LinkedIn' ? 'active' : ''}>
                <Icons.LinkedIn className="w-5 h-5"/> LinkedIn
              </button>
              <button onClick={() => setPlatform('X')} title="Get monetization strategies for X" className={platform === 'X' ? 'active' : ''}>
                <Icons.Twitter className="w-5 h-5"/> X
              </button>
              <button onClick={() => setPlatform('Pinterest')} title="Get monetization strategies for Pinterest" className={platform === 'Pinterest' ? 'active' : ''}>
                <Icons.Pinterest className="w-5 h-5"/> Pinterest
              </button>
              <button onClick={() => setPlatform('Snapchat')} title="Get monetization strategies for Snapchat" className={platform === 'Snapchat' ? 'active' : ''}>
                <Icons.Snapchat className="w-5 h-5"/> Snapchat
              </button>
              <button onClick={() => setPlatform('Reddit')} title="Get monetization strategies for Reddit" className={platform === 'Reddit' ? 'active' : ''}>
                <Icons.Reddit className="w-5 h-5"/> Reddit
              </button>
              <button onClick={() => setPlatform('Threads')} title="Get monetization strategies for Threads" className={platform === 'Threads' ? 'active' : ''}>
                <Icons.Threads className="w-5 h-5"/> Threads
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="followers" className="font-semibold text-slate-300 mb-2 block flex justify-between">
              Followers <span>{formatFollowers(followers)}</span>
            </label>
            <input
              id="followers"
              type="range"
              min="0"
              max="5000000"
              step="1000"
              value={followers}
              onChange={(e) => setFollowers(Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet"
              title="Adjust the slider to your current number of followers."
            />
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-center py-10">
          <Spinner size="lg" />
          <p className="mt-4 text-slate-300">Calculating your monetization potential...</p>
        </div>
      )}

      {error && !loading && <p className="text-red-400 mt-6 text-center">{error}</p>}
      
      {strategies.length > 0 && !loading && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          {strategies.map((strategy, index) => (
            <div key={index} className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-violet-500 hover:shadow-glow-md hover:-translate-y-1">
              <h3 className="text-xl font-bold text-violet-300 mb-3 flex items-center"><DollarSign className="w-6 h-6 mr-2"/> {strategy.strategy}</h3>
              <p className="text-slate-300 mb-4">{strategy.description}</p>
              <div className="space-y-3 text-sm">
                <div className="flex items-start">
                    <Target className="w-5 h-5 mr-3 mt-0.5 text-slate-400 flex-shrink-0"/>
                    <div><strong className="text-slate-200">Requirements:</strong> {strategy.requirements}</div>
                </div>
                <div className="flex items-start">
                    <Users className="w-5 h-5 mr-3 mt-0.5 text-slate-400 flex-shrink-0"/>
                    <div><strong className="text-slate-200">Potential:</strong> {strategy.potential}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MonetizationGuide;
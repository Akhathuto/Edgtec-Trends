import React, { useState, useEffect, useCallback } from 'react';
import { getMonetizationStrategies } from '../services/geminiService';
import { MonetizationStrategy } from '../types';
import Spinner from './Spinner';
import { Youtube, Film, DollarSign, Users, Target, CheckCircle, TikTok } from './Icons';

const MonetizationGuide: React.FC = () => {
  const [platform, setPlatform] = useState<'YouTube' | 'TikTok'>('YouTube');
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
            <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
              <button onClick={() => setPlatform('YouTube')} title="Get monetization strategies for YouTube" className={`w-1/2 flex items-center justify-center gap-2 py-2 rounded-md transition-colors ${platform === 'YouTube' ? 'bg-violet' : 'hover:bg-slate-700 text-slate-300 hover:text-white'}`}>
                <Youtube className="w-5 h-5"/> YouTube
              </button>
              <button onClick={() => setPlatform('TikTok')} title="Get monetization strategies for TikTok" className={`w-1/2 flex items-center justify-center gap-2 py-2 rounded-md transition-colors ${platform === 'TikTok' ? 'bg-violet' : 'hover:bg-slate-700 text-slate-300 hover:text-white'}`}>
                <TikTok className="w-5 h-5"/> TikTok
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
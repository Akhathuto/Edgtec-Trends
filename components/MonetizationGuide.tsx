
import React, { useState, useEffect } from 'react';
import { getMonetizationStrategies } from '../services/geminiService';
import { MonetizationStrategy } from '../types';
import Spinner from './Spinner';
import { Youtube, Film, DollarSign, Users, Target, CheckCircle } from './Icons';

const MonetizationGuide: React.FC = () => {
  const [platform, setPlatform] = useState<'YouTube' | 'TikTok'>('YouTube');
  const [followers, setFollowers] = useState(1000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [strategies, setStrategies] = useState<MonetizationStrategy[]>([]);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setStrategies([]);
    try {
      const result = await getMonetizationStrategies(platform, followers);
      setStrategies(result);
    } catch (e) {
      setError('An error occurred while fetching strategies. Please try again.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platform, followers]);

  const formatFollowers = (num: number) => {
      if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
      if (num >= 1000) return `${(num/1000).toFixed(0)}K`;
      return num;
  }

  return (
    <div className="animate-slide-in-up">
      <div className="bg-dark-card border border-gray-700 rounded-xl p-6 shadow-2xl backdrop-blur-xl">
        <h2 className="text-2xl font-bold text-center mb-1 text-gray-100">Unlock Your Earnings</h2>
        <p className="text-center text-gray-400 mb-6">Get personalized monetization strategies based on your channel size.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div>
            <label className="font-semibold text-gray-300 mb-2 block">Platform</label>
            <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-600">
              <button onClick={() => setPlatform('YouTube')} title="Get monetization strategies for YouTube" className={`w-1/2 flex items-center justify-center gap-2 py-2 rounded-md transition-colors ${platform === 'YouTube' ? 'bg-brand-purple' : 'hover:bg-gray-700'}`}>
                <Youtube className="w-5 h-5"/> YouTube
              </button>
              <button onClick={() => setPlatform('TikTok')} title="Get monetization strategies for TikTok" className={`w-1/2 flex items-center justify-center gap-2 py-2 rounded-md transition-colors ${platform === 'TikTok' ? 'bg-brand-purple' : 'hover:bg-gray-700'}`}>
                <Film className="w-5 h-5"/> TikTok
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="followers" className="font-semibold text-gray-300 mb-2 block flex justify-between">
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
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-brand-purple"
              title="Adjust the slider to your current number of followers."
            />
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-center py-10">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-300">Calculating your monetization potential...</p>
        </div>
      )}

      {error && !loading && <p className="text-red-400 mt-6 text-center">{error}</p>}
      
      {strategies.length > 0 && !loading && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          {strategies.map((strategy, index) => (
            <div key={index} className="bg-dark-card border border-gray-700 rounded-xl p-6 shadow-2xl backdrop-blur-xl">
              <h3 className="text-xl font-bold text-purple-300 mb-3 flex items-center"><DollarSign className="w-6 h-6 mr-2"/> {strategy.strategy}</h3>
              <p className="text-gray-300 mb-4">{strategy.description}</p>
              <div className="space-y-3 text-sm">
                <div className="flex items-start">
                    <Target className="w-5 h-5 mr-3 mt-0.5 text-gray-400 flex-shrink-0"/>
                    <div><strong className="text-gray-200">Requirements:</strong> {strategy.requirements}</div>
                </div>
                <div className="flex items-start">
                    <Users className="w-5 h-5 mr-3 mt-0.5 text-gray-400 flex-shrink-0"/>
                    <div><strong className="text-gray-200">Potential:</strong> {strategy.potential}</div>
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
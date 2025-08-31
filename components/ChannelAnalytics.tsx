import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getChannelAnalytics } from '../services/geminiService';
import { ChannelAnalyticsData, Tab } from '../types';
import Spinner from './Spinner';
import { Star, Link, BarChart2, TrendingUp, TrendingDown, Users, Eye, ExternalLink, Youtube, Info } from './Icons';

interface ChannelAnalyticsProps {
  setActiveTab: (tab: Tab) => void;
}

const ChannelAnalytics: React.FC<ChannelAnalyticsProps> = ({ setActiveTab }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ChannelAnalyticsData | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (user?.plan === 'pro' && user.youtubeChannelUrl) {
      setLoading(true);
      setError(null);
      try {
        const result = await getChannelAnalytics(user.youtubeChannelUrl);
        setData(result);
      } catch (e: any) {
        setError(e.message || 'Failed to load channel analytics.');
      } finally {
        setLoading(false);
      }
    } else {
        setLoading(false);
    }
  }, [user?.plan, user?.youtubeChannelUrl]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);
  
  const renderTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    const iconWrapperBase = "w-8 h-8 rounded-full flex items-center justify-center";
    const iconBase = "w-5 h-5";

    switch (trend) {
        case 'up': return (
            <div className={`${iconWrapperBase} bg-green-500/10`}>
                <TrendingUp className={`${iconBase} text-green-400`} />
            </div>
        );
        case 'down': return (
            <div className={`${iconWrapperBase} bg-red-500/10`}>
                <TrendingDown className={`${iconBase} text-red-400`} />
            </div>
        );
        case 'stable': return (
             <div className={`${iconWrapperBase} bg-slate-700/50`}>
                <span className="text-xl font-bold text-slate-400 leading-none">-</span>
             </div>
        );
    }
  };

  if (user?.plan !== 'pro') {
    return (
      <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-8 shadow-xl backdrop-blur-xl text-center flex flex-col items-center animate-slide-in-up">
        <Star className="w-12 h-12 text-yellow-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Upgrade to Pro for Live Analytics</h2>
        <p className="text-slate-400 mb-6 max-w-md">Get real-time, AI-powered insights for your YouTube channel. Upgrade to unlock this feature.</p>
        <button
          onClick={() => setActiveTab(Tab.Pricing)}
          className="flex items-center gap-2 bg-gradient-to-r from-violet-dark to-violet-light text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity shadow-md hover:shadow-lg hover:shadow-violet/30"
        >
          View Plans
        </button>
      </div>
    );
  }
  
  if (!user.youtubeChannelUrl) {
      return (
         <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-8 shadow-xl backdrop-blur-xl text-center flex flex-col items-center animate-slide-in-up">
            <Link className="w-12 h-12 text-violet-400 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Connect Your YouTube Channel</h2>
            <p className="text-slate-400 mb-6 max-w-md">To view live analytics, please add your YouTube channel URL to your profile.</p>
            <button
              onClick={() => setActiveTab(Tab.Profile)}
              className="flex items-center gap-2 bg-gradient-to-r from-violet-dark to-violet-light text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity shadow-md hover:shadow-lg hover:shadow-violet/30"
            >
              Go to Profile
            </button>
        </div>
      )
  }

  if (loading) {
      return (
        <div className="text-center py-10">
            <Spinner size="lg" />
            <p className="mt-4 text-slate-300">Fetching live analytics for your channel...</p>
        </div>
      )
  }

  if (error) {
    return <p className="text-center text-red-400 bg-red-500/10 p-4 rounded-lg">{error}</p>;
  }
  
  if (!data) {
      return <p className="text-center text-slate-400">No analytics data found.</p>
  }

  return (
    <div className="animate-slide-in-up space-y-8">
        <div className="text-center">
            <h2 className="text-3xl font-bold">{data.channelName}</h2>
             <div className="flex items-center justify-center gap-2 mt-1">
                <p className="text-slate-400">Live AI-Powered Analytics</p>
                <div className="relative group flex items-center">
                    <Info className="w-4 h-4 text-slate-500 cursor-pointer" />
                    <div className="absolute bottom-full mb-2 w-64 bg-slate-900 text-slate-300 text-xs rounded-lg py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-lg border border-slate-700 z-10">
                        Data is based on AI analysis of publicly available information and may take a few minutes to update after initial load.
                    </div>
                </div>
            </div>
        </div>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl">
                <h3 className="flex items-center gap-2 font-bold text-lg text-slate-200 mb-2"><Users className="w-5 h-5 text-violet-400" /> Subscribers</h3>
                <div className="flex items-center gap-4">
                    <p className="text-5xl font-bold">{data.subscriberCount}</p>
                    {renderTrendIcon(data.subscriberTrend)}
                </div>
            </div>
             <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl">
                <h3 className="flex items-center gap-2 font-bold text-lg text-slate-200 mb-2"><Eye className="w-5 h-5 text-violet-400" /> Total Views</h3>
                 <div className="flex items-center gap-4">
                    <p className="text-5xl font-bold">{data.totalViews}</p>
                     {renderTrendIcon(data.viewsTrend)}
                </div>
            </div>
        </div>
        
        {/* AI Summary */}
        <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl">
            <h3 className="flex items-center gap-2 font-bold text-lg text-slate-200 mb-2"><BarChart2 className="w-5 h-5 text-violet-400" /> AI Performance Summary</h3>
            <p className="text-slate-300 leading-relaxed">{data.aiSummary}</p>
        </div>
        
         {/* Recent Videos */}
        <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl">
            <h3 className="flex items-center gap-2 font-bold text-lg text-slate-200 mb-4"><Youtube className="w-5 h-5 text-violet-400" /> Recent Videos</h3>
            <div className="space-y-3">
              {data.recentVideos.map((video, index) => (
                <div key={index} className="bg-slate-800/50 p-3 rounded-lg flex justify-between items-center border border-slate-700/80">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-100 truncate" title={video.title}>{video.title}</p>
                    <p className="text-xs text-slate-400">{video.viewCount} views</p>
                  </div>
                  <a href={video.videoUrl} target="_blank" rel="noopener noreferrer" className="ml-4 p-2 rounded-full hover:bg-slate-700 transition-colors" title="Watch on YouTube">
                     <ExternalLink className="w-5 h-5 text-slate-400"/>
                  </a>
                </div>
              ))}
            </div>
        </div>
    </div>
  );
};

export default ChannelAnalytics;


import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { getChannelAnalytics, generateChannelOpportunities } from '../services/geminiService.ts';
import { ChannelAnalyticsData, Tab, Channel } from '../types.ts';
import Spinner from './Spinner.tsx';
import { Star, Link, BarChart2, TrendingUp, TrendingDown, Users, Eye, ExternalLink, Youtube, Info, Heart, TikTok, Sparkles, Search, X } from './Icons.tsx';

interface ChannelAnalyticsProps {
  setActiveTab: (tab: Tab) => void;
  activeChannelIdProp: string | null;
  setActiveChannelId: (id: string | null) => void;
}

const renderTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    const iconWrapperBase = "w-8 h-8 rounded-full flex items-center justify-center";
    const iconBase = "w-5 h-5";

    switch (trend) {
      case 'up': return (
        <div className={`${iconWrapperBase} bg-green-500/10`}><TrendingUp className={`${iconBase} text-green-400`} /></div>
      );
      case 'down': return (
        <div className={`${iconWrapperBase} bg-red-500/10`}><TrendingDown className={`${iconBase} text-red-400`} /></div>
      );
      case 'stable': return (
        <div className={`${iconWrapperBase} bg-slate-700/50`}><span className="text-xl font-bold text-slate-400 leading-none">-</span></div>
      );
    }
};

const AnalyticsContent: React.FC<{ data: ChannelAnalyticsData; opportunities: string[]; opportunitiesLoading: boolean; }> = ({ data, opportunities, opportunitiesLoading }) => (
    <div className="space-y-8 animate-fade-in">
        <div className="text-center">
        <h2 className="text-3xl font-bold">{data.channelName}</h2>
        <div className="flex items-center justify-center gap-2 mt-1">
            <p className="text-slate-400">Live AI-Powered {data.platform} Analytics</p>
            <div className="relative group flex items-center">
            <Info className="w-4 h-4 text-slate-500 cursor-pointer" />
            <div className="absolute bottom-full mb-2 w-64 bg-slate-900 text-slate-300 text-xs rounded-lg py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-lg border border-slate-700 z-10">
                Data is based on AI analysis of publicly available information and may not reflect private analytics.
            </div>
            </div>
        </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl">
            <h3 className="flex items-center gap-2 font-bold text-lg text-slate-200 mb-2"><Users className="w-5 h-5 text-violet-400" /> {data.platform === 'YouTube' ? 'Subscribers' : 'Followers'}</h3>
            <div className="flex items-center gap-4">
            <p className="text-4xl font-bold">{data.followerCount}</p>
            {renderTrendIcon(data.followerTrend)}
            </div>
        </div>
        <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl">
            <h3 className="flex items-center gap-2 font-bold text-lg text-slate-200 mb-2"><Eye className="w-5 h-5 text-violet-400" /> Total Views</h3>
            <div className="flex items-center gap-4">
            <p className="text-4xl font-bold">{data.totalViews}</p>
            {renderTrendIcon(data.viewsTrend)}
            </div>
        </div>
        {data.platform === 'TikTok' && data.totalLikes && (
            <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl">
            <h3 className="flex items-center gap-2 font-bold text-lg text-slate-200 mb-2"><Heart className="w-5 h-5 text-violet-400" /> Total Likes</h3>
            <div className="flex items-center gap-4">
                <p className="text-4xl font-bold">{data.totalLikes}</p>
            </div>
            </div>
        )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl">
                <h3 className="flex items-center gap-2 font-bold text-lg text-slate-200 mb-2"><BarChart2 className="w-5 h-5 text-violet-400" /> AI Performance Summary</h3>
                <p className="text-slate-300 leading-relaxed">{data.aiSummary}</p>
            </div>
             <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl">
                <h3 className="flex items-center gap-2 font-bold text-lg text-slate-200 mb-2"><Sparkles className="w-5 h-5 text-violet-400" /> AI-Powered Opportunities</h3>
                {opportunitiesLoading ? (
                    <div className="flex justify-center items-center h-full"><Spinner /></div>
                ) : opportunities.length > 0 ? (
                    <ul className="space-y-2">
                        {opportunities.map((opp, index) => (
                            <li key={index} className="flex items-start text-sm">
                                <Sparkles className="w-4 h-4 mr-2 mt-0.5 text-yellow-300 flex-shrink-0" />
                                <span className="text-slate-300">{opp}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-slate-500 text-sm">No specific opportunities identified at this time.</p>
                )}
            </div>
        </div>

        {data.platform === 'YouTube' && data.recentVideos && data.recentVideos.length > 0 && (
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
                    <ExternalLink className="w-5 h-5 text-slate-400" />
                </a>
                </div>
            ))}
            </div>
        </div>
        )}
    </div>
);


const ChannelAnalytics: React.FC<ChannelAnalyticsProps> = ({ setActiveTab, activeChannelIdProp, setActiveChannelId }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ChannelAnalyticsData | null>(null);
  
  // Competitor state
  const [competitorUrl, setCompetitorUrl] = useState('');
  const [competitorData, setCompetitorData] = useState<ChannelAnalyticsData | null>(null);
  const [competitorLoading, setCompetitorLoading] = useState(false);
  const [competitorError, setCompetitorError] = useState<string | null>(null);
  
  // Opportunities state
  const [opportunities, setOpportunities] = useState<string[]>([]);
  const [opportunitiesLoading, setOpportunitiesLoading] = useState(false);
  
  const fetchAnalytics = useCallback(async (channel: Channel) => {
    if (user?.plan === 'pro') {
      // FIX: Ensure platform is compatible before making API calls.
      if (channel.platform !== 'YouTube' && channel.platform !== 'TikTok') {
        setError(`Analytics for "${channel.platform}" channels is not supported.`);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      setData(null);
      setOpportunities([]);
      try {
        setOpportunitiesLoading(true);
        const [analyticsResult, opportunitiesResult] = await Promise.all([
          getChannelAnalytics(channel.url, channel.platform),
          generateChannelOpportunities(channel.url, channel.platform)
        ]);
        setData(analyticsResult);
        setOpportunities(opportunitiesResult);
      } catch (e: any) {
        setError(e.message || `Failed to load analytics for ${channel.url}.`);
      } finally {
        setLoading(false);
        setOpportunitiesLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [user?.plan]);

  useEffect(() => {
    if (activeChannelIdProp && user?.channels) {
      const activeChannel = user.channels.find(c => c.id === activeChannelIdProp);
      if (activeChannel) {
        fetchAnalytics(activeChannel);
      }
    } else if (!user?.channels || user.channels.length === 0) {
      setLoading(false);
    }
  }, [activeChannelIdProp, user?.channels, fetchAnalytics]);

  const handleAnalyzeCompetitor = async () => {
    if (!competitorUrl.trim().toLowerCase().startsWith('http')) {
        setCompetitorError('Please enter a valid channel URL (e.g., https://...).');
        return;
    }
    setCompetitorLoading(true);
    setCompetitorError(null);
    setCompetitorData(null);
    setOpportunities([]);

    const platform = competitorUrl.includes('tiktok.com') ? 'TikTok' : 'YouTube';

    try {
        setOpportunitiesLoading(true);
        const [analyticsResult, opportunitiesResult] = await Promise.all([
            getChannelAnalytics(competitorUrl, platform),
            generateChannelOpportunities(competitorUrl, platform)
        ]);
        setCompetitorData(analyticsResult);
        setOpportunities(opportunitiesResult);
    } catch (e: any) {
        setCompetitorError(e.message || `Failed to analyze competitor channel.`);
    } finally {
        setCompetitorLoading(false);
        setOpportunitiesLoading(false);
    }
  };
  
  const handleClearCompetitor = () => {
    setCompetitorUrl('');
    setCompetitorData(null);
    setCompetitorError(null);
    setOpportunities([]);
  };

  const compatibleChannels = user?.channels?.filter(c => c.platform === 'YouTube' || c.platform === 'TikTok') || [];

  if (user?.plan !== 'pro') {
    return (
      <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-8 shadow-xl backdrop-blur-xl text-center flex flex-col items-center animate-slide-in-up">
        <Star className="w-12 h-12 text-yellow-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Upgrade to Pro for Live Analytics</h2>
        <p className="text-slate-400 mb-6 max-w-md">Get real-time, AI-powered insights for your channels and analyze competitors. Upgrade to unlock this feature.</p>
        <button onClick={() => setActiveTab(Tab.Pricing)} className="flex items-center gap-2 bg-gradient-to-r from-violet-dark to-violet-light text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity shadow-md hover:shadow-lg hover:shadow-violet/30">
          View Plans
        </button>
      </div>
    );
  }

  return (
    <div className="animate-slide-in-up space-y-8">
      {/* Competitor Analysis Section */}
      <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl">
        <h2 className="text-xl font-bold text-center mb-1 text-slate-100 flex items-center justify-center gap-2">
            <Search className="w-5 h-5 text-violet-400" /> Competitor Analysis
        </h2>
        <p className="text-center text-slate-400 mb-4">Enter any public YouTube or TikTok channel URL to get AI insights.</p>
        <div className="flex flex-col sm:flex-row gap-4">
            <input
                type="url"
                value={competitorUrl}
                onChange={(e) => setCompetitorUrl(e.target.value)}
                placeholder="https://www.youtube.com/@MrBeast"
                className="flex-grow w-full bg-slate-800 border border-slate-700 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-violet-light transition-all shadow-inner"
            />
            <button
                onClick={handleAnalyzeCompetitor}
                disabled={competitorLoading}
                className="flex items-center justify-center bg-gradient-to-r from-violet-dark to-violet-light text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
                {competitorLoading ? <Spinner /> : 'Analyze'}
            </button>
        </div>
        {competitorError && <p className="text-red-400 mt-3 text-center text-sm">{competitorError}</p>}
      </div>

      {competitorLoading && (
        <div className="text-center py-10">
          <Spinner size="lg" />
          <p className="mt-4 text-slate-300">Performing competitive analysis...</p>
        </div>
      )}
      
      {competitorData && (
        <div className="relative">
             <button onClick={handleClearCompetitor} className="absolute -top-4 right-0 flex items-center gap-1.5 text-sm text-slate-400 hover:text-white bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
                <X className="w-4 h-4" /> Clear Competitor
             </button>
             <AnalyticsContent data={competitorData} opportunities={opportunities} opportunitiesLoading={opportunitiesLoading} />
        </div>
      )}

      {!competitorData && !competitorLoading && (
        <>
            {!compatibleChannels.length ? (
                <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-8 shadow-xl backdrop-blur-xl text-center flex flex-col items-center animate-slide-in-up">
                    <Link className="w-12 h-12 text-violet-400 mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Connect Your Channels</h2>
                    <p className="text-slate-400 mb-6 max-w-md">To view your own live analytics, add a YouTube or TikTok channel to your profile.</p>
                    <button onClick={() => setActiveTab(Tab.Profile)} className="flex items-center gap-2 bg-gradient-to-r from-violet-dark to-violet-light text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity shadow-md hover:shadow-lg hover:shadow-violet/30">
                    Go to Profile
                    </button>
                </div>
            ) : (
                <>
                    {/* Channel Tabs */}
                    <div className="flex justify-center">
                        <div className="flex bg-slate-800/60 p-1.5 rounded-full border border-slate-700/50">
                        {compatibleChannels.map(channel => (
                            <button
                            key={channel.id}
                            onClick={() => setActiveChannelId(channel.id)}
                            className={`flex items-center justify-center gap-2 py-2 px-6 text-sm font-semibold rounded-full transition-colors ${activeChannelIdProp === channel.id ? 'bg-violet text-white shadow-md' : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'}`}
                            >
                            {channel.platform === 'YouTube' ? <Youtube className="w-5 h-5" /> : <TikTok className="w-5 h-5" />}
                            {channel.platform}
                            </button>
                        ))}
                        </div>
                    </div>
                    {loading && (
                        <div className="text-center py-10">
                            <Spinner size="lg" />
                            <p className="mt-4 text-slate-300">Fetching live analytics for your channel...</p>
                        </div>
                    )}
                    {error && !loading && <p className="text-center text-red-400 bg-red-500/10 p-4 rounded-lg">{error}</p>}
                    {!loading && !error && data && (
                         <AnalyticsContent data={data} opportunities={opportunities} opportunitiesLoading={opportunitiesLoading} />
                    )}
                </>
            )}
        </>
      )}
    </div>
  );
};

export default ChannelAnalytics;
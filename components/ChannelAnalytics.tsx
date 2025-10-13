'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getChannelAnalytics, generateChannelOpportunities } from '../services/geminiService';
import { ChannelAnalyticsData, Tab } from '../types';
import Spinner from './Spinner';
import { Star, BarChart2, Youtube, TikTok, Link, Lightbulb, TrendingUp, TrendingDown, ExternalLink } from './Icons';
import ErrorDisplay from './ErrorDisplay';

interface ChannelAnalyticsProps {
  setActiveTab: (tab: Tab) => void;
  activeChannelId: string | null;
  setActiveChannelId: (id: string | null) => void;
  initialInput?: string | null;
}

const ChannelAnalyticsSkeleton = () => (
    <div className="mt-8 bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl animate-pulse space-y-6">
        <header>
            <div className="h-8 w-1/2 mb-2 bg-slate-700/50 rounded"></div>
            <div className="h-5 w-24 bg-slate-700/50 rounded"></div>
        </header>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="h-24 bg-slate-700/50 rounded-lg"></div>
            <div className="h-24 bg-slate-700/50 rounded-lg"></div>
            <div className="h-24 bg-slate-700/50 rounded-lg"></div>
            <div className="h-24 bg-slate-700/50 rounded-lg"></div>
        </div>
        <div>
            <div className="h-6 w-48 mb-3 bg-slate-700/50 rounded"></div>
            <div className="h-4 w-full mb-2 bg-slate-700/50 rounded"></div>
            <div className="h-4 w-3/4 bg-slate-700/50 rounded"></div>
        </div>
        <div>
            <div className="h-6 w-64 mb-3 bg-slate-700/50 rounded"></div>
            <div className="h-4 w-full mb-2 bg-slate-700/50 rounded"></div>
            <div className="h-4 w-full mb-2 bg-slate-700/50 rounded"></div>
            <div className="h-4 w-5/6 bg-slate-700/50 rounded"></div>
        </div>
    </div>
);

const ChannelAnalytics: React.FC<ChannelAnalyticsProps> = ({ setActiveTab, activeChannelId, setActiveChannelId, initialInput }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [analytics, setAnalytics] = useState<ChannelAnalyticsData | null>(null);
    const [opportunities, setOpportunities] = useState<string[]>([]);
    
    const compatibleChannels = user?.channels?.filter(c => c.platform === 'YouTube' || c.platform === 'TikTok') || [];
    const [selectedChannelId, setSelectedChannelId] = useState<string | null>(activeChannelId || compatibleChannels[0]?.id || null);
    
    // For competitor analysis
    const [competitorUrl, setCompetitorUrl] = useState('');
    const [competitorPlatform, setCompetitorPlatform] = useState<'YouTube' | 'TikTok'>('YouTube');

    useEffect(() => {
      // Sync state if a channel was clicked from the dashboard
      if(activeChannelId) {
        setSelectedChannelId(activeChannelId);
      }
    }, [activeChannelId]);

    const handleAnalyze = useCallback(async (channelUrl: string, platform: 'YouTube' | 'TikTok') => {
        if (!channelUrl) {
            setError("Please select a channel or enter a URL.");
            return;
        }
        setLoading(true);
        setError(null);
        setAnalytics(null);
        setOpportunities([]);
        // Clear active channel ID from dashboard when a new analysis starts
        setActiveChannelId(null);
        try {
            const [analyticsResult, opportunitiesResult] = await Promise.all([
                getChannelAnalytics(channelUrl, platform),
                generateChannelOpportunities(channelUrl, platform)
            ]);
            setAnalytics(analyticsResult);
            setOpportunities(opportunitiesResult);
        } catch (e: any) {
            setError(e.message || 'Failed to analyze channel.');
        } finally {
            setLoading(false);
        }
    }, [setActiveChannelId]);
    
    // Auto-analyze when selected channel changes
    useEffect(() => {
        if (selectedChannelId) {
            const channel = compatibleChannels.find(c => c.id === selectedChannelId);
            if (channel) {
                handleAnalyze(channel.url, channel.platform as 'YouTube' | 'TikTok');
            }
        }
    }, [selectedChannelId, compatibleChannels, handleAnalyze]);

    const handleCompetitorAnalyze = (url?: string) => {
        const urlToAnalyze = url || competitorUrl;
        if (urlToAnalyze.trim()) {
            setSelectedChannelId(null); // Deselect own channel
            handleAnalyze(urlToAnalyze, competitorPlatform);
        }
    };
    
    useEffect(() => {
        if (initialInput) {
            setCompetitorUrl(initialInput);
            handleCompetitorAnalyze(initialInput);
        }
    }, [initialInput, handleCompetitorAnalyze]);

    const renderTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
      switch (trend) {
        case 'up': return <TrendingUp className="w-5 h-5 text-green-400" />;
        case 'down': return <TrendingDown className="w-5 h-5 text-red-400" />;
        default: return <span className="w-5 h-5 text-slate-500 font-bold">-</span>;
      }
    };

    if (user?.plan !== 'pro') {
        return (
            <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-8 shadow-xl backdrop-blur-xl text-center flex flex-col items-center animate-slide-in-up">
                <Star className="w-12 h-12 text-yellow-400 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Upgrade to Pro for Channel Analytics</h2>
                <p className="text-slate-400 mb-6 max-w-md">Get AI-powered insights on your channels, analyze competitors, and receive actionable growth opportunities.</p>
                <button onClick={() => setActiveTab(Tab.Pricing)} className="button-primary">View Plans</button>
            </div>
        );
    }
    
    return (
        <div className="animate-slide-in-up space-y-8">
            <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl">
                 <h2 className="text-2xl font-bold text-center mb-1 text-slate-100 flex items-center justify-center gap-2">
                    <BarChart2 className="w-6 h-6 text-violet-400" /> Channel Analytics
                </h2>
                <p className="text-center text-slate-400 mb-6">Analyze your channels or get insights on competitors.</p>
                
                {compatibleChannels.length > 0 && (
                    <div className="mb-6">
                        <label htmlFor="channel-select-analytics" className="block text-sm font-medium text-slate-300 mb-2">Analyze Your Channels</label>
                         <select
                            id="channel-select-analytics"
                            value={selectedChannelId || ''}
                            onChange={(e) => setSelectedChannelId(e.target.value)}
                            title="Select one of your connected channels to analyze"
                            className="form-select"
                        >
                             <option value="" disabled>Select one of your channels...</option>
                            {compatibleChannels.map(channel => (
                                <option key={channel.id} value={channel.id}>
                                    {channel.platform} - {channel.url.split('/').pop() || channel.url}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
                 <div className="mb-2 text-center text-sm font-semibold text-slate-400">OR</div>
                 <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Analyze a Competitor</label>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-grow">
                             <input type="url" value={competitorUrl} onChange={e => setCompetitorUrl(e.target.value)} placeholder="Enter competitor channel URL..." title="Enter the URL of a competitor's channel to analyze (Pro feature)" className="form-input"/>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
                                <button onClick={() => setCompetitorPlatform('YouTube')} title="Set platform to YouTube" className={`w-1/2 flex items-center justify-center gap-2 px-3 py-1.5 rounded-md transition-colors text-sm ${competitorPlatform === 'YouTube' ? 'bg-violet' : 'hover:bg-slate-700'}`}><Youtube className="w-5 h-5"/> </button>
                                <button onClick={() => setCompetitorPlatform('TikTok')} title="Set platform to TikTok" className={`w-1/2 flex items-center justify-center gap-2 px-3 py-1.5 rounded-md transition-colors text-sm ${competitorPlatform === 'TikTok' ? 'bg-violet' : 'hover:bg-slate-700'}`}><TikTok className="w-5 h-5"/> </button>
                            </div>
                            <button onClick={() => handleCompetitorAnalyze()} disabled={loading} title="Analyze the entered competitor channel (Pro feature)" className="button-primary">Analyze</button>
                        </div>
                    </div>
                 </div>
            </div>
            
            {loading && <ChannelAnalyticsSkeleton />}
            <ErrorDisplay message={error} />
            
            {!loading && analytics && (
                <div className="mt-8 bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl animate-fade-in space-y-6">
                    <header>
                        <h3 className="text-2xl font-bold text-white">{analytics.channelName}</h3>
                        <p className="text-violet-300 font-semibold">{analytics.platform}</p>
                    </header>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                        <div className="bg-slate-800/50 p-4 rounded-lg">
                            <p className="text-sm text-slate-400">Followers</p>
                            <div className="text-2xl font-bold flex items-center justify-center gap-2">{analytics.followerCount} {renderTrendIcon(analytics.followerTrend)}</div>
                        </div>
                         <div className="bg-slate-800/50 p-4 rounded-lg">
                            <p className="text-sm text-slate-400">Total Views</p>
                             <div className="text-2xl font-bold flex items-center justify-center gap-2">{analytics.totalViews} {renderTrendIcon(analytics.viewsTrend)}</div>
                        </div>
                        {analytics.totalLikes && <div className="bg-slate-800/50 p-4 rounded-lg"><p className="text-sm text-slate-400">Total Likes</p><p className="text-2xl font-bold">{analytics.totalLikes}</p></div>}
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-slate-200 mb-2">AI Summary</h4>
                        <p className="text-slate-300">{analytics.aiSummary}</p>
                    </div>
                    {opportunities.length > 0 && <div>
                        <h4 className="text-lg font-bold text-slate-200 mb-2 flex items-center gap-2"><Lightbulb className="w-5 h-5 text-yellow-300"/> Growth Opportunities</h4>
                        <ul className="space-y-2">
                            {opportunities.map((opp, i) => <li key={i} className="flex items-start text-sm"><Star className="w-4 h-4 mr-2 mt-0.5 text-violet-300 flex-shrink-0"/>{opp}</li>)}
                        </ul>
                    </div>}
                     {analytics.recentVideos && <div>
                        <h4 className="text-lg font-bold text-slate-200 mb-2">Recent Videos</h4>
                        <div className="space-y-2">
                            {analytics.recentVideos.map((vid, i) => <div key={i} className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg">
                                <p className="text-sm truncate pr-4">{vid.title}</p>
                                <div className="flex items-center gap-4 flex-shrink-0">
                                    <span className="text-sm font-semibold">{vid.viewCount} views</span>
                                    <a href={vid.videoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400"><ExternalLink className="w-4 h-4"/></a>
                                </div>
                            </div>)}
                        </div>
                    </div>}
                </div>
            )}

        </div>
    );
};

export default ChannelAnalytics;
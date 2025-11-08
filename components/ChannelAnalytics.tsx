import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getChannelAnalytics, generateChannelOpportunities } from '../services/geminiService';
import { ChannelAnalyticsData, Tab } from '../types';
import Spinner from './Spinner';
import { Star, BarChart2, Youtube, TikTok, Lightbulb, TrendingUp, TrendingDown, ExternalLink, ChevronDown } from './Icons';
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
    
    const [analysisUrl, setAnalysisUrl] = useState('');
    const [platform, setPlatform] = useState<'YouTube' | 'TikTok'>('YouTube');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const comboboxRef = useRef<HTMLDivElement>(null);

    const handleAnalyze = useCallback(async (channelUrl: string, channelPlatform: 'YouTube' | 'TikTok') => {
        if (!channelUrl) {
            setError("Please select or enter a channel URL.");
            return;
        }
        setLoading(true);
        setError(null);
        setAnalytics(null);
        setOpportunities([]);
        setActiveChannelId(null);
        try {
            const [analyticsResult, opportunitiesResult] = await Promise.all([
                getChannelAnalytics(channelUrl, channelPlatform),
                generateChannelOpportunities(channelUrl, channelPlatform)
            ]);
            setAnalytics(analyticsResult);
            setOpportunities(opportunitiesResult);
        } catch (e: any) {
            setError(e.message || 'Failed to analyze channel.');
        } finally {
            setLoading(false);
        }
    }, [setActiveChannelId]);
    
    useEffect(() => {
        const channelToAnalyze = compatibleChannels.find(c => c.id === activeChannelId);
        if (channelToAnalyze) {
            setAnalysisUrl(channelToAnalyze.url);
            setPlatform(channelToAnalyze.platform as 'YouTube' | 'TikTok');
            handleAnalyze(channelToAnalyze.url, channelToAnalyze.platform as 'YouTube' | 'TikTok');
        } else if (initialInput) {
            setAnalysisUrl(initialInput);
            handleAnalyze(initialInput, platform);
        } else if (compatibleChannels.length > 0) {
            setAnalysisUrl(compatibleChannels[0].url);
            setPlatform(compatibleChannels[0].platform as 'YouTube' | 'TikTok');
        }
    }, [activeChannelId, initialInput, compatibleChannels, handleAnalyze]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (comboboxRef.current && !comboboxRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    
    const handleSelectChannel = (channel: (typeof compatibleChannels)[0]) => {
        setAnalysisUrl(channel.url);
        setPlatform(channel.platform as 'YouTube' | 'TikTok');
        setIsDropdownOpen(false);
    };

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
                
                 <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Channel to Analyze</label>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-grow" ref={comboboxRef}>
                             <input 
                                type="url" 
                                value={analysisUrl} 
                                onChange={e => setAnalysisUrl(e.target.value)}
                                onFocus={() => setIsDropdownOpen(true)}
                                placeholder="Select your channel or paste a URL..." 
                                title="Select a saved channel or paste a competitor's URL" 
                                className="form-input pr-10"
                            />
                            <ChevronDown className={`w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            {isDropdownOpen && compatibleChannels.length > 0 && (
                                <div className="absolute top-full mt-2 w-full bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto animate-fade-in">
                                    {compatibleChannels.map(channel => (
                                        <button 
                                            key={channel.id} 
                                            onClick={() => handleSelectChannel(channel)}
                                            className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-violet-500/30 flex items-center gap-2"
                                        >
                                           {channel.platform === 'YouTube' ? <Youtube className="w-5 h-5 text-red-500"/> : <TikTok className="w-5 h-5" />}
                                           <span className="truncate">{channel.url.split('/').pop() || channel.url}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <div className="segmented-control">
                                <button onClick={() => setPlatform('YouTube')} title="Set platform to YouTube" className={platform === 'YouTube' ? 'active' : ''}><Youtube className="w-5 h-5"/> </button>
                                <button onClick={() => setPlatform('TikTok')} title="Set platform to TikTok" className={platform === 'TikTok' ? 'active' : ''}><TikTok className="w-5 h-5"/> </button>
                            </div>
                            <button onClick={() => handleAnalyze(analysisUrl, platform)} disabled={loading} title="Analyze the entered channel (Pro feature)" className="button-primary">Analyze</button>
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

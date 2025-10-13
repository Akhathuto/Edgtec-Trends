'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Tab, Channel } from '../types';
import { Briefcase, RefreshCw, Sparkles, Link, Users, Eye, Youtube, TikTok, Lightbulb, Video, Wand, Clapperboard, Gif, PenTool, TrendingUp, TrendingDown, Star } from './Icons';
import { generateDashboardTip, getChannelSnapshots } from '../services/geminiService';
import Spinner from './Spinner';

interface EnrichedChannel extends Channel {
    followerCount?: string;
    totalViews?: string;
    followerTrend?: 'up' | 'down' | 'stable';
    viewsTrend?: 'up' | 'down' | 'stable';
    weeklyViewGrowth?: string;
}

const proTabs: Tab[] = [
  Tab.Chat, Tab.Analytics, Tab.Report, Tab.ChannelGrowth, Tab.BrandConnect,
  Tab.Video, Tab.AnimationCreator, Tab.GifCreator, Tab.ImageEditor, Tab.LogoCreator,
  Tab.ImageGenerator, Tab.AvatarCreator, Tab.VideoEditor
];

const ProChip: React.FC<{ isButton?: boolean }> = ({ isButton = false }) => (
    isButton ?
    <span className="absolute -top-1.5 -right-1.5 flex items-center gap-1 text-[10px] font-bold bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 px-1.5 py-0.5 rounded-full">
        <Star className="w-2.5 h-2.5" />
        PRO
    </span>
    :
    <span className="flex items-center gap-1 text-xs font-bold bg-yellow-400/10 text-yellow-300 border border-yellow-400/20 px-2 py-1 rounded-full">
        <Star className="w-3 h-3" /> PRO
    </span>
);


const AITipCard: React.FC = () => {
    const { user } = useAuth();
    const [tip, setTip] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchTip = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const newTip = await generateDashboardTip(user.channels || []);
            setTip(newTip);
        } catch (error) {
            console.error("Failed to fetch AI tip:", error);
            setTip("Could not fetch a tip right now. Please try again.");
        }
        setLoading(false);
    }, [user]);

    useEffect(() => {
        fetchTip();
    }, [fetchTip]);

    return (
        <div className="interactive-card flex flex-col h-full">
            <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-bold text-white flex items-center gap-3 text-glow">
                    <Sparkles className="w-6 h-6 text-violet-300"/> AI Tip of the Day
                </h3>
                <button onClick={fetchTip} disabled={loading} className="p-2 -mt-1 -mr-1 rounded-full hover:bg-slate-700/50 transition-colors disabled:opacity-50" title="Generate a new AI tip">
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>
             {loading ? (
                <div className="flex-grow flex items-center justify-center"><Spinner /></div>
            ) : (
                <p className="text-slate-300 flex-grow">{tip}</p>
            )}
        </div>
    );
};


const QuickCreateCard: React.FC<{ setActiveTab: (tab: Tab) => void }> = ({ setActiveTab }) => {
    const { user } = useAuth();

    const handleQuickCreateClick = (tab: Tab) => {
        if (proTabs.includes(tab) && user?.plan !== 'pro') {
            setActiveTab(Tab.Pricing);
        } else {
            setActiveTab(tab);
        }
    };
    
    const createButtons = [
        { tab: Tab.Ideas, icon: Lightbulb, label: 'Idea', title: 'Generate content ideas and scripts' },
        { tab: Tab.Prompt, icon: Wand, label: 'Prompt', title: 'Craft the perfect AI prompt' },
        { tab: Tab.Video, icon: Video, label: 'Video', title: 'Create videos from text or images (Pro Feature)' },
        { tab: Tab.AnimationCreator, icon: Clapperboard, label: 'Animation', title: 'Generate custom animations (Pro Feature)' },
        { tab: Tab.GifCreator, icon: Gif, label: 'GIF', title: 'Create animated GIFs (Pro Feature)' },
        { tab: Tab.LogoCreator, icon: PenTool, label: 'Logo', title: 'Design a logo for your brand (Pro Feature)' }
    ];

    return (
        <div className="interactive-card h-full flex flex-col">
            <h3 className="text-xl font-bold text-white mb-4 text-glow">Quick Create</h3>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 flex-grow content-center">
                {createButtons.map(btn => {
                    const isPro = proTabs.includes(btn.tab);
                    return (
                        <button 
                            key={btn.tab} 
                            onClick={() => handleQuickCreateClick(btn.tab)} 
                            className="relative flex items-center justify-center gap-2 p-3 bg-slate-800/60 hover:bg-violet-rich/20 rounded-lg transition-colors text-sm border border-transparent hover:border-violet-light"
                            title={btn.title}
                        >
                            <btn.icon className="w-4 h-4 text-violet-300"/> {btn.label}
                            {isPro && user?.plan !== 'pro' && <ProChip isButton />}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

const renderTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    const iconBase = "w-5 h-5"; // Made icon slightly larger
    switch (trend) {
        case 'up': return <TrendingUp className={`${iconBase} text-green-400`} />;
        case 'down': return <TrendingDown className={`${iconBase} text-red-400`} />;
        case 'stable': return <span className="font-bold text-slate-500 w-5 h-5 flex items-center justify-center">-</span>;
        default: return <div className="w-5 h-5"></div>; // Placeholder for alignment
    }
};

const ChannelCardSkeleton = () => (
    <div className="bg-slate-800/60 p-4 rounded-lg animate-pulse">
        <div className="flex items-center gap-3 mb-3">
            <div className="w-6 h-6 bg-slate-700/50 rounded-full"></div>
            <div className="h-5 w-32 bg-slate-700/50 rounded"></div>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center border-t border-b border-slate-700/50 py-4">
            <div>
                <div className="h-3 w-12 mx-auto mb-2 bg-slate-700/50 rounded"></div>
                <div className="h-6 w-16 mx-auto bg-slate-700/50 rounded"></div>
            </div>
            <div>
                <div className="h-3 w-12 mx-auto mb-2 bg-slate-700/50 rounded"></div>
                <div className="h-6 w-16 mx-auto bg-slate-700/50 rounded"></div>
            </div>
            <div className="border-l border-slate-700/50 pl-4">
                <div className="h-3 w-12 mx-auto mb-2 bg-slate-700/50 rounded"></div>
                <div className="h-6 w-10 mx-auto bg-slate-700/50 rounded"></div>
            </div>
        </div>
        <div className="h-3 w-40 mx-auto mt-2 bg-slate-700/50 rounded"></div>
    </div>
);


const YourChannelsCard: React.FC<{ 
    channels: Channel[]; 
    onChannelClick: (channelId: string) => void; 
}> = ({ channels, onChannelClick }) => {
    const { user } = useAuth();
    const [enrichedChannels, setEnrichedChannels] = useState<EnrichedChannel[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSnapshots = async () => {
            if (channels.length === 0) {
                setLoading(false);
                setEnrichedChannels([]);
                return;
            }
            setLoading(true);
            try {
                const snapshots = await getChannelSnapshots(channels);
                const enriched = channels.map(channel => {
                    const snapshot = snapshots.find(s => s.id === channel.id);
                    return { ...channel, ...snapshot };
                });
                setEnrichedChannels(enriched);
            } catch (error) {
                console.error("Failed to fetch channel snapshots:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSnapshots();
    }, [channels]);

    return (
        <div className="interactive-card h-full">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2 text-glow"><Link className="w-5 h-5"/> Your Channels</h3>
            {loading ? (
                <div className="space-y-4">
                    <ChannelCardSkeleton />
                    {channels.length > 1 && <ChannelCardSkeleton />}
                </div>
            ) : enrichedChannels.length === 0 ? (
                 <p className="text-slate-400 text-sm">Connect your channels in your profile to see stats here.</p>
            ) : (
                <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                    {enrichedChannels.map(channel => {
                        const growthValue = channel.weeklyViewGrowth ? parseFloat(channel.weeklyViewGrowth) : 0;
                        const growthColor = growthValue > 0 ? 'text-green-400' : growthValue < 0 ? 'text-red-400' : 'text-slate-400';

                        return (
                            <button key={channel.id} onClick={() => onChannelClick(channel.id)} className="w-full text-left bg-slate-800/60 hover:bg-violet-rich/20 p-4 rounded-lg transition-colors border border-slate-700/50 hover:border-violet-light" title={`View detailed analytics for ${channel.url.split('/').pop() || channel.url}`}>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        {channel.platform === 'YouTube' ? <Youtube className="w-6 h-6 text-red-500 flex-shrink-0" /> : <TikTok className="w-6 h-6 text-white flex-shrink-0" />}
                                        <span className="font-semibold truncate" title={channel.url}>{channel.url.split('/').pop() || channel.url}</span>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-3 gap-4 text-center border-t border-b border-slate-700/50 py-4">
                                     <div>
                                        <p className="text-xs text-slate-400 mb-1">Followers</p>
                                        <div className="flex items-center justify-center gap-1.5 font-bold text-slate-100 text-xl">
                                            {channel.followerCount || 'N/A'}
                                            {renderTrendIcon(channel.followerTrend)}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 mb-1">Total Views</p>
                                        <div className="flex items-center justify-center gap-1.5 font-bold text-slate-100 text-xl">
                                            {channel.totalViews || 'N/A'}
                                            {renderTrendIcon(channel.viewsTrend)}
                                        </div>
                                    </div>
                                     <div className="border-l border-slate-700/50 pl-4">
                                        <p className="text-xs text-slate-400 mb-1">7-Day Growth</p>
                                        <div className={`text-xl font-bold flex items-center justify-center gap-1 ${growthColor}`}>
                                            {growthValue > 0 ? <TrendingUp className="w-5 h-5"/> : growthValue < 0 ? <TrendingDown className="w-5 h-5"/> : null}
                                            {channel.weeklyViewGrowth || 'N/A'}
                                        </div>
                                    </div>
                                </div>
                                <p className="text-center text-xs text-slate-500 pt-2 flex items-center justify-center gap-2">
                                    Click to view full analytics
                                    {user?.plan !== 'pro' && (
                                        <span className="flex items-center gap-1 text-[10px] font-bold bg-yellow-400/10 text-yellow-300 border border-yellow-400/20 px-1.5 py-0.5 rounded-full">
                                            <Star className="w-2.5 h-2.5" /> PRO
                                        </span>
                                    )}
                                </p>
                            </button>
                        )
                    })}
                </div>
            )}
        </div>
    );
};

interface DashboardProps {
    setActiveTab: (tab: Tab) => void;
    setActiveAnalyticsChannelId: (id: string | null) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setActiveTab, setActiveAnalyticsChannelId }) => {
    const { user } = useAuth();
    
    if (!user) return null;

    const handleChannelClick = (channelId: string) => {
        if (proTabs.includes(Tab.Analytics) && user.plan !== 'pro') {
            setActiveTab(Tab.Pricing);
            return;
        }
        setActiveAnalyticsChannelId(channelId);
        setActiveTab(Tab.Analytics);
    };

    const handleBrandConnectClick = () => {
        if (proTabs.includes(Tab.BrandConnect) && user.plan !== 'pro') {
            setActiveTab(Tab.Pricing);
        } else {
            setActiveTab(Tab.BrandConnect);
        }
    };

    return (
        <div className="animate-slide-in-up space-y-8">
            <div>
                <h1 className="text-4xl lg:text-5xl font-bold text-white text-glow">Welcome back, {user.name}!</h1>
                <p className="text-slate-400 mt-2 text-lg">Here's your Creator Hub. Let's make something great today.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <YourChannelsCard channels={user.channels || []} onChannelClick={handleChannelClick} />
                </div>
                <AITipCard />
                <div className="lg:col-span-2">
                    <QuickCreateCard setActiveTab={setActiveTab} />
                </div>
                <button onClick={handleBrandConnectClick} className="interactive-card w-full text-left flex flex-col justify-center" title="Find brand sponsors and generate personalized pitches with AI (Pro Feature)">
                     <div className="flex items-center gap-4 mb-3">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-rich to-violet flex items-center justify-center text-white shadow-lg shadow-violet-900/50">
                            <Briefcase className="w-8 h-8"/>
                        </div>
                        <div className="flex items-center gap-3">
                            <h3 className="text-2xl md:text-3xl font-bold text-white text-glow">Brand Connect</h3>
                             {user.plan !== 'pro' && <ProChip />}
                        </div>
                    </div>
                    <p className="text-slate-300 text-lg">Find brand sponsors and generate personalized pitches with AI.</p>
                </button>
            </div>
        </div>
    );
};

export default Dashboard;

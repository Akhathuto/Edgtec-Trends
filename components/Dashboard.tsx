import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Tab, Channel } from '../types';
import { Briefcase, RefreshCw, Sparkles, Link, Users, Eye, Youtube, TikTok, Lightbulb, Video, Wand, Clapperboard, Gif, PenTool } from './Icons';
import { generateDashboardTip, getChannelSnapshots } from '../services/geminiService';
import Spinner from './Spinner';

interface EnrichedChannel extends Channel {
    followerCount?: string;
    totalViews?: string;
}

const AITipCard: React.FC = () => {
    const { user } = useAuth();
    const [tip, setTip] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchTip = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        const newTip = await generateDashboardTip(user.channels || []);
        setTip(newTip);
        setLoading(false);
    }, [user]);

    useEffect(() => {
        fetchTip();
    }, [fetchTip]);

    return (
        <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl flex flex-col h-full">
            <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-violet-300"/> AI Tip of the Day
                </h3>
                <button onClick={fetchTip} disabled={loading} className="p-2 -mt-1 -mr-1 rounded-full hover:bg-slate-700/50 transition-colors disabled:opacity-50">
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


const QuickCreateCard: React.FC<{ setActiveTab: (tab: Tab) => void }> = ({ setActiveTab }) => (
    <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl h-full flex flex-col">
        <h3 className="text-xl font-bold text-white mb-4">Quick Create</h3>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 flex-grow content-center">
            <button onClick={() => setActiveTab(Tab.Ideas)} className="flex items-center justify-center gap-2 p-3 bg-slate-800/60 hover:bg-slate-700/80 rounded-lg transition-colors text-sm"><Lightbulb className="w-4 h-4 text-violet-300"/> Idea</button>
            <button onClick={() => setActiveTab(Tab.Prompt)} className="flex items-center justify-center gap-2 p-3 bg-slate-800/60 hover:bg-slate-700/80 rounded-lg transition-colors text-sm"><Wand className="w-4 h-4 text-violet-300"/> Prompt</button>
            <button onClick={() => setActiveTab(Tab.Video)} className="flex items-center justify-center gap-2 p-3 bg-slate-800/60 hover:bg-slate-700/80 rounded-lg transition-colors text-sm"><Video className="w-4 h-4 text-violet-300"/> Video</button>
            <button onClick={() => setActiveTab(Tab.AnimationCreator)} className="flex items-center justify-center gap-2 p-3 bg-slate-800/60 hover:bg-slate-700/80 rounded-lg transition-colors text-sm"><Clapperboard className="w-4 h-4 text-violet-300"/> Animation</button>
            <button onClick={() => setActiveTab(Tab.GifCreator)} className="flex items-center justify-center gap-2 p-3 bg-slate-800/60 hover:bg-slate-700/80 rounded-lg transition-colors text-sm"><Gif className="w-4 h-4 text-violet-300"/> GIF</button>
            <button onClick={() => setActiveTab(Tab.LogoCreator)} className="flex items-center justify-center gap-2 p-3 bg-slate-800/60 hover:bg-slate-700/80 rounded-lg transition-colors text-sm"><PenTool className="w-4 h-4 text-violet-300"/> Logo</button>
        </div>
    </div>
);

const YourChannelsCard: React.FC<{ 
    channels: Channel[]; 
    onChannelClick: (channelId: string) => void; 
}> = ({ channels, onChannelClick }) => {
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
            const snapshots = await getChannelSnapshots(channels);
            const enriched = channels.map(channel => {
                const snapshot = snapshots.find(s => s.id === channel.id);
                return { ...channel, ...snapshot };
            });
            setEnrichedChannels(enriched);
            setLoading(false);
        };
        fetchSnapshots();
    }, [channels]);

    return (
        <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl h-full">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Link className="w-5 h-5"/> Your Channels</h3>
            {loading ? (
                <div className="flex items-center justify-center h-full"><Spinner /></div>
            ) : enrichedChannels.length === 0 ? (
                 <p className="text-slate-400 text-sm">Connect your channels in your profile to see stats here.</p>
            ) : (
                <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                    {enrichedChannels.map(channel => (
                        <button key={channel.id} onClick={() => onChannelClick(channel.id)} className="w-full text-left bg-slate-800/60 hover:bg-slate-700/80 p-3 rounded-lg transition-colors flex items-center justify-between">
                            <div className="flex items-center gap-3 min-w-0">
                                {channel.platform === 'YouTube' ? <Youtube className="w-6 h-6 text-red-500 flex-shrink-0" /> : <TikTok className="w-6 h-6 text-white flex-shrink-0" />}
                                <span className="font-semibold truncate">{channel.url.split('/').pop() || channel.url}</span>
                            </div>
                            <div className="flex items-center gap-4 text-sm flex-shrink-0 ml-4">
                                <span className="flex items-center gap-1.5 text-slate-400"><Users className="w-4 h-4"/>{channel.followerCount || 'N/A'}</span>
                                <span className="flex items-center gap-1.5 text-slate-400"><Eye className="w-4 h-4"/>{channel.totalViews || 'N/A'}</span>
                            </div>
                        </button>
                    ))}
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
        setActiveAnalyticsChannelId(channelId);
        setActiveTab(Tab.Analytics);
    };

    return (
        <div className="animate-slide-in-up space-y-8">
            <div>
                <h1 className="text-4xl font-bold text-white">Welcome back, {user.name}!</h1>
                <p className="text-slate-400 mt-1">Here's your Creator Hub. Let's get started.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <YourChannelsCard channels={user.channels || []} onChannelClick={handleChannelClick} />
                <AITipCard />
                <QuickCreateCard setActiveTab={setActiveTab} />
                <button onClick={() => setActiveTab(Tab.BrandConnect)} className="bg-brand-glass border border-slate-700/50 rounded-xl p-8 shadow-xl backdrop-blur-xl w-full text-left transition-all duration-300 hover:border-violet-500 hover:shadow-glow-md hover:-translate-y-1 flex flex-col justify-center">
                     <div className="flex items-center gap-4 mb-3">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-white">
                            <Briefcase className="w-8 h-8"/>
                        </div>
                        <h3 className="text-3xl font-bold text-white">Brand Connect</h3>
                    </div>
                    <p className="text-slate-400 text-lg">Find brand sponsors and generate personalized pitches with AI.</p>
                </button>
            </div>
        </div>
    );
};

export default Dashboard;
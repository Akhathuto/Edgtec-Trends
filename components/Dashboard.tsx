import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Tab, Channel } from '../types';
import { generateDashboardTip, getChannelSnapshots } from '../services/geminiService';
import { Lightbulb, Video, DollarSign, FileText, TrendingUp, Search, BarChart2, MessageSquare, Bot, Rocket, Briefcase, Sparkles, Youtube, TikTok, TrendingDown } from './Icons';

interface DashboardProps {
  setActiveTab: (tab: Tab) => void;
  setActiveAnalyticsChannelId: (id: string | null) => void;
}

const QuickCreateButton: React.FC<{ icon: React.ReactNode; label: string; tab: Tab; onClick: (tab: Tab) => void }> = ({ icon, label, tab, onClick }) => (
    <button
        onClick={() => onClick(tab)}
        className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-800/50 hover:bg-slate-700/80 rounded-lg transition-colors text-slate-300 hover:text-white text-sm font-semibold text-center"
        title={`Go to ${label}`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

const ChannelSnapshotCard: React.FC<{ channel: Channel; onAnalyze: () => void; }> = ({ channel, onAnalyze }) => {
    const [snapshot, setSnapshot] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSnapshot = async () => {
            setLoading(true);
            try {
                const result = await getChannelSnapshots([channel]);
                if (result && result[0]) {
                    setSnapshot(result[0]);
                }
            } catch (error) {
                console.error(`Failed to fetch snapshot for ${channel.url}`, error);
            } finally {
                setLoading(false);
            }
        };
        fetchSnapshot();
    }, [channel]);

    const renderTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
        switch (trend) {
            case 'up': return <TrendingUp className="w-4 h-4 text-green-400" />;
            case 'down': return <TrendingDown className="w-4 h-4 text-red-400" />;
            default: return <span className="w-4 h-4 text-slate-500 font-bold">-</span>;
        }
    };

    if (loading) {
        return (
            <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-4 animate-pulse">
                <div className="h-6 w-3/4 bg-slate-700 rounded mb-4"></div>
                <div className="flex justify-between gap-4">
                    <div className="h-10 w-1/3 bg-slate-700 rounded"></div>
                    <div className="h-10 w-1/3 bg-slate-700 rounded"></div>
                    <div className="h-10 w-1/3 bg-slate-700 rounded"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-4 transition-all hover:border-violet-500 hover:shadow-glow-md">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    {channel.platform === 'YouTube' ? <Youtube className="w-6 h-6 text-red-500" /> : <TikTok className="w-6 h-6 text-white" />}
                    <h3 className="font-bold text-lg truncate">{snapshot?.channelName || channel.url.split('/').pop()}</h3>
                </div>
                <button onClick={onAnalyze} className="text-xs font-semibold text-violet-400 hover:underline">Full Analytics</button>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                    <p className="text-xs text-slate-400">Followers</p>
                    <div className="text-lg font-bold flex items-center justify-center gap-1">{snapshot?.followerCount || 'N/A'} {renderTrendIcon(snapshot?.followerTrend)}</div>
                </div>
                <div>
                    <p className="text-xs text-slate-400">Total Views</p>
                    <div className="text-lg font-bold flex items-center justify-center gap-1">{snapshot?.totalViews || 'N/A'} {renderTrendIcon(snapshot?.viewsTrend)}</div>
                </div>
                 <div>
                    <p className="text-xs text-slate-400">Weekly Growth</p>
                    <p className="text-lg font-bold">{snapshot?.weeklyViewGrowth || 'N/A'}</p>
                </div>
            </div>
        </div>
    );
}

const Dashboard: React.FC<DashboardProps> = ({ setActiveTab, setActiveAnalyticsChannelId }) => {
    const { user } = useAuth();
    const [tip, setTip] = useState('');
    const [tipLoading, setTipLoading] = useState(true);

    useEffect(() => {
        const fetchTip = async () => {
            if (user) {
                setTipLoading(true);
                try {
                    const result = await generateDashboardTip(user.channels || []);
                    setTip(result);
                } catch (error) {
                    console.error("Failed to fetch dashboard tip:", error);
                    setTip("Could not load a tip right now. Try exploring the tools!");
                } finally {
                    setTipLoading(false);
                }
            }
        };
        fetchTip();
    }, [user]);

    const handleChannelAnalyze = (channelId: string) => {
        setActiveAnalyticsChannelId(channelId);
        setActiveTab(Tab.Analytics);
    }

    return (
        <div className="animate-slide-in-up space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white text-glow">Welcome back, {user?.name.split(' ')[0]}!</h1>
                <p className="text-slate-400">Here's your command center for content creation.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* AI Tip of the Day */}
                    <div className="bg-gradient-to-r from-violet-900/50 to-slate-900/50 border border-violet-700/50 rounded-xl p-6 shadow-glow-violet flex items-start gap-4">
                        <Sparkles className="w-8 h-8 text-violet-300 flex-shrink-0 mt-1" />
                        <div>
                            <h2 className="text-xl font-bold text-violet-300">AI Tip of the Day</h2>
                            {tipLoading ? <div className="h-5 w-3/4 bg-slate-700/50 rounded mt-2 animate-pulse"></div> : <p className="text-slate-300 mt-1">{tip}</p>}
                        </div>
                    </div>
                     {/* Your Channels */}
                    {user?.channels && user.channels.length > 0 && (
                        <div>
                            <h2 className="text-2xl font-bold mb-4">Your Channels</h2>
                            <div className="space-y-4">
                                {user.channels.map(channel => (
                                <ChannelSnapshotCard key={channel.id} channel={channel} onAnalyze={() => handleChannelAnalyze(channel.id)} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <div className="lg:col-span-1 space-y-8">
                    {/* Quick Create */}
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Quick Create</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <QuickCreateButton icon={<Lightbulb className="w-8 h-8 text-yellow-300" />} label="Content Idea" tab={Tab.Ideas} onClick={setActiveTab} />
                            <QuickCreateButton icon={<Video className="w-8 h-8 text-red-300" />} label="Video" tab={Tab.Video} onClick={setActiveTab} />
                            <QuickCreateButton icon={<DollarSign className="w-8 h-8 text-green-300" />} label="Monetization" tab={Tab.Monetization} onClick={setActiveTab} />
                            <QuickCreateButton icon={<FileText className="w-8 h-8 text-blue-300" />} label="Full Report" tab={Tab.Report} onClick={setActiveTab} />
                            <QuickCreateButton icon={<Rocket className="w-8 h-8 text-rose-400" />} label="Growth Plan" tab={Tab.ChannelGrowth} onClick={setActiveTab} />
                            <QuickCreateButton icon={<Briefcase className="w-8 h-8 text-cyan-300" />} label="Brand Connect" tab={Tab.BrandConnect} onClick={setActiveTab} />
                        </div>
                    </div>
                </div>
            </div>

             {/* Main Tools */}
            <div>
                <h2 className="text-2xl font-bold mb-4">Explore Tools</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     <button onClick={() => setActiveTab(Tab.Trends)} className="interactive-card text-left">
                        <TrendingUp className="w-6 h-6 text-violet-400 mb-2"/>
                        <h3 className="font-bold text-lg text-white">Trend Discovery</h3>
                        <p className="text-sm text-slate-400">Find what's hot right now on YouTube and TikTok.</p>
                     </button>
                      <button onClick={() => setActiveTab(Tab.Keywords)} className="interactive-card text-left">
                        <Search className="w-6 h-6 text-violet-400 mb-2"/>
                        <h3 className="font-bold text-lg text-white">Keyword Research</h3>
                        <p className="text-sm text-slate-400">Uncover high-potential keywords and SEO opportunities.</p>
                     </button>
                      <button onClick={() => setActiveTab(Tab.Analytics)} className="interactive-card text-left">
                        <BarChart2 className="w-6 h-6 text-violet-400 mb-2"/>
                        <h3 className="font-bold text-lg text-white">Channel Analytics</h3>
                        <p className="text-sm text-slate-400">Analyze your channels and your competitors.</p>
                     </button>
                      <button onClick={() => setActiveTab(Tab.Chat)} className="interactive-card text-left">
                        <MessageSquare className="w-6 h-6 text-violet-400 mb-2"/>
                        <h3 className="font-bold text-lg text-white">AI Chat (Nolo)</h3>
                        <p className="text-sm text-slate-400">Your AI co-pilot for brainstorming and strategy.</p>
                     </button>
                      <button onClick={() => setActiveTab(Tab.Agents)} className="interactive-card text-left">
                        <Bot className="w-6 h-6 text-violet-400 mb-2"/>
                        <h3 className="font-bold text-lg text-white">AI Agents</h3>
                        <p className="text-sm text-slate-400">Consult with a team of specialized AI experts.</p>
                     </button>
                </div>
            </div>

        </div>
    );
};

export default Dashboard;

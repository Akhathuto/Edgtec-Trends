import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ToolId, Channel } from '../types';
import { generateDashboardTip, getChannelSnapshots } from '../services/geminiService';
import { Lightbulb, Video, DollarSign, FileText, TrendingUp, Search, BarChart2, MessageSquare, Bot, Rocket, Briefcase, Sparkles, Youtube, TikTok, TrendingDown, SearchCode, Image, Plus, ChevronRight, Zap } from '../components/Icons';

interface DashboardProps {
  onNavigate: (toolId: ToolId, state?: any) => void;
}

const QuickCreateButton: React.FC<{ icon: React.ReactNode; label: string; toolId: ToolId; onClick: (id: ToolId) => void }> = ({ icon, label, toolId, onClick }) => (
    <button
        onClick={() => onClick(toolId)}
        className="flex flex-col items-center justify-center gap-3 p-6 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all duration-300 group active:scale-95"
        title={`Go to ${label}`}
    >
        <div className="p-3 bg-slate-900/50 rounded-xl group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <span className="text-slate-300 group-hover:text-white text-xs font-bold tracking-wide uppercase">{label}</span>
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
            case 'up': return <TrendingUp className="w-4 h-4 text-emerald-400" />;
            case 'down': return <TrendingDown className="w-4 h-4 text-rose-400" />;
            default: return <span className="w-4 h-4 text-slate-500 font-bold">-</span>;
        }
    };

    if (loading) {
        return (
            <div className="bg-white/5 border border-white/5 rounded-2xl p-6 animate-pulse">
                <div className="h-6 w-3/4 bg-white/10 rounded mb-4"></div>
                <div className="flex justify-between gap-4">
                    <div className="h-10 w-1/3 bg-white/10 rounded"></div>
                    <div className="h-10 w-1/3 bg-white/10 rounded"></div>
                    <div className="h-10 w-1/3 bg-white/10 rounded"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white/5 border border-white/5 rounded-2xl p-6 transition-all hover:bg-white/10 hover:border-violet-500/30 group">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-900/50 rounded-lg">
                      {channel.platform === 'YouTube' ? <Youtube className="w-6 h-6 text-red-500" /> : <TikTok className="w-6 h-6 text-white" />}
                    </div>
                    <h3 className="font-bold text-lg truncate text-white">{snapshot?.channelName || channel.url.split('/').pop()}</h3>
                </div>
                <button onClick={onAnalyze} className="text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors uppercase tracking-widest">Full Analytics</button>
            </div>
            <div className="grid grid-cols-3 gap-6 text-center">
                <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Followers</p>
                    <div className="text-xl font-bold flex items-center justify-center gap-1 text-white">{snapshot?.followerCount || 'N/A'} {renderTrendIcon(snapshot?.followerTrend)}</div>
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Views</p>
                    <div className="text-xl font-bold flex items-center justify-center gap-1 text-white">{snapshot?.totalViews || 'N/A'} {renderTrendIcon(snapshot?.viewsTrend)}</div>
                </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Weekly Growth</p>
                    <p className="text-xl font-bold text-white">{snapshot?.weeklyViewGrowth || 'N/A'}</p>
                </div>
            </div>
        </div>
    );
}

import { AIContent } from '../components/AIContent';

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
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
        onNavigate('analytics', { channelId });
    }

    return (
        <div className="animate-slide-in-up space-y-12 pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-violet-400 font-bold text-xs uppercase tracking-[0.2em] mb-2">
                        <Zap className="w-4 h-4" />
                        <span>Command Center</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-2">Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">{user?.name.split(' ')[0]}</span>!</h1>
                    <p className="text-slate-400 text-lg max-w-2xl">What's the goal for today? Choose a path below to start creating.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => onNavigate('media-generator')}
                        className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold px-6 py-3 rounded-2xl transition-all shadow-lg shadow-violet-900/40 active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        <span>New Project</span>
                    </button>
                </div>
            </div>

            {/* Goal-Oriented Navigation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="premium-card p-6 rounded-3xl border border-white/5 hover:border-violet-500/30 transition-all group">
                    <div className="p-3 bg-amber-500/10 rounded-2xl w-fit mb-4">
                        <Lightbulb className="w-6 h-6 text-amber-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">I want to Create</h3>
                    <p className="text-sm text-slate-400 mb-6">Generate scripts, videos, and thumbnails with AI.</p>
                    <div className="space-y-2">
                        <button onClick={() => onNavigate('script-writer')} className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-semibold text-slate-300 transition-all">
                            <span>Script Writer</span>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                        <button onClick={() => onNavigate('media-generator')} className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-semibold text-slate-300 transition-all">
                            <span>Media Generator</span>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="premium-card p-6 rounded-3xl border border-white/5 hover:border-emerald-500/30 transition-all group">
                    <div className="p-3 bg-emerald-500/10 rounded-2xl w-fit mb-4">
                        <TrendingUp className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">I want to Grow</h3>
                    <p className="text-sm text-slate-400 mb-6">Analyze trends, optimize SEO, and plan growth.</p>
                    <div className="space-y-2">
                        <button onClick={() => onNavigate('trends-keywords')} className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-semibold text-slate-300 transition-all">
                            <span>Trends & SEO</span>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                        <button onClick={() => onNavigate('growth-planner')} className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-semibold text-slate-300 transition-all">
                            <span>Growth Planner</span>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="premium-card p-6 rounded-3xl border border-white/5 hover:border-sky-500/30 transition-all group">
                    <div className="p-3 bg-sky-500/10 rounded-2xl w-fit mb-4">
                        <Sparkles className="w-6 h-6 text-sky-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">I want AI Help</h3>
                    <p className="text-sm text-slate-400 mb-6">Chat with Nolo or consult specialized AI agents.</p>
                    <div className="space-y-2">
                        <button onClick={() => onNavigate('nolo-ai')} className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-semibold text-slate-300 transition-all">
                            <span>Chat with Nolo</span>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                        <button onClick={() => onNavigate('ai-agents')} className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-semibold text-slate-300 transition-all">
                            <span>AI Agents</span>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-10">
                    {/* AI Tip of the Day */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                AI Insights
                                <span className="px-2 py-0.5 bg-violet-500/10 border border-violet-500/20 rounded-full text-[10px] font-bold text-violet-400 uppercase tracking-widest">Daily Strategy</span>
                            </h2>
                        </div>
                        
                        {tipLoading ? (
                            <div className="premium-card rounded-3xl p-8 animate-pulse">
                                <div className="flex items-start gap-6">
                                    <div className="p-4 bg-white/5 rounded-2xl w-16 h-16"></div>
                                    <div className="flex-1 space-y-3">
                                        <div className="h-4 w-1/4 bg-white/5 rounded"></div>
                                        <div className="h-4 w-full bg-white/5 rounded"></div>
                                        <div className="h-4 w-5/6 bg-white/5 rounded"></div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <AIContent content={tip} type="insight" className="w-full" />
                        )}
                    </div>

                     {/* Your Channels */}
                    {user?.channels && user.channels.length > 0 && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between px-2">
                              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                <BarChart2 className="w-6 h-6 text-violet-400" />
                                Your Channels
                              </h2>
                              <button onClick={() => onNavigate('analytics')} className="text-xs font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest border-b border-transparent hover:border-white/20 pb-1">View All</button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {user.channels.map(channel => (
                                <ChannelSnapshotCard key={channel.id} channel={channel} onAnalyze={() => handleChannelAnalyze(channel.id)} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <div className="lg:col-span-1 space-y-8">
                    {/* Quick Create */}
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-white px-2">Quick Actions</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <QuickCreateButton icon={<Lightbulb className="w-8 h-8 text-amber-400" />} label="Idea" toolId="script-writer" onClick={onNavigate} />
                            <QuickCreateButton icon={<Video className="w-8 h-8 text-rose-400" />} label="Video" toolId="media-generator" onClick={onNavigate} />
                            <QuickCreateButton icon={<DollarSign className="w-8 h-8 text-emerald-400" />} label="Earn" toolId="monetization-guide" onClick={onNavigate} />
                            <QuickCreateButton icon={<FileText className="w-8 h-8 text-sky-400" />} label="Report" toolId="strategy-report" onClick={onNavigate} />
                            <QuickCreateButton icon={<Rocket className="w-8 h-8 text-indigo-400" />} label="Growth" toolId="growth-planner" onClick={onNavigate} />
                            <QuickCreateButton icon={<Briefcase className="w-8 h-8 text-teal-400" />} label="Brands" toolId="brand-connect" onClick={onNavigate} />
                        </div>
                    </div>
                </div>
            </div>

             {/* Main Tools */}
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">Explore Tools</h2>
                  <div className="h-px flex-1 bg-white/5 mx-6 hidden md:block" />
                </div>
                <div className="bento-grid">
                     <button onClick={() => onNavigate('trends-keywords')} className="interactive-card text-left group">
                        <div className="p-3 bg-violet-600/10 rounded-xl w-fit mb-4 group-hover:bg-violet-600/20 transition-colors">
                          <TrendingUp className="w-6 h-6 text-violet-400"/>
                        </div>
                        <h3 className="font-bold text-lg text-white mb-2">Trend Discovery</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">Find what's hot right now on YouTube and TikTok to stay ahead of the curve.</p>
                     </button>
                      <button onClick={() => onNavigate('trends-keywords')} className="interactive-card text-left group">
                        <div className="p-3 bg-violet-600/10 rounded-xl w-fit mb-4 group-hover:bg-violet-600/20 transition-colors">
                          <Search className="w-6 h-6 text-violet-400"/>
                        </div>
                        <h3 className="font-bold text-lg text-white mb-2">Keyword Research</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">Uncover high-potential keywords and SEO opportunities for maximum reach.</p>
                     </button>
                      <button onClick={() => onNavigate('content-analyzer')} className="interactive-card text-left group">
                        <div className="p-3 bg-violet-600/10 rounded-xl w-fit mb-4 group-hover:bg-violet-600/20 transition-colors">
                          <BarChart2 className="w-6 h-6 text-violet-400"/>
                        </div>
                        <h3 className="font-bold text-lg text-white mb-2">Channel Analytics</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">Deep dive into your performance and benchmark against your competitors.</p>
                     </button>
                      <button onClick={() => onNavigate('nolo-ai')} className="interactive-card text-left group">
                        <div className="p-3 bg-violet-600/10 rounded-xl w-fit mb-4 group-hover:bg-violet-600/20 transition-colors">
                          <MessageSquare className="w-6 h-6 text-violet-400"/>
                        </div>
                        <h3 className="font-bold text-lg text-white mb-2">AI Chat (Nolo)</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">Your AI co-pilot for brainstorming, strategy, and creative problem solving.</p>
                     </button>
                      <button onClick={() => onNavigate('nolo-ai')} className="interactive-card text-left group">
                        <div className="p-3 bg-violet-600/10 rounded-xl w-fit mb-4 group-hover:bg-violet-600/20 transition-colors">
                          <Bot className="w-6 h-6 text-violet-400"/>
                        </div>
                        <h3 className="font-bold text-lg text-white mb-2">AI Agents</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">Consult with a team of specialized AI experts for every aspect of your brand.</p>
                     </button>
                     <button onClick={() => onNavigate('seo-automation')} className="interactive-card text-left group">
                        <div className="p-3 bg-violet-600/10 rounded-xl w-fit mb-4 group-hover:bg-violet-600/20 transition-colors">
                          <SearchCode className="w-6 h-6 text-violet-400"/>
                        </div>
                        <h3 className="font-bold text-lg text-white mb-2">SEO Automation</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">Automate your SEO metadata generation and optimize your content at scale.</p>
                     </button>
                </div>
            </div>

        </div>
    );
};

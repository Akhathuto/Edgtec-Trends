
'use client';

import React, { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { generateChannelGrowthPlan } from '../services/geminiService';
import { ChannelGrowthPlan, Tab } from '../types';
import Spinner from './Spinner';
import { Star, Link, Rocket, CheckCircle, FileText, BarChart2, Users, Eye, ChevronDown } from './Icons';

interface ChannelGrowthProps {
  setActiveTab: (tab: Tab) => void;
}

const GrowthSection: React.FC<{ title: string; icon: React.ReactNode; analysis: string; recommendations: string[] }> = ({ title, icon, analysis, recommendations }) => (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-xl font-bold text-violet-300 mb-3 flex items-center">{icon} {title}</h3>
        <div className="space-y-4">
            <div>
                <h4 className="font-semibold text-slate-200 mb-1">AI Analysis</h4>
                <p className="text-slate-300 text-sm leading-relaxed">{analysis}</p>
            </div>
            <div>
                 <h4 className="font-semibold text-slate-200 mb-2">Recommendations</h4>
                 <ul className="space-y-2">
                    {recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start text-sm">
                            <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-green-400 flex-shrink-0" />
                            <span className="text-slate-300">{rec}</span>
                        </li>
                    ))}
                 </ul>
            </div>
        </div>
    </div>
);


const ChannelGrowth: React.FC<ChannelGrowthProps> = ({ setActiveTab }) => {
    const { user, logActivity, addContentToHistory } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [plan, setPlan] = useState<ChannelGrowthPlan | null>(null);

    const compatibleChannels = user?.channels?.filter(c => c.platform === 'YouTube' || c.platform === 'TikTok') || [];
    const [selectedChannelId, setSelectedChannelId] = useState<string | null>(compatibleChannels[0]?.id || null);

    const handleGenerate = useCallback(async () => {
        if (!selectedChannelId || !user?.channels) {
            setError("Please select a channel to analyze.");
            return;
        }

        const selectedChannel = user.channels.find(c => c.id === selectedChannelId);
        if (!selectedChannel) {
             setError("Selected channel not found.");
            return;
        }

        if (selectedChannel.platform !== 'YouTube' && selectedChannel.platform !== 'TikTok') {
            setError(`Growth plans for "${selectedChannel.platform}" channels are not supported.`);
            return;
        }

        setLoading(true);
        setError(null);
        setPlan(null);
        try {
            const result = await generateChannelGrowthPlan(selectedChannel.url, selectedChannel.platform);
            setPlan(result);
            logActivity(`generated a growth plan for their ${selectedChannel.platform} channel`, 'Rocket');
            addContentToHistory({
                type: 'Channel Growth Plan',
                summary: `Growth plan for ${selectedChannel.platform} channel`,
                content: result
            });
        } catch (e: any) {
            setError(e.message || 'Failed to generate growth plan.');
        } finally {
            setLoading(false);
        }
    }, [user?.channels, selectedChannelId, logActivity, addContentToHistory]);

    if (user?.plan !== 'pro') {
        return (
            <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-8 shadow-xl backdrop-blur-xl text-center flex flex-col items-center animate-slide-in-up">
                <Star className="w-12 h-12 text-yellow-400 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Upgrade to Pro for Personalized Growth Plans</h2>
                <p className="text-slate-400 mb-6 max-w-md">Get a custom, AI-powered strategy to grow your channel, including content, SEO, and thumbnail analysis.</p>
                <button onClick={() => setActiveTab(Tab.Pricing)} title="View subscription plans to upgrade" className="flex items-center gap-2 bg-gradient-to-r from-violet-dark to-violet-light text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity shadow-md hover:shadow-lg hover:shadow-violet/30">
                    View Plans
                </button>
            </div>
        );
    }

    if (!compatibleChannels.length) {
        return (
            <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-8 shadow-xl backdrop-blur-xl text-center flex flex-col items-center animate-slide-in-up">
                <Link className="w-12 h-12 text-violet-400 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Connect a YouTube or TikTok Channel</h2>
                <p className="text-slate-400 mb-6 max-w-md">To generate a personalized growth plan, please add a YouTube or TikTok channel URL to your profile.</p>
                <button onClick={() => setActiveTab(Tab.Profile)} title="Go to your profile to connect a channel" className="flex items-center gap-2 bg-gradient-to-r from-violet-dark to-violet-light text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity shadow-md hover:shadow-lg hover:shadow-violet/30">
                    Go to Profile
                </button>
            </div>
        )
    }

    return (
        <div className="animate-slide-in-up space-y-8">
            <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl">
                <h2 className="text-2xl font-bold text-center mb-1 text-slate-100 flex items-center justify-center gap-2">
                    <Rocket className="w-6 h-6 text-violet-400" /> Channel Growth Plan
                </h2>
                <p className="text-center text-slate-400 mb-6">Get your personalized, AI-powered strategy to level up your channel.</p>
                
                <div className="max-w-xl mx-auto flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-grow">
                         <label htmlFor="channel-select" className="sr-only">Select Channel</label>
                        <select
                            id="channel-select"
                            value={selectedChannelId || ''}
                            onChange={(e) => setSelectedChannelId(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-600 rounded-lg py-3 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-violet-light transition-all appearance-none"
                            title="Select a channel to analyze"
                        >
                            {compatibleChannels.map(channel => (
                                <option key={channel.id} value={channel.id}>
                                    {channel.platform} - {channel.url.split('/').pop() || channel.url}
                                </option>
                            ))}
                        </select>
                         <ChevronDown className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={loading || !selectedChannelId}
                        title="Generate a personalized growth plan for the selected channel (Pro feature)"
                        className="flex items-center justify-center bg-gradient-to-r from-violet-dark to-violet-light text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:shadow-violet/30"
                    >
                        {loading ? <Spinner /> : 'Generate My Growth Plan'}
                    </button>
                </div>

                {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
            </div>

            {loading && (
                <div className="text-center py-10">
                    <Spinner size="lg" />
                    <p className="mt-4 text-slate-300">Analyzing your channel and crafting your growth plan...</p>
                </div>
            )}

            {plan && (
                 <div className="mt-8 bg-brand-glass border border-slate-700/50 rounded-xl p-6 sm:p-8 shadow-xl backdrop-blur-xl animate-fade-in space-y-6">
                    <GrowthSection 
                        title="Content Strategy"
                        icon={<FileText className="w-5 h-5 mr-2" />}
                        analysis={plan.contentStrategy.analysis}
                        recommendations={plan.contentStrategy.recommendations}
                    />
                     <GrowthSection 
                        title={plan.seoAndDiscoverability.analysis.toLowerCase().includes('thumbnail') ? "SEO & Discoverability" : "Discoverability (Hashtags & Sounds)"}
                        icon={<BarChart2 className="w-5 h-5 mr-2" />}
                        analysis={plan.seoAndDiscoverability.analysis}
                        recommendations={plan.seoAndDiscoverability.recommendations}
                    />
                     <GrowthSection 
                        title="Audience Engagement"
                        icon={<Users className="w-5 h-5 mr-2" />}
                        analysis={plan.audienceEngagement.analysis}
                        recommendations={plan.audienceEngagement.recommendations}
                    />
                      <GrowthSection 
                        title={plan.thumbnailCritique.analysis.toLowerCase().includes('first frame') ? "First Frame / Cover Critique" : "Thumbnail Critique"}
                        icon={<Eye className="w-5 h-5 mr-2" />}
                        analysis={plan.thumbnailCritique.analysis}
                        recommendations={plan.thumbnailCritique.recommendations}
                    />
                 </div>
            )}
        </div>
    );
};

export default ChannelGrowth;
import React, { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { findSponsorshipOpportunities, generateBrandPitch } from '../services/geminiService';
import { Tab, SponsorshipOpportunity, BrandPitch } from '../types';
import Spinner from './Spinner';
import { Star, Link, Briefcase, ChevronDown, Copy, FileText, Send } from './Icons';
import { useToast } from '../contexts/ToastContext';
import ErrorDisplay from './ErrorDisplay';

interface BrandConnectProps {
  setActiveTab: (tab: Tab) => void;
}

const ScoreCircle: React.FC<{ score: string }> = ({ score }) => {
    const [value, total] = score.split('/').map(Number);
    if (isNaN(value) || isNaN(total)) {
        return <div className="w-16 h-16" />; // Return empty div if score is invalid
    }
    const percentage = total > 0 ? (value / total) * 100 : 0;
    const circumference = 2 * Math.PI * 20; // radius is 20
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    const getColor = () => {
        if (percentage >= 90) return 'text-green-400';
        if (percentage >= 75) return 'text-yellow-400';
        return 'text-orange-400';
    };

    return (
        <div className="relative w-16 h-16 flex-shrink-0" title={`Sponsor Match Score: ${score}`}>
            <svg className="w-full h-full" viewBox="0 0 44 44">
                <circle className="text-slate-700" strokeWidth="4" stroke="currentColor" fill="transparent" r="20" cx="22" cy="22" />
                <circle
                    className={getColor()}
                    strokeWidth="4"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="20"
                    cx="22"
                    cy="22"
                    style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'stroke-dashoffset 0.5s ease-in-out' }}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-lg font-bold ${getColor()}`}>{value}</span>
            </div>
        </div>
    );
};

const getCardStyle = (scoreString: string) => {
    if (!scoreString) return 'border-slate-700/50';
    const [value] = scoreString.split('/').map(Number);
    if (isNaN(value)) return 'border-slate-700/50';
    if (value >= 90) return 'border-green-400/50 bg-green-500/5';
    if (value >= 75) return 'border-yellow-400/50 bg-yellow-500/5';
    return 'border-slate-700/50';
};

const OpportunitySkeleton = () => (
    <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl animate-pulse flex flex-col">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <div className="h-6 w-3/4 bg-slate-700/50 rounded mb-2"></div>
          <div className="h-4 w-1/2 bg-slate-700/50 rounded mb-3"></div>
        </div>
        <div className="w-16 h-16 bg-slate-700/50 rounded-full"></div>
      </div>
      <div className="h-4 w-full bg-slate-700/50 rounded mb-2"></div>
      <div className="h-4 w-5/6 bg-slate-700/50 rounded mb-4"></div>
      <div className="h-10 w-full bg-slate-700/50 rounded-lg mt-auto"></div>
    </div>
);


const BrandConnect: React.FC<BrandConnectProps> = ({ setActiveTab }) => {
    const { user, logActivity, addContentToHistory } = useAuth();
    const { showToast } = useToast();
    const [loadingOpportunities, setLoadingOpportunities] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [opportunities, setOpportunities] = useState<SponsorshipOpportunity[]>([]);
    
    const compatibleChannels = user?.channels?.filter(c => c.platform === 'YouTube' || c.platform === 'TikTok') || [];
    const [selectedChannelId, setSelectedChannelId] = useState<string | null>(compatibleChannels[0]?.id || null);
    
    const [pitchData, setPitchData] = useState<{ [key: string]: { loading: boolean; error: string | null; pitch: BrandPitch | null } }>({});

    const handleFindSponsors = useCallback(async () => {
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
            setError(`Sponsor search for "${selectedChannel.platform}" channels is not supported.`);
            return;
        }

        setLoadingOpportunities(true);
        setError(null);
        setOpportunities([]);
        setPitchData({});
        try {
            const result = await findSponsorshipOpportunities(selectedChannel.url, selectedChannel.platform);
            setOpportunities(result);
            logActivity(`found ${result.length} sponsors for their ${selectedChannel.platform} channel`, 'Briefcase');
            addContentToHistory({
                type: 'Sponsorship Opportunities',
                summary: `Found ${result.length} sponsors for ${selectedChannel.platform} channel`,
                content: result
            });
        } catch (e: any) {
            setError(e.message || 'Failed to find sponsors.');
        } finally {
            setLoadingOpportunities(false);
        }
    }, [user?.channels, selectedChannelId, logActivity, addContentToHistory]);

    const handleGeneratePitch = useCallback(async (opportunity: SponsorshipOpportunity) => {
        if (!selectedChannelId || !user?.channels) return;
        const selectedChannel = user.channels.find(c => c.id === selectedChannelId);
        if (!selectedChannel) return;

        const key = opportunity.brandName;

        if (selectedChannel.platform !== 'YouTube' && selectedChannel.platform !== 'TikTok') {
            setPitchData(prev => ({ ...prev, [key]: { loading: false, error: 'Pitch generation is not supported for this platform.', pitch: null } }));
            return;
        }

        setPitchData(prev => ({ ...prev, [key]: { loading: true, error: null, pitch: null } }));

        try {
            const channelName = selectedChannel.url.split('/').pop() || user.name;
            const result = await generateBrandPitch(channelName, selectedChannel.platform, opportunity.brandName, opportunity.industry);
            setPitchData(prev => ({ ...prev, [key]: { loading: false, error: null, pitch: result } }));
             addContentToHistory({
                type: 'Brand Pitch',
                summary: `Pitch for ${opportunity.brandName}`,
                content: { opportunity, pitch: result }
            });
        } catch (e: any) {
            setPitchData(prev => ({ ...prev, [key]: { loading: false, error: 'Failed to generate pitch.', pitch: null } }));
        }
    }, [user?.channels, user?.name, selectedChannelId, addContentToHistory]);

    const handleCopyPitch = (pitch: BrandPitch) => {
        const fullPitch = `Subject: ${pitch.subject}\n\n${pitch.body}`;
        navigator.clipboard.writeText(fullPitch);
        showToast('Pitch copied to clipboard!');
    };

    if (user?.plan !== 'pro') {
        return (
            <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-8 shadow-xl backdrop-blur-xl text-center flex flex-col items-center animate-slide-in-up">
                <Star className="w-12 h-12 text-yellow-400 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Upgrade to Pro for Brand Connect</h2>
                <p className="text-slate-400 mb-6 max-w-md">Unlock the AI Sponsorship Finder & Pitch Generator (Pro feature). Find relevant brands and create professional pitches in seconds.</p>
                <button onClick={() => setActiveTab(Tab.Pricing)} title="View subscription plans to upgrade" className="button-primary">
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
                <p className="text-slate-400 mb-6 max-w-md">To find brand sponsors, please add a YouTube or TikTok channel URL to your profile first.</p>
                <button onClick={() => setActiveTab(Tab.Profile)} title="Go to your profile to connect a channel" className="button-primary">
                    Go to Profile
                </button>
            </div>
        )
    }

    return (
        <div className="animate-slide-in-up space-y-8">
            <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl">
                <h2 className="text-2xl font-bold text-center mb-1 text-slate-100 flex items-center justify-center gap-2">
                    <Briefcase className="w-6 h-6 text-violet-400" /> Brand Connect
                </h2>
                <p className="text-center text-slate-400 mb-6">Let AI find relevant sponsors and generate pitch emails for you.</p>
                
                <div className="max-w-xl mx-auto flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-grow">
                        <label htmlFor="channel-select-brand" className="sr-only">Select Channel</label>
                        <select
                            id="channel-select-brand"
                            value={selectedChannelId || ''}
                            onChange={(e) => setSelectedChannelId(e.target.value)}
                            title="Select one of your channels to find sponsors for"
                            className="w-full bg-slate-800 border border-slate-600 rounded-lg py-3 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-violet-light transition-all appearance-none"
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
                        onClick={handleFindSponsors}
                        disabled={loadingOpportunities || !selectedChannelId}
                        title="Start searching for potential sponsors (Pro feature)"
                        className="button-primary"
                    >
                        {loadingOpportunities ? <Spinner /> : 'Find Sponsors'}
                    </button>
                </div>

                <ErrorDisplay message={error} className="mt-4" />
            </div>

            {loadingOpportunities && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 3 }).map((_, i) => <OpportunitySkeleton key={i} />)}
                </div>
            )}
            
            {opportunities.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                    {opportunities.map((opp, index) => (
                        <div key={index} className={`bg-brand-glass border rounded-xl p-6 shadow-xl backdrop-blur-xl flex flex-col transition-all duration-300 hover:shadow-glow-md hover:-translate-y-1 ${getCardStyle(opp.sponsorMatchScore)}`}>
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-violet-300">{opp.brandName}</h3>
                                    <p className="text-sm text-slate-400 mb-3">{opp.industry}</p>
                                </div>
                                {opp.sponsorMatchScore && <ScoreCircle score={opp.sponsorMatchScore} />}
                            </div>
                            <p className="text-slate-300 text-sm flex-grow mb-4">{opp.relevance}</p>
                            
                            {pitchData[opp.brandName]?.pitch && (
                                <div className="mt-2 mb-4 bg-slate-800/50 p-3 rounded-lg border border-slate-700 space-y-2">
                                    <div className="flex justify-between items-center">
                                         <h4 className="font-semibold text-slate-200 text-sm">Generated Pitch:</h4>
                                          <button onClick={() => handleCopyPitch(pitchData[opp.brandName].pitch!)} title="Copy generated pitch" className="flex items-center gap-1.5 text-xs bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded-md">
                                            <Copy className="w-3 h-3"/> Copy
                                          </button>
                                    </div>
                                    <p className="text-xs text-slate-400"><strong>Subject:</strong> {pitchData[opp.brandName].pitch!.subject}</p>
                                    <pre className="text-xs text-slate-300 whitespace-pre-wrap font-sans max-h-32 overflow-y-auto">{pitchData[opp.brandName].pitch!.body}</pre>
                                </div>
                            )}

                            <button
                                onClick={() => handleGeneratePitch(opp)}
                                disabled={pitchData[opp.brandName]?.loading}
                                title={`Generate a pitch email for ${opp.brandName}`}
                                className="w-full mt-auto flex items-center justify-center text-sm bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                            >
                                {pitchData[opp.brandName]?.loading ? <Spinner size="sm" /> : <><Send className="w-4 h-4 mr-2"/> Generate Pitch</>}
                            </button>
                            {pitchData[opp.brandName]?.error && <p className="text-xs text-red-400 text-center mt-2">{pitchData[opp.brandName].error}</p>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BrandConnect;
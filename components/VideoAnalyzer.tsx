import React, { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { analyzeVideoUrl } from '../services/geminiService.ts';
import { VideoAnalysis, Tab } from '../types.ts';
import Spinner from './Spinner.tsx';
import { Star, Film, Lightbulb, CheckCircle, BarChart2 } from './Icons.tsx';

interface VideoAnalyzerProps {
  setActiveTab: (tab: Tab) => void;
}

const AnalysisSection: React.FC<{ title: string; icon: React.ReactNode; content: string | string[] }> = ({ title, icon, content }) => (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-xl font-bold text-violet-300 mb-3 flex items-center">{icon} {title}</h3>
        {Array.isArray(content) ? (
            <ul className="space-y-2">
                {content.map((item, index) => (
                    <li key={index} className="flex items-start text-sm">
                        <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-green-400 flex-shrink-0" />
                        <span className="text-slate-300">{item}</span>
                    </li>
                ))}
            </ul>
        ) : (
            <p className="text-slate-300 text-sm leading-relaxed">{content}</p>
        )}
    </div>
);

const VideoAnalyzer: React.FC<VideoAnalyzerProps> = ({ setActiveTab }) => {
    const { user, logActivity, addContentToHistory } = useAuth();
    const [videoUrl, setVideoUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<VideoAnalysis | null>(null);

    const handleAnalyze = useCallback(async () => {
        if (!videoUrl.trim().toLowerCase().startsWith('http')) {
            setError("Please enter a valid video URL.");
            return;
        }

        setLoading(true);
        setError(null);
        setAnalysis(null);
        try {
            const result = await analyzeVideoUrl(videoUrl);
            setAnalysis(result);
            logActivity(`analyzed video: "${videoUrl}"`, 'Film');
            addContentToHistory({
                type: 'Video Analysis',
                summary: `Analysis for video: "${result.title}"`,
                content: result
            });
        } catch (e: any) {
            setError(e.message || 'Failed to analyze video.');
        } finally {
            setLoading(false);
        }
    }, [videoUrl, logActivity, addContentToHistory]);

    if (user?.plan !== 'pro') {
        return (
            <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-8 shadow-xl backdrop-blur-xl text-center flex flex-col items-center animate-slide-in-up">
                <Star className="w-12 h-12 text-yellow-400 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Upgrade to Pro for the Video Analyzer</h2>
                <p className="text-slate-400 mb-6 max-w-md">Get in-depth AI analysis of any YouTube or TikTok video to understand what makes it successful.</p>
                <button onClick={() => setActiveTab(Tab.Pricing)} className="flex items-center gap-2 bg-gradient-to-r from-violet-dark to-violet-light text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity shadow-md hover:shadow-lg hover:shadow-violet/30">
                    View Plans
                </button>
            </div>
        );
    }

    return (
        <div className="animate-slide-in-up space-y-8">
            <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl">
                <h2 className="text-2xl font-bold text-center mb-1 text-slate-100 flex items-center justify-center gap-2">
                    <Film className="w-6 h-6 text-violet-400" /> Video Analyzer
                </h2>
                <p className="text-center text-slate-400 mb-6">Enter a YouTube or TikTok video URL to get an AI-powered breakdown.</p>
                
                <div className="max-w-xl mx-auto flex flex-col sm:flex-row gap-4">
                    <input
                        type="url"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="Paste video URL here..."
                        className="flex-grow w-full bg-slate-800 border border-slate-700 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-violet-light transition-all shadow-inner"
                    />
                    <button
                        onClick={handleAnalyze}
                        disabled={loading}
                        className="flex items-center justify-center bg-gradient-to-r from-violet-dark to-violet-light text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {loading ? <Spinner /> : 'Analyze Video'}
                    </button>
                </div>

                {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
            </div>

            {loading && (
                <div className="text-center py-10">
                    <Spinner size="lg" />
                    <p className="mt-4 text-slate-300">AI is watching the video... this might take a moment.</p>
                </div>
            )}

            {analysis && (
                 <div className="mt-8 bg-brand-glass border border-slate-700/50 rounded-xl p-6 sm:p-8 shadow-xl backdrop-blur-xl animate-fade-in space-y-6">
                    <h2 className="text-2xl font-bold text-center text-white -mb-2">{analysis.title}</h2>
                    <AnalysisSection 
                        title="AI Summary"
                        icon={<Lightbulb className="w-5 h-5 mr-2" />}
                        content={analysis.aiSummary}
                    />
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <AnalysisSection 
                            title="Content Analysis"
                            icon={<Film className="w-5 h-5 mr-2" />}
                            content={analysis.contentAnalysis}
                        />
                         <AnalysisSection 
                            title="Engagement Analysis"
                            icon={<BarChart2 className="w-5 h-5 mr-2" />}
                            content={analysis.engagementAnalysis}
                        />
                    </div>
                     <AnalysisSection 
                        title="Improvement Suggestions"
                        icon={<Star className="w-5 h-5 mr-2" />}
                        content={analysis.improvementSuggestions}
                    />
                 </div>
            )}
        </div>
    );
};

export default VideoAnalyzer;

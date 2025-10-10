'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { analyzeVideoUrl } from '../services/geminiService';
import { VideoAnalysis } from '../types';
import Spinner from './Spinner';
import { Film, Search, Sparkles, ThumbsUp, Lightbulb, CheckCircle } from './Icons';
import { useAuth } from '../contexts/AuthContext';

interface VideoAnalyzerProps {
  initialInput?: string | null;
}

const VideoAnalyzer: React.FC<VideoAnalyzerProps> = ({ initialInput }) => {
    const { logActivity, addContentToHistory } = useAuth();
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<VideoAnalysis | null>(null);

    const handleAnalyze = useCallback(async (urlOverride?: string) => {
        const urlToAnalyze = urlOverride || url;
        if (!urlToAnalyze.trim().toLowerCase().startsWith('http')) {
            setError('Please enter a valid video URL (e.g., from YouTube or TikTok).');
            return;
        }
        setLoading(true);
        setError(null);
        setAnalysis(null);
        try {
            const result = await analyzeVideoUrl(urlToAnalyze);
            setAnalysis(result);
            logActivity(`analyzed video: ${urlToAnalyze}`, 'Film');
            addContentToHistory({
                type: 'Video Analysis',
                summary: `Analysis for video: ${result.title}`,
                content: result
            });
        } catch (e: any) {
            setError(e.message || 'An error occurred while analyzing the video.');
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [url, logActivity, addContentToHistory]);

    useEffect(() => {
        if (initialInput) {
            setUrl(initialInput);
            handleAnalyze(initialInput);
        }
    }, [initialInput, handleAnalyze]);

    return (
        <div className="animate-slide-in-up">
            <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl">
                <h2 className="text-2xl font-bold text-center mb-1 text-slate-100 text-glow flex items-center justify-center gap-2">
                    <Film className="w-6 h-6 text-violet-400" /> AI Video Analyzer
                </h2>
                <p className="text-center text-slate-400 mb-6">Get an AI breakdown of any video's performance and content.</p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Paste a YouTube or TikTok video URL..."
                        title="Paste the URL of the video you want to analyze"
                        className="form-input flex-grow"
                    />
                    <button
                        onClick={() => handleAnalyze()}
                        disabled={loading}
                        title="Start AI analysis of the video"
                        className="button-primary flex items-center justify-center"
                    >
                        {loading ? <Spinner /> : <><Search className="w-5 h-5 mr-2" /> Analyze Video</>}
                    </button>
                </div>
                {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
            </div>

            {loading && (
                <div className="text-center py-10">
                    <Spinner size="lg" />
                    <p className="mt-4 text-slate-300">AI is watching the video and taking notes...</p>
                </div>
            )}
            
            {analysis && (
                <div className="mt-8 bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl animate-fade-in space-y-6">
                    <h3 className="text-2xl font-bold text-white text-glow">{analysis.title}</h3>
                    
                    <div className="interactive-card-nested">
                        <h4 className="card-title"><Sparkles className="w-5 h-5 text-violet-300" /> AI Summary</h4>
                        <p className="card-content">{analysis.aiSummary}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="interactive-card-nested">
                            <h4 className="card-title"><ThumbsUp className="w-5 h-5 text-blue-300" /> Engagement Analysis</h4>
                            <p className="card-content">{analysis.engagementAnalysis}</p>
                        </div>
                        <div className="interactive-card-nested">
                            <h4 className="card-title"><Lightbulb className="w-5 h-5 text-yellow-300" /> Content Analysis</h4>
                            <p className="card-content">{analysis.contentAnalysis}</p>
                        </div>
                    </div>

                    <div className="interactive-card-nested">
                        <h4 className="card-title"><CheckCircle className="w-5 h-5 text-green-300" /> Improvement Suggestions</h4>
                        <ul className="space-y-2">
                            {analysis.improvementSuggestions.map((suggestion, i) => (
                                <li key={i} className="flex items-start text-sm">
                                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-3 mt-1.5 flex-shrink-0"></div>
                                    <span className="text-slate-300">{suggestion}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoAnalyzer;
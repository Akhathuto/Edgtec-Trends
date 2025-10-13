import React, { useState, useCallback } from 'react';
import { analyzeVideoUrl } from '../services/geminiService';
import { VideoAnalysis } from '../types';
import Spinner from './Spinner';
import { Film, Link, CheckCircle } from './Icons';
import ErrorDisplay from './ErrorDisplay';

const VideoAnalyzer: React.FC = () => {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<VideoAnalysis | null>(null);

    const handleAnalyze = useCallback(async () => {
        if (!url.trim()) {
            setError('Please enter a video URL.');
            return;
        }
        setLoading(true);
        setError(null);
        setAnalysis(null);

        try {
            const result = await analyzeVideoUrl(url);
            setAnalysis(result);
        } catch (e: any) {
            setError(e.message || 'An error occurred during analysis.');
        } finally {
            setLoading(false);
        }
    }, [url]);

    return (
        <div className="animate-slide-in-up space-y-8">
            <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl">
                <h2 className="text-2xl font-bold text-center mb-1 text-slate-100 flex items-center justify-center gap-2">
                    <Film className="w-6 h-6 text-violet-400" /> AI Video Analyzer
                </h2>
                <p className="text-center text-slate-400 mb-6">Get an AI breakdown of any YouTube or TikTok video.</p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Enter video URL..." className="form-input flex-grow"/>
                    <button onClick={handleAnalyze} disabled={loading} className="button-primary">{loading ? <Spinner/> : 'Analyze'}</button>
                </div>
                <ErrorDisplay message={error} className="mt-4" />
            </div>

            {loading && (
                <div className="text-center py-10"><Spinner size="lg" /><p className="mt-4 text-slate-300">Analyzing video...</p></div>
            )}

            {analysis && (
                <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl animate-fade-in space-y-6">
                    <h3 className="text-2xl font-bold text-white">{analysis.title}</h3>
                    <div className="space-y-4">
                        <div><h4 className="font-semibold text-violet-300">AI Summary</h4><p className="text-slate-300">{analysis.aiSummary}</p></div>
                        <div><h4 className="font-semibold text-violet-300">Content Analysis</h4><p className="text-slate-300">{analysis.contentAnalysis}</p></div>
                        <div><h4 className="font-semibold text-violet-300">Engagement Analysis</h4><p className="text-slate-300">{analysis.engagementAnalysis}</p></div>
                        <div><h4 className="font-semibold text-violet-300">Improvement Suggestions</h4>
                            <ul className="space-y-2 mt-2">
                                {analysis.improvementSuggestions.map((s, i) => <li key={i} className="flex items-start"><CheckCircle className="w-4 h-4 text-green-400 mr-2 mt-1 flex-shrink-0"/>{s}</li>)}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoAnalyzer;

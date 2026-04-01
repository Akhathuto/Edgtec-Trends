import React, { useState, useCallback, useMemo } from 'react';
import { analyzeVideoUrl } from '../services/geminiService';
import { ToolId, VideoAnalysis } from '../types';
import Spinner from '../components/Spinner';
import { Film, Link, CheckCircle } from '../components/Icons';
import ErrorDisplay from '../components/ErrorDisplay';

import { AIContent } from '../components/AIContent';

interface VideoAnalyzerProps {
    onNavigate: (toolId: ToolId, state?: any) => void;
}

export const VideoAnalyzer: React.FC<VideoAnalyzerProps> = ({ onNavigate }) => {
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

    const analysisMarkdown = useMemo(() => {
        if (!analysis) return '';
        return `
### AI Summary
${analysis.aiSummary}

### Content Analysis
${analysis.contentAnalysis}

### Engagement Analysis
${analysis.engagementAnalysis}

### Improvement Suggestions
${analysis.improvementSuggestions.map(s => `* ${s}`).join('\n')}
        `.trim();
    }, [analysis]);

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
                <div className="space-y-6">
                    <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl">
                        <h3 className="text-2xl font-bold text-white mb-2">{analysis.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                            <Link className="w-4 h-4" />
                            <a href={url} target="_blank" rel="noopener noreferrer" className="hover:text-violet-400 transition-colors truncate">{url}</a>
                        </div>
                    </div>
                    
                    <AIContent 
                        content={analysisMarkdown} 
                        type="insight" 
                        className="w-full"
                    />
                </div>
            )}
        </div>
    );
};

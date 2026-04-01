import React, { useState, useCallback } from 'react';
import { repurposeVideoContent } from '../services/geminiService';
import { RepurposedContent } from '../types';
import Spinner from '../components/Spinner';
import { RefreshCw, Link, Twitter, FileText } from '../components/Icons';
import ErrorDisplay from '../components/ErrorDisplay';
import { useToast } from '../contexts/ToastContext';

import { ToolId } from '../types';

interface ContentRepurposingProps {
  onNavigate: (toolId: ToolId, state?: any) => void;
}

import { AIContent } from '../components/AIContent';

export const ContentRepurposing: React.FC<ContentRepurposingProps> = ({ onNavigate }) => {
    const { showToast } = useToast();
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [content, setContent] = useState<RepurposedContent | null>(null);

    const handleRepurpose = useCallback(async () => {
        if (!url.trim()) {
            setError('Please enter a video URL.');
            return;
        }
        setLoading(true);
        setError(null);
        setContent(null);

        try {
            const result = await repurposeVideoContent(url);
            setContent(result);
        } catch (e: any) {
            setError(e.message || 'An error occurred while repurposing content.');
        } finally {
            setLoading(false);
        }
    }, [url]);

    return (
        <div className="animate-slide-in-up space-y-8">
            <div className="premium-card rounded-2xl p-8 shadow-2xl">
                <div className="flex flex-col items-center mb-8">
                    <div className="p-4 bg-violet-500/10 rounded-2xl border border-violet-500/20 mb-4 animate-float">
                        <RefreshCw className="w-8 h-8 text-violet-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Repurpose Content</h2>
                    <p className="text-slate-400 mt-2">Transform a single video into a multi-platform content strategy.</p>
                </div>

                <div className="max-w-2xl mx-auto">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-grow">
                            <Link className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input 
                                type="url" 
                                value={url} 
                                onChange={(e) => setUrl(e.target.value)} 
                                placeholder="Paste YouTube or TikTok URL..." 
                                className="form-input pl-11 bg-slate-950/50 border-white/10"
                            />
                        </div>
                        <button 
                            onClick={handleRepurpose} 
                            disabled={loading} 
                            className="button-primary px-8 py-3 h-12 flex items-center justify-center min-w-[140px]"
                        >
                            {loading ? <Spinner/> : 'Repurpose'}
                        </button>
                    </div>
                    <ErrorDisplay message={error} className="mt-4" />
                </div>
            </div>

            {loading && (
                <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                    <div className="relative">
                        <Spinner size="lg" />
                        <div className="absolute inset-0 bg-violet-500/20 blur-xl rounded-full" />
                    </div>
                    <p className="mt-6 text-slate-300 font-medium tracking-wide">AI is analyzing your content...</p>
                </div>
            )}

            {content && (
                <div className="grid grid-cols-1 gap-8 animate-fade-in">
                    <AIContent 
                        content={content.blogPost} 
                        type="repurpose" 
                        title="Blog Post Draft" 
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <AIContent 
                            content={content.tweetThread.join('\n\n')} 
                            type="repurpose" 
                            title="Twitter Thread" 
                        />
                        <AIContent 
                            content={content.linkedInPost} 
                            type="repurpose" 
                            title="LinkedIn Strategy" 
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

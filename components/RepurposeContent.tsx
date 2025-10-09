

import React, { useState, useCallback, useEffect } from 'react';
import { repurposeVideoContent } from '../services/geminiService.ts';
import { RepurposedContent } from '../types.ts';
import Spinner from './Spinner.tsx';
import { RefreshCw, Search, FileText, Copy } from './Icons.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useToast } from '../contexts/ToastContext.tsx';

interface RepurposeContentProps {
  initialInput?: string | null;
}

const RepurposeContent: React.FC<RepurposeContentProps> = ({ initialInput }) => {
    const { logActivity, addContentToHistory } = useAuth();
    const { showToast } = useToast();
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [content, setContent] = useState<RepurposedContent | null>(null);

    const handleRepurpose = useCallback(async (urlOverride?: string) => {
        const urlToRepurpose = urlOverride || url;
        if (!urlToRepurpose.trim().toLowerCase().startsWith('http')) {
            setError('Please enter a valid video URL (e.g., from YouTube or TikTok).');
            return;
        }
        setLoading(true);
        setError(null);
        setContent(null);
        try {
            const result = await repurposeVideoContent(urlToRepurpose);
            setContent(result);
            logActivity(`repurposed content from: ${urlToRepurpose}`, 'RefreshCw');
            addContentToHistory({
                type: 'Repurposed Content',
                summary: `Repurposed content from video URL`,
                content: result
            });
        } catch (e: any) {
            setError(e.message || 'An error occurred while repurposing content.');
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [url, logActivity, addContentToHistory]);

    useEffect(() => {
        if (initialInput) {
            setUrl(initialInput);
            handleRepurpose(initialInput);
        }
    }, [initialInput, handleRepurpose]);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        showToast('Content copied to clipboard!');
    };

    return (
        <div className="animate-slide-in-up">
            <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl">
                <h2 className="text-2xl font-bold text-center mb-1 text-slate-100 text-glow flex items-center justify-center gap-2">
                    <RefreshCw className="w-6 h-6 text-violet-400" /> AI Content Repurposer
                </h2>
                <p className="text-center text-slate-400 mb-6">Turn one video into a blog post, tweet thread, and LinkedIn post.</p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Paste a YouTube or TikTok video URL..."
                        title="Paste the URL of the video to repurpose"
                        className="form-input flex-grow"
                    />
                    <button
                        onClick={() => handleRepurpose()}
                        disabled={loading}
                        title="Generate repurposed content from this video"
                        className="button-primary flex items-center justify-center"
                    >
                        {loading ? <Spinner /> : <><RefreshCw className="w-5 h-5 mr-2" /> Repurpose</>}
                    </button>
                </div>
                {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
            </div>

            {loading && (
                <div className="text-center py-10">
                    <Spinner size="lg" />
                    <p className="mt-4 text-slate-300">AI is creating new content formats for you...</p>
                </div>
            )}
            
            {content && (
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
                    {/* Blog Post */}
                    <div className="interactive-card lg:col-span-2">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="card-title"><FileText className="w-5 h-5 text-violet-300" /> Blog Post</h3>
                            <button onClick={() => handleCopy(content.blogPost)} title="Copy blog post" className="button-copy"><Copy className="w-4 h-4 mr-1"/> Copy</button>
                        </div>
                        <div className="prose prose-sm prose-invert max-w-none text-slate-300 bg-slate-800/50 p-3 rounded-md border border-slate-700 max-h-80 overflow-y-auto">
                            <p>{content.blogPost}</p>
                        </div>
                    </div>
                    
                    <div className="space-y-6">
                        {/* Tweet Thread */}
                        <div className="interactive-card">
                             <div className="flex justify-between items-center mb-2">
                                <h3 className="card-title">Tweet Thread</h3>
                                <button onClick={() => handleCopy(content.tweetThread.join('\n\n'))} title="Copy tweet thread" className="button-copy"><Copy className="w-4 h-4 mr-1"/> Copy</button>
                            </div>
                            <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                {content.tweetThread.map((tweet, i) => (
                                    <p key={i} className="text-sm text-slate-300 bg-slate-800/50 p-2 rounded-md border border-slate-700">{i+1}/ {tweet}</p>
                                ))}
                            </div>
                        </div>
                        {/* LinkedIn Post */}
                         <div className="interactive-card">
                             <div className="flex justify-between items-center mb-2">
                                <h3 className="card-title">LinkedIn Post</h3>
                                <button onClick={() => handleCopy(content.linkedInPost)} title="Copy LinkedIn post" className="button-copy"><Copy className="w-4 h-4 mr-1"/> Copy</button>
                            </div>
                            <p className="text-sm text-slate-300 bg-slate-800/50 p-2 rounded-md border border-slate-700 max-h-40 overflow-y-auto">{content.linkedInPost}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RepurposeContent;
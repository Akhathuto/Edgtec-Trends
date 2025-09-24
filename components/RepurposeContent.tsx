import React, { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { repurposeVideoContent } from '../services/geminiService.ts';
import { RepurposedContent, Tab } from '../types.ts';
import Spinner from './Spinner.tsx';
import { Star, RefreshCw, Copy } from './Icons.tsx';
import { useToast } from '../contexts/ToastContext.tsx';

interface RepurposeContentProps {
  setActiveTab: (tab: Tab) => void;
}

const ResultCard: React.FC<{ title: string; children: React.ReactNode; onCopy: () => void }> = ({ title, children, onCopy }) => (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 relative">
        <button 
            onClick={onCopy}
            className="absolute top-4 right-4 flex items-center gap-2 text-xs bg-slate-700 hover:bg-slate-600 text-white font-semibold py-1.5 px-3 rounded-lg transition-colors"
            title={`Copy ${title}`}
        >
            <Copy className="w-3 h-3" /> Copy
        </button>
        <h3 className="text-xl font-bold text-violet-300 mb-3">{title}</h3>
        <div className="prose prose-sm prose-invert max-w-none text-slate-300">
            {children}
        </div>
    </div>
);

const RepurposeContent: React.FC<RepurposeContentProps> = ({ setActiveTab }) => {
    const { user, logActivity, addContentToHistory } = useAuth();
    const { showToast } = useToast();
    const [videoUrl, setVideoUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [content, setContent] = useState<RepurposedContent | null>(null);

    const handleRepurpose = useCallback(async () => {
        if (!videoUrl.trim().toLowerCase().startsWith('http')) {
            setError("Please enter a valid video URL.");
            return;
        }

        setLoading(true);
        setError(null);
        setContent(null);
        try {
            const result = await repurposeVideoContent(videoUrl);
            setContent(result);
            logActivity(`repurposed video: "${videoUrl}"`, 'RefreshCw');
            addContentToHistory({
                type: 'Repurposed Content',
                summary: `Repurposed content from video: ${videoUrl}`,
                content: result
            });
        } catch (e: any) {
            setError(e.message || 'Failed to repurpose video.');
        } finally {
            setLoading(false);
        }
    }, [videoUrl, logActivity, addContentToHistory]);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        showToast("Content copied to clipboard!");
    };

    if (user?.plan !== 'pro') {
        return (
            <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-8 shadow-xl backdrop-blur-xl text-center flex flex-col items-center animate-slide-in-up">
                <Star className="w-12 h-12 text-yellow-400 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Upgrade to Pro to Repurpose Content</h2>
                <p className="text-slate-400 mb-6 max-w-md">Automatically convert your videos into blog posts, tweet threads, and LinkedIn updates with AI.</p>
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
                    <RefreshCw className="w-6 h-6 text-violet-400" /> Repurpose Content
                </h2>
                <p className="text-center text-slate-400 mb-6">Turn one video into multiple pieces of content instantly.</p>
                
                <div className="max-w-xl mx-auto flex flex-col sm:flex-row gap-4">
                    <input
                        type="url"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="Paste YouTube or TikTok URL..."
                        className="flex-grow w-full bg-slate-800 border border-slate-700 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-violet-light transition-all shadow-inner"
                    />
                    <button
                        onClick={handleRepurpose}
                        disabled={loading}
                        className="flex items-center justify-center bg-gradient-to-r from-violet-dark to-violet-light text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {loading ? <Spinner /> : 'Repurpose'}
                    </button>
                </div>

                {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
            </div>

            {loading && (
                <div className="text-center py-10">
                    <Spinner size="lg" />
                    <p className="mt-4 text-slate-300">AI is repurposing your content...</p>
                </div>
            )}

            {content && (
                 <div className="mt-8 animate-fade-in space-y-6">
                    <ResultCard title="Blog Post" onCopy={() => handleCopy(content.blogPost)}>
                        <div dangerouslySetInnerHTML={{ __html: content.blogPost.replace(/\n/g, '<br />').replace(/## (.*)/g, '<h3>$1</h3>') }} />
                    </ResultCard>
                    <ResultCard title="Tweet Thread" onCopy={() => handleCopy(content.tweetThread.join('\n\n'))}>
                         <div className="space-y-4">
                            {content.tweetThread.map((tweet, index) => (
                                <p key={index} className="p-3 bg-slate-900/50 rounded-md border border-slate-700">
                                    {index + 1}/{content.tweetThread.length}: {tweet}
                                </p>
                            ))}
                        </div>
                    </ResultCard>
                    <ResultCard title="LinkedIn Post" onCopy={() => handleCopy(content.linkedInPost)}>
                        <div dangerouslySetInnerHTML={{ __html: content.linkedInPost.replace(/\n/g, '<br />') }} />
                    </ResultCard>
                 </div>
            )}
        </div>
    );
};

export default RepurposeContent;
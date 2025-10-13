import React, { useState, useCallback } from 'react';
import { repurposeVideoContent } from '../services/geminiService';
import { RepurposedContent } from '../types';
import Spinner from './Spinner';
import { RefreshCw, Link, Twitter, FileText } from './Icons';
import ErrorDisplay from './ErrorDisplay';
import { useToast } from '../contexts/ToastContext';

const RepurposeContent: React.FC = () => {
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

    const handleCopy = (text: string, type: string) => {
        navigator.clipboard.writeText(text);
        showToast(`${type} copied to clipboard!`);
    }

    return (
        <div className="animate-slide-in-up space-y-8">
            <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl">
                <h2 className="text-2xl font-bold text-center mb-1 text-slate-100 flex items-center justify-center gap-2">
                    <RefreshCw className="w-6 h-6 text-violet-400" /> Repurpose Content
                </h2>
                <p className="text-center text-slate-400 mb-6">Turn one video into multiple assets.</p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Enter video URL..." className="form-input flex-grow"/>
                    <button onClick={handleRepurpose} disabled={loading} className="button-primary">{loading ? <Spinner/> : 'Repurpose'}</button>
                </div>
                <ErrorDisplay message={error} className="mt-4" />
            </div>

            {loading && (
                <div className="text-center py-10"><Spinner size="lg" /><p className="mt-4 text-slate-300">Repurposing content...</p></div>
            )}

            {content && (
                <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl animate-fade-in space-y-6">
                    <div>
                        <h3 className="text-xl font-bold text-violet-300 mb-2 flex items-center gap-2"><FileText /> Blog Post</h3>
                        <div className="prose prose-invert max-w-none bg-slate-800/50 p-4 rounded-lg border border-slate-700" dangerouslySetInnerHTML={{ __html: content.blogPost.replace(/\n/g, '<br/>') }}></div>
                        <button onClick={() => handleCopy(content.blogPost, 'Blog Post')} className="button-secondary mt-2">Copy</button>
                    </div>
                     <div>
                        <h3 className="text-xl font-bold text-violet-300 mb-2 flex items-center gap-2"><Twitter /> Tweet Thread</h3>
                        <div className="space-y-2 bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                            {content.tweetThread.map((tweet, i) => <p key={i} className="text-sm border-b border-slate-700 pb-2 last:border-b-0">{i + 1}. {tweet}</p>)}
                        </div>
                        <button onClick={() => handleCopy(content.tweetThread.join('\n\n'), 'Tweet Thread')} className="button-secondary mt-2">Copy</button>
                    </div>
                     <div>
                        <h3 className="text-xl font-bold text-violet-300 mb-2 flex items-center gap-2"><Link /> LinkedIn Post</h3>
                        <div className="prose prose-invert max-w-none bg-slate-800/50 p-4 rounded-lg border border-slate-700" dangerouslySetInnerHTML={{ __html: content.linkedInPost.replace(/\n/g, '<br/>') }}></div>
                        <button onClick={() => handleCopy(content.linkedInPost, 'LinkedIn Post')} className="button-secondary mt-2">Copy</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RepurposeContent;

import React, { useState, useCallback } from 'react';
import { generateCommentResponse } from '../services/geminiService';
import Spinner from '../components/Spinner';
import { MessageSquare, Copy, RefreshCw } from '../components/Icons';
import ErrorDisplay from '../components/ErrorDisplay';
import { useToast } from '../contexts/ToastContext';

import { ToolId } from '../types';

interface EngagementToolsProps {
  onNavigate: (toolId: ToolId, state?: any) => void;
}

export const EngagementTools: React.FC<EngagementToolsProps> = ({ onNavigate }) => {
    const { showToast } = useToast();
    const [comment, setComment] = useState('');
    const [tone, setTone] = useState<'friendly' | 'professional' | 'funny' | 'witty'>('friendly');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [reply, setReply] = useState<string | null>(null);

    const handleGenerateReply = useCallback(async () => {
        if (!comment.trim()) {
            setError('Please enter a comment.');
            return;
        }
        setLoading(true);
        setError(null);
        setReply(null);

        try {
            const result = await generateCommentResponse(comment, tone);
            setReply(result);
        } catch (e: any) {
            setError(e.message || 'An error occurred while generating reply.');
        } finally {
            setLoading(false);
        }
    }, [comment, tone]);

    const handleCopy = () => {
        if (reply) {
            navigator.clipboard.writeText(reply);
            showToast('Reply copied to clipboard!');
        }
    }

    return (
        <div className="animate-slide-in-up space-y-8">
            <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl">
                <h2 className="text-2xl font-bold text-center mb-1 text-slate-100 flex items-center justify-center gap-2">
                    <MessageSquare className="w-6 h-6 text-violet-400" /> AI Comment Responder
                </h2>
                <p className="text-center text-slate-400 mb-6">Generate perfect replies to your audience.</p>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">The Comment</label>
                        <textarea 
                            value={comment} 
                            onChange={(e) => setComment(e.target.value)} 
                            placeholder="Paste a comment here..." 
                            className="form-input w-full h-32 resize-none"
                        />
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4 items-end">
                        <div className="flex-grow">
                            <label className="block text-sm font-medium text-slate-300 mb-2">Tone</label>
                            <div className="segmented-control">
                                <button onClick={() => setTone('friendly')} className={tone === 'friendly' ? 'active' : ''}>Friendly</button>
                                <button onClick={() => setTone('professional')} className={tone === 'professional' ? 'active' : ''}>Professional</button>
                                <button onClick={() => setTone('funny')} className={tone === 'funny' ? 'active' : ''}>Funny</button>
                                <button onClick={() => setTone('witty')} className={tone === 'witty' ? 'active' : ''}>Witty</button>
                            </div>
                        </div>
                        <button onClick={handleGenerateReply} disabled={loading} className="button-primary whitespace-nowrap">
                            {loading ? <Spinner /> : 'Generate Reply'}
                        </button>
                    </div>
                </div>
                
                <ErrorDisplay message={error} className="mt-4" />
            </div>

            {loading && (
                <div className="text-center py-10">
                    <Spinner size="lg" />
                    <p className="mt-4 text-slate-300">Crafting the perfect response...</p>
                </div>
            )}

            {reply && (
                <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl animate-fade-in">
                    <h3 className="text-xl font-bold text-violet-300 mb-4 flex items-center gap-2">
                        <RefreshCw className="w-5 h-5" /> Suggested Reply
                    </h3>
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 text-slate-200 leading-relaxed">
                        {reply}
                    </div>
                    <div className="flex gap-4 mt-6">
                        <button onClick={handleCopy} className="button-secondary flex items-center gap-2">
                            <Copy className="w-4 h-4" /> Copy to Clipboard
                        </button>
                        <button onClick={handleGenerateReply} className="button-secondary">
                            Try Another
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

import React, { useState, useCallback } from 'react';
import { generateCommentResponse } from '../services/geminiService';
import Spinner from './Spinner';
import { MessageSquare, Copy } from './Icons';
import ErrorDisplay from './ErrorDisplay';
import { useToast } from '../contexts/ToastContext';

const tones = ['Friendly', 'Witty', 'Professional', 'Enthusiastic', 'Grateful'];

const CommentResponder: React.FC = () => {
    const { showToast } = useToast();
    const [comment, setComment] = useState('');
    const [tone, setTone] = useState(tones[0]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [response, setResponse] = useState('');

    const handleGenerate = useCallback(async () => {
        if (!comment.trim()) {
            setError('Please enter a comment to respond to.');
            return;
        }
        setLoading(true);
        setError(null);
        setResponse('');

        try {
            const result = await generateCommentResponse(comment, tone);
            setResponse(result);
        } catch (e: any) {
            setError(e.message || 'An error occurred while generating the response.');
        } finally {
            setLoading(false);
        }
    }, [comment, tone]);
    
    const handleCopy = () => {
        if (response) {
            navigator.clipboard.writeText(response);
            showToast('Response copied to clipboard!');
        }
    };

    return (
        <div className="animate-slide-in-up space-y-8">
            <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl">
                <h2 className="text-2xl font-bold text-center mb-1 text-slate-100 flex items-center justify-center gap-2">
                    <MessageSquare className="w-6 h-6 text-violet-400" /> AI Comment Responder
                </h2>
                <p className="text-center text-slate-400 mb-6">Generate engaging replies to your audience's comments.</p>
                
                <div className="space-y-4">
                    <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Paste a user's comment here..." className="form-input h-24" />
                    <div>
                        <label className="input-label">Response Tone</label>
                        <div className="flex flex-wrap gap-2">
                            {tones.map(t => <button key={t} onClick={() => setTone(t)} className={`px-3 py-1.5 text-sm rounded-full transition-colors ${tone === t ? 'bg-violet text-white font-semibold' : 'bg-slate-700 hover:bg-slate-600'}`}>{t}</button>)}
                        </div>
                    </div>
                    <button onClick={handleGenerate} disabled={loading} className="button-primary w-full">{loading ? <Spinner/> : 'Generate Reply'}</button>
                </div>
                <ErrorDisplay message={error} className="mt-4" />
            </div>

            {(loading || response) && (
                 <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl animate-fade-in">
                    <h3 className="text-xl font-bold text-violet-300 mb-2">Generated Reply</h3>
                    {loading ? <div className="space-y-2"><div className="h-4 w-full bg-slate-700 rounded animate-pulse"></div><div className="h-4 w-3/4 bg-slate-700 rounded animate-pulse"></div></div> : (
                        <div>
                            <p className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 text-slate-300">{response}</p>
                            <button onClick={handleCopy} className="button-secondary mt-4"><Copy className="w-4 h-4 mr-2"/> Copy</button>
                        </div>
                    )}
                 </div>
            )}
        </div>
    );
};

export default CommentResponder;

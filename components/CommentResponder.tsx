import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { useAuth } from '../contexts/AuthContext.tsx';
import Spinner from './Spinner.tsx';
import { MessageSquare, RefreshCw, Copy, Sparkles } from './Icons.tsx';
import { useToast } from '../contexts/ToastContext.tsx';

const tones = ['Friendly', 'Professional', 'Witty', 'Grateful', 'Inquisitive'];

// FIX: Initialized the GoogleGenAI client statically to resolve the Vite build warning
// about mixed dynamic and static imports.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const CommentResponder: React.FC = () => {
    const { logActivity } = useAuth();
    const { showToast } = useToast();
    const [comment, setComment] = useState('');
    const [tone, setTone] = useState(tones[0]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [response, setResponse] = useState<string | null>(null);

    const handleGenerate = useCallback(async () => {
        if (!comment.trim()) {
            setError('Please enter a comment to respond to.');
            return;
        }

        setLoading(true);
        setError(null);
        setResponse(null);

        try {
            const geminiResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Generate a concise, engaging, and ${tone.toLowerCase()} reply to the following user comment on a video: "${comment}". The reply should encourage further engagement. Do not include your own username or signature.`,
            });
            setResponse(geminiResponse.text);
            logActivity(`generated a ${tone} reply to a comment`, 'MessageSquare');
        } catch (e: any) {
            setError(e.message || 'An error occurred while generating the response.');
        } finally {
            setLoading(false);
        }
    }, [comment, tone, logActivity]);

    const handleCopy = () => {
        if (response) {
            navigator.clipboard.writeText(response);
            showToast('Response copied to clipboard!');
        }
    };

    return (
        <div className="animate-slide-in-up max-w-2xl mx-auto">
            <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl">
                <h2 className="text-2xl font-bold text-center mb-1 text-slate-100 flex items-center justify-center gap-2">
                    <MessageSquare className="w-6 h-6 text-violet-400" /> AI Comment Responder
                </h2>
                <p className="text-center text-slate-400 mb-6">Craft the perfect reply to any comment in seconds.</p>

                <div className="space-y-4">
                    <div>
                        <label htmlFor="comment-input" className="block text-sm font-medium text-slate-300 mb-1">Comment to reply to:</label>
                        <textarea
                            id="comment-input"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="e.g., 'This was the best video I've seen all week!'"
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-violet-light transition-all resize-none h-24 shadow-inner"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Response Tone:</label>
                        <div className="flex flex-wrap gap-2">
                            {tones.map(t => (
                                <button
                                    key={t}
                                    onClick={() => setTone(t)}
                                    className={`px-3 py-1.5 text-sm font-semibold rounded-full transition-colors ${tone === t ? 'bg-violet text-white' : 'bg-slate-700/50 hover:bg-slate-600/50'}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="w-full flex items-center justify-center bg-gradient-to-r from-violet-dark to-violet-light text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                    >
                        {loading ? <Spinner /> : <><Sparkles className="w-5 h-5 mr-2" /> Generate Reply</>}
                    </button>
                    {error && <p className="text-red-400 text-center">{error}</p>}
                </div>

                {response && (
                    <div className="mt-6 pt-6 border-t border-slate-700/50 animate-fade-in">
                        <h3 className="font-bold text-lg text-slate-200 mb-2">Generated Reply:</h3>
                        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                            <p className="text-slate-300 whitespace-pre-wrap">{response}</p>
                        </div>
                        <div className="mt-4 flex gap-4">
                            <button
                                onClick={handleCopy}
                                className="w-full flex items-center justify-center text-sm font-semibold py-2 px-4 rounded-lg transition-colors bg-slate-700 hover:bg-slate-600 text-white"
                            >
                                <Copy className="w-4 h-4 mr-2" /> Copy
                            </button>
                            <button
                                onClick={handleGenerate}
                                disabled={loading}
                                className="w-full flex items-center justify-center text-sm font-semibold py-2 px-4 rounded-lg transition-colors bg-slate-700 hover:bg-slate-600 text-white"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" /> Regenerate
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommentResponder;
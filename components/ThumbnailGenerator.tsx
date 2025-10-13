import React, { useState, useCallback } from 'react';
import { generateThumbnailIdeas } from '../services/geminiService';
import { ThumbnailIdea } from '../types';
import Spinner from './Spinner';
import { Image, Lightbulb, Wand } from './Icons';
import ErrorDisplay from './ErrorDisplay';
import { useToast } from '../contexts/ToastContext';

const ThumbnailGenerator: React.FC = () => {
    const { showToast } = useToast();
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [ideas, setIdeas] = useState<ThumbnailIdea[]>([]);

    const handleGenerate = useCallback(async () => {
        if (!title.trim()) {
            setError('Please enter a video title.');
            return;
        }
        setLoading(true);
        setError(null);
        setIdeas([]);

        try {
            const result = await generateThumbnailIdeas(title);
            setIdeas(result);
        } catch (e: any) {
            setError(e.message || 'An error occurred while generating ideas.');
        } finally {
            setLoading(false);
        }
    }, [title]);

    const handleCopyPrompt = (prompt: string) => {
        navigator.clipboard.writeText(prompt);
        showToast('Image prompt copied to clipboard!');
    };

    return (
        <div className="animate-slide-in-up space-y-8">
            <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl">
                <h2 className="text-2xl font-bold text-center mb-1 text-slate-100 flex items-center justify-center gap-2">
                    <Image className="w-6 h-6 text-violet-400" /> AI Thumbnail Ideas
                </h2>
                <p className="text-center text-slate-400 mb-6">Generate click-worthy thumbnail concepts for your video.</p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter your video title..." className="form-input flex-grow"/>
                    <button onClick={handleGenerate} disabled={loading} className="button-primary">{loading ? <Spinner/> : 'Generate Ideas'}</button>
                </div>
                <ErrorDisplay message={error} className="mt-4" />
            </div>

            {loading && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Array.from({length: 3}).map((_, i) => (
                        <div key={i} className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 animate-pulse">
                            <div className="h-6 w-3/4 bg-slate-700 rounded mb-4"></div>
                            <div className="h-4 w-1/2 bg-slate-700 rounded mb-2"></div>
                            <div className="h-4 w-full bg-slate-700 rounded mb-4"></div>
                            <div className="h-10 w-full bg-slate-700 rounded"></div>
                        </div>
                    ))}
                </div>
            )}

            {ideas.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {ideas.map((idea, i) => (
                        <div key={i} className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 flex flex-col">
                            <h3 className="text-lg font-bold text-violet-300 mb-3">{idea.style}</h3>
                            <p className="text-sm"><strong className="text-slate-300">Text:</strong> "{idea.textOverlay}"</p>
                            <p className="text-sm flex-grow"><strong className="text-slate-300">Visuals:</strong> {idea.visualDescription}</p>
                            <div className="mt-4 pt-4 border-t border-slate-700">
                                <p className="text-xs font-semibold text-slate-400 mb-2">AI Image Prompt:</p>
                                <div className="text-xs bg-slate-800/50 p-2 rounded-md font-mono text-slate-300 max-h-24 overflow-y-auto mb-2">{idea.imageGenPrompt}</div>
                                <button onClick={() => handleCopyPrompt(idea.imageGenPrompt)} className="button-secondary text-xs w-full"><Wand className="w-4 h-4 mr-1"/> Copy Prompt</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ThumbnailGenerator;

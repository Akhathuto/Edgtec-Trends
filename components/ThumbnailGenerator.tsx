

import React, { useState, useCallback, useEffect } from 'react';
import { generateThumbnailIdeas } from '../services/geminiService';
import { ThumbnailIdea, HistoryContentType } from '../types';
import Spinner from './Spinner';
import { Image, Lightbulb, Copy, Zap } from './Icons';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

interface ThumbnailGeneratorProps {
  initialInput?: string | null;
}

const ThumbnailGenerator: React.FC<ThumbnailGeneratorProps> = ({ initialInput }) => {
    const { logActivity, addContentToHistory } = useAuth();
    const { showToast } = useToast();
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [ideas, setIdeas] = useState<ThumbnailIdea[]>([]);

    const handleGenerate = useCallback(async (titleOverride?: string) => {
        const titleToGenerate = titleOverride || title;
        if (!titleToGenerate.trim()) {
            setError('Please enter a video title.');
            return;
        }
        setLoading(true);
        setError(null);
        setIdeas([]);
        try {
            const result = await generateThumbnailIdeas(titleToGenerate);
            setIdeas(result);
            logActivity(`generated thumbnail ideas for "${titleToGenerate}"`, 'Image');
            result.forEach(idea => {
                addContentToHistory({
                    type: 'Thumbnail Idea' as HistoryContentType,
                    summary: `Thumbnail idea for: ${titleToGenerate}`,
                    content: { title: titleToGenerate, ...idea }
                });
            });
        } catch (e: any) {
            setError(e.message || 'An error occurred while generating ideas.');
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [title, logActivity, addContentToHistory]);

    useEffect(() => {
        if (initialInput) {
            setTitle(initialInput);
            handleGenerate(initialInput);
        }
    }, [initialInput, handleGenerate]);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        showToast('Image prompt copied to clipboard!');
    };

    return (
        <div className="animate-slide-in-up">
            <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl">
                <h2 className="text-2xl font-bold text-center mb-1 text-slate-100 text-glow flex items-center justify-center gap-2">
                    <Image className="w-6 h-6 text-violet-400" /> AI Thumbnail Idea Generator
                </h2>
                <p className="text-center text-slate-400 mb-6">Create click-worthy thumbnail concepts for your videos.</p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter your video title..."
                        className="w-full bg-slate-800/80 border border-slate-700 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-violet-light transition-all shadow-inner"
                        title="Enter the title of your video to get thumbnail ideas"
                    />
                    <button
                        onClick={() => handleGenerate()}
                        disabled={loading}
                        className="flex items-center justify-center bg-gradient-to-r from-violet-dark to-violet-light text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:shadow-violet/30"
                        title="Generate three thumbnail concepts based on your video title"
                    >
                        {loading ? <Spinner /> : <><Lightbulb className="w-5 h-5 mr-2" /> Generate Ideas</>}
                    </button>
                </div>
                {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
            </div>

            {loading && (
                <div className="text-center py-10">
                    <Spinner size="lg" />
                    <p className="mt-4 text-slate-300">Generating thumbnail concepts...</p>
                </div>
            )}

            {ideas.length > 0 && (
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
                    {ideas.map((idea, index) => (
                        <div key={index} className="interactive-card flex flex-col">
                            <div className="flex-grow">
                                <span className="text-xs bg-slate-700 text-violet-300 font-medium px-2.5 py-1 rounded-full">{idea.style}</span>
                                <div className="mt-4 p-4 bg-slate-800/50 border border-slate-700 rounded-lg aspect-video flex flex-col justify-center items-center text-center">
                                    <h4 className="font-bold text-lg text-white mb-2">{idea.textOverlay}</h4>
                                    <p className="text-sm text-slate-400">{idea.visualDescription}</p>
                                </div>
                                <div className="mt-4">
                                    <h4 className="font-semibold text-slate-200 mb-2 flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-400" /> AI Image Prompt</h4>
                                    <p className="text-xs text-slate-400 bg-slate-800/50 p-2 rounded-md border border-slate-700 font-mono">{idea.imageGenPrompt}</p>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-700/50">
                                <button
                                    onClick={() => handleCopy(idea.imageGenPrompt)}
                                    className="w-full flex items-center justify-center text-sm font-semibold py-2 px-4 rounded-lg transition-colors bg-slate-700 hover:bg-slate-600 text-white"
                                    title="Copy the AI image generator prompt for this thumbnail idea"
                                >
                                    <Copy className="w-4 h-4 mr-2" /> Copy Image Prompt
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ThumbnailGenerator;
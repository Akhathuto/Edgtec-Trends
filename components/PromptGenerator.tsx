import React, { useState, useCallback } from 'react';
import { generateContentPrompt } from '../services/geminiService';
import Spinner from './Spinner';
import { Wand, Copy, Sparkles } from './Icons';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import ErrorDisplay from './ErrorDisplay';

const PromptGenerator: React.FC = () => {
    const { logActivity, addContentToHistory } = useAuth();
    const { showToast } = useToast();
    
    const [topic, setTopic] = useState('');
    const [audience, setAudience] = useState('');
    const [style, setStyle] = useState('');
    const [elements, setElements] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedPrompt, setGeneratedPrompt] = useState('');

    const handleGenerate = useCallback(async () => {
        if (!topic.trim()) {
            setError('Please enter a topic for your prompt.');
            return;
        }
        setLoading(true);
        setError(null);
        setGeneratedPrompt('');

        try {
            const result = await generateContentPrompt(topic, audience, style, elements);
            setGeneratedPrompt(result);
            logActivity(`generated a prompt for topic: "${topic}"`, 'Wand');
            addContentToHistory({
                type: 'Generated Prompt',
                summary: `Prompt for: "${topic}"`,
                content: { input: { topic, audience, style, elements }, output: result }
            });
        } catch (e: any) {
            setError(e.message || 'An error occurred while generating the prompt.');
        } finally {
            setLoading(false);
        }
    }, [topic, audience, style, elements, logActivity, addContentToHistory]);

    const handleCopy = () => {
        if (generatedPrompt) {
            navigator.clipboard.writeText(generatedPrompt);
            showToast('Prompt copied to clipboard!');
        }
    };
    
    return (
        <div className="animate-slide-in-up space-y-8">
            <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl">
                <h2 className="text-2xl font-bold text-center mb-1 text-slate-100 flex items-center justify-center gap-2">
                    <Wand className="w-6 h-6 text-violet-400" /> AI Prompt Generator
                </h2>
                <p className="text-center text-slate-400 mb-6">Craft the perfect prompt for our AI creation tools.</p>
                
                <div className="space-y-4">
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Main Topic or Subject (e.g., 'Retro Gaming Consoles')"
                        className="form-input"
                    />
                     <input
                        type="text"
                        value={audience}
                        onChange={(e) => setAudience(e.target.value)}
                        placeholder="Target Audience (e.g., 'Millennial gamers, collectors')"
                        className="form-input"
                    />
                     <input
                        type="text"
                        value={style}
                        onChange={(e) => setStyle(e.target.value)}
                        placeholder="Desired Style (e.g., 'Cinematic, nostalgic, documentary-style')"
                        className="form-input"
                    />
                    <textarea
                        value={elements}
                        onChange={(e) => setElements(e.target.value)}
                        placeholder="Key Elements to Include (e.g., 'Show close-ups of Nintendo 64, Sega Dreamcast. Mention the 90s aesthetic.')"
                        className="form-input h-24"
                    />
                    <button onClick={handleGenerate} disabled={loading} className="button-primary w-full">
                        {loading ? <Spinner/> : <><Sparkles className="w-5 h-5 mr-2" /> Generate Prompt</>}
                    </button>
                </div>
                <ErrorDisplay message={error} className="mt-4" />
            </div>

            {(loading || generatedPrompt) && (
                 <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl animate-fade-in">
                    <h3 className="text-xl font-bold text-violet-300 mb-2">Generated Prompt</h3>
                    {loading ? (
                        <div className="space-y-2">
                            <div className="h-4 w-full bg-slate-700 rounded animate-pulse"></div>
                            <div className="h-4 w-full bg-slate-700 rounded animate-pulse [animation-delay:0.2s]"></div>
                            <div className="h-4 w-3/4 bg-slate-700 rounded animate-pulse [animation-delay:0.4s]"></div>
                        </div>
                     ) : (
                        <div>
                            <p className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 text-slate-300 whitespace-pre-wrap">{generatedPrompt}</p>
                            <button onClick={handleCopy} className="button-secondary mt-4">
                                <Copy className="w-4 h-4 mr-2"/> Copy Prompt
                            </button>
                        </div>
                    )}
                 </div>
            )}
        </div>
    );
};

export default PromptGenerator;

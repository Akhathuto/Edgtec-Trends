'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { generateContentIdeas, generateVideoScript } from '../services/geminiService';
import { ContentIdea } from '../types';
import Spinner from './Spinner';
import { Lightbulb, Youtube, TikTok, Star, FileText, Sparkles, Copy, Download } from './Icons';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import Modal from './Modal';
import ErrorDisplay from './ErrorDisplay';

interface ContentGeneratorProps {
  initialInput?: string | null;
}

const IdeaCardSkeleton = () => (
    <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl animate-pulse">
        <div className="flex justify-between items-start">
            <div className="h-6 w-3/4 mb-3 bg-slate-700/50 rounded"></div>
            <div className="h-8 w-12 bg-slate-700/50 rounded-full"></div>
        </div>
        <div className="h-3 w-full mb-4 bg-slate-700/50 rounded"></div>
        <div className="h-4 w-1/3 mb-4 bg-slate-700/50 rounded"></div>
        <div className="h-3 w-full mb-2 bg-slate-700/50 rounded"></div>
        <div className="h-3 w-full mb-2 bg-slate-700/50 rounded"></div>
        <div className="h-3 w-2/3 bg-slate-700/50 rounded"></div>
        <div className="mt-auto pt-4">
            <div className="flex flex-wrap gap-2 mt-4">
                <div className="h-6 w-16 bg-slate-700/50 rounded-full"></div>
                <div className="h-6 w-20 bg-slate-700/50 rounded-full"></div>
                <div className="h-6 w-24 bg-slate-700/50 rounded-full"></div>
            </div>
            <div className="h-10 w-full mt-4 bg-slate-700/50 rounded-lg"></div>
        </div>
    </div>
);

const ContentGenerator: React.FC<ContentGeneratorProps> = ({ initialInput }) => {
    const { user, logActivity, addContentToHistory } = useAuth();
    const { showToast } = useToast();
    const [topic, setTopic] = useState('');
    const [platform, setPlatform] = useState<'YouTube' | 'TikTok' | 'Both'>('Both');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [ideas, setIdeas] = useState<ContentIdea[]>([]);
    
    // Script Generation State
    const [selectedIdea, setSelectedIdea] = useState<ContentIdea | null>(null);
    const [isScriptModalOpen, setIsScriptModalOpen] = useState(false);
    const [scriptLoading, setScriptLoading] = useState(false);
    const [generatedScript, setGeneratedScript] = useState<string | null>(null);

    const handleGenerate = useCallback(async (topicOverride?: string) => {
        const topicToGenerate = topicOverride || topic;
        if (!user) return;
        if (!topicToGenerate.trim()) {
            setError('Please enter a topic to generate ideas.');
            return;
        }
        setLoading(true);
        setError(null);
        setIdeas([]);
        try {
            const result = await generateContentIdeas(topicToGenerate, platform, user.plan);
            setIdeas(result);
            logActivity(`generated content ideas for "${topicToGenerate}"`, 'Lightbulb');
            result.forEach(idea => {
                addContentToHistory({
                    type: 'Content Idea',
                    summary: `Idea for ${platform}: ${idea.title}`,
                    content: idea
                });
            });
        } catch (e: any) {
            setError(e.message || 'An error occurred while generating ideas.');
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [user, topic, platform, logActivity, addContentToHistory]);

    useEffect(() => {
        if (initialInput) {
            setTopic(initialInput);
            handleGenerate(initialInput);
        }
    }, [initialInput, handleGenerate]);

    const handleGenerateScript = async (idea: ContentIdea) => {
        if (user?.plan === 'free') {
            showToast('Upgrade to Starter or Pro to generate full scripts.');
            return;
        }
        setSelectedIdea(idea);
        setIsScriptModalOpen(true);
        setScriptLoading(true);
        setGeneratedScript(null);
        try {
            const script = await generateVideoScript(idea);
            setGeneratedScript(script);
        } catch (e) {
            console.error("Script generation failed:", e);
        } finally {
            setScriptLoading(false);
        }
    };
    
    const handleCopy = (text: string, type: string) => {
        navigator.clipboard.writeText(text);
        showToast(`${type} copied to clipboard!`);
    };

    const handleDownloadScript = () => {
        if (!generatedScript || !selectedIdea) return;
        const blob = new Blob([generatedScript], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedIdea.title.replace(/\s+/g, '_')}_script.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="animate-slide-in-up">
            <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl">
                <h2 className="text-2xl font-bold text-center mb-1 text-slate-100 text-glow">AI Content Generator</h2>
                <p className="text-center text-slate-400 mb-6">Never run out of inspiration. Generate viral ideas and scripts in seconds.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Enter your topic or niche..."
                        className="form-input md:col-span-2"
                        title="Enter the topic or niche for your content ideas"
                    />
                    <div>
                        <label className="font-semibold text-slate-300 mb-2 block">Platform</label>
                        <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
                          <button onClick={() => setPlatform('YouTube')} className={`w-1/3 text-sm flex items-center justify-center gap-2 py-2 rounded-md transition-colors ${platform === 'YouTube' ? 'bg-violet' : 'hover:bg-slate-700'}`} title="Generate ideas for YouTube"><Youtube className="w-5 h-5"/> YouTube</button>
                          <button onClick={() => setPlatform('TikTok')} className={`w-1/3 text-sm flex items-center justify-center gap-2 py-2 rounded-md transition-colors ${platform === 'TikTok' ? 'bg-violet' : 'hover:bg-slate-700'}`} title="Generate ideas for TikTok"><TikTok className="w-5 h-5"/> TikTok</button>
                          <button onClick={() => setPlatform('Both')} className={`w-1/3 text-sm py-2 rounded-md transition-colors ${platform === 'Both' ? 'bg-violet' : 'hover:bg-slate-700'}`} title="Generate ideas for both YouTube and TikTok">Both</button>
                        </div>
                    </div>
                    <div className="flex items-end">
                        <button
                          onClick={() => handleGenerate()}
                          disabled={loading}
                          className="button-primary w-full"
                          title="Generate viral content ideas based on your topic"
                        >
                          {loading ? <Spinner /> : <><Lightbulb className="w-5 h-5 mr-2" /> Generate Ideas</>}
                        </button>
                    </div>
                </div>
                <ErrorDisplay message={error} />
            </div>

            {loading && (
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <IdeaCardSkeleton />
                    <IdeaCardSkeleton />
                </div>
            )}

            {!loading && ideas.length > 0 && (
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {ideas.map((idea, index) => (
                        <div key={index} className="interactive-card flex flex-col animate-fade-in-down opacity-0" style={{ animationDelay: `${index * 100}ms` }}>
                            <div className="flex justify-between items-start">
                                <h3 className="text-xl font-bold text-violet-300 mb-3 pr-4">{idea.title}</h3>
                                <div className="flex-shrink-0 flex items-center gap-1.5 bg-slate-700/50 px-2.5 py-1 rounded-full text-sm font-semibold">
                                    <Star className="w-4 h-4 text-yellow-400"/>
                                    <span>{idea.virality_potential.score}</span>
                                </div>
                            </div>
                             <p className="text-xs text-slate-400 italic mb-4">{idea.virality_potential.reasoning}</p>
                            
                            <p className="mb-4 text-slate-300"><strong>Hook:</strong> {idea.hook}</p>
                            
                            <div>
                                <h4 className="font-semibold text-slate-200 mb-2">Script Outline:</h4>
                                <ul className="space-y-1.5 text-sm text-slate-400 list-disc list-inside">
                                    {idea.script_outline.map((step, i) => <li key={i}>{step}</li>)}
                                </ul>
                            </div>
                            <div className="mt-auto pt-4">
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {idea.hashtags.map((tag, i) => <span key={i} className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">{tag}</span>)}
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-700/50">
                                    <button onClick={() => handleGenerateScript(idea)} className="w-full flex items-center justify-center text-sm font-semibold py-2 px-4 rounded-lg transition-colors bg-slate-700 hover:bg-slate-600 text-white disabled:opacity-50" disabled={user?.plan === 'free'} title="Generate a full video script from this idea (Starter/Pro Feature)">
                                        <FileText className="w-4 h-4 mr-2"/> Generate Script {user?.plan === 'free' && '(Upgrade)'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            <Modal isOpen={isScriptModalOpen} onClose={() => setIsScriptModalOpen(false)} title={`Script for: ${selectedIdea?.title || ''}`} footer={
                 <>
                    <button onClick={handleDownloadScript} disabled={!generatedScript} className="button-secondary" title="Download the script as a text file"><Download className="w-4 h-4 mr-2"/> Download</button>
                    <button onClick={() => handleCopy(generatedScript || '', 'Script')} disabled={!generatedScript} className="button-primary" title="Copy the full script to your clipboard"><Copy className="w-4 h-4 mr-2"/> Copy Script</button>
                </>
            }>
                {scriptLoading && <div className="flex justify-center p-8"><Spinner size="lg" /></div>}
                {generatedScript && <pre className="text-slate-300 whitespace-pre-wrap font-sans text-sm">{generatedScript}</pre>}
            </Modal>
        </div>
    );
};

export default ContentGenerator;
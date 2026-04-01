import React, { useState, useCallback } from 'react';
import { generateContentIdeas } from '../services/geminiService';
import { ContentIdea, ToolId } from '../types';
import Spinner from '../components/Spinner';
import { Lightbulb, Copy, RefreshCw, Star, CheckCircle, TrendingUp, Zap } from '../components/Icons';
import ErrorDisplay from '../components/ErrorDisplay';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

interface ScriptWriterProps {
  onNavigate: (toolId: ToolId, state?: any) => void;
}

const IdeaCard: React.FC<{ idea: ContentIdea; onCopy: (text: string) => void }> = ({ idea, onCopy }) => (
    <div className="premium-card rounded-2xl p-6 group hover:scale-[1.02] transition-all duration-500">
        <div className="flex justify-between items-start mb-6">
            <h3 className="text-xl font-bold text-white group-hover:text-violet-300 transition-colors leading-tight">{idea.title}</h3>
            <div className="flex items-center gap-1.5 bg-violet-500/10 px-3 py-1.5 rounded-full text-xs font-bold text-violet-400 border border-violet-500/20 shadow-lg shadow-violet-900/20">
                <TrendingUp className="w-3.5 h-3.5" /> {idea.virality_potential.score}%
            </div>
        </div>
        
        <div className="space-y-6">
            <div className="p-4 bg-slate-950/40 border border-white/5 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-violet-500" />
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">The Hook</h4>
                <p className="text-slate-200 text-sm italic leading-relaxed">"{idea.hook}"</p>
            </div>
            
            <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Script Outline</h4>
                <ul className="space-y-2.5">
                    {idea.script_outline.map((step, i) => (
                        <li key={i} className="flex items-start text-sm text-slate-400 group/item">
                            <span className="flex-shrink-0 w-5 h-5 bg-violet-500/10 border border-violet-500/20 rounded-full flex items-center justify-center text-[10px] font-bold text-violet-400 mr-3 mt-0.5 group-hover/item:bg-violet-500 group-hover/item:text-white transition-colors">{i + 1}</span> 
                            <span className="group-hover/item:text-slate-200 transition-colors">{step}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
                {idea.hashtags.map(tag => (
                    <span key={tag} className="text-[10px] font-bold bg-slate-800/50 text-slate-500 px-2.5 py-1 rounded-lg border border-white/5 hover:border-violet-500/30 hover:text-violet-400 transition-colors cursor-default">#{tag}</span>
                ))}
            </div>

            <div className="pt-4 flex gap-3">
                <button 
                    onClick={() => onCopy(`${idea.title}\n\nHook: ${idea.hook}\n\nOutline:\n${idea.script_outline.join('\n')}`)}
                    className="button-secondary w-full text-xs py-2.5 flex items-center justify-center gap-2"
                >
                    <Copy className="w-4 h-4" /> Copy Full Script
                </button>
            </div>
        </div>
    </div>
);

export const ScriptWriter: React.FC<ScriptWriterProps> = ({ onNavigate }) => {
    const { user, logActivity, addContentToHistory } = useAuth();
    const { showToast } = useToast();
    const [topic, setTopic] = useState('');
    const [platform, setPlatform] = useState<'YouTube' | 'TikTok' | 'Instagram' | 'Facebook' | 'Twitch' | 'All'>('All');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [ideas, setIdeas] = useState<ContentIdea[]>([]);

    const handleGenerate = useCallback(async () => {
        if (!topic.trim()) {
            setError('Please enter a topic or niche.');
            return;
        }
        setLoading(true);
        setError(null);
        setIdeas([]);
        try {
            const result = await generateContentIdeas(topic, platform, user?.plan || 'free');
            setIdeas(result);
            logActivity(`generated content ideas for "${topic}"`, 'Lightbulb');
            addContentToHistory({
                type: 'Content Idea',
                summary: `Ideas for ${topic}`,
                content: result
            });
        } catch (e: any) {
            setError(e.message || 'Failed to generate ideas.');
        } finally {
            setLoading(false);
        }
    }, [topic, logActivity, addContentToHistory]);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        showToast('Script copied to clipboard!');
    }

    return (
        <div className="animate-slide-in-up space-y-8">
            <div className="premium-card rounded-2xl p-8 shadow-2xl">
                <div className="flex flex-col items-center mb-8">
                    <div className="p-4 bg-violet-500/10 rounded-2xl border border-violet-500/20 mb-4 animate-float">
                        <Zap className="w-8 h-8 text-violet-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">AI Script Writer</h2>
                    <p className="text-slate-400 mt-2">Generate viral video concepts and structured script outlines.</p>
                </div>
                
                <div className="max-w-3xl mx-auto">
                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="relative flex-grow">
                            <Lightbulb className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input 
                                type="text" 
                                value={topic} 
                                onChange={(e) => setTopic(e.target.value)} 
                                placeholder="Enter a topic (e.g., 'AI tools for creators')..." 
                                className="form-input pl-11 bg-slate-950/50 border-white/10 h-12"
                            />
                        </div>
                        <select 
                            value={platform} 
                            onChange={(e) => setPlatform(e.target.value as any)}
                            className="form-input md:w-40 h-12"
                        >
                            <option value="All">All Platforms</option>
                            <option value="YouTube">YouTube</option>
                            <option value="TikTok">TikTok</option>
                            <option value="Instagram">Instagram</option>
                            <option value="Facebook">Facebook</option>
                            <option value="Twitch">Twitch</option>
                        </select>
                        <button 
                            onClick={handleGenerate} 
                            disabled={loading} 
                            className="button-primary whitespace-nowrap px-8 h-12 flex items-center justify-center min-w-[160px]"
                        >
                            {loading ? <Spinner /> : 'Generate Ideas'}
                        </button>
                    </div>
                    <ErrorDisplay message={error} className="mt-4" />
                </div>
            </div>

            {loading && (
                <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                    <div className="relative">
                        <Spinner size="lg" />
                        <div className="absolute inset-0 bg-violet-500/20 blur-xl rounded-full" />
                    </div>
                    <p className="mt-6 text-slate-300 font-medium tracking-wide">Brainstorming viral concepts...</p>
                </div>
            )}

            {ideas.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
                    {ideas.map((idea, index) => (
                        <IdeaCard key={index} idea={idea} onCopy={handleCopy} />
                    ))}
                </div>
            )}
        </div>
    );
};

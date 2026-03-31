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
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 hover:border-violet-500/50 transition-all group">
        <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-white group-hover:text-violet-300 transition-colors">{idea.title}</h3>
            <div className="flex items-center gap-1 bg-violet-900/40 px-2 py-1 rounded text-xs font-bold text-violet-300 border border-violet-500/30">
                <TrendingUp className="w-3 h-3" /> {idea.virality_potential.score}/100
            </div>
        </div>
        
        <div className="space-y-4">
            <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">The Hook</h4>
                <p className="text-slate-300 text-sm italic">"{idea.hook}"</p>
            </div>
            
            <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Script Outline</h4>
                <ul className="space-y-1">
                    {idea.script_outline.map((step, i) => (
                        <li key={i} className="flex items-start text-sm text-slate-400">
                            <span className="text-violet-500 mr-2 font-bold">{i + 1}.</span> {step}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="flex flex-wrap gap-2">
                {idea.hashtags.map(tag => (
                    <span key={tag} className="text-xs bg-slate-700/50 text-slate-400 px-2 py-1 rounded">#{tag}</span>
                ))}
            </div>

            <div className="pt-4 flex gap-3">
                <button 
                    onClick={() => onCopy(`${idea.title}\n\nHook: ${idea.hook}\n\nOutline:\n${idea.script_outline.join('\n')}`)}
                    className="button-secondary text-xs py-2 flex items-center gap-2"
                >
                    <Copy className="w-3 h-3" /> Copy Script
                </button>
            </div>
        </div>
    </div>
);

export const ScriptWriter: React.FC<ScriptWriterProps> = ({ onNavigate }) => {
    const { user, logActivity, addContentToHistory } = useAuth();
    const { showToast } = useToast();
    const [topic, setTopic] = useState('');
    const [platform, setPlatform] = useState<'YouTube' | 'TikTok' | 'Both'>('Both');
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
            <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl">
                <h2 className="text-2xl font-bold text-center mb-1 text-slate-100 flex items-center justify-center gap-2">
                    <Zap className="w-6 h-6 text-violet-400" /> AI Script Writer
                </h2>
                <p className="text-center text-slate-400 mb-6">Generate viral video ideas and script outlines.</p>
                
                <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
                    <input 
                        type="text" 
                        value={topic} 
                        onChange={(e) => setTopic(e.target.value)} 
                        placeholder="Enter a topic (e.g., 'AI tools for creators')..." 
                        className="form-input flex-grow"
                    />
                    <select 
                        value={platform} 
                        onChange={(e) => setPlatform(e.target.value as any)}
                        className="form-input sm:w-32"
                    >
                        <option value="Both">Both</option>
                        <option value="YouTube">YouTube</option>
                        <option value="TikTok">TikTok</option>
                    </select>
                    <button onClick={handleGenerate} disabled={loading} className="button-primary whitespace-nowrap">
                        {loading ? <Spinner /> : 'Generate Ideas'}
                    </button>
                </div>
                <ErrorDisplay message={error} className="mt-4" />
            </div>

            {loading && (
                <div className="text-center py-10">
                    <Spinner size="lg" />
                    <p className="mt-4 text-slate-300">Brainstorming viral concepts...</p>
                </div>
            )}

            {ideas.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                    {ideas.map((idea, index) => (
                        <IdeaCard key={index} idea={idea} onCopy={handleCopy} />
                    ))}
                </div>
            )}
        </div>
    );
};

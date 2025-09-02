import React, { useState } from 'react';
import { generateContentIdeas, generateVideoScript } from '../services/geminiService';
import { ContentIdea } from '../types';
import Spinner from './Spinner';
import { Lightbulb, CheckCircle, Star, FileText, Lock } from './Icons';
import { useAuth } from '../contexts/AuthContext';

interface ContentGeneratorProps {
  onUpgradeClick: () => void;
}

const ContentGenerator: React.FC<ContentGeneratorProps> = ({ onUpgradeClick }) => {
  const { user, logActivity, addContentToHistory } = useAuth();
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState<'YouTube' | 'TikTok' | 'Both'>('Both');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [scriptData, setScriptData] = useState<{[key: number]: {loading: boolean, error: string | null}}>({});

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic to generate ideas.');
      return;
    }
    setLoading(true);
    setError(null);
    setIdeas([]);
    setScriptData({});
    try {
      const result = await generateContentIdeas(topic, platform, user!.plan);
      setIdeas(result);
      logActivity(`generated ${result.length} content ideas for "${topic}"`, 'Lightbulb');
      result.forEach(idea => {
        addContentToHistory({
          type: 'Content Idea',
          summary: `Idea: ${idea.title}`,
          content: idea
        });
      });
    } catch (e) {
      setError('An error occurred while generating ideas. Please try again.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  
  const handleGenerateScript = async (idea: ContentIdea, index: number) => {
    if (user?.plan === 'free') {
      onUpgradeClick();
      return;
    }

    setScriptData(prev => ({ ...prev, [index]: { loading: true, error: null } }));
    try {
        const script = await generateVideoScript(idea);
        setIdeas(prevIdeas => prevIdeas.map((item, i) => i === index ? { ...item, detailed_script: script } : item));
        setScriptData(prev => ({ ...prev, [index]: { loading: false, error: null } }));
    } catch (e) {
        console.error(e);
        setScriptData(prev => ({ ...prev, [index]: { loading: false, error: 'Failed to generate script.' } }));
    }
  };
  
  const isScriptLocked = user?.plan === 'free';

  const scriptButtonClass = (isLocked: boolean) => {
      return isLocked
        ? 'bg-slate-800 text-slate-500 hover:bg-slate-700/80 cursor-pointer'
        : 'bg-slate-700 hover:bg-slate-600 text-white';
  };

  const getLimitText = () => {
    if (!user) return '';
    switch(user.plan) {
        case 'pro':
            return 'Pro plan users get 5 ideas per request.';
        case 'starter':
            return 'Starter plan users get 3 ideas per request.';
        case 'free':
        default:
            return 'Freemium users get 1 idea.';
    }
  };

  return (
    <div className="animate-slide-in-up">
      <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl">
        <h2 className="text-2xl font-bold text-center mb-1 text-slate-100">Generate Viral Ideas</h2>
        <p className="text-center text-slate-400 mb-6">Let AI brainstorm your next hit video. {getLimitText()}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="content-topic" className="sr-only">Video Topic</label>
            <input
              id="content-topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter a video topic..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-violet-light transition-all shadow-inner"
              title="What kind of video do you want to make? e.g., 'unboxing tech gadgets'"
            />
          </div>
          <div>
            <label htmlFor="content-platform" className="sr-only">Platform</label>
            <select
              id="content-platform"
              value={platform}
              onChange={(e) => setPlatform(e.target.value as 'YouTube' | 'TikTok' | 'Both')}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-violet-light transition-all"
              title="Choose the platform(s) you're targeting."
            >
              <option value="Both">Both YouTube & TikTok</option>
              <option value="YouTube">YouTube</option>
              <option value="TikTok">TikTok</option>
            </select>
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full flex items-center justify-center bg-gradient-to-r from-violet-dark to-violet-light text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:shadow-violet/30"
          title="Generate creative and viral video ideas with AI."
        >
          {loading ? <Spinner /> : <><Lightbulb className="w-5 h-5 mr-2" /> Generate Ideas</>}
        </button>
        {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
      </div>

      {loading && (
        <div className="text-center py-10">
          <Spinner size="lg" />
          <p className="mt-4 text-slate-300">Brainstorming creative ideas...</p>
        </div>
      )}

      {ideas.length > 0 && (
        <div className={`mt-8 grid grid-cols-1 ${ideas.length > 1 ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-6 animate-fade-in`}>
          {ideas.map((idea, index) => (
            <div key={index} className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl flex flex-col transition-all duration-300 hover:border-violet-500 hover:shadow-glow-md hover:-translate-y-1">
              <div className="flex-grow">
                <h3 className="text-xl font-bold text-violet-300 mb-3">{idea.title}</h3>
                <p className="text-slate-300 mb-4 italic">"{idea.hook}"</p>
                <div className="mb-4">
                  <h4 className="font-semibold text-slate-200 mb-2">Script Outline:</h4>
                  <ul className="space-y-1.5 text-slate-400">
                      {idea.script_outline.map((step, i) => (
                          <li key={i} className="flex items-start">
                             <CheckCircle className="w-4 h-4 mr-2 mt-1 text-green-400 flex-shrink-0" />
                             <span>{step}</span>
                          </li>
                      ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-200 mb-2">Hashtags:</h4>
                  <div className="flex flex-wrap gap-2">
                    {idea.hashtags.map((tag, i) => (
                      <span key={i} className="bg-slate-700 text-violet-300 text-xs font-medium px-2.5 py-1 rounded-full">#{tag}</span>
                    ))}
                  </div>
                </div>
              </div>

              {idea.virality_potential && (
                 <div className="mt-4 pt-4 border-t border-slate-700/50">
                    <h4 className="font-semibold text-slate-200 mb-2 flex items-center">
                        <Star className="w-5 h-5 mr-2 text-yellow-400" />
                        Virality Potential
                    </h4>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="bg-yellow-400/10 text-yellow-300 border border-yellow-400/20 font-bold text-sm px-3 py-1 rounded-full">{idea.virality_potential.score}</span>
                        <p className="text-slate-400 text-sm">{idea.virality_potential.reasoning}</p>
                    </div>
                </div>
              )}
              
              <div className="mt-4 pt-4 border-t border-slate-700/50">
                 {!idea.detailed_script && !scriptData[index]?.loading && (
                    <button 
                        onClick={() => handleGenerateScript(idea, index)} 
                        className={`w-full flex items-center justify-center text-sm font-semibold py-2 px-4 rounded-lg transition-colors ${scriptButtonClass(isScriptLocked)}`}
                        title={isScriptLocked ? 'Upgrade to Starter or Pro to generate scripts' : 'Generate detailed script'}
                    >
                        {isScriptLocked && <Lock className="w-3 h-3 mr-2"/>}
                        <FileText className="w-4 h-4 mr-2"/> Generate Script
                    </button>
                 )}
                 {scriptData[index]?.loading && <div className="flex justify-center"><Spinner /></div>}
                 {scriptData[index]?.error && <p className="text-red-400 text-xs text-center">{scriptData[index]?.error}</p>}
                 {idea.detailed_script && (
                     <div>
                         <h4 className="font-semibold text-slate-200 mb-2">Generated Script:</h4>
                         <pre className="text-xs bg-slate-800/50 rounded-lg p-3 whitespace-pre-wrap font-mono text-slate-300 max-h-48 overflow-y-auto border border-slate-700">{idea.detailed_script}</pre>
                     </div>
                 )}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContentGenerator;
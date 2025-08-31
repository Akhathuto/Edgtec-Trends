
import React, { useState, useCallback } from 'react';
import Spinner from './Spinner';
import { Wand, FileText, Trash2, Copy } from './Icons';
import { useToast } from '../contexts/ToastContext';
import { generateContentPrompt } from '../services/geminiService';

const PromptGenerator: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('');
  const [style, setStyle] = useState('');
  const [elements, setElements] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const { showToast } = useToast();

  const handleGenerate = useCallback(async () => {
    if (!topic.trim()) {
      setError('Please enter a topic to generate a prompt.');
      return;
    }
    setLoading(true);
    setError(null);
    setGeneratedPrompt('');
    try {
      const result = await generateContentPrompt(topic, audience, style, elements);
      setGeneratedPrompt(result);
    } catch (e) {
      setError('An error occurred while generating the prompt. Please try again.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [topic, audience, style, elements]);
  
  const handleCopy = useCallback(() => {
    if (generatedPrompt) {
        navigator.clipboard.writeText(generatedPrompt);
        showToast('Prompt copied to clipboard!');
    }
  }, [generatedPrompt, showToast]);

  const handleClear = useCallback(() => {
    setTopic('');
    setAudience('');
    setStyle('');
    setElements('');
    setGeneratedPrompt('');
    setError(null);
  }, []);

  return (
    <div className="animate-slide-in-up space-y-8">
      <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl">
        <h2 className="text-2xl font-bold text-center mb-1 text-slate-100 flex items-center justify-center gap-2">
            <Wand className="w-6 h-6 text-violet-400" /> AI Prompt Generator
        </h2>
        <p className="text-center text-slate-400 mb-6">Craft the perfect prompt for the AI Video Generator.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
                <label htmlFor="prompt-topic" className="block text-sm font-medium text-slate-300 mb-1">Core Topic*</label>
                <input id="prompt-topic" type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., 'Ancient Rome'" required className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-violet-light shadow-inner"/>
            </div>
             <div>
                <label htmlFor="prompt-audience" className="block text-sm font-medium text-slate-300 mb-1">Target Audience</label>
                <input id="prompt-audience" type="text" value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="e.g., 'History students'" className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-violet-light shadow-inner"/>
            </div>
             <div>
                <label htmlFor="prompt-style" className="block text-sm font-medium text-slate-300 mb-1">Visual Style</label>
                <input id="prompt-style" type="text" value={style} onChange={(e) => setStyle(e.target.value)} placeholder="e.g., 'Cinematic, dramatic lighting'" className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-violet-light shadow-inner"/>
            </div>
             <div>
                <label htmlFor="prompt-elements" className="block text-sm font-medium text-slate-300 mb-1">Key Elements to Include</label>
                <input id="prompt-elements" type="text" value={elements} onChange={(e) => setElements(e.target.value)} placeholder="e.g., 'Colosseum, legionaries marching'" className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-violet-light shadow-inner"/>
            </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleClear}
              className="w-full sm:w-auto flex items-center justify-center bg-slate-700 text-white font-semibold py-3 px-6 rounded-lg hover:bg-slate-600 transition-colors"
            >
              <Trash2 className="w-5 h-5 mr-2" /> Clear
            </button>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full flex items-center justify-center bg-gradient-to-r from-violet-dark to-violet-light text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:shadow-violet/30"
            >
              {loading ? <Spinner /> : <><Wand className="w-5 h-5 mr-2" /> Generate Prompt</>}
            </button>
        </div>
        
        {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
      </div>

       {loading && (
        <div className="text-center py-10">
          <Spinner size="lg" />
          <p className="mt-4 text-slate-300">Engineering the perfect prompt...</p>
        </div>
      )}

      {generatedPrompt && (
        <div className="mt-8 bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl animate-fade-in">
           <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-violet-400" /> Generated Prompt
                </h3>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 text-sm bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                    <Copy className="w-4 h-4" /> Copy
                </button>
           </div>
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <p className="text-slate-300 whitespace-pre-wrap font-mono text-sm">{generatedPrompt}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptGenerator;
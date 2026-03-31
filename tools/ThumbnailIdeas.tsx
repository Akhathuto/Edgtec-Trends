import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lightbulb, 
  Sparkles, 
  Image as ImageIcon, 
  Download, 
  RefreshCw, 
  ChevronRight,
  Loader2,
  CheckCircle as CheckCircle2,
  AlertCircle,
  Copy,
  Wand2
} from '../components/Icons';
import { ToolId, ThumbnailIdea } from '../types';
import { generateThumbnailIdeas, generateImage } from '../services/geminiService';
import { useAuth } from '../contexts/AuthContext';

interface ThumbnailIdeasProps {
  onNavigate: (toolId: ToolId, state?: any) => void;
}

export const ThumbnailIdeas: React.FC<ThumbnailIdeasProps> = ({ onNavigate }) => {
  const { addContentToHistory, user } = useAuth();
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState<ThumbnailIdea[]>([]);
  const [generatingImage, setGeneratingImage] = useState<number | null>(null);
  const [generatedImages, setGeneratedImages] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);

  const handleGenerateIdeas = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const result = await generateThumbnailIdeas(topic, 'YouTube', user?.plan || 'free');
      setIdeas(result);
      addContentToHistory({
        type: 'Thumbnail Idea',
        summary: `Thumbnail ideas for: ${topic}`,
        content: result
      });
    } catch (err) {
      console.error('Error generating thumbnail ideas:', err);
      setError('Failed to generate ideas. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateThumbnail = async (index: number, prompt: string) => {
    setGeneratingImage(index);
    try {
      const imageUrl = await generateImage(prompt);
      setGeneratedImages(prev => ({ ...prev, [index]: imageUrl }));
      addContentToHistory({
        type: 'Generated Image',
        summary: `Thumbnail for idea #${index + 1}`,
        content: { imageUrl, prompt }
      });
    } catch (err) {
      console.error('Error generating image:', err);
      setError('Failed to generate image. Please try again.');
    } finally {
      setGeneratingImage(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <ImageIcon className="w-8 h-8 text-violet-500" />
            Thumbnail Ideas
          </h1>
          <p className="text-slate-400 mt-1">Generate high-click-through-rate thumbnail concepts and images.</p>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6">
        <form onSubmit={handleGenerateIdeas} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              What is your video about?
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., How to bake a sourdough bread, 10 tips for better sleep..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
              />
              <button
                type="submit"
                disabled={loading || !topic.trim()}
                className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg shadow-violet-500/20"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Sparkles className="w-5 h-5" />
                )}
                Generate
              </button>
            </div>
          </div>
        </form>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Results Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {ideas.map((idea, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.1 }}
              className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 flex-1 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-violet-500/20 text-violet-400 flex items-center justify-center font-bold">
                      {index + 1}
                    </span>
                    <h3 className="text-lg font-bold text-white">{idea.style}</h3>
                  </div>
                  <button
                    onClick={() => copyToClipboard(idea.visualDescription)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    title="Copy concept"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Text Overlay</span>
                    <p className="text-violet-400 font-bold text-xl italic">"{idea.textOverlay}"</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Visual Description</span>
                    <p className="text-slate-300 text-sm leading-relaxed">{idea.visualDescription}</p>
                  </div>
                </div>

                {generatedImages[index] ? (
                  <div className="relative group rounded-xl overflow-hidden aspect-video bg-slate-950 border border-slate-800">
                    <img
                      src={generatedImages[index]}
                      alt={`Generated thumbnail ${index + 1}`}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <a
                        href={generatedImages[index]}
                        download={`thumbnail-${index + 1}.png`}
                        className="p-3 bg-white text-black rounded-full hover:scale-110 transition-transform"
                      >
                        <Download className="w-5 h-5" />
                      </a>
                      <button
                        onClick={() => handleGenerateThumbnail(index, idea.imageGenPrompt)}
                        className="p-3 bg-violet-600 text-white rounded-full hover:scale-110 transition-transform"
                      >
                        <RefreshCw className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => handleGenerateThumbnail(index, idea.imageGenPrompt)}
                    disabled={generatingImage !== null}
                    className="w-full aspect-video rounded-xl bg-slate-950 border-2 border-dashed border-slate-800 hover:border-violet-500/50 hover:bg-slate-900/80 transition-all flex flex-col items-center justify-center gap-3 group"
                  >
                    {generatingImage === index ? (
                      <>
                        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
                        <span className="text-sm text-slate-400">Generating image...</span>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Wand2 className="w-6 h-6 text-violet-500" />
                        </div>
                        <span className="text-sm text-slate-400">Click to generate preview</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {!loading && ideas.length === 0 && (
        <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
          <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lightbulb className="w-10 h-10 text-slate-600" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No ideas generated yet</h3>
          <p className="text-slate-400 max-w-md mx-auto">
            Enter your video topic above to get AI-powered thumbnail concepts designed for high CTR.
          </p>
        </div>
      )}
    </div>
  );
};

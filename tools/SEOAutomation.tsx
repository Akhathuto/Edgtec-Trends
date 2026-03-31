import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Sparkles, 
  Copy, 
  CheckCircle as CheckCircle2, 
  Loader2, 
  AlertCircle,
  Youtube,
  Globe,
  Tag,
  FileText,
  MousePointer2
} from '../components/Icons';
import { ToolId } from '../types';
import { generateSEOMetadata } from '../services/geminiService';
import { useAuth } from '../contexts/AuthContext';

interface SEOAutomationProps {
  onNavigate: (toolId: ToolId, state?: any) => void;
}

export const SEOAutomation: React.FC<SEOAutomationProps> = ({ onNavigate }) => {
  const { addContentToHistory } = useAuth();
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState<'YouTube' | 'TikTok'>('YouTube');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ titles: string[], description: string, tags: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await generateSEOMetadata(topic, platform);
      setResults(data);
      addContentToHistory({
        type: 'Keyword Analysis',
        summary: `SEO Metadata for: ${topic}`,
        content: data
      });
    } catch (err) {
      console.error('Error generating SEO metadata:', err);
      setError('Failed to generate SEO metadata. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Search className="w-8 h-8 text-blue-500" />
            SEO Automation
          </h1>
          <p className="text-slate-400 mt-1">AI-optimized titles, descriptions, and tags for maximum reach.</p>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6">
        <form onSubmit={handleGenerate} className="space-y-6">
          <div className="flex flex-wrap gap-4">
            <button
              type="button"
              onClick={() => setPlatform('YouTube')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                platform === 'YouTube' 
                  ? 'bg-red-500/10 border-red-500/50 text-red-500' 
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <Youtube className="w-5 h-5" />
              YouTube
            </button>
            <button
              type="button"
              onClick={() => setPlatform('TikTok')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                platform === 'TikTok' 
                  ? 'bg-violet-500/10 border-violet-500/50 text-violet-500' 
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <Globe className="w-5 h-5" />
              TikTok
            </button>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">
              Video Topic or Working Title
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Tesla Cybertruck Review 2024..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
              <button
                type="submit"
                disabled={loading || !topic.trim()}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Sparkles className="w-5 h-5" />
                )}
                Optimize
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
      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Titles */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <MousePointer2 className="w-5 h-5 text-blue-400" />
                    Optimized Titles
                  </h3>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">High CTR</span>
                </div>
                <div className="space-y-3">
                  {results.titles.map((title, i) => (
                    <div 
                      key={i}
                      className="group flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl hover:border-blue-500/30 transition-all"
                    >
                      <p className="text-slate-200 font-medium">{title}</p>
                      <button
                        onClick={() => copyToClipboard(title, `title-${i}`)}
                        className="p-2 text-slate-500 hover:text-white transition-colors"
                      >
                        {copiedField === `title-${i}` ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-400" />
                    SEO Description
                  </h3>
                  <button
                    onClick={() => copyToClipboard(results.description, 'description')}
                    className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    {copiedField === 'description' ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    Copy All
                  </button>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                  <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {results.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 space-y-4 h-fit">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Tag className="w-5 h-5 text-blue-400" />
                  Smart Tags
                </h3>
                <button
                  onClick={() => copyToClipboard(results.tags.join(', '), 'tags')}
                  className="p-2 text-slate-500 hover:text-white transition-colors"
                >
                  {copiedField === 'tags' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {results.tags.map((tag, i) => (
                  <span 
                    key={i}
                    className="px-3 py-1 bg-slate-950 border border-slate-800 text-slate-400 text-xs rounded-full hover:border-blue-500/30 transition-all cursor-default"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {!loading && !results && (
        <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
          <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="w-10 h-10 text-slate-600" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Ready to optimize?</h3>
          <p className="text-slate-400 max-w-md mx-auto">
            Enter your video topic to generate SEO-ready metadata that helps your content rank higher.
          </p>
        </div>
      )}
    </div>
  );
};

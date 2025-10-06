import React, { useState, useCallback, useEffect } from 'react';
import { generateFullReport } from '../services/geminiService.ts';
import { FullReport, Tab } from '../types.ts';
import Spinner from './Spinner.tsx';
import { FileText, Star, Download, Sparkles, Lightbulb, DollarSign } from './Icons.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';

interface StrategyReportProps {
  setActiveTab: (tab: Tab) => void;
  initialInput?: string | null;
}

const StrategyReport: React.FC<StrategyReportProps> = ({ setActiveTab, initialInput }) => {
    const { user, logActivity, addContentToHistory } = useAuth();
    const [topic, setTopic] = useState('');
    const [followers, setFollowers] = useState(10000);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [report, setReport] = useState<FullReport | null>(null);

    const handleGenerate = useCallback(async (topicOverride?: string) => {
        const topicToReport = topicOverride || topic;
        if (!topicToReport.trim()) {
            setError('Please enter a topic for the report.');
            return;
        }
        setLoading(true);
        setError(null);
        setReport(null);
        try {
            const result = await generateFullReport(topicToReport, followers);
            setReport(result);
            logActivity(`generated a strategy report for "${topicToReport}"`, 'FileText');
            addContentToHistory({
                type: 'Strategy Report',
                summary: `Report for topic: ${topicToReport}`,
                content: result
            });
        } catch (e: any) {
            setError(e.message || 'An error occurred while generating the report.');
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [topic, followers, logActivity, addContentToHistory]);

    useEffect(() => {
        if (initialInput) {
            setTopic(initialInput);
            handleGenerate(initialInput);
        }
    }, [initialInput, handleGenerate]);

    const formatFollowers = (num: number) => {
      if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
      if (num >= 1000) return `${(num/1000).toFixed(0)}K`;
      return num;
    };
    
    const handleDownload = () => {
        if (!report) return;
        let mdContent = `# Content Strategy Report for "${topic}"\n\n`;
        mdContent += `## Trend Analysis\n${report.trendAnalysis}\n\n`;
        mdContent += `## Content Ideas\n`;
        report.contentIdeas.forEach((idea, index) => {
            mdContent += `### Idea ${index + 1}: ${idea.title}\n`;
            mdContent += `**Hook:** ${idea.hook}\n`;
            mdContent += `**Outline:**\n- ${idea.script_outline.join('\n- ')}\n`;
            mdContent += `**Hashtags:** ${idea.hashtags.join(', ')}\n\n`;
        });
        mdContent += `## Monetization Strategies\n`;
        report.monetizationStrategies.forEach(strategy => {
            mdContent += `### ${strategy.strategy}\n`;
            mdContent += `**Description:** ${strategy.description}\n`;
            mdContent += `**Requirements:** ${strategy.requirements}\n`;
            mdContent += `**Potential:** ${strategy.potential}\n\n`;
        });
        
        const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `utrend_report_${topic.replace(/\s+/g, '_')}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (user?.plan !== 'pro') {
        return (
            <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-8 shadow-xl backdrop-blur-xl text-center flex flex-col items-center animate-slide-in-up">
                <Star className="w-12 h-12 text-yellow-400 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Upgrade to Pro for Full Strategy Reports</h2>
                <p className="text-slate-400 mb-6 max-w-md">Get a comprehensive, AI-powered content strategy document combining trend analysis, content ideas, and monetization strategies.</p>
                <button onClick={() => setActiveTab(Tab.Pricing)} className="flex items-center gap-2 bg-gradient-to-r from-violet-dark to-violet-light text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity shadow-md hover:shadow-lg hover:shadow-violet/30">
                    View Plans
                </button>
            </div>
        )
    }

    return (
        <div className="animate-slide-in-up">
            <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl">
                <h2 className="text-2xl font-bold text-center mb-1 text-slate-100 flex items-center justify-center gap-2">
                    <FileText className="w-6 h-6 text-violet-400" /> Full Strategy Report
                </h2>
                <p className="text-center text-slate-400 mb-6">Generate an all-in-one strategy document for any topic.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Enter your topic..."
                        className="w-full bg-slate-800/80 border border-slate-700 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-violet-light transition-all shadow-inner md:col-span-2"
                    />
                    <div>
                         <label htmlFor="followers" className="font-semibold text-slate-300 mb-2 block flex justify-between">
                          Target Follower Count <span>{formatFollowers(followers)}</span>
                        </label>
                        <input
                          id="followers" type="range" min="0" max="5000000" step="1000"
                          value={followers} onChange={(e) => setFollowers(Number(e.target.value))}
                          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet"
                        />
                    </div>
                     <div className="flex items-end">
                        <button
                          onClick={() => handleGenerate()}
                          disabled={loading}
                          className="w-full flex items-center justify-center bg-gradient-to-r from-violet-dark to-violet-light text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:shadow-violet/30 transform hover:-translate-y-px"
                        >
                          {loading ? <Spinner /> : 'Generate Report'}
                        </button>
                    </div>
                </div>
                {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
            </div>

            {loading && (
                <div className="text-center py-10">
                  <Spinner size="lg" />
                  <p className="mt-4 text-slate-300">Compiling your comprehensive report...</p>
                </div>
            )}
            
            {report && (
                <div className="mt-8 bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl animate-fade-in">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-2xl font-bold text-white text-glow">Your Report for "{topic}"</h3>
                        <button onClick={handleDownload} className="flex items-center gap-2 text-sm bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                            <Download className="w-4 h-4" /> Download Report
                        </button>
                    </div>
                    <div className="space-y-6">
                        <section>
                            <h4 className="text-xl font-bold text-violet-300 mb-2 flex items-center gap-2"><Sparkles className="w-5 h-5"/> Trend Analysis</h4>
                            <div className="prose prose-invert max-w-none text-slate-300" dangerouslySetInnerHTML={{ __html: report.trendAnalysis.replace(/\n/g, '<br/>') }}></div>
                        </section>
                         <section>
                            <h4 className="text-xl font-bold text-violet-300 mb-2 flex items-center gap-2"><Lightbulb className="w-5 h-5"/> Content Ideas</h4>
                            <div className="space-y-4">
                                {report.contentIdeas.map((idea, i) => (
                                    <div key={i} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                        <h5 className="font-bold text-slate-100">{idea.title}</h5>
                                        <p className="text-sm text-slate-300 italic"><strong>Hook:</strong> {idea.hook}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                         <section>
                            <h4 className="text-xl font-bold text-violet-300 mb-2 flex items-center gap-2"><DollarSign className="w-5 h-5"/> Monetization Strategies</h4>
                            <div className="space-y-4">
                               {report.monetizationStrategies.map((s, i) => (
                                    <div key={i} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                        <h5 className="font-bold text-slate-100">{s.strategy}</h5>
                                        <p className="text-sm text-slate-300">{s.description}</p>
                                        <p className="text-xs mt-2 text-slate-400"><strong>Potential:</strong> {s.potential}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StrategyReport;
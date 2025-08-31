
import React, { useState } from 'react';
import { generateFullReport } from '../services/geminiService';
import { FullReport, Tab } from '../types';
import Spinner from './Spinner';
import { Lightbulb, DollarSign, Users, Target, CheckCircle, TrendingUp, FileText, Star } from './Icons';
import { useAuth } from '../contexts/AuthContext';

interface StrategyReportProps {
  setActiveTab: (tab: Tab) => void;
}

const StrategyReport: React.FC<StrategyReportProps> = ({ setActiveTab }) => {
  const { user } = useAuth();
  const [topic, setTopic] = useState('');
  const [followers, setFollowers] = useState(10000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<FullReport | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic to generate a report.');
      return;
    }
    setLoading(true);
    setError(null);
    setReport(null);
    try {
      const result = await generateFullReport(topic, followers);
      setReport(result);
    } catch (e) {
      setError('An error occurred while generating the report. Please try again.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  
  const formatFollowers = (num: number) => {
      if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
      if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
      return num;
  }

  const formatTrends = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let currentListItems: React.ReactNode[] = [];

    const flushListItems = () => {
      if (currentListItems.length > 0) {
        elements.push(
          <ul key={`ul-${elements.length}`} className="list-disc ml-5 space-y-1 my-2">
            {currentListItems}
          </ul>
        );
        currentListItems = [];
      }
    };

    lines.forEach((line, i) => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('* ')) {
        currentListItems.push(<li key={i}>{trimmedLine.substring(2)}</li>);
      } else {
        flushListItems();
        if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
          elements.push(
            <h4 key={i} className="text-xl font-bold text-violet-300 mt-4 mb-2">
              {trimmedLine.replace(/\*\*/g, '')}
            </h4>
          );
        } else if (trimmedLine) {
          elements.push(<p key={i} className="mb-2">{trimmedLine}</p>);
        }
      }
    });

    flushListItems();
    return elements;
  };

  if (user?.plan !== 'pro') {
    return (
        <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-8 shadow-xl backdrop-blur-xl text-center flex flex-col items-center animate-slide-in-up">
            <Star className="w-12 h-12 text-yellow-400 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Upgrade to Pro for Full Strategy Reports</h2>
            <p className="text-slate-400 mb-6 max-w-md">Get a complete, AI-generated content strategy with in-depth trend analysis, content ideas, and monetization plans.</p>
            <button
                onClick={() => setActiveTab(Tab.Pricing)}
                className="flex items-center gap-2 bg-gradient-to-r from-violet-dark to-violet-light text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity shadow-md hover:shadow-lg hover:shadow-violet/30"
            >
                View Plans
            </button>
        </div>
    )
  }

  return (
    <div className="animate-slide-in-up">
      <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl">
        <h2 className="text-2xl font-bold text-center mb-1 text-slate-100">Generate Full Strategy Report</h2>
        <p className="text-center text-slate-400 mb-6">Get a complete content strategy with trends, ideas, and monetization plans.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="relative">
                <label htmlFor="report-topic" className="sr-only">Video Topic for Report</label>
                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                 <input
                  id="report-topic"
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Enter a video topic..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-violet-light transition-all shadow-inner"
                  title="Enter the core topic for your comprehensive strategy report."
                />
            </div>
            <div>
                 <label htmlFor="followers-report" className="font-semibold text-slate-300 mb-2 block flex justify-between">
                  Target Audience Size <span>{formatFollowers(followers)}</span>
                </label>
                <input
                  id="followers-report"
                  type="range"
                  min="0"
                  max="5000000"
                  step="1000"
                  value={followers}
                  onChange={(e) => setFollowers(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet"
                  title="Set your target audience size or current follower count."
                />
            </div>
        </div>
        
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full flex items-center justify-center bg-gradient-to-r from-violet-dark to-violet-light text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:shadow-violet/30"
          title="Generate an all-in-one report including trends, ideas, and monetization."
        >
          {loading ? <Spinner /> : <><FileText className="w-5 h-5 mr-2" /> Generate Report</>}
        </button>
        {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
      </div>

      {loading && (
        <div className="text-center py-10">
          <Spinner size="lg" />
          <p className="mt-4 text-slate-300">Generating your comprehensive report...</p>
        </div>
      )}

      {report && (
        <div className="mt-8 bg-brand-glass border border-slate-700/50 rounded-xl p-6 sm:p-8 shadow-xl backdrop-blur-xl animate-fade-in space-y-8">
            {/* Trend Analysis Section */}
            <section>
                <h3 className="text-2xl font-bold mb-4 text-slate-100 flex items-center"><TrendingUp className="w-6 h-6 mr-3 text-violet-400"/> Trend Analysis</h3>
                <div className="prose prose-invert text-slate-300 max-w-none prose-h4:text-violet-300">{formatTrends(report.trendAnalysis)}</div>
            </section>

            {/* Content Ideas Section */}
            <section>
                <h3 className="text-2xl font-bold mb-4 text-slate-100 flex items-center"><Lightbulb className="w-6 h-6 mr-3 text-violet-400"/> Content Ideas</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 {report.contentIdeas.map((idea, index) => (
                    <div key={index} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex flex-col">
                      <h4 className="text-lg font-bold text-violet-300 mb-2">{idea.title}</h4>
                      <p className="text-slate-300 mb-3 text-sm italic">"{idea.hook}"</p>
                      <div className="mb-3">
                        <h5 className="font-semibold text-slate-200 mb-2 text-sm">Script Outline:</h5>
                        <ul className="space-y-1.5 text-slate-400 text-sm">
                            {idea.script_outline.map((step, i) => (
                                <li key={i} className="flex items-start">
                                   <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-green-400 flex-shrink-0" />
                                   <span>{step}</span>
                                </li>
                            ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold text-slate-200 mb-2 text-sm">Hashtags:</h5>
                        <div className="flex flex-wrap gap-1.5">
                          {idea.hashtags.map((tag, i) => (
                            <span key={i} className="bg-slate-700 text-violet-300 text-xs font-medium px-2 py-0.5 rounded-full">#{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
            </section>

             {/* Monetization Strategies Section */}
             <section>
                <h3 className="text-2xl font-bold mb-4 text-slate-100 flex items-center"><DollarSign className="w-6 h-6 mr-3 text-violet-400"/> Monetization Strategies</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {report.monetizationStrategies.map((strategy, index) => (
                    <div key={index} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                      <h4 className="text-lg font-bold text-violet-300 mb-2 flex items-center">{strategy.strategy}</h4>
                      <p className="text-slate-300 mb-3 text-sm">{strategy.description}</p>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-start">
                            <Target className="w-4 h-4 mr-2 mt-0.5 text-slate-400 flex-shrink-0"/>
                            <div><strong className="text-slate-200">Requirements:</strong> {strategy.requirements}</div>
                        </div>
                        <div className="flex items-start">
                            <Users className="w-4 h-4 mr-2 mt-0.5 text-slate-400 flex-shrink-0"/>
                            <div><strong className="text-slate-200">Potential:</strong> {strategy.potential}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
             </section>
        </div>
      )}
    </div>
  );
};

export default StrategyReport;
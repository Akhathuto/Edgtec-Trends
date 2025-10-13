import React, { useState, useEffect, useCallback } from 'react';
import { getKeywordAnalysis } from '../services/geminiService';
import { KeywordAnalysis } from '../types';
import Spinner from './Spinner';
import { Search, Lightbulb, TrendingUp } from './Icons';
import { useAuth } from '../contexts/AuthContext';
import ErrorDisplay from './ErrorDisplay';

interface KeywordResearchProps {
  initialInput?: string | null;
}

const KeywordAnalysisSkeleton = () => (
    <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6">
                <div className="h-6 w-3/5 mb-2 bg-slate-700/50 rounded"></div>
                <div className="h-8 w-24 bg-slate-700/50 rounded-full"></div>
            </div>
            <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6">
                <div className="h-6 w-3/5 mb-2 bg-slate-700/50 rounded"></div>
                <div className="h-8 w-24 bg-slate-700/50 rounded-full"></div>
            </div>
        </div>
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6">
                <div className="h-6 w-48 mb-3 bg-slate-700/50 rounded"></div>
                <div className="flex flex-wrap gap-2">
                    <div className="h-8 w-24 bg-slate-700/50 rounded-full"></div>
                    <div className="h-8 w-32 bg-slate-700/50 rounded-full"></div>
                    <div className="h-8 w-28 bg-slate-700/50 rounded-full"></div>
                    <div className="h-8 w-36 bg-slate-700/50 rounded-full"></div>
                </div>
            </div>
            <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6">
                <div className="h-6 w-40 mb-3 bg-slate-700/50 rounded"></div>
                <div className="space-y-2">
                    <div className="h-10 w-full bg-slate-700/50 rounded-md"></div>
                    <div className="h-10 w-full bg-slate-700/50 rounded-md"></div>
                    <div className="h-10 w-full bg-slate-700/50 rounded-md"></div>
                </div>
            </div>
        </div>
    </div>
);


const KeywordResearch: React.FC<KeywordResearchProps> = ({ initialInput }) => {
    const { getKeywordUsage, logKeywordAnalysis } = useAuth();
    const [keyword, setKeyword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<KeywordAnalysis | null>(null);
    const [usage, setUsage] = useState({ remaining: 0, limit: 0 as number | 'unlimited' });

    useEffect(() => {
        setUsage(getKeywordUsage());
    }, [getKeywordUsage]);

    const handleAnalyze = useCallback(async (keywordOverride?: string) => {
        const keywordToAnalyze = keywordOverride || keyword;
        if (!keywordToAnalyze.trim()) {
            setError('Please enter a keyword to analyze.');
            return;
        }
        const currentUsage = getKeywordUsage();
        if (currentUsage.remaining <= 0 && currentUsage.limit !== 'unlimited') {
            setError('You have reached your monthly limit for keyword analysis. Upgrade your plan for more.');
            return;
        }

        setLoading(true);
        setError(null);
        setAnalysis(null);
        try {
            const result = await getKeywordAnalysis(keywordToAnalyze);
            setAnalysis(result);
            logKeywordAnalysis();
            setUsage(getKeywordUsage()); // Refresh usage after analysis
        } catch (e: any) {
            setError(e.message || 'An error occurred while analyzing the keyword.');
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [keyword, getKeywordUsage, logKeywordAnalysis]);
    
    useEffect(() => {
        if (initialInput) {
            setKeyword(initialInput);
            handleAnalyze(initialInput);
        }
    }, [initialInput, handleAnalyze]);
    
    const getPillColor = (value: 'High' | 'Medium' | 'Low' | 'Very High' | 'Very Low') => {
        switch (value) {
            case 'Very High':
            case 'High':
                return 'bg-red-500/20 text-red-300';
            case 'Medium':
                return 'bg-yellow-500/20 text-yellow-300';
            case 'Low':
            case 'Very Low':
                return 'bg-green-500/20 text-green-300';
            default:
                return 'bg-slate-700 text-slate-300';
        }
    };

    return (
        <div className="animate-slide-in-up">
            <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl">
                <h2 className="text-2xl font-bold text-center mb-1 text-slate-100 text-glow flex items-center justify-center gap-2">
                    <Search className="w-6 h-6 text-violet-400" /> Keyword Research
                </h2>
                <p className="text-center text-slate-400 mb-6">Analyze keywords to find your next video topic.</p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder="Enter keyword..."
                        className="w-full bg-slate-800/80 border border-slate-700 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-violet-light transition-all shadow-inner"
                        title="Enter the keyword you want to research"
                    />
                    <button
                        onClick={() => handleAnalyze()}
                        disabled={loading}
                        className="flex items-center justify-center bg-gradient-to-r from-violet-dark to-violet-light text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:shadow-violet/30"
                        title="Get search volume, competition, and content ideas for this keyword"
                    >
                        {loading ? <Spinner /> : <><Search className="w-5 h-5 mr-2" /> Analyze</>}
                    </button>
                </div>
                 <p className="text-center text-xs text-slate-500 mt-2">
                    {usage.limit === 'unlimited' ? 'Unlimited analyses remaining' : `${usage.remaining} / ${usage.limit} analyses remaining this month.`}
                </p>
                <ErrorDisplay message={error} className="mt-4" />
            </div>

            {loading && <KeywordAnalysisSkeleton />}
            
            {!loading && analysis && (
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
                    <div className="lg:col-span-1 space-y-6">
                        <div className="interactive-card">
                            <h3 className="text-lg font-bold text-violet-300 mb-2">Search Volume</h3>
                            <span className={`font-bold text-sm px-3 py-1 rounded-full ${getPillColor(analysis.searchVolume)}`}>{analysis.searchVolume}</span>
                        </div>
                         <div className="interactive-card">
                            <h3 className="text-lg font-bold text-violet-300 mb-2">Competition</h3>
                            <span className={`font-bold text-sm px-3 py-1 rounded-full ${getPillColor(analysis.competition)}`}>{analysis.competition}</span>
                        </div>
                    </div>
                     <div className="lg:col-span-2 space-y-6">
                         <div className="interactive-card">
                            <h3 className="text-lg font-bold text-violet-300 mb-3 flex items-center gap-2"><TrendingUp className="w-5 h-5"/> Related Keywords</h3>
                            <div className="flex flex-wrap gap-2">
                                {analysis.relatedKeywords.map((kw, i) => (
                                    <span key={i} className="text-sm bg-slate-700 text-slate-300 px-3 py-1.5 rounded-full">{kw}</span>
                                ))}
                            </div>
                        </div>
                        <div className="interactive-card">
                            <h3 className="text-lg font-bold text-violet-300 mb-3 flex items-center gap-2"><Lightbulb className="w-5 h-5"/> Content Ideas</h3>
                            <ul className="space-y-2">
                                {analysis.contentIdeas.map((idea, i) => (
                                    <li key={i} className="text-slate-300 bg-slate-800/50 p-2 rounded-md">{idea}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KeywordResearch;
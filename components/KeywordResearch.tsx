
import React, { useState } from 'react';
import { getKeywordAnalysis } from '../services/geminiService';
import { KeywordAnalysis, Tab } from '../types';
import Spinner from './Spinner';
import { Search, BarChart2, Users, Lightbulb, Star } from './Icons';
import { useAuth } from '../contexts/AuthContext';

interface KeywordResearchProps {
    onUpgradeClick: () => void;
}

const KeywordResearch: React.FC<KeywordResearchProps> = ({ onUpgradeClick }) => {
    const { user } = useAuth();
    const [keyword, setKeyword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<KeywordAnalysis | null>(null);

    const handleSearch = async () => {
        if (!keyword.trim()) {
            setError('Please enter a keyword to analyze.');
            return;
        }
        if (user?.plan === 'free') {
            onUpgradeClick();
            return;
        }
        setLoading(true);
        setError(null);
        setAnalysis(null);
        try {
            const result = await getKeywordAnalysis(keyword);
            setAnalysis(result);
        } catch (e) {
            setError('An error occurred while analyzing the keyword. Please try again.');
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const getMetricProps = (metric: 'High' | 'Medium' | 'Low' | 'Very High' | 'Very Low' | undefined): { barColor: string; width: string; textColor: string } => {
        switch (metric) {
            case 'Very High':
                return { barColor: 'bg-red-500', width: 'w-full', textColor: 'text-red-400' };
            case 'High':
                return { barColor: 'bg-red-500', width: 'w-4/5', textColor: 'text-red-400' };
            case 'Medium':
                return { barColor: 'bg-yellow-400', width: 'w-3/5', textColor: 'text-yellow-400' };
            case 'Low':
                return { barColor: 'bg-green-500', width: 'w-2/5', textColor: 'text-green-400' };
            case 'Very Low':
                return { barColor: 'bg-green-500', width: 'w-1/5', textColor: 'text-green-400' };
            default:
                return { barColor: 'bg-slate-600', width: 'w-0', textColor: 'text-slate-400' };
        }
    };

    const isLocked = user?.plan === 'free';

    return (
        <div className="animate-slide-in-up space-y-8">
            <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl">
                <h2 className="text-2xl font-bold text-center mb-1 text-slate-100 flex items-center justify-center gap-2">
                    <Search className="w-6 h-6 text-violet-400" /> Keyword Research Tool
                </h2>
                <p className="text-center text-slate-400 mb-6">Unlock insights into any topic or keyword.</p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-grow">
                        <label htmlFor="keyword-search" className="sr-only">Search by keyword</label>
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            id="keyword-search"
                            type="text"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            placeholder="e.g., 'sustainable living', 'retro gaming'"
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-violet-light transition-all shadow-inner"
                            title="Enter a keyword to analyze."
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        disabled={loading || isLocked}
                        className="flex items-center justify-center bg-gradient-to-r from-violet-dark to-violet-light text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:shadow-violet/30"
                        title={isLocked ? "Upgrade to Starter or Pro to use this feature" : "Analyze Keyword"}
                    >
                        {loading ? <Spinner /> : 'Analyze Keyword'}
                    </button>
                </div>
                {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
                 {isLocked && (
                    <p className="text-center text-yellow-300 mt-4 text-sm">
                        The Keyword Research Tool is a premium feature. Please <button onClick={onUpgradeClick} className="font-bold underline hover:text-yellow-200">upgrade</button> to access.
                    </p>
                )}
            </div>

            {loading && (
                <div className="text-center py-10">
                    <Spinner size="lg" />
                    <p className="mt-4 text-slate-300">Performing AI analysis on "{keyword}"...</p>
                </div>
            )}

            {analysis && (
                <div className="animate-fade-in space-y-6">
                    {(() => {
                        const volumeProps = getMetricProps(analysis.searchVolume);
                        const competitionProps = getMetricProps(analysis.competition);

                        return (
                            <>
                                {/* Metrics */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl">
                                        <h3 className="flex items-center gap-2 font-bold text-lg text-slate-200 mb-2"><BarChart2 className="w-5 h-5 text-violet-400" /> Search Volume</h3>
                                        <p className={`text-3xl font-bold ${volumeProps.textColor}`}>{analysis.searchVolume}</p>
                                        <div className="w-full bg-slate-700/50 rounded-full h-2.5 mt-2">
                                            <div className={`${volumeProps.barColor} ${volumeProps.width} h-2.5 rounded-full transition-all duration-500 ease-out`}></div>
                                        </div>
                                        <p className="text-sm text-slate-400 mt-2">Estimated interest in this topic on YouTube.</p>
                                    </div>
                                    <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl">
                                        <h3 className="flex items-center gap-2 font-bold text-lg text-slate-200 mb-2"><Users className="w-5 h-5 text-violet-400" /> Competition</h3>
                                        <p className={`text-3xl font-bold ${competitionProps.textColor}`}>{analysis.competition}</p>
                                        <div className="w-full bg-slate-700/50 rounded-full h-2.5 mt-2">
                                            <div className={`${competitionProps.barColor} ${competitionProps.width} h-2.5 rounded-full transition-all duration-500 ease-out`}></div>
                                        </div>
                                        <p className="text-sm text-slate-400 mt-2">The number of creators making videos on this topic.</p>
                                    </div>
                                </div>

                                {/* Related Keywords & Content Ideas */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl">
                                        <h3 className="flex items-center gap-2 font-bold text-lg text-slate-200 mb-3"><Star className="w-5 h-5 text-violet-400" /> Related Keywords</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {analysis.relatedKeywords.map((kw, i) => (
                                                <span key={i} className="bg-slate-700 text-violet-300 text-sm font-medium px-3 py-1.5 rounded-full">{kw}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl">
                                        <h3 className="flex items-center gap-2 font-bold text-lg text-slate-200 mb-3"><Lightbulb className="w-5 h-5 text-violet-400" /> Content Ideas</h3>
                                        <ul className="space-y-2">
                                            {analysis.contentIdeas.map((idea, i) => (
                                                <li key={i} className="bg-slate-800/50 p-3 rounded-md text-slate-300 text-sm border border-slate-700">{idea}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </>
                        );
                    })()}
                </div>
            )}
        </div>
    );
};

export default KeywordResearch;

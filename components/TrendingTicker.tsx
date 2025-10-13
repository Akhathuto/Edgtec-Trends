import React, { useState, useEffect } from 'react';
import { getTickerTrends } from '../services/geminiService';
import { TrendingUp, X } from './Icons';

const TrendingTicker: React.FC = () => {
    const [trends, setTrends] = useState<string[]>([]);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const fetchTrends = async () => {
            try {
                const result = await getTickerTrends();
                setTrends(result);
            } catch (error) {
                console.error("Failed to fetch ticker trends:", error);
            }
        };
        fetchTrends();
    }, []);

    if (!isVisible || trends.length === 0) {
        return null;
    }

    const doubledTrends = [...trends, ...trends];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/60 backdrop-blur-lg border-t border-slate-800/50 overflow-hidden group animate-fade-in">
            <div className="flex items-center h-12">
                <div className="flex-shrink-0 bg-violet h-full flex items-center px-4">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    <span className="font-bold text-sm tracking-wider">LIVE TRENDS</span>
                </div>
                <div className="flex-grow h-full overflow-hidden whitespace-nowrap">
                    <div className="inline-block animate-ticker group-hover:[animation-play-state:paused]">
                        {doubledTrends.map((trend, index) => (
                            <span key={index} className="mx-6 text-sm text-slate-300">
                                {trend}
                            </span>
                        ))}
                    </div>
                </div>
                <button 
                    onClick={() => setIsVisible(false)} 
                    className="flex-shrink-0 h-full flex items-center px-4 text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
                    aria-label="Dismiss trending ticker"
                    title="Hide Ticker"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default TrendingTicker;
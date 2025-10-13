import React, { useState, useEffect, useCallback } from 'react';
import { getRealtimeTrends, findTrends } from '../services/geminiService';
import { TrendingChannel, TrendingTopic, GroundingSource } from '../types';
import Spinner from './Spinner';
import { TrendingUp, Youtube, TikTok, Search, ExternalLink } from './Icons';
import { useAuth } from '../contexts/AuthContext';
import ErrorDisplay from './ErrorDisplay';

const TrendDiscovery: React.FC = () => {
    const { user } = useAuth();
    const [realtime, setRealtime] = useState<{ channels: TrendingChannel[], topics: TrendingTopic[] }>({ channels: [], topics: [] });
    const [realtimeLoading, setRealtimeLoading] = useState(true);
    const [country, setCountry] = useState(user?.country || 'USA');
    const [error, setError] = useState<string | null>(null);

    // Search state
    const [searchTerm, setSearchTerm] = useState('');
    const [searchPlatform, setSearchPlatform] = useState<'YouTube' | 'TikTok'>('YouTube');
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchResult, setSearchResult] = useState<{ text: string, sources: GroundingSource[] } | null>(null);

    useEffect(() => {
        const fetchRealtime = async () => {
            if (!user) return;
            setRealtimeLoading(true);
            setError(null);
            try {
                const result = await getRealtimeTrends(user.plan, country);
                setRealtime(result);
            } catch (e: any) {
                setError(e.message || "Failed to fetch real-time trends.");
            } finally {
                setRealtimeLoading(false);
            }
        };
        fetchRealtime();
    }, [user, country]);

    const handleSearch = async () => {
        if (!searchTerm.trim()) return;
        setSearchLoading(true);
        setSearchResult(null);
        setError(null);
        try {
            const result = await findTrends(searchTerm, searchPlatform, country, 'All');
            const sources = result.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((c: any) => c.web).filter((c:any) => c.uri && c.title) || [];
            setSearchResult({ text: result.text, sources });
        } catch (e: any) {
            setError(e.message || "Failed to perform trend search.");
        } finally {
            setSearchLoading(false);
        }
    };
    
    return (
        <div className="animate-slide-in-up space-y-8">
            <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl">
                <h2 className="text-2xl font-bold text-center mb-1 text-slate-100 text-glow flex items-center justify-center gap-2">
                    <TrendingUp className="w-6 h-6 text-violet-400" /> Trend Discovery
                </h2>
                <p className="text-center text-slate-400 mb-6">Find what's hot right now on YouTube and TikTok.</p>
                <ErrorDisplay message={error} />
            </div>

            <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl">
                <h3 className="text-xl font-bold text-violet-300 mb-4">Today's Snapshot</h3>
                {realtimeLoading ? <div className="flex justify-center"><Spinner /></div> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-semibold mb-2">Trending Channels</h4>
                            <div className="space-y-2">{realtime.channels.map((c, i) => <div key={i} className="flex items-center gap-2 text-sm p-2 bg-slate-800/50 rounded-md"> {c.platform === 'YouTube' ? <Youtube className="w-5 h-5 text-red-500"/> : <TikTok className="w-5 h-5" />} <span className="font-semibold">{c.name}</span> <a href={c.channel_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 ml-auto"><ExternalLink className="w-4 h-4"/></a> </div>)}</div>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">Trending Topics</h4>
                            <div className="space-y-2">{realtime.topics.map((t, i) => <div key={i} className="p-2 bg-slate-800/50 rounded-md"> <p className="font-semibold text-sm">{t.name}</p> <p className="text-xs text-slate-400">{t.description}</p> </div>)}</div>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl">
                <h3 className="text-xl font-bold text-violet-300 mb-4">Search Any Topic</h3>
                <div className="flex flex-col sm:flex-row gap-4">
                    <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="e.g., 'AI in gaming'" className="form-input flex-grow"/>
                    <button onClick={handleSearch} disabled={searchLoading} className="button-primary"><Search className="w-5 h-5 mr-2"/> {searchLoading ? <Spinner/> : 'Search'}</button>
                </div>
                {searchResult && (
                    <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                        <p className="text-slate-300 whitespace-pre-wrap">{searchResult.text}</p>
                        {searchResult.sources.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-slate-700">
                                <h5 className="text-xs font-semibold text-slate-400 mb-2">Sources:</h5>
                                <div className="flex flex-wrap gap-2">{searchResult.sources.map((s, i) => <a key={i} href={s.uri} target="_blank" rel="noopener noreferrer" className="text-xs bg-slate-700 text-blue-300 px-2 py-1 rounded hover:bg-slate-600">{s.title || new URL(s.uri).hostname}</a>)}</div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrendDiscovery;

import React, { useState, useEffect, useCallback } from 'react';
import { getRealtimeTrends, getTrendingContent, findTrends } from '../services/geminiService.ts';
import { User, TrendingChannel, TrendingTopic, TrendingVideo, TrendingCreator, TrendingMusic, GroundingSource } from '../types.ts';
import Spinner from './Spinner.tsx';
import { TrendingUp, Youtube, TikTok, Search, ExternalLink, Music, Users, Video as VideoIcon } from './Icons.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import UpgradeModal from './UpgradeModal.tsx';

const countryOptions = ["Worldwide", "USA", "UK", "Canada", "Australia", "India", "South Africa"];
const categoryOptions = ["All", "Gaming", "Music", "Entertainment", "Comedy", "Education", "Tech", "Beauty & Fashion", "Food"];
const platformOptions: ('YouTube' | 'TikTok')[] = ['YouTube', 'TikTok'];

type ContentType = 'videos' | 'music' | 'creators' | 'topics';

interface TrendDiscoveryProps {
  initialInput?: string | null;
}

const TrendDiscovery: React.FC<TrendDiscoveryProps> = ({ initialInput }) => {
    const { user } = useAuth();
    const [channels, setChannels] = useState<TrendingChannel[]>([]);
    const [topics, setTopics] = useState<TrendingTopic[]>([]);
    const [loadingSnapshot, setLoadingSnapshot] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [platform, setPlatform] = useState<'YouTube' | 'TikTok'>('YouTube');
    const [country, setCountry] = useState('Worldwide');
    const [category, setCategory] = useState('All');
    const [contentType, setContentType] = useState<ContentType>('videos');
    const [content, setContent] = useState<any[]>([]);
    const [loadingContent, setLoadingContent] = useState(false);
    
    // Search
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResult, setSearchResult] = useState<{ text: string, sources: GroundingSource[] } | null>(null);
    const [loadingSearch, setLoadingSearch] = useState(false);
    
    // Modal
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    
    const fetchSnapshot = useCallback(async () => {
        if (!user) return;
        setLoadingSnapshot(true);
        setError(null);
        try {
            const data = await getRealtimeTrends(user.plan, 'Worldwide');
            setChannels(data.channels);
            setTopics(data.topics);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoadingSnapshot(false);
        }
    }, [user]);

    const fetchContent = useCallback(async () => {
        if (!user) return;
        setLoadingContent(true);
        try {
            const data = await getTrendingContent(contentType, user.plan, country, category, platform);
            setContent(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingContent(false);
        }
    }, [user, contentType, country, category, platform]);
    
    const handleSearch = useCallback(async (term?: string) => {
        const termToSearch = term || searchTerm;
        if (!termToSearch.trim()) return;
        if (user?.plan === 'free') {
            setIsUpgradeModalOpen(true);
            return;
        }
        setLoadingSearch(true);
        setSearchResult(null);
        try {
            const response = await findTrends(termToSearch, platform, country, category);
            const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((c: any) => c.web) || [];
            setSearchResult({ text: response.text, sources });
        } catch (e: any) {
             setError(e.message);
        } finally {
            setLoadingSearch(false);
        }
    }, [searchTerm, user?.plan, platform, country, category]);
    
    useEffect(() => {
        if (initialInput) {
            setSearchTerm(initialInput);
            handleSearch(initialInput);
        }
    }, [initialInput, handleSearch]);

    useEffect(() => {
        fetchSnapshot();
    }, [fetchSnapshot]);

    useEffect(() => {
        fetchContent();
    }, [fetchContent]);

    const renderContentCards = () => {
        switch (contentType) {
            case 'videos':
                return (content as TrendingVideo[]).map((v, i) => (
                    <a href={v.videoUrl} target="_blank" rel="noopener noreferrer" key={i} className="interactive-card flex flex-col group">
                        <div className="overflow-hidden rounded-lg mb-3">
                           <img src={v.thumbnailUrl} alt={v.title} className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>
                        <h4 className="font-bold text-white flex-grow line-clamp-2">{v.title}</h4>
                        <p className="text-sm text-slate-400 mt-1">{v.channelName}</p>
                        <div className="flex justify-between items-center mt-2 text-xs text-slate-500">
                            <span>{v.viewCount}</span>
                            <span>{v.publishedTime}</span>
                        </div>
                    </a>
                ));
            case 'music':
                return (content as TrendingMusic[]).map((m, i) => (
                    <div key={i} className="interactive-card flex flex-col justify-between">
                         <div>
                            <h4 className="font-bold text-white text-lg">{m.trackTitle}</h4>
                            <p className="text-sm text-slate-400">{m.artistName}</p>
                             <p className="text-xs text-slate-300 mt-2">{m.reason}</p>
                        </div>
                        <p className="text-violet-300 font-bold text-right mt-2">{m.videosUsingSound}</p>
                    </div>
                ));
            case 'creators':
                 return (content as TrendingCreator[]).map((c, i) => (
                    <a href={c.channelUrl} target="_blank" rel="noopener noreferrer" key={i} className="interactive-card flex flex-col justify-between group">
                         <div>
                            <h4 className="font-bold text-white text-lg group-hover:text-violet-300 transition-colors">{c.name}</h4>
                            <p className="text-sm text-slate-400">{c.category}</p>
                             <p className="text-xs text-slate-300 mt-2">{c.reason}</p>
                        </div>
                        <p className="text-violet-300 font-bold text-right mt-2">{c.subscriberCount}</p>
                    </a>
                ));
            case 'topics':
                 return (content as TrendingTopic[]).map((t, i) => (
                    <div key={i} className="interactive-card">
                        <h4 className="font-bold text-white text-lg">{t.name}</h4>
                        <p className="text-sm text-slate-400">{t.description}</p>
                    </div>
                ));
            default: return null;
        }
    }
    
    return (
        <div className="animate-slide-in-up space-y-8">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-white text-glow">Trend Discovery</h2>
                <p className="text-slate-400 mt-1">Stay ahead of the curve with real-time social media trends.</p>
            </div>
            
             <section>
                <h3 className="text-xl font-bold mb-4 text-slate-200">Today's Snapshot</h3>
                 {loadingSnapshot && <div className="flex justify-center"><Spinner /></div>}
                 {error && <p className="text-red-400 text-center">{error}</p>}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-brand-glass p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Trending Channels</h4>
                        <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
                            {channels.map((c, i) => (
                                <li key={i} className="flex items-center justify-between text-sm p-2 bg-slate-800/50 rounded">
                                    <div className="flex items-center gap-2 min-w-0">
                                        {c.platform === 'YouTube' ? <Youtube className="w-4 h-4 text-red-500 flex-shrink-0"/> : <TikTok className="w-4 h-4 text-white flex-shrink-0"/>}
                                        <span className="truncate">{c.name}</span>
                                    </div>
                                    <a href={c.channel_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline flex-shrink-0 ml-2">View</a>
                                </li>
                            ))}
                        </ul>
                    </div>
                     <div className="bg-brand-glass p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Trending Topics</h4>
                         <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
                            {topics.map((t, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm p-2 bg-slate-800/50 rounded">
                                    {t.platform === 'YouTube' ? <Youtube className="w-4 h-4 text-red-500 flex-shrink-0"/> : <TikTok className="w-4 h-4 text-white flex-shrink-0"/>}
                                    <span className="truncate">{t.name}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>
            
            <section>
                <h3 className="text-xl font-bold mb-4 text-slate-200">Explore Trends</h3>
                <div className="bg-brand-glass p-4 rounded-lg mb-4">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <select onChange={(e) => setPlatform(e.target.value as any)} value={platform} className="form-select">
                            {platformOptions.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                        <select onChange={(e) => setCountry(e.target.value)} value={country} className="form-select">
                            {countryOptions.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <select onChange={(e) => setCategory(e.target.value)} value={category} className="form-select">
                            {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="flex justify-center flex-wrap gap-2 mt-4">
                        <button onClick={() => setContentType('videos')} className={`tab-button ${contentType === 'videos' ? 'active' : ''}`}><VideoIcon className="w-4 h-4 mr-2"/> Videos</button>
                        <button onClick={() => setContentType('music')} className={`tab-button ${contentType === 'music' ? 'active' : ''}`}><Music className="w-4 h-4 mr-2"/> Music</button>
                        <button onClick={() => setContentType('creators')} className={`tab-button ${contentType === 'creators' ? 'active' : ''}`}><Users className="w-4 h-4 mr-2"/> Creators</button>
                    </div>
                </div>
                {loadingContent ? <div className="flex justify-center p-8"><Spinner size="lg" /></div> : 
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {renderContentCards()}
                    </div>
                }
            </section>

             <section>
                <h3 className="text-xl font-bold mb-4 text-slate-200">Analyze Any Trend</h3>
                <div className="bg-brand-glass p-4 rounded-lg">
                    <div className="flex gap-4">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="e.g., 'AI in video editing'"
                            className="form-input flex-grow"
                        />
                        <button onClick={() => handleSearch()} disabled={loadingSearch} className="button-primary">
                            {loadingSearch ? <Spinner size="sm"/> : <Search className="w-5 h-5"/>}
                        </button>
                    </div>
                </div>
                {searchResult && (
                    <div className="mt-4 bg-brand-glass p-4 rounded-lg animate-fade-in">
                        <div className="prose prose-invert max-w-none prose-p:text-slate-300" dangerouslySetInnerHTML={{ __html: searchResult.text.replace(/\n/g, '<br/>') }}></div>
                        {searchResult.sources.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-slate-700">
                                <h4 className="font-semibold text-sm mb-2 text-slate-300">Sources:</h4>
                                <ul className="flex flex-wrap gap-2">
                                    {searchResult.sources.map((s, i) => (
                                        s && s.uri && <li key={i}><a href={s.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs bg-slate-700/50 hover:bg-slate-600/50 px-2 py-1 rounded text-blue-400">
                                            {s.title} <ExternalLink className="w-3 h-3"/>
                                        </a></li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </section>
            
            <UpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} />
        </div>
    );
};

export default TrendDiscovery;
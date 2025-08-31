import React, { useState, useEffect, useCallback } from 'react';
import { findTrends, getTrendingContent } from '../services/geminiService';
import { GroundingSource, TrendingVideo, TrendingMusic, TrendingCreator } from '../types';
import { Search, Link as LinkIcon, Zap, Youtube, Film, ExternalLink, Users, Eye, Lock, ChevronDown, Music, ThumbsUp, TikTok, Video } from './Icons';
import Spinner from './Spinner';
import { useAuth } from '../contexts/AuthContext';

type TrendType = 'videos' | 'music' | 'creators';
type Platform = 'YouTube' | 'TikTok';

interface TrendDiscoveryProps {
  onUpgradeClick: () => void;
}

const countries = [
  'Worldwide', 'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Argentina', 'Armenia', 
  'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Belarus', 'Belgium', 
  'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 
  'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon', 'Canada', 'Cape Verde', 
  'Central African Republic', 'Chad', 'Chile', 'Colombia', 'Comoros', 'Congo', 'Costa Rica', 
  'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominican Republic', 
  'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Estonia', 'Ethiopia', 'Fiji', 'Finland', 
  'France', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Guatemala', 'Guinea', 
  'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 
  'Ireland', 'Israel', 'Italy', 'Ivory Coast', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 
  'Kenya', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 
  'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 
  'Mali', 'Malta', 'Mauritania', 'Mauritius', 'Mexico', 'Moldova', 'Monaco', 'Mongolia', 
  'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nepal', 'Netherlands', 'New Zealand', 
  'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway', 'Oman', 'Pakistan', 
  'Palestine', 'Panama', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 
  'Romania', 'Russia', 'Rwanda', 'San Marino', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 
  'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Somalia', 'South Africa', 'South Korea', 
  'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 
  'Tajikistan', 'Tanzania', 'Thailand', 'Togo', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 
  'Turkmenistan', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 
  'Uruguay', 'Uzbekistan', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
];

const youtubeCategories = [
    'All', 'Music', 'Gaming', 'Entertainment', 'Comedy', 'Film & Animation', 'Howto & Style', 'Science & Technology', 'News & Politics', 'Pets & Animals', 'Sports'
];

const tiktokCategories = [
    'All', 'Trending', 'Comedy', 'Dance', 'Education', 'DIY', 'Fashion', 'Food', 'Gaming', 'Lifehacks', 'Music', 'Sports', 'Tech', 'Animals'
];

const TrendDiscovery: React.FC<TrendDiscoveryProps> = ({ onUpgradeClick }) => {
  const { user } = useAuth();
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trends, setTrends] = useState<string | null>(null);
  const [sources, setSources] = useState<GroundingSource[]>([]);

  const [realtimeTrends, setRealtimeTrends] = useState<any[]>([]);
  const [realtimeLoading, setRealtimeLoading] = useState(true);
  const [realtimeError, setRealtimeError] = useState<string | null>(null);
  
  const [platform, setPlatform] = useState<Platform>('YouTube');
  const [selectedCountry, setSelectedCountry] = useState('Worldwide');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTrendType, setActiveTrendType] = useState<TrendType>('videos');
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  const categories = platform === 'TikTok' ? tiktokCategories : youtubeCategories;

  useEffect(() => {
    setSelectedCategory('All');
  }, [platform]);

  const fetchRealtimeTrends = useCallback(async () => {
    if (!user) return;
    try {
      setRealtimeLoading(true);
      setRealtimeError(null);
      setRealtimeTrends([]);
      setImageErrors({});
      const result = await getTrendingContent(activeTrendType, user.plan, selectedCountry, selectedCategory, platform);
      setRealtimeTrends(result);
    } catch (e: any) {
      setRealtimeError(e.message || `Could not load trends for ${selectedCountry}.`);
      console.error(e);
    } finally {
      setRealtimeLoading(false);
    }
  }, [user, selectedCountry, selectedCategory, activeTrendType, platform]);

  useEffect(() => {
    fetchRealtimeTrends();
  }, [fetchRealtimeTrends]);

  const handleSearch = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic to search for trends.');
      return;
    }
    setLoading(true);
    setError(null);
    setTrends(null);
    setSources([]);

    try {
      const response = await findTrends(topic);
      setTrends(response.text);
      const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
      if (groundingMetadata?.groundingChunks) {
        const extractedSources = groundingMetadata.groundingChunks
            .map((chunk: any) => ({
                uri: chunk.web?.uri || '',
                title: chunk.web?.title || 'Untitled',
            }))
            .filter((source: GroundingSource) => source.uri);
        setSources(extractedSources);
      }
    } catch (e: any) {
      setError(e.message || 'An error occurred while fetching trends. Please try again.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  
  const handleImageError = (index: number) => {
    setImageErrors(prev => ({ ...prev, [index]: true }));
  };

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
            <h3 key={i} className="text-xl font-bold text-violet-300 mt-4 mb-2">
              {trimmedLine.replace(/\*\*/g, '')}
            </h3>
          );
        } else if (trimmedLine) {
          elements.push(<p key={i} className="mb-2">{trimmedLine}</p>);
        }
      }
    });

    flushListItems(); // Flush any remaining list items at the end
    return elements;
  };
  
  const renderVideoCard = (video: TrendingVideo, index: number) => {
    const showPlaceholder = !video.thumbnailUrl || imageErrors[index];

    return (
      <a 
        href={video.videoUrl} 
        target="_blank" 
        rel="noopener noreferrer" 
        key={`video-${index}`}
        className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 transition-all duration-300 hover:border-violet-500 hover:shadow-glow-md hover:-translate-y-1 group flex flex-col"
      >
        <div className="aspect-video bg-black rounded-md mb-3 flex items-center justify-center overflow-hidden">
          {showPlaceholder ? (
            <Video className="w-10 h-10 text-slate-600" />
          ) : (
            <img 
              src={video.thumbnailUrl} 
              alt={video.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => handleImageError(index)}
            />
          )}
        </div>
        <h4 className="font-bold text-violet-300 text-sm line-clamp-2 leading-snug flex-grow">{video.title}</h4>
        <p className="text-xs text-slate-400 mt-1 truncate">{video.channelName}</p>
        <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" />
            <span>{video.viewCount}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>{video.publishedTime}</span>
          </div>
        </div>
      </a>
    );
  };

  const renderMusicCard = (music: TrendingMusic, index: number) => (
    <div key={`music-${index}`} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 transition-all duration-300 hover:border-violet-500 hover:shadow-glow-md hover:-translate-y-1 flex items-center">
      <div className="flex-shrink-0 w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mr-4 border border-blue-500/20">
        <Music className="w-6 h-6 text-blue-300" />
      </div>
      <div className="min-w-0">
        <h4 className="font-bold text-blue-300 truncate">{music.trackTitle}</h4>
        <p className="text-sm text-slate-300 truncate">{music.artistName}</p>
        <p className="text-xs text-slate-400 mt-1">{music.videosUsingSound} videos</p>
      </div>
    </div>
  );

  const renderCreatorCard = (creator: TrendingCreator, index: number) => (
    <div key={`creator-${index}`} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 transition-all duration-300 hover:border-violet-500 hover:shadow-glow-md hover:-translate-y-1 group">
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-green-300 truncate">{creator.name}</h4>
          <p className="text-xs text-slate-400 mt-1">{creator.category}</p>
        </div>
        <a href={creator.channelUrl} target="_blank" rel="noopener noreferrer" className="p-1 -mr-1 -mt-1 rounded-full hover:bg-slate-700/50" title={`Visit ${creator.name}'s channel`}>
          <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-green-300 transition-colors" />
        </a>
      </div>
      <p className="text-sm text-slate-300 mt-2 line-clamp-2 flex-grow">{creator.reason}</p>
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-700/50 text-sm">
        <Users className="w-4 h-4 text-slate-500" />
        <span className="font-semibold text-slate-300">{creator.subscriberCount}</span>
      </div>
    </div>
  );
  
  const renderContent = () => {
      if (realtimeLoading) {
          return (
            <div className="text-center py-10">
                <Spinner />
                <p className="mt-2 text-sm text-slate-400">Fetching live trends...</p>
            </div>
          );
      }
      if (realtimeError) {
          return <p className="text-red-400 text-center py-10">{realtimeError}</p>;
      }
      if (realtimeTrends.length === 0) {
          return <p className="text-slate-400 text-center py-10">No trending {activeTrendType} found for the selected filters.</p>;
      }
      
      let gridClass = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4";
      if (activeTrendType === 'music' || activeTrendType === 'creators') {
          gridClass = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4";
      }

      return (
          <div className={gridClass}>
              {realtimeTrends.map((item, index) => {
                  switch(activeTrendType) {
                      case 'videos': return renderVideoCard(item as TrendingVideo, index);
                      case 'music': return renderMusicCard(item as TrendingMusic, index);
                      case 'creators': return renderCreatorCard(item as TrendingCreator, index);
                      default: return null;
                  }
              })}
          </div>
      );
  }

  return (
    <div className="animate-slide-in-up space-y-8">
       {/* Real-time Trends Section */}
      <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl">
        <h2 className="text-2xl font-bold text-center flex items-center justify-center gap-3 mb-1"><Zap className="w-6 h-6 text-yellow-400"/>Real-time Trends</h2>
        <p className="text-center text-slate-400 mb-6">Discover what's trending right now.</p>

        {/* Platform Selector */}
        <div className="flex justify-center mb-6">
          <div className="flex bg-slate-800/60 p-1.5 rounded-full border border-slate-700/50">
            <button
                onClick={() => setPlatform('YouTube')}
                className={`flex items-center justify-center gap-2 py-2 px-6 text-sm font-semibold rounded-full transition-colors ${platform === 'YouTube' ? 'bg-violet text-white shadow-md' : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'}`}
            >
                <Youtube className="w-5 h-5" /> YouTube
            </button>
            <button
                onClick={() => setPlatform('TikTok')}
                className={`flex items-center justify-center gap-2 py-2 px-6 text-sm font-semibold rounded-full transition-colors ${platform === 'TikTok' ? 'bg-violet text-white shadow-md' : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'}`}
            >
                <TikTok className="w-5 h-5" /> TikTok
            </button>
          </div>
        </div>


        {/* Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 p-4 bg-slate-900/30 rounded-lg">
          <div className="relative w-full sm:w-auto">
              <label htmlFor="country-select" className="sr-only">Select Country</label>
              <select
                  id="country-select"
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-violet-light transition-all appearance-none"
                  title="Filter trends by country"
              >
                  {countries.map(country => (
                      <option key={country} value={country}>{country}</option>
                  ))}
              </select>
              <ChevronDown className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <div className="relative w-full sm:w-auto">
              <label htmlFor="category-select" className="sr-only">Select Category</label>
              <select
                  id="category-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-violet-light transition-all appearance-none"
                  title="Filter trends by category"
              >
                  {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                  ))}
              </select>
              <ChevronDown className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Trend Type Tabs */}
        <div className="flex items-center justify-center space-x-2 bg-slate-800/60 p-1.5 rounded-full mb-6">
            <button onClick={() => setActiveTrendType('videos')} className={`w-full py-2 px-4 text-sm font-semibold rounded-full transition-colors ${activeTrendType === 'videos' ? 'bg-violet' : 'hover:bg-slate-700 text-slate-300 hover:text-white'}`}>Videos</button>
            <button onClick={() => setActiveTrendType('music')} className={`w-full py-2 px-4 text-sm font-semibold rounded-full transition-colors ${activeTrendType === 'music' ? 'bg-violet' : 'hover:bg-slate-700 text-slate-300 hover:text-white'}`}>Music</button>
            <button onClick={() => setActiveTrendType('creators')} className={`w-full py-2 px-4 text-sm font-semibold rounded-full transition-colors ${activeTrendType === 'creators' ? 'bg-violet' : 'hover:bg-slate-700 text-slate-300 hover:text-white'}`}>Creators</button>
        </div>

        {renderContent()}

        {user?.plan === 'free' && (
            <div className="mt-6 bg-yellow-400/10 border border-yellow-400/20 text-yellow-300 text-sm p-3 rounded-lg flex items-center justify-center gap-3">
                <Lock className="w-4 h-4" />
                You are viewing the top 8 trends. <button onClick={onUpgradeClick} className="font-bold underline hover:text-yellow-200">Upgrade</button> to see all 48.
            </div>
        )}

      </div>

      {/* Topic Search Section */}
      <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl">
        <h2 className="text-2xl font-bold text-center mb-1 text-slate-100">Discover What's Next</h2>
        <p className="text-center text-slate-400 mb-6">Enter a topic to find the latest trends on YouTube & TikTok.</p>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <label htmlFor="topic-search" className="sr-only">Search by topic</label>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              id="topic-search"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., 'AI video tools', 'Fall recipes', 'Indie games'"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-violet-light transition-all shadow-inner"
              title="Enter a keyword, niche, or topic you're interested in."
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="flex items-center justify-center bg-gradient-to-r from-violet-dark to-violet-light text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:shadow-violet/30"
            title="Search for the latest trends related to your topic."
          >
            {loading ? <Spinner /> : 'Search Trends'}
          </button>
        </div>
        {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
      </div>

      {loading && (
        <div className="text-center py-10">
          <Spinner size="lg" />
          <p className="mt-4 text-slate-300">Analyzing trends...</p>
        </div>
      )}

      {trends && (
        <div className="mt-8 bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl animate-fade-in">
          <h3 className="text-2xl font-bold mb-4 text-slate-100">Trending Now: {topic}</h3>
          <div className="prose prose-invert text-slate-300 max-w-none prose-h3:text-violet-300">{formatTrends(trends)}</div>
           {sources.length > 0 && (
            <div className="mt-6 border-t border-slate-700 pt-4">
                <h4 className="text-lg font-semibold mb-2 flex items-center text-slate-200">
                    <LinkIcon className="w-5 h-5 mr-2"/>
                    Sources
                </h4>
                <ul className="space-y-1">
                    {sources.map((source, index) => (
                        <li key={index}>
                            <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline text-sm">
                                {source.title}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
           )}
        </div>
      )}
    </div>
  );
};

export default TrendDiscovery;
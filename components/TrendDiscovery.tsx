import React, { useState, useEffect } from 'react';
import { findTrends, getRealtimeTrends } from '../services/geminiService';
import { GroundingSource, TrendingChannel, TrendingTopic } from '../types';
import { Search, Link as LinkIcon, Zap, Youtube, Film, ExternalLink, Users, Eye, Lock } from './Icons';
import Spinner from './Spinner';
import Modal from './Modal';
import { useAuth } from '../contexts/AuthContext';

interface TrendDiscoveryProps {
  onUpgradeClick: () => void;
}

const TrendDiscovery: React.FC<TrendDiscoveryProps> = ({ onUpgradeClick }) => {
  const { user } = useAuth();
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trends, setTrends] = useState<string | null>(null);
  const [sources, setSources] = useState<GroundingSource[]>([]);

  const [realtimeTrends, setRealtimeTrends] = useState<{ channels: TrendingChannel[], topics: TrendingTopic[] } | null>(null);
  const [realtimeLoading, setRealtimeLoading] = useState(true);
  const [realtimeError, setRealtimeError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState<'channels' | 'topics' | null>(null);


  useEffect(() => {
    if (!user) return;
    
    const fetchRealtimeTrends = async () => {
      try {
        setRealtimeLoading(true);
        setRealtimeError(null);
        const result = await getRealtimeTrends(user.plan);
        setRealtimeTrends(result);
      } catch (e) {
        setRealtimeError('Could not load today\'s top trends.');
        console.error(e);
      } finally {
        setRealtimeLoading(false);
      }
    };

    fetchRealtimeTrends();
  }, [user]);


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
    } catch (e) {
      setError('An error occurred while fetching trends. Please try again.');
      console.error(e);
    } finally {
      setLoading(false);
    }
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
            <h3 key={i} className="text-xl font-bold text-purple-300 mt-4 mb-2">
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

  const openModal = (type: 'channels' | 'topics') => {
    setModalTitle(type === 'channels' ? "All Trending Channels" : "All Trending Topics");
    setModalContent(type);
    setIsModalOpen(true);
  };

  const handleViewAllClick = (type: 'channels' | 'topics') => {
    if (user?.plan === 'free') {
      onUpgradeClick();
    } else {
      openModal(type);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };
  
  const renderChannel = (channel: TrendingChannel, index: number) => (
    <a 
      key={`chan-${index}`}
      href={channel.channel_url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-3 rounded-lg hover:bg-gray-800 transition-colors group"
    >
      <div className="flex items-center font-semibold text-purple-300">
        {channel.platform === 'YouTube' ? <Youtube className="w-4 h-4 mr-2"/> : <Film className="w-4 h-4 mr-2"/>}
        <span>{channel.name}</span>
        <ExternalLink className="w-3.5 h-3.5 ml-2 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="flex items-center gap-4 ml-6 mt-1.5 text-xs text-gray-400">
        <div className="flex items-center gap-1.5" title="Subscribers">
          <Users className="w-3.5 h-3.5 text-gray-500" />
          <span>{channel.subscriber_count}</span>
        </div>
        <div className="flex items-center gap-1.5" title="Total Views">
          <Eye className="w-3.5 h-3.5 text-gray-500" />
          <span>{channel.view_count}</span>
        </div>
      </div>
      <p className="text-gray-400 ml-6 text-xs mt-1.5">{channel.description}</p>
    </a>
  );

  const renderTopic = (topic: TrendingTopic, index: number) => (
     <div key={`topic-${index}`} className="text-sm p-3 rounded-lg hover:bg-gray-800 transition-colors">
        <div className="flex items-center font-semibold text-purple-300">
         {topic.platform === 'YouTube' ? <Youtube className="w-4 h-4 mr-2"/> : <Film className="w-4 h-4 mr-2"/>}
         {topic.name}
       </div>
       <p className="text-gray-400 ml-6 text-xs mt-1">{topic.description}</p>
     </div>
  );


  return (
    <div className="animate-slide-in-up space-y-8">
       {/* Real-time Trends Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-center flex items-center justify-center gap-3"><Zap className="w-6 h-6 text-yellow-400"/>Today's Top Trends</h2>
        {realtimeLoading && (
          <div className="text-center py-6">
            <Spinner />
            <p className="mt-2 text-sm text-gray-400">Fetching live trends...</p>
          </div>
        )}
        {realtimeError && <p className="text-red-400 text-center py-6">{realtimeError}</p>}
        {realtimeTrends && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Trending Channels */}
            <div className="bg-dark-card border border-gray-700 rounded-xl p-5 flex flex-col">
              <h3 className="font-bold text-lg mb-3 text-gray-100">Trending Channels</h3>
              <div className="space-y-2 flex-grow">
                {realtimeTrends.channels.slice(0, 3).map(renderChannel)}
              </div>
              {realtimeTrends.channels.length > 3 && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => handleViewAllClick('channels')}
                    className={`text-sm font-semibold transition-colors px-4 py-2 rounded-full relative group ${
                      user?.plan === 'free' 
                      ? 'text-gray-500 bg-gray-800/40 hover:bg-gray-700/50'
                      : 'text-purple-300 hover:text-purple-200 bg-gray-800/50 hover:bg-gray-700/70'
                    }`}
                    title={user?.plan === 'free' ? 'Upgrade to Starter or Pro to view all trends' : `View all ${realtimeTrends.channels.length} trends`}
                  >
                    {user?.plan === 'free' && <Lock className="w-3 h-3 absolute -top-1 -right-1 text-yellow-400"/>}
                    View All ({realtimeTrends.channels.length})
                  </button>
                </div>
              )}
            </div>
            {/* Trending Topics */}
            <div className="bg-dark-card border border-gray-700 rounded-xl p-5 flex flex-col">
              <h3 className="font-bold text-lg mb-3 text-gray-100">Trending Topics</h3>
              <div className="space-y-3 flex-grow">
                {realtimeTrends.topics.slice(0, 3).map(renderTopic)}
              </div>
              {realtimeTrends.topics.length > 3 && (
                 <div className="mt-4 text-center">
                    <button
                      onClick={() => handleViewAllClick('topics')}
                      className={`text-sm font-semibold transition-colors px-4 py-2 rounded-full relative group ${
                        user?.plan === 'free' 
                        ? 'text-gray-500 bg-gray-800/40 hover:bg-gray-700/50'
                        : 'text-purple-300 hover:text-purple-200 bg-gray-800/50 hover:bg-gray-700/70'
                      }`}
                      title={user?.plan === 'free' ? 'Upgrade to Starter or Pro to view all trends' : `View all ${realtimeTrends.topics.length} trends`}
                    >
                      {user?.plan === 'free' && <Lock className="w-3 h-3 absolute -top-1 -right-1 text-yellow-400"/>}
                      View All ({realtimeTrends.topics.length})
                    </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="bg-dark-card border border-gray-700 rounded-xl p-6 shadow-2xl backdrop-blur-xl">
        <h2 className="text-2xl font-bold text-center mb-1 text-gray-100">Discover What's Next</h2>
        <p className="text-center text-gray-400 mb-6">Enter a topic to find the latest trends on YouTube & TikTok.</p>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <label htmlFor="topic-search" className="sr-only">Search by topic</label>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="topic-search"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., 'AI video tools', 'Fall recipes', 'Indie games'"
              className="w-full bg-gray-800 border border-gray-600 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-purple transition-all"
              title="Enter a keyword, niche, or topic you're interested in."
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="flex items-center justify-center bg-gradient-to-r from-brand-purple to-brand-blue text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
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
          <p className="mt-4 text-gray-300">Analyzing trends...</p>
        </div>
      )}

      {trends && (
        <div className="mt-8 bg-dark-card border border-gray-700 rounded-xl p-6 shadow-2xl backdrop-blur-xl animate-fade-in">
          <h3 className="text-2xl font-bold mb-4 text-gray-100">Trending Now: {topic}</h3>
          <div className="prose prose-invert text-gray-300 max-w-none">{formatTrends(trends)}</div>
           {sources.length > 0 && (
            <div className="mt-6 border-t border-gray-700 pt-4">
                <h4 className="text-lg font-semibold mb-2 flex items-center text-gray-200">
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

      <Modal isOpen={isModalOpen} onClose={closeModal} title={modalTitle}>
        {modalContent === 'channels' && realtimeTrends && (
          <div className="space-y-1">
            {realtimeTrends.channels.map(renderChannel)}
          </div>
        )}
        {modalContent === 'topics' && realtimeTrends && (
          <div className="space-y-1">
            {realtimeTrends.topics.map(renderTopic)}
          </div>
        )}
      </Modal>

    </div>
  );
};

export default TrendDiscovery;
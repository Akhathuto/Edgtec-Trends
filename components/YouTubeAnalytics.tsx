"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

type ChannelStats = {
  channelId: string;
  title: string;
  subscriberCount: string;
  videoCount: string;
  viewCount: string;
};

type VideoMetric = {
  videoId: string;
  title: string;
  publishedAt: string;
  viewCount: string;
  likeCount: string;
  commentCount: string;
};

type MetricsData = {
  channel: ChannelStats;
  recentVideos: VideoMetric[];
  stats: {
    avgViewsPerVideo: number;
    totalRecentViews: number;
    avgEngagementRate: number;
  };
};

const YouTubeAnalytics: React.FC = () => {
  const [accessToken, setAccessToken] = useState<string>('');
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load access token from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('youtube_access_token');
    if (stored) {
      setAccessToken(stored);
      fetchMetrics(stored);
    }
  }, []);

  // Initiate YouTube OAuth flow
  const handleConnect = () => {
    const clientId = process.env.NEXT_PUBLIC_YOUTUBE_CLIENT_ID;
    if (!clientId) {
      setError('YouTube Client ID not configured');
      return;
    }

    const redirectUri = `${window.location.origin}/api/youtube/auth`;
    const scopes = ['https://www.googleapis.com/auth/youtube'];
    
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.append('client_id', clientId);
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('scope', scopes.join(' '));
    authUrl.searchParams.append('access_type', 'offline');
    
    window.location.href = authUrl.toString();
  };

  // Fetch metrics from authenticated session
  const fetchMetrics = async (token: string) => {
    try {
      setLoading(true);
      setError('');
      
      const res = await fetch(`/api/youtube/metrics?accessToken=${encodeURIComponent(token)}`);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch metrics');
      }

      const data = await res.json();
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setAccessToken('');
      localStorage.removeItem('youtube_access_token');
    } finally {
      setLoading(false);
    }
  };

  // Handle OAuth callback from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('access_token');
    
    if (token) {
      setAccessToken(token);
      localStorage.setItem('youtube_access_token', token);
      fetchMetrics(token);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const disconnect = () => {
    setAccessToken('');
    setMetrics(null);
    localStorage.removeItem('youtube_access_token');
  };

  return (
    <div className="bg-brand-glass p-4 rounded-md">
      <h3 className="text-lg font-bold text-white mb-4">YouTube Analytics</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-700 text-red-200 rounded-md">
          {error}
        </div>
      )}

      {!accessToken ? (
        <div className="text-center py-8">
          <p className="text-slate-400 mb-4">Connect your YouTube channel to view analytics and publish content.</p>
          <Button onClick={handleConnect} className="button-primary">
            🔗 Connect YouTube Account
          </Button>
        </div>
      ) : loading ? (
        <div className="text-center py-8">
          <p className="text-slate-400">Loading analytics...</p>
        </div>
      ) : metrics ? (
        <div className="space-y-6">
          {/* Channel Header */}
          <div className="p-3 bg-slate-900/40 rounded-md">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="text-lg font-semibold text-white">{metrics.channel.title}</h4>
                <p className="text-sm text-slate-400">Channel ID: {metrics.channel.channelId}</p>
              </div>
              <Button onClick={disconnect}>Disconnect</Button>
            </div>

            {/* Channel Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-2 bg-slate-800/50 rounded">
                <div className="text-xs text-slate-400">Subscribers</div>
                <div className="text-lg font-bold text-white">{parseInt(metrics.channel.subscriberCount).toLocaleString()}</div>
              </div>
              <div className="p-2 bg-slate-800/50 rounded">
                <div className="text-xs text-slate-400">Total Views</div>
                <div className="text-lg font-bold text-white">{parseInt(metrics.channel.viewCount).toLocaleString()}</div>
              </div>
              <div className="p-2 bg-slate-800/50 rounded">
                <div className="text-xs text-slate-400">Videos</div>
                <div className="text-lg font-bold text-white">{metrics.channel.videoCount}</div>
              </div>
              <div className="p-2 bg-slate-800/50 rounded">
                <div className="text-xs text-slate-400">Avg. Engagement</div>
                <div className="text-lg font-bold text-white">{metrics.stats.avgEngagementRate}%</div>
              </div>
            </div>
          </div>

          {/* Recent Videos */}
          {metrics.recentVideos.length > 0 && (
            <div>
              <h5 className="text-sm font-semibold text-white mb-2">Recent Videos</h5>
              <div className="space-y-2">
                {metrics.recentVideos.map((video) => (
                  <div key={video.videoId} className="p-3 bg-slate-900/30 rounded-md">
                    <div className="flex items-center justify-between mb-1">
                      <a
                        href={`https://www.youtube.com/watch?v=${video.videoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-white hover:text-blue-300 truncate flex-grow"
                      >
                        {video.title}
                      </a>
                      <span className="text-xs text-slate-500">
                        {new Date(video.publishedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex gap-4 text-xs text-slate-400">
                      <span>👁️ {parseInt(video.viewCount).toLocaleString()} views</span>
                      <span>👍 {parseInt(video.likeCount).toLocaleString()} likes</span>
                      <span>💬 {parseInt(video.commentCount).toLocaleString()} comments</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-2 p-3 bg-slate-800/30 rounded-md">
            <div>
              <div className="text-xs text-slate-400">Avg Views/Video</div>
              <div className="text-lg font-bold text-white">{metrics.stats.avgViewsPerVideo.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Total Recent</div>
              <div className="text-lg font-bold text-white">{metrics.stats.totalRecentViews.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Engagement</div>
              <div className="text-lg font-bold text-green-400">{metrics.stats.avgEngagementRate}%</div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default YouTubeAnalytics;

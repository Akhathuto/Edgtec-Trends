import { NextRequest, NextResponse } from 'next/server';

/**
 * YouTube Metrics endpoint: GET /api/youtube/metrics?accessToken=...
 * Fetches authenticated user's channel info and recent video stats.
 * 
 * Uses YouTube Data API v3:
 * - channels.list() to get channel stats
 * - videos.list() to get recent video performance
 * 
 * Returns: { channel, recentVideos, stats }
 */

const fetchWithAuth = async (url: string, accessToken: string) => {
  return fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accessToken = searchParams.get('accessToken');

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Missing access token' },
        { status: 401 }
      );
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      console.error('Missing YOUTUBE_API_KEY');
      return NextResponse.json(
        { error: 'Server misconfiguration' },
        { status: 500 }
      );
    }

    // Fetch authenticated user's channel
    const channelRes = await fetchWithAuth(
      'https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&mine=true',
      accessToken
    );

    if (!channelRes.ok) {
      console.error('Failed to fetch channel:', await channelRes.text());
      return NextResponse.json(
        { error: 'Failed to fetch channel data' },
        { status: 400 }
      );
    }

    const channelData = await channelRes.json();
    const channel = channelData.items?.[0];

    if (!channel) {
      return NextResponse.json(
        { error: 'No channel found' },
        { status: 404 }
      );
    }

    // Extract channel stats
    const channelStats = {
      channelId: channel.id,
      title: channel.snippet.title,
      description: channel.snippet.description,
      subscriberCount: channel.statistics.subscriberCount || 0,
      videoCount: channel.statistics.videoCount || 0,
      viewCount: channel.statistics.viewCount || 0,
      uploadPlaylistId: channel.contentDetails.relatedPlaylists.uploads,
    };

    // Fetch recent videos from uploads playlist
    const uploadsRes = await fetchWithAuth(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&playlistId=${channelStats.uploadPlaylistId}&maxResults=10`,
      accessToken
    );

    let recentVideos = [];
    if (uploadsRes.ok) {
      const uploadsData = await uploadsRes.json();
      const videoIds = uploadsData.items?.map((item: any) => item.contentDetails.videoId) || [];

      if (videoIds.length > 0) {
        const videosRes = await fetchWithAuth(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds.join(',')}`,
          accessToken
        );

        if (videosRes.ok) {
          const videosData = await videosRes.json();
          recentVideos = videosData.items?.map((v: any) => ({
            videoId: v.id,
            title: v.snippet.title,
            publishedAt: v.snippet.publishedAt,
            viewCount: v.statistics.viewCount || 0,
            likeCount: v.statistics.likeCount || 0,
            commentCount: v.statistics.commentCount || 0,
          })) || [];
        }
      }
    }

    // Summary stats
    const stats = {
      avgViewsPerVideo: recentVideos.length > 0 
        ? Math.round(recentVideos.reduce((sum: number, v: any) => sum + parseInt(v.viewCount), 0) / recentVideos.length)
        : 0,
      totalRecentViews: recentVideos.reduce((sum: number, v: any) => sum + parseInt(v.viewCount), 0),
      avgEngagementRate: recentVideos.length > 0
        ? Math.round((recentVideos.reduce((sum: number, v: any) => sum + (parseInt(v.likeCount) + parseInt(v.commentCount)), 0) / 
          (recentVideos.reduce((sum: number, v: any) => sum + parseInt(v.viewCount), 0) || 1)) * 100)
        : 0,
    };

    return NextResponse.json({
      channel: channelStats,
      recentVideos,
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('YouTube metrics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}

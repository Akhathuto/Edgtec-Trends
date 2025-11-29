import { NextRequest, NextResponse } from 'next/server';

/**
 * API endpoint: /api/trends?keyword=...
 * Returns simulated Google Trends data (interest-over-time, related queries).
 * In production, integrate with:
 * - google-trends-api npm package
 * - pytrends Python server
 * - or official Google Trends API (if available to your plan)
 */

// Mock trend data generator for demo purposes
const generateTrendData = (keyword: string) => {
  const base = Math.floor(Math.random() * 60) + 20; // base interest 20-80
  const volatility = Math.random() * 0.3 + 0.85; // 85-115% multiplier
  const now = new Date();
  
  // Generate 12 months of interest data
  const interestOverTime = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    const value = Math.max(0, Math.min(100, Math.floor(base + Math.random() * 20 - 10)));
    return {
      date: date.toISOString().split('T')[0],
      interest: value,
    };
  });

  const trendScore = Math.round(interestOverTime[interestOverTime.length - 1].interest);
  const trendDirection = trendScore >= base ? 'up' : 'down';
  const sparkline = interestOverTime.map(d => d.interest);

  return {
    keyword,
    trendScore,
    trendDirection,
    sparkline,
    interestOverTime,
    relatedQueries: [
      `${keyword} tips`,
      `${keyword} tutorial`,
      `${keyword} 2025`,
      `best practices ${keyword}`,
      `${keyword} guide`,
    ],
    timestamp: new Date().toISOString(),
  };
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword');

    if (!keyword) {
      return NextResponse.json(
        { error: 'Missing "keyword" query parameter' },
        { status: 400 }
      );
    }

    // Simulate API call delay (remove in production when using real API)
    await new Promise(resolve => setTimeout(resolve, 200));

    // TODO: Replace with real google-trends-api or pytrends integration
    // Example (requires: npm install google-trends-api):
    // const googleTrends = require('google-trends-api');
    // const result = await googleTrends.interestOverTime({ keyword, startTime: new Date(Date.now() - 365*24*60*60*1000) });
    
    const data = generateTrendData(keyword);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Trends API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trends data' },
      { status: 500 }
    );
  }
}

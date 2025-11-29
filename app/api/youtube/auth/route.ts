import { NextRequest, NextResponse } from 'next/server';

/**
 * OAuth Callback endpoint: GET /api/youtube/auth?code=...&state=...
 * Exchanges authorization code for access token and stores securely.
 * 
 * Environment variables required:
 * - YOUTUBE_CLIENT_ID
 * - YOUTUBE_CLIENT_SECRET
 * - YOUTUBE_REDIRECT_URI (must match OAuth config in Google Cloud Console)
 * 
 * Client should:
 * 1. Redirect user to: https://accounts.google.com/o/oauth2/v2/auth?
 *    client_id=...&redirect_uri=.../api/youtube/auth&
 *    scope=https://www.googleapis.com/auth/youtube&response_type=code
 * 2. Google redirects back to /api/youtube/auth?code=...
 * 3. This endpoint exchanges code for access token
 * 4. Response includes access_token to be stored in localStorage/cookie
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code) {
      return NextResponse.json(
        { error: 'Missing authorization code' },
        { status: 400 }
      );
    }

    // Verify state token (CSRF protection)
    // TODO: Implement state token verification from session/cookie

    const clientId = process.env.YOUTUBE_CLIENT_ID;
    const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
    const redirectUri = process.env.YOUTUBE_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      console.error('Missing YouTube OAuth environment variables');
      return NextResponse.json(
        { error: 'Server misconfiguration' },
        { status: 500 }
      );
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }).toString(),
    });

    if (!tokenResponse.ok) {
      console.error('OAuth token exchange failed:', await tokenResponse.text());
      return NextResponse.json(
        { error: 'Failed to exchange authorization code' },
        { status: 400 }
      );
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokenData;

    // TODO: Securely store refresh_token in DB or encrypted session
    // For now, return token to client (client should store securely)

    return NextResponse.json({
      access_token,
      refresh_token,
      expires_in,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('YouTube auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

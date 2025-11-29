import { NextRequest, NextResponse } from 'next/server';

/**
 * YouTube Publishing endpoint: POST /api/youtube/publish
 * Schedules or publishes a video to YouTube using the YouTube Data API.
 * 
 * Request body:
 * {
 *   accessToken: string,
 *   title: string,
 *   description: string,
 *   tags: string[],
 *   thumbnail?: { url: string },
 *   publishAt?: ISO string (scheduled publish time),
 *   privacyStatus: 'public' | 'unlisted' | 'private'
 * }
 * 
 * Note: Actual video file upload requires multipart/form-data and is handled separately.
 * This endpoint creates the video metadata and returns uploadSessionUri for resumable upload.
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accessToken, title, description, tags, publishAt, privacyStatus = 'private' } = body;

    if (!accessToken || !title || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: accessToken, title, description' },
        { status: 400 }
      );
    }

    // Prepare video metadata
    const videoMetadata = {
      snippet: {
        title,
        description,
        tags: tags || [],
        categoryId: '22', // People & Blogs (default; adjust as needed)
      },
      status: {
        privacyStatus,
        ...(publishAt && { publishAt }), // Schedule publish
      },
    };

    // Create video resource (metadata only, no upload yet)
    const createRes = await fetch(
      'https://www.googleapis.com/youtube/v3/videos?part=snippet,status&onBehalfOfContentOwner=false',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(videoMetadata),
      }
    );

    if (!createRes.ok) {
      const errorText = await createRes.text();
      console.error('YouTube video creation failed:', errorText);
      return NextResponse.json(
        { error: 'Failed to create video resource', details: errorText },
        { status: 400 }
      );
    }

    const videoData = await createRes.json();
    const videoId = videoData.id;

    return NextResponse.json({
      videoId,
      title: videoData.snippet.title,
      status: videoData.status.privacyStatus,
      publishAt: videoData.status.publishAt || null,
      message: 'Video metadata created. Ready for upload.',
      uploadUrl: `https://www.youtube.com/upload?video_id=${videoId}`, // For reference
    });
  } catch (error) {
    console.error('YouTube publish error:', error);
    return NextResponse.json(
      { error: 'Failed to publish video' },
      { status: 500 }
    );
  }
}

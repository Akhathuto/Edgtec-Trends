
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const videoUrl = searchParams.get('url');

    if (!videoUrl) {
        return NextResponse.json({ message: 'Video URL is required' }, { status: 400 });
    }

    if (!process.env.API_KEY) {
        return NextResponse.json({ message: 'API key is not configured' }, { status: 500 });
    }

    // Append the API key to the URL for authentication with the VEO API
    const proxiedUrl = `${videoUrl}&key=${process.env.API_KEY}`;

    try {
        const response = await fetch(proxiedUrl);

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`Failed to fetch video from VEO. Status: ${response.status}`, errorBody);
            return NextResponse.json({ message: 'Failed to fetch video' }, { status: response.status });
        }
        
        // Clone the headers and set Content-Disposition for download
        const headers = new Headers(response.headers);
        headers.set('Content-Disposition', 'attachment; filename="utrend_video.mp4"');

        // Stream the video content back to the client
        return new NextResponse(response.body, {
            status: 200,
            headers: headers
        });

    } catch (error: any) {
        console.error('Video proxy error:', error);
        return NextResponse.json({ message: error.message || 'An internal server error occurred' }, { status: 500 });
    }
}

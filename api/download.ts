import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  const { url: downloadLink } = req.query;

  if (typeof downloadLink !== 'string' || !downloadLink) {
    return res.status(400).json({ error: 'Missing or invalid URL parameter.' });
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key is not configured on the server.' });
  }

  try {
    const fullUrl = `${downloadLink}&key=${apiKey}`;
    const videoResponse = await fetch(fullUrl);

    if (!videoResponse.ok || !videoResponse.body) {
      throw new Error(`Failed to fetch video: ${videoResponse.statusText}`);
    }

    const contentType = videoResponse.headers.get('content-type') || 'video/mp4';
    const contentLength = videoResponse.headers.get('content-length');

    res.setHeader('Content-Type', contentType);
    if (contentLength) {
        res.setHeader('Content-Length', contentLength);
    }
    res.setHeader('Content-Disposition', `attachment; filename="utrend_media_${Date.now()}.mp4"`);

    // Stream the video body to the response
    // Manually pipe the ReadableStream from fetch to the Node.js ServerResponse
    const reader = videoResponse.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      res.write(value);
    }
    res.end();

  } catch (error: any) {
    console.error('Download proxy error:', error);
    return res.status(500).json({ error: error.message || 'Failed to download video.' });
  }
}
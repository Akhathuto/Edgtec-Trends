import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as geminiServer from '../services/gemini.server';

// A type guard to check if a key is a valid action in our server-side service
type GeminiServerActions = typeof geminiServer;
type ActionName = keyof GeminiServerActions;

function isValidAction(action: string): action is ActionName {
  return action in geminiServer;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { action, payload } = req.body;

  if (typeof action !== 'string' || !isValidAction(action)) {
    return res.status(400).json({ error: 'Invalid or missing action' });
  }

  try {
    const serviceFunction = geminiServer[action] as (...args: any[]) => Promise<any>;
    const args = Array.isArray(payload) ? payload : [payload];
    const result = await serviceFunction(...args);
    
    // The result from the server-side function is passed directly back to the client.
    // This handles JSON objects, strings, and the operation objects from video generation.
    return res.status(200).json(result);
  } catch (error: any) {
    console.error(`Error executing action "${action}":`, error);
    return res.status(500).json({ error: error.message || 'An internal server error occurred' });
  }
}

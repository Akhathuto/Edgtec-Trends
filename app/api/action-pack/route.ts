import { NextRequest, NextResponse } from 'next/server';

/**
 * API endpoint: POST /api/action-pack
 * Generates an Action Pack (titles, descriptions, hashtags, script, time) using LLM.
 * 
 * Request body: { keyword: string, volume?: number, difficulty?: number }
 * Response: { keyword, titles, descriptions, hashtags, script, suggestedTime, urgency }
 * 
 * Supports multiple LLM providers via environment variables:
 * - OPENAI_API_KEY for OpenAI GPT
 * - ANTHROPIC_API_KEY for Claude
 * - GROQ_API_KEY for Groq (fast & cheaper)
 */

// Fallback template-based generator for demo (no API key required)
const generateActionPackTemplate = (keyword: string, volume?: number, difficulty?: number) => {
  const urgency = (volume || 0) > 50 ? 'High' : (volume || 0) > 20 ? 'Medium' : 'Low';
  const titles = [
    `${keyword} — Quick Wins for 2025`,
    `How to ${keyword} and Grow Fast`,
    `${keyword}: Tips, Tricks & Examples`
  ];
  const descriptions = [
    `Short guide: ${titles[0]}. Learn practical steps to get traction quickly.`,
    `Step-by-step: ${titles[1]}. Includes checklist and hashtag suggestions.`,
    `Examples and templates to help you create fast content on ${keyword}.`
  ];
  const hashtags = [keyword.replace(/\s+/g, ''), 'growth', 'creator', 'shorts', 'howto', 'tips'].slice(0, 5);
  const script = `Hook: Quick stat or question about ${keyword}.
Explain: 2-3 bullets with value.
CTA: Subscribe + check link.`;
  const suggestedTime = new Date(Date.now() + 1000 * 60 * 60 * 24).toLocaleString();
  
  return { keyword, titles, descriptions, hashtags, script, suggestedTime, urgency, source: 'template' };
};

// Example: OpenAI GPT-based generator (uncomment to use)
// const generateActionPackWithOpenAI = async (keyword: string) => {
//   const fetch = (await import('node-fetch')).default;
//   const response = await fetch('https://api.openai.com/v1/chat/completions', {
//     method: 'POST',
//     headers: {
//       'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({
//       model: 'gpt-4-turbo',
//       messages: [
//         {
//           role: 'system',
//           content: 'You are a content creator assistant. Generate 3 catchy YouTube/TikTok titles, 3 descriptions, 5 hashtags, and a 2-sentence script for short-form video content.',
//         },
//         {
//           role: 'user',
//           content: `Generate an action pack for the keyword: "${keyword}". Return JSON with keys: titles (array), descriptions (array), hashtags (array), script (string).`,
//         },
//       ],
//       temperature: 0.8,
//       max_tokens: 500,
//     }),
//   });
//   const data = await response.json();
//   const content = data.choices[0].message.content;
//   const parsed = JSON.parse(content);
//   return { keyword, ...parsed, source: 'openai' };
// };

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keyword, volume, difficulty } = body;

    if (!keyword) {
      return NextResponse.json(
        { error: 'Missing "keyword" in request body' },
        { status: 400 }
      );
    }

    // Check if LLM API key is configured
    const hasLlmKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.GROQ_API_KEY;

    let actionPack;
    if (!hasLlmKey) {
      // Fallback to template-based generator
      actionPack = generateActionPackTemplate(keyword, volume, difficulty);
    } else {
      // TODO: Implement LLM provider calls
      // For now, use template as fallback
      actionPack = generateActionPackTemplate(keyword, volume, difficulty);
      // Uncomment below to use OpenAI:
      // actionPack = await generateActionPackWithOpenAI(keyword);
    }

    return NextResponse.json(actionPack, { status: 200 });
  } catch (error) {
    console.error('Action Pack API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate action pack' },
      { status: 500 }
    );
  }
}

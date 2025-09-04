import { GoogleGenAI, Type, GenerateContentResponse, Modality } from "@google/genai";
import { ContentIdea, MonetizationStrategy, FullReport, TrendingChannel, TrendingTopic, User, TrendingVideo, TrendingMusic, TrendingCreator, KeywordAnalysis, ChannelAnalyticsData, ChannelGrowthPlan, Channel, SponsorshipOpportunity, BrandPitch, VideoAnalysis, RepurposedContent } from '../types.ts';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * A robust function to extract a JSON object or array from a string,
 * which may contain markdown, conversational text, or other characters.
 * It intelligently finds the start and end of the JSON structure.
 * @param rawText The raw string response from the AI.
 * @returns The parsed JSON object/array or null if parsing fails.
 */
function extractJson<T>(rawText: string): T | null {
    const textToParse = rawText.trim();
    // First, try to find a JSON blob inside markdown ```json ... ```
    const markdownMatch = textToParse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    const potentialJson = markdownMatch && markdownMatch[1] ? markdownMatch[1].trim() : textToParse;

    const firstBrace = potentialJson.indexOf('{');
    const firstBracket = potentialJson.indexOf('[');

    let startChar: '{' | '[' | null = null;
    let startIndex = -1;

    // Determine if we are looking for an object or an array based on the first occurrence
    if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
        startChar = '{';
        startIndex = firstBrace;
    } else if (firstBracket !== -1) {
        startChar = '[';
        startIndex = firstBracket;
    }

    if (!startChar) {
        console.warn("No JSON start character ('{' or '[') found in the response.");
        return null;
    }

    const endChar = startChar === '{' ? '}' : ']';
    const endIndex = potentialJson.lastIndexOf(endChar);
    if (endIndex === -1) {
        console.warn(`No JSON end character ('${endChar}') found in the response.`);
        return null;
    }

    // Use a counter to find the matching start character by scanning backwards from the end
    let openCount = 0;
    let finalStartIndex = -1;
    for (let i = endIndex; i >= startIndex; i--) {
        if (potentialJson[i] === endChar) openCount++;
        else if (potentialJson[i] === startChar) openCount--;
        if (openCount === 0) {
            finalStartIndex = i;
            break;
        }
    }

    if (finalStartIndex !== -1) {
        const jsonString = potentialJson.substring(finalStartIndex, endIndex + 1);
        try {
            return JSON.parse(jsonString) as T;
        } catch (e) {
            console.error("Failed to parse extracted JSON.", {
                error: e,
                jsonString: jsonString
            });
        }
    }
    
    console.warn("Could not extract a valid JSON object or array from the response.");
    console.log("Raw response for parsing error:", rawText);
    return null;
}


//
// Dashboard Functions
//

export const getChannelSnapshots = async (channels: Channel[]): Promise<any[]> => {
    if (channels.length === 0) return [];

    try {
        const responses = await Promise.all(channels.map(async (channel) => {
            const defaultSnapshot = { id: channel.id, followerCount: 'N/A', totalViews: 'N/A', followerTrend: 'stable', viewsTrend: 'stable', weeklyViewGrowth: 'N/A' };
            if (channel.platform !== 'YouTube' && channel.platform !== 'TikTok') {
                return defaultSnapshot;
            }
            
            const prompt = `Using real-time search data, provide a brief snapshot for the ${channel.platform} channel at this URL: ${channel.url}.
Your response MUST be a single JSON object string that can be parsed directly. Do not include markdown formatting like \`\`\`json ... \`\`\`.
The JSON object must have these exact keys:
"followerCount" (a string like "1.2M" or "5,432"),
"totalViews" (a string like "500M" or "1,234,567"),
"followerTrend" (a string with one of these values: 'up', 'down', 'stable'),
"viewsTrend" (a string with one of these values: 'up', 'down', 'stable'),
"weeklyViewGrowth" (a string describing recent view growth, e.g., "+5.2K views" or "-1.1%").
Make your best effort to provide this data based on search; if a specific field is unavailable from public data, use a placeholder like "N/A".`;
            
            try {
                const response = await ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: prompt,
                    config: {
                        tools: [{ googleSearch: {} }],
                    }
                });

                const parsed = extractJson<any>(response.text);
                if (parsed) {
                    return { id: channel.id, ...parsed };
                }
                return { ...defaultSnapshot, error: 'Parsing failed' };

            } catch (channelError) {
                console.error(`Error fetching snapshot for ${channel.url}:`, channelError);
                return { ...defaultSnapshot, error: 'API call failed' };
            }
        }));
        
        return responses;

    } catch (error) {
        console.error("Error in getChannelSnapshots Promise.all:", error);
        throw new Error("Failed to fetch channel snapshots from Gemini API.");
    }
};

export const generateDashboardTip = async (channels: Channel[]): Promise<string> => {
    try {
        let prompt = `You are an expert YouTube and TikTok growth strategist. Provide one single, actionable, and personalized tip for a content creator to grow their channel. The tip must be concise (around 30-50 words). Do not add any conversational fluff or greetings.`;
        if (channels.length > 0) {
            const niches = channels.map(c => c.platform).join(' and ');
            const primaryNiche = channels[0]?.platform || 'social media';
            prompt += ` The creator is on ${niches}. Base the tip on general best practices for a ${primaryNiche} creator.`;
        } else {
            prompt += " The creator has not connected any channels yet, so provide a general but insightful tip for someone just starting out.";
        }
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        
        let text = response.text.trim();
        if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) {
            text = text.substring(1, text.length - 1);
        }
        return text;

    } catch (error) {
        console.error("Error generating dashboard tip:", error);
        throw new Error("Failed to generate dashboard tip from Gemini API.");
    }
};

//
// Trend Discovery Functions
//

export const getTickerTrends = async (): Promise<string[]> => {
      try {
          const response = await ai.models.generateContent({
              model: "gemini-2.5-flash",
              contents: `Identify 10 of the most viral, interesting, and current trending topics or search terms globally across social media. Each trend should be a short phrase (2-5 words). Respond as a JSON array of strings.`,
              config: {
                  tools: [{ googleSearch: {} }],
              }
          });
          const parsed = extractJson<string[]>(response.text);
          return parsed || [];
      } catch (error) {
          console.error("Error fetching ticker trends:", error);
          return [];
      }
};

export const getRealtimeTrends = async (userPlan: User['plan'], country: string): Promise<{ channels: TrendingChannel[], topics: TrendingTopic[] }> => {
    const trendLimit = userPlan === 'free' ? 5 : 50;
    const countryFilter = country === 'Worldwide' ? '' : ` in ${country}`;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `As a social media trend expert, identify up to ${trendLimit} of the top currently trending channels and up to ${trendLimit} of the top trending topics across YouTube (including Shorts) and TikTok${countryFilter}. Leverage real-time search data. Your response MUST be a single JSON object string that can be parsed directly. Do not include markdown formatting like \`\`\`json ... \`\`\`. The JSON object must have these keys: "trendingChannels" (an array of objects with keys: "name", "platform", "description", "channel_url", "subscriber_count", "view_count") and "trendingTopics" (an array of objects with keys: "name", "platform", "description").`,
            config: {
                tools: [{ googleSearch: {} }],
            }
        });
        const parsed = extractJson<{ trendingChannels?: TrendingChannel[], trendingTopics?: TrendingTopic[] }>(response.text);
        return {
            channels: parsed?.trendingChannels || [],
            topics: parsed?.trendingTopics || []
        };
    } catch (error) {
        console.error("Error fetching real-time trends:", error);
        if (error instanceof Error && (error.message.includes('RESOURCE_EXHAUSTED') || error.message.includes('429'))) {
            throw new Error("API quota exceeded. Please try again later.");
        }
        throw new Error("Failed to fetch real-time trends from Gemini API.");
    }
};

export const getTrendingContent = async (
  contentType: 'videos' | 'music' | 'creators' | 'topics',
  userPlan: User['plan'],
  country: string,
  category: string,
  platform: 'YouTube' | 'TikTok'
): Promise<TrendingVideo[] | TrendingMusic[] | TrendingCreator[] | TrendingTopic[]> => {
  const trendLimit = userPlan === 'free' ? 8 : 48;
  const countryFilter = country === 'Worldwide' ? 'globally' : `in ${country}`;
  const categoryFilter = category === 'All' ? '' : `in the '${category}' category`;

  let prompt = `Based on current social media trends and using real-time search data, list approximately ${trendLimit} popular and viral ${platform} ${contentType} ${categoryFilter} ${countryFilter}. Your response MUST be a single JSON array of objects that can be parsed directly. Do not include markdown formatting like \`\`\`json ... \`\`\`. Make your best effort to provide the requested data; if some content is not available, it's okay to return fewer than ${trendLimit} items.`;

  switch (contentType) {
    case 'videos':
      prompt += ` Each object in the array should have these exact keys: "title" (string), "videoUrl" (string), "thumbnailUrl" (a direct, valid image link, string), "channelName" (string), "viewCount" (a string like "1.2M views"), and "publishedTime" (a descriptive string like "2 days ago"). If a specific field is unavailable, provide a reasonable placeholder.`;
      break;
    case 'music':
      prompt += ` Each object in the array should have these exact keys: "trackTitle", "artistName", "videosUsingSound" (e.g., "1.5M videos"), "reason". If a field is unavailable, provide a placeholder.`;
      break;
    case 'creators':
      prompt += ` This includes both top creators and breakout creators. Each object in the array should have these exact keys: "name", "channelUrl", "subscriberCount", "category", "reason". If a field is unavailable, provide a placeholder.`;
      break;
    case 'topics':
      prompt += ` Each object in the array should have these exact keys: "name", "platform" (either "YouTube" or "TikTok"), and "description". If a field is unavailable, provide a placeholder.`;
      break;
  }
  
  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
        }
    });
    
    const parsed = extractJson<TrendingVideo[] | TrendingMusic[] | TrendingCreator[] | TrendingTopic[]>(response.text);
    return parsed || [];

  } catch (error) {
    console.error(`Error fetching trending ${contentType}:`, error);
    // Instead of throwing, we will return an empty array to prevent UI errors.
    return [];
  }
};

export const findTrends = async (topic: string, platform: 'YouTube' | 'TikTok', country: string, category: string): Promise<GenerateContentResponse> => {
  const countryFilter = country === 'Worldwide' ? '' : ` in ${country}`;
  const categoryFilter = category === 'All' ? '' : ` within the '${category}' category`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze current trends for the topic "${topic}" specifically on ${platform}${countryFilter}${categoryFilter}. ${platform === 'YouTube' ? 'If relevant, include YouTube Shorts trends.' : ''} Identify viral challenges, popular sounds/music, trending video formats, and key conversations. Present the findings clearly.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    return response;
  } catch (error) {
    console.error("Error finding trends:", error);
    if (error instanceof Error && (error.message.includes('RESOURCE_EXHAUSTED') || error.message.includes('429'))) {
        throw new Error("API quota exceeded. Please try again later.");
    }
    throw new Error("Failed to fetch trends from Gemini API.");
  }
};

//
// Idea & Strategy Functions
//

export const getKeywordAnalysis = async (keyword: string): Promise<KeywordAnalysis> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Act as a YouTube SEO expert. For the keyword "${keyword}", provide a detailed analysis. Your response must be in JSON. Give an estimated search volume ('Very High', 'High', 'Medium', 'Low', 'Very Low'), competition level ('High', 'Medium', 'Low'), a list of 5-10 related long-tail keywords, and 3 content ideas based on the keyword.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        keyword: { type: Type.STRING },
                        searchVolume: { type: Type.STRING },
                        competition: { type: Type.STRING },
                        relatedKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                        contentIdeas: { type: Type.ARRAY, items: { type: Type.STRING } },
                    }
                }
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as KeywordAnalysis;
    } catch (error) {
        console.error("Error getting keyword analysis:", error);
        if (error instanceof Error && (error.message.includes('RESOURCE_EXHAUSTED') || error.message.includes('429'))) {
            throw new Error("API quota exceeded. Please try again later.");
        }
        throw new Error("Failed to get keyword analysis from Gemini API.");
    }
};

export const generateContentIdeas = async (topic: string, platform: 'YouTube' | 'TikTok' | 'Both', userPlan: User['plan']): Promise<ContentIdea[]> => {
    let ideaCount: number;
    switch(userPlan) {
        case 'pro':
            ideaCount = 5;
            break;
        case 'starter':
            ideaCount = 3;
            break;
        case 'free':
        default:
            ideaCount = 1;
            break;
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Generate ${ideaCount} viral video ${ideaCount > 1 ? 'ideas' : 'idea'} for a content creator on ${platform} about "${topic}". For each idea, provide a catchy title, a strong hook (first 3 seconds), a brief script outline, 5 relevant hashtags, and a virality potential score (e.g., "8/10", "High") with a brief reasoning.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            hook: { type: Type.STRING },
                            script_outline: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING }
                            },
                            hashtags: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING }
                            },
                            virality_potential: {
                                type: Type.OBJECT,
                                properties: {
                                    score: { type: Type.STRING },
                                    reasoning: { type: Type.STRING }
                                }
                            }
                        }
                    }
                }
            }
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        return Array.isArray(result) ? result : [result];

    } catch (error) {
        console.error("Error generating content ideas:", error);
        if (error instanceof Error && (error.message.includes('RESOURCE_EXHAUSTED') || error.message.includes('429'))) {
            throw new Error("API quota exceeded. Please try again later.");
        }
        throw new Error("Failed to generate content ideas from Gemini API.");
    }
};

export const generateVideoScript = async (idea: Pick<ContentIdea, 'title' | 'hook' | 'script_outline'>): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Based on the following video idea, generate a detailed video script. The script should be production-ready, including dialogue, visual cues, sound effect suggestions, and calls to action.
            
            Title: ${idea.title}
            Hook: ${idea.hook}
            Outline: ${idea.script_outline.join(', ')}
            
            Generate the script as a single block of formatted text.`,
        });

        return response.text;

    } catch (error) {
        console.error("Error generating video script:", error);
        if (error instanceof Error && (error.message.includes('RESOURCE_EXHAUSTED') || error.message.includes('429'))) {
            throw new Error("API quota exceeded. Please try again later.");
        }
        throw new Error("Failed to generate video script from Gemini API.");
    }
};

export const getMonetizationStrategies = async (platform: 'YouTube' | 'TikTok', followers: number): Promise<MonetizationStrategy[]> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `List and explain monetization strategies for a ${platform} creator with ${followers} followers. For each strategy, describe it, explain the typical requirements, and estimate the earning potential.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            strategy: { type: Type.STRING },
                            description: { type: Type.STRING },
                            requirements: { type: Type.STRING },
                            potential: { type: Type.STRING }
                        }
                    }
                }
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as MonetizationStrategy[];
    } catch (error) {
        console.error("Error getting monetization strategies:", error);
        if (error instanceof Error && (error.message.includes('RESOURCE_EXHAUSTED') || error.message.includes('429'))) {
            throw new Error("API quota exceeded. Please try again later.");
        }
        // Return empty array for better UX
        return [];
    }
};

export const generateFullReport = async (topic: string, followers: number): Promise<FullReport> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Create a comprehensive content strategy report for the topic "${topic}". The report should be for a creator with ${followers} followers.
            Your response MUST be a single JSON object string that can be parsed directly. Do not include markdown formatting like \`\`\`json ... \`\`\`. 
            The JSON object must have these exact keys:
            1.  "trendAnalysis": A markdown-formatted string analyzing current trends for "${topic}" on both YouTube and TikTok. Identify viral challenges, popular sounds/music, trending video formats, and key conversations.
            2.  "contentIdeas": An array of 3 objects, each with keys "title", "hook", "script_outline" (array of strings), and "hashtags" (array of strings).
            3.  "monetizationStrategies": An array of objects, each with keys "strategy", "description", "requirements", and "potential".`,
            config: {
                tools: [{ googleSearch: {} }],
            }
        });
        
        const parsed = extractJson<FullReport>(response.text);
        if (parsed) {
            return parsed;
        }
        throw new Error("The API response did not contain valid JSON data for the report.");
    } catch (error) {
        console.error("Error generating full report:", error);
        if (error instanceof Error && (error.message.includes('RESOURCE_EXHAUSTED') || error.message.includes('429'))) {
            throw new Error("API quota exceeded. Please try again later.");
        }
        throw new Error("Failed to generate full report from Gemini API.");
    }
};

//
// AI Generation Functions (Video, Image, etc.)
//

export const generateVideo = async (prompt: string, platform: 'YouTube' | 'TikTok' | 'YouTube Shorts', image?: { imageBytes: string, mimeType: string }): Promise<any> => {
    try {
        let modifiedPrompt = prompt;
        if (platform === 'YouTube') {
            modifiedPrompt = `Create a high-quality, cinematic video suitable for YouTube. The video should be in a widescreen 16:9 aspect ratio. The user's prompt is: "${prompt}"`;
        } else if (platform === 'YouTube Shorts') {
            modifiedPrompt = `Create a visually engaging, fast-paced vertical video suitable for YouTube Shorts. The video must be in a 9:16 aspect ratio, perfect for short-form mobile viewing. The user's prompt is: "${prompt}"`;
        } else { // TikTok
            modifiedPrompt = `Create a visually engaging, fast-paced vertical video suitable for TikTok. The video must be in a 9:16 aspect ratio. The user's prompt is: "${prompt}"`;
        }

        const operation = await ai.models.generateVideos({
            model: 'veo-2.0-generate-001',
            prompt: modifiedPrompt,
            image: image,
            config: {
                numberOfVideos: 1
            }
        });
        return operation;
    } catch (error) {
        console.error("Error initiating video generation:", error);
        if (error instanceof Error && (error.message.includes('RESOURCE_EXHAUSTED') || error.message.includes('429'))) {
             throw new Error("API quota exceeded. Please check your plan and billing details.");
        }
        throw new Error("Failed to start video generation.");
    }
};

export const editVideo = async (prompt: string, image: { imageBytes: string, mimeType: string }): Promise<any> => {
    try {
        const modifiedPrompt = `Using the provided image as a starting point and reference for the main subject and style, create a new video that follows these instructions: "${prompt}".`;
        const operation = await ai.models.generateVideos({
            model: 'veo-2.0-generate-001',
            prompt: modifiedPrompt,
            image: image,
            config: {
                numberOfVideos: 1
            }
        });
        return operation;
    } catch (error) {
        console.error("Error initiating video editing:", error);
        if (error instanceof Error && (error.message.includes('RESOURCE_EXHAUSTED') || error.message.includes('429'))) {
             throw new Error("API quota exceeded. Please check your plan and billing details.");
        }
        throw new Error("Failed to start video editing.");
    }
};


export const checkVideoStatus = async (operation: any): Promise<any> => {
    try {
        const updatedOp = await ai.operations.getVideosOperation({ operation: operation });
        return updatedOp;
    } catch (error) {
        console.error("Error checking video status:", error);
        throw new Error("Failed to check video operation status.");
    }
};

export const generateTranscriptFromPrompt = async (prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Based on the following video prompt, generate a suitable voiceover transcript. The transcript should be between 100 and 150 words. Be creative and engaging.\n\nVideo Prompt: "${prompt}"`,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error generating transcript:", error);
        throw new Error("Failed to generate transcript from Gemini API.");
    }
};

export const editImage = async (base64ImageData: string, mimeType: string, prompt: string): Promise<{ image: string | null; text: string | null }> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    { inlineData: { data: base64ImageData, mimeType: mimeType } },
                    { text: prompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });
        
        let editedImage: string | null = null;
        let editedText: string | null = null;

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                editedImage = part.inlineData.data;
            } else if (part.text) {
                editedText = part.text;
            }
        }
        return { image: editedImage, text: editedText };

    } catch (error) {
        console.error("Error editing image:", error);
        throw new Error("Failed to edit image using Gemini API.");
    }
};

export const generateAnimation = async (prompt: string, style: string): Promise<any> => {
    try {
        const modifiedPrompt = `Create an animated video in a ${style} style. The scene should be: "${prompt}"`;
        const operation = await ai.models.generateVideos({
            model: 'veo-2.0-generate-001',
            prompt: modifiedPrompt,
            config: {
                numberOfVideos: 1
            }
        });
        return operation;
    } catch (error) {
        console.error("Error initiating animation generation:", error);
        throw new Error("Failed to start animation generation.");
    }
};

export const generateGif = async (prompt: string): Promise<any> => {
    try {
        const modifiedPrompt = `Create a short, looping, animated GIF based on this description: "${prompt}". The GIF should have no sound.`;
        const operation = await ai.models.generateVideos({
            model: 'veo-2.0-generate-001',
            prompt: modifiedPrompt,
            config: {
                numberOfVideos: 1
            }
        });
        return operation;
    } catch (error) {
        console.error("Error initiating GIF generation:", error);
        throw new Error("Failed to start GIF generation.");
    }
};

export const generateLogo = async (prompt: string, style: string, transparentBg: boolean): Promise<string> => {
    try {
        const modifiedPrompt = `Create a logo for a brand described as: "${prompt}". The style should be ${style}. ${transparentBg ? 'The logo must have a transparent background.' : 'The logo should have a simple, solid background.'}`;
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: modifiedPrompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/png',
              aspectRatio: '1:1',
            },
        });
        if (response.generatedImages && response.generatedImages.length > 0) {
            return response.generatedImages[0].image.imageBytes;
        }
        throw new Error("No logo was generated.");
    } catch (error) {
        console.error("Error generating logo:", error);
        throw new Error("Failed to generate logo from Gemini API.");
    }
};

export const generateContentPrompt = async (topic: string, audience: string, style: string, elements: string): Promise<string> => {
    try {
        let prompt = `Generate an optimized, detailed, and creative prompt for an AI video generator. The core topic is "${topic}".`;
        if (audience) prompt += ` The target audience is ${audience}.`;
        if (style) prompt += ` The desired visual style is ${style}.`;
        if (elements) prompt += ` Key elements to include are: ${elements}.`;
        prompt += ` The final prompt should be a descriptive paragraph, focusing on visual details, camera angles, and atmosphere. Do not add any conversational text, just the prompt itself.`

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error generating prompt:", error);
        throw new Error("Failed to generate prompt from Gemini API.");
    }
};

//
// Channel & Growth Functions
//

export const getChannelAnalytics = async (channelUrl: string, platform: 'YouTube' | 'TikTok'): Promise<ChannelAnalyticsData> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Using real-time search data, analyze the ${platform} channel at ${channelUrl}. Respond in JSON with keys: "platform", "channelName", "followerCount", "followerTrend" ('up', 'down', 'stable'), "totalViews", "viewsTrend" ('up', 'down', 'stable'), "totalLikes" (for TikTok only, string), "aiSummary", and "recentVideos" (for YouTube only, array of {title, videoUrl, viewCount}).`,
            config: {
                tools: [{ googleSearch: {} }],
            }
        });
        const parsed = extractJson<ChannelAnalyticsData>(response.text);
        if (parsed) {
            return parsed;
        }
        throw new Error("Failed to parse analytics data from API response.");
    } catch (error) {
        console.error("Error fetching channel analytics:", error);
        throw new Error("Failed to fetch channel analytics from Gemini API.");
    }
};

export const generateChannelOpportunities = async (channelUrl: string, platform: 'YouTube' | 'TikTok'): Promise<string[]> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Based on the ${platform} channel at ${channelUrl}, identify 3 specific, actionable growth opportunities. Respond as a JSON array of strings.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Error generating channel opportunities:", error);
        return [];
    }
};

export const generateChannelGrowthPlan = async (channelUrl: string, platform: 'YouTube' | 'TikTok'): Promise<ChannelGrowthPlan> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Create a comprehensive channel growth plan for the ${platform} channel at ${channelUrl}. Analyze their content, SEO/discoverability, audience engagement, and thumbnails/covers. For each area, provide analysis and recommendations. Your response MUST be a single JSON object string that can be parsed directly. Do not include markdown formatting like \`\`\`json ... \`\`\`.`,
            config: {
                tools: [{ googleSearch: {} }],
            }
        });
        const parsed = extractJson<ChannelGrowthPlan>(response.text);
        if (parsed) {
            return parsed;
        }
        throw new Error("Failed to parse growth plan data from API response.");
    } catch (error) {
        console.error("Error generating channel growth plan:", error);
        throw new Error("Failed to generate growth plan from Gemini API.");
    }
};

export const findSponsorshipOpportunities = async (channelUrl: string, platform: 'YouTube' | 'TikTok'): Promise<SponsorshipOpportunity[]> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Based on the ${platform} channel at ${channelUrl}, identify 5 potential sponsorship opportunities. For each, provide the brand name, industry, relevance, and a sponsor match score (e.g., "95/100"). Respond as a JSON array of objects. Do not include markdown.`,
            config: {
                tools: [{ googleSearch: {} }],
            }
        });
        const parsed = extractJson<SponsorshipOpportunity[]>(response.text);
        return parsed || [];
    } catch (error) {
        console.error("Error finding sponsors:", error);
        return [];
    }
};

export const generateBrandPitch = async (channelName: string, platform: 'YouTube' | 'TikTok', brandName: string, industry: string): Promise<BrandPitch> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Generate a professional sponsorship pitch email from ${channelName} (a ${platform} creator) to ${brandName} (in the ${industry} industry). Provide a subject line and body. Respond in JSON with keys "subject" and "body".`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        subject: { type: Type.STRING },
                        body: { type: Type.STRING },
                    }
                }
            }
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Error generating brand pitch:", error);
        throw new Error("Failed to generate brand pitch from Gemini API.");
    }
};

export const analyzeVideoUrl = async (videoUrl: string): Promise<VideoAnalysis> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Analyze the YouTube or TikTok video at this URL: ${videoUrl}. Provide a comprehensive analysis. Respond in JSON with keys: "title", "aiSummary", "engagementAnalysis", "contentAnalysis", and "improvementSuggestions" (an array of strings).`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        aiSummary: { type: Type.STRING },
                        engagementAnalysis: { type: Type.STRING },
                        contentAnalysis: { type: Type.STRING },
                        improvementSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
                    }
                }
            }
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Error analyzing video:", error);
        throw new Error("Failed to analyze video from Gemini API.");
    }
};

export const repurposeVideoContent = async (videoUrl: string): Promise<RepurposedContent> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Based on the video at ${videoUrl}, repurpose its content into a blog post, a tweet thread (array of strings), and a LinkedIn post. Respond in JSON with keys: "blogPost", "tweetThread", "linkedInPost".`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        blogPost: { type: Type.STRING },
                        tweetThread: { type: Type.ARRAY, items: { type: Type.STRING } },
                        linkedInPost: { type: Type.STRING },
                    }
                }
            }
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Error repurposing content:", error);
        throw new Error("Failed to repurpose content from Gemini API.");
    }
};
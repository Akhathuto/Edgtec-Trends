import { GoogleGenAI, Type, GenerateContentResponse, Modality } from "@google/genai";
import { ContentIdea, MonetizationStrategy, FullReport, TrendingChannel, TrendingTopic, User, TrendingVideo, TrendingMusic, TrendingCreator, KeywordAnalysis, ChannelAnalyticsData, ChannelGrowthPlan, Channel, SponsorshipOpportunity, BrandPitch, VideoAnalysis, RepurposedContent } from '../types.ts';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

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
        const rawText = response.text.trim();
        const jsonMatch = rawText.match(/{[\s\S]*}/);
        if (jsonMatch && jsonMatch[0]) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                channels: parsed.trendingChannels || [],
                topics: parsed.trendingTopics || []
            };
        }
        throw new Error("The API response did not contain valid JSON data for trends.");
    } catch (error) {
        console.error("Error fetching real-time trends:", error);
        if (error instanceof Error && (error.message.includes('RESOURCE_EXHAUSTED') || error.message.includes('429'))) {
            throw new Error("API quota exceeded. Please try again later.");
        }
        throw new Error("Failed to fetch real-time trends from Gemini API.");
    }
};

export const getTrendingContent = async (
  contentType: 'videos' | 'music' | 'creators',
  userPlan: User['plan'],
  country: string,
  category: string,
  platform: 'YouTube' | 'TikTok'
): Promise<TrendingVideo[] | TrendingMusic[] | TrendingCreator[]> => {
  const trendLimit = userPlan === 'free' ? 8 : 48;
  const countryFilter = country === 'Worldwide' ? 'globally' : `in ${country}`;
  const categoryFilter = category === 'All' ? '' : `in the '${category}' category`;

  let prompt = `Using real-time search data, identify the top ${trendLimit} currently trending ${platform} ${contentType} ${categoryFilter} ${countryFilter}. Your response MUST be a single JSON array of objects that can be parsed directly. Do not include markdown formatting like \`\`\`json ... \`\`\`.`;

  switch (contentType) {
    case 'videos':
      prompt += ` Each object in the array should have these exact keys: "title", "videoUrl", "thumbnailUrl" (a direct, valid image link), "channelName", "viewCount", "publishedTime".`;
      break;
    case 'music':
      prompt += ` Each object in the array should have these exact keys: "trackTitle", "artistName", "videosUsingSound", "reason".`;
      break;
    case 'creators':
      prompt += ` This includes both top creators and breakout creators. Each object in the array should have these exact keys: "name", "channelUrl", "subscriberCount", "category", "reason".`;
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
    const rawText = response.text.trim();
    
    let jsonString = rawText;
    const markdownMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (markdownMatch && markdownMatch[1]) {
        jsonString = markdownMatch[1].trim();
    }
    
    const jsonMatch = jsonString.match(/(\[[\s\S]*\])/);
    if (jsonMatch && jsonMatch[0]) {
        try {
            return JSON.parse(jsonMatch[0]);
        } catch (parseError) {
             console.error(`Failed to parse JSON for trending ${contentType}:`, parseError);
             console.error("Raw API response:", rawText);
        }
    }
    throw new Error(`The API response did not contain valid JSON data for trending ${contentType}.`);
  } catch (error) {
    console.error(`Error fetching trending ${contentType}:`, error);
    if (error instanceof Error && (error.message.includes('RESOURCE_EXHAUSTED') || error.message.includes('429'))) {
        throw new Error("API quota exceeded. Please try again later.");
    }
    if (error instanceof Error && error.message.includes('The API response did not contain valid JSON')) {
      throw error;
    }
    throw new Error(`Failed to fetch trending ${contentType} from Gemini API.`);
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
        // The API might return a single object instead of an array if we only ask for one
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
        throw new Error("Failed to fetch monetization strategies from Gemini API.");
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
        const rawText = response.text.trim();
        const jsonMatch = rawText.match(/{[\s\S]*}/);
        if (jsonMatch && jsonMatch[0]) {
            return JSON.parse(jsonMatch[0]) as FullReport;
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

export const generateAnimation = async (prompt: string, style: string): Promise<any> => {
    try {
        const modifiedPrompt = `Create a high-quality animation in a ${style} style. The animation should be in a 16:9 aspect ratio. The user's prompt is: "${prompt}"`;

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
        if (error instanceof Error && (error.message.includes('RESOURCE_EXHAUSTED') || error.message.includes('429'))) {
             throw new Error("API quota exceeded. Please check your plan and billing details.");
        }
        throw new Error("Failed to start animation generation.");
    }
};

export const generateGif = async (prompt: string): Promise<any> => {
    try {
        const modifiedPrompt = `Create a short, silent, high-quality, seamlessly looping GIF. The user's prompt is: "${prompt}"`;

        const operation = await ai.models.generateVideos({
            model: 'veo-2.0-generate-001',
            prompt: modifiedPrompt,
            // FIX: Removed 'outputMimeType' from the config as it is not a valid property for generateVideos.
            // The API returns an MP4 by default, which can be looped in the browser.
            config: {
                numberOfVideos: 1,
            }
        });
        return operation;
    } catch (error) {
        console.error("Error initiating GIF generation:", error);
        if (error instanceof Error && (error.message.includes('RESOURCE_EXHAUSTED') || error.message.includes('429'))) {
             throw new Error("API quota exceeded. Please check your plan and billing details.");
        }
        throw new Error("Failed to start GIF generation.");
    }
};

export const checkVideoStatus = async (operation: any): Promise<any> => {
    try {
        const updatedOperation = await ai.operations.getVideosOperation({ operation: operation });
        return updatedOperation;
    } catch (error) {
        console.error("Error checking video status:", error);
         if (error instanceof Error && (error.message.includes('RESOURCE_EXHAUSTED') || error.message.includes('429'))) {
             throw new Error("API quota exceeded. Please check your plan and billing details.");
        }
        throw new Error("Failed to check video generation status.");
    }
};

export const getTickerTrends = async (): Promise<string[]> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "List up to 30 of the most current, viral, and trending topics, keywords, or challenges on YouTube and TikTok. Use real-time search data. Your response MUST be a single JSON array of strings that can be parsed directly. Do not include markdown formatting like ```json ... ```. Ensure quotes inside strings are properly escaped.",
            config: {
                tools: [{ googleSearch: {} }],
                thinkingConfig: { thinkingBudget: 0 }
            }
        });
        const rawText = response.text.trim();
        let jsonString = rawText;
        const markdownMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (markdownMatch && markdownMatch[1]) {
            jsonString = markdownMatch[1].trim();
        }
        const jsonMatch = jsonString.match(/(\[[\s\S]*\])/);


        if (jsonMatch && jsonMatch[0]) {
            try {
                return JSON.parse(jsonMatch[0]) as string[];
            } catch (parseError) {
                 console.warn("Ticker trends JSON could not be parsed:", jsonMatch[0]);
                 return [];
            }
        }
        console.warn("Ticker trends response did not contain a valid JSON array.", rawText);
        return [];
    } catch (error) {
        if (error instanceof Error && (error.message.includes('RESOURCE_EXHAUSTED') || error.message.includes('429'))) {
            console.warn("Ticker trends skipped due to API quota limit.");
        } else {
            console.error("Error fetching ticker trends:", error);
        }
        // Return an empty array so the UI doesn't break
        return [];
    }
};

export const generateContentPrompt = async (topic: string, audience: string, style: string, elements: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `As a prompt engineering expert for AI video generators like Veo, create a detailed, single-paragraph prompt. The user wants to create a video about "${topic}".
            
            Their target audience is: "${audience}".
            The desired style is: "${style}".
            Key elements to include are: "${elements}".
            
            Combine these elements into a rich, descriptive prompt that will produce a high-quality video. Focus on visual details, camera movements, and atmosphere.`,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating prompt:", error);
        if (error instanceof Error && (error.message.includes('RESOURCE_EXHAUSTED') || error.message.includes('429'))) {
            throw new Error("API quota exceeded. Please try again later.");
        }
        throw new Error("Failed to generate prompt from Gemini API.");
    }
};

export const editImage = async (
    base64ImageData: string,
    mimeType: string,
    prompt: string
): Promise<{ image: string | null; text: string | null }> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64ImageData,
                            mimeType: mimeType,
                        },
                    },
                    {
                        text: prompt,
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        let imageResult: string | null = null;
        let textResult: string | null = null;

        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.text) {
                textResult = part.text;
            } else if (part.inlineData) {
                imageResult = part.inlineData.data;
            }
        }
        
        if (!imageResult) {
            throw new Error("The AI did not return an edited image. Please try refining your prompt.");
        }

        return { image: imageResult, text: textResult };

    } catch (error) {
        console.error("Error editing image:", error);
        if (error instanceof Error && (error.message.includes('RESOURCE_EXHAUSTED') || error.message.includes('429'))) {
            throw new Error("API quota exceeded. Please try again later.");
        }
        throw new Error("Failed to edit image using the Gemini API.");
    }
};

export const generateLogo = async (prompt: string, style: string, transparentBg: boolean): Promise<string> => {
    try {
        const backgroundInstruction = transparentBg
            ? "The logo must have a transparent background."
            : "The logo should have a solid, simple, non-distracting background.";
        const modifiedPrompt = `Generate a professional, vector-style logo for a brand described as: "${prompt}". The logo must be in a ${style} style. It should be simple, memorable, and suitable for a profile picture. ${backgroundInstruction}`;
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
        throw new Error("The AI did not return a logo.");

    } catch (error) {
        console.error("Error generating logo:", error);
        if (error instanceof Error && (error.message.includes('RESOURCE_EXHAUSTED') || error.message.includes('429'))) {
            throw new Error("API quota exceeded. Please try again later.");
        }
        throw new Error("Failed to generate a logo using the Gemini API.");
    }
};

export const generateTranscriptFromPrompt = async (videoPrompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `You are a scriptwriter. Based on the following description for a video, generate a concise and descriptive voiceover transcript. The transcript should narrate the scenes described in the prompt as if it were a documentary or explainer video.
            
            Video Prompt: "${videoPrompt}"
            
            Generate the transcript as a single block of formatted text.`,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating transcript:", error);
        if (error instanceof Error && (error.message.includes('RESOURCE_EXHAUSTED') || error.message.includes('429'))) {
            throw new Error("API quota exceeded. Please try again later.");
        }
        throw new Error("Failed to generate transcript from Gemini API.");
    }
};

export const getChannelAnalytics = async (channelUrl: string, platform: 'YouTube' | 'TikTok'): Promise<ChannelAnalyticsData> => {
    let prompt: string;
    if (platform === 'YouTube') {
         prompt = `Act as a YouTube analytics expert. Use Google Search to find the latest live data for the YouTube channel at this URL: ${channelUrl}. 
            Your response MUST be a single JSON object string that can be parsed directly. Do not include markdown formatting like \`\`\`json ... \`\`\`. 
            The JSON object must have these exact keys and value types: 
            - "channelName": string (The name of the channel)
            - "followerCount": string (e.g., "1.23M")
            - "followerTrend": "up" | "down" | "stable"
            - "totalViews": string (e.g., "45.6M")
            - "viewsTrend": "up" | "down" | "stable"
            - "aiSummary": string (A brief, one-paragraph summary of the channel's recent performance and content focus)
            - "recentVideos": Array<{ "title": string, "videoUrl": string, "viewCount": string }> (Find the 3 most recent videos with their full URL and formatted view count)
            `;
    } else { // TikTok
        prompt = `Act as a TikTok analytics expert. Use Google Search to find the latest live data for the TikTok channel at this URL: ${channelUrl}. 
            Your response MUST be a single JSON object string that can be parsed directly. Do not include markdown formatting like \`\`\`json ... \`\`\`. 
            The JSON object must have these exact keys and value types: 
            - "channelName": string (The name of the channel)
            - "followerCount": string (e.g., "1.23M")
            - "followerTrend": "up" | "down" | "stable"
            - "totalViews": string (e.g., "45.6M")
            - "viewsTrend": "up" | "down" | "stable"
            - "totalLikes": string (e.g., "10.2M")
            - "aiSummary": string (A brief, one-paragraph summary of the channel's recent performance and content focus)
            `;
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            }
        });
        const rawText = response.text.trim();
        const jsonMatch = rawText.match(/{[\s\S]*}/);

        if (jsonMatch && jsonMatch[0]) {
            const jsonText = jsonMatch[0];
            const parsedData = JSON.parse(jsonText);
            // Add platform to the response object
            return { ...parsedData, platform } as ChannelAnalyticsData;
        } else {
             throw new Error("The API response did not contain valid JSON data for analytics.");
        }
    } catch (error) {
        console.error("Error fetching channel analytics:", error);
        if (error instanceof Error && (error.message.includes('RESOURCE_EXHAUSTED') || error.message.includes('429'))) {
            throw new Error("API quota exceeded. Please try again later.");
        }
        throw new Error(`Failed to fetch channel analytics from Gemini API for ${platform}. The channel might be new or private.`);
    }
};

export const getChannelSnapshots = async (channels: Channel[]): Promise<{ id: string; followerCount: string; totalViews: string; followerTrend: 'up' | 'down' | 'stable'; viewsTrend: 'up' | 'down' | 'stable'; weeklyViewGrowth: string; }[]> => {
    if (channels.length === 0) return [];
    
    const channelList = channels.map(c => `- ID: ${c.id}, Platform: ${c.platform}, URL: ${c.url}`).join('\n');

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Using Google Search, find the latest public data for the following list of channels:\n${channelList}\n\nYour response MUST be a single JSON array of objects that can be parsed directly. Do not include markdown formatting. Each object in the array must have these exact keys: "id" (use the ID from the input list), "followerCount" (e.g., "1.23M"), "followerTrend" ('up', 'down', or 'stable'), "totalViews" (e.g., "45.6M"), "viewsTrend" ('up', 'down', or 'stable'), and "weeklyViewGrowth" (a string representing the percentage change in views over the last 7 days, e.g., "+5.2%", "-1.1%", or "+0.0%"). If a channel cannot be found, omit it from the array.`,
            config: {
                tools: [{ googleSearch: {} }],
            }
        });
        const rawText = response.text.trim();
        const jsonMatch = rawText.match(/\[[\s\S]*\]/);
        if (jsonMatch && jsonMatch[0]) {
            return JSON.parse(jsonMatch[0]);
        }
        console.warn("Could not parse channel snapshots from response:", rawText);
        return [];
    } catch (error) {
        console.error("Error fetching channel snapshots:", error);
        return [];
    }
};


export const generateChannelGrowthPlan = async (channelUrl: string, platform: 'YouTube' | 'TikTok'): Promise<ChannelGrowthPlan> => {
    const platformSpecificPrompt = platform === 'TikTok' 
        ? `Act as a world-class TikTok growth consultant. Use Google Search to perform a comprehensive analysis of the TikTok channel at this URL: ${channelUrl}. Based on your findings, generate a detailed and actionable growth plan. Your response MUST be a single JSON object string that can be parsed directly. Do not include markdown formatting like \`\`\`json ... \`\`\`. The JSON object must have these exact keys: 'contentStrategy', 'seoAndDiscoverability', 'audienceEngagement', and 'thumbnailCritique'. For 'seoAndDiscoverability' on TikTok, focus on hashtag strategy, trending sounds, and profile optimization. For 'thumbnailCritique', analyze the first frame/cover image of recent videos. Each key should map to an object containing two properties: an 'analysis' (a paragraph summarizing your findings for that category) and 'recommendations' (an array of 3-5 specific, actionable string suggestions for improvement).`
        : `Act as a world-class YouTube growth consultant. Use Google Search to perform a comprehensive analysis of the YouTube channel at this URL: ${channelUrl}. Based on your findings, generate a detailed and actionable growth plan. Your response MUST be a single JSON object string that can be parsed directly. Do not include markdown formatting like \`\`\`json ... \`\`\`. The JSON object must have these exact keys: 'contentStrategy', 'seoAndDiscoverability', 'audienceEngagement', and 'thumbnailCritique'. Each key should map to an object containing two properties: an 'analysis' (a paragraph summarizing your findings for that category) and 'recommendations' (an array of 3-5 specific, actionable string suggestions for improvement).`;
        
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: platformSpecificPrompt,
            config: {
                tools: [{ googleSearch: {} }],
            }
        });
        const rawText = response.text.trim();
        const jsonMatch = rawText.match(/{[\s\S]*}/);

        if (jsonMatch && jsonMatch[0]) {
            const jsonText = jsonMatch[0];
            return JSON.parse(jsonText) as ChannelGrowthPlan;
        } else {
             throw new Error("The API response did not contain valid JSON data for the growth plan.");
        }
    } catch (error) {
        console.error("Error generating channel growth plan:", error);
        if (error instanceof Error && (error.message.includes('RESOURCE_EXHAUSTED') || error.message.includes('429'))) {
            throw new Error("API quota exceeded. Please try again later.");
        }
         if (error instanceof Error && error.message.includes("The API response did not contain valid JSON")) {
            throw error;
        }
        throw new Error(`Failed to generate channel growth plan from Gemini API for ${platform}. The channel might be new, private, or could not be analyzed.`);
    }
};

export const generateChannelOpportunities = async (channelUrl: string, platform: 'YouTube' | 'TikTok'): Promise<string[]> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `As a social media growth expert, analyze the ${platform} channel at this URL: ${channelUrl}. Based on public data, identify 3 key, actionable growth opportunities. Focus on content gaps, untapped audiences, collaboration ideas, or titling/thumbnail strategies. Your response MUST be a single JSON array of strings that can be parsed directly. Do not include markdown formatting.`,
            config: {
                tools: [{ googleSearch: {} }],
            }
        });
        const rawText = response.text.trim();
        const jsonMatch = rawText.match(/\[[\s\S]*\]/);
        if (jsonMatch && jsonMatch[0]) {
            return JSON.parse(jsonMatch[0]);
        }
        console.warn("Could not parse opportunities from response:", rawText);
        return [];
    } catch (error) {
        console.error("Error generating channel opportunities:", error);
        return [];
    }
};

export const generateDashboardTip = async (channels: Channel[]): Promise<string> => {
    const channelInfo = channels.map(c => `${c.platform} channel at ${c.url}`).join(' and ');
    if (channels.length === 0) {
        return "Connect your YouTube or TikTok channel in your profile to get personalized tips!";
    }
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `As a YouTube growth expert, analyze the creator's channels: ${channelInfo}. Give one specific, actionable, and creative tip for their content strategy today. The tip should be short (1-2 sentences). Use real-time search for current trends if relevant.`,
            config: {
                tools: [{ googleSearch: {} }],
                thinkingConfig: { thinkingBudget: 0 }
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error generating dashboard tip:", error);
        return "Could not load a tip right now. Try refreshing!";
    }
};

export const findSponsorshipOpportunities = async (channelUrl: string, platform: 'YouTube' | 'TikTok'): Promise<SponsorshipOpportunity[]> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `As a sponsorship expert, analyze the ${platform} channel at this URL: ${channelUrl}. Based on its content, audience, and brand safety, identify 5 potential brand sponsors. For each brand, explain its relevance. Your response MUST be a single JSON array of objects that can be parsed directly. Do not include markdown formatting. Each object must have these keys: "brandName", "industry", "relevance", and "sponsorMatchScore". The sponsorMatchScore should be a string representing a rating out of 100 (e.g., "95/100"). Calculate this score by holistically analyzing the alignment between the brand's target market and the channel's content niche, audience demographics (if inferable), overall tone, and brand safety. A high score (90+) indicates a near-perfect alignment. A medium score (70-89) is a good fit. A lower score indicates a potential mismatch.`,
            config: {
                tools: [{ googleSearch: {} }],
            }
        });
        const rawText = response.text.trim();
        const jsonMatch = rawText.match(/\[[\s\S]*\]/);
        if (jsonMatch && jsonMatch[0]) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error("Could not parse sponsorship opportunities from the API response.");
    } catch (error) {
        console.error("Error finding sponsorship opportunities:", error);
        throw new Error("Failed to find sponsorship opportunities from Gemini API.");
    }
};

export const generateBrandPitch = async (channelName: string, platform: 'YouTube' | 'TikTok', brandName: string, industry: string): Promise<BrandPitch> => {
     try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Generate a professional and concise sponsorship pitch email.
            My Channel Name: "${channelName}" on ${platform}.
            Brand I'm pitching: "${brandName}" (Industry: ${industry}).
            
            The email should be enthusiastic, highlight my channel's value proposition for their brand, mention my audience alignment, and end with a clear call to action (e.g., scheduling a call).
            
            Your response MUST be a single JSON object that can be parsed directly. Do not include markdown formatting. The object must have these keys: "subject" and "body". The body should be a single string with newline characters (\\n) for paragraph breaks.`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        subject: { type: Type.STRING },
                        body: { type: Type.STRING },
                    },
                },
            },
        });
        const rawText = response.text.trim();
        const jsonMatch = rawText.match(/{[\s\S]*}/);
        if (jsonMatch && jsonMatch[0]) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error("Could not parse the brand pitch from the API response.");
    } catch (error) {
        console.error("Error generating brand pitch:", error);
        throw new Error("Failed to generate brand pitch from Gemini API.");
    }
};

export const analyzeVideoUrl = async (videoUrl: string): Promise<VideoAnalysis> => {
    const prompt = `Act as a world-class YouTube and TikTok content strategist. Analyze the video at this URL: ${videoUrl}. 
    Provide a comprehensive analysis covering the video's content, structure, and potential engagement.
    Your response MUST be a single JSON object string that can be parsed directly. Do not include markdown formatting like \`\`\`json ... \`\`\`.
    The JSON object must have these exact keys:
    - "title": The title of the video.
    - "aiSummary": A concise, one-paragraph summary of the video's content and purpose.
    - "engagementAnalysis": A brief analysis of the video's likely engagement signals (e.g., comment sentiment, like-to-view ratio, shareability).
    - "contentAnalysis": A critique of the content itself, focusing on the hook, pacing, structure, and call-to-action.
    - "improvementSuggestions": An array of 3-5 specific, actionable suggestions for how the creator could improve this video or future videos on the same topic.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            }
        });
        const rawText = response.text.trim();
        const jsonMatch = rawText.match(/{[\s\S]*}/);

        if (jsonMatch && jsonMatch[0]) {
            return JSON.parse(jsonMatch[0]) as VideoAnalysis;
        } else {
            throw new Error("The API response did not contain valid JSON data for the video analysis.");
        }
    } catch (error) {
        console.error("Error analyzing video URL:", error);
        if (error instanceof Error && (error.message.includes('RESOURCE_EXHAUSTED') || error.message.includes('429'))) {
            throw new Error("API quota exceeded. Please try again later.");
        }
        throw new Error(`Failed to analyze the video. The URL might be invalid, private, or the AI could not access it.`);
    }
};

export const repurposeVideoContent = async (videoUrl: string): Promise<RepurposedContent> => {
    const prompt = `Act as an expert content repurposing strategist. Analyze the video at this URL: ${videoUrl}. 
    Based on its content, generate the following:
    1. A well-structured, SEO-friendly blog post with a title, introduction, main body with headings, and conclusion.
    2. An engaging tweet thread (as an array of strings, each tweet max 280 chars) summarizing the key points.
    3. A professional LinkedIn post highlighting the video's value for a professional audience.
    
    Your response MUST be a single JSON object string that can be parsed directly. Do not include markdown formatting.
    The JSON object must have these exact keys:
    - "blogPost": A single string containing the full blog post with markdown formatting (e.g., "## Heading").
    - "tweetThread": An array of strings, where each string is a single tweet.
    - "linkedInPost": A single string for the LinkedIn post.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            }
        });
        const rawText = response.text.trim();
        const jsonMatch = rawText.match(/{[\s\S]*}/);

        if (jsonMatch && jsonMatch[0]) {
            return JSON.parse(jsonMatch[0]) as RepurposedContent;
        } else {
            throw new Error("The API response did not contain valid JSON data for repurposing.");
        }
    } catch (error) {
        console.error("Error repurposing video content:", error);
        if (error instanceof Error && (error.message.includes('RESOURCE_EXHAUSTED') || error.message.includes('429'))) {
            throw new Error("API quota exceeded. Please try again later.");
        }
        throw new Error(`Failed to repurpose the video. The URL might be invalid, private, or the AI could not access it.`);
    }
};
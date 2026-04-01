import { GoogleGenAI, Type, Modality, Part, VideoGenerationReferenceImage, VideoGenerationReferenceType, GenerateContentResponse } from "@google/genai";
import { 
    TrendingChannel, TrendingTopic, ContentIdea, MonetizationStrategy, FullReport, KeywordAnalysis, 
    ChannelAnalyticsData, ChannelGrowthPlan, SponsorshipOpportunity, BrandPitch, VideoAnalysis, RepurposedContent, ThumbnailIdea, Channel, AvatarProfile, Agent as AgentType, AgentSettings, ChatMessage as AppChatMessage, Platform
} from '../types';
import { avatarStyles, genders, shotTypes, hairStyles, eyeColors, facialHairOptions, glassesOptions } from '../data/avatarOptions';

// Helper to get the correct API key
export const getApiKey = () => {
    // 1. Check for user-provided key in localStorage (for BYOK on custom domains)
    const userKey = typeof window !== 'undefined' ? localStorage.getItem('user_gemini_api_key') : null;
    if (userKey) return userKey;

    // 2. For Veo/Paid models in AI Studio, process.env.API_KEY is used after selection
    // 3. For free/standard models, process.env.GEMINI_API_KEY is used
    return (process.env as any).API_KEY || (process.env as any).GEMINI_API_KEY;
};

const parseJsonResponse = <T>(text: string | undefined | null, fallback: T): T => {
    try {
        if (!text) {
             console.warn("No content found in response text, returning fallback.");
             return fallback;
        }
        
        const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        const jsonStr = match ? match[1] : text.trim();

        if (!jsonStr) {
             console.warn("No content found in response text, returning fallback.");
             return fallback;
        }
        
        return JSON.parse(jsonStr);
    } catch (e) {
        console.error("Failed to parse JSON response:", e, "Response text:", text);
        return fallback;
    }
};

export async function getRealtimeTrends(plan: string, country: string): Promise<{ channels: TrendingChannel[], topics: TrendingTopic[] }> {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const platforms = 'YouTube, TikTok, Instagram, Facebook, Twitch, LinkedIn, X, Pinterest, Snapchat, Reddit, and Threads';
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Get the top 4 trending channels and topics across ${platforms} in ${country}. The user is on the ${plan} plan. Free plan users see less.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    channels: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                platform: { type: Type.STRING },
                                channel_url: { type: Type.STRING }
                            },
                            required: ["name", "platform", "channel_url"],
                        }
                    },
                    topics: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                platform: { type: Type.STRING },
                                description: { type: Type.STRING }
                            },
                            required: ["name", "platform", "description"],
                        }
                    }
                }
            }
        }
    });
    return parseJsonResponse(response.text, { channels: [], topics: [] });
}

export async function getTrendingContent(contentType: string, plan: string, country: string, category: string, platform: Platform): Promise<any[]> {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const videoSchema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, channelName: { type: Type.STRING }, videoUrl: { type: Type.STRING }, thumbnailUrl: { type: Type.STRING }, viewCount: { type: Type.STRING }, publishedTime: { type: Type.STRING }, }, required: ["title", "channelName", "videoUrl", "thumbnailUrl", "viewCount", "publishedTime"] } };
    const musicSchema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { trackTitle: { type: Type.STRING }, artistName: { type: Type.STRING }, videosUsingSound: { type: Type.STRING }, reason: { type: Type.STRING }, }, required: ["trackTitle", "artistName", "videosUsingSound", "reason"] } };
    const creatorSchema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, category: { type: Type.STRING }, subscriberCount: { type: Type.STRING }, channelUrl: { type: Type.STRING }, reason: { type: Type.STRING }, }, required: ["name", "category", "subscriberCount", "channelUrl", "reason"] } };
    const topicSchema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, platform: { type: Type.STRING }, description: { type: Type.STRING } }, required: ["name", "platform", "description"], } };
    let schema;
    switch (contentType) {
        case 'videos': schema = videoSchema; break;
        case 'music': schema = musicSchema; break;
        case 'creators': schema = creatorSchema; break;
        case 'topics': schema = topicSchema; break;
        default: schema = { type: Type.ARRAY, items: { type: Type.OBJECT } };
    }
    
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `List the top 8 trending ${contentType} on ${platform} for the ${category} category in ${country}. User is on ${plan} plan.`,
        config: { responseMimeType: 'application/json', responseSchema: schema }
    });
    return parseJsonResponse(response.text, []);
}

export async function findTrends(term: string, platform: Platform | 'All', country: string, category: string): Promise<any> {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const platforms = 'YouTube, TikTok, Instagram, Facebook, Twitch, LinkedIn, X, Pinterest, Snapchat, Reddit, and Threads';
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze and summarize the current trends for "${term}" on ${platform === 'All' ? platforms : platform} in ${country} for the ${category} category. Provide content ideas and relevant insights.`,
        config: { tools: [{ googleSearch: {} }] }
    });
    return response; // Return the full response object to access grounding metadata
}

export async function generateContentIdeas(topic: string, platform: Platform | 'All', plan: string): Promise<ContentIdea[]> {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate 3 viral content ideas for a ${platform === 'All' ? 'multi-platform' : platform} creator on the topic of "${topic}". The user is on the ${plan} plan. For each idea, provide a catchy title, a strong hook, a 3-5 step script outline, relevant hashtags, and a virality potential score out of 10 with a short reasoning.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        hook: { type: Type.STRING },
                        script_outline: { type: Type.ARRAY, items: { type: Type.STRING } },
                        hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
                        virality_potential: {
                            type: Type.OBJECT,
                            properties: { score: { type: Type.INTEGER }, reasoning: { type: Type.STRING } },
                            required: ['score', 'reasoning']
                        }
                    },
                    required: ['title', 'hook', 'script_outline', 'hashtags', 'virality_potential']
                }
            }
        }
    });
    return parseJsonResponse(response.text, []);
}

export async function generateVideoScript(idea: ContentIdea): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview', // Using Pro for higher quality scripts
        contents: `Write a full video script based on this idea:\nTitle: ${idea.title}\nHook: ${idea.hook}\nOutline: ${idea.script_outline.join(', ')}. The script should be engaging and production-ready, including visual cues and camera directions. Make it sound natural for a person to speak.`,
    });
    return response.text || '';
}

export async function getMonetizationStrategies(platform: Platform, followers: number): Promise<MonetizationStrategy[]> {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `List 3-4 relevant monetization strategies for a ${platform} creator with ${followers} followers. For each strategy, provide a description, requirements, and earning potential.`,
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
                    },
                    required: ['strategy', 'description', 'requirements', 'potential']
                }
            }
        }
    });
    return parseJsonResponse(response.text, []);
}

export async function generateFullReport(topic: string, followers: number, platform: string = 'All'): Promise<FullReport> {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview', // Pro for better quality reports
        contents: `Create a comprehensive content strategy report for the topic "${topic}" on ${platform} for a creator with ${followers} followers. Include a detailed trend analysis, 5 creative content ideas (with hook, outline, hashtags, and virality score), and 3 relevant monetization strategies with actionable steps.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    trendAnalysis: { type: Type.STRING },
                    contentIdeas: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING }, hook: { type: Type.STRING }, script_outline: { type: Type.ARRAY, items: { type: Type.STRING } }, hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
                                virality_potential: { type: Type.OBJECT, properties: { score: { type: Type.INTEGER }, reasoning: { type: Type.STRING } }, required: ['score', 'reasoning'] }
                            },
                            required: ['title', 'hook', 'script_outline', 'hashtags', 'virality_potential']
                        }
                    },
                    monetizationStrategies: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: { strategy: { type: Type.STRING }, description: { type: Type.STRING }, requirements: { type: Type.STRING }, potential: { type: Type.STRING } },
                            required: ['strategy', 'description', 'requirements', 'potential']
                        }
                    }
                },
                required: ['trendAnalysis', 'contentIdeas', 'monetizationStrategies']
            }
        }
    });
    return parseJsonResponse(response.text, { trendAnalysis: '', contentIdeas: [], monetizationStrategies: [] });
}

export async function generateVideo(
    model: 'veo-3.1-fast-generate-preview' | 'veo-3.1-generate-preview',
    prompt: string, 
    referenceImages?: { imageBytes: string, mimeType: string }[]
): Promise<any> {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    
    if (referenceImages && referenceImages.length > 0) {
        const referenceImagesPayload: VideoGenerationReferenceImage[] = referenceImages.map(img => ({
            image: { imageBytes: img.imageBytes, mimeType: img.mimeType },
            referenceType: VideoGenerationReferenceType.ASSET,
        }));
        
        return await ai.models.generateVideos({
            model: 'veo-3.1-generate-preview', // This model is required for multi-reference
            prompt,
            config: {
                numberOfVideos: 1,
                referenceImages: referenceImagesPayload,
                resolution: '720p',
                aspectRatio: '16:9'
            }
        });
    }

    // Single image or no image
    return await ai.models.generateVideos({
        model,
        prompt,
        image: referenceImages?.[0],
        config: { numberOfVideos: 1 }
    });
}


export async function extendVideo(prompt: string, previousVideo: any, aspectRatio: string): Promise<any> {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    return await ai.models.generateVideos({
        model: 'veo-3.1-generate-preview',
        prompt,
        video: previousVideo,
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: aspectRatio as "16:9" | "9:16",
        }
    });
}

export async function generateAnimation(prompt: string, style: string, aspectRatio: string, resolution: string): Promise<any> {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const fullPrompt = `An animated video in a ${style} style showing: ${prompt}`;
    return await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: fullPrompt,
        config: { 
            numberOfVideos: 1,
            aspectRatio: aspectRatio as "16:9" | "9:16",
            resolution: resolution as "1080p" | "720p",
        }
    });
}

export async function generateGif(prompt: string): Promise<any> {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const fullPrompt = `A short, seamlessly looping GIF of: ${prompt}`;
     return await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: fullPrompt,
        config: { numberOfVideos: 1 }
    });
}

export async function editVideo(prompt: string, image: { imageBytes: string, mimeType: string }): Promise<any> {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    return await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt,
        image,
        config: { numberOfVideos: 1 }
    });
}

export async function checkVideoStatus(operation: any): Promise<any> {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    return await ai.operations.getVideosOperation({ operation });
}

export async function generateTranscriptFromPrompt(prompt: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Based on this video prompt: "${prompt}", write a concise and engaging voiceover script/transcript. It should be written in a natural, spoken style.`,
    });
    return response.text || '';
}

export async function getTickerTrends(): Promise<string[]> {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "List 10 current, very specific and interesting trending topics on social media (YouTube, TikTok, X). Output as a simple JSON array of strings.",
        config: { 
            responseMimeType: "application/json",
            responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
    });
    return parseJsonResponse(response.text, []);
}

export async function getChannelSnapshots(channels: Channel[]): Promise<any[]> {
    if (channels.length === 0) return [];
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `For the following channels, provide an estimated follower count, total views, a 7-day view growth percentage, and a follower/view trend ('up', 'down', 'stable'). Use Google Search. Channels: ${JSON.stringify(channels.map(c => ({ id: c.id, url: c.url, platform: c.platform })))}. Your response must be a valid JSON array of objects, where each object corresponds to a channel and has the following keys: 'id', 'followerCount', 'totalViews', 'weeklyViewGrowth', 'followerTrend', 'viewsTrend'.`,
        config: { tools: [{ googleSearch: {} }] }
    });
    return parseJsonResponse(response.text, []);
}

export async function generateContentPrompt(topic: string, audience: string, style: string, elements: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Create an optimized, detailed prompt for an AI video generator. Topic: ${topic}. Audience: ${audience}. Style: ${style}. Key Elements: ${elements}.`,
    });
    return response.text || '';
}

export async function editImage(base64ImageData: string, mimeType: string, prompt: string): Promise<{ image: string | null }> {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [ { inlineData: { data: base64ImageData, mimeType: mimeType } }, { text: prompt } ] },
        config: { responseModalities: [Modality.IMAGE] },
    });
    const parts = response.candidates?.[0]?.content?.parts;
    const image = parts?.find(p => p.inlineData)?.inlineData?.data || null;
    return { image };
}

export async function getKeywordAnalysis(keyword: string, platform: string = 'All'): Promise<KeywordAnalysis> {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze the keyword "${keyword}" for a content creator on ${platform}. Provide search volume and competition ('Very High', 'High', 'Medium', 'Low', 'Very Low'), 5 related long-tail keywords, and 3 content ideas.`,
        config: { 
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    searchVolume: { type: Type.STRING, enum: ['Very High', 'High', 'Medium', 'Low', 'Very Low'] },
                    competition: { type: Type.STRING, enum: ['Very High', 'High', 'Medium', 'Low', 'Very Low'] },
                    relatedKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                    contentIdeas: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['searchVolume', 'competition', 'relatedKeywords', 'contentIdeas']
            }
        }
    });
    return parseJsonResponse(response.text, { searchVolume: 'Medium', competition: 'Medium', relatedKeywords: [], contentIdeas: [] });
}

export async function getChannelAnalytics(channelUrl: string, platform: Platform): Promise<ChannelAnalyticsData> {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze the ${platform} channel at ${channelUrl}. Provide channel name, platform, follower count, total views, total likes, follower trend ('up'/'down'/'stable'), views trend, an AI summary of the channel's content, and list the 3 most recent videos with title, view count, and URL. Use Google Search. Your response must be a single valid JSON object with keys: 'channelName', 'platform', 'followerCount', 'totalViews', 'totalLikes', 'followerTrend', 'viewsTrend', 'aiSummary', 'recentVideos'.`,
        config: { tools: [{ googleSearch: {} }] }
    });
    return parseJsonResponse(response.text, { channelName: 'N/A', platform: 'YouTube', followerCount: 'N/A', totalViews: 'N/A', totalLikes: 'N/A', followerTrend: 'stable', viewsTrend: 'stable', aiSummary: 'Analysis failed. Please try again.', recentVideos: [] } as ChannelAnalyticsData);
}

export async function generateChannelOpportunities(channelUrl: string, platform: Platform): Promise<string[]> {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Based on the ${platform} channel at ${channelUrl}, provide 3 specific, actionable growth opportunities. Your response must be a valid JSON array of strings.`,
        config: { tools: [{ googleSearch: {} }] }
    });
    return parseJsonResponse(response.text, []);
}

export async function generateDashboardTip(channels: Channel[]): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const channelInfo = channels.length > 0 ? `The user's channels are: ${JSON.stringify(channels.map(c => c.url))}` : "The user has not connected any channels yet.";
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate one unique, actionable tip of the day for a content creator. ${channelInfo}. The tip should be creative and insightful.`,
    });
    return response.text || '';
}

export async function generateChannelGrowthPlan(channelUrl: string, platform: Platform): Promise<ChannelGrowthPlan> {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview', // Pro for better analysis
        contents: `Create a detailed channel growth plan for the ${platform} channel at ${channelUrl}. Analyze and provide recommendations for: Content Strategy, SEO & Discoverability, Audience Engagement, and Thumbnail Critique. For each section, provide an 'analysis' text and a 'recommendations' array of strings. Your response must be a valid JSON object.`,
        config: { tools: [{ googleSearch: {} }] }
    });
    return parseJsonResponse(response.text, { contentStrategy: { analysis: 'Analysis failed. Please try again.', recommendations: [] }, seoAndDiscoverability: { analysis: 'Analysis failed. Please try again.', recommendations: [] }, audienceEngagement: { analysis: 'Analysis failed. Please try again.', recommendations: [] }, thumbnailCritique: { analysis: 'Analysis failed. Please try again.', recommendations: [] } } as ChannelGrowthPlan);
}

export async function findSponsorshipOpportunities(channelUrl: string, platform: Platform): Promise<SponsorshipOpportunity[]> {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Based on the content of the ${platform} channel at ${channelUrl}, find 5 potential brand sponsors. For each, provide brand name, industry, a brief explanation of relevance, and a sponsor match score out of 100. Your response must be a valid JSON array of objects.`,
        config: { tools: [{ googleSearch: {} }] }
    });
    return parseJsonResponse(response.text, []);
}

export async function generateBrandPitch(channelName: string, platform: Platform, brandName: string, industry: string): Promise<BrandPitch> {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate a professional sponsorship pitch email from the creator of the ${platform} channel "${channelName}" to the brand "${brandName}" in the ${industry} industry. Provide a 'subject' and a 'body'.`,
        config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { subject: { type: Type.STRING }, body: { type: Type.STRING } } } }
    });
    return parseJsonResponse(response.text, { subject: '', body: '' });
}

export async function analyzeVideoUrl(url: string): Promise<VideoAnalysis> {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze the video at this URL: ${url}. Provide the video title, an AI summary, a content analysis (what makes it good/bad), an engagement analysis (why people are reacting), and an array of 3-4 specific improvement suggestions. Your response must be a valid JSON object.`,
        config: { tools: [{ googleSearch: {} }] }
    });
    return parseJsonResponse(response.text, { title: 'Analysis Failed', aiSummary: 'Could not analyze the video. Please check the URL and try again.', contentAnalysis: 'N/A', engagementAnalysis: 'N/A', improvementSuggestions: [] } as VideoAnalysis);
}

export async function repurposeVideoContent(url: string): Promise<RepurposedContent> {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Watch the video at ${url} and repurpose its content into a blog post, a tweet thread (as an array of strings), and a LinkedIn post. Your response must be a valid JSON object with keys 'blogPost', 'tweetThread', and 'linkedInPost'.`,
        config: { tools: [{ googleSearch: {} }] }
    });
    return parseJsonResponse(response.text, { blogPost: '', tweetThread: [], linkedInPost: '' });
}

export async function generateThumbnailIdeas(title: string, platform: string = 'YouTube', plan: string = 'free'): Promise<ThumbnailIdea[]> {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate 3 distinct and click-worthy thumbnail or post cover ideas for a ${platform} content titled "${title}". The user is on the ${plan} plan. For each idea provide a style, text overlay, a visual description, and a detailed prompt for an AI image generator to create it.`,
        config: { 
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: { style: { type: Type.STRING }, textOverlay: { type: Type.STRING }, visualDescription: { type: Type.STRING }, imageGenPrompt: { type: Type.STRING } },
                    required: ['style', 'textOverlay', 'visualDescription', 'imageGenPrompt']
                }
            }
        }
    });
    return parseJsonResponse(response.text, []);
}

export async function generateLogo(prompt: string, style: string, transparentBg: boolean): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const fullPrompt = `A professional logo for "${prompt}". Style: ${style}. ${transparentBg ? 'Use a transparent background.' : ''}`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: fullPrompt }] },
    });
    const parts = response.candidates?.[0]?.content?.parts;
    const part = parts?.find(p => p.inlineData);
    return part?.inlineData?.data || '';
}

export async function generateImage(prompt: string, style: string = 'Vibrant', aspectRatio: string = '16:9'): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const fullPrompt = `${prompt}. Style: ${style}.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: fullPrompt }] },
        config: { imageConfig: { aspectRatio: aspectRatio as any } }
    });
    const parts = response.candidates?.[0]?.content?.parts;
    const part = parts?.find(p => p.inlineData);
    return part?.inlineData?.data || '';
}

export async function generateAvatar(profile: AvatarProfile): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const prompt = `Generate a high-quality ${profile.avatarStyle} avatar of a ${profile.gender}. 
    Hair: ${profile.hairStyle}, ${profile.hairColor}. 
    Eyes: ${profile.eyeColor}. 
    Facial features: ${profile.facialHair}, ${profile.glasses}, ${profile.otherFacialFeatures}. 
    Clothing: ${profile.clothingTop}, ${profile.clothingBottom}, ${profile.clothingShoes}, ${profile.outerwear}. 
    Accessories: ${profile.accessoriesHat}, ${profile.accessoriesJewelry}. 
    Handheld item: ${profile.handheldItem}. 
    Extra details: ${profile.extraDetails}. 
    Background: ${profile.background}. 
    Shot type: ${profile.shotType}. 
    Personality: ${profile.personality}. 1:1 aspect ratio.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: { imageConfig: { aspectRatio: '1:1' } }
    });
    const parts = response.candidates?.[0]?.content?.parts;
    const part = parts?.find(p => p.inlineData);
    return part?.inlineData?.data || '';
}

export async function generateAvatarFromPhoto(base64ImageData: string, mimeType: string, prompt: string): Promise<string | null> {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [ { inlineData: { data: base64ImageData, mimeType: mimeType } }, { text: prompt } ] },
        config: { responseModalities: [Modality.IMAGE] },
    });
    return response.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data || null;
}

export async function generateRandomAvatarProfile(): Promise<AvatarProfile> {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate a random, interesting character profile for an AI avatar. Be creative and concise. Provide details for the following fields.
- gender: Choose from ${genders.join(', ')}.
- avatarStyle: Choose from ${avatarStyles.join(', ')}.
- hairStyle: Choose from ${hairStyles.join(', ')}.
- hairColor: A creative hair color.
- eyeColor: Choose from ${eyeColors.join(', ')}.
- facialHair: Choose from ${facialHairOptions.join(', ')}.
- glasses: Choose from ${glassesOptions.join(', ')}.
- otherFacialFeatures: A brief, interesting feature, or empty string.
- clothingTop: A top clothing item.
- clothingBottom: A bottom clothing item.
- clothingShoes: A type of shoe.
- outerwear: A type of outerwear (jacket, coat, etc.), or empty string.
- accessoriesHat: A type of hat, or empty string.
- accessoriesJewelry: A type of jewelry, or empty string.
- handheldItem: An item the avatar is holding (book, coffee, etc.), or empty string.
- extraDetails: Any other extra visual details, or empty string.
- background: A scene for the background.
- shotType: Choose from ${shotTypes.join(', ')}.
- personality: A 1-sentence personality description for conversation.
Your response must be a single, valid JSON object with exactly these keys. Do not include markdown formatting.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: { gender: { type: Type.STRING }, avatarStyle: { type: Type.STRING }, hairStyle: { type: Type.STRING }, hairColor: { type: Type.STRING }, eyeColor: { type: Type.STRING }, facialHair: { type: Type.STRING }, glasses: { type: Type.STRING }, otherFacialFeatures: { type: Type.STRING }, clothingTop: { type: Type.STRING }, clothingBottom: { type: Type.STRING }, clothingShoes: { type: Type.STRING }, outerwear: { type: Type.STRING }, accessoriesHat: { type: Type.STRING }, accessoriesJewelry: { type: Type.STRING }, handheldItem: { type: Type.STRING }, extraDetails: { type: Type.STRING }, background: { type: Type.STRING }, shotType: { type: Type.STRING }, personality: { type: Type.STRING }, },
                 required: [ "gender", "avatarStyle", "hairStyle", "hairColor", "eyeColor", "facialHair", "glasses", "otherFacialFeatures", "clothingTop", "clothingBottom", "clothingShoes", "outerwear", "accessoriesHat", "accessoriesJewelry", "handheldItem", "extraDetails", "background", "shotType", "personality" ]
            }
        }
    });
    return parseJsonResponse(response.text, { gender: genders[0], avatarStyle: avatarStyles[0], hairStyle: hairStyles[0], hairColor: 'Black', eyeColor: eyeColors[0], facialHair: facialHairOptions[0], glasses: glassesOptions[0], otherFacialFeatures: '', clothingTop: 'T-shirt', clothingBottom: 'Jeans', clothingShoes: 'Sneakers', outerwear: '', accessoriesHat: '', accessoriesJewelry: '', handheldItem: '', extraDetails: '', background: 'Simple color background', shotType: shotTypes[0], personality: 'A friendly and helpful persona.' } as AvatarProfile);
}

export async function generateCommentResponse(comment: string, tone: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate a concise, engaging, and ${tone.toLowerCase()} reply to the following user comment on a video: "${comment}". The reply should encourage further engagement. Do not include your own username or signature.`,
    });
    return response.text || '';
}

export async function sendMessageToNolo(
    history: { role: 'user' | 'model', content: string }[],
    systemInstruction?: string,
    image?: { base64: string; mimeType: string }
): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const chatHistoryForSDK = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
    }));

    const lastMessage = chatHistoryForSDK.pop();
    if (!lastMessage || lastMessage.role !== 'user') {
        throw new Error("Last message must be from user");
    }

    const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        history: chatHistoryForSDK,
        config: {
            systemInstruction: systemInstruction || `You are Nolo, an expert AI content co-pilot. Your personality is helpful, creative, and proactive. Your goal is to assist content creators. If a user's request could lead to using another tool in the app, suggest it using the format ACTION:[TOOL_NAME,"parameter"]. For example: 'That's a great topic! I can create a full strategy report for you. ACTION:[REPORT,"Keto Recipes"]'. Valid tools are: REPORT, TRENDS, IDEAS, KEYWORDS. Always be encouraging and provide actionable advice. Write your responses in a natural, spoken style, using conversational phrasing and punctuation suitable for a text-to-speech engine to read aloud.`
        }
    });
    
    const userMessageParts: Part[] = [];
    const textContent = lastMessage.parts[0].text || '';
    userMessageParts.push({ text: textContent });
    
    if (image) {
        userMessageParts.push({ inlineData: { data: image.base64, mimeType: image.mimeType } });
    }

    const result = await chat.sendMessage({ message: userMessageParts });
    return result.text || '';
}

async function youtubeSearch(query: string): Promise<string> {
    try {
        const ai = new GoogleGenAI({ apiKey: getApiKey() });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Use Google Search to find YouTube videos about "${query}". Return a summary of the top 3 results including title, channel, and a brief description. Format the response as a single, readable string.`,
            config: { tools: [{ googleSearch: {} }] },
        });
        return response.text ?? "I couldn't find any information on that topic.";
    } catch (error) {
        console.error("Error in youtubeSearch tool:", error);
        return "Sorry, I was unable to perform the search.";
    }
}

async function getComments(platform: string, limit: number = 10): Promise<string> {
    // In a real app, this would call the platform's API (e.g., YouTube Data API)
    return `Fetched the last ${limit} comments from ${platform}. 
    1. "Great video! Can you do a tutorial on X?" (ID: c1)
    2. "I disagree with the point about Y." (ID: c2)
    3. "Love the editing style here." (ID: c3)
    4. "When is the next upload?" (ID: c4)
    5. "This helped me so much, thanks!" (ID: c5)`;
}

async function respondToComment(platform: string, commentId: string, response: string): Promise<string> {
    // In a real app, this would post the reply via API
    return `Successfully posted reply to comment ${commentId} on ${platform}: "${response}"`;
}

async function publishContent(platforms: string[], content: string, mediaUrl?: string, scheduledTime?: string): Promise<string> {
    // In a real app, this would upload media and post via API
    const target = platforms.join(', ');
    const timeStr = scheduledTime ? `at ${scheduledTime}` : 'immediately';
    return `Content queued for publishing to ${target} ${timeStr}. 
    Caption: "${content}"
    ${mediaUrl ? `Media: ${mediaUrl}` : 'Text-only post'}`;
}

async function getPlatformAnalytics(platform: string, period: string = '30d'): Promise<string> {
    // In a real app, this would fetch analytics data
    return `Analytics for ${platform} (${period}):
    - Views: +15,420
    - Engagement Rate: 4.2%
    - New Followers: +840
    - Estimated Revenue: $124.50
    Trend: Upward growth in audience retention.`;
}

async function analyzeRetention(videoUrl: string): Promise<string> {
    // In a real app, this would fetch retention data for a specific video
    return `Retention Analysis for ${videoUrl}:
    - Initial Retention: 95%
    - Drop-off at 0:45 (Intro): -15% (Consider shortening the intro)
    - Engagement Spike at 2:30 (Key Tip): +10% (Great content here!)
    - Gradual Decline from 5:00 onwards.
    - Final Retention: 42%
    - Recommendation: Your intro is slightly too long. Try to get to the main point within the first 30 seconds.`;
}

async function checkCopyright(assetDescription: string): Promise<string> {
    // In a real app, this would check against a copyright database or YouTube's Content ID
    const risks = [
        "High Risk: This song is heavily protected by Content ID. Using it will likely result in a claim or strike.",
        "Moderate Risk: This clip is from a major motion picture. Ensure your use falls strictly under Fair Use (commentary/criticism).",
        "Low Risk: This asset appears to be royalty-free or under a Creative Commons license. Double-check the specific attribution requirements.",
        "Safe: No known copyright issues found for this description."
    ];
    const randomRisk = risks[Math.floor(Math.random() * risks.length)];
    return `Copyright Check for "${assetDescription}":
    - Status: ${randomRisk}
    - Advice: Always credit the original creator and consider using royalty-free libraries like the YouTube Audio Library for 100% safety.`;
}

async function generateBrandKit(channelDescription: string): Promise<string> {
    // In a real app, this would use AI to generate a brand kit
    return `Brand Kit Recommendation for: "${channelDescription}"
    - Primary Color: #6366F1 (Indigo) - Conveys trust and professionalism.
    - Secondary Color: #F43F5E (Rose) - Adds a touch of energy and passion.
    - Accent Color: #10B981 (Emerald) - Perfect for call-to-action buttons.
    - Heading Font: "Outfit" (Sans-serif) - Modern and clean.
    - Body Font: "Inter" (Sans-serif) - Highly legible for long descriptions.
    - Vibe: Modern, Energetic, and Trustworthy.`;
}

const availableTools: { [key: string]: (args: any) => Promise<string> } = {
    youtubeSearch: (args: { query: string }) => youtubeSearch(args.query),
    getComments: (args: { platform: string, limit?: number }) => getComments(args.platform, args.limit),
    respondToComment: (args: { platform: string, commentId: string, response: string }) => respondToComment(args.platform, args.commentId, args.response),
    publishContent: (args: { platforms: string[], content: string, mediaUrl?: string, scheduledTime?: string }) => publishContent(args.platforms, args.content, args.mediaUrl, args.scheduledTime),
    getPlatformAnalytics: (args: { platform: string, period?: string }) => getPlatformAnalytics(args.platform, args.period),
    analyzeRetention: (args: { videoUrl: string }) => analyzeRetention(args.videoUrl),
    checkCopyright: (args: { assetDescription: string }) => checkCopyright(args.assetDescription),
    generateBrandKit: (args: { channelDescription: string }) => generateBrandKit(args.channelDescription),
};

export async function sendMessageToAgent(agent: AgentType, history: AppChatMessage[], settings: AgentSettings): Promise<AppChatMessage[]> {
    if (history.length === 0) return [];
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const message = history[history.length - 1].content;

    const chatHistoryForSDK = history.slice(0, -1).map(msg => {
        if (msg.role === 'tool') {
            return {
                role: 'model',
                parts: [{ functionResponse: { name: msg.toolCall?.name || 'unknown_tool', response: msg.toolResult } }]
            };
        }
        return {
            role: msg.role as 'user' | 'model',
            parts: [{ text: msg.content }],
        };
    });

    const processedTools = agent.tools?.map(tool => {
        if (tool.declaration) {
            return { functionDeclarations: [tool.declaration] };
        }
        return null;
    }).filter((tool): tool is { functionDeclarations: any[] } => tool !== null);

    const chat = ai.chats.create({
        model: settings.model,
        history: chatHistoryForSDK,
        config: {
            systemInstruction: agent.systemInstruction,
            temperature: settings.temperature,
            tools: processedTools && processedTools.length > 0 ? processedTools : undefined,
        },
    });

    let result = await chat.sendMessage({ message });
    let functionCalls = result.functionCalls;
    const toolMessages: AppChatMessage[] = [];

    while (functionCalls && functionCalls.length > 0) {
        const functionResponses: Part[] = [];
        for (const functionCall of functionCalls) {
            const { name, args } = functionCall;
            if (!name) continue;

            const toolMessage: AppChatMessage = { role: 'tool', content: `Using tool: ${name}...`, toolCall: { name, args } };
            toolMessages.push(toolMessage);
            
            let toolOutputResult: any;
            if (name in availableTools) {
                toolOutputResult = await availableTools[name](args);
            } else {
                toolOutputResult = `Error: Tool "${name}" not found.`;
            }

            functionResponses.push({
                functionResponse: { name, response: { result: toolOutputResult } }
            });
            
            toolMessage.toolResult = { result: toolOutputResult };
        }

        result = await chat.sendMessage({ message: functionResponses });
        functionCalls = result.functionCalls;
    }

    const finalResponse: AppChatMessage = { role: 'model', content: result.text || '' };
    
    return [...toolMessages, finalResponse];
}

const getAI = () => new GoogleGenAI({ apiKey: getApiKey() });

export async function generateSEOMetadata(topic: string, platform: Platform = 'YouTube'): Promise<{ titles: string[], description: string, tags: string[] }> {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate SEO metadata for a ${platform} post or video about: ${topic}.
        Provide 3 optimized titles, a detailed description with keywords, and 15 relevant tags.`,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    titles: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    },
                    description: { type: Type.STRING },
                    tags: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    }
                },
                required: ['titles', 'description', 'tags']
            }
        }
    });

    return parseJsonResponse(response.text, { titles: [], description: '', tags: [] });
}

export async function generateSpeech(text: string, voiceName: string): Promise<string | null> {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName },
                },
            },
        },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
}
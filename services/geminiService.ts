import { GoogleGenAI, Type, Modality } from "@google/genai";
import { 
    TrendingChannel, TrendingTopic, TrendingVideo, TrendingCreator, TrendingMusic, 
    ContentIdea, MonetizationStrategy, FullReport, KeywordAnalysis, 
    ChannelAnalyticsData, ChannelGrowthPlan, SponsorshipOpportunity, BrandPitch, VideoAnalysis, RepurposedContent, ThumbnailIdea, Channel, AvatarProfile
} from '../types.ts';
import { avatarStyles, genders, shotTypes, hairStyles, eyeColors, facialHairOptions, glassesOptions } from '../data/avatarOptions.ts';

// FIX: Add missing youtubeSearch function to be used as a function calling tool.
export const youtubeSearch = (args: { query: string }): string => {
    console.log(`Simulating YouTube search for: "${args.query}"`);
    // This is a mock response.
    if (args.query.toLowerCase().includes('trending')) {
        return JSON.stringify([
            { title: "Top 5 Viral Challenges This Week", views: "10M" },
            { title: "New Gadget Unboxing and Review", views: "5.2M" },
            { title: "Learn to Code in 10 Minutes", views: "3.1M" }
        ]);
    }
    return JSON.stringify([
        { title: `Tutorial for ${args.query}`, views: "1.2M" },
        { title: `Best moments of ${args.query} in 2024`, views: "800k" }
    ]);
};

// FIX: Per @google/genai guidelines, the API key must be from process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Tool Definition for Function Calling ---

const parseJsonResponse = <T>(text: string | undefined | null, fallback: T): T => {
    try {
        if (!text) {
             console.warn("No content found in response text, returning fallback.");
             return fallback;
        }
        
        // FIX: Per Gemini API guidelines, when responseMimeType is "application/json",
        // the response.text is a JSON string and should not be parsed from a markdown block.
        const jsonStr = text.trim();

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
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Get the top 4 trending YouTube and TikTok channels and topics in ${country}. The user is on the ${plan} plan. Free plan users see less.`,
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
                                platform: { type: Type.STRING, enum: ['YouTube', 'TikTok'] },
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
                                platform: { type: Type.STRING, enum: ['YouTube', 'TikTok'] },
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

export async function getTrendingContent(contentType: string, plan: string, country: string, category: string, platform: 'YouTube' | 'TikTok'): Promise<any[]> {
    const videoSchema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                channelName: { type: Type.STRING },
                videoUrl: { type: Type.STRING },
                thumbnailUrl: { type: Type.STRING },
                viewCount: { type: Type.STRING },
                publishedTime: { type: Type.STRING },
            },
            required: ["title", "channelName", "videoUrl", "thumbnailUrl", "viewCount", "publishedTime"]
        }
    };

    const musicSchema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                trackTitle: { type: Type.STRING },
                artistName: { type: Type.STRING },
                videosUsingSound: { type: Type.STRING },
                reason: { type: Type.STRING },
            },
            required: ["trackTitle", "artistName", "videosUsingSound", "reason"]
        }
    };

    const creatorSchema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                category: { type: Type.STRING },
                subscriberCount: { type: Type.STRING },
                channelUrl: { type: Type.STRING },
                reason: { type: Type.STRING },
            },
            required: ["name", "category", "subscriberCount", "channelUrl", "reason"]
        }
    };
    
    const topicSchema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                platform: { type: Type.STRING, enum: ['YouTube', 'TikTok'] },
                description: { type: Type.STRING }
            },
            required: ["name", "platform", "description"],
        }
    };

    let schema;
    switch (contentType) {
        case 'videos':
            schema = videoSchema;
            break;
        case 'music':
            schema = musicSchema;
            break;
        case 'creators':
            schema = creatorSchema;
            break;
        case 'topics':
            schema = topicSchema;
            break;
        default:
            schema = { type: Type.ARRAY, items: { type: Type.OBJECT } };
    }
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `List the top 8 trending ${contentType} on ${platform} for the ${category} category in ${country}. User is on ${plan} plan.`,
        config: {
            responseMimeType: 'application/json',
            responseSchema: schema,
        }
    });
    return parseJsonResponse(response.text, []);
}

export async function findTrends(term: string, platform: 'YouTube' | 'TikTok', country: string, category: string): Promise<any> {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Analyze and summarize the current trends for "${term}" on ${platform} in ${country} for the ${category} category. Provide content ideas and relevant insights.`,
        config: {
            tools: [{ googleSearch: {} }],
        }
    });
    return response; // Return the whole response object to access grounding metadata
}

export async function generateContentIdeas(topic: string, platform: 'YouTube' | 'TikTok' | 'Both', plan: string): Promise<ContentIdea[]> {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate 3 viral content ideas for a ${platform} creator on the topic of "${topic}". The user is on the ${plan} plan. For each idea, provide a catchy title, a strong hook, a 3-5 step script outline, relevant hashtags, and a virality potential score out of 10 with a short reasoning.`,
        config: {
            responseMimeType: "application/json",
            // FIX: Added a responseSchema to ensure consistent JSON output as per Gemini guidelines.
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
                            properties: {
                                score: { type: Type.INTEGER },
                                reasoning: { type: Type.STRING }
                            },
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
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Write a full video script based on this idea:\nTitle: ${idea.title}\nHook: ${idea.hook}\nOutline: ${idea.script_outline.join(', ')}. The script should be engaging and production-ready, including visual cues.`,
    });
    return response.text;
}

export async function getMonetizationStrategies(platform: 'YouTube' | 'TikTok', followers: number): Promise<MonetizationStrategy[]> {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `List 3-4 relevant monetization strategies for a ${platform} creator with ${followers} followers. For each strategy, provide a description, requirements, and earning potential.`,
        config: {
            responseMimeType: "application/json",
            // FIX: Added a responseSchema to ensure consistent JSON output as per Gemini guidelines.
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

export async function generateFullReport(topic: string, followers: number): Promise<FullReport> {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Create a comprehensive content strategy report for the topic "${topic}" for a creator with ${followers} followers. Include a trend analysis, 5 content ideas (with hook, outline, hashtags, and virality score), and 3 relevant monetization strategies.`,
        config: {
            responseMimeType: "application/json",
            // FIX: Added a responseSchema to ensure consistent JSON output as per Gemini guidelines.
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    trendAnalysis: { type: Type.STRING },
                    contentIdeas: {
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
                                    properties: {
                                        score: { type: Type.INTEGER },
                                        reasoning: { type: Type.STRING }
                                    },
                                    required: ['score', 'reasoning']
                                }
                            },
                            required: ['title', 'hook', 'script_outline', 'hashtags', 'virality_potential']
                        }
                    },
                    monetizationStrategies: {
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
                },
                required: ['trendAnalysis', 'contentIdeas', 'monetizationStrategies']
            }
        }
    });
    return parseJsonResponse(response.text, { trendAnalysis: '', contentIdeas: [], monetizationStrategies: [] });
}

export async function generateVideo(prompt: string, image?: { imageBytes: string, mimeType: string }): Promise<any> {
    return await ai.models.generateVideos({
        model: 'veo-2.0-generate-001',
        prompt,
        image,
        config: { numberOfVideos: 1 }
    });
}

export async function generateAnimation(prompt: string, style: string): Promise<any> {
    const fullPrompt = `An animated video in a ${style} style showing: ${prompt}`;
    return await ai.models.generateVideos({
        model: 'veo-2.0-generate-001',
        prompt: fullPrompt,
        config: { numberOfVideos: 1 }
    });
}

export async function generateGif(prompt: string): Promise<any> {
    const fullPrompt = `A short, seamlessly looping GIF of: ${prompt}`;
     return await ai.models.generateVideos({
        model: 'veo-2.0-generate-001',
        prompt: fullPrompt,
        config: { numberOfVideos: 1 }
    });
}

export async function editVideo(prompt: string, image: { imageBytes: string, mimeType: string }): Promise<any> {
    return await ai.models.generateVideos({
        model: 'veo-2.0-generate-001',
        prompt: prompt,
        image: image,
        config: { numberOfVideos: 1 }
    });
}

export async function checkVideoStatus(operation: any): Promise<any> {
    return await ai.operations.getVideosOperation({ operation });
}

export async function generateTranscriptFromPrompt(prompt: string): Promise<string> {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Based on this video prompt: "${prompt}", write a concise and engaging voiceover script/transcript. It should be written in a natural, spoken style.`,
    });
    return response.text;
}

export async function getTickerTrends(): Promise<string[]> {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: "List 10 current, very specific and interesting trending topics on social media (YouTube, TikTok, X). Output as a simple JSON array of strings.",
        config: { 
            responseMimeType: "application/json",
            // FIX: Added a responseSchema to ensure consistent JSON output as per Gemini guidelines.
            responseSchema: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
            }
        }
    });
    return parseJsonResponse(response.text, []);
}

export async function getChannelSnapshots(channels: Channel[]): Promise<any[]> {
    if (channels.length === 0) return [];
    // FIX: Updated prompt to explicitly request JSON, making parsing safer despite googleSearch tool usage.
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `For the following channels, provide an estimated follower count, total views, a 7-day view growth percentage, and a follower/view trend ('up', 'down', 'stable'). Use Google Search. Channels: ${JSON.stringify(channels.map(c => ({ id: c.id, url: c.url, platform: c.platform })))}. Your response must be a valid JSON array of objects, where each object corresponds to a channel and has the following keys: 'id', 'followerCount', 'totalViews', 'weeklyViewGrowth', 'followerTrend', 'viewsTrend'.`,
        config: { tools: [{ googleSearch: {} }] }
    });
    return parseJsonResponse(response.text, []);
}

export async function generateContentPrompt(topic: string, audience: string, style: string, elements: string): Promise<string> {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Create an optimized, detailed prompt for an AI video generator. Topic: ${topic}. Audience: ${audience}. Style: ${style}. Key Elements: ${elements}.`,
    });
    return response.text;
}

export async function editImage(base64ImageData: string, mimeType: string, prompt: string): Promise<{ image: string | null, text: string | null }> {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
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

    const parts = response.candidates?.[0]?.content?.parts;
    const imagePart = parts?.find(p => p.inlineData);
    const textPart = parts?.find(p => p.text);

    const image = imagePart?.inlineData?.data || null;
    const text = textPart?.text || null;

    return { image, text };
}

export async function getKeywordAnalysis(keyword: string): Promise<KeywordAnalysis> {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Analyze the keyword "${keyword}" for a content creator. Provide search volume and competition ('Very High', 'High', 'Medium', 'Low', 'Very Low'), 5 related long-tail keywords, and 3 content ideas.`,
        config: { 
            responseMimeType: "application/json",
            // FIX: Added a responseSchema to ensure consistent JSON output as per Gemini guidelines.
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

export async function getChannelAnalytics(channelUrl: string, platform: 'YouTube' | 'TikTok'): Promise<ChannelAnalyticsData> {
    // FIX: Updated prompt to explicitly request JSON, making parsing safer despite googleSearch tool usage.
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Analyze the ${platform} channel at ${channelUrl}. Provide channel name, platform, follower count, total views, total likes, follower trend ('up'/'down'/'stable'), views trend, an AI summary of the channel's content, and list the 3 most recent videos with title, view count, and URL. Use Google Search. Your response must be a single valid JSON object with keys: 'channelName', 'platform', 'followerCount', 'totalViews', 'totalLikes', 'followerTrend', 'viewsTrend', 'aiSummary', 'recentVideos'.`,
        config: { tools: [{ googleSearch: {} }] }
    });
    return parseJsonResponse(response.text, {} as ChannelAnalyticsData);
}

export async function generateChannelOpportunities(channelUrl: string, platform: 'YouTube' | 'TikTok'): Promise<string[]> {
    // FIX: Updated prompt to explicitly request JSON, making parsing safer despite googleSearch tool usage.
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Based on the ${platform} channel at ${channelUrl}, provide 3 specific, actionable growth opportunities. Your response must be a valid JSON array of strings.`,
        config: { tools: [{ googleSearch: {} }] }
    });
    return parseJsonResponse(response.text, []);
}

export async function generateDashboardTip(channels: Channel[]): Promise<string> {
    const channelInfo = channels.length > 0 ? `The user's channels are: ${JSON.stringify(channels.map(c => c.url))}` : "The user has not connected any channels yet.";
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate one unique, actionable tip of the day for a content creator. ${channelInfo}. The tip should be creative and insightful.`,
    });
    return response.text;
}

export async function generateChannelGrowthPlan(channelUrl: string, platform: 'YouTube' | 'TikTok'): Promise<ChannelGrowthPlan> {
    // FIX: Updated prompt to explicitly request JSON, making parsing safer despite googleSearch tool usage.
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Create a detailed channel growth plan for the ${platform} channel at ${channelUrl}. Analyze and provide recommendations for: Content Strategy, SEO & Discoverability, Audience Engagement, and Thumbnail Critique. For each section, provide an 'analysis' text and a 'recommendations' array of strings. Your response must be a valid JSON object.`,
        config: { tools: [{ googleSearch: {} }] }
    });
    return parseJsonResponse(response.text, {} as ChannelGrowthPlan);
}

export async function findSponsorshipOpportunities(channelUrl: string, platform: 'YouTube' | 'TikTok'): Promise<SponsorshipOpportunity[]> {
    // FIX: Updated prompt to explicitly request JSON, making parsing safer despite googleSearch tool usage.
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Based on the content of the ${platform} channel at ${channelUrl}, find 5 potential brand sponsors. For each, provide brand name, industry, a brief explanation of relevance, and a sponsor match score out of 100. Your response must be a valid JSON array of objects.`,
        config: { tools: [{ googleSearch: {} }] }
    });
    return parseJsonResponse(response.text, []);
}

export async function generateBrandPitch(channelName: string, platform: 'YouTube' | 'TikTok', brandName: string, industry: string): Promise<BrandPitch> {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate a professional sponsorship pitch email from the creator of the ${platform} channel "${channelName}" to the brand "${brandName}" in the ${industry} industry. Provide a 'subject' and a 'body'.`,
        config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { subject: { type: Type.STRING }, body: { type: Type.STRING } } } }
    });
    return parseJsonResponse(response.text, { subject: '', body: '' });
}

export async function analyzeVideoUrl(url: string): Promise<VideoAnalysis> {
    // FIX: Updated prompt to explicitly request JSON, making parsing safer despite googleSearch tool usage.
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Analyze the video at this URL: ${url}. Provide the video title, an AI summary, a content analysis (what makes it good/bad), an engagement analysis (why people are reacting), and an array of 3-4 specific improvement suggestions. Your response must be a valid JSON object.`,
        config: { tools: [{ googleSearch: {} }] }
    });
    return parseJsonResponse(response.text, {} as VideoAnalysis);
}

export async function repurposeVideoContent(url: string): Promise<RepurposedContent> {
    // FIX: Updated prompt to explicitly request JSON, making parsing safer despite googleSearch tool usage.
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Watch the video at ${url} and repurpose its content into a blog post, a tweet thread (as an array of strings), and a LinkedIn post. Your response must be a valid JSON object with keys 'blogPost', 'tweetThread', and 'linkedInPost'.`,
        config: { tools: [{ googleSearch: {} }] }
    });
    return parseJsonResponse(response.text, { blogPost: '', tweetThread: [], linkedInPost: '' });
}

export async function generateThumbnailIdeas(title: string): Promise<ThumbnailIdea[]> {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate 3 distinct and click-worthy thumbnail ideas for a video titled "${title}". For each idea provide a style, text overlay, a visual description, and a detailed prompt for an AI image generator to create it.`,
        config: { 
            responseMimeType: "application/json",
            // FIX: Added a responseSchema to ensure consistent JSON output as per Gemini guidelines.
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        style: { type: Type.STRING },
                        textOverlay: { type: Type.STRING },
                        visualDescription: { type: Type.STRING },
                        imageGenPrompt: { type: Type.STRING }
                    },
                    required: ['style', 'textOverlay', 'visualDescription', 'imageGenPrompt']
                }
            }
        }
    });
    return parseJsonResponse(response.text, []);
}

export async function generateLogo(prompt: string, style: string, transparentBg: boolean): Promise<string> {
    const fullPrompt = `A professional logo for "${prompt}". Style: ${style}. ${transparentBg ? 'Use a transparent background.' : ''}`;
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: fullPrompt,
        config: { numberOfImages: 1, outputMimeType: 'image/png', aspectRatio: '1:1' }
    });
    return response.generatedImages[0].image.imageBytes;
}

export async function generateImage(prompt: string, style: string, aspectRatio: string): Promise<string> {
    const fullPrompt = `${prompt}. Style: ${style}.`;
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: fullPrompt,
        config: { 
            numberOfImages: 1, 
            outputMimeType: 'image/png', 
            aspectRatio: aspectRatio as "1:1" | "3:4" | "4:3" | "9:16" | "16:9"
        }
    });
    return response.generatedImages[0].image.imageBytes;
}

export async function generateAvatar(gender: string, style: string, features: string, background: string, shotType: string): Promise<string> {
    const fullPrompt = `${shotType} of a ${gender} avatar. Style: ${style}. Features: ${features}. Background: ${background}. 1:1 aspect ratio.`;
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: fullPrompt,
        config: { 
            numberOfImages: 1, 
            outputMimeType: 'image/png', 
            aspectRatio: '1:1'
        }
    });
    return response.generatedImages[0].image.imageBytes;
}

export async function generateAvatarFromPhoto(base64ImageData: string, mimeType: string, prompt: string): Promise<string | null> {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
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
    
    const parts = response.candidates?.[0]?.content?.parts;
    const imagePart = parts?.find(p => p.inlineData);
      
    if (imagePart?.inlineData?.data) {
        return imagePart.inlineData.data;
    }
      
    // Log text part for debugging if no image is returned
    const textPart = parts?.find(p => p.text);
    if (textPart?.text) {
        console.warn("AI returned text instead of image:", textPart.text);
    }
    
    return null;
}

export async function generateRandomAvatarProfile(): Promise<AvatarProfile> {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate a random, interesting character profile for an AI avatar. Be creative and concise.
        Provide details for the following fields.
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
        - accessoriesHat: A type of hat, or empty string.
        - accessoriesJewelry: A type of jewelry, or empty string.
        - extraDetails: Any other extra visual details, or empty string.
        - background: A scene for the background.
        - shotType: Choose from ${shotTypes.join(', ')}.
        - personality: A 1-sentence personality description for conversation.

        Your response must be a single, valid JSON object with exactly these keys. Do not include markdown formatting.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    gender: { type: Type.STRING },
                    avatarStyle: { type: Type.STRING },
                    hairStyle: { type: Type.STRING },
                    hairColor: { type: Type.STRING },
                    eyeColor: { type: Type.STRING },
                    facialHair: { type: Type.STRING },
                    glasses: { type: Type.STRING },
                    otherFacialFeatures: { type: Type.STRING },
                    clothingTop: { type: Type.STRING },
                    clothingBottom: { type: Type.STRING },
                    clothingShoes: { type: Type.STRING },
                    accessoriesHat: { type: Type.STRING },
                    accessoriesJewelry: { type: Type.STRING },
                    extraDetails: { type: Type.STRING },
                    background: { type: Type.STRING },
                    shotType: { type: Type.STRING },
                    personality: { type: Type.STRING },
                },
                 required: [
                    "gender", "avatarStyle", "hairStyle", "hairColor", "eyeColor", "facialHair",
                    "glasses", "otherFacialFeatures", "clothingTop", "clothingBottom", "clothingShoes",
                    "accessoriesHat", "accessoriesJewelry", "extraDetails", "background", "shotType", "personality"
                ]
            }
        }
    });
    
    return parseJsonResponse(response.text, {} as AvatarProfile);
}
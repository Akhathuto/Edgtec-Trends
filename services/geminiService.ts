import { GoogleGenAI, Type, GenerateContentResponse, Modality } from "@google/genai";
import { ContentIdea, MonetizationStrategy, FullReport, TrendingChannel, TrendingTopic, User, TrendingVideo, TrendingMusic, TrendingCreator, KeywordAnalysis, ChannelAnalyticsData } from '../types';

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
            contents: `As a social media trend expert, identify up to ${trendLimit} of the top currently trending channels and up to ${trendLimit} of the top trending topics across YouTube (including Shorts) and TikTok${countryFilter}. Leverage real-time search data. For each channel, provide the name, platform (either 'YouTube' or 'TikTok'), a brief description, its direct URL, formatted subscriber count (e.g., '1.5M'), and formatted total view count (e.g., '250M'). For each topic, provide the name, platform, and a brief description.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        trendingChannels: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING, description: "The name of the trending channel." },
                                    platform: { type: Type.STRING, description: "The platform, either 'YouTube' or 'TikTok'." },
                                    description: { type: Type.STRING, description: "A brief explanation of why the channel is trending." },
                                    channel_url: { type: Type.STRING, description: "The direct URL to the channel's main page." },
                                    subscriber_count: { type: Type.STRING, description: "The channel's subscriber count, formatted (e.g., '1.2M')." },
                                    view_count: { type: Type.STRING, description: "The channel's total view count, formatted (e.g., '250M')." }
                                }
                            }
                        },
                        trendingTopics: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING, description: "The name of the trending topic or theme." },
                                    platform: { type: Type.STRING, description: "The platform, either 'YouTube' or 'TikTok'." },
                                    description: { type: Type.STRING, description: "A brief explanation of why the topic is trending." }
                                }
                            }
                        }
                    }
                }
            }
        });
        const jsonText = response.text.trim();
        const parsed = JSON.parse(jsonText);
        return {
            channels: parsed.trendingChannels || [],
            topics: parsed.trendingTopics || []
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
  contentType: 'videos' | 'music' | 'creators',
  userPlan: User['plan'],
  country: string,
  category: string,
  platform: 'YouTube' | 'TikTok'
): Promise<TrendingVideo[] | TrendingMusic[] | TrendingCreator[]> => {
  const trendLimit = userPlan === 'free' ? 8 : 48;
  const countryFilter = country === 'Worldwide' ? 'globally' : `in ${country}`;
  const categoryFilter = category === 'All' ? '' : `in the '${category}' category`;

  let prompt = `Using real-time search data, identify the top ${trendLimit} currently trending ${platform} ${contentType} ${categoryFilter} ${countryFilter}.`;
  let responseSchema: any;

  switch (contentType) {
    case 'videos':
      prompt += ` For each video, provide its title, the full direct video URL, a valid and direct URL to its high-quality thumbnail image, channel name, formatted view count (e.g., '2.1M views'), and published time (e.g., '5 hours ago'). Ensure the thumbnailUrl is a direct link to an image file.`;
      responseSchema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            videoUrl: { type: Type.STRING },
            thumbnailUrl: { type: Type.STRING, description: "Direct URL to the video's thumbnail image." },
            channelName: { type: Type.STRING },
            viewCount: { type: Type.STRING },
            publishedTime: { type: Type.STRING },
          },
        },
      };
      break;
    case 'music':
      prompt += ` For each track, provide the track title, artist name, an estimated number of videos using the sound (formatted, e.g., '1.2M+ videos'), and a brief reason why it's trending (e.g., 'viral dance challenge').`;
      responseSchema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            trackTitle: { type: Type.STRING },
            artistName: { type: Type.STRING },
            videosUsingSound: { type: Type.STRING },
            reason: { type: Type.STRING },
          },
        },
      };
      break;
    case 'creators':
      prompt += ` This includes both top creators and breakout creators. For each creator, provide their channel name, channel URL, formatted subscriber count, main content category, and a brief reason for their current trendiness.`;
      responseSchema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            channelUrl: { type: Type.STRING },
            subscriberCount: { type: Type.STRING },
            category: { type: Type.STRING },
            reason: { type: Type.STRING },
          },
        },
      };
      break;
  }
  
  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema,
        }
    });
    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  } catch (error) {
    console.error(`Error fetching trending ${contentType}:`, error);
    if (error instanceof Error && (error.message.includes('RESOURCE_EXHAUSTED') || error.message.includes('429'))) {
        throw new Error("API quota exceeded. Please try again later.");
    }
    throw new Error(`Failed to fetch trending ${contentType} from Gemini API.`);
  }
};


export const findTrends = async (topic: string): Promise<GenerateContentResponse> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze current trends for the topic "${topic}" on YouTube, YouTube Shorts, and TikTok. Identify viral challenges, popular sounds/music, trending video formats, and key conversations. Present the findings clearly, separating YouTube, YouTube Shorts, and TikTok trends.`,
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
    const ideaCount = userPlan === 'free' ? 1 : 3;
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
            The report must include three sections:
            1.  **Trend Analysis**: Analyze current trends for "${topic}" on both YouTube and TikTok. Identify viral challenges, popular sounds/music, trending video formats, and key conversations. Present the findings clearly in a markdown-formatted string, separating YouTube and TikTok trends.
            2.  **Content Ideas**: Generate 3 viral video ideas for both YouTube and TikTok about "${topic}". For each idea, provide a catchy title, a strong hook (first 3 seconds), a brief script outline, and 5 relevant hashtags.
            3.  **Monetization Strategies**: List and explain monetization strategies suitable for a creator with this topic and follower count. For each strategy, describe it, explain the typical requirements, and estimate the earning potential.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        trendAnalysis: { type: Type.STRING, description: "Markdown formatted string analyzing trends for the topic on YouTube and TikTok." },
                        contentIdeas: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING },
                                    hook: { type: Type.STRING },
                                    script_outline: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    hashtags: { type: Type.ARRAY, items: { type: Type.STRING } }
                                }
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
                                }
                            }
                        }
                    }
                }
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as FullReport;
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
            contents: "List up to 30 of the most current, viral, and trending topics, keywords, or challenges on YouTube and TikTok. Use real-time search data for this. Return only a JSON array of strings.",
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.STRING,
                        description: "A single trending topic name."
                    }
                },
                thinkingConfig: { thinkingBudget: 0 }
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as string[];
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

export const getChannelAnalytics = async (channelUrl: string): Promise<ChannelAnalyticsData> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Act as a YouTube analytics expert. Use Google Search to find the latest live data for the YouTube channel at this URL: ${channelUrl}. 
            Your response MUST be a single JSON object string that can be parsed directly. Do not include markdown formatting like \`\`\`json ... \`\`\`. 
            The JSON object must have these exact keys and value types: 
            - "channelName": string (The name of the channel)
            - "subscriberCount": string (e.g., "1.23M")
            - "subscriberTrend": "up" | "down" | "stable"
            - "totalViews": string (e.g., "45.6M")
            - "viewsTrend": "up" | "down" | "stable"
            - "aiSummary": string (A brief, one-paragraph summary of the channel's recent performance and content focus)
            - "recentVideos": Array<{ "title": string, "videoUrl": string, "viewCount": string }> (Find the 3 most recent videos with their full URL and formatted view count)
            `,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });
        const rawText = response.text.trim();
        // The model might sometimes wrap the JSON in markdown or add extra text.
        // We'll extract the JSON object from the string for robust parsing.
        const jsonMatch = rawText.match(/{[\s\S]*}/);

        if (jsonMatch && jsonMatch[0]) {
            const jsonText = jsonMatch[0];
            return JSON.parse(jsonText) as ChannelAnalyticsData;
        } else {
             // If no JSON object is found, throw a more specific error.
             throw new Error("The API response did not contain valid JSON data for analytics.");
        }
    } catch (error) {
        console.error("Error fetching channel analytics:", error);
        if (error instanceof Error && (error.message.includes('RESOURCE_EXHAUSTED') || error.message.includes('429'))) {
            throw new Error("API quota exceeded. Please try again later.");
        }
        throw new Error("Failed to fetch channel analytics from Gemini API. The channel might be new or private.");
    }
};
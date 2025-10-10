
import { 
    TrendingChannel, TrendingTopic, ContentIdea, MonetizationStrategy, FullReport, KeywordAnalysis, 
    ChannelAnalyticsData, ChannelGrowthPlan, SponsorshipOpportunity, BrandPitch, VideoAnalysis, RepurposedContent, ThumbnailIdea, Channel, AvatarProfile, Agent as AgentType, AgentSettings, ChatMessage
} from '../types';

async function callGeminiApi<T>(action: string, params: object = {}, route: string = '/api/gemini'): Promise<T> {
  const response = await fetch(route, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action, params }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `API call failed for action: ${action}`);
  }

  return response.json();
}

export async function getRealtimeTrends(plan: string, country: string): Promise<{ channels: TrendingChannel[], topics: TrendingTopic[] }> {
    return callGeminiApi('getRealtimeTrends', { plan, country });
}

export async function getTrendingContent(contentType: string, plan: string, country: string, category: string, platform: 'YouTube' | 'TikTok'): Promise<any[]> {
    return callGeminiApi('getTrendingContent', { contentType, plan, country, category, platform });
}

export async function findTrends(term: string, platform: 'YouTube' | 'TikTok', country: string, category: string): Promise<any> {
    return callGeminiApi('findTrends', { term, platform, country, category });
}

export async function generateContentIdeas(topic: string, platform: 'YouTube' | 'TikTok' | 'Both', plan: string): Promise<ContentIdea[]> {
    return callGeminiApi('generateContentIdeas', { topic, platform, plan });
}

export async function generateVideoScript(idea: ContentIdea): Promise<string> {
    const { text } = await callGeminiApi<{ text: string }>('generateVideoScript', { idea });
    return text;
}

export async function getMonetizationStrategies(platform: 'YouTube' | 'TikTok', followers: number): Promise<MonetizationStrategy[]> {
    return callGeminiApi('getMonetizationStrategies', { platform, followers });
}

export async function generateFullReport(topic: string, followers: number): Promise<FullReport> {
    return callGeminiApi('generateFullReport', { topic, followers });
}

export async function generateVideo(prompt: string, image?: { imageBytes: string, mimeType: string }): Promise<any> {
    return callGeminiApi('generateVideo', { prompt, image });
}

export async function generateAnimation(prompt: string, style: string): Promise<any> {
    return callGeminiApi('generateAnimation', { prompt, style });
}

export async function generateGif(prompt: string): Promise<any> {
    return callGeminiApi('generateGif', { prompt });
}

export async function editVideo(prompt: string, image: { imageBytes: string, mimeType: string }): Promise<any> {
    return callGeminiApi('editVideo', { prompt, image });
}

export async function checkVideoStatus(operation: any): Promise<any> {
    return callGeminiApi('checkVideoStatus', { operation });
}

export async function generateTranscriptFromPrompt(prompt: string): Promise<string> {
    const { text } = await callGeminiApi<{ text: string }>('generateTranscriptFromPrompt', { prompt });
    return text;
}

export async function getTickerTrends(): Promise<string[]> {
    return callGeminiApi('getTickerTrends', {});
}

export async function getChannelSnapshots(channels: Channel[]): Promise<any[]> {
    return callGeminiApi('getChannelSnapshots', { channels });
}

export async function generateContentPrompt(topic: string, audience: string, style: string, elements: string): Promise<string> {
    const { text } = await callGeminiApi<{ text: string }>('generateContentPrompt', { topic, audience, style, elements });
    return text;
}

export async function editImage(base64ImageData: string, mimeType: string, prompt: string): Promise<{ image: string | null, text: string | null }> {
    return callGeminiApi('editImage', { base64ImageData, mimeType, prompt });
}

export async function getKeywordAnalysis(keyword: string): Promise<KeywordAnalysis> {
    return callGeminiApi('getKeywordAnalysis', { keyword });
}

export async function getChannelAnalytics(channelUrl: string, platform: 'YouTube' | 'TikTok'): Promise<ChannelAnalyticsData> {
    return callGeminiApi('getChannelAnalytics', { channelUrl, platform });
}

export async function generateChannelOpportunities(channelUrl: string, platform: 'YouTube' | 'TikTok'): Promise<string[]> {
    return callGeminiApi('generateChannelOpportunities', { channelUrl, platform });
}

export async function generateDashboardTip(channels: Channel[]): Promise<string> {
    const { text } = await callGeminiApi<{ text: string }>('generateDashboardTip', { channels });
    return text;
}

export async function generateChannelGrowthPlan(channelUrl: string, platform: 'YouTube' | 'TikTok'): Promise<ChannelGrowthPlan> {
    return callGeminiApi('generateChannelGrowthPlan', { channelUrl, platform });
}

export async function findSponsorshipOpportunities(channelUrl: string, platform: 'YouTube' | 'TikTok'): Promise<SponsorshipOpportunity[]> {
    return callGeminiApi('findSponsorshipOpportunities', { channelUrl, platform });
}

export async function generateBrandPitch(channelName: string, platform: 'YouTube' | 'TikTok', brandName: string, industry: string): Promise<BrandPitch> {
    return callGeminiApi('generateBrandPitch', { channelName, platform, brandName, industry });
}

export async function analyzeVideoUrl(url: string): Promise<VideoAnalysis> {
    return callGeminiApi('analyzeVideoUrl', { url });
}

export async function repurposeVideoContent(url: string): Promise<RepurposedContent> {
    return callGeminiApi('repurposeVideoContent', { url });
}

export async function generateThumbnailIdeas(title: string): Promise<ThumbnailIdea[]> {
    return callGeminiApi('generateThumbnailIdeas', { title });
}

export async function generateLogo(prompt: string, style: string, transparentBg: boolean): Promise<string> {
    return callGeminiApi('generateLogo', { prompt, style, transparentBg });
}

export async function generateImage(prompt: string, style: string, aspectRatio: string): Promise<string> {
    return callGeminiApi('generateImage', { prompt, style, aspectRatio });
}

export async function generateAvatar(gender: string, style: string, features: string, background: string, shotType: string): Promise<string> {
    return callGeminiApi('generateAvatar', { gender, style, features, background, shotType });
}

export async function generateAvatarFromPhoto(base64ImageData: string, mimeType: string, prompt: string): Promise<string | null> {
    return callGeminiApi('generateAvatarFromPhoto', { base64ImageData, mimeType, prompt });
}

export async function generateRandomAvatarProfile(): Promise<AvatarProfile> {
    return callGeminiApi('generateRandomAvatarProfile', {});
}

export async function generateCommentResponse(comment: string, tone: string): Promise<string> {
    const { text } = await callGeminiApi<{ text: string }>('generateCommentResponse', { comment, tone });
    return text;
}

export async function sendMessageToNolo(history: ChatMessage[], systemInstruction?: string): Promise<string> {
    const { text } = await callGeminiApi<{ text: string }>('sendMessageToNolo', { history, systemInstruction });
    return text;
}

export async function sendMessageToAgent(agent: AgentType, history: ChatMessage[], settings: AgentSettings): Promise<ChatMessage[]> {
    return callGeminiApi('sendMessageToAgent', { agent, history, settings }, '/api/agent-chat');
}
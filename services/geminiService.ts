import { 
    TrendingChannel, TrendingTopic, ContentIdea, MonetizationStrategy, FullReport, KeywordAnalysis, 
    ChannelAnalyticsData, ChannelGrowthPlan, SponsorshipOpportunity, BrandPitch, VideoAnalysis, RepurposedContent, ThumbnailIdea, Channel, AvatarProfile, Agent as AgentType, AgentSettings, ChatMessage as AppChatMessage
} from '../types';

async function callApi(action: string, payload: any[]) {
    const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, payload }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'An unknown API error occurred.' }));
        throw new Error(errorData.error || `API request failed with status ${response.status}`);
    }

    return response.json();
}

export function getRealtimeTrends(plan: string, country: string): Promise<{ channels: TrendingChannel[], topics: TrendingTopic[] }> {
    return callApi('getRealtimeTrends', [plan, country]);
}

export function getTrendingContent(contentType: string, plan: string, country: string, category: string, platform: 'YouTube' | 'TikTok'): Promise<any[]> {
    return callApi('getTrendingContent', [contentType, plan, country, category, platform]);
}

export function findTrends(term: string, platform: 'YouTube' | 'TikTok' | 'Both', country: string, category: string): Promise<any> {
    return callApi('findTrends', [term, platform, country, category]);
}

export function generateContentIdeas(topic: string, platform: 'YouTube' | 'TikTok' | 'Both', plan: string): Promise<ContentIdea[]> {
    return callApi('generateContentIdeas', [topic, platform, plan]);
}

export function generateVideoScript(idea: ContentIdea): Promise<string> {
    return callApi('generateVideoScript', [idea]);
}

export function getMonetizationStrategies(platform: 'YouTube' | 'TikTok', followers: number): Promise<MonetizationStrategy[]> {
    return callApi('getMonetizationStrategies', [platform, followers]);
}

export function generateFullReport(topic: string, followers: number): Promise<FullReport> {
    return callApi('generateFullReport', [topic, followers]);
}

export function generateVideo(prompt: string, image?: { imageBytes: string, mimeType: string }): Promise<any> {
    return callApi('generateVideo', [prompt, image]);
}

export function generateAnimation(prompt: string, style: string): Promise<any> {
    return callApi('generateAnimation', [prompt, style]);
}

export function generateGif(prompt: string): Promise<any> {
    return callApi('generateGif', [prompt]);
}

export function editVideo(prompt: string, image: { imageBytes: string, mimeType: string }): Promise<any> {
    return callApi('editVideo', [prompt, image]);
}

export function checkVideoStatus(operation: any): Promise<any> {
    return callApi('checkVideoStatus', [operation]);
}

export function generateTranscriptFromPrompt(prompt: string): Promise<string> {
    return callApi('generateTranscriptFromPrompt', [prompt]);
}

export function getTickerTrends(): Promise<string[]> {
    return callApi('getTickerTrends', []);
}

export function getChannelSnapshots(channels: Channel[]): Promise<any[]> {
    return callApi('getChannelSnapshots', [channels]);
}

export function generateContentPrompt(topic: string, audience: string, style: string, elements: string): Promise<string> {
    return callApi('generateContentPrompt', [topic, audience, style, elements]);
}

export function editImage(base64ImageData: string, mimeType: string, prompt: string): Promise<{ image: string | null, text: string | null }> {
    return callApi('editImage', [base64ImageData, mimeType, prompt]);
}

export function getKeywordAnalysis(keyword: string): Promise<KeywordAnalysis> {
    return callApi('getKeywordAnalysis', [keyword]);
}

export function getChannelAnalytics(channelUrl: string, platform: 'YouTube' | 'TikTok'): Promise<ChannelAnalyticsData> {
    return callApi('getChannelAnalytics', [channelUrl, platform]);
}

export function generateChannelOpportunities(channelUrl: string, platform: 'YouTube' | 'TikTok'): Promise<string[]> {
    return callApi('generateChannelOpportunities', [channelUrl, platform]);
}

export function generateDashboardTip(channels: Channel[]): Promise<string> {
    return callApi('generateDashboardTip', [channels]);
}

export function generateChannelGrowthPlan(channelUrl: string, platform: 'YouTube' | 'TikTok'): Promise<ChannelGrowthPlan> {
    return callApi('generateChannelGrowthPlan', [channelUrl, platform]);
}

export function findSponsorshipOpportunities(channelUrl: string, platform: 'YouTube' | 'TikTok'): Promise<SponsorshipOpportunity[]> {
    return callApi('findSponsorshipOpportunities', [channelUrl, platform]);
}

export function generateBrandPitch(channelName: string, platform: 'YouTube' | 'TikTok', brandName: string, industry: string): Promise<BrandPitch> {
    return callApi('generateBrandPitch', [channelName, platform, brandName, industry]);
}

export function analyzeVideoUrl(url: string): Promise<VideoAnalysis> {
    return callApi('analyzeVideoUrl', [url]);
}

export function repurposeVideoContent(url: string): Promise<RepurposedContent> {
    return callApi('repurposeVideoContent', [url]);
}

export function generateThumbnailIdeas(title: string): Promise<ThumbnailIdea[]> {
    return callApi('generateThumbnailIdeas', [title]);
}

export function generateLogo(prompt: string, style: string, transparentBg: boolean): Promise<string> {
    return callApi('generateLogo', [prompt, style, transparentBg]);
}

export function generateImage(prompt: string, style: string, aspectRatio: string): Promise<string> {
    return callApi('generateImage', [prompt, style, aspectRatio]);
}

export function generateAvatar(gender: string, style: string, features: string, background: string, shotType: string): Promise<string> {
    return callApi('generateAvatar', [gender, style, features, background, shotType]);
}

export function generateAvatarFromPhoto(base64ImageData: string, mimeType: string, prompt: string): Promise<string | null> {
    return callApi('generateAvatarFromPhoto', [base64ImageData, mimeType, prompt]);
}

export function generateRandomAvatarProfile(): Promise<AvatarProfile> {
    return callApi('generateRandomAvatarProfile', []);
}

export function generateCommentResponse(comment: string, tone: string): Promise<string> {
    return callApi('generateCommentResponse', [comment, tone]);
}

export function sendMessageToNolo(history: { role: 'user' | 'model', content: string }[], systemInstruction?: string): Promise<string> {
    return callApi('sendMessageToNolo', [history, systemInstruction]);
}

export function sendMessageToAgent(agent: AgentType, history: AppChatMessage[], settings: AgentSettings): Promise<AppChatMessage[]> {
    return callApi('sendMessageToAgent', [agent, history, settings]);
}
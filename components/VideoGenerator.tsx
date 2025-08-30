import React, { useState, useRef, useEffect } from 'react';
import { generateVideo, checkVideoStatus } from '../services/geminiService';
import Spinner from './Spinner';
import { Video, Youtube, Film, YoutubeShorts, RefreshCw, Type, Filter, Clock, Star } from './Icons';
import { useAuth } from '../contexts/AuthContext';
import { Tab } from '../types';

const loadingMessages = [
    "Kicking off the render...",
    "This can take a few minutes, please wait...",
    "Gathering pixels and crafting frames...",
    "Almost there, finalizing the video...",
    "Still working... high-quality video takes time!",
];

const videoTemplates: { name: string; prompt: string; recommendedPlatform?: 'YouTube' | 'TikTok' | 'YouTube Shorts' }[] = [
  { name: 'Select a Template...', prompt: '' },
  { name: 'Explainer Video', prompt: `// Structure:\n// 1. Hook: Start with a question or surprising fact.\n// 2. Problem: State the problem being solved.\n// 3. Solution: Explain the solution step-by-step with clear visuals.\n// 4. Call to Action: End with a clear next step for the viewer.\n\n// Your prompt:\nA simple, animated explainer video about [YOUR TOPIC] using clean graphics and on-screen text.`, recommendedPlatform: 'YouTube' },
  { name: 'Vlog Intro', prompt: `// Style: Energetic, quick cuts, upbeat music.\n// Content:\n// - Quick shot of an exciting moment from the vlog.\n// - Title card with channel name and video title.\n// - A few quick clips showing the main activities.\n\n// Your prompt:\nAn energetic vlog intro for a video about [YOUR DAY/ACTIVITY]. Include fast-paced edits and a modern, sans-serif font for titles.`, recommendedPlatform: 'YouTube' },
  { name: 'Short-form Trend', prompt: `// Trend format: Describe the viral trend format you want to replicate.\n// Audio: Mention the type of trending audio to use.\n// Text Overlay: Describe the text that should appear on screen.\n\n// Your prompt:\nA fast-paced vertical video following the [DESCRIBE TREND] trend. The video shows [YOUR ACTION/CONTENT], with bold text overlays timed to the music beats.`, recommendedPlatform: 'YouTube Shorts' },
  { name: 'TikTok POV Story', prompt: `// Format: Point-of-view (POV) style video that tells a relatable story.\n// Audio: Use a trending TikTok sound or voiceover.\n// Text: Use on-screen text to narrate the story from the user's perspective.\n\n// Your prompt:\nA vertical POV video where the text says "[YOUR POV STORY]". Use a trending emotional or funny audio.`, recommendedPlatform: 'TikTok' },
  { name: 'Product Demo', prompt: `// Goal: Showcase the product's key features and benefits in a visually appealing way.\n// Structure:\n// 1. Beauty shot of the product.\n// 2. Show the product in use, solving a specific problem.\n// 3. Highlight 2-3 key features with close-ups and text callouts.\n// 4. End with a strong call to action and where to buy.\n\n// Your prompt:\nA sleek and modern product demo for [YOUR PRODUCT]. Show it in a real-world setting, using slow-motion shots to highlight its design.`, recommendedPlatform: 'YouTube' },
];

const styleFilters = ['Cinematic', 'Vintage', 'Grayscale', 'Vibrant'];

interface VideoGeneratorProps {
  setActiveTab: (tab: Tab) => void;
}

const VideoGenerator: React.FC<VideoGeneratorProps> = ({ setActiveTab }) => {
    const { user } = useAuth();
    const [prompt, setPrompt] = useState('');
    const [basePrompt, setBasePrompt] = useState('');
    const [platform, setPlatform] = useState<'YouTube' | 'TikTok' | 'YouTube Shorts'>('YouTube');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageBase64, setImageBase64] = useState<{ data: string, mimeType: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
    const [error, setError] = useState<string | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [operation, setOperation] = useState<any | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState(videoTemplates[0].name);

    // AI Editing State
    const [editText, setEditText] = useState('');
    const [editFilter, setEditFilter] = useState('');
    const [duration, setDuration] = useState<number>(0);
    
    const pollingInterval = useRef<ReturnType<typeof setInterval> | null>(null);
    const loadingMessageInterval = useRef<ReturnType<typeof setInterval> | null>(null);

    // Effect to update the final prompt when quick edits are used
    useEffect(() => {
        let finalPrompt = basePrompt;
        if (duration > 0) {
            finalPrompt += ` The final video should be approximately ${duration} seconds long.`
        }
        if (editText) {
            finalPrompt += ` Add a text overlay that says: "${editText}".`;
        }
        if (editFilter) {
            finalPrompt += ` Apply a ${editFilter.toLowerCase()} visual style to the video.`;
        }
        setPrompt(finalPrompt.trim());
    }, [basePrompt, editText, editFilter, duration]);


    const fileToBase64 = (file: File): Promise<{ data: string, mimeType: string }> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                const base64Data = result.split(',')[1];
                resolve({ data: base64Data, mimeType: file.type });
            };
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 4 * 1024 * 1024) { // 4MB limit
                setError("Image size should not exceed 4MB.");
                return;
            }
            setError(null);
            setImageFile(file);
            const base64 = await fileToBase64(file);
            setImageBase64(base64);
        }
    };
    
    const cleanupIntervals = () => {
        if (pollingInterval.current) clearInterval(pollingInterval.current);
        if (loadingMessageInterval.current) clearInterval(loadingMessageInterval.current);
    }

    useEffect(() => {
        return () => cleanupIntervals(); // Cleanup on unmount
    }, []);

    const pollOperationStatus = (op: any) => {
        pollingInterval.current = setInterval(async () => {
            try {
                const updatedOp = await checkVideoStatus(op);
                setOperation(updatedOp);

                if (updatedOp.done) {
                    cleanupIntervals();
                    const downloadLink = updatedOp.response?.generatedVideos?.[0]?.video?.uri;
                    if (downloadLink) {
                        setLoadingMessage("Fetching your video...");
                        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
                        const videoBlob = await response.blob();
                        const url = URL.createObjectURL(videoBlob);
                        setVideoUrl(url);
                    } else {
                        setError("Video generation finished, but no video was returned.");
                    }
                    setLoading(false);
                }
            } catch (e: any) {
                setError(e.message || "Failed to check video status. Please try again.");
                setLoading(false);
                cleanupIntervals();
            }
        }, 10000); // Poll every 10 seconds
    };

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError('Please enter a prompt to generate a video.');
            return;
        }
        setLoading(true);
        setError(null);
        setVideoUrl(null);
        setOperation(null);
        setLoadingMessage(loadingMessages[0]);
        
        let messageIndex = 0;
        loadingMessageInterval.current = setInterval(() => {
            messageIndex = (messageIndex + 1) % loadingMessages.length;
            setLoadingMessage(loadingMessages[messageIndex]);
        }, 15000); // Change message every 15 seconds

        try {
            const imageParam = imageBase64 ? { imageBytes: imageBase64.data, mimeType: imageBase64.mimeType } : undefined;
            const initialOp = await generateVideo(prompt, platform, imageParam);
            setOperation(initialOp);
            pollOperationStatus(initialOp);
        } catch (e: any) {
            setError(e.message || 'An error occurred while starting video generation. Please try again.');
            setLoading(false);
            cleanupIntervals();
        }
    };
    
    const handleTemplateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const templateName = event.target.value;
        setSelectedTemplate(templateName);
        const template = videoTemplates.find(t => t.name === templateName);
        if (template) {
            setBasePrompt(template.prompt);
            setEditText('');
            setEditFilter('');
            setDuration(0);
            if (template.recommendedPlatform) {
                setPlatform(template.recommendedPlatform);
            }
        }
    };

    const handleStartOver = () => {
        setVideoUrl(null);
        setError(null);
        setOperation(null);
        setPrompt('');
        setBasePrompt('');
        setImageFile(null);
        setImageBase64(null);
        setSelectedTemplate(videoTemplates[0].name);
        setEditText('');
        setEditFilter('');
        setDuration(0);
    }

    if (user?.plan !== 'pro') {
        return (
            <div className="bg-dark-card border border-gray-700 rounded-xl p-8 shadow-2xl backdrop-blur-xl text-center flex flex-col items-center animate-slide-in-up">
                <Star className="w-12 h-12 text-yellow-400 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Upgrade to Pro to Generate Videos</h2>
                <p className="text-gray-400 mb-6 max-w-md">The AI Video Generator is a Pro feature. Upgrade your account to start creating.</p>
                <button
                    onClick={() => setActiveTab(Tab.Pricing)}
                    className="flex items-center gap-2 bg-gradient-to-r from-brand-purple to-brand-blue text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity"
                >
                    View Plans
                </button>
            </div>
        )
    }

    return (
        <div className="animate-slide-in-up">
            <div className="bg-dark-card border border-gray-700 rounded-xl p-6 shadow-2xl backdrop-blur-xl">
                <h2 className="text-2xl font-bold text-center mb-1 text-gray-100">AI Video Generator</h2>
                <p className="text-center text-gray-400 mb-6">{videoUrl ? "Your video is ready. Refine it or start a new project." : "Create stunning videos from text or animate an image."}</p>
                
                {(!loading && !videoUrl) && (
                    <div className="space-y-4">
                        <div className="mb-4">
                            <label className="font-semibold text-gray-300 mb-2 block">Target Platform</label>
                            <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-600">
                                <button onClick={() => setPlatform('YouTube')} title="Generate a widescreen video for YouTube (16:9)" className={`w-1/3 text-sm flex items-center justify-center gap-2 py-2 rounded-md transition-colors ${platform === 'YouTube' ? 'bg-brand-purple' : 'hover:bg-gray-700'}`}>
                                    <Youtube className="w-5 h-5"/> YouTube
                                </button>
                                <button onClick={() => setPlatform('YouTube Shorts')} title="Generate a vertical video for YouTube Shorts (9:16)" className={`w-1/3 text-sm flex items-center justify-center gap-2 py-2 rounded-md transition-colors ${platform === 'YouTube Shorts' ? 'bg-brand-purple' : 'hover:bg-gray-700'}`}>
                                    <YoutubeShorts className="w-5 h-5"/> Shorts
                                </button>
                                <button onClick={() => setPlatform('TikTok')} title="Generate a vertical video for TikTok (9:16)" className={`w-1/3 text-sm flex items-center justify-center gap-2 py-2 rounded-md transition-colors ${platform === 'TikTok' ? 'bg-brand-purple' : 'hover:bg-gray-700'}`}>
                                    <Film className="w-5 h-5"/> TikTok
                                </button>
                            </div>
                        </div>

                         <div>
                            <label htmlFor="video-template" className="font-semibold text-gray-300 mb-2 block">
                                Video Template (Optional)
                            </label>
                            <select
                                id="video-template"
                                value={selectedTemplate}
                                onChange={handleTemplateChange}
                                className="w-full bg-gray-800 border border-gray-600 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-brand-purple transition-all"
                                title="Choose a template to get started with a pre-filled prompt."
                            >
                                {videoTemplates.map((template, index) => (
                                <option key={index} value={template.name}>
                                    {template.name}
                                </option>
                                ))}
                            </select>
                        </div>


                        <label htmlFor="video-prompt" className="sr-only">Video Prompt</label>
                        <textarea
                            id="video-prompt"
                            value={basePrompt}
                            onChange={(e) => setBasePrompt(e.target.value)}
                            placeholder="e.g., 'A neon hologram of a cat driving at top speed'"
                            className="w-full bg-gray-800 border border-gray-600 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-brand-purple transition-all h-32 resize-none"
                            title="Describe the video you want to create."
                        />
                        
                        <div className="flex items-center justify-center w-full">
                           <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-800 hover:bg-gray-700 transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <svg className="w-8 h-8 mb-4 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/></svg>
                                    <p className="mb-2 text-sm text-gray-400"><span className="font-semibold">Click to upload an image</span> (optional)</p>
                                    <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 4MB)</p>
                                </div>
                                <input id="dropzone-file" type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleFileChange} />
                            </label>
                        </div>
                        {imageFile && <p className="text-center text-sm text-green-400">Image selected: {imageFile.name}</p>}

                        <button
                            onClick={handleGenerate}
                            disabled={loading}
                            className="w-full flex items-center justify-center bg-gradient-to-r from-brand-purple to-brand-blue text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                            title="Start generating the video. This may take a few minutes."
                        >
                           <Video className="w-5 h-5 mr-2" /> Generate Video
                        </button>
                    </div>
                )}
                
                {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
            </div>

            {loading && (
                <div className="text-center py-10 bg-dark-card border border-gray-700 rounded-xl p-6 shadow-2xl backdrop-blur-xl mt-8">
                    <Spinner size="lg" />
                    <p className="mt-4 text-gray-300 font-semibold text-lg">{loadingMessage}</p>
                    <p className="mt-2 text-gray-400 text-sm">Please keep this tab open. Video generation is in progress.</p>
                </div>
            )}

            {videoUrl && (
                <div className="mt-8 bg-dark-card border border-gray-700 rounded-xl p-6 shadow-2xl backdrop-blur-xl animate-fade-in">
                    <h3 className="text-2xl font-bold mb-4 text-center text-gray-100">Your Video is Ready!</h3>
                    <video controls autoPlay loop className="w-full rounded-lg mb-4 bg-black">
                        <source src={videoUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                    
                    {/* --- AI Editing Panel --- */}
                    <div className="space-y-4 pt-4 border-t border-gray-700">
                         <h4 className="text-lg font-bold text-center text-gray-200">Quick Edits</h4>
                         
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Text Overlay */}
                            <div>
                                <label htmlFor="text-overlay" className="font-semibold text-gray-300 mb-2 block flex items-center gap-2">
                                    <Type className="w-5 h-5" /> Text Overlay
                                </label>
                                <input
                                id="text-overlay"
                                type="text"
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                placeholder="e.g., 'My Awesome Vlog'"
                                className="w-full bg-gray-800 border border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-purple transition-all"
                                title="Type text here to add it as an overlay on the video."
                                />
                            </div>
                            
                            {/* Duration */}
                             <div>
                                <label htmlFor="duration" className="font-semibold text-gray-300 mb-2 block flex items-center gap-2">
                                    <Clock className="w-5 h-5" /> Target Duration (seconds)
                                </label>
                                <input
                                id="duration"
                                type="number"
                                value={duration || ''}
                                onChange={(e) => setDuration(parseInt(e.target.value, 10) || 0)}
                                placeholder="e.g., 15"
                                className="w-full bg-gray-800 border border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-purple transition-all"
                                title="Suggest a target length for the video in seconds."
                                />
                            </div>
                         </div>


                        {/* Style Filters */}
                        <div>
                            <label className="font-semibold text-gray-300 mb-2 block flex items-center gap-2">
                                <Filter className="w-5 h-5" /> Style Filters
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {styleFilters.map(filter => (
                                    <button 
                                        key={filter} 
                                        onClick={() => setEditFilter(current => current === filter ? '' : filter)}
                                        className={`py-2 px-4 text-sm font-semibold rounded-lg transition-colors ${editFilter === filter ? 'bg-brand-purple text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
                                    >
                                        {filter}
                                    </button>
                                ))}
                            </div>
                        </div>

                         <div className="pt-2">
                             <label htmlFor="final-prompt" className="font-semibold text-gray-300 mb-2 block">
                                Final Prompt for Regeneration
                             </label>
                             <textarea
                                id="final-prompt"
                                value={prompt}
                                readOnly
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg py-2 px-4 h-24 resize-none text-gray-400 text-sm"
                                title="This is the final prompt that will be sent to the AI, updated with your edits."
                            />
                         </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                             <button
                                onClick={handleStartOver}
                                className="w-full flex items-center justify-center bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                                title="Clear everything and start a new video project."
                            >
                               Start Over
                            </button>
                            <button
                                onClick={handleGenerate}
                                disabled={loading}
                                className="w-full flex items-center justify-center bg-gradient-to-r from-brand-purple to-brand-blue text-white font-semibold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                                title="Regenerate the video with your new edits."
                            >
                               <RefreshCw className="w-5 h-5 mr-2" /> Regenerate
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoGenerator;
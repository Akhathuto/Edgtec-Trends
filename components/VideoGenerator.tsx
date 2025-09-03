

import React, { useState, useRef, useEffect } from 'react';
import { generateVideo, checkVideoStatus, generateTranscriptFromPrompt } from '../services/geminiService.ts';
import Spinner from './Spinner.tsx';
import { Video, Youtube, Film, YoutubeShorts, RefreshCw, Type, Filter, Clock, Star, FileText, Copy, TikTok, UploadCloud, Play, Pause, StopCircle, Download } from './Icons.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { Tab } from '../types.ts';
import { useToast } from '../contexts/ToastContext.tsx';

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

const styleFilters = ['Cinematic', 'Vintage', 'Grayscale', 'Vibrant', 'Anime', 'Documentary', '8-bit', 'Noir'];

interface VideoGeneratorProps {
  setActiveTab: (tab: Tab) => void;
}

const VideoGenerator: React.FC<VideoGeneratorProps> = ({ setActiveTab }) => {
    const { user, logActivity, addContentToHistory } = useAuth();
    const { showToast } = useToast();
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
    
    // Transcript and TTS State
    const [transcript, setTranscript] = useState<string | null>(null);
    const [transcriptLoading, setTranscriptLoading] = useState(false);
    const [transcriptError, setTranscriptError] = useState<string | null>(null);
    const [isSpeaking, setIsSpeaking] = useState(false);
    
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
         return () => {
            cleanupIntervals(); // Cleanup on unmount
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel(); // Stop any speech on unmount
            }
        }
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
        setTranscript(null);
        setTranscriptError(null);
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
            logActivity(`started generating a video for prompt: "${prompt.substring(0, 30)}..."`, 'Video');
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
        setTranscript(null);
        setTranscriptLoading(false);
        setTranscriptError(null);
         if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        setIsSpeaking(false);
    }
    
    const handleGenerateTranscript = async () => {
        setTranscriptLoading(true);
        setTranscriptError(null);
        setTranscript(null);
        try {
            const result = await generateTranscriptFromPrompt(basePrompt); 
            setTranscript(result);
            addContentToHistory({
                type: 'Video Transcript',
                summary: `Transcript for video: "${basePrompt.substring(0, 40)}..."`,
                content: { prompt: basePrompt, transcript: result }
            });
        } catch (e) {
            setTranscriptError("Failed to generate transcript. Please try again.");
            console.error(e);
        } finally {
            setTranscriptLoading(false);
        }
    };

    const handleDownload = async (url: string, filename: string) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(blobUrl);
        } catch (err) {
            setError("Failed to download video. Please try again.");
            console.error(err);
        }
    };

    const handleDownloadTranscript = () => {
        if (!transcript) return;
        const blob = new Blob([transcript], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `utrend_transcript_${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleCopyTranscript = () => {
        if (transcript) {
            navigator.clipboard.writeText(transcript);
            showToast('Transcript copied to clipboard!');
        }
    };

    const handleToggleSpeech = () => {
        if (!transcript || !('speechSynthesis' in window)) return;

        if (isSpeaking) {
            window.speechSynthesis.pause();
            setIsSpeaking(false);
        } else {
            if (window.speechSynthesis.paused) {
                 window.speechSynthesis.resume();
            } else {
                const utterance = new SpeechSynthesisUtterance(transcript);
                utterance.onend = () => setIsSpeaking(false);
                window.speechSynthesis.speak(utterance);
            }
            setIsSpeaking(true);
        }
    };
    
    const handleStopSpeech = () => {
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    };


    if (user?.plan !== 'pro') {
        return (
            <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-8 shadow-xl backdrop-blur-xl text-center flex flex-col items-center animate-slide-in-up">
                <Star className="w-12 h-12 text-yellow-400 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Upgrade to Pro to Generate Videos</h2>
                <p className="text-slate-400 mb-6 max-w-md">The AI Video Generator is a Pro feature. Upgrade your account to start creating.</p>
                <button
                    onClick={() => setActiveTab(Tab.Pricing)}
                    className="flex items-center gap-2 bg-gradient-to-r from-violet-dark to-violet-light text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity shadow-md hover:shadow-lg hover:shadow-violet/30"
                >
                    View Plans
                </button>
            </div>
        )
    }

    return (
        <div className="animate-slide-in-up">
            <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl">
                <h2 className="text-2xl font-bold text-center mb-1 text-slate-100">AI Video Generator</h2>
                <p className="text-center text-slate-400 mb-6">{videoUrl ? "Your video is ready. Add a voiceover or start a new project." : "Create stunning videos from text or animate an image."}</p>
                
                {(!loading && !videoUrl) && (
                    <div className="space-y-4">
                        <div className="mb-4">
                            <label className="font-semibold text-slate-300 mb-2 block">Target Platform</label>
                            <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
                                <button onClick={() => setPlatform('YouTube')} title="Generate a widescreen video for YouTube (16:9)" className={`w-1/3 text-sm flex items-center justify-center gap-2 py-2 rounded-md transition-colors ${platform === 'YouTube' ? 'bg-violet' : 'hover:bg-slate-700 text-slate-300 hover:text-white'}`}>
                                    <Youtube className="w-5 h-5"/> YouTube
                                </button>
                                <button onClick={() => setPlatform('YouTube Shorts')} title="Generate a vertical video for YouTube Shorts (9:16)" className={`w-1/3 text-sm flex items-center justify-center gap-2 py-2 rounded-md transition-colors ${platform === 'YouTube Shorts' ? 'bg-violet' : 'hover:bg-slate-700 text-slate-300 hover:text-white'}`}>
                                    <YoutubeShorts className="w-5 h-5"/> Shorts
                                </button>
                                <button onClick={() => setPlatform('TikTok')} title="Generate a vertical video for TikTok (9:16)" className={`w-1/3 text-sm flex items-center justify-center gap-2 py-2 rounded-md transition-colors ${platform === 'TikTok' ? 'bg-violet' : 'hover:bg-slate-700 text-slate-300 hover:text-white'}`}>
                                    <TikTok className="w-5 h-5"/> TikTok
                                </button>
                            </div>
                        </div>

                         <div>
                            <label htmlFor="video-template" className="font-semibold text-slate-300 mb-2 block">
                                Video Template (Optional)
                            </label>
                            <select
                                id="video-template"
                                value={selectedTemplate}
                                onChange={handleTemplateChange}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-violet-light transition-all"
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
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-violet-light transition-all h-32 resize-none shadow-inner"
                            title="Describe the video you want to create."
                        />
                        
                        <div className="flex items-center justify-center w-full">
                           <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-700 border-dashed rounded-lg cursor-pointer bg-slate-800/50 hover:bg-slate-700/50 transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <UploadCloud className="w-8 h-8 mb-4 text-slate-400" />
                                    <p className="mb-2 text-sm text-slate-400"><span className="font-semibold">Click to upload an image</span> (optional)</p>
                                    <p className="text-xs text-slate-500">PNG, JPG or JPEG (MAX. 4MB)</p>
                                </div>
                                <input id="dropzone-file" type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleFileChange} />
                            </label>
                        </div>
                        {imageFile && <p className="text-center text-sm text-green-400">Image selected: {imageFile.name}</p>}

                        <button
                            onClick={handleGenerate}
                            disabled={loading}
                            className="w-full flex items-center justify-center bg-gradient-to-r from-violet-dark to-violet-light text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 shadow-md hover:shadow-lg hover:shadow-violet/30"
                            title="Start generating the video. This may take a few minutes."
                        >
                           <Video className="w-5 h-5 mr-2" /> Generate Video
                        </button>
                    </div>
                )}
                
                {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
            </div>

            {loading && (
                <div className="text-center py-10 bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl mt-8">
                    <Spinner size="lg" />
                    <p className="mt-4 text-slate-300 font-semibold text-lg">{loadingMessage}</p>
                    <p className="mt-2 text-slate-400 text-sm">Please keep this tab open. Video generation is in progress.</p>
                </div>
            )}

            {videoUrl && (
                <div className="mt-8 bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl animate-fade-in">
                    <h3 className="text-2xl font-bold mb-4 text-center text-slate-100">Your Video is Ready!</h3>
                    <video controls autoPlay loop className="w-full rounded-lg mb-4 bg-black shadow-lg">
                        <source src={videoUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                    
                     <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => handleDownload(videoUrl, `utrend_video_${Date.now()}.mp4`)}
                                className="w-full flex items-center justify-center bg-gradient-to-r from-violet-dark to-violet-light text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity shadow-md hover:shadow-lg hover:shadow-violet/30"
                            >
                               <Download className="w-5 h-5 mr-2" /> Download Video
                            </button>
                             <button
                                onClick={handleStartOver}
                                className="w-full flex items-center justify-center bg-slate-700 text-white font-semibold py-3 px-6 rounded-lg hover:bg-slate-600 transition-colors"
                                title="Clear everything and start a new video project."
                            >
                               Start Over
                            </button>
                            <button
                                onClick={handleGenerate}
                                disabled={loading}
                                className="w-full flex items-center justify-center bg-slate-700 text-white font-semibold py-3 px-6 rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50"
                                title="Regenerate the video with the same prompt"
                            >
                               <RefreshCw className="w-5 h-5 mr-2" /> Regenerate
                            </button>
                        </div>


                    {/* --- Transcript & Voiceover Section --- */}
                    <div className="mt-6 pt-6 border-t border-slate-700">
                        <h4 className="text-lg font-bold text-center text-slate-200 mb-4">AI Transcript & Voiceover</h4>
                        {!transcript && !transcriptLoading && (
                            <button
                                onClick={handleGenerateTranscript}
                                className="w-full flex items-center justify-center bg-slate-700 text-white font-semibold py-3 px-4 rounded-lg hover:bg-slate-600 transition-colors"
                                title="Generate an AI-powered transcript for your video."
                            >
                                <FileText className="w-5 h-5 mr-2" /> Generate Transcript
                            </button>
                        )}
                        {transcriptLoading && (
                            <div className="flex justify-center">
                                <Spinner />
                            </div>
                        )}
                        {transcriptError && <p className="text-red-400 text-center">{transcriptError}</p>}
                        {transcript && (
                            <div className="bg-slate-800/50 rounded-lg p-4 relative border border-slate-700">
                                <div className="absolute top-2 right-2 flex items-center gap-1">
                                    <button 
                                        onClick={handleToggleSpeech}
                                        className="p-1.5 rounded-md bg-slate-700 hover:bg-slate-600 transition-colors"
                                        title={isSpeaking ? "Pause Voiceover" : "Play Voiceover"}
                                    >
                                        {isSpeaking ? <Pause className="w-4 h-4 text-slate-300" /> : <Play className="w-4 h-4 text-slate-300" />}
                                    </button>
                                     <button 
                                        onClick={handleStopSpeech}
                                        className="p-1.5 rounded-md bg-slate-700 hover:bg-slate-600 transition-colors"
                                        title="Stop Voiceover"
                                    >
                                        <StopCircle className="w-4 h-4 text-slate-300" />
                                    </button>
                                    <button 
                                        onClick={handleCopyTranscript}
                                        className="p-1.5 rounded-md bg-slate-700 hover:bg-slate-600 transition-colors"
                                        title="Copy transcript"
                                    >
                                        <Copy className="w-4 h-4 text-slate-300" />
                                    </button>
                                     <button 
                                        onClick={handleDownloadTranscript}
                                        className="p-1.5 rounded-md bg-slate-700 hover:bg-slate-600 transition-colors"
                                        title="Download transcript"
                                    >
                                        <Download className="w-4 h-4 text-slate-300" />
                                    </button>
                                </div>
                                <pre className="text-sm text-slate-300 whitespace-pre-wrap font-sans max-h-48 overflow-y-auto pr-36">
                                    {transcript}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoGenerator;
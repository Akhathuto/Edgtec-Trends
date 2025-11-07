import React, { useState, useRef, useEffect } from 'react';
import { generateVideo, checkVideoStatus, extendVideo } from '../services/geminiService';
import Spinner from './Spinner';
import { Star, Video, UploadCloud, RefreshCw, Download, Film, X, ChevronsRight } from './Icons';
import { useAuth } from '../contexts/AuthContext';
import { Tab } from '../types';
import ErrorDisplay from './ErrorDisplay';

const loadingMessages = [
    "Warming up the video generator...",
    "This can take a few minutes, please wait...",
    "Rendering your video frame by frame...",
    "Adding final touches to your masterpiece...",
    "Still working... high-quality video takes time!",
];

interface VideoGeneratorProps {
  setActiveTab: (tab: Tab) => void;
}

const VideoGenerator: React.FC<VideoGeneratorProps> = ({ setActiveTab }) => {
    const { user, logActivity, addContentToHistory } = useAuth();
    const [prompt, setPrompt] = useState('');
    const [referenceImages, setReferenceImages] = useState<{ data: string, mimeType: string, url: string, file: File }[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
    const [error, setError] = useState<string | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [operation, setOperation] = useState<any | null>(null);
    const [previousOperation, setPreviousOperation] = useState<any | null>(null);
    
    const [mode, setMode] = useState<'generate' | 'extend'>('generate');
    const [extendPrompt, setExtendPrompt] = useState('');

    const pollingInterval = useRef<ReturnType<typeof setInterval> | null>(null);
    const loadingMessageInterval = useRef<ReturnType<typeof setInterval> | null>(null);

    const [isKeySelected, setIsKeySelected] = useState(true);
    const [keyCheckLoading, setKeyCheckLoading] = useState(true);

    useEffect(() => {
        const checkApiKey = async () => {
            if (user?.plan !== 'pro') return;
            try {
                const hasKey = await (window as any).aistudio.hasSelectedApiKey();
                setIsKeySelected(hasKey);
            } catch (e) {
                console.warn("aistudio.hasSelectedApiKey not available, assuming key is present.", e);
                setIsKeySelected(true); // Default to true in environments where this doesn't exist
            } finally {
                setKeyCheckLoading(false);
            }
        };
        checkApiKey();
    }, [user?.plan]);

    const handleSelectKey = async () => {
        try {
            await (window as any).aistudio.openSelectKey();
            setIsKeySelected(true); // Assume success after open
        } catch(e) {
            console.error("aistudio.openSelectKey not available", e);
            setError("Could not open the API key selection dialog.");
        }
    };

    const cleanupIntervals = () => {
        if (pollingInterval.current) clearInterval(pollingInterval.current);
        if (loadingMessageInterval.current) clearInterval(loadingMessageInterval.current);
    }

    useEffect(() => {
         return () => cleanupIntervals(); // Cleanup on unmount
    }, []);

    const pollOperationStatus = (op: any, isExtension: boolean = false) => {
        pollingInterval.current = setInterval(async () => {
            try {
                const updatedOp = await checkVideoStatus(op);
                setOperation(updatedOp);

                if (updatedOp.done) {
                    cleanupIntervals();
                    const downloadLink = updatedOp.response?.generatedVideos?.[0]?.video?.uri;
                    if (downloadLink) {
                        setLoadingMessage("Fetching your video...");
                        const response = await fetch(`/api/download?url=${encodeURIComponent(downloadLink)}`);
                        if (!response.ok) throw new Error('Failed to download video from proxy.');
                        
                        const videoBlob = await response.blob();
                        const url = URL.createObjectURL(videoBlob);
                        setVideoUrl(url);
                        setPreviousOperation(updatedOp); // Save for potential extension

                        addContentToHistory({
                            type: 'Generated Video',
                            summary: `Video: "${isExtension ? extendPrompt : prompt}"`,
                            content: { prompt: isExtension ? extendPrompt : prompt, hasImage: referenceImages.length > 0 }
                        });
                    } else {
                        setError("Video generation finished, but no media was returned.");
                    }
                    setLoading(false);
                }
            } catch (e: any) {
                if (e.message?.includes("Requested entity was not found.")) {
                    setError("Your API key may be invalid. Please select a valid key.");
                    setIsKeySelected(false);
                } else {
                    setError(e.message || "Failed to check video status. Please try again.");
                }
                setLoading(false);
                cleanupIntervals();
            }
        }, 10000); // Poll every 10 seconds
    };
    
    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError('Please enter a prompt for your video.');
            return;
        }
        setLoading(true);
        setError(null);
        setVideoUrl(null);
        setOperation(null);
        setPreviousOperation(null);
        setLoadingMessage(loadingMessages[0]);
        
        let messageIndex = 0;
        loadingMessageInterval.current = setInterval(() => {
            messageIndex = (messageIndex + 1) % loadingMessages.length;
            setLoadingMessage(loadingMessages[messageIndex]);
        }, 15000);

        try {
            const imageParams = referenceImages.map(img => ({ imageBytes: img.data, mimeType: img.mimeType }));
            const model = imageParams.length > 1 ? 'veo-3.1-generate-preview' : 'veo-3.1-fast-generate-preview';

            const initialOp = await generateVideo(model, prompt, imageParams);
            setOperation(initialOp);
            pollOperationStatus(initialOp);
            logActivity(`started generating a video: "${prompt.substring(0, 30)}..."`, 'Video');
        } catch (e: any) {
             if (e.message?.includes("Requested entity was not found.")) {
                setError("Your API key is invalid. Please select a valid key.");
                setIsKeySelected(false);
            } else {
                setError(e.message || 'An error occurred while starting the video.');
            }
            setLoading(false);
            cleanupIntervals();
        }
    };

    const handleExtend = async () => {
        if (!extendPrompt.trim()) { setError('Please enter a prompt for the extension.'); return; }
        if (!previousOperation) { setError('No previous video to extend.'); return; }

        setLoading(true);
        setError(null);
        setVideoUrl(null); // Clear previous video URL to show loading state for the new one
        setLoadingMessage("Extending your video...");

        try {
            const previousVideo = previousOperation.response?.generatedVideos?.[0]?.video;
            if (!previousVideo) throw new Error("Could not find video data from previous generation.");

            const initialOp = await extendVideo(extendPrompt, previousVideo, previousVideo.aspectRatio);
            setOperation(initialOp);
            pollOperationStatus(initialOp, true);
            logActivity(`started extending a video: "${extendPrompt.substring(0, 30)}..."`, 'Video');
        } catch(e: any) {
            setError(e.message || "Failed to start video extension.");
            setLoading(false);
            cleanupIntervals();
        }
    };

    const fileToBase64 = (file: File): Promise<{ data: string, mimeType: string, url: string, file: File }> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                const base64Data = result.split(',')[1];
                resolve({ data: base64Data, mimeType: file.type, url: result, file });
            };
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            const fileList = Array.from(files).slice(0, 3 - referenceImages.length); // Limit to 3 total
            for (const file of fileList) {
                const currentFile = file as File;
                if (currentFile.size > 4 * 1024 * 1024) { setError("Image size should not exceed 4MB."); continue; }
                if (!['image/png', 'image/jpeg'].includes(currentFile.type)) { setError("Please upload PNG or JPG images."); continue; }
                const base64 = await fileToBase64(currentFile);
                setReferenceImages(prev => [...prev, base64]);
            }
        }
    };

    const removeImage = (url: string) => {
        setReferenceImages(prev => prev.filter(img => img.url !== url));
    }

    const handleStartOver = () => {
        setVideoUrl(null);
        setError(null);
        setOperation(null);
        setPreviousOperation(null);
        setPrompt('');
        setExtendPrompt('');
        setReferenceImages([]);
        setMode('generate');
    }
    
    const handleDownload = (url: string, filename: string) => {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    if (user?.plan !== 'pro') {
        return (
            <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-8 shadow-xl backdrop-blur-xl text-center flex flex-col items-center animate-slide-in-up">
                <Star className="w-12 h-12 text-yellow-400 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Upgrade to Pro for the AI Video Generator</h2>
                <p className="text-slate-400 mb-6 max-w-md">The Video Generator is a Pro feature. Upgrade your account to start creating videos from text or images.</p>
                <button onClick={() => setActiveTab(Tab.Pricing)} className="button-primary" title="View subscription plans to upgrade">View Plans</button>
            </div>
        )
    }

    if (keyCheckLoading) { return <div className="flex justify-center p-8"><Spinner size="lg" /></div>; }

    if (!isKeySelected) {
        return (
            <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-8 shadow-xl backdrop-blur-xl text-center flex flex-col items-center animate-slide-in-up">
                <h2 className="text-2xl font-bold mb-2">API Key Required for Video Generation</h2>
                <p className="text-slate-400 mb-6 max-w-md">To use the AI Video Generator, you need to select a Google AI API key. <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline ml-1">Learn about billing.</a></p>
                <button onClick={handleSelectKey} className="button-primary">Select API Key</button>
                <ErrorDisplay message={error} className="mt-4" />
            </div>
        );
    }

    return (
        <div className="animate-slide-in-up">
            <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl">
                <h2 className="text-2xl font-bold text-center mb-1 text-slate-100 flex items-center justify-center gap-2"><Video className="w-6 h-6 text-violet-400" /> AI Video Generator</h2>
                <p className="text-center text-slate-400 mb-6">{videoUrl ? "Your video is ready!" : "Create stunning videos from text and reference images."}</p>
                
                {(!loading && !videoUrl) && (
                    <div className="space-y-4">
                        <textarea id="video-prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="e.g., 'A neon hologram of a cat driving at top speed'" className="form-input h-32" title="Describe the video you want to create. (Pro Feature)" />
                        
                        <div>
                            <label className="input-label">Reference Images (up to 3, optional)</label>
                            <div className="flex items-center gap-4">
                                {referenceImages.map((img) => (
                                    <div key={img.url} className="relative w-24 h-24">
                                        <img src={img.url} alt="Reference" className="w-full h-full object-cover rounded-lg" />
                                        <button onClick={() => removeImage(img.url)} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"><X className="w-3 h-3 text-white" /></button>
                                    </div>
                                ))}
                                {referenceImages.length < 3 && (
                                    <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-24 h-24 border-2 border-slate-700 border-dashed rounded-lg cursor-pointer bg-slate-800/50 hover:bg-slate-700/50 transition-colors">
                                        <UploadCloud className="w-6 h-6 text-slate-400" />
                                        <input id="image-upload" type="file" multiple className="hidden" accept="image/png, image/jpeg" onChange={handleFileChange} />
                                    </label>
                                )}
                            </div>
                            {referenceImages.length > 1 && <p className="text-xs text-slate-400 mt-2">Using multiple images requires the 'veo-3.1-generate-preview' model and may take longer.</p>}
                        </div>

                        <button onClick={handleGenerate} disabled={loading} className="button-primary w-full" title="Start generating the video. This may take a few minutes. (Pro Feature)"><Video className="w-5 h-5 mr-2" /> Generate Video</button>
                    </div>
                )}
                
                <ErrorDisplay message={error} className="mt-4" />
            </div>

            {loading && (
                <div className="text-center py-10 bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl mt-8">
                    <Spinner size="lg" /><p className="mt-4 text-slate-300 font-semibold text-lg animate-text-fade-cycle">{loadingMessage}</p>
                    <p className="mt-2 text-slate-400 text-sm">Please keep this tab open. Generation is in progress.</p>
                </div>
            )}

            {videoUrl && (
                <div className="mt-8 bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl animate-fade-in">
                    <h3 className="text-2xl font-bold mb-4 text-center text-slate-100">Your Video is Ready!</h3>
                    <video controls autoPlay loop className="w-full rounded-lg mb-4 bg-black shadow-lg"><source src={videoUrl} type="video/mp4" />Your browser does not support the video tag.</video>
                    
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <button onClick={() => handleDownload(videoUrl, `utrend_video_${Date.now()}.mp4`)} className="button-secondary w-full" title="Download the generated video as an MP4 file"><Download className="w-5 h-5 mr-2" /> Download</button>
                        <button onClick={handleStartOver} className="button-secondary w-full" title="Clear the prompt and start a new video">Start Over</button>
                        <button onClick={handleGenerate} disabled={loading} className="button-primary w-full" title="Generate a new video with the same prompt"><RefreshCw className="w-5 h-5 mr-2" /> Regenerate</button>
                    </div>
                    
                    {/* Extend Video Section */}
                    <div className="pt-6 border-t border-slate-700/50">
                        <h4 className="text-lg font-bold text-slate-200 mb-3 flex items-center gap-2"><ChevronsRight/> Extend Your Video</h4>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <input type="text" value={extendPrompt} onChange={e => setExtendPrompt(e.target.value)} placeholder="Prompt for the next scene..." className="form-input flex-grow" />
                            <button onClick={handleExtend} disabled={loading || !previousOperation} className="button-primary">Extend (+7s)</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoGenerator;
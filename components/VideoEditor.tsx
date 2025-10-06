import React, { useState, useCallback, useRef, useEffect } from 'react';
import { editVideo, checkVideoStatus } from '../services/geminiService.ts';
import Spinner from './Spinner.tsx';
import { Star, UploadCloud, RefreshCw, Download, Scissors, Sliders, Zap, Film } from './Icons.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { Tab } from '../types.ts';

interface VideoEditorProps {
  setActiveTab: (tab: Tab) => void;
}

const loadingMessages = [
    "Analyzing your video...",
    "Applying AI magic, this can take a few minutes...",
    "Rendering new frames...",
    "Finalizing your edited video...",
    "Patience is key for great edits!",
];

const videoStyles = ['Cinematic', 'Vintage Film', 'Anime', 'Documentary', 'Hyperlapse', 'Claymation', 'Black and White', 'Vibrant Colors'];
const specialEffects = ['Slow Motion', 'Sped Up', 'Confetti', 'Fireworks', 'Lens Flare', 'Light Leaks', 'VHS Glitch'];
const cameraMotions = ['Panning Shot', 'Tilting Shot', 'Drone Shot', 'Dolly Zoom', 'Handheld shaky cam', 'Static tripod shot'];


const VideoEditor: React.FC<VideoEditorProps> = ({ setActiveTab }) => {
    const { user, logActivity, addContentToHistory } = useAuth();
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoSrc, setVideoSrc] = useState<string | null>(null);
    const [frameBase64, setFrameBase64] = useState<{ data: string, mimeType: string } | null>(null);
    const [basePrompt, setBasePrompt] = useState('');
    const [selectedStyle, setSelectedStyle] = useState('');
    const [selectedEffect, setSelectedEffect] = useState('');
    const [selectedCamera, setSelectedCamera] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
    const [error, setError] = useState<string | null>(null);
    const [editedVideoUrl, setEditedVideoUrl] = useState<string | null>(null);
    const [operation, setOperation] = useState<any | null>(null);

    const pollingInterval = useRef<ReturnType<typeof setInterval> | null>(null);
    const loadingMessageInterval = useRef<ReturnType<typeof setInterval> | null>(null);

    const cleanupIntervals = useCallback(() => {
        if (pollingInterval.current) clearInterval(pollingInterval.current);
        if (loadingMessageInterval.current) clearInterval(loadingMessageInterval.current);
    }, []);

    useEffect(() => {
        return () => cleanupIntervals();
    }, [cleanupIntervals]);

    const extractFrame = (file: File): Promise<{ data: string, mimeType: string }> => {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            video.src = URL.createObjectURL(file);
            video.muted = true;

            video.onloadeddata = async () => {
                try {
                    await video.play();
                    video.pause();
                    video.currentTime = 0.1; // Seek to a very early frame
                } catch (err) {
                    console.error("Video play/pause failed, proceeding with frame capture.", err);
                }
            };
            
            video.onseeked = () => {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
                    const base64Data = dataUrl.split(',')[1];
                    URL.revokeObjectURL(video.src);
                    resolve({ data: base64Data, mimeType: 'image/jpeg' });
                } else {
                    URL.revokeObjectURL(video.src);
                    reject(new Error("Could not get canvas context."));
                }
            };

            video.onerror = (err) => {
                URL.revokeObjectURL(video.src);
                reject(new Error(`Failed to load video: ${err}`));
            };

            video.load();
        });
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 50 * 1024 * 1024) { // 50MB limit for video upload
                setError("Video size should not exceed 50MB.");
                return;
            }
            if (!file.type.startsWith('video/')) {
                setError("Please upload a valid video file.");
                return;
            }
            handleStartOver();
            setVideoFile(file);
            setVideoSrc(URL.createObjectURL(file));
            try {
                const frame = await extractFrame(file);
                setFrameBase64(frame);
            } catch (err: any) {
                setError(`Failed to process video: ${err.message}`);
                handleStartOver();
            }
        }
    };

    const pollOperationStatus = useCallback((op: any) => {
        pollingInterval.current = setInterval(async () => {
            try {
                const updatedOp = await checkVideoStatus(op);
                setOperation(updatedOp);
                if (updatedOp.done) {
                    cleanupIntervals();
                    const downloadLink = updatedOp.response?.generatedVideos?.[0]?.video?.uri;
                    if (downloadLink) {
                        setLoadingMessage("Fetching your edited video...");
                        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
                        const videoBlob = await response.blob();
                        const url = URL.createObjectURL(videoBlob);
                        setEditedVideoUrl(url);
                        // Add to history if needed
                    } else {
                        setError("Editing finished, but no video was returned.");
                    }
                    setLoading(false);
                }
            } catch (e: any) {
                setError(e.message || "Failed to check video status.");
                setLoading(false);
                cleanupIntervals();
            }
        }, 10000);
    }, [cleanupIntervals]);

    const handleGenerate = useCallback(async () => {
        let combinedPrompt = basePrompt;
        if (selectedStyle) combinedPrompt += ` The visual style should be ${selectedStyle.toLowerCase()}.`;
        if (selectedEffect) combinedPrompt += ` Include a ${selectedEffect.toLowerCase()} effect.`;
        if (selectedCamera) combinedPrompt += ` Use a ${selectedCamera.toLowerCase()}.`;
        combinedPrompt = combinedPrompt.trim();


        if (!frameBase64) {
            setError('Could not process the video frame. Please try another video.');
            return;
        }
        if (!combinedPrompt) {
            setError('Please enter an editing instruction or select a tool.');
            return;
        }

        setLoading(true);
        setError(null);
        setEditedVideoUrl(null);
        setOperation(null);
        setLoadingMessage(loadingMessages[0]);

        let messageIndex = 0;
        loadingMessageInterval.current = setInterval(() => {
            messageIndex = (messageIndex + 1) % loadingMessages.length;
            setLoadingMessage(loadingMessages[messageIndex]);
        }, 15000);

        try {
            const initialOp = await editVideo(combinedPrompt, { imageBytes: frameBase64.data, mimeType: frameBase64.mimeType });
            setOperation(initialOp);
            pollOperationStatus(initialOp);
            logActivity(`started editing a video with prompt: "${combinedPrompt.substring(0, 30)}..."`, 'Scissors');
        } catch (e: any) {
            setError(e.message || 'An error occurred while starting video editing.');
            setLoading(false);
            cleanupIntervals();
        }
    }, [frameBase64, basePrompt, selectedStyle, selectedEffect, selectedCamera, pollOperationStatus, cleanupIntervals, logActivity]);

    const handleStartOver = () => {
        if (videoSrc) URL.revokeObjectURL(videoSrc);
        setError(null);
        setVideoFile(null);
        setVideoSrc(null);
        setFrameBase64(null);
        setBasePrompt('');
        setSelectedStyle('');
        setSelectedEffect('');
        setSelectedCamera('');
        setEditedVideoUrl(null);
    };
    
    const handleDownload = async (url: string, filename: string) => {
        if (!url) return;
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
            setError("Failed to download video.");
        }
    };

    if (user?.plan !== 'pro') {
        return (
            <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-8 shadow-xl backdrop-blur-xl text-center flex flex-col items-center animate-slide-in-up">
                <Star className="w-12 h-12 text-yellow-400 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Upgrade to Pro for the AI Video Editor</h2>
                <p className="text-slate-400 mb-6 max-w-md">The AI Video Editor is a Pro feature. Upgrade your account to edit videos with text prompts.</p>
                <button
                    onClick={() => setActiveTab(Tab.Pricing)}
                    className="flex items-center gap-2 bg-gradient-to-r from-violet-dark to-violet-light text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity"
                >
                    View Plans
                </button>
            </div>
        );
    }

    return (
        <div className="animate-slide-in-up">
            <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl">
                <h2 className="text-2xl font-bold text-center mb-1 text-slate-100 flex items-center justify-center gap-2">
                    <Scissors className="w-6 h-6 text-violet-400" /> AI Video Editor
                </h2>
                <p className="text-center text-slate-400 mb-6">Upload a video and tell the AI how you want to change it.</p>
                
                {!videoFile && (
                    <div className="flex items-center justify-center w-full">
                       <label htmlFor="video-upload" className="flex flex-col items-center justify-center w-full h-64 border-2 border-slate-700 border-dashed rounded-lg cursor-pointer bg-slate-800/50 hover:bg-slate-700/50 transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <UploadCloud className="w-10 h-10 mb-4 text-slate-400" />
                                <p className="mb-2 text-sm text-slate-400"><span className="font-semibold">Click to upload a video</span></p>
                                <p className="text-xs text-slate-500">MP4, MOV, WEBM etc. (MAX. 50MB)</p>
                            </div>
                            <input id="video-upload" type="file" className="hidden" accept="video/*" onChange={handleFileChange} />
                        </label>
                    </div>
                )}

                {videoFile && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                            <div>
                                <h3 className="font-bold text-lg mb-2 text-center text-slate-200">Original</h3>
                                {videoSrc && <video src={videoSrc} controls className="rounded-lg w-full aspect-video object-contain bg-black/20" />}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-2 text-center text-slate-200">Edited</h3>
                                <div className="rounded-lg w-full aspect-video bg-black/20 flex items-center justify-center relative">
                                    {loading && <div className="text-center"><Spinner size="lg" /><p className="text-sm text-slate-300 mt-2 animate-text-fade-cycle">{loadingMessage}</p></div>}
                                    {!loading && editedVideoUrl && <video src={editedVideoUrl} controls autoPlay loop className="rounded-lg w-full aspect-video object-contain" />}
                                    {!loading && !editedVideoUrl && <p className="text-slate-500">Your edited video will appear here</p>}
                                </div>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="video-edit-prompt" className="block text-sm font-medium text-slate-300 mb-1">Editing Instruction</label>
                            <textarea
                                id="video-edit-prompt"
                                value={basePrompt}
                                onChange={(e) => setBasePrompt(e.target.value)}
                                placeholder="e.g., 'a dog is now wearing a superhero cape', 'the car is now bright red'"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-violet-light transition-all resize-none h-20 shadow-inner"
                                rows={2}
                            />
                        </div>
                        <div className="mt-2">
                            <h4 className="text-lg font-semibold text-slate-200 mb-3">AI Toolkit</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label htmlFor="style-select" className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-1">
                                        <Sliders className="w-4 h-4 text-violet-400" /> Style
                                    </label>
                                    <select id="style-select" value={selectedStyle} onChange={(e) => setSelectedStyle(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-violet-light transition-all">
                                        <option value="">Default Style</option>
                                        {videoStyles.map(style => <option key={style} value={style}>{style}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="effect-select" className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-1">
                                        <Zap className="w-4 h-4 text-violet-400" /> Special Effect
                                    </label>
                                    <select id="effect-select" value={selectedEffect} onChange={(e) => setSelectedEffect(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-violet-light transition-all">
                                        <option value="">No Effect</option>
                                        {specialEffects.map(effect => <option key={effect} value={effect}>{effect}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="camera-select" className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-1">
                                        <Film className="w-4 h-4 text-violet-400" /> Camera Motion
                                    </label>
                                    <select id="camera-select" value={selectedCamera} onChange={(e) => setSelectedCamera(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-violet-light transition-all">
                                        <option value="">Default Motion</option>
                                        {cameraMotions.map(motion => <option key={motion} value={motion}>{motion}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-700/50">
                            <button
                                onClick={() => handleDownload(editedVideoUrl!, `utrend_edit_${Date.now()}.mp4`)}
                                disabled={!editedVideoUrl || loading}
                                className="w-full flex items-center justify-center bg-slate-700 text-white font-semibold py-3 px-6 rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50"
                            >
                                <Download className="w-5 h-5 mr-2" /> Download
                            </button>
                             <button
                                onClick={handleStartOver}
                                className="w-full sm:w-auto flex items-center justify-center bg-slate-700 text-white font-semibold py-3 px-6 rounded-lg hover:bg-slate-600 transition-colors"
                            >
                               Start Over
                            </button>
                            <button
                                onClick={handleGenerate}
                                disabled={loading || !frameBase64}
                                className="w-full flex items-center justify-center bg-gradient-to-r from-violet-dark to-violet-light text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 transform hover:-translate-y-px"
                            >
                               {loading ? <Spinner /> : <><RefreshCw className="w-5 h-5 mr-2" /> Generate Edit</>}
                            </button>
                        </div>
                    </div>
                )}
                
                {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
            </div>
        </div>
    );
};
export default VideoEditor;
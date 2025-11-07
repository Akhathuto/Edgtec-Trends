import React, { useState, useRef, useEffect } from 'react';
import { editVideo, checkVideoStatus } from '../services/geminiService';
import Spinner from './Spinner';
import { Star, Scissors, RefreshCw, Download, UploadCloud, Sliders } from './Icons';
import { useAuth } from '../contexts/AuthContext';
import { Tab } from '../types';
import ErrorDisplay from './ErrorDisplay';

const loadingMessages = [
    "Preparing your video for editing...",
    "This can take a few minutes, please wait...",
    "Applying AI magic frame by frame...",
    "Rendering your edited video...",
    "High-quality edits take time!",
];

const visualStyles = ['Default', 'Cinematic', 'Anime', 'Vintage Film', 'Documentary', 'Surreal'];
const specialEffects = ['None', 'Confetti', 'Fireworks', 'VHS Glitch', 'Lens Flare', 'Rain'];
const cameraMotions = ['None', 'Slow Pan Left', 'Slow Zoom In', 'Drone Shot Rising', 'Spinning'];

interface VideoEditorProps {
  setActiveTab: (tab: Tab) => void;
}

const VideoEditor: React.FC<VideoEditorProps> = ({ setActiveTab }) => {
    const { user, addContentToHistory } = useAuth();
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageBase64, setImageBase64] = useState<{ data: string, mimeType: string, url: string } | null>(null);
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
    const [error, setError] = useState<string | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [operation, setOperation] = useState<any | null>(null);
    
    // AI Toolkit State
    const [visualStyle, setVisualStyle] = useState(visualStyles[0]);
    const [specialEffect, setSpecialEffect] = useState(specialEffects[0]);
    const [cameraMotion, setCameraMotion] = useState(cameraMotions[0]);
    
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
                setIsKeySelected(true);
            } finally {
                setKeyCheckLoading(false);
            }
        };
        checkApiKey();
    }, [user?.plan]);

    const handleSelectKey = async () => {
        try {
            await (window as any).aistudio.openSelectKey();
            setIsKeySelected(true);
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
    
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 4 * 1024 * 1024) { setError("Image size should not exceed 4MB."); return; }
            if (!['image/png', 'image/jpeg'].includes(file.type)) { setError("Please upload a PNG or JPG image."); return; }
            
            handleStartOver();
            setImageFile(file);
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                const base64Data = result.split(',')[1];
                setImageBase64({ data: base64Data, mimeType: file.type, url: result });
            };
            reader.readAsDataURL(file);
        }
    };
    
    const pollOperationStatus = (op: any) => {
        pollingInterval.current = setInterval(async () => {
            try {
                const updatedOp = await checkVideoStatus(op);
                setOperation(updatedOp);

                if (updatedOp.done) {
                    cleanupIntervals();
                    const downloadLink = updatedOp.response?.generatedVideos?.[0]?.video?.uri;
                    if (downloadLink) {
                        const response = await fetch(`/api/download?url=${encodeURIComponent(downloadLink)}`);
                        if (!response.ok) throw new Error('Failed to download video from proxy.');
                        const videoBlob = await response.blob();
                        setVideoUrl(URL.createObjectURL(videoBlob));
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
                    setError(e.message || "Failed to check video status.");
                }
                setLoading(false);
                cleanupIntervals();
            }
        }, 10000);
    };

    const handleGenerate = async () => {
        let finalPrompt = prompt;
        if (visualStyle !== 'Default') finalPrompt += ` Apply a ${visualStyle} style.`;
        if (specialEffect !== 'None') finalPrompt += ` Add a ${specialEffect} effect.`;
        if (cameraMotion !== 'None') finalPrompt += ` Use a ${cameraMotion} camera motion.`;
        finalPrompt = finalPrompt.trim();

        if (!finalPrompt || !imageBase64) {
            setError('Please upload an image and provide an animation instruction.');
            return;
        }
        setLoading(true);
        setError(null);
        setVideoUrl(null);
        setOperation(null);
        
        let messageIndex = 0;
        loadingMessageInterval.current = setInterval(() => {
            messageIndex = (messageIndex + 1) % loadingMessages.length;
            setLoadingMessage(loadingMessages[messageIndex]);
        }, 15000);
        
        try {
            const initialOp = await editVideo(finalPrompt, { imageBytes: imageBase64.data, mimeType: imageBase64.mimeType });
            setOperation(initialOp);
            pollOperationStatus(initialOp);
        } catch (e: any) {
            if (e.message?.includes("Requested entity was not found.")) {
                setError("Your API key is invalid. Please select a valid key.");
                setIsKeySelected(false);
            } else {
                setError(e.message || 'An error occurred while starting the video edit.');
            }
            setLoading(false);
            cleanupIntervals();
        }
    };

    const handleStartOver = () => {
        setVideoUrl(null);
        setError(null);
        setOperation(null);
        setPrompt('');
        setImageFile(null);
        setImageBase64(null);
        setVisualStyle(visualStyles[0]);
        setSpecialEffect(specialEffects[0]);
        setCameraMotion(cameraMotions[0]);
    };

    if (user?.plan !== 'pro') {
        return (
            <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-8 shadow-xl text-center flex flex-col items-center animate-slide-in-up">
                <Star className="w-12 h-12 text-yellow-400 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Upgrade to Pro for the AI Video Editor</h2>
                <p className="text-slate-400 mb-6 max-w-md">Animate images into short video clips using text prompts and an advanced AI toolkit.</p>
                <button onClick={() => setActiveTab(Tab.Pricing)} className="button-primary">View Plans</button>
            </div>
        );
    }
    
    if (keyCheckLoading) { return <div className="flex justify-center p-8"><Spinner size="lg" /></div>; }

    if (!isKeySelected) {
        return (
            <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-8 shadow-xl text-center flex flex-col items-center animate-slide-in-up">
                <h2 className="text-2xl font-bold mb-2">API Key Required for Video Editing</h2>
                <p className="text-slate-400 mb-6 max-w-md">To use the AI Video Editor, select a Google AI API key. <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline">Learn about billing.</a></p>
                <button onClick={handleSelectKey} className="button-primary">Select API Key</button>
                <ErrorDisplay message={error} className="mt-4" />
            </div>
        );
    }

    return (
        <div className="animate-slide-in-up">
            <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl">
                <h2 className="text-2xl font-bold text-center mb-1 flex items-center justify-center gap-2"><Scissors className="w-6 h-6 text-violet-400" /> AI Video Editor</h2>
                <p className="text-center text-slate-400 mb-6">Animate an image into a short video clip with text prompts and our AI Toolkit.</p>
                
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                         <label htmlFor="image-upload-editor" className="flex flex-col items-center justify-center w-full aspect-video border-2 border-slate-700 border-dashed rounded-lg cursor-pointer bg-slate-800/50 hover:bg-slate-700/50">
                            {imageBase64 ? <img src={imageBase64.url} alt="Preview" className="w-full h-full object-contain rounded-lg p-1"/> : (
                                <div className="text-center"><UploadCloud className="w-8 h-8 mx-auto mb-2 text-slate-400" /><p>Upload Image</p><p className="text-xs text-slate-500">PNG/JPG, max 4MB</p></div>
                            )}
                            <input id="image-upload-editor" type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleFileChange} />
                        </label>
                        
                        <div className="p-4 bg-slate-900/30 rounded-lg border border-slate-700/50 space-y-3">
                           <h4 className="text-lg font-semibold text-slate-200 flex items-center gap-2"><Sliders className="w-5 h-5 text-violet-400" /> AI Toolkit</h4>
                           <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Main instruction (e.g., 'Make the clouds move slowly')" className="form-input h-16" />
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                               <div><label className="input-label">Visual Style</label><select value={visualStyle} onChange={e => setVisualStyle(e.target.value)} className="form-select"><option disabled>Select Style</option>{visualStyles.map(s=><option key={s}>{s}</option>)}</select></div>
                               <div><label className="input-label">Special Effect</label><select value={specialEffect} onChange={e => setSpecialEffect(e.target.value)} className="form-select"><option disabled>Select Effect</option>{specialEffects.map(s=><option key={s}>{s}</option>)}</select></div>
                               <div className="sm:col-span-2"><label className="input-label">Camera Motion</label><select value={cameraMotion} onChange={e => setCameraMotion(e.target.value)} className="form-select"><option disabled>Select Motion</option>{cameraMotions.map(s=><option key={s}>{s}</option>)}</select></div>
                           </div>
                        </div>
                        
                        <button onClick={handleGenerate} disabled={loading || !imageBase64} className="button-primary w-full">{loading ? <Spinner/> : 'Animate'}</button>
                         <ErrorDisplay message={error} />
                    </div>
                     <div className="flex flex-col">
                        <div className="w-full aspect-video bg-black/20 rounded-lg flex items-center justify-center">
                            {loading && <div className="text-center p-4"><Spinner size="lg"/><p className="mt-4 text-slate-300">{loadingMessage}</p></div>}
                            {videoUrl && <video src={videoUrl} controls autoPlay loop className="w-full h-full rounded-lg"/>}
                            {!loading && !videoUrl && <p className="text-slate-500">Your video will appear here</p>}
                        </div>
                        <div className="flex gap-2 mt-4">
                             <button onClick={() => { if(videoUrl){ const a=document.createElement('a'); a.href=videoUrl; a.download=`utrend_video_edit.mp4`; a.click(); } }} disabled={!videoUrl} className="button-secondary w-full"><Download className="w-4 h-4 mr-2"/> Download</button>
                             <button onClick={handleStartOver} className="button-secondary w-full">Start Over</button>
                        </div>
                    </div>
                 </div>
            </div>
        </div>
    );
};

export default VideoEditor;

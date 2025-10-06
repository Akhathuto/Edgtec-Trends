import React, { useState, useRef, useEffect } from 'react';
import { generateGif, checkVideoStatus } from '../services/geminiService.ts';
import Spinner from './Spinner.tsx';
import { Star, RefreshCw, Gif, Download } from './Icons.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { Tab } from '../types.ts';

const loadingMessages = [
    "Assembling your GIF...",
    "This can take a few minutes, please wait...",
    "Finding the perfect loop point...",
    "Rendering your masterpiece...",
    "High-quality GIFs take time!",
];

interface GifCreatorProps {
  setActiveTab: (tab: Tab) => void;
}

const GifCreator: React.FC<GifCreatorProps> = ({ setActiveTab }) => {
    const { user, logActivity, addContentToHistory } = useAuth();
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
    const [error, setError] = useState<string | null>(null);
    const [gifUrl, setGifUrl] = useState<string | null>(null);
    const [operation, setOperation] = useState<any | null>(null);
    
    const pollingInterval = useRef<ReturnType<typeof setInterval> | null>(null);
    const loadingMessageInterval = useRef<ReturnType<typeof setInterval> | null>(null);

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
                        setLoadingMessage("Fetching your GIF...");
                        // FIX: Switched to process.env.API_KEY per guidelines.
                        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
                        const videoBlob = await response.blob();
                        const url = URL.createObjectURL(videoBlob);
                        setGifUrl(url);
                        addContentToHistory({
                            type: 'GIF',
                            summary: `GIF generated with prompt: "${prompt}"`,
                            content: { prompt }
                        });
                    } else {
                        setError("GIF generation finished, but no media was returned.");
                    }
                    setLoading(false);
                }
            } catch (e: any) {
                setError(e.message || "Failed to check GIF status. Please try again.");
                setLoading(false);
                cleanupIntervals();
            }
        }, 10000); // Poll every 10 seconds
    };

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError('Please enter a prompt to generate a GIF.');
            return;
        }
        setLoading(true);
        setError(null);
        setGifUrl(null);
        setOperation(null);
        setLoadingMessage(loadingMessages[0]);
        
        let messageIndex = 0;
        loadingMessageInterval.current = setInterval(() => {
            messageIndex = (messageIndex + 1) % loadingMessages.length;
            setLoadingMessage(loadingMessages[messageIndex]);
        }, 15000);

        try {
            const initialOp = await generateGif(prompt);
            setOperation(initialOp);
            pollOperationStatus(initialOp);
            logActivity(`started generating a GIF for prompt: "${prompt.substring(0, 30)}..."`, 'Gif');
        } catch (e: any) {
            setError(e.message || 'An error occurred while starting the GIF generation.');
            setLoading(false);
            cleanupIntervals();
        }
    };

    const handleStartOver = () => {
        setGifUrl(null);
        setError(null);
        setOperation(null);
        setPrompt('');
    }
    
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
            setError("Failed to download GIF. Please try again.");
            console.error(err);
        }
    };

    if (user?.plan !== 'pro') {
        return (
            <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-8 shadow-xl backdrop-blur-xl text-center flex flex-col items-center animate-slide-in-up">
                <Star className="w-12 h-12 text-yellow-400 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Upgrade to Pro for the AI GIF Creator</h2>
                <p className="text-slate-400 mb-6 max-w-md">The GIF Creator is a Pro feature. Upgrade your account to create your own animated GIFs.</p>
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
                <h2 className="text-2xl font-bold text-center mb-1 text-slate-100 flex items-center justify-center gap-2">
                    <Gif className="w-6 h-6 text-violet-400" /> AI GIF Creator
                </h2>
                <p className="text-center text-slate-400 mb-6">{gifUrl ? "Your GIF is ready!" : "Create short, looping GIFs from a text prompt."}</p>
                
                {(!loading && !gifUrl) && (
                    <div className="space-y-4">
                        <textarea
                            id="gif-prompt"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., 'A cat typing furiously on a laptop, funny, pixel art'"
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-violet-light transition-all h-32 resize-none shadow-inner"
                            title="Describe the GIF you want to create."
                        />
                        <button
                            onClick={handleGenerate}
                            disabled={loading}
                            className="w-full flex items-center justify-center bg-gradient-to-r from-violet-dark to-violet-light text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 shadow-md hover:shadow-lg hover:shadow-violet/30 transform hover:-translate-y-px"
                            title="Start generating the GIF. This may take a few minutes."
                        >
                           <Gif className="w-5 h-5 mr-2" /> Generate GIF
                        </button>
                    </div>
                )}
                
                {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
            </div>

            {loading && (
                <div className="text-center py-10 bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl mt-8">
                    <Spinner size="lg" />
                    <p className="mt-4 text-slate-300 font-semibold text-lg animate-text-fade-cycle">{loadingMessage}</p>
                    <p className="mt-2 text-slate-400 text-sm">Please keep this tab open. GIF generation is in progress.</p>
                </div>
            )}

            {gifUrl && (
                <div className="mt-8 bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl animate-fade-in">
                    <h3 className="text-2xl font-bold mb-4 text-center text-slate-100">Your GIF is Ready!</h3>
                    <video controls autoPlay loop className="w-full rounded-lg mb-4 bg-black shadow-lg">
                        <source src={gifUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={() => handleDownload(gifUrl, `utrend_gif_${Date.now()}.mp4`)}
                            className="w-full flex items-center justify-center bg-slate-700 text-white font-semibold py-3 px-6 rounded-lg hover:bg-slate-600 transition-colors"
                        >
                           <Download className="w-5 h-5 mr-2" /> Download GIF
                        </button>
                        <button
                            onClick={handleStartOver}
                            className="w-full flex items-center justify-center bg-slate-700 text-white font-semibold py-3 px-6 rounded-lg hover:bg-slate-600 transition-colors"
                        >
                           Start Over
                        </button>
                        <button
                            onClick={handleGenerate}
                            disabled={loading}
                            className="w-full flex items-center justify-center bg-gradient-to-r from-violet-dark to-violet-light text-white font-semibold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                           <RefreshCw className="w-5 h-5 mr-2" /> Regenerate
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
export default GifCreator;
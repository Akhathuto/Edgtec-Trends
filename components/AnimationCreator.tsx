import React, { useState, useRef, useEffect } from 'react';
import { generateAnimation, checkVideoStatus } from '../services/geminiService';
import Spinner from './Spinner';
import { Star, Clapperboard, RefreshCw, Download } from './Icons';
import { useAuth } from '../contexts/AuthContext';
import { Tab } from '../types';
import ErrorDisplay from './ErrorDisplay';

const loadingMessages = [
    "Warming up the animation studio...",
    "This can take a few minutes, please wait...",
    "Drawing frames and adding color...",
    "Rendering your animation sequence...",
    "Still working... high-quality animation takes time!",
];

const animationStyles = ['2D Cartoon', '3D Render', 'Claymation', 'Anime Style', 'Stop Motion'];

const animationTemplates: { name: string; prompt: string; }[] = [
  { name: 'Select a Template...', prompt: '' },
  { name: 'Explainer Video', prompt: 'A simple, animated explainer video about [YOUR TOPIC] using clean graphics and on-screen text.' },
  { name: 'Logo Reveal', prompt: 'A dynamic logo reveal for a brand named [BRAND NAME]. It should feature particles and light effects.' },
  { name: 'Character Action', prompt: 'A character animation of a [CHARACTER DESCRIPTION] performing a [SPECIFIC ACTION].' },
  { name: 'Abstract Loop', prompt: 'A seamlessly looping abstract animation with geometric shapes morphing and changing colors.' },
  { name: 'Product Demo', prompt: 'An animated showcase of a [PRODUCT], highlighting its key features with callouts.'},
];


interface AnimationCreatorProps {
  setActiveTab: (tab: Tab) => void;
}

const AnimationCreator: React.FC<AnimationCreatorProps> = ({ setActiveTab }) => {
    const { user, logActivity, addContentToHistory } = useAuth();
    const [prompt, setPrompt] = useState('');
    const [animationStyle, setAnimationStyle] = useState(animationStyles[0]);
    const [aspectRatio, setAspectRatio] = useState('16:9');
    const [resolution, setResolution] = useState('1080p');
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
    const [error, setError] = useState<string | null>(null);
    const [animationUrl, setAnimationUrl] = useState<string | null>(null);
    const [operation, setOperation] = useState<any | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState(animationTemplates[0].name);
    
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

    const pollOperationStatus = (op: any) => {
        pollingInterval.current = setInterval(async () => {
            try {
                const updatedOp = await checkVideoStatus(op);
                setOperation(updatedOp);

                if (updatedOp.done) {
                    cleanupIntervals();
                    const downloadLink = updatedOp.response?.generatedVideos?.[0]?.video?.uri;
                    if (downloadLink) {
                        setLoadingMessage("Fetching your animation...");
                        const response = await fetch(`/api/download?url=${encodeURIComponent(downloadLink)}`);
                        if (!response.ok) throw new Error('Failed to download animation from proxy.');
                        const videoBlob = await response.blob();
                        const url = URL.createObjectURL(videoBlob);
                        setAnimationUrl(url);
                        addContentToHistory({
                            type: 'Animation',
                            summary: `Animation: "${prompt}" in ${animationStyle} style`,
                            content: { prompt, style: animationStyle, aspectRatio, resolution }
                        });
                    } else {
                        setError("Animation generation finished, but no media was returned.");
                    }
                    setLoading(false);
                }
            } catch (e: any) {
                if (e.message?.includes("Requested entity was not found.")) {
                    setError("Your API key may be invalid. Please select a valid key.");
                    setIsKeySelected(false);
                } else {
                    setError(e.message || "Failed to check animation status. Please try again.");
                }
                setLoading(false);
                cleanupIntervals();
            }
        }, 10000); // Poll every 10 seconds
    };
    
    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError('Please enter a prompt for your animation.');
            return;
        }
        setLoading(true);
        setError(null);
        setAnimationUrl(null);
        setOperation(null);
        setLoadingMessage(loadingMessages[0]);
        
        let messageIndex = 0;
        loadingMessageInterval.current = setInterval(() => {
            messageIndex = (messageIndex + 1) % loadingMessages.length;
            setLoadingMessage(loadingMessages[messageIndex]);
        }, 15000);

        try {
            const initialOp = await generateAnimation(prompt, animationStyle, aspectRatio, resolution);
            setOperation(initialOp);
            pollOperationStatus(initialOp);
            logActivity(`started generating an animation: "${prompt.substring(0, 30)}..."`, 'Clapperboard');
        } catch (e: any) {
             if (e.message?.includes("Requested entity was not found.")) {
                setError("Your API key is invalid. Please select a valid key.");
                setIsKeySelected(false);
            } else {
                setError(e.message || 'An error occurred while starting the animation.');
            }
            setLoading(false);
            cleanupIntervals();
        }
    };

    const handleStartOver = () => {
        setAnimationUrl(null);
        setError(null);
        setOperation(null);
        setPrompt('');
        setSelectedTemplate(animationTemplates[0].name);
        setAnimationStyle(animationStyles[0]);
        setAspectRatio('16:9');
        setResolution('1080p');
    }
    
    const handleDownload = (url: string, filename: string) => {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };
    
    const handleTemplateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const templateName = event.target.value;
        setSelectedTemplate(templateName);
        const template = animationTemplates.find(t => t.name === templateName);
        if (template) {
            setPrompt(template.prompt);
        }
    };

    if (user?.plan !== 'pro') {
        return (
            <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-8 shadow-xl backdrop-blur-xl text-center flex flex-col items-center animate-slide-in-up">
                <Star className="w-12 h-12 text-yellow-400 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Upgrade to Pro for the Animation Creator</h2>
                <p className="text-slate-400 mb-6 max-w-md">The Animation Creator is a Pro feature. Upgrade your account to start creating custom animations.</p>
                <button
                    onClick={() => setActiveTab(Tab.Pricing)}
                    className="button-primary"
                    title="View subscription plans to upgrade"
                >
                    View Plans
                </button>
            </div>
        )
    }

    if (keyCheckLoading) {
        return <div className="flex justify-center p-8"><Spinner size="lg" /></div>;
    }
    
    if (!isKeySelected) {
        return (
            <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-8 shadow-xl backdrop-blur-xl text-center flex flex-col items-center animate-slide-in-up">
                <h2 className="text-2xl font-bold mb-2">API Key Required for Animation</h2>
                <p className="text-slate-400 mb-6 max-w-md">
                    To use the AI Animation Creator, you need to select a Google AI API key.
                    <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline ml-1">Learn about billing.</a>
                </p>
                <button onClick={handleSelectKey} className="button-primary">Select API Key</button>
                <ErrorDisplay message={error} className="mt-4" />
            </div>
        );
    }

    return (
        <div className="animate-slide-in-up">
            <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl">
                <h2 className="text-2xl font-bold text-center mb-1 text-slate-100 flex items-center justify-center gap-2">
                    <Clapperboard className="w-6 h-6 text-violet-400" /> AI Animation Creator
                </h2>
                <p className="text-center text-slate-400 mb-6">{animationUrl ? "Your animation is ready!" : "Create custom animated clips from a text prompt."}</p>
                
                {(!loading && !animationUrl) && (
                    <div className="space-y-4">
                        <select
                            value={selectedTemplate}
                            onChange={handleTemplateChange}
                            className="form-select"
                            title="Choose a template to get started with a pre-filled prompt. (Pro Feature)"
                        >
                            {animationTemplates.map((template, index) => (
                                <option key={index} value={template.name}>
                                    {template.name}
                                </option>
                            ))}
                        </select>
                        <textarea
                            id="animation-prompt"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., 'A robot holding a red skateboard.'"
                            className="form-input h-32"
                            title="Describe the animation you want to create. (Pro Feature)"
                        />
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <div>
                                <label htmlFor="animation-style" className="block text-sm font-medium text-slate-300 mb-1">Animation Style</label>
                                <select
                                    id="animation-style"
                                    value={animationStyle}
                                    onChange={(e) => setAnimationStyle(e.target.value)}
                                    className="form-select"
                                    title="Select the animation style. (Pro Feature)"
                                >
                                    {animationStyles.map(style => <option key={style} value={style}>{style}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="aspect-ratio" className="block text-sm font-medium text-slate-300 mb-1">Aspect Ratio</label>
                                <select
                                    id="aspect-ratio"
                                    value={aspectRatio}
                                    onChange={(e) => setAspectRatio(e.target.value)}
                                    className="form-select"
                                    title="Select the aspect ratio. (Pro Feature)"
                                >
                                    <option value="16:9">16:9 (Landscape)</option>
                                    <option value="9:16">9:16 (Portrait)</option>
                                </select>
                            </div>
                             <div>
                                <label htmlFor="resolution" className="block text-sm font-medium text-slate-300 mb-1">Resolution</label>
                                <select
                                    id="resolution"
                                    value={resolution}
                                    onChange={(e) => setResolution(e.target.value)}
                                    className="form-select"
                                    title="Select the video resolution. (Pro Feature)"
                                >
                                    <option value="1080p">1080p (High)</option>
                                    <option value="720p">720p (Standard)</option>
                                </select>
                            </div>
                        </div>
                        <button
                            onClick={handleGenerate}
                            disabled={loading}
                            className="button-primary w-full"
                            title="Start generating the animation. This may take a few minutes. (Pro Feature)"
                        >
                           <Clapperboard className="w-5 h-5 mr-2" /> Generate Animation
                        </button>
                    </div>
                )}
                
                <ErrorDisplay message={error} className="mt-4" />
            </div>

            {loading && (
                <div className="text-center py-10 bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl mt-8">
                    <Spinner size="lg" />
                    <p className="mt-4 text-slate-300 font-semibold text-lg animate-text-fade-cycle">{loadingMessage}</p>
                    <p className="mt-2 text-slate-400 text-sm">Please keep this tab open. Animation is in progress.</p>
                </div>
            )}

            {animationUrl && (
                <div className="mt-8 bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl animate-fade-in">
                    <h3 className="text-2xl font-bold mb-4 text-center text-slate-100">Your Animation is Ready!</h3>
                    <video controls autoPlay loop className="w-full rounded-lg mb-4 bg-black shadow-lg">
                        <source src={animationUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={() => handleDownload(animationUrl, `utrend_animation_${Date.now()}.mp4`)}
                            className="button-secondary w-full"
                            title="Download the generated animation as an MP4 file"
                        >
                           <Download className="w-5 h-5 mr-2" /> Download
                        </button>
                        <button
                            onClick={handleStartOver}
                            className="button-secondary w-full"
                            title="Clear the prompt and start a new animation"
                        >
                           Start Over
                        </button>
                        <button
                            onClick={handleGenerate}
                            disabled={loading}
                            className="button-primary w-full"
                            title="Generate a new animation with the same prompt"
                        >
                           <RefreshCw className="w-5 h-5 mr-2" /> Regenerate
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnimationCreator;
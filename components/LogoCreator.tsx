
'use client';

import React, { useState, useCallback } from 'react';
import { generateLogo } from '../services/geminiService';
import Spinner from './Spinner';
import { Star, RefreshCw, PenTool, Download } from './Icons';
import { useAuth } from '../contexts/AuthContext';
import { Tab } from '../types';
import GalleryModal from './GalleryModal';
import ErrorDisplay from './ErrorDisplay';

const logoStyles = ['Minimalist', 'Mascot', 'Abstract', 'Wordmark', 'Geometric', 'Vintage'];

interface LogoCreatorProps {
  setActiveTab: (tab: Tab) => void;
}

// FIX: Changed to a named export to resolve module resolution error.
export const LogoCreator: React.FC<LogoCreatorProps> = ({ setActiveTab }) => {
    const { user, logActivity, addContentToHistory } = useAuth();
    const [prompt, setPrompt] = useState('');
    const [logoStyle, setLogoStyle] = useState(logoStyles[0]);
    const [transparentBg, setTransparentBg] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [logoBase64, setLogoBase64] = useState<string | null>(null);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    
    const handleGenerate = useCallback(async () => {
        if (!prompt.trim()) {
            setError('Please describe your brand or channel.');
            return;
        }
        setLoading(true);
        setError(null);
        setLogoBase64(null);

        try {
            const result = await generateLogo(prompt, logoStyle, transparentBg);
            setLogoBase64(result);
            addContentToHistory({
                type: 'Logo',
                summary: `Logo for "${prompt.substring(0, 30)}..."`,
                content: { prompt, style: logoStyle, transparentBg, logoBase64: result }
            });
            logActivity(`generated a ${logoStyle} logo for "${prompt.substring(0, 30)}..."`, 'PenTool');
        } catch (e: any) {
            setError(e.message || 'An error occurred while generating the logo.');
        } finally {
            setLoading(false);
        }
    }, [prompt, logoStyle, transparentBg, addContentToHistory, logActivity]);

    const handleDownloadLogo = () => {
        if (!logoBase64) return;
        const link = document.createElement('a');
        link.href = `data:image/png;base64,${logoBase64}`;
        link.download = `utrend_logo_${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleStartOver = () => {
        setLogoBase64(null);
        setError(null);
        setPrompt('');
        setLogoStyle(logoStyles[0]);
        setTransparentBg(true);
    }

    if (user?.plan !== 'pro') {
        return (
            <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-8 shadow-xl backdrop-blur-xl text-center flex flex-col items-center animate-slide-in-up">
                <Star className="w-12 h-12 text-yellow-400 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Upgrade to Pro for the AI Logo Creator</h2>
                <p className="text-slate-400 mb-6 max-w-md">The Logo Creator is a Pro feature. Upgrade your account to create a unique logo for your brand.</p>
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
                    <PenTool className="w-6 h-6 text-violet-400" /> AI Logo Creator
                </h2>
                <p className="text-center text-slate-400 mb-6">{logoBase64 ? "Your logo is ready!" : "Create a professional logo for your brand."}</p>
                
                {(!loading && !logoBase64) && (
                    <div className="space-y-4">
                         <div className="grid grid-cols-2 gap-4">
                             <div>
                                 <label htmlFor="logo-style" className="block text-sm font-medium text-slate-300 mb-1">Logo Style</label>
                                 <select
                                    id="logo-style"
                                    value={logoStyle}
                                    onChange={(e) => setLogoStyle(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-violet-light transition-all"
                                    title="Select the overall style for your logo design"
                                 >
                                    {logoStyles.map(style => <option key={style} value={style}>{style}</option>)}
                                 </select>
                            </div>
                            <div className="flex items-end pb-1.5">
                                <div className="flex items-center">
                                    <input
                                        id="transparent-bg"
                                        type="checkbox"
                                        checked={transparentBg}
                                        onChange={(e) => setTransparentBg(e.target.checked)}
                                        title="Check this to generate a logo with a transparent background (PNG)"
                                        className="w-4 h-4 text-violet-600 bg-slate-700 border-slate-500 rounded focus:ring-violet-500"
                                    />
                                    <label htmlFor="transparent-bg" className="ml-2 text-sm font-medium text-slate-300">Transparent Background</label>
                                </div>
                            </div>
                        </div>
                        <textarea
                            id="logo-prompt"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., 'A witty fox wearing headphones for a gaming channel called FoxyPlays'"
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-violet-light transition-all h-32 resize-none shadow-inner"
                            title="Describe your channel or brand."
                        />
                        <button
                            onClick={handleGenerate}
                            disabled={loading}
                            className="w-full flex items-center justify-center bg-gradient-to-r from-violet-dark to-violet-light text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 shadow-md hover:shadow-lg hover:shadow-violet/30 transform hover:-translate-y-px"
                            title="Generate your logo."
                        >
                           <PenTool className="w-5 h-5 mr-2" /> Generate Logo
                        </button>
                    </div>
                )}
                
                <ErrorDisplay message={error} className="mt-4" />
            </div>

            {loading && (
                <div className="text-center py-10 bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl mt-8">
                    <Spinner size="lg" />
                    <p className="mt-4 text-slate-300 font-semibold text-lg animate-text-fade-cycle">Designing your logo...</p>
                </div>
            )}

            {logoBase64 && (
                <div className="mt-8 bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl animate-fade-in">
                    <h3 className="text-2xl font-bold mb-4 text-center text-slate-100">Your Logo is Ready!</h3>
                    <div className="flex justify-center mb-4">
                        <button 
                            onClick={() => setIsGalleryOpen(true)}
                            className="w-64 h-64 rounded-lg bg-white shadow-lg p-2 group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-violet-500"
                            aria-label="View generated logo in gallery"
                            title="View a larger preview of your logo"
                        >
                            <img 
                                src={`data:image/png;base64,${logoBase64}`}
                                alt="Generated Logo"
                                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                            />
                        </button>
                    </div>
                     <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={handleDownloadLogo}
                            className="w-full flex items-center justify-center bg-slate-700 text-white font-semibold py-3 px-6 rounded-lg hover:bg-slate-600 transition-colors"
                            title="Download the generated logo as a PNG file"
                        >
                           <Download className="w-5 h-5 mr-2" /> Download
                        </button>
                        <button
                            onClick={handleStartOver}
                            className="w-full flex items-center justify-center bg-slate-700 text-white font-semibold py-3 px-6 rounded-lg hover:bg-slate-600 transition-colors"
                            title="Clear the prompt and settings to start over"
                        >
                           Start Over
                        </button>
                        <button
                            onClick={handleGenerate}
                            disabled={loading}
                            className="w-full flex items-center justify-center bg-gradient-to-r from-violet-dark to-violet-light text-white font-semibold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                            title="Generate a new logo with the same prompt and settings"
                        >
                           <RefreshCw className="w-5 h-5 mr-2" /> Regenerate
                        </button>
                    </div>
                </div>
            )}
             <GalleryModal 
                isOpen={isGalleryOpen}
                onClose={() => setIsGalleryOpen(false)}
                imageUrl={logoBase64 ? `data:image/png;base64,${logoBase64}` : null}
                altText="Generated Logo"
            />
        </div>
    );
};

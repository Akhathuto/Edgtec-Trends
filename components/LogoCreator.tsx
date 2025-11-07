import React, { useState, useCallback } from 'react';
import { generateLogo } from '../services/geminiService';
import Spinner from './Spinner';
import { Star, Wand, RefreshCw, Download } from './Icons';
import { useAuth } from '../contexts/AuthContext';
import { Tab } from '../types';
import ErrorDisplay from './ErrorDisplay';
import GalleryModal from './GalleryModal';

const logoStyles = ['Minimalist', 'Geometric', 'Abstract', 'Vintage', 'Modern', 'Hand-drawn', 'Futuristic'];

interface LogoCreatorProps {
  setActiveTab: (tab: Tab) => void;
}

export const LogoCreator: React.FC<LogoCreatorProps> = ({ setActiveTab }) => {
    const { user, addContentToHistory } = useAuth();
    const [prompt, setPrompt] = useState('');
    const [style, setStyle] = useState(logoStyles[0]);
    const [transparentBg, setTransparentBg] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [logo, setLogo] = useState<{ base64: string, prompt: string, style: string, aspectRatio: string } | null>(null);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);

    const handleGenerate = useCallback(async () => {
        if (!prompt.trim()) {
            setError('Please enter a prompt for your logo.');
            return;
        }
        setLoading(true);
        setError(null);
        setLogo(null);
        try {
            const result = await generateLogo(prompt, style, transparentBg);
            const newLogo = { base64: result, prompt, style, aspectRatio: '1:1' };
            setLogo(newLogo);
            addContentToHistory({
                type: 'Logo',
                summary: `Logo for "${prompt}" in ${style} style`,
                content: { prompt, style, transparentBg, logoBase64: result }
            });
        } catch (e: any) {
            setError(e.message || 'An error occurred while generating the logo.');
        } finally {
            setLoading(false);
        }
    }, [prompt, style, transparentBg, addContentToHistory]);

    const handleDownload = () => {
        if (!logo) return;
        const link = document.createElement('a');
        link.href = `data:image/png;base64,${logo.base64}`;
        link.download = `utrend_logo_${prompt.replace(/\s+/g, '_')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (user?.plan !== 'pro') {
        return (
            <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-8 shadow-xl backdrop-blur-xl text-center flex flex-col items-center animate-slide-in-up">
                <Star className="w-12 h-12 text-yellow-400 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Upgrade to Pro for the AI Logo Creator</h2>
                <p className="text-slate-400 mb-6 max-w-md">The AI Logo Creator is a Pro feature. Upgrade to design a professional logo for your brand.</p>
                <button onClick={() => setActiveTab(Tab.Pricing)} className="button-primary">View Plans</button>
            </div>
        );
    }
    
    return (
      <>
        <div className="animate-slide-in-up">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl">
                    <h2 className="text-2xl font-bold mb-1 text-slate-100 flex items-center gap-2"><Wand className="w-6 h-6 text-violet-400" /> Logo Creator</h2>
                    <p className="text-slate-400 mb-6">Design your brand's logo in seconds.</p>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="logo-prompt" className="input-label">Prompt</label>
                            <textarea id="logo-prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="e.g., A minimalist fox icon for a tech company" className="form-input h-24" />
                        </div>
                        <div>
                            <label htmlFor="logo-style" className="input-label">Style</label>
                            <select id="logo-style" value={style} onChange={(e) => setStyle(e.target.value)} className="form-select">
                                {logoStyles.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="flex items-center">
                            <input id="transparent-bg" type="checkbox" checked={transparentBg} onChange={(e) => setTransparentBg(e.target.checked)} className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-violet-600 focus:ring-violet-500" />
                            <label htmlFor="transparent-bg" className="ml-2 block text-sm text-slate-300">Transparent Background</label>
                        </div>
                        <button onClick={handleGenerate} disabled={loading} className="button-primary w-full">{loading ? <Spinner/> : 'Generate Logo'}</button>
                    </div>
                    <ErrorDisplay message={error} className="mt-4" />
                </div>
                <div className="md:col-span-2 bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl flex flex-col items-center justify-center">
                     <button onClick={() => logo && setIsGalleryOpen(true)} className="w-full max-w-md aspect-square bg-slate-800/50 rounded-lg flex items-center justify-center relative overflow-hidden cursor-pointer" style={{ backgroundImage: transparentBg ? `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none'%3e%3cpath d='M0 0h16v16H0z' fill='%23334155'/%3e%3cpath d='M16 16h16v16H16z' fill='%23334155'/%3e%3c/svg%3e")` : 'none' }}>
                        {loading && <Spinner size="lg" />}
                        {logo && <img src={`data:image/png;base64,${logo.base64}`} alt="Generated logo" className="w-full h-full object-contain" />}
                        {!loading && !logo && <p className="text-slate-500">Your logo will appear here</p>}
                    </button>
                     <div className="flex gap-4 mt-6 w-full max-w-md">
                        <button onClick={handleDownload} disabled={!logo || loading} className="button-secondary w-full"><Download className="w-4 h-4 mr-2"/> Download</button>
                        <button onClick={handleGenerate} disabled={loading} className="button-primary w-full"><RefreshCw className="w-4 h-4 mr-2"/> Regenerate</button>
                    </div>
                </div>
            </div>
        </div>
         <GalleryModal 
            isOpen={isGalleryOpen}
            onClose={() => setIsGalleryOpen(false)}
            images={logo ? [logo] : []}
            startIndex={0}
        />
      </>
    );
};
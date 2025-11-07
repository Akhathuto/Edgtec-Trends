import React, { useState, useCallback } from 'react';
import { generateImage } from '../services/geminiService';
import Spinner from './Spinner';
import { Star, Image } from './Icons';
import { useAuth } from '../contexts/AuthContext';
import { Tab } from '../types';
import ErrorDisplay from './ErrorDisplay';
import GalleryModal from './GalleryModal';

const imageStyles = ['Photorealistic', 'Cinematic', 'Vintage Film', 'Anime', 'Documentary', 'Hyperlapse', 'Claymation', 'Black and White', 'Vibrant Colors', 'Pixel Art'];
const aspectRatios = ['1:1', '16:9', '9:16', '4:3', '3:4'];

interface GeneratedImage {
    base64: string;
    prompt: string;
    style: string;
    aspectRatio: string;
}

interface ImageGeneratorProps {
  setActiveTab: (tab: Tab) => void;
}

export const ImageGenerator: React.FC<ImageGeneratorProps> = ({ setActiveTab }) => {
    const { user, addContentToHistory } = useAuth();
    const [prompt, setPrompt] = useState('');
    const [style, setStyle] = useState(imageStyles[0]);
    const [aspectRatio, setAspectRatio] = useState(aspectRatios[0]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sessionImages, setSessionImages] = useState<GeneratedImage[]>([]);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

    const handleGenerate = useCallback(async () => {
        if (!prompt.trim()) {
            setError('Please enter a prompt for your image.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const result = await generateImage(prompt, style, aspectRatio);
            const newImage: GeneratedImage = { base64: result, prompt, style, aspectRatio };
            setSessionImages(prev => [newImage, ...prev]);
            addContentToHistory({
                type: 'Generated Image',
                summary: `Image: "${prompt}"`,
                content: { ...newImage }
            });
        } catch (e: any) {
            setError(e.message || 'An error occurred while generating the image.');
        } finally {
            setLoading(false);
        }
    }, [prompt, style, aspectRatio, addContentToHistory]);

    const openGallery = (index: number) => {
        setSelectedImageIndex(index);
        setIsGalleryOpen(true);
    };

    if (user?.plan !== 'pro') {
        return (
            <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-8 shadow-xl backdrop-blur-xl text-center flex flex-col items-center animate-slide-in-up">
                <Star className="w-12 h-12 text-yellow-400 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Upgrade to Pro for the AI Image Generator</h2>
                <p className="text-slate-400 mb-6 max-w-md">The Image Generator is a Pro feature. Upgrade your account to create stunning, unique images from text.</p>
                <button onClick={() => setActiveTab(Tab.Pricing)} className="button-primary">View Plans</button>
            </div>
        );
    }
    
    return (
        <>
            <div className="animate-slide-in-up">
                <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl">
                    <h2 className="text-2xl font-bold text-center mb-1 text-slate-100 flex items-center justify-center gap-2"><Image className="w-6 h-6 text-violet-400" /> AI Image Generator</h2>
                    <p className="text-center text-slate-400 mb-6">Create stunning visuals from a simple text prompt.</p>
                    <div className="space-y-4 max-w-2xl mx-auto">
                        <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="e.g., A majestic cat astronaut exploring a neon-lit alien jungle" className="form-input h-24" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="input-label">Style</label>
                                <select value={style} onChange={(e) => setStyle(e.target.value)} className="form-select">
                                    {imageStyles.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="input-label">Aspect Ratio</label>
                                <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} className="form-select">
                                    {aspectRatios.map(ar => <option key={ar} value={ar}>{ar}</option>)}
                                </select>
                            </div>
                        </div>
                        <button onClick={handleGenerate} disabled={loading} className="button-primary w-full">{loading ? <Spinner/> : 'Generate Image'}</button>
                    </div>
                    <ErrorDisplay message={error} className="mt-4" />
                </div>

                {loading && (
                    <div className="mt-8 text-center">
                        <Spinner size="lg"/>
                        <p className="text-slate-400 mt-2">Generating your image...</p>
                    </div>
                )}
                
                {sessionImages.length > 0 && (
                    <div className="mt-8">
                         <h3 className="text-xl font-bold text-slate-200 mb-4">Your Generated Images</h3>
                         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {sessionImages.map((img, i) => (
                                <button key={i} onClick={() => openGallery(i)} className="aspect-square bg-slate-800 rounded-lg overflow-hidden group relative">
                                    <img src={`data:image/png;base64,${img.base64}`} alt={img.prompt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <p className="text-white text-xs p-2 text-center line-clamp-3">{img.prompt}</p>
                                    </div>
                                </button>
                            ))}
                         </div>
                    </div>
                )}
            </div>
            <GalleryModal 
                isOpen={isGalleryOpen}
                onClose={() => setIsGalleryOpen(false)}
                images={sessionImages}
                startIndex={selectedImageIndex}
            />
        </>
    );
};
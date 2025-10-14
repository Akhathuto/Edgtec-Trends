import React, { useState, useCallback } from 'react';
import { generateImage } from '../services/geminiService';
import Spinner from './Spinner';
import { Star, RefreshCw, Image as ImageIcon, Download } from './Icons';
import { useAuth } from '../contexts/AuthContext';
import { Tab } from '../types';
import GalleryModal from './GalleryModal';
import ErrorDisplay from './ErrorDisplay';

const imageStyles = ['Photorealistic', 'Digital Art', 'Fantasy', 'Sci-Fi', 'Watercolor', 'Minimalist', 'Cyberpunk', 'Pixel Art'];
const aspectRatios = ['1:1', '16:9', '9:16', '4:3', '3:4'];

interface ImageGeneratorProps {
  setActiveTab: (tab: Tab) => void;
}

export const ImageGenerator: React.FC<ImageGeneratorProps> = ({ setActiveTab }) => {
    const { user, logActivity, addContentToHistory } = useAuth();
    const [prompt, setPrompt] = useState('');
    const [imageStyle, setImageStyle] = useState(imageStyles[0]);
    const [aspectRatio, setAspectRatio] = useState(aspectRatios[0]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    
    const handleGenerate = useCallback(async () => {
        if (!prompt.trim()) {
            setError('Please enter a prompt to generate an image.');
            return;
        }
        setLoading(true);
        setError(null);
        setImageBase64(null);

        try {
            const result = await generateImage(prompt, imageStyle, aspectRatio);
            setImageBase64(result);
            addContentToHistory({
                type: 'Generated Image',
                summary: `Image for "${prompt.substring(0, 30)}..."`,
                content: { prompt, style: imageStyle, aspectRatio, imageBase64: result }
            });
            logActivity(`generated a ${imageStyle} image for "${prompt.substring(0, 30)}..."`, 'Image');
        } catch (e: any) {
            setError(e.message || 'An error occurred while generating the image.');
        } finally {
            setLoading(false);
        }
    }, [prompt, imageStyle, aspectRatio, addContentToHistory, logActivity]);

    const handleDownloadImage = () => {
        if (!imageBase64) return;
        const link = document.createElement('a');
        link.href = `data:image/png;base64,${imageBase64}`;
        link.download = `utrend_image_${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleStartOver = () => {
        setImageBase64(null);
        setError(null);
        setPrompt('');
        setImageStyle(imageStyles[0]);
        setAspectRatio(aspectRatios[0]);
    }

    if (user?.plan !== 'pro') {
        return (
            <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-8 shadow-xl backdrop-blur-xl text-center flex flex-col items-center animate-slide-in-up">
                <Star className="w-12 h-12 text-yellow-400 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Upgrade to Pro for the AI Image Generator</h2>
                <p className="text-slate-400 mb-6 max-w-md">The Image Generator is a Pro feature. Upgrade your account to create unique images from text.</p>
                <button
                    onClick={() => setActiveTab(Tab.Pricing)}
                    className="button-primary"
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
                    <ImageIcon className="w-6 h-6 text-violet-400" /> AI Image Generator
                </h2>
                <p className="text-center text-slate-400 mb-6">{imageBase64 ? "Your image is ready!" : "Create unique images from a text prompt."}</p>
                
                {(!loading && !imageBase64) && (
                    <div className="space-y-4">
                         <div className="grid grid-cols-2 gap-4">
                             <div>
                                 <label htmlFor="image-style" className="block text-sm font-medium text-slate-300 mb-1">Image Style</label>
                                 <select
                                    id="image-style"
                                    value={imageStyle}
                                    onChange={(e) => setImageStyle(e.target.value)}
                                    className="form-select"
                                    title="Choose the visual style for your image"
                                 >
                                    {imageStyles.map(style => <option key={style} value={style}>{style}</option>)}
                                 </select>
                            </div>
                            <div>
                                 <label htmlFor="aspect-ratio" className="block text-sm font-medium text-slate-300 mb-1">Aspect Ratio</label>
                                 <select
                                    id="aspect-ratio"
                                    value={aspectRatio}
                                    onChange={(e) => setAspectRatio(e.target.value)}
                                    className="form-select"
                                    title="Choose the aspect ratio (width:height) for your image"
                                 >
                                    {aspectRatios.map(ratio => <option key={ratio} value={ratio}>{ratio}</option>)}
                                 </select>
                            </div>
                        </div>
                        <textarea
                            id="image-prompt"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., 'A synthwave sunset over a retro-futuristic city'"
                            className="form-input h-32"
                            title="Describe the image you want to create."
                        />
                        <button
                            onClick={handleGenerate}
                            disabled={loading}
                            className="button-primary w-full"
                            title="Generate your image"
                        >
                           <ImageIcon className="w-5 h-5 mr-2" /> Generate Image
                        </button>
                    </div>
                )}
                
                <ErrorDisplay message={error} className="mt-4" />
            </div>

            {loading && (
                <div className="text-center py-10 bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl mt-8">
                    <Spinner size="lg" />
                    <p className="mt-4 text-slate-300 font-semibold text-lg animate-text-fade-cycle">Creating your image...</p>
                </div>
            )}

            {imageBase64 && (
                <div className="mt-8 bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl animate-fade-in">
                    <h3 className="text-2xl font-bold mb-4 text-center text-slate-100">Your Image is Ready!</h3>
                    <div className="flex justify-center mb-4">
                        <button 
                            onClick={() => setIsGalleryOpen(true)}
                            className="w-full max-w-lg rounded-lg bg-black/20 shadow-lg p-2 group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-violet-500"
                            aria-label="View generated image in gallery"
                            title="View a larger preview of your image"
                        >
                            <img 
                                src={`data:image/png;base64,${imageBase64}`}
                                alt="Generated Image"
                                className="w-full h-auto object-contain group-hover:scale-105 transition-transform duration-300"
                            />
                        </button>
                    </div>
                     <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={handleDownloadImage}
                            className="button-secondary w-full"
                            title="Download the generated image as a PNG file"
                        >
                           <Download className="w-5 h-5 mr-2" /> Download
                        </button>
                        <button
                            onClick={handleStartOver}
                            className="button-secondary w-full"
                            title="Clear the prompt and settings to start over"
                        >
                           Start Over
                        </button>
                        <button
                            onClick={handleGenerate}
                            disabled={loading}
                            className="button-primary w-full"
                            title="Generate a new image with the same prompt and settings"
                        >
                           <RefreshCw className="w-5 h-5 mr-2" /> Regenerate
                        </button>
                    </div>
                </div>
            )}
             <GalleryModal 
                isOpen={isGalleryOpen}
                onClose={() => setIsGalleryOpen(false)}
                imageUrl={imageBase64 ? `data:image/png;base64,${imageBase64}` : null}
                altText="Generated Image"
            />
        </div>
    );
};

// export default ImageGenerator; // Not a default export
import React, { useState } from 'react';
import { ToolId } from '../types';
import { ImageGenerator } from '../components/ImageGenerator';
import VideoGenerator from '../components/VideoGenerator';
import { LogoCreator } from '../components/LogoCreator';
import AnimationCreator from '../components/AnimationCreator';
import GifCreator from '../components/GifCreator';
import { Image, Video, Sparkles, Clapperboard, Gif } from '../components/Icons';

interface MediaGeneratorProps {
  onNavigate: (toolId: ToolId, state?: any) => void;
}

export const MediaGenerator: React.FC<MediaGeneratorProps> = ({ onNavigate }) => {
    const [activeGenerator, setActiveGenerator] = useState<'image' | 'video' | 'logo' | 'animation' | 'gif'>('image');

    const GeneratorCard: React.FC<{ id: typeof activeGenerator; icon: React.ReactNode; label: string }> = ({ id, icon, label }) => (
        <button 
            onClick={() => setActiveGenerator(id)}
            className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all ${
                activeGenerator === id 
                ? 'bg-violet-900/40 border-violet-500 shadow-glow-violet text-white' 
                : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
            }`}
        >
            {icon}
            <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
        </button>
    );

    return (
        <div className="animate-slide-in-up space-y-8">
            <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl">
                <h2 className="text-2xl font-bold text-center mb-1 text-slate-100 flex items-center justify-center gap-2">
                    <Sparkles className="w-6 h-6 text-violet-400" /> AI Media Generator
                </h2>
                <p className="text-center text-slate-400 mb-6">Create high-quality visual content from scratch.</p>
                
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 max-w-4xl mx-auto">
                    <GeneratorCard id="image" icon={<Image className="w-6 h-6" />} label="Image" />
                    <GeneratorCard id="video" icon={<Video className="w-6 h-6" />} label="Video" />
                    <GeneratorCard id="logo" icon={<Sparkles className="w-6 h-6" />} label="Logo" />
                    <GeneratorCard id="animation" icon={<Clapperboard className="w-6 h-6" />} label="Animation" />
                    <GeneratorCard id="gif" icon={<Gif className="w-6 h-6" />} label="GIF" />
                </div>
            </div>

            <div className="animate-fade-in">
                {activeGenerator === 'image' && <ImageGenerator onNavigate={onNavigate} />}
                {activeGenerator === 'video' && <VideoGenerator onNavigate={onNavigate} />}
                {activeGenerator === 'logo' && <LogoCreator onNavigate={onNavigate} />}
                {activeGenerator === 'animation' && <AnimationCreator onNavigate={onNavigate} />}
                {activeGenerator === 'gif' && <GifCreator onNavigate={onNavigate} />}
            </div>
        </div>
    );
};

export default MediaGenerator;

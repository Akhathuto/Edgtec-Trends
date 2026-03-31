import React, { useState, useCallback } from 'react';
import { generateAvatar } from '../services/geminiService';
import { AvatarProfile } from '../types';
import Spinner from '../components/Spinner';
import { User, Sparkles, Download, RefreshCw, ChevronDown } from '../components/Icons';
import ErrorDisplay from '../components/ErrorDisplay';
import { useToast } from '../contexts/ToastContext';

import { ToolId } from '../types';

interface AvatarStudioProps {
  onNavigate: (toolId: ToolId, state?: any) => void;
}

export const AvatarStudio: React.FC<AvatarStudioProps> = ({ onNavigate }) => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [profile, setProfile] = useState<AvatarProfile>({
        gender: 'male',
        avatarStyle: '3D Pixar',
        hairStyle: 'Short',
        hairColor: 'Black',
        eyeColor: 'Brown',
        facialHair: 'None',
        glasses: 'None',
        otherFacialFeatures: 'None',
        clothingTop: 'T-shirt',
        clothingBottom: 'Jeans',
        clothingShoes: 'Sneakers',
        outerwear: 'None',
        accessoriesHat: 'None',
        accessoriesJewelry: 'None',
        handheldItem: 'Smartphone',
        extraDetails: 'Vibrant colors, cinematic lighting',
        background: 'Clean studio background',
        shotType: 'Portrait',
        personality: 'Friendly and professional'
    });

    const handleGenerate = useCallback(async () => {
        setLoading(true);
        setError(null);
        setAvatarUrl(null);
        try {
            const result = await generateAvatar(profile);
            setAvatarUrl(result);
            showToast('Avatar generated successfully!');
        } catch (e: any) {
            setError(e.message || 'Failed to generate avatar.');
        } finally {
            setLoading(false);
        }
    }, [profile, showToast]);

    const handleDownload = () => {
        if (avatarUrl) {
            const link = document.createElement('a');
            link.href = avatarUrl;
            link.download = `avatar-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    const updateProfile = (field: keyof AvatarProfile, value: string) => {
        setProfile(prev => ({ ...prev, [field]: value }));
    }

    const SelectField: React.FC<{ label: string; field: keyof AvatarProfile; options: string[] }> = ({ label, field, options }) => (
        <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</label>
            <div className="relative">
                <select 
                    value={profile[field]} 
                    onChange={(e) => updateProfile(field, e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 appearance-none"
                >
                    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
        </div>
    );

    return (
        <div className="animate-slide-in-up space-y-8">
            <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl">
                <h2 className="text-2xl font-bold text-center mb-1 text-slate-100 flex items-center justify-center gap-2">
                    <User className="w-6 h-6 text-violet-400" /> Avatar Studio
                </h2>
                <p className="text-center text-slate-400 mb-6">Create your custom AI digital persona.</p>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <SelectField label="Gender" field="gender" options={['Male', 'Female', 'Non-binary']} />
                            <SelectField label="Style" field="avatarStyle" options={['3D Pixar', 'Anime', 'Realistic', 'Cyberpunk', 'Cartoon']} />
                            <SelectField label="Hair Style" field="hairStyle" options={['Short', 'Long', 'Curly', 'Bald', 'Mohawk']} />
                            <SelectField label="Hair Color" field="hairColor" options={['Black', 'Brown', 'Blonde', 'Red', 'Blue', 'Pink']} />
                            <SelectField label="Eye Color" field="eyeColor" options={['Brown', 'Blue', 'Green', 'Hazel', 'Grey']} />
                            <SelectField label="Facial Hair" field="facialHair" options={['None', 'Beard', 'Mustache', 'Goatee']} />
                            <SelectField label="Glasses" field="glasses" options={['None', 'Reading', 'Sunglasses', 'Stylish']} />
                            <SelectField label="Clothing" field="clothingTop" options={['T-shirt', 'Hoodie', 'Suit', 'Dress', 'Armor']} />
                            <SelectField label="Background" field="background" options={['Studio', 'Cyberpunk City', 'Nature', 'Space', 'Minimalist']} />
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Extra Details</label>
                                <textarea 
                                    value={profile.extraDetails} 
                                    onChange={(e) => updateProfile('extraDetails', e.target.value)}
                                    placeholder="Add any specific details (e.g., 'wearing a red scarf', 'neon lighting')..."
                                    className="form-input w-full h-20 resize-none text-sm"
                                />
                            </div>
                            <button onClick={handleGenerate} disabled={loading} className="button-primary w-full flex items-center justify-center gap-2">
                                {loading ? <Spinner /> : <><Sparkles className="w-5 h-5" /> Generate Avatar</>}
                            </button>
                        </div>
                        <ErrorDisplay message={error} className="mt-4" />
                    </div>
                    
                    <div className="lg:col-span-1 flex flex-col items-center justify-center bg-slate-900/50 rounded-2xl border border-slate-800 p-6 min-h-[300px]">
                        {loading ? (
                            <div className="text-center space-y-4">
                                <Spinner size="lg" />
                                <p className="text-slate-400 text-sm">Rendering your digital persona...</p>
                            </div>
                        ) : avatarUrl ? (
                            <div className="space-y-6 w-full">
                                <div className="relative group rounded-xl overflow-hidden border-2 border-violet-500/30 shadow-glow-violet">
                                    <img src={avatarUrl} alt="Generated Avatar" className="w-full aspect-square object-cover" referrerPolicy="no-referrer" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button onClick={handleDownload} className="p-3 bg-white text-slate-900 rounded-full hover:bg-violet-100 transition-colors">
                                            <Download className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <button onClick={handleDownload} className="button-secondary flex-grow flex items-center justify-center gap-2">
                                        <Download className="w-4 h-4" /> Download
                                    </button>
                                    <button onClick={handleGenerate} className="button-secondary p-3">
                                        <RefreshCw className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center space-y-4">
                                <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                                    <User className="w-12 h-12 text-slate-600" />
                                </div>
                                <p className="text-slate-500 text-sm max-w-[200px]">Configure your profile and click generate to see your AI avatar.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

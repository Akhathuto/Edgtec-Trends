import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { generateAvatar, generateAvatarFromPhoto, generateRandomAvatarProfile, sendMessageToNolo } from '../services/geminiService';
import Spinner from './Spinner';
import { Star, RefreshCw, User as UserIcon, Download, Mic, Phone, MessageSquare, Send, UploadCloud, Wand, Edit, ChevronDown, Image, X, Eye } from './Icons';
import { useAuth } from '../contexts/AuthContext';
import { Tab, AvatarProfile } from '../types';
import { useToast } from '../contexts/ToastContext';
import { avatarStyles, genders, shotTypes, voices, hairStyles, facialHairOptions, glassesOptions } from '../data/avatarOptions';
import ErrorDisplay from './ErrorDisplay';

type InteractionMode = 'none' | 'voice' | 'text';
type ConversationStatus = 'CONNECTING...' | 'LISTENING' | 'SPEAKING' | 'ENDED' | 'READY';
type CreatorPhase = 'design' | 'generating' | 'interact';

interface TranscriptEntry {
    source: 'user' | 'avatar';
    text: string;
}

interface ChatMessage {
    role: 'user' | 'model';
    content: string;
}

interface AvatarCreatorProps {
  setActiveTab: (tab: Tab) => void;
}

const initialProfile: AvatarProfile = {
    gender: genders[0],
    avatarStyle: avatarStyles[0],
    hairStyle: hairStyles[0],
    hairColor: 'Cosmic Purple',
    eyeColor: 'Green',
    facialHair: facialHairOptions[0],
    glasses: glassesOptions[0],
    otherFacialFeatures: '',
    clothingTop: 'Leather Jacket',
    outerwear: '',
    clothingBottom: '',
    clothingShoes: '',
    accessoriesHat: '',
    accessoriesJewelry: '',
    handheldItem: '',
    extraDetails: '',
    background: 'Neon-lit alleyway',
    shotType: shotTypes[0],
    personality: 'A cynical detective with a heart of gold.',
};

const StatusIndicator: React.FC<{ status: ConversationStatus }> = ({ status }) => {
    const statusConfig: Record<ConversationStatus, { text: string; color: string; pulse: boolean }> = {
        'CONNECTING...': { text: 'Connecting...', color: 'bg-yellow-500/20 text-yellow-300', pulse: true },
        'LISTENING': { text: 'Listening', color: 'bg-green-500/20 text-green-300', pulse: false },
        'SPEAKING': { text: 'Speaking', color: 'bg-violet-500/20 text-violet-300', pulse: true },
        'ENDED': { text: 'Ended', color: 'bg-slate-700 text-slate-400', pulse: false },
        'READY': { text: 'Ready', color: 'bg-blue-500/20 text-blue-300', pulse: false }
    };
    const config = statusConfig[status] || statusConfig['ENDED'];

    return (
        <div className={`flex items-center justify-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${config.color} transition-colors`}>
            {config.pulse && <span className="w-2 h-2 bg-current rounded-full animate-pulse"></span>}
            <span>{config.text}</span>
        </div>
    );
};

const CustomSelect: React.FC<{ label: string; options: readonly string[]; value: string; onChange: (value: string) => void; title?: string; }> = ({ label, options, value, onChange, title }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (option: string) => {
        onChange(option);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={menuRef}>
            <label className="input-label">{label}</label>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="custom-select-button text-left w-full flex justify-between items-center"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                title={title}
            >
                <span className="truncate">{value}</span>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="custom-select-options" role="listbox">
                    {options.map(option => (
                        <div
                            key={option}
                            onClick={() => handleSelect(option)}
                            className={`custom-select-option ${value === option ? 'bg-violet-500/50 text-white' : ''}`}
                            role="option"
                            aria-selected={value === option}
                        >
                            {option}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const CollapsibleSection: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, icon, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border border-slate-700/80 rounded-xl overflow-hidden bg-slate-900/30">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-3 bg-slate-800/50 hover:bg-slate-700/50 transition-colors">
                <h3 className="font-bold text-slate-100 flex items-center gap-3">{icon} {title}</h3>
                <ChevronDown className={`w-5 h-5 text-violet-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[1000px]' : 'max-h-0'}`}>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {children}
                </div>
            </div>
        </div>
    );
};


export const AvatarCreator: React.FC<AvatarCreatorProps> = ({ setActiveTab }) => {
    const { user, logActivity, addContentToHistory } = useAuth();
    const { showToast } = useToast();

    // Core State
    const [phase, setPhase] = useState<CreatorPhase>('design');
    const [error, setError] = useState<string | null>(null);
    const [avatarBase64, setAvatarBase64] = useState<string | null>(null);
    
    // Form state refactored into a single object
    const [profile, setProfile] = useState<AvatarProfile>(initialProfile);
    const updateProfile = (updates: Partial<AvatarProfile>) => {
        setProfile(prev => ({ ...prev, ...updates }));
    };

    // Generation State
    const [generationMode, setGenerationMode] = useState<'scratch' | 'photo'>('scratch');
    const [sourceImageBase64, setSourceImageBase64] = useState<{ data: string; mimeType: string; url: string; } | null>(null);
    const [loading, setLoading] = useState(false);
    const [isSurprising, setIsSurprising] = useState(false);
    const [editPrompt, setEditPrompt] = useState('');
    const [isEditingAvatar, setIsEditingAvatar] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    // Conversation State
    const [interactionMode, setInteractionMode] = useState<InteractionMode>('none');
    const [voice, setVoice] = useState(voices[0]);
    const [status, setStatus] = useState<ConversationStatus>('READY');
    const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
    const [textChatHistory, setTextChatHistory] = useState<ChatMessage[]>([]);
    const [textInput, setTextInput] = useState('');
    const [isTextLoading, setIsTextLoading] = useState(false);

    const {
        gender, avatarStyle, hairStyle, hairColor, eyeColor, facialHair, glasses,
        otherFacialFeatures, clothingTop, outerwear, clothingBottom, clothingShoes,
        accessoriesHat, accessoriesJewelry, handheldItem, extraDetails, background,
        shotType, personality
    } = profile;

    const faceDetails = [ facialHair !== 'None' ? facialHair : '', glasses !== 'None' ? glasses : '', otherFacialFeatures ].filter(Boolean).join(', ');
    const clothingString = [ clothingTop ? `Top: ${clothingTop}` : '', outerwear ? `Outerwear: ${outerwear}` : '', clothingBottom ? `Bottom: ${clothingBottom}` : '', shotType === 'Full Body Shot' && clothingShoes ? `Shoes: ${clothingShoes}` : '' ].filter(Boolean).join(', ');
    const accessoriesString = [ accessoriesHat ? `Hat: ${accessoriesHat}` : '', accessoriesJewelry ? `Jewelry: ${accessoriesJewelry}` : '', handheldItem ? `Holding: ${handheldItem}` : '' ].filter(Boolean).join(', ');
    const systemInstruction = `You are an AI avatar. Your appearance is '${avatarStyle}' and you are a ${gender}. Your features are: Hair: ${hairStyle}, ${hairColor}. Eyes: ${eyeColor}. Face: ${faceDetails || 'not specified'}. Clothing: ${clothingString || 'not specified'}. Accessories: ${accessoriesString || 'not specified'}. Other Details: ${extraDetails}. The background is '${background}'. Your personality is '${personality}'. Embody this persona. Keep your responses conversational and relatively brief.`;

    const avatarAnimationClass = useMemo(() => {
        if (phase !== 'interact') return 'animate-avatar-breathing';
        if (interactionMode === 'voice') {
            if (status === 'SPEAKING') return 'animate-avatar-speaking';
            if (status === 'LISTENING') return 'animate-avatar-listening';
        }
        if (interactionMode === 'text' && isTextLoading) {
            return 'animate-avatar-speaking';
        }
        return 'animate-avatar-breathing';
    }, [phase, interactionMode, status, isTextLoading]);

    const fileToBase64 = (file: File): Promise<{ data: string, mimeType: string, url: string }> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                const base64Data = result.split(',')[1];
                resolve({ data: base64Data, mimeType: file.type, url: result });
            };
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    };

    const processFile = async (file: File) => {
        if (file.size > 4 * 1024 * 1024) { setError("Image size should not exceed 4MB."); return; }
        if (!['image/png', 'image/jpeg'].includes(file.type)) { setError("Please upload a PNG or JPG image."); return; }
        setError(null);
        const base64 = await fileToBase64(file);
        setSourceImageBase64(base64);
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) { await processFile(file); }
    };
    
    const handleDrop = async (event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
        const file = event.dataTransfer.files?.[0];
        if (file) { await processFile(file); }
    };

    const handleDragEvents = (event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        event.stopPropagation();
        if (event.type === 'dragenter' || event.type === 'dragover') { setIsDragging(true); } 
        else if (event.type === 'dragleave') { setIsDragging(false); }
    };

    const handleGenerate = useCallback(async () => {
        setLoading(true);
        setPhase('generating');
        setError(null);
        setAvatarBase64(null);

        const featuresString = `Hair: ${hairStyle}${hairColor ? `, ${hairColor}` : ''}. Eyes: ${eyeColor}. Face: ${faceDetails || 'not specified'}. Clothing: ${clothingString || 'not specified'}. Accessories: ${accessoriesString || 'not specified'}. Other details: ${extraDetails || 'none'}.`;

        try {
            let result: string | null = null;
            if (generationMode === 'scratch') {
                result = await generateAvatar(gender, avatarStyle, featuresString, background, shotType);
            } else { // 'photo' mode
                if (!sourceImageBase64) { throw new Error('Please upload a source photo.'); }
                const prompt = `Transform the person in this photo into a ${shotType} avatar. Apply a ${avatarStyle} visual style. The avatar should be ${gender}. Additional features or changes: ${featuresString}. Set the background to: ${background}. Key personality trait for the look: ${personality}. The final image should be a high-quality, professional avatar. Retain the likeness of the person in the photo but fully adapt them to the new style.`;
                result = await generateAvatarFromPhoto(sourceImageBase64.data, sourceImageBase64.mimeType, prompt);
            }

            if (result) {
                setAvatarBase64(result);
                setPhase('interact');
                addContentToHistory({
                    type: 'Avatar',
                    summary: `Avatar: ${generationMode === 'scratch' ? [hairStyle, hairColor, clothingTop].filter(Boolean).join(', ') : `from photo, ${avatarStyle} style`}`,
                    content: {
                        generationMode,
                        sourceImage: generationMode === 'photo' ? sourceImageBase64?.url : null,
                        avatarBase64: result,
                        settings: { ...profile }
                    }
                });
                logActivity(`generated a ${avatarStyle} avatar`, 'User');
            } else {
                throw new Error('The AI did not return an image. Please try adjusting your prompt.');
            }
        } catch (e: any) {
            setError(e.message || 'An error occurred while generating the avatar.');
            setPhase('design');
        } finally {
            setLoading(false);
        }
    }, [generationMode, sourceImageBase64, profile, addContentToHistory, logActivity, faceDetails, clothingString, accessoriesString]);
    
    const handleSurpriseMe = async () => {
        setIsSurprising(true);
        setError(null);
        try {
            const randomProfile = await generateRandomAvatarProfile();
            setProfile(randomProfile);
            showToast("Avatar profile randomized!");
        } catch (e: any) {
            setError(e.message || "Failed to generate a random profile.");
        } finally {
            setIsSurprising(false);
        }
    };
    
    const handleApplyEdit = async () => {
        if (!editPrompt.trim() || !avatarBase64) { showToast('Please enter an edit instruction.'); return; }
        setIsEditingAvatar(true); setError(null);
        try {
            const originalAvatarForHistory = avatarBase64; // Capture current avatar before edit
            const editedAvatar = await generateAvatarFromPhoto(avatarBase64, 'image/png', editPrompt);
            if (editedAvatar) {
                setAvatarBase64(editedAvatar);
                setEditPrompt('');
                showToast("Avatar updated!");

                // Add to history
                addContentToHistory({
                    type: 'Image Edit', // Re-using Image Edit type for consistency
                    summary: `Avatar edit: "${editPrompt.substring(0, 30)}..."`,
                    content: {
                        originalImageUrl: `data:image/png;base64,${originalAvatarForHistory}`,
                        editedImageBase64: editedAvatar,
                        mimeType: 'image/png',
                        prompt: editPrompt,
                        aiNote: 'Avatar quick edit'
                    }
                });
                logActivity(`edited their avatar with prompt: "${editPrompt.substring(0, 30)}..."`, 'Edit');

            } else {
                throw new Error("The AI didn't return an edited image. Try a different prompt.");
            }
        } catch (e: any) { setError(e.message); }
        finally { setIsEditingAvatar(false); }
    };
    
    const handleStartTextChat = useCallback(async () => {
        setInteractionMode('text');
        setStatus('READY');
        const initialGreeting = "Hello! It's great to meet you. What's on your mind?";
        // FIX: Added explicit ChatMessage[] type to prevent overly specific type inference.
        const initialHistory: ChatMessage[] = [{ role: 'model', content: initialGreeting }];
        setTextChatHistory(initialHistory);
        setTranscript(initialHistory.map(m => ({ source: m.role === 'user' ? 'user' : 'avatar', text: m.content })));
    }, []);

    const handleSendTextMessage = useCallback(async () => {
        if (!textInput.trim() || isTextLoading) return;
        const currentInput = textInput;
        const newUserMessage: ChatMessage = { role: 'user', content: currentInput };
        const updatedHistory = [...textChatHistory, newUserMessage];
        setTextChatHistory(updatedHistory);
        setTranscript(updatedHistory.map(m => ({ source: m.role === 'user' ? 'user' : 'avatar', text: m.content })));
        
        setTextInput('');
        setIsTextLoading(true);
        
        try {
            const fullResponse = await sendMessageToNolo(updatedHistory, systemInstruction);
            if (fullResponse) {
                const newAvatarMessage: ChatMessage = { role: 'model', content: fullResponse };
                const finalHistory = [...updatedHistory, newAvatarMessage];
                setTextChatHistory(finalHistory);
                setTranscript(finalHistory.map(m => ({ source: m.role === 'user' ? 'user' : 'avatar', text: m.content })));
                addContentToHistory({ type: 'Avatar Conversation', summary: `Chat with ${avatarStyle} avatar`, content: { userInput: currentInput, avatarResponse: fullResponse } });
            }
        } catch (err) {
            setError('An error occurred during the chat.');
            const errorMsg: ChatMessage = { role: 'model', content: "Sorry, I'm having trouble connecting." };
            const finalHistory = [...updatedHistory, errorMsg];
            setTextChatHistory(finalHistory);
            setTranscript(finalHistory.map(m => ({ source: m.role === 'user' ? 'user' : 'avatar', text: m.content })));
        } finally {
            setIsTextLoading(false);
        }
    }, [isTextLoading, textInput, textChatHistory, systemInstruction, avatarStyle, addContentToHistory]);

    // Voice chat is disabled to prevent app crash from client-side API usage.
    const handleStartLiveConversation = useCallback(async () => {
        showToast("Voice chat is temporarily unavailable for security reasons.");
    }, [showToast]);

    const handleEndConversation = useCallback(() => {
        setInteractionMode('none'); 
        setStatus('READY');
    }, []);

    useEffect(() => () => handleEndConversation(), [handleEndConversation]);

    const handleDownloadAvatar = () => {
        if (!avatarBase64) return;
        const link = document.createElement('a');
        link.href = `data:image/png;base64,${avatarBase64}`;
        link.download = `utrend_avatar_${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleStartOver = () => {
        handleEndConversation();
        setPhase('design');
        setAvatarBase64(null);
        setError(null);
        setSourceImageBase64(null);
        setEditPrompt('');
        setProfile(initialProfile);
    };
    
    if (user?.plan !== 'pro') {
        return (
            <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-8 shadow-xl backdrop-blur-xl text-center flex flex-col items-center animate-slide-in-up">
                <Star className="w-12 h-12 text-yellow-400 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Upgrade to Pro for AI Avatars</h2>
                <p className="text-slate-400 mb-6 max-w-md">Design and converse with your own AI avatar.</p>
                <button onClick={() => setActiveTab(Tab.Pricing)} className="button-primary">View Plans</button>
            </div>
        );
    }
    
    return (
        <div className="animate-slide-in-up">
            <h2 className="text-3xl font-bold text-center mb-1 text-slate-100 flex items-center justify-center gap-2">
                <UserIcon className="w-8 h-8 text-violet-400" /> AI Avatar Hub
            </h2>
            <p className="text-center text-slate-400 mb-8">Design your own AI persona and bring it to life.</p>
            
            {phase === 'design' && (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 animate-scale-in">
                    <div className="lg:col-span-3 bg-brand-glass border border-slate-700/50 rounded-2xl p-6 space-y-5">
                        <div className="segmented-control"><button onClick={() => setGenerationMode('scratch')} className={`segmented-control-button ${generationMode === 'scratch' ? 'active' : ''}`} title="Create an avatar from a detailed text description">From Scratch</button><button onClick={() => setGenerationMode('photo')} className={`segmented-control-button ${generationMode === 'photo' ? 'active' : ''}`} title="Create an avatar by transforming an uploaded photo">From Photo</button></div>
                        <ErrorDisplay message={error} />
                        {generationMode === 'photo' && (
                            <div className="space-y-2">
                                <label className="input-label">Source Photo</label>
                                {sourceImageBase64 ? (
                                    <div className="relative group bg-black/20 rounded-lg p-2">
                                        <img src={sourceImageBase64.url} alt="Source" className="w-full h-auto max-h-60 object-contain rounded-md" />
                                        <button 
                                            onClick={() => setSourceImageBase64(null)} 
                                            className="absolute top-3 right-3 p-1.5 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                            aria-label="Remove photo"
                                            title="Remove photo"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <label onDrop={handleDrop} onDragOver={handleDragEvents} onDragEnter={handleDragEvents} onDragLeave={handleDragEvents} title="Upload the photo you want to transform (PNG or JPG, max 4MB)" className={`flex flex-col items-center justify-center w-full h-40 border-2 border-slate-700 border-dashed rounded-xl cursor-pointer bg-slate-800/50 transition-colors ${isDragging ? 'border-violet-500 bg-violet-900/20 shadow-glow-violet' : 'hover:bg-slate-700/50'}`}>
                                        <UploadCloud className="w-8 h-8 mb-4 text-slate-400" />
                                        <p className="mb-2 text-sm text-slate-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                        <p className="text-xs text-slate-500">PNG or JPG (MAX. 4MB)</p>
                                        <input id="photo-upload" type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleFileChange} />
                                    </label>
                                )}
                            </div>
                        )}
                        <div className="space-y-3">
                            <CollapsibleSection title="Core Identity" icon={<UserIcon className="w-5 h-5 text-violet-300" />} defaultOpen>
                                <CustomSelect label="Gender" value={gender} onChange={value => updateProfile({ gender: value })} options={genders} title="Select the gender of your avatar" />
                                <CustomSelect label="Avatar Style" value={avatarStyle} onChange={value => updateProfile({ avatarStyle: value })} options={avatarStyles} title="Choose the overall visual style for your avatar" />
                                <CustomSelect label="Shot Type" value={shotType} onChange={value => updateProfile({ shotType: value })} options={shotTypes} title="Select the camera framing for the avatar image" />
                                <div className="sm:col-span-2">
                                    <label className="input-label">Personality (1 sentence)</label>
                                    <input type="text" value={personality} onChange={e => updateProfile({ personality: e.target.value })} placeholder="e.g., A cynical detective..." className="form-input" title="Describe your avatar's personality. This will influence its expression and conversational style."/>
                                </div>
                            </CollapsibleSection>
                            <CollapsibleSection title="Appearance" icon={<Eye className="w-5 h-5 text-violet-300" />}>
                                <CustomSelect label="Hair Style" value={hairStyle} onChange={value => updateProfile({ hairStyle: value })} options={hairStyles} title="Choose the avatar's hairstyle" />
                                <div><label className="input-label">Hair Color</label><input type="text" value={hairColor} onChange={e => updateProfile({ hairColor: e.target.value })} placeholder="e.g., Electric Blue" className="form-input" title="Specify the avatar's hair color"/></div>
                                <div>
                                    <label className="input-label">Eye Color</label>
                                    <input type="text" value={eyeColor} onChange={e => updateProfile({ eyeColor: e.target.value })} placeholder="e.g., Emerald Green" className="form-input" title="Describe the avatar's eye color"/>
                                </div>
                                <CustomSelect label="Facial Hair" value={facialHair} onChange={value => updateProfile({ facialHair: value })} options={facialHairOptions} title="Choose the avatar's facial hair style" />
                                <CustomSelect label="Glasses" value={glasses} onChange={value => updateProfile({ glasses: value })} options={glassesOptions} title="Choose the avatar's eyewear" />
                                <div><label className="input-label">Other Features</label><input type="text" value={otherFacialFeatures} onChange={e => updateProfile({ otherFacialFeatures: e.target.value })} placeholder="e.g., Freckles, scars" className="form-input" title="Add any other distinguishing facial features"/></div>
                            </CollapsibleSection>
                            <CollapsibleSection title="Outfit & Accessories" icon={<Wand className="w-5 h-5 text-violet-300" />}>
                                <div><label className="input-label">Top</label><input type="text" value={clothingTop} onChange={e => updateProfile({ clothingTop: e.target.value })} placeholder="e.g., Leather Jacket" className="form-input" title="Describe the top the avatar is wearing"/></div>
                                <div><label className="input-label">Outerwear</label><input type="text" value={outerwear} onChange={e => updateProfile({ outerwear: e.target.value })} placeholder="e.g., Trench coat" className="form-input" title="Describe any outerwear (jacket, coat)"/></div>
                                <div><label className="input-label">Bottoms</label><input type="text" value={clothingBottom} onChange={e => updateProfile({ clothingBottom: e.target.value })} placeholder="e.g., Jeans" className="form-input" title="Describe the bottoms the avatar is wearing"/></div>
                                <div><label className="input-label">Shoes</label><input type="text" value={clothingShoes} onChange={e => updateProfile({ clothingShoes: e.target.value })} placeholder="e.g., Sneakers" className="form-input" title="Describe the shoes the avatar is wearing (for full body shots)"/></div>
                                <div><label className="input-label">Hat</label><input type="text" value={accessoriesHat} onChange={e => updateProfile({ accessoriesHat: e.target.value })} placeholder="e.g., Beanie, fedora" className="form-input" title="Add a hat or other headwear"/></div>
                                <div><label className="input-label">Jewelry</label><input type="text" value={accessoriesJewelry} onChange={e => updateProfile({ accessoriesJewelry: e.target.value })} placeholder="e.g., Necklace" className="form-input" title="Add any jewelry or piercings"/></div>
                                <div><label className="input-label">Handheld Item</label><input type="text" value={handheldItem} onChange={e => updateProfile({ handheldItem: e.target.value })} placeholder="e.g., Coffee cup, book" className="form-input" title="Add an item for the avatar to hold"/></div>
                                <div className="sm:col-span-2"><label className="input-label">Other Details</label><input type="text" value={extraDetails} onChange={e => updateProfile({ extraDetails: e.target.value })} placeholder="e.g., Tattoos on arms" className="form-input" title="Add any extra visual details to the avatar or outfit"/></div>
                            </CollapsibleSection>
                             <CollapsibleSection title="Background" icon={<Image className="w-5 h-5 text-violet-300" />}>
                                <div className="sm:col-span-2">
                                    <label className="input-label">Background Scene</label>
                                    <input 
                                        type="text" 
                                        value={background} 
                                        onChange={e => updateProfile({ background: e.target.value })} 
                                        placeholder="e.g., A neon-lit cyberpunk city, a serene forest" 
                                        className="form-input" 
                                        title="Describe the background scene for the avatar image"
                                    />
                                </div>
                            </CollapsibleSection>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 pt-2"><button onClick={handleSurpriseMe} disabled={isSurprising || loading} className="button-secondary w-full" title="Generate a completely random avatar profile for inspiration"><Wand className="w-5 h-5 mr-2"/> Surprise Me!</button><button onClick={handleGenerate} disabled={loading || isSurprising} className="button-primary w-full !py-3 !text-base" title="Create the avatar based on your current settings"><UserIcon className="w-5 h-5 mr-2"/> Generate Avatar</button></div>
                    </div>
                    <div className="lg:col-span-2 bg-brand-glass border border-slate-700/50 rounded-2xl p-6 flex flex-col items-center justify-center">
                        <h3 className="text-xl font-bold text-center text-white mb-4">Avatar Stage</h3>
                        <div className="w-full flex-grow aspect-square bg-slate-900/30 rounded-lg flex items-center justify-center p-8 relative overflow-hidden animate-pulse-bg">
                            <svg className="w-full h-full text-slate-700/80 drop-shadow-[0_0_10px_rgba(139,92,246,0.3)] animate-breathing" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                            </svg>
                            <p className="absolute bottom-6 font-semibold text-slate-500">Your avatar will appear here</p>
                        </div>
                    </div>
                </div>
            )}
            
            {phase === 'generating' && (
                <div className="text-center py-10 bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl animate-scale-in animate-pulse-bg"><svg viewBox="0 0 200 200" className="w-48 h-48 mx-auto text-violet-400 opacity-60"><g fill="none" stroke="currentColor" strokeWidth="1"><path className="neural-line" style={{animationDelay: '0s'}} d="M20 100 S 50 20, 100 50 S 150 180, 180 100"/><path className="neural-line" style={{animationDelay: '-1s'}} d="M20 100 S 50 180, 100 150 S 150 20, 180 100"/><path className="neural-line" style={{animationDelay: '-2s'}} d="M20 100 S 80 40, 100 100 S 120 160, 180 100"/><path className="neural-line" style={{animationDelay: '-3s'}} d="M20 100 S 80 160, 100 100 S 120 40, 180 100"/><circle className="neural-point" cx="20" cy="100" r="2" style={{animationDelay: '0s'}}/><circle className="neural-point" cx="180" cy="100" r="2" style={{animationDelay: '0s'}}/><circle className="neural-point" cx="100" cy="50" r="2" style={{animationDelay: '-0.5s'}}/><circle className="neural-point" cx="100" cy="150" r="2" style={{animationDelay: '-0.5s'}}/><circle className="neural-point" cx="100" cy="100" r="2" style={{animationDelay: '-1s'}}/></g></svg><p className="mt-4 text-slate-300 font-semibold text-lg animate-text-fade-cycle">Generating Your Masterpiece...</p><p className="text-sm text-slate-400">This can take a moment.</p></div>
            )}

            {phase === 'interact' && avatarBase64 && (
                 <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 animate-scale-in">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-brand-glass border border-slate-700/50 rounded-2xl p-4">
                            <div className="relative">
                                <img src={`data:image/png;base64,${avatarBase64}`} alt="Generated Avatar" className={`w-full aspect-square object-contain rounded-lg bg-slate-900/30 ${avatarAnimationClass}`} />
                                {((interactionMode === 'voice' && status === 'SPEAKING') || (interactionMode === 'text' && isTextLoading)) && (
                                    <div 
                                        className="absolute bottom-[22%] left-1/2 -translate-x-1/2 w-[12%] h-[6%] bg-black/25 rounded-full blur-sm animate-lip-sync"
                                        style={{ transformOrigin: 'center' }}
                                        aria-hidden="true"
                                    ></div>
                                )}
                                {interactionMode === 'none' && (
                                     <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                                        <h3 className="text-xl font-bold">Interact</h3>
                                        <div className="flex gap-4 mt-4">
                                            <button onClick={handleStartLiveConversation} className="interaction-button" title="Start a live voice conversation"><Mic className="w-5 h-5"/></button>
                                            <button onClick={handleStartTextChat} className="interaction-button" title="Start a text-based chat"><MessageSquare className="w-5 h-5"/></button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="mt-4 space-y-3">
                                <div className="flex justify-center">{ interactionMode !== 'none' && <StatusIndicator status={status} /> }</div>
                                <div className="flex gap-3">
                                    <button onClick={handleDownloadAvatar} className="button-secondary w-full" title="Download this avatar image"><Download className="w-4 h-4 mr-2"/> Download</button>
                                    <button onClick={handleStartOver} className="button-secondary w-full" title="Go back to the design phase"><RefreshCw className="w-4 h-4 mr-2"/> Start Over</button>
                                </div>
                                <div className="pt-3 border-t border-slate-700">
                                    <p className="text-sm font-semibold text-slate-200 mb-2">Quick Edit:</p>
                                    <div className="flex gap-2">
                                        <input type="text" value={editPrompt} onChange={e => setEditPrompt(e.target.value)} placeholder="e.g., 'give him a red hat'" className="form-input" disabled={isEditingAvatar} title="Describe a quick change to the avatar's appearance"/>
                                        <button onClick={handleApplyEdit} disabled={isEditingAvatar} className="button-primary" title="Apply the edit"><Edit className="w-4 h-4"/></button>
                                    </div>
                                     {isEditingAvatar && <div className="flex justify-center mt-2"><Spinner size="sm"/></div>}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-3 bg-brand-glass border border-slate-700/50 rounded-2xl p-4 flex flex-col">
                         {interactionMode === 'none' && (
                            <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
                                <MessageSquare className="w-16 h-16 text-slate-600 mb-4" />
                                <h3 className="text-xl font-bold text-slate-200">Start a Conversation</h3>
                                <p className="text-slate-400 max-w-sm">Hover over your avatar and choose an interaction mode to bring it to life. Chat via voice or text.</p>
                            </div>
                        )}
                         {(interactionMode === 'text' || interactionMode === 'voice') && (
                            <>
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-bold text-slate-100 text-lg">Conversation Transcript</h3>
                                    <button onClick={handleEndConversation} className="px-3 py-1 text-sm bg-red-500/20 text-red-300 rounded-full hover:bg-red-500/40 transition-colors">End Session</button>
                                </div>
                                <div className="flex-grow bg-slate-900/40 rounded-lg p-4 space-y-4 overflow-y-auto min-h-64 border border-slate-700/50">
                                    {transcript.map((entry, index) => (
                                        <div key={index} className={`flex items-start gap-3 ${entry.source === 'user' ? 'justify-end' : ''}`}>
                                            {entry.source === 'avatar' && <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0"><UserIcon className="w-4 h-4 text-violet-300"/></div>}
                                            <p className={`text-sm px-3 py-2 rounded-xl ${entry.source === 'user' ? 'bg-violet text-white rounded-br-none' : 'bg-slate-700 rounded-bl-none'}`}>
                                                {entry.text}
                                            </p>
                                        </div>
                                    ))}
                                    {isTextLoading && (
                                        <div className="flex items-start gap-3">
                                            <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0"><UserIcon className="w-4 h-4 text-violet-300"/></div>
                                            <div className="px-3 py-2 rounded-xl bg-slate-700"><Spinner size="sm"/></div>
                                        </div>
                                    )}
                                </div>
                            </>
                         )}
                         {interactionMode === 'text' && (
                            <div className="relative mt-4">
                                <input
                                    type="text"
                                    value={textInput}
                                    onChange={e => setTextInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSendTextMessage()}
                                    placeholder="Type your message..."
                                    className="w-full bg-slate-800 border border-slate-700 rounded-full py-2 pl-4 pr-12"
                                    disabled={isTextLoading}
                                />
                                <button onClick={handleSendTextMessage} disabled={!textInput.trim() || isTextLoading} className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 bg-violet rounded-full disabled:bg-slate-600">
                                    <Send className="w-4 h-4 text-white"/>
                                </button>
                            </div>
                        )}
                    </div>
                 </div>
            )}
        </div>
    );
};
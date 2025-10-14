import React, { useState, useCallback, useEffect, useRef } from 'react';
import { generateAvatar, generateAvatarFromPhoto, generateRandomAvatarProfile, sendMessageToNolo } from '../services/geminiService';
import Spinner from './Spinner';
import { Star, User as UserIcon, RefreshCw, Download, Wand, UploadCloud, MessageSquare, Send, Trash2, Bot, Sparkles } from './Icons';
import { useAuth } from '../contexts/AuthContext';
import { Tab, AvatarProfile } from '../types';
import ErrorDisplay from './ErrorDisplay';
import { useToast } from '../contexts/ToastContext';
import { avatarStyles, genders, shotTypes, hairStyles, eyeColors, facialHairOptions, glassesOptions } from '../data/avatarOptions';

interface AvatarCreatorProps {
  setActiveTab: (tab: Tab) => void;
}

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

const TypingIndicator: React.FC = () => (
    <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 bg-slate-500 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
        <span className="w-2 h-2 bg-slate-500 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
        <span className="w-2 h-2 bg-slate-500 rounded-full animate-pulse"></span>
    </div>
);


export const AvatarCreator: React.FC<AvatarCreatorProps> = ({ setActiveTab }) => {
    const { user, addContentToHistory } = useAuth();
    const { showToast } = useToast();
    
    // Main Tabs
    const [activeSubTab, setActiveSubTab] = useState<'create' | 'chat'>('create');

    // Creation State
    const [creationMode, setCreationMode] = useState<'profile' | 'photo'>('profile');
    const [profile, setProfile] = useState<AvatarProfile | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [avatarBase64, setAvatarBase64] = useState<string | null>(null);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [photoPrompt, setPhotoPrompt] = useState('Turn this person into a cool cartoon avatar');

    // Chat State
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory, chatLoading]);

    const handleRandomize = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const randomProfile = await generateRandomAvatarProfile();
            setProfile(randomProfile);
        } catch (e: any) {
            setError(e.message || 'Failed to generate a random profile.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        handleRandomize(); // Load a random profile on component mount
    }, [handleRandomize]);
    
    const handleProfileChange = (field: keyof AvatarProfile, value: string) => {
        if (profile) {
            setProfile({ ...profile, [field]: value });
        }
    };
    
    const fileToBase64 = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
      });
    };
    
    const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 4 * 1024 * 1024) { setError("Image size cannot exceed 4MB."); return; }
            if (!file.type.startsWith('image/')) { setError("Please upload a valid image file."); return; }
            setPhotoFile(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };
    
    const handleGenerate = useCallback(async () => {
        setLoading(true);
        setError(null);
        setAvatarBase64(null);

        try {
            let result: string | null = null;
            if (creationMode === 'profile' && profile) {
                const { gender, avatarStyle, background, shotType, ...featuresObj } = profile;
                const features = Object.entries(featuresObj)
                    .filter(([, value]) => value && typeof value === 'string' && value.toLowerCase() !== 'none')
                    .map(([key, value]) => `${key.replace(/([A-Z])/g, ' $1').toLowerCase()}: ${value}`)
                    .join(', ');
                result = await generateAvatar(gender, avatarStyle, features, background, shotType);
            } else if (creationMode === 'photo' && photoFile) {
                const base64 = await fileToBase64(photoFile);
                result = await generateAvatarFromPhoto(base64, photoFile.type, photoPrompt);
            } else {
                throw new Error("Missing required information for avatar generation.");
            }
            
            if (result) {
                setAvatarBase64(result);
                addContentToHistory({
                    type: 'Avatar',
                    summary: `Generated ${profile?.avatarStyle || 'custom'} avatar`,
                    content: { profile, photoPrompt, mode: creationMode, avatarBase64: result }
                });
            } else {
                throw new Error("Avatar generation failed to return an image.");
            }
        } catch (e: any) {
            setError(e.message || 'An error occurred while generating the avatar.');
        } finally {
            setLoading(false);
        }
    }, [profile, creationMode, photoFile, photoPrompt, addContentToHistory]);

    const handleStartChat = () => {
        if (avatarBase64 && profile) {
            setChatHistory([{ role: 'model', content: "Hello! What would you like to talk about?" }]);
            setActiveSubTab('chat');
        } else {
            showToast("Please generate an avatar first to start a conversation.");
        }
    };

    const handleSendChatMessage = useCallback(async () => {
        if (!chatInput.trim() || chatLoading || !profile) return;
        
        const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', content: chatInput }];
        setChatHistory(newHistory);
        setChatInput('');
        setChatLoading(true);
        
        const systemInstruction = `You are an AI avatar with the following personality: "${profile.personality}". Respond to the user based on this persona. Be conversational and engaging.`;

        try {
            const historyForApi = newHistory.map(msg => ({ role: msg.role, content: msg.content }));
            const response = await sendMessageToNolo(historyForApi, systemInstruction);
            setChatHistory(prev => [...prev, { role: 'model', content: response }]);
             addContentToHistory({
                type: 'Avatar Conversation',
                summary: `Chat with avatar: "${chatInput.substring(0, 30)}..."`,
                content: { persona: profile.personality, exchange: [...newHistory, { role: 'model', content: response }] }
            });
        } catch (e: any) {
            setChatHistory(prev => [...prev, { role: 'model', content: "Sorry, I'm having trouble thinking right now." }]);
        } finally {
            setChatLoading(false);
        }
    }, [chatInput, chatHistory, chatLoading, profile, addContentToHistory]);

    if (user?.plan !== 'pro') {
        return (
            <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-8 shadow-xl backdrop-blur-xl text-center flex flex-col items-center animate-slide-in-up">
                <Star className="w-12 h-12 text-yellow-400 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Upgrade to Pro for the AI Avatar Creator</h2>
                <p className="text-slate-400 mb-6 max-w-md">The Avatar Creator is a Pro feature. Upgrade to design your own custom AI avatar and chat with it.</p>
                <button onClick={() => setActiveTab(Tab.Pricing)} className="button-primary">View Plans</button>
            </div>
        );
    }

    // JSX for create tab
    const renderCreateUI = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Controls */}
            <div className="space-y-4">
                <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
                    <button onClick={() => setCreationMode('profile')} className={`w-1/2 text-sm py-2 rounded-md transition-colors ${creationMode === 'profile' ? 'bg-violet' : 'hover:bg-slate-700'}`}>From Profile</button>
                    <button onClick={() => setCreationMode('photo')} className={`w-1/2 text-sm py-2 rounded-md transition-colors ${creationMode === 'photo' ? 'bg-violet' : 'hover:bg-slate-700'}`}>From Photo</button>
                </div>
                
                {creationMode === 'profile' && profile && (
                    <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
                        {Object.entries(profile).map(([key, value]) => {
                            let options: string[] | undefined;
                            if (key === 'avatarStyle') options = avatarStyles;
                            else if (key === 'gender') options = genders;
                            else if (key === 'shotType') options = shotTypes;
                            else if (key === 'hairStyle') options = hairStyles;
                            else if (key === 'eyeColor') options = eyeColors;
                            else if (key === 'facialHair') options = facialHairOptions;
                            else if (key === 'glasses') options = glassesOptions;
                            
                            const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                            
                            return (
                                <div key={key}>
                                    <label className="input-label">{label}</label>
                                    {options ? (
                                        <select value={value as string} onChange={e => handleProfileChange(key as keyof AvatarProfile, e.target.value)} className="form-select">
                                            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    ) : (
                                        <input type="text" value={value as string} onChange={e => handleProfileChange(key as keyof AvatarProfile, e.target.value)} className="form-input" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
                
                {creationMode === 'photo' && (
                    <div className="space-y-4">
                        <label htmlFor="photo-upload" className="flex flex-col items-center justify-center w-full h-40 border-2 border-slate-700 border-dashed rounded-lg cursor-pointer bg-slate-800/50 hover:bg-slate-700/50 transition-colors">
                            {photoPreview ? <img src={photoPreview} alt="upload preview" className="w-full h-full object-contain rounded-lg p-1" /> : (
                                <div className="text-center"><UploadCloud className="w-8 h-8 mx-auto mb-2 text-slate-400" /><p className="text-sm">Upload Photo</p><p className="text-xs text-slate-500">PNG/JPG, max 4MB</p></div>
                            )}
                            <input id="photo-upload" type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                        </label>
                         <textarea value={photoPrompt} onChange={e => setPhotoPrompt(e.target.value)} placeholder="Describe the transformation..." className="form-input h-24" />
                    </div>
                )}

                <div className="flex gap-2">
                    {creationMode === 'profile' && <button onClick={handleRandomize} className="button-secondary w-full"><Wand className="w-4 h-4 mr-2" /> Randomize</button>}
                    <button onClick={handleGenerate} disabled={loading} className="button-primary w-full">{loading ? <Spinner/> : <><Sparkles className="w-5 h-5 mr-2" /> Generate</>}</button>
                </div>
            </div>
            {/* Preview */}
            <div className="flex flex-col items-center justify-center space-y-4">
                <div className="w-full aspect-square bg-black/20 rounded-lg flex items-center justify-center relative">
                    {loading && <Spinner size="lg"/>}
                    {avatarBase64 && <img src={`data:image/png;base64,${avatarBase64}`} alt="Generated Avatar" className="w-full h-full object-contain rounded-lg" />}
                    {!loading && !avatarBase64 && <UserIcon className="w-24 h-24 text-slate-600"/>}
                </div>
                <div className="flex gap-2 w-full">
                    <button onClick={() => { if (avatarBase64) { const link = document.createElement('a'); link.href=`data:image/png;base64,${avatarBase64}`; link.download=`avatar.png`; link.click(); } }} disabled={!avatarBase64} className="button-secondary w-full"><Download className="w-4 h-4 mr-2" /> Download</button>
                    <button onClick={handleStartChat} disabled={!avatarBase64} className="button-primary w-full"><MessageSquare className="w-4 h-4 mr-2" /> Chat</button>
                </div>
            </div>
        </div>
    );
    
    // JSX for chat tab
    const renderChatUI = () => (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-4 mb-4">
                {avatarBase64 && <img src={`data:image/png;base64,${avatarBase64}`} alt="Avatar" className="w-16 h-16 rounded-full bg-slate-700" />}
                <div>
                    <h3 className="text-xl font-bold">Chatting with your Avatar</h3>
                    <p className="text-sm text-slate-400 italic">"{profile?.personality}"</p>
                </div>
            </div>
            <div ref={chatContainerRef} className="flex-1 p-4 bg-slate-800/50 rounded-lg overflow-y-auto space-y-4 border border-slate-700">
                {chatHistory.map((msg, i) => (
                    <div key={i} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                         {msg.role === 'model' && (<div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0"><Bot className="w-5 h-5 text-violet-300"/></div>)}
                         <div className={`max-w-md px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-violet text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
                            <p>{msg.content}</p>
                         </div>
                    </div>
                ))}
                 {chatLoading && <div className="flex items-start gap-3"><div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0"><Bot className="w-5 h-5 text-violet-300"/></div><div className="px-4 py-3 rounded-2xl bg-slate-700 rounded-bl-none"><TypingIndicator/></div></div>}
            </div>
            <div className="mt-4 relative">
                <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendChatMessage()} placeholder="Say hello..." className="form-input pr-12" />
                <button onClick={handleSendChatMessage} disabled={chatLoading} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-violet disabled:opacity-50"><Send className="w-5 h-5 text-white" /></button>
            </div>
        </div>
    );

    return (
        <div className="animate-slide-in-up">
            <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl">
                <h2 className="text-2xl font-bold text-center mb-1 text-slate-100 flex items-center justify-center gap-2">
                    <UserIcon className="w-6 h-6 text-violet-400" /> AI Avatar Creator
                </h2>
                <p className="text-center text-slate-400 mb-6">Design your own custom AI avatar and bring it to life.</p>
                <div className="flex justify-center mb-6">
                    <div className="flex bg-slate-800/60 p-1.5 rounded-full border border-slate-700/50">
                        <button onClick={() => setActiveSubTab('create')} className={`px-6 py-2 text-sm font-semibold rounded-full transition-colors ${activeSubTab === 'create' ? 'bg-violet' : ''}`}>Create</button>
                        <button onClick={() => setActiveSubTab('chat')} className={`px-6 py-2 text-sm font-semibold rounded-full transition-colors ${activeSubTab === 'chat' ? 'bg-violet' : ''}`} disabled={!avatarBase64}>Chat</button>
                    </div>
                </div>

                <ErrorDisplay message={error} />
                
                {activeSubTab === 'create' ? renderCreateUI() : renderChatUI()}
            </div>
        </div>
    );
};
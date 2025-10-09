import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob as GenAiBlob, Chat } from '@google/genai';
import { generateAvatar, generateAvatarFromPhoto, generateRandomAvatarProfile } from '../services/geminiService.ts';
import Spinner from './Spinner.tsx';
import { Star, RefreshCw, User as UserIcon, Download, Mic, Phone, MessageSquare, Send, UploadCloud, Wand, Edit, ChevronDown, Image, X, Eye } from './Icons.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { Tab } from '../types.ts';
import { useToast } from '../contexts/ToastContext.tsx';
import { avatarStyles, genders, shotTypes, voices, hairStyles, eyeColors, facialHairOptions, glassesOptions } from '../data/avatarOptions.ts';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Live API Audio Helper Functions ---
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function createBlob(data: Float32Array): GenAiBlob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}
// --- End Helper Functions ---

type InteractionMode = 'none' | 'voice' | 'text';
type ConversationStatus = 'CONNECTING...' | 'LISTENING' | 'SPEAKING' | 'ENDED' | 'READY';
type CreatorPhase = 'design' | 'generating' | 'interact';

interface TranscriptEntry {
    source: 'user' | 'avatar';
    text: string;
}

interface AvatarCreatorProps {
  setActiveTab: (tab: Tab) => void;
}

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


const AvatarCreator: React.FC<AvatarCreatorProps> = ({ setActiveTab }) => {
    const { user, logActivity, addContentToHistory } = useAuth();
    const { showToast } = useToast();

    // Core State
    const [phase, setPhase] = useState<CreatorPhase>('design');
    const [error, setError] = useState<string | null>(null);
    const [avatarBase64, setAvatarBase64] = useState<string | null>(null);

    // Generation State
    const [generationMode, setGenerationMode] = useState<'scratch' | 'photo'>('scratch');
    const [sourceImageBase64, setSourceImageBase64] = useState<{ data: string; mimeType: string; url: string; } | null>(null);
    const [gender, setGender] = useState(genders[0]);
    const [avatarStyle, setAvatarStyle] = useState(avatarStyles[0]);
    const [hairStyle, setHairStyle] = useState(hairStyles[0]);
    const [hairColor, setHairColor] = useState('Cosmic Purple');
    const [eyeColor, setEyeColor] = useState(eyeColors[1]);
    const [facialHair, setFacialHair] = useState(facialHairOptions[0]);
    const [glasses, setGlasses] = useState(glassesOptions[0]);
    const [otherFacialFeatures, setOtherFacialFeatures] = useState('');
    const [clothingTop, setClothingTop] = useState('Leather Jacket');
    const [clothingBottom, setClothingBottom] = useState('');
    const [clothingShoes, setClothingShoes] = useState('');
    const [accessoriesHat, setAccessoriesHat] = useState('');
    const [accessoriesJewelry, setAccessoriesJewelry] = useState('');
    const [extraDetails, setExtraDetails] = useState('');
    const [background, setBackground] = useState('Neon-lit alleyway');
    const [shotType, setShotType] = useState(shotTypes[0]);
    const [personality, setPersonality] = useState('A cynical detective with a heart of gold.');
    const [loading, setLoading] = useState(false);
    const [isSurprising, setIsSurprising] = useState(false);
    const [editPrompt, setEditPrompt] = useState('');
    const [isEditingAvatar, setIsEditingAvatar] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    // Conversation State
    const [interactionMode, setInteractionMode] = useState<InteractionMode>('none');
    const [voice, setVoice] = useState(voices[0]);
    const [status, setStatus] = useState<ConversationStatus>('CONNECTING...');
    const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const textChatRef = useRef<Chat | null>(null);
    const [textInput, setTextInput] = useState('');
    const [isTextLoading, setIsTextLoading] = useState(false);
    
    const audioResourcesRef = useRef<{
        stream: MediaStream | null;
        inputAudioContext: AudioContext | null;
        outputAudioContext: AudioContext | null;
        scriptProcessor: ScriptProcessorNode | null;
        sources: Set<AudioBufferSourceNode>;
        nextStartTime: number;
    }>({ stream: null, inputAudioContext: null, outputAudioContext: null, scriptProcessor: null, sources: new Set(), nextStartTime: 0 });

    const faceDetails = [ facialHair !== 'None' ? facialHair : '', glasses !== 'None' ? glasses : '', otherFacialFeatures ].filter(Boolean).join(', ');
    const clothingString = [ clothingTop ? `Top: ${clothingTop}` : '', clothingBottom ? `Bottom: ${clothingBottom}` : '', shotType === 'Full Body Shot' && clothingShoes ? `Shoes: ${clothingShoes}` : '' ].filter(Boolean).join(', ');
    const accessoriesString = [ accessoriesHat ? `Hat: ${accessoriesHat}` : '', accessoriesJewelry ? `Jewelry: ${accessoriesJewelry}` : '' ].filter(Boolean).join(', ');
    const systemInstruction = `You are an AI avatar. Your appearance is '${avatarStyle}' and you are a ${gender}. Your features are: Hair: ${hairStyle}, ${hairColor}. Eyes: ${eyeColor}. Face: ${faceDetails || 'not specified'}. Clothing: ${clothingString || 'not specified'}. Accessories: ${accessoriesString || 'not specified'}. Other Details: ${extraDetails}. The background is '${background}'. Your personality is '${personality}'. Embody this persona. Keep your responses conversational and relatively brief.`;
    
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
                    content: { /* content... */ }
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
    }, [generationMode, sourceImageBase64, gender, avatarStyle, hairStyle, hairColor, eyeColor, faceDetails, clothingString, accessoriesString, extraDetails, background, shotType, personality, addContentToHistory, logActivity]);
    
    const handleSurpriseMe = async () => {
        setIsSurprising(true);
        setError(null);
        try {
            const profile = await generateRandomAvatarProfile();
            setGender(profile.gender); setAvatarStyle(profile.avatarStyle); setHairStyle(profile.hairStyle);
            setHairColor(profile.hairColor); setEyeColor(profile.eyeColor); setFacialHair(profile.facialHair);
            setGlasses(profile.glasses); setOtherFacialFeatures(profile.otherFacialFeatures);
            setClothingTop(profile.clothingTop); setClothingBottom(profile.clothingBottom); setClothingShoes(profile.clothingShoes);
            setAccessoriesHat(profile.accessoriesHat); setAccessoriesJewelry(profile.accessoriesJewelry);
            setExtraDetails(profile.extraDetails); setBackground(profile.background); setShotType(profile.shotType); setPersonality(profile.personality);
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
            const editedAvatar = await generateAvatarFromPhoto(avatarBase64, 'image/png', editPrompt);
            if (editedAvatar) { setAvatarBase64(editedAvatar); setEditPrompt(''); showToast("Avatar updated!"); } 
            else { throw new Error("The AI didn't return an edited image. Try a different prompt."); }
        } catch (e: any) { setError(e.message); } 
        finally { setIsEditingAvatar(false); }
    };
    
    const cleanupAudio = useCallback(() => {
        const r = audioResourcesRef.current;
        r.stream?.getTracks().forEach(t => t.stop());
        r.scriptProcessor?.disconnect();
        r.inputAudioContext?.close().catch(console.error);
        r.outputAudioContext?.close().catch(console.error);
        r.sources.forEach(s => s.stop());
        audioResourcesRef.current = { stream: null, inputAudioContext: null, outputAudioContext: null, scriptProcessor: null, sources: new Set(), nextStartTime: 0 };
    }, []);

    const handleStartTextChat = useCallback(async () => {
        setInteractionMode('text');
        setStatus('READY'); setTranscript([]);
        const initialGreeting = "Hello! It's great to meet you. What's on your mind?";
        textChatRef.current = ai.chats.create({ model: 'gemini-2.5-flash', config: { systemInstruction }, history: [{ role: 'model', parts: [{ text: initialGreeting }] }] });
        setTranscript([{ source: 'avatar', text: initialGreeting }]);
    }, [systemInstruction]);

    const handleSendTextMessage = useCallback(async () => {
        if (!textInput.trim() || isTextLoading || !textChatRef.current) return;
        const currentInput = textInput;
        setTextInput(''); setIsTextLoading(true);
        setTranscript(prev => [...prev, { source: 'user', text: currentInput }]);
        let fullResponse = '';
        try {
            const stream = await textChatRef.current.sendMessageStream({ message: currentInput });
            setTranscript(prev => [...prev, { source: 'avatar', text: '' }]);
            for await (const chunk of stream) {
                fullResponse += chunk.text;
                setTranscript(prev => {
                    const newHistory = [...prev];
                    newHistory[newHistory.length-1].text = fullResponse;
                    return newHistory;
                });
            }
        } catch (err) { setError('An error occurred during the chat.'); setTranscript(prev => [...prev, { source: 'avatar', text: "Sorry, I'm having trouble connecting." }]); } 
        finally { setIsTextLoading(false); }
    }, [isTextLoading, textInput]);

    const handleStartLiveConversation = useCallback(async () => {
        setInteractionMode('voice'); setStatus('CONNECTING...'); setTranscript([]);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const r = audioResourcesRef.current;
            r.stream = stream;
            r.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            r.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO], inputAudioTranscription: {}, outputAudioTranscription: {},
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
                    systemInstruction,
                },
                callbacks: {
                    onopen: () => {
                        setStatus('LISTENING');
                        const source = r.inputAudioContext!.createMediaStreamSource(stream);
                        r.scriptProcessor = r.inputAudioContext!.createScriptProcessor(4096, 1, 1);
                        r.scriptProcessor.onaudioprocess = (e) => {
                            sessionPromiseRef.current?.then((s) => s.sendRealtimeInput({ media: createBlob(e.inputBuffer.getChannelData(0)) }));
                        };
                        source.connect(r.scriptProcessor);
                        r.scriptProcessor.connect(r.inputAudioContext!.destination);
                    },
                    onmessage: async (msg: LiveServerMessage) => {
                        if (msg.serverContent?.turnComplete) {
                            addContentToHistory({ type: 'Avatar Conversation', summary: `Chat with ${avatarStyle} avatar`, content: { userInput: msg.serverContent?.inputTranscription?.text, avatarResponse: msg.serverContent?.outputTranscription?.text } });
                            setTranscript(prev => [...prev, { source: 'user', text: msg.serverContent!.inputTranscription!.text }, { source: 'avatar', text: msg.serverContent!.outputTranscription!.text }]);
                        }
                        const audio = msg.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                        if (audio) {
                            setStatus('SPEAKING');
                            r.nextStartTime = Math.max(r.nextStartTime, r.outputAudioContext!.currentTime);
                            const buffer = await decodeAudioData(decode(audio), r.outputAudioContext!, 24000, 1);
                            const sourceNode = r.outputAudioContext!.createBufferSource();
                            sourceNode.buffer = buffer;
                            sourceNode.connect(r.outputAudioContext!.destination);
                            sourceNode.addEventListener('ended', () => { r.sources.delete(sourceNode); if(r.sources.size === 0) setStatus('LISTENING'); });
                            sourceNode.start(r.nextStartTime);
                            r.nextStartTime += buffer.duration;
                            r.sources.add(sourceNode);
                        }
                    },
                    onerror: (e: ErrorEvent) => { console.error('Live error:', e); setError('A conversation error occurred.'); setPhase('interact'); setInteractionMode('none'); cleanupAudio(); },
                    onclose: (e: CloseEvent) => { console.debug('Live closed'); setPhase('interact'); setInteractionMode('none'); cleanupAudio(); },
                },
            });
            await sessionPromiseRef.current;
        } catch (err: any) { setError(`Failed to start: ${err.message}.`); setPhase('interact'); cleanupAudio(); }
    }, [voice, systemInstruction, cleanupAudio, addContentToHistory, avatarStyle]);

    const handleEndConversation = useCallback(() => {
        sessionPromiseRef.current?.then(s => s.close()); cleanupAudio();
        setInteractionMode('none'); setStatus('READY');
        if (textChatRef.current) { textChatRef.current = null; }
    }, [cleanupAudio]);

    useEffect(() => () => handleEndConversation(), [handleEndConversation]);

    const handleDownloadAvatar = () => {
        if (!avatarBase64) return;
        const link = document.createElement('a');
        link.href = `data:image/png;base64,${avatarBase64}`;
        link.download = `utrend_avatar_${Date.now()}.png`;
        link.click();
    };

    const handleStartOver = () => {
        handleEndConversation();
        setPhase('design');
        setAvatarBase64(null);
        setError(null);
        setSourceImageBase64(null);
        setEditPrompt('');
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
                        {error && <p className="text-red-400 text-center text-sm bg-red-500/10 p-2 rounded-lg">{error}</p>}
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
                                <CustomSelect label="Gender" value={gender} onChange={setGender} options={genders} title="Select the gender of your avatar" />
                                <CustomSelect label="Avatar Style" value={avatarStyle} onChange={setAvatarStyle} options={avatarStyles} title="Choose the overall visual style for your avatar" />
                                <CustomSelect label="Shot Type" value={shotType} onChange={setShotType} options={shotTypes} title="Select the camera framing for the avatar image" />
                                <div className="sm:col-span-2">
                                    <label className="input-label">Personality (1 sentence)</label>
                                    <input type="text" value={personality} onChange={e => setPersonality(e.target.value)} placeholder="e.g., A cynical detective..." className="form-input" title="Describe your avatar's personality. This will influence its expression and conversational style."/>
                                </div>
                            </CollapsibleSection>
                            <CollapsibleSection title="Appearance" icon={<Eye className="w-5 h-5 text-violet-300" />}>
                                <CustomSelect label="Hair Style" value={hairStyle} onChange={setHairStyle} options={hairStyles} title="Choose the avatar's hairstyle" />
                                <div><label className="input-label">Hair Color</label><input type="text" value={hairColor} onChange={e => setHairColor(e.target.value)} placeholder="e.g., Electric Blue" className="form-input" title="Specify the avatar's hair color"/></div>
                                <CustomSelect label="Eye Color" value={eyeColor} onChange={setEyeColor} options={eyeColors} title="Select the avatar's eye color" />
                                <CustomSelect label="Facial Hair" value={facialHair} onChange={setFacialHair} options={facialHairOptions} title="Choose the avatar's facial hair style" />
                                <CustomSelect label="Glasses" value={glasses} onChange={setGlasses} options={glassesOptions} title="Choose the avatar's eyewear" />
                                <div><label className="input-label">Other Features</label><input type="text" value={otherFacialFeatures} onChange={e => setOtherFacialFeatures(e.target.value)} placeholder="e.g., Freckles, scars" className="form-input" title="Add any other distinguishing facial features"/></div>
                            </CollapsibleSection>
                            <CollapsibleSection title="Outfit & Scene" icon={<Image className="w-5 h-5 text-violet-300" />}>
                                <div><label className="input-label">Top</label><input type="text" value={clothingTop} onChange={e => setClothingTop(e.target.value)} placeholder="e.g., Leather Jacket" className="form-input" title="Describe the top the avatar is wearing"/></div>
                                <div><label className="input-label">Bottoms</label><input type="text" value={clothingBottom} onChange={e => setClothingBottom(e.target.value)} placeholder="e.g., Jeans" className="form-input" title="Describe the bottoms the avatar is wearing"/></div>
                                <div><label className="input-label">Shoes</label><input type="text" value={clothingShoes} onChange={e => setClothingShoes(e.target.value)} placeholder="e.g., Sneakers" className="form-input" title="Describe the shoes the avatar is wearing (for full body shots)"/></div>
                                <div><label className="input-label">Hat</label><input type="text" value={accessoriesHat} onChange={e => setAccessoriesHat(e.target.value)} placeholder="e.g., Beanie, fedora" className="form-input" title="Add a hat or other headwear"/></div>
                                <div><label className="input-label">Jewelry</label><input type="text" value={accessoriesJewelry} onChange={e => setAccessoriesJewelry(e.target.value)} placeholder="e.g., Necklace" className="form-input" title="Add any jewelry or piercings"/></div>
                                <div><label className="input-label">Other Details</label><input type="text" value={extraDetails} onChange={e => setExtraDetails(e.target.value)} placeholder="e.g., Tattoos" className="form-input" title="Add any extra visual details to the avatar or outfit"/></div>
                                <div className="sm:col-span-2"><label className="input-label">Background</label><input type="text" value={background} onChange={e => setBackground(e.target.value)} placeholder="e.g., Neon-lit alleyway" className="form-input" title="Describe the background scene for the avatar image"/></div>
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
                                <img src={`data:image/png;base64,${avatarBase64}`} alt="Generated Avatar" className="w-full aspect-square object-contain rounded-lg bg-slate-900/30 animate-avatar-breathing" />
                                {interactionMode === 'voice' && <div className="absolute bottom-4 left-1/2 -translate-x-1/2"><StatusIndicator status={status} /></div>}
                            </div>
                            <div className="mt-4 flex flex-col gap-3">
                                <button onClick={handleDownloadAvatar} className="button-secondary w-full" title="Download the generated avatar image as a PNG file"><Download className="w-4 h-4 mr-2"/> Download</button>
                                <button onClick={handleStartOver} className="button-secondary w-full" title="Go back to the design screen to create a new avatar"><RefreshCw className="w-4 h-4 mr-2"/> Create New</button>
                            </div>
                        </div>
                        <div className="bg-brand-glass border border-slate-700/50 rounded-2xl p-4">
                            <h3 className="font-semibold text-slate-200 mb-2 flex items-center gap-2"><Edit className="w-5 h-5 text-violet-400"/> Quick Edit</h3>
                            <div className="flex gap-2">
                                <input type="text" value={editPrompt} onChange={e => setEditPrompt(e.target.value)} placeholder="e.g., make the hair blue" className="form-input" title="Describe a change, e.g., 'make the hair blue' or 'add sunglasses'"/>
                                <button onClick={handleApplyEdit} disabled={isEditingAvatar} className="button-primary px-3" title="Apply the edit instruction to the current avatar">{isEditingAvatar ? <Spinner size="sm"/> : <Edit className="w-4 h-4"/>}</button>
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-3 bg-brand-glass border border-slate-700/50 rounded-2xl flex flex-col min-h-[70vh]">
                        {interactionMode === 'none' ? (
                            <div className="flex-grow flex flex-col justify-center items-center p-6 text-center animate-fade-in">
                                <h3 className="text-2xl font-bold mb-4 text-white">Bring Your Avatar to Life</h3>
                                <p className="text-slate-400 mb-6">Start a conversation to hear its voice and explore its personality.</p>
                                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                                    <button onClick={handleStartLiveConversation} className="button-primary w-full !py-3 !text-base" title="Start a live voice conversation with your avatar"><Mic className="w-5 h-5 mr-2" /> Voice Chat</button>
                                    <button onClick={handleStartTextChat} className="button-secondary w-full !py-3 !text-base" title="Start a text-based chat with your avatar"><MessageSquare className="w-5 h-5 mr-2" /> Text Chat</button>
                                </div>
                                <div className="mt-6 w-full max-w-sm">
                                    <CustomSelect label="Voice Style" value={voice} onChange={setVoice} options={voices} title="Select the voice your avatar will use in conversation" />
                                </div>
                                {error && <p className="text-red-400 mt-4 text-sm">{error}</p>}
                            </div>
                        ) : (
                            <div className="flex flex-col flex-grow animate-fade-in">
                                <div className="p-4 border-b border-slate-700/50 flex justify-between items-center">
                                    <h3 className="font-bold text-lg">{interactionMode === 'voice' ? 'Live Conversation' : 'Text Chat'}</h3>
                                    <button onClick={handleEndConversation} className="button-danger px-3 py-1.5 text-sm" title="End the current conversation"><Phone className="w-4 h-4 mr-2"/> End</button>
                                </div>
                                <div className="flex-grow p-4 space-y-4 overflow-y-auto">
                                    {transcript.length === 0 && <p className="text-center text-slate-500">Your conversation will appear here...</p>}
                                    {transcript.map((entry, i) => (
                                        <div key={i} className={`flex items-start gap-3 chat-bubble ${entry.source === 'user' ? 'justify-end' : ''}`}>
                                            {entry.source === 'avatar' && <div className="w-8 h-8 rounded-full bg-slate-700 flex-shrink-0 mt-1"><img src={`data:image/png;base64,${avatarBase64}`} className="w-full h-full rounded-full"/></div>}
                                            <p className={`px-4 py-2 rounded-2xl max-w-md ${entry.source === 'user' ? 'bg-violet text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>{entry.text}</p>
                                        </div>
                                    ))}
                                </div>
                                {interactionMode === 'text' && (
                                    <div className="p-4 border-t border-slate-700/50">
                                        <div className="relative">
                                            <input type="text" value={textInput} onChange={e => setTextInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendTextMessage()} placeholder="Type your message..." disabled={isTextLoading} className="form-input pr-12" title="Type your message to the avatar"/>
                                            <button onClick={handleSendTextMessage} disabled={isTextLoading || !textInput.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-violet disabled:opacity-50" title="Send message">{isTextLoading ? <Spinner size="sm" /> : <Send className="w-5 h-5 text-white" />}</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                 </div>
            )}
        </div>
    );
};

export default AvatarCreator;
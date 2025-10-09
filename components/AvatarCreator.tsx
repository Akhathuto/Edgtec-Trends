import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob as GenAiBlob, Chat } from '@google/genai';
import { generateAvatar, generateAvatarFromPhoto, generateRandomAvatarProfile } from '../services/geminiService.ts';
import Spinner from './Spinner.tsx';
import { Star, RefreshCw, User as UserIcon, Download, Mic, Phone, Save, MessageSquare, Send, UploadCloud, Wand, Edit, ChevronDown, Image, X } from './Icons.tsx';
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

type ConversationPhase = 'idle' | 'generating' | 'ready' | 'conversing' | 'ended';
type InteractionMode = 'none' | 'voice' | 'text';
type ConversationStatus = 'CONNECTING...' | 'LISTENING' | 'SPEAKING' | 'ENDED' | 'READY';
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

const AccordionSection: React.FC<{ title: string; children: React.ReactNode, defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    
    return (
        <div className="bg-slate-900/30 border border-slate-700/50 rounded-xl transition-all duration-300 overflow-hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full p-4 font-bold text-slate-100 cursor-pointer flex justify-between items-center list-none hover:bg-slate-800/40">
                {title}
                <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`transition-[max-height,padding] duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-[1000px]' : 'max-h-0'}`}>
                 <div className="px-4 pb-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

const CustomSelect: React.FC<{ label: string; options: readonly string[]; value: string; onChange: (value: string) => void;}> = ({ label, options, value, onChange }) => {
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
            >
                <span>{value}</span>
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


const AvatarCreator: React.FC<AvatarCreatorProps> = ({ setActiveTab }) => {
    const { user, logActivity, addContentToHistory } = useAuth();
    const { showToast } = useToast();

    // Generation State
    const [generationMode, setGenerationMode] = useState<'scratch' | 'photo'>('scratch');
    const [sourceImageFile, setSourceImageFile] = useState<File | null>(null);
    const [sourceImageBase64, setSourceImageBase64] = useState<{ data: string; mimeType: string; url: string; } | null>(null);
    const [gender, setGender] = useState(genders[0]);
    const [avatarStyle, setAvatarStyle] = useState(avatarStyles[0]);
    const [hairStyle, setHairStyle] = useState(hairStyles[0]);
    const [hairColor, setHairColor] = useState('');
    const [eyeColor, setEyeColor] = useState(eyeColors[0]);
    const [facialHair, setFacialHair] = useState(facialHairOptions[0]);
    const [glasses, setGlasses] = useState(glassesOptions[0]);
    const [otherFacialFeatures, setOtherFacialFeatures] = useState('');
    const [clothingTop, setClothingTop] = useState('');
    const [clothingBottom, setClothingBottom] = useState('');
    const [clothingShoes, setClothingShoes] = useState('');
    const [accessoriesHat, setAccessoriesHat] = useState('');
    const [accessoriesJewelry, setAccessoriesJewelry] = useState('');
    const [extraDetails, setExtraDetails] = useState('');
    const [background, setBackground] = useState('');
    const [shotType, setShotType] = useState(shotTypes[0]);
    const [personality, setPersonality] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSurprising, setIsSurprising] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [avatarBase64, setAvatarBase64] = useState<string | null>(null);
    const [phase, setPhase] = useState<ConversationPhase>('idle');
    
    // Conversation State
    const [interactionMode, setInteractionMode] = useState<InteractionMode>('none');
    const [voice, setVoice] = useState(voices[0]);
    const [status, setStatus] = useState<ConversationStatus>('CONNECTING...');
    const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const textChatRef = useRef<Chat | null>(null);
    const [textInput, setTextInput] = useState('');
    const [isTextLoading, setIsTextLoading] = useState(false);
    
    // Post-generation editing
    const [editPrompt, setEditPrompt] = useState('');
    const [isEditingAvatar, setIsEditingAvatar] = useState(false);

    // Drag and drop state
    const [isDragging, setIsDragging] = useState(false);


    const audioResourcesRef = useRef<{
        stream: MediaStream | null;
        inputAudioContext: AudioContext | null;
        outputAudioContext: AudioContext | null;
        scriptProcessor: ScriptProcessorNode | null;
        sources: Set<AudioBufferSourceNode>;
        nextStartTime: number;
    }>({ stream: null, inputAudioContext: null, outputAudioContext: null, scriptProcessor: null, sources: new Set(), nextStartTime: 0 });

    const faceDetails = [
        facialHair !== 'None' ? facialHair : '',
        glasses !== 'None' ? glasses : '',
        otherFacialFeatures
    ].filter(Boolean).join(', ');

    const clothingString = [
        clothingTop ? `Top: ${clothingTop}` : '',
        clothingBottom ? `Bottom: ${clothingBottom}` : '',
        shotType === 'Full Body Shot' && clothingShoes ? `Shoes: ${clothingShoes}` : ''
    ].filter(Boolean).join(', ');

    const accessoriesString = [
        accessoriesHat ? `Hat: ${accessoriesHat}` : '',
        accessoriesJewelry ? `Jewelry: ${accessoriesJewelry}` : ''
    ].filter(Boolean).join(', ');

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
        if (file.size > 4 * 1024 * 1024) {
            setError("Image size should not exceed 4MB.");
            return;
        }
        if (!['image/png', 'image/jpeg'].includes(file.type)) {
            setError("Please upload a PNG or JPG image.");
            return;
        }
        setError(null);
        setSourceImageFile(file);
        const base64 = await fileToBase64(file);
        setSourceImageBase64(base64);
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
           await processFile(file);
        }
    };
    
    const handleDrop = async (event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
        const file = event.dataTransfer.files?.[0];
        if (file) {
            await processFile(file);
        }
    };

    const handleDragEvents = (event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        event.stopPropagation();
        if (event.type === 'dragenter' || event.type === 'dragover') {
            setIsDragging(true);
        } else if (event.type === 'dragleave') {
            setIsDragging(false);
        }
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
                if (!sourceImageBase64) {
                    setError('Please upload a source photo.');
                    setPhase('idle');
                    setLoading(false);
                    return;
                }
                const prompt = `Transform the person in this photo into a ${shotType} avatar. Apply a ${avatarStyle} visual style. The avatar should be ${gender}. Additional features or changes: ${featuresString}. Set the background to: ${background}. Key personality trait for the look: ${personality}. The final image should be a high-quality, professional avatar. Retain the likeness of the person in the photo but fully adapt them to the new style.`;
                result = await generateAvatarFromPhoto(sourceImageBase64.data, sourceImageBase64.mimeType, prompt);
            }

            if (result) {
                setAvatarBase64(result);
                setPhase('ready');
                addContentToHistory({
                    type: 'Avatar',
                    summary: `Avatar: ${generationMode === 'scratch' ? [hairStyle, hairColor, clothingTop].filter(Boolean).join(', ') : `from photo, ${avatarStyle} style`}`,
                    content: { gender, style: avatarStyle, hairStyle, hairColor, eyeColor, facialHair, glasses, otherFacialFeatures, clothingTop, clothingBottom, clothingShoes, accessoriesHat, accessoriesJewelry, extraDetails, background, shotType, avatarBase64: result }
                });
                logActivity(`generated a ${avatarStyle} avatar ${generationMode === 'photo' ? 'from a photo' : 'from scratch'}`, 'User');
            } else {
                throw new Error('The AI did not return an image. Please try adjusting your prompt.');
            }
        } catch (e: any) {
            setError(e.message || 'An error occurred while generating the avatar.');
            setPhase('idle');
        } finally {
            setLoading(false);
        }
    }, [generationMode, sourceImageBase64, gender, avatarStyle, hairStyle, hairColor, eyeColor, facialHair, glasses, otherFacialFeatures, clothingTop, clothingBottom, clothingShoes, accessoriesHat, accessoriesJewelry, extraDetails, background, shotType, personality, faceDetails, clothingString, accessoriesString, addContentToHistory, logActivity]);
    
    const handleSurpriseMe = async () => {
        setIsSurprising(true);
        setError(null);
        try {
            const profile = await generateRandomAvatarProfile();
            setGender(profile.gender);
            setAvatarStyle(profile.avatarStyle);
            setHairStyle(profile.hairStyle);
            setHairColor(profile.hairColor);
            setEyeColor(profile.eyeColor);
            setFacialHair(profile.facialHair);
            setGlasses(profile.glasses);
            setOtherFacialFeatures(profile.otherFacialFeatures);
            setClothingTop(profile.clothingTop);
            setClothingBottom(profile.clothingBottom);
            setClothingShoes(profile.clothingShoes);
            setAccessoriesHat(profile.accessoriesHat);
            setAccessoriesJewelry(profile.accessoriesJewelry);
            setExtraDetails(profile.extraDetails);
            setBackground(profile.background);
            setShotType(profile.shotType);
            setPersonality(profile.personality);
            showToast("Avatar profile randomized!");
        } catch (e: any) {
            setError(e.message || "Failed to generate a random profile.");
        } finally {
            setIsSurprising(false);
        }
    };
    
    const handleApplyEdit = async () => {
        if (!editPrompt.trim() || !avatarBase64) {
            showToast('Please enter an edit instruction.');
            return;
        }
        setIsEditingAvatar(true);
        setError(null);
        try {
            const editedAvatar = await generateAvatarFromPhoto(avatarBase64, 'image/png', editPrompt);
            if (editedAvatar) {
                setAvatarBase64(editedAvatar);
                setEditPrompt('');
                showToast("Avatar updated!");
            } else {
                throw new Error("The AI didn't return an edited image. Try a different prompt.");
            }
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsEditingAvatar(false);
        }
    };
    
    const cleanupAudio = useCallback(() => {
        const resources = audioResourcesRef.current;
        resources.stream?.getTracks().forEach(track => track.stop());
        resources.scriptProcessor?.disconnect();
        resources.inputAudioContext?.close().catch(console.error);
        resources.outputAudioContext?.close().catch(console.error);
        resources.sources.forEach(source => source.stop());
        
        audioResourcesRef.current = { stream: null, inputAudioContext: null, outputAudioContext: null, scriptProcessor: null, sources: new Set(), nextStartTime: 0 };
    }, []);

    const handleStartTextChat = useCallback(async () => {
        setInteractionMode('text');
        setPhase('conversing');
        setStatus('READY');
        setTranscript([]);

        const initialGreeting = "Hello! It's great to meet you. What's on your mind?";
        const chatInstance = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction,
            },
            history: [
                { role: 'model', parts: [{ text: initialGreeting }] }
            ]
        });
        textChatRef.current = chatInstance;
        setTranscript([{ source: 'avatar', text: initialGreeting }]);

    }, [systemInstruction]);

    const handleSendTextMessage = useCallback(async () => {
        if (!textInput.trim() || isTextLoading || !textChatRef.current) return;
        
        const currentInput = textInput;
        setTextInput('');
        setIsTextLoading(true);
        setTranscript(prev => [...prev, { source: 'user', text: currentInput }]);
        
        let fullResponse = '';
        try {
            const stream = await textChatRef.current.sendMessageStream({ message: currentInput });
            setTranscript(prev => [...prev, { source: 'avatar', text: '' }]);
            for await (const chunk of stream) {
                fullResponse += chunk.text;
                setTranscript(prev => {
                    const newHistory = [...prev];
                    const lastMessage = newHistory[newHistory.length - 1];
                    if (lastMessage?.source === 'avatar') {
                        lastMessage.text = fullResponse;
                    }
                    return newHistory;
                });
            }
        } catch (err) {
            setError('An error occurred during the chat. Please try again.');
            setTranscript(prev => [...prev, { source: 'avatar', text: "Sorry, I'm having trouble connecting." }]);
        } finally {
            setIsTextLoading(false);
        }

    }, [isTextLoading, textInput]);

    const handleStartLiveConversation = useCallback(async () => {
        setInteractionMode('voice');
        setPhase('conversing');
        setStatus('CONNECTING...');
        setTranscript([]);
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            const resources = audioResourcesRef.current;
            resources.stream = stream;
            resources.inputAudioContext = new ((window as any).AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            resources.outputAudioContext = new ((window as any).AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } },
                    },
                    systemInstruction,
                },
                callbacks: {
                    onopen: () => {
                        setStatus('LISTENING');
                        const source = resources.inputAudioContext!.createMediaStreamSource(stream);
                        resources.scriptProcessor = resources.inputAudioContext!.createScriptProcessor(4096, 1, 1);
                        resources.scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob = createBlob(inputData);
                            sessionPromiseRef.current?.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        source.connect(resources.scriptProcessor);
                        resources.scriptProcessor.connect(resources.inputAudioContext!.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        let currentInput = '';
                        let currentOutput = '';
                        if (message.serverContent?.inputTranscription) {
                            currentInput += message.serverContent.inputTranscription.text;
                        }
                        if (message.serverContent?.outputTranscription) {
                            currentOutput += message.serverContent.outputTranscription.text;
                        }
                        if (message.serverContent?.turnComplete) {
                            addContentToHistory({
                                type: 'Avatar Conversation',
                                summary: `Chat with ${avatarStyle} avatar`,
                                content: { userInput: currentInput, avatarResponse: currentOutput }
                            });
                            setTranscript(prev => [...prev, { source: 'user', text: currentInput }, { source: 'avatar', text: currentOutput }]);
                        }

                        const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                        if (base64EncodedAudioString) {
                            setStatus('SPEAKING');
                            resources.nextStartTime = Math.max(resources.nextStartTime, resources.outputAudioContext!.currentTime);
                            const audioBuffer = await decodeAudioData(decode(base64EncodedAudioString), resources.outputAudioContext!, 24000, 1);
                            const sourceNode = resources.outputAudioContext!.createBufferSource();
                            sourceNode.buffer = audioBuffer;
                            sourceNode.connect(resources.outputAudioContext!.destination);
                            sourceNode.addEventListener('ended', () => {
                                resources.sources.delete(sourceNode);
                                if(resources.sources.size === 0) {
                                    setStatus('LISTENING');
                                }
                            });
                            sourceNode.start(resources.nextStartTime);
                            resources.nextStartTime += audioBuffer.duration;
                            resources.sources.add(sourceNode);
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Live session error:', e);
                        setError('A conversation error occurred.');
                        setPhase('ended');
                        setStatus('ENDED');
                        cleanupAudio();
                    },
                    onclose: (e: CloseEvent) => {
                        console.debug('Live session closed');
                        setPhase('ended');
                        setStatus('ENDED');
                        cleanupAudio();
                    },
                },
            });
            await sessionPromiseRef.current;

        } catch (err: any) {
            setError(`Failed to start conversation: ${err.message}. Please ensure microphone access is granted.`);
            setPhase('ready');
            cleanupAudio();
        }
    }, [voice, systemInstruction, cleanupAudio, addContentToHistory, avatarStyle]);

    const handleEndConversation = useCallback(() => {
        sessionPromiseRef.current?.then(session => session.close());
        cleanupAudio();
        setInteractionMode('none');
        setPhase('ready');
        setStatus('READY');
        if (textChatRef.current) {
            textChatRef.current = null;
        }
    }, [cleanupAudio]);

    useEffect(() => {
        return () => handleEndConversation(); // Cleanup on unmount
    }, [handleEndConversation]);

    const handleDownloadAvatar = () => {
        if (!avatarBase64) return;
        const link = document.createElement('a');
        link.href = `data:image/png;base64,${avatarBase64}`;
        link.download = `utrend_avatar_${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (user?.plan !== 'pro') {
        return (
            <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-8 shadow-xl backdrop-blur-xl text-center flex flex-col items-center animate-slide-in-up">
                <Star className="w-12 h-12 text-yellow-400 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Upgrade to Pro for the AI Avatar Creator</h2>
                <p className="text-slate-400 mb-6 max-w-md">The Avatar Creator is a Pro feature. Upgrade to design and converse with your own AI avatar.</p>
                <button
                    onClick={() => setActiveTab(Tab.Pricing)}
                    className="flex items-center gap-2 bg-gradient-to-r from-violet-dark to-violet-light text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity"
                >
                    View Plans
                </button>
            </div>
        );
    }
    
    const GenerationUI = () => (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left side - Form */}
            <div className="bg-brand-glass border border-slate-700/50 rounded-2xl p-6 space-y-5">
                <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
                    <button onClick={() => setGenerationMode('scratch')} className={`w-1/2 text-sm py-2 rounded-md transition-colors font-semibold ${generationMode === 'scratch' ? 'bg-violet' : 'hover:bg-slate-700'}`}>From Scratch</button>
                    <button onClick={() => setGenerationMode('photo')} className={`w-1/2 text-sm py-2 rounded-md transition-colors font-semibold ${generationMode === 'photo' ? 'bg-violet' : 'hover:bg-slate-700'}`}>From Photo</button>
                </div>
                {error && <p className="text-red-400 text-center text-sm bg-red-500/10 p-2 rounded-lg">{error}</p>}
                
                {generationMode === 'photo' && (
                    <div className="flex items-center justify-center w-full">
                       <label 
                            htmlFor="photo-upload" 
                            onDrop={handleDrop}
                            onDragOver={handleDragEvents}
                            onDragEnter={handleDragEvents}
                            onDragLeave={handleDragEvents}
                            className={`flex flex-col items-center justify-center w-full h-48 border-2 border-slate-700 border-dashed rounded-xl cursor-pointer bg-slate-800/50 transition-colors ${isDragging ? 'border-violet-500 bg-slate-700/50' : 'hover:bg-slate-700/50'}`}
                        >
                            {sourceImageBase64 ? (
                                <img src={sourceImageBase64.url} alt="Source" className="w-full h-full object-contain rounded-lg p-2" />
                            ) : (
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <UploadCloud className="w-8 h-8 mb-4 text-slate-400" />
                                    <p className="mb-2 text-sm text-slate-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                    <p className="text-xs text-slate-500">PNG or JPG (MAX. 4MB)</p>
                                </div>
                            )}
                            <input id="photo-upload" type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleFileChange} />
                        </label>
                    </div>
                )}
                
                <AccordionSection title="Appearance" defaultOpen>
                    <CustomSelect label="Gender" value={gender} onChange={setGender} options={genders} />
                    <CustomSelect label="Avatar Style" value={avatarStyle} onChange={setAvatarStyle} options={avatarStyles} />
                    <CustomSelect label="Hair Style" value={hairStyle} onChange={setHairStyle} options={hairStyles} />
                    <div><label className="input-label">Hair Color</label><input type="text" value={hairColor} onChange={e => setHairColor(e.target.value)} placeholder="e.g., Electric Blue" className="form-input"/></div>
                    <CustomSelect label="Eye Color" value={eyeColor} onChange={setEyeColor} options={eyeColors} />
                    <CustomSelect label="Facial Hair" value={facialHair} onChange={setFacialHair} options={facialHairOptions} />
                    <CustomSelect label="Glasses" value={glasses} onChange={setGlasses} options={glassesOptions} />
                    <div><label className="input-label">Other Facial Features</label><input type="text" value={otherFacialFeatures} onChange={e => setOtherFacialFeatures(e.target.value)} placeholder="e.g., Freckles, Scar" className="form-input"/></div>
                </AccordionSection>
                <AccordionSection title="Clothing & Accessories">
                    <div><label className="input-label">Top</label><input type="text" value={clothingTop} onChange={e => setClothingTop(e.target.value)} placeholder="e.g., Leather Jacket" className="form-input"/></div>
                    <div><label className="input-label">Bottom</label><input type="text" value={clothingBottom} onChange={e => setClothingBottom(e.target.value)} placeholder="e.g., Ripped Jeans" className="form-input"/></div>
                    <div><label className="input-label">Shoes</label><input type="text" value={clothingShoes} onChange={e => setClothingShoes(e.target.value)} placeholder="e.g., Combat Boots" className="form-input"/></div>
                    <div><label className="input-label">Hat</label><input type="text" value={accessoriesHat} onChange={e => setAccessoriesHat(e.target.value)} placeholder="e.g., Beanie" className="form-input"/></div>
                    <div><label className="input-label">Jewelry</label><input type="text" value={accessoriesJewelry} onChange={e => setAccessoriesJewelry(e.target.value)} placeholder="e.g., Silver Necklace" className="form-input"/></div>
                    <div><label className="input-label">Extra Details</label><input type="text" value={extraDetails} onChange={e => setExtraDetails(e.target.value)} placeholder="e.g., Tattoos, Backpack" className="form-input"/></div>
                </AccordionSection>
                <AccordionSection title="Composition & Personality">
                     <div><label className="input-label">Background</label><input type="text" value={background} onChange={e => setBackground(e.target.value)} placeholder="e.g., Neon-lit alleyway" className="form-input"/></div>
                    <CustomSelect label="Shot Type" value={shotType} onChange={setShotType} options={shotTypes} />
                    <div className="sm:col-span-2"><label className="input-label">Personality (1 sentence)</label><input type="text" value={personality} onChange={e => setPersonality(e.target.value)} placeholder="e.g., A cynical detective with a heart of gold." className="form-input"/></div>
                </AccordionSection>

                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                    <button onClick={handleSurpriseMe} disabled={isSurprising || loading} className="button-secondary w-full"><Wand className="w-5 h-5 mr-2"/> Surprise Me!</button>
                    <button onClick={handleGenerate} disabled={loading || isSurprising} className="button-primary w-full !py-3 !text-base"><UserIcon className="w-5 h-5 mr-2"/> Generate Avatar</button>
                </div>
            </div>

            {/* Right side - Preview */}
            <div className="bg-black/20 border border-slate-700/50 rounded-2xl p-6 flex flex-col items-center justify-center">
                <div className="w-full max-w-md aspect-square bg-slate-900/30 rounded-lg flex items-center justify-center relative overflow-hidden">
                    {loading ? (
                        <div className="text-center">
                            <Spinner size="lg" />
                            <p className="mt-4 text-slate-300">Generating your masterpiece...</p>
                        </div>
                    ) : avatarBase64 ? (
                        <img src={`data:image/png;base64,${avatarBase64}`} alt="Generated Avatar" className="w-full h-full object-contain rounded-lg animate-scale-in" />
                    ) : (
                        <div className="text-center text-slate-500">
                            <UserIcon className="w-24 h-24 mx-auto mb-2 text-slate-700 animate-breathing" />
                            <p className="font-semibold">Your avatar will appear here</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const ConversationUI = () => (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left side - Avatar & Controls */}
            <div className="space-y-6">
                <div className="bg-brand-glass border border-slate-700/50 rounded-2xl p-4">
                    <div className="relative">
                        <img src={`data:image/png;base64,${avatarBase64}`} alt="Generated Avatar" className="w-full aspect-square object-contain rounded-lg bg-slate-900/30 animate-breathing" />
                        {interactionMode === 'voice' && <div className="absolute bottom-4 left-1/2 -translate-x-1/2"><StatusIndicator status={status} /></div>}
                    </div>
                    <div className="mt-4 flex flex-col gap-3">
                        <button onClick={handleDownloadAvatar} className="button-secondary w-full"><Download className="w-4 h-4 mr-2"/> Download</button>
                        <button onClick={() => setPhase('idle')} className="button-secondary w-full"><RefreshCw className="w-4 h-4 mr-2"/> Create New Avatar</button>
                    </div>
                </div>
                {/* Post-generation Edit */}
                 <div className="bg-brand-glass border border-slate-700/50 rounded-2xl p-4">
                     <h3 className="font-semibold text-slate-200 mb-2">Quick Edit</h3>
                     <div className="flex gap-2">
                        <input type="text" value={editPrompt} onChange={e => setEditPrompt(e.target.value)} placeholder="e.g., make the hair blue" className="form-input"/>
                        <button onClick={handleApplyEdit} disabled={isEditingAvatar} className="button-primary px-3">{isEditingAvatar ? <Spinner size="sm"/> : <Edit className="w-4 h-4"/>}</button>
                     </div>
                 </div>
            </div>
            
            {/* Right side - Conversation */}
            <div className="lg:col-span-2 bg-brand-glass border border-slate-700/50 rounded-2xl flex flex-col">
                {interactionMode === 'none' ? (
                     <div className="flex-grow flex flex-col justify-center items-center p-6 text-center">
                        <h3 className="text-2xl font-bold mb-4 text-white">Start a Conversation</h3>
                        <p className="text-slate-400 mb-6">Choose how you want to interact with your new avatar.</p>
                        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                            <button onClick={handleStartLiveConversation} className="button-primary w-full !py-3"><Mic className="w-5 h-5 mr-2" /> Voice Chat</button>
                            <button onClick={handleStartTextChat} className="button-secondary w-full !py-3"><MessageSquare className="w-5 h-5 mr-2" /> Text Chat</button>
                        </div>
                        <div className="mt-6 w-full max-w-sm">
                            <CustomSelect label="Voice Style" value={voice} onChange={setVoice} options={voices} />
                        </div>
                        {error && <p className="text-red-400 mt-4 text-sm">{error}</p>}
                    </div>
                ) : (
                    <>
                        <div className="p-4 border-b border-slate-700/50 flex justify-between items-center">
                            <h3 className="font-bold text-lg">{interactionMode === 'voice' ? 'Live Conversation' : 'Text Chat'}</h3>
                            <button onClick={handleEndConversation} className="button-danger px-3 py-1.5 text-sm"><Phone className="w-4 h-4 mr-2"/> End</button>
                        </div>
                        <div className="flex-grow p-4 space-y-4 overflow-y-auto">
                            {transcript.map((entry, i) => (
                                <div key={i} className={`flex items-start gap-3 ${entry.source === 'user' ? 'justify-end' : ''}`}>
                                     {entry.source === 'avatar' && <div className="w-8 h-8 rounded-full bg-slate-700 flex-shrink-0 mt-1"><img src={`data:image/png;base64,${avatarBase64}`} className="w-full h-full rounded-full"/></div>}
                                    <p className={`px-4 py-2 rounded-2xl max-w-md ${entry.source === 'user' ? 'bg-violet text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>{entry.text}</p>
                                </div>
                            ))}
                        </div>
                        {interactionMode === 'text' && (
                            <div className="p-4 border-t border-slate-700/50">
                                <div className="relative">
                                     <input 
                                        type="text" 
                                        value={textInput} 
                                        onChange={e => setTextInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleSendTextMessage()}
                                        placeholder="Type your message..."
                                        disabled={isTextLoading}
                                        className="form-input pr-12"
                                    />
                                    <button onClick={handleSendTextMessage} disabled={isTextLoading || !textInput.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-violet disabled:opacity-50">
                                        {isTextLoading ? <Spinner size="sm" /> : <Send className="w-5 h-5 text-white" />}
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
    

    return (
        <div className="animate-slide-in-up">
            <h2 className="text-3xl font-bold text-center mb-1 text-slate-100 flex items-center justify-center gap-2">
                <UserIcon className="w-8 h-8 text-violet-400" /> AI Avatar Creator
            </h2>
            <p className="text-center text-slate-400 mb-8">Design your own AI persona and bring it to life.</p>
            {phase === 'idle' || phase === 'generating' ? <GenerationUI /> : <ConversationUI />}
        </div>
    );
};

export default AvatarCreator;
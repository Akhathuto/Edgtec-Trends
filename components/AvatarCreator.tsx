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
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg transition-all duration-300 overflow-hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full p-3 font-semibold text-slate-200 cursor-pointer flex justify-between items-center list-none hover:bg-slate-800/20">
                {title}
                <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`transition-[max-height,padding] duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-screen' : 'max-h-0'}`}>
                 <div className="p-3 border-t border-slate-700/50">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {children}
                    </div>
                </div>
            </div>
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
                        resources.scriptProcessor = resources.inputAudioContext!.createScriptProcessor(
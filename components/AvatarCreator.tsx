import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob as GenAiBlob, Chat } from '@google/genai';
import { generateAvatar } from '../services/geminiService.ts';
import Spinner from './Spinner.tsx';
import { Star, RefreshCw, User as UserIcon, Download, Mic, Phone, Save, MessageSquare, Send } from './Icons.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { Tab } from '../types.ts';
import { useToast } from '../contexts/ToastContext.tsx';

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

const avatarStyles = ['Cartoon', 'Realistic', 'Anime', 'Pixel Art', '3D Model'];
const genders = ['Male', 'Female', 'Non-binary'];
const shotTypes = ['Close-up Portrait', 'Upper Body Shot', 'Full Body Shot'];
const voices = ['Zephyr', 'Puck', 'Charon', 'Kore', 'Fenrir'];
const hairStyles = ['Short & Spiky', 'Long & Wavy', 'Curly Afro', 'Sleek Bob', 'Top Knot', 'Bald'];
const eyeColors = ['Brown', 'Blue', 'Green', 'Hazel', 'Grey', 'Amber', 'Red'];
const facialHairOptions = ['None', 'Short Beard', 'Full Beard', 'Mustache', 'Goatee'];
const glassesOptions = ['None', 'Reading Glasses', 'Sunglasses', 'Goggles'];


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

const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div>
        <h3 className="text-lg font-semibold text-slate-200 mb-4 border-b border-slate-700/50 pb-2">{title}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {children}
        </div>
    </div>
);


const AvatarCreator: React.FC<AvatarCreatorProps> = ({ setActiveTab }) => {
    const { user, logActivity, addContentToHistory } = useAuth();
    const { showToast } = useToast();

    // Generation State
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
    
    const handleGenerate = useCallback(async () => {
        const customDetailsProvided = hairColor.trim() || otherFacialFeatures.trim() || clothingTop.trim() || clothingBottom.trim() || clothingShoes.trim() || accessoriesHat.trim() || accessoriesJewelry.trim() || extraDetails.trim();
        if (!customDetailsProvided) {
            setError('Please provide some details for your avatar (e.g., hair color, clothing, features).');
            return;
        }
        setLoading(true);
        setPhase('generating');
        setError(null);
        setAvatarBase64(null);

        const featuresString = `Hair: ${hairStyle}${hairColor ? `, ${hairColor}` : ''}. Eyes: ${eyeColor}. Face: ${faceDetails || 'not specified'}. Clothing: ${clothingString || 'not specified'}. Accessories: ${accessoriesString || 'not specified'}. Other details: ${extraDetails || 'none'}.`;


        try {
            const result = await generateAvatar(gender, avatarStyle, featuresString, background, shotType);
            setAvatarBase64(result);
            setPhase('ready');
            addContentToHistory({
                type: 'Avatar',
                summary: `Avatar: ${[hairStyle, hairColor, clothingTop].filter(Boolean).join(', ').substring(0, 40)}...`,
                content: { gender, style: avatarStyle, hairStyle, hairColor, eyeColor, facialHair, glasses, otherFacialFeatures, clothingTop, clothingBottom, clothingShoes, accessoriesHat, accessoriesJewelry, extraDetails, background, shotType, avatarBase64: result }
            });
            logActivity(`generated a ${avatarStyle} avatar`, 'User');
        } catch (e: any) {
            setError(e.message || 'An error occurred while generating the avatar.');
            setPhase('idle');
        } finally {
            setLoading(false);
        }
    }, [gender, avatarStyle, hairStyle, hairColor, eyeColor, facialHair, glasses, otherFacialFeatures, clothingTop, clothingBottom, clothingShoes, accessoriesHat, accessoriesJewelry, extraDetails, background, shotType, addContentToHistory, logActivity, faceDetails, clothingString, accessoriesString]);
    
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
                            const int16 = new Int16Array(inputData.length);
                            for (let i = 0; i < inputData.length; i++) {
                                int16[i] = inputData[i] * 32768;
                            }
                            const pcmBlob: GenAiBlob = {
                                data: encode(new Uint8Array(int16.buffer)),
                                mimeType: 'audio/pcm;rate=16000',
                            };
                            sessionPromiseRef.current?.then(session => session.sendRealtimeInput({ media: pcmBlob }));
                        };
                        source.connect(resources.scriptProcessor);
                        resources.scriptProcessor.connect(resources.inputAudioContext!.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.serverContent?.inputTranscription?.text) {
                            setTranscript(prev => {
                                const last = prev[prev.length-1];
                                if(last?.source === 'user' && !message.serverContent?.turnComplete) {
                                    return [...prev.slice(0, -1), { source: 'user', text: last.text + message.serverContent!.inputTranscription!.text }];
                                }
                                return [...prev, { source: 'user', text: message.serverContent!.inputTranscription!.text }];
                            });
                        }
                         if (message.serverContent?.outputTranscription?.text) {
                             setStatus('SPEAKING');
                             setTranscript(prev => {
                                const last = prev[prev.length-1];
                                if(last?.source === 'avatar' && !message.serverContent?.turnComplete) {
                                    return [...prev.slice(0, -1), { source: 'avatar', text: last.text + message.serverContent!.outputTranscription!.text }];
                                }
                                return [...prev, { source: 'avatar', text: message.serverContent!.outputTranscription!.text }];
                            });
                        }
                        if (message.serverContent?.turnComplete) {
                            setStatus('LISTENING');
                        }

                        const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                        if (audioData && resources.outputAudioContext) {
                            const audioBuffer = await decodeAudioData(decode(audioData), resources.outputAudioContext, 24000, 1);
                            const sourceNode = resources.outputAudioContext.createBufferSource();
                            sourceNode.buffer = audioBuffer;
                            sourceNode.connect(resources.outputAudioContext.destination);
                            
                            const startTime = Math.max(resources.nextStartTime, resources.outputAudioContext.currentTime);
                            sourceNode.start(startTime);
                            resources.nextStartTime = startTime + audioBuffer.duration;
                            resources.sources.add(sourceNode);
                            sourceNode.onended = () => resources.sources.delete(sourceNode);
                        }
                    },
                    onclose: () => {
                        cleanupAudio();
                        setStatus('ENDED');
                    },
                    onerror: (e: ErrorEvent) => {
                        setError(`Conversation error: ${e.message}. Please try again.`);
                        setPhase('ready');
                        cleanupAudio();
                    },
                }
            });

        } catch (err: any) {
             setError(`Could not start conversation: ${err.message}. Please ensure microphone access is allowed.`);
             setPhase('ready');
        }
    }, [cleanupAudio, voice, systemInstruction]);

    const handleEndConversation = useCallback(() => {
        if (interactionMode === 'voice') {
            sessionPromiseRef.current?.then(session => session.close());
            cleanupAudio();
        }
        textChatRef.current = null;
        setPhase('ended');
        setStatus('ENDED');
    }, [cleanupAudio, interactionMode]);
    
    const handleSaveTranscript = () => {
        const fullTranscript = transcript.map(t => `${t.source === 'user' ? 'You' : 'Avatar'}: ${t.text}`).join('\n\n');
        const summary = `Conversation with ${avatarStyle} avatar (${[hairStyle, hairColor, clothingTop].filter(Boolean).join(', ')})`;
        addContentToHistory({
            type: 'Avatar Conversation',
            summary: summary.substring(0, 100),
            content: { avatarPrompt: systemInstruction, transcript: fullTranscript }
        });
        showToast("Conversation saved to your history!");
    }

    const handleDownload = () => {
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
        setAvatarBase64(null);
        setError(null);
        setHairStyle(hairStyles[0]);
        setHairColor('');
        setEyeColor(eyeColors[0]);
        setFacialHair(facialHairOptions[0]);
        setGlasses(glassesOptions[0]);
        setOtherFacialFeatures('');
        setClothingTop('');
        setClothingBottom('');
        setClothingShoes('');
        setAccessoriesHat('');
        setAccessoriesJewelry('');
        setExtraDetails('');
        setBackground('');
        setPersonality('');
        setShotType(shotTypes[0]);
        setGender(genders[0]);
        setAvatarStyle(avatarStyles[0]);
        setPhase('idle');
        setInteractionMode('none');
    }

    if (user?.plan !== 'pro') {
        return (
            <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-8 shadow-xl backdrop-blur-xl text-center flex flex-col items-center animate-slide-in-up">
                <Star className="w-12 h-12 text-yellow-400 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Upgrade to Pro for the AI Avatar Creator</h2>
                <p className="text-slate-400 mb-6 max-w-md">The Avatar Creator is a Pro feature. Upgrade your account to create a unique avatar for your brand or profile.</p>
                <button
                    onClick={() => setActiveTab(Tab.Pricing)}
                    className="flex items-center gap-2 bg-gradient-to-r from-violet-dark to-violet-light text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity shadow-md hover:shadow-lg hover:shadow-violet/30"
                >
                    View Plans
                </button>
            </div>
        )
    }

    // --- RENDER LOGIC ---

    // PHASE 1: IDLE / GENERATING (The Creation Studio)
    if (phase === 'idle' || phase === 'generating') {
        return (
            <div className="animate-slide-in-up">
                <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl">
                    <h2 className="text-2xl font-bold text-center mb-1 text-slate-100 flex items-center justify-center gap-2">
                        <UserIcon className="w-6 h-6 text-violet-400" /> AI Avatar Creator
                    </h2>
                    <p className="text-center text-slate-400 mb-6">
                        Design your AI persona, then bring it to life.
                    </p>
                    
                    {phase === 'generating' ? (
                        <div className="text-center py-10">
                            <Spinner size="lg" />
                            <p className="mt-4 text-slate-300 font-semibold text-lg">Creating your avatar...</p>
                            <p className="mt-1 text-slate-400 text-sm">This can take a moment.</p>
                        </div>
                    ) : (
                        <div className="space-y-8 max-w-4xl mx-auto">
                           <FormSection title="Appearance">
                                <div>
                                    <label className="input-label" htmlFor="avatar-gender">Gender</label>
                                    <select id="avatar-gender" value={gender} onChange={(e) => setGender(e.target.value)} className="form-select">
                                        {genders.map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="input-label" htmlFor="avatar-style">Visual Style</label>
                                    <select id="avatar-style" value={avatarStyle} onChange={(e) => setAvatarStyle(e.target.value)} className="form-select">
                                        {avatarStyles.map(style => <option key={style} value={style}>{style}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="input-label" htmlFor="hair-style">Hair Style</label>
                                    <select id="hair-style" value={hairStyle} onChange={(e) => setHairStyle(e.target.value)} className="form-select">
                                        {hairStyles.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="input-label" htmlFor="hair-color">Hair Color</label>
                                    <input id="hair-color" value={hairColor} onChange={(e) => setHairColor(e.target.value)} placeholder="e.g., 'neon blue'" className="form-input"/>
                                </div>
                                 <div>
                                    <label className="input-label" htmlFor="eye-color">Eye Color</label>
                                    <select id="eye-color" value={eyeColor} onChange={(e) => setEyeColor(e.target.value)} className="form-select">
                                        {eyeColors.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </FormSection>
                            <FormSection title="Features">
                                <div>
                                    <label className="input-label" htmlFor="facial-hair">Facial Hair</label>
                                    <select id="facial-hair" value={facialHair} onChange={(e) => setFacialHair(e.target.value)} className="form-select">
                                        {facialHairOptions.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="input-label" htmlFor="glasses">Glasses</label>
                                    <select id="glasses" value={glasses} onChange={(e) => setGlasses(e.target.value)} className="form-select">
                                        {glassesOptions.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                </div>
                                 <div className="sm:col-span-2">
                                    <label className="input-label" htmlFor="other-facial-features">Other Facial Features</label>
                                    <input id="other-facial-features" value={otherFacialFeatures} onChange={(e) => setOtherFacialFeatures(e.target.value)} placeholder="e.g., 'freckles, scar over left eye'" className="form-input"/>
                                </div>
                            </FormSection>
                            <FormSection title="Clothing & Accessories">
                                <div>
                                    <label className="input-label" htmlFor="clothing-top">Top Clothing</label>
                                    <input id="clothing-top" value={clothingTop} onChange={(e) => setClothingTop(e.target.value)} placeholder="e.g., 'black hoodie'" className="form-input"/>
                                </div>
                                <div>
                                    <label className="input-label" htmlFor="clothing-bottom">Bottom Clothing</label>
                                    <input id="clothing-bottom" value={clothingBottom} onChange={(e) => setClothingBottom(e.target.value)} placeholder="e.g., 'ripped jeans'" className="form-input"/>
                                </div>
                                {shotType === 'Full Body Shot' && (
                                    <div>
                                        <label className="input-label" htmlFor="clothing-shoes">Shoes</label>
                                        <input id="clothing-shoes" value={clothingShoes} onChange={(e) => setClothingShoes(e.target.value)} placeholder="e.g., 'white sneakers'" className="form-input"/>
                                    </div>
                                )}
                                <div>
                                    <label className="input-label" htmlFor="accessories-hat">Hat</label>
                                    <input id="accessories-hat" value={accessoriesHat} onChange={(e) => setAccessoriesHat(e.target.value)} placeholder="e.g., 'purple beanie'" className="form-input"/>
                                </div>
                                <div>
                                    <label className="input-label" htmlFor="accessories-jewelry">Jewelry</label>
                                    <input id="accessories-jewelry" value={accessoriesJewelry} onChange={(e) => setAccessoriesJewelry(e.target.value)} placeholder="e.g., 'silver chain necklace'" className="form-input"/>
                                </div>
                            </FormSection>
                             <FormSection title="Scene & Personality">
                                <div>
                                    <label className="input-label" htmlFor="shot-type">Shot Type</label>
                                    <select id="shot-type" value={shotType} onChange={(e) => setShotType(e.target.value)} className="form-select">
                                        {shotTypes.map(st => <option key={st} value={st}>{st}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="input-label" htmlFor="avatar-background">Background</label>
                                    <input id="avatar-background" value={background} onChange={(e) => setBackground(e.target.value)} placeholder="e.g., 'cityscape at night'" className="form-input"/>
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="input-label" htmlFor="avatar-extra-details">Extra Visual Details</label>
                                    <textarea id="avatar-extra-details" value={extraDetails} onChange={(e) => setExtraDetails(e.target.value)} placeholder="e.g., 'holding a glowing orb, floating slightly'" className="form-input h-20"/>
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="input-label" htmlFor="avatar-personality">Personality</label>
                                    <textarea id="avatar-personality" value={personality} onChange={(e) => setPersonality(e.target.value)} placeholder="Personality for conversation (e.g., 'sarcastic and witty tech expert')" className="form-input h-20"/>
                                </div>
                            </FormSection>
                            

                            <button onClick={handleGenerate} disabled={loading} className="w-full flex items-center justify-center bg-gradient-to-r from-violet-dark to-violet-light text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 shadow-md hover:shadow-lg hover:shadow-violet/30 transform hover:-translate-y-px text-base mt-6">
                            {loading ? <Spinner /> : <><UserIcon className="w-5 h-5 mr-2" /> Generate Avatar</>}
                            </button>
                            {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // PHASE 2: READY / CONVERSING / ENDED (The Interaction Panel)
    return (
        <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Panel: Avatar & Controls */}
            <div className="lg:col-span-1 bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl flex flex-col items-center justify-start space-y-6">
                <div className="relative w-48 h-48">
                    <div className={`absolute inset-0 rounded-full bg-violet-500/20 ${status === 'SPEAKING' ? 'animate-pulse' : ''}`}></div>
                    <div className={`relative w-full h-full rounded-full bg-slate-800 shadow-lg p-2 ${phase === 'conversing' && status === 'SPEAKING' ? 'animate-breathing' : ''}`}>
                        {avatarBase64 && <img src={`data:image/png;base64,${avatarBase64}`} alt="Generated Avatar" className="w-full h-full object-cover rounded-full"/>}
                    </div>
                </div>
                
                {(phase === 'conversing' || phase === 'ended') && <StatusIndicator status={status} />}

                <div className="w-full space-y-3 pt-6 border-t border-slate-700/50">
                     {phase === 'ready' && (
                         <div className="space-y-3">
                            <button onClick={handleStartTextChat} className="w-full flex items-center justify-center bg-violet hover:bg-violet-dark font-semibold text-white px-4 py-2 rounded-lg transition-colors"><MessageSquare className="w-5 h-5 mr-2"/>Start Text Chat</button>
                            <div className="flex gap-2">
                                <select value={voice} onChange={(e) => setVoice(e.target.value)} className="form-select flex-grow">
                                    {voices.map(v => <option key={v} value={v}>{v} Voice</option>)}
                                </select>
                                <button onClick={handleStartLiveConversation} title="Start Voice Chat" className="flex-shrink-0 !px-4 flex items-center justify-center bg-violet hover:bg-violet-dark font-semibold text-white px-4 py-2 rounded-lg transition-colors"><Mic className="w-5 h-5"/></button>
                            </div>
                        </div>
                    )}

                    {phase === 'conversing' && (
                        <button onClick={handleEndConversation} className="w-full flex items-center justify-center bg-red-600 hover:bg-red-700 font-semibold text-white px-4 py-2 rounded-lg transition-colors">
                            <Phone className="w-5 h-5 mr-2"/>End Conversation
                        </button>
                    )}
                     {phase === 'ended' && (
                        <button onClick={handleSaveTranscript} className="w-full flex items-center justify-center bg-slate-700 hover:bg-slate-600 font-semibold text-white px-4 py-2 rounded-lg transition-colors">
                            <Save className="w-5 h-5 mr-2"/>Save Transcript
                        </button>
                    )}
                    
                    <div className="flex gap-3">
                        <button onClick={handleDownload} className="w-full flex items-center justify-center bg-slate-700 hover:bg-slate-600 font-semibold text-white px-4 py-2 rounded-lg transition-colors"><Download className="w-5 h-5 mr-2"/>Download</button>
                        <button onClick={handleGenerate} disabled={loading} className="w-full flex items-center justify-center bg-slate-700 hover:bg-slate-600 font-semibold text-white px-4 py-2 rounded-lg transition-colors"><RefreshCw className="w-5 h-5 mr-2"/>Regen</button>
                    </div>
                    <button onClick={handleStartOver} className="w-full flex items-center justify-center bg-slate-800 hover:bg-slate-700 font-semibold text-white px-4 py-2 rounded-lg transition-colors">Start Over</button>

                </div>
            </div>
            
            {/* Right Panel: Conversation */}
            <div className="lg:col-span-2 bg-brand-glass border border-slate-700/50 rounded-xl shadow-xl flex flex-col min-h-[70vh]">
                 <header className="p-4 border-b border-slate-700/50 flex-shrink-0">
                    <h3 className="text-lg font-bold text-white text-center">Conversation</h3>
                 </header>

                 {(phase === 'conversing' || phase === 'ended') ? (
                    <>
                        <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                            {transcript.map((entry, index) => (
                                <div key={index} className={`flex items-end gap-2 ${entry.source === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {entry.source === 'avatar' && <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0"><UserIcon className="w-4 h-4 text-violet-300"/></div>}
                                    <p className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${entry.source === 'user' ? 'bg-violet text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
                                        {entry.text}
                                    </p>
                                </div>
                            ))}
                            {isTextLoading && (
                                <div className="flex justify-start items-end gap-2">
                                    <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0"><UserIcon className="w-4 h-4 text-violet-300"/></div>
                                    <p className="max-w-[80%] px-4 py-2 rounded-2xl text-sm bg-slate-700 text-slate-200 rounded-bl-none"><Spinner size="sm"/></p>
                                </div>
                            )}
                        </div>
                        {interactionMode === 'text' && phase === 'conversing' && (
                            <div className="p-4 border-t border-slate-700/50">
                                <div className="relative">
                                    <input type="text" value={textInput} onChange={(e) => setTextInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendTextMessage()} placeholder="Type your message..." className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-violet-light transition-all shadow-inner" disabled={isTextLoading}/>
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                        <button onClick={handleSendTextMessage} className="p-2 rounded-full bg-violet hover:opacity-90 transition-opacity disabled:opacity-50" disabled={isTextLoading || !textInput.trim()}>
                                            <Send className="w-5 h-5 text-white"/>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                 ) : (
                     <div className="flex flex-col items-center justify-center h-full text-center p-6">
                        <h3 className="text-xl font-bold text-white">Ready to Chat?</h3>
                        <p className="text-slate-400 mt-2">Choose an interaction mode to bring your avatar to life. You can have a live voice conversation or a classic text chat.</p>
                    </div>
                 )}
            </div>
        </div>
    );
};

export default AvatarCreator;
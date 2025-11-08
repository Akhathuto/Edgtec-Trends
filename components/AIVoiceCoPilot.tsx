import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob, LiveSession } from '@google/genai';
import { useAuth } from '../contexts/AuthContext';
import { Tab } from '../types';
import { Star, Mic, StopCircle, Play, Info } from './Icons';
import ErrorDisplay from './ErrorDisplay';
import Spinner from './Spinner';

// Helper functions for audio encoding/decoding as per @google/genai guidelines.
function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(i);
  }
  return btoa(binary);
}

function decode(base64: string): Uint8Array {
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

function createBlob(data: Float32Array): Blob {
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

interface AIVoiceCoPilotProps {
  setActiveTab: (tab: Tab) => void;
}

const AIVoiceCoPilot: React.FC<AIVoiceCoPilotProps> = ({ setActiveTab }) => {
  const { user } = useAuth();
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [transcripts, setTranscripts] = useState<{ user: string; model: string }[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentOutput, setCurrentOutput] = useState('');

  const aiRef = useRef<GoogleGenAI | null>(null);
  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextStartTimeRef = useRef(0);
  const outputSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // For audio visualizer
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const analyserNodeRef = useRef<AnalyserNode | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  
  const drawVisualizer = useCallback(() => {
    const analyser = analyserNodeRef.current;
    const canvas = canvasRef.current;
    if (!analyser || !canvas) return;

    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const draw = () => {
        animationFrameIdRef.current = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);

        canvasCtx.fillStyle = '#0f172a'; // slate-900
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

        const barWidth = canvas.width / bufferLength;
        let x = 0;

        const gradient = canvasCtx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, '#8B5CF6'); // violet
        gradient.addColorStop(1, '#14b8a6'); // teal

        for (let i = 0; i < bufferLength; i++) {
            const barHeight = dataArray[i] * (canvas.height / 255.0);
            canvasCtx.fillStyle = gradient;
            canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
            x += barWidth;
        }
    };
    draw();
  }, []);


  const cleanup = useCallback(() => {
    if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
    }
    if (analyserNodeRef.current) {
        analyserNodeRef.current.disconnect();
        analyserNodeRef.current = null;
    }

    if (outputAudioContextRef.current) {
      outputSourcesRef.current.forEach(source => source.stop());
      outputSourcesRef.current.clear();
    }

    if (scriptProcessorRef.current) {
        scriptProcessorRef.current.onaudioprocess = null;
        scriptProcessorRef.current.disconnect();
        scriptProcessorRef.current = null;
    }
    if (mediaStreamSourceRef.current) {
        mediaStreamSourceRef.current.disconnect();
        mediaStreamSourceRef.current = null;
    }
    
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;

    inputAudioContextRef.current?.close().catch(console.error);
    inputAudioContextRef.current = null;
    outputAudioContextRef.current?.close().catch(console.error);
    outputAudioContextRef.current = null;
    
    sessionPromiseRef.current?.then(session => session.close());
    sessionPromiseRef.current = null;

    setStatus('idle');
  }, []);

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  const startConversation = async () => {
    if (status !== 'idle') return;

    setError(null);
    setStatus('connecting');
    setTranscripts([]);
    setCurrentInput('');
    setCurrentOutput('');
    nextStartTimeRef.current = 0;

    try {
        if (!aiRef.current) {
            aiRef.current = new GoogleGenAI({ apiKey: process.env.API_KEY! });
        }
        inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

        streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });

        const sessionPromise = aiRef.current.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            callbacks: {
                onopen: () => {
                    if (!inputAudioContextRef.current || !streamRef.current) return;
                    setStatus('connected');
                    mediaStreamSourceRef.current = inputAudioContextRef.current.createMediaStreamSource(streamRef.current);
                    scriptProcessorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
                    
                    analyserNodeRef.current = inputAudioContextRef.current.createAnalyser();
                    analyserNodeRef.current.fftSize = 256;

                    scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                        const pcmBlob = createBlob(inputData);
                        sessionPromiseRef.current?.then((session) => {
                            session.sendRealtimeInput({ media: pcmBlob });
                        });
                    };

                    mediaStreamSourceRef.current.connect(analyserNodeRef.current);
                    analyserNodeRef.current.connect(scriptProcessorRef.current);
                    scriptProcessorRef.current.connect(inputAudioContextRef.current.destination);

                    drawVisualizer();
                },
                onmessage: async (message: LiveServerMessage) => {
                    const outputAudioContext = outputAudioContextRef.current;
                    if (!outputAudioContext) return;

                    let turnInput = currentInput;
                    let turnOutput = currentOutput;
                    
                    if (message.serverContent?.inputTranscription) {
                        turnInput += message.serverContent.inputTranscription.text;
                        setCurrentInput(turnInput);
                    }
                    if (message.serverContent?.outputTranscription) {
                        turnOutput += message.serverContent.outputTranscription.text;
                        setCurrentOutput(turnOutput);
                    }
                    if (message.serverContent?.turnComplete) {
                        setTranscripts(prev => [...prev, { user: turnInput, model: turnOutput }]);
                        setCurrentInput('');
                        setCurrentOutput('');
                    }

                    const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                    if (base64Audio) {
                        nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContext.currentTime);
                        const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
                        const source = outputAudioContext.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(outputAudioContext.destination);
                        source.addEventListener('ended', () => {
                            outputSourcesRef.current.delete(source);
                        });
                        source.start(nextStartTimeRef.current);
                        nextStartTimeRef.current += audioBuffer.duration;
                        outputSourcesRef.current.add(source);
                    }

                    if (message.serverContent?.interrupted) {
                        outputSourcesRef.current.forEach(source => source.stop());
                        outputSourcesRef.current.clear();
                        nextStartTimeRef.current = 0;
                    }
                },
                onerror: (e: ErrorEvent) => {
                    setError(`Session error: ${e.message}`);
                    setStatus('error');
                    cleanup();
                },
                onclose: () => {
                    if (status !== 'idle') {
                        cleanup();
                    }
                },
            },
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                inputAudioTranscription: {},
                outputAudioTranscription: {},
                systemInstruction: 'You are a friendly and helpful AI co-pilot for a content creator. Keep your responses concise.',
            },
        });
        sessionPromiseRef.current = sessionPromise;

    } catch (e: any) {
        setError(`Failed to start session: ${e.message}`);
        setStatus('error');
        cleanup();
    }
  };

  if (user?.plan !== 'pro') {
    return (
        <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-8 shadow-xl backdrop-blur-xl text-center flex flex-col items-center animate-slide-in-up">
            <Star className="w-12 h-12 text-yellow-400 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Upgrade to Pro for AI Voice Co-Pilot</h2>
            <p className="text-slate-400 mb-6 max-w-md">Have real-time voice conversations with your AI assistant. This is a Pro feature.</p>
            <button onClick={() => setActiveTab(Tab.Pricing)} className="button-primary">View Plans</button>
        </div>
    );
  }

  const statusIndicator = {
    idle: { color: 'bg-slate-500', text: 'Idle' },
    connecting: { color: 'bg-yellow-500 animate-pulse', text: 'Connecting...' },
    connected: { color: 'bg-green-500 animate-pulse', text: 'Live' },
    error: { color: 'bg-red-500', text: 'Error' },
  };

  return (
    <div className="animate-slide-in-up">
        <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl flex flex-col items-center h-[80vh]">
            <h2 className="text-2xl font-bold text-center mb-1 text-slate-100 flex items-center justify-center gap-2">
                <Mic className="w-6 h-6 text-violet-400" /> AI Voice Co-Pilot
            </h2>
            <p className="text-center text-slate-400 mb-4">Have a real-time voice conversation with your AI.</p>
            
            <div className="flex-grow w-full flex flex-col items-center justify-center relative">
                <div className="w-full max-w-2xl h-48 bg-slate-900 rounded-lg border border-slate-700/50 flex items-center justify-center overflow-hidden relative">
                    <canvas ref={canvasRef} className={`w-full h-full transition-opacity duration-300 ${status === 'connected' ? 'opacity-100' : 'opacity-0'}`} />
                    <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-300 ${status !== 'connected' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                        {status === 'idle' && <Mic className="w-24 h-24 text-slate-700" />}
                        {status === 'connecting' && <Spinner size="lg" />}
                        {status === 'error' && <Info className="w-24 h-24 text-red-500/50" />}
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-center gap-2 mb-4">
                <span className={`w-3 h-3 rounded-full ${statusIndicator[status].color}`}></span>
                <p className="text-sm font-semibold text-slate-300">{statusIndicator[status].text}</p>
            </div>
            
            <div className="w-full flex justify-center mb-4">
                 {status === 'idle' || status === 'error' ? (
                    <button onClick={startConversation} className="button-primary text-lg px-8 py-4 flex items-center gap-3">
                        <Play className="w-6 h-6"/> Start Conversation
                    </button>
                ) : status === 'connecting' ? (
                     <button disabled className="button-primary text-lg px-8 py-4 flex items-center gap-3"><Spinner /> Connecting...</button>
                ) : (
                    <button onClick={cleanup} className="bg-red-600 hover:bg-red-700 text-white font-bold text-lg px-8 py-4 rounded-full flex items-center gap-3">
                        <StopCircle className="w-6 h-6"/> Stop Conversation
                    </button>
                )}
            </div>
            
            <div className="w-full bg-slate-800/50 rounded-lg p-4 h-48 overflow-y-auto space-y-4 border border-slate-700">
                {transcripts.map((turn, i) => (
                    <div key={i} className="border-b border-slate-700 pb-2 last:border-b-0 animate-fade-in">
                        <p><strong className="text-violet-300">You:</strong> {turn.user}</p>
                        <p><strong className="text-teal-300">AI:</strong> {turn.model}</p>
                    </div>
                ))}
                 {currentInput && <p><strong className="text-violet-300">You:</strong> <span className="text-slate-400">{currentInput}</span></p>}
                 {currentOutput && <p><strong className="text-teal-300">AI:</strong> <span className="text-slate-400">{currentOutput}</span></p>}
                 {status === 'idle' && transcripts.length === 0 && <p className="text-center text-slate-500 pt-10">Press Start to begin... Transcript will appear here.</p>}
            </div>

            <ErrorDisplay message={error} className="mt-4" />
        </div>
    </div>
  );
};

export default AIVoiceCoPilot;
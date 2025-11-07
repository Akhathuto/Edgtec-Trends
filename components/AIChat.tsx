import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Tab } from '../types';
import { Send, Star, Sparkles, Trash2, Volume2, VolumeX, Gif, Mic, Bot, Paperclip, X, ChevronDown } from './Icons';
import Spinner from './Spinner';
import { useToast } from '../contexts/ToastContext';
import { sendMessageToNolo, generateSpeech } from '../services/geminiService';
import ErrorDisplay from './ErrorDisplay';


declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

interface AIChatProps {
  setActiveTab: (tab: Tab) => void;
}

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  gifUrl?: string;
  imageUrl?: string;
}

const ttsVoices = [
    { name: 'Kore', id: 'Kore' },
    { name: 'Puck', id: 'Puck' },
    { name: 'Zephyr', id: 'Zephyr' },
    { name: 'Charon', id: 'Charon' },
    { name: 'Fenrir', id: 'Fenrir' },
];

// Helper functions for TTS audio decoding
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


const TypingIndicator: React.FC = () => (
    <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 bg-slate-500 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
        <span className="w-2 h-2 bg-slate-500 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
        <span className="w-2 h-2 bg-slate-500 rounded-full animate-pulse"></span>
    </div>
);

const gifs = [
    { url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaDB6a3JscDlyeXE2dGN2aWd2MGRuZmoyY3ozZ3NqZzJjMGFoZjl0ZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7abB06u9bNzA8lu8/giphy.gif', alt: 'Thumbs up' },
    { url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3dta3U4bGI3ZmN5eGNxazFnZ2Y5Znh1NzVqbzRkd2NudXZkbzYyeSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/5GoVLqeAOo6PK/giphy.gif', alt: 'Happy dance' },
    { url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZ2YxbjR2dzZtd3J0ZGdldDFwN200dWF0b3hjaDdsemFkZmpjN2RhayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l3q2K5jinAlChoCLS/giphy.gif', alt: 'Confused' },
    { url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaG1iY2Z3bHVsbHllbjZjaXlna3VubG91d2c1eHpxeXd1bmd1d3hpbCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xT0xeJpnrWC4XWblEk/giphy.gif', alt: 'Mind blown' },
    { url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZ3g5ZWJqajRjZm14cHlwcGtvajZqNjIzNnlqZTN2bmI0am1kM2RuaSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/pUeXcg80cO8I8/giphy.gif', alt: 'Popcorn' },
    { url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbjg1OHM1OGM2eW1vYzF5c3A5bnducGxtNTNpa2JocjNjc2lqNTNnMSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/osjgQPWRx3cac/giphy.gif', alt: 'Thank you' },
];

const GifPicker: React.FC<{ onSelect: (url: string) => void; }> = ({ onSelect }) => {
    return (
        <div className="absolute bottom-full mb-2 right-0 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-80 h-96 animate-fade-in z-10">
            <header className="p-2 border-b border-slate-700">
                <h4 className="text-center font-semibold text-slate-300">Select a GIF</h4>
            </header>
            <div className="p-2 grid grid-cols-3 gap-2 overflow-y-auto h-[calc(100%-41px)]">
                {gifs.map(gif => (
                    <button key={gif.url} onClick={() => onSelect(gif.url)} className="aspect-square bg-slate-800 rounded-md overflow-hidden hover:ring-2 ring-violet-500 focus:outline-none focus:ring-2 ring-violet-500">
                        <img src={gif.url} alt={gif.alt} className="w-full h-full object-cover" loading="lazy" />
                    </button>
                ))}
            </div>
        </div>
    );
};


export const AIChat: React.FC<AIChatProps> = ({ setActiveTab }) => {
  const { user, logActivity } = useAuth();
  const { showToast } = useToast();
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTtsEnabled, setIsTtsEnabled] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(ttsVoices[0].id);
  const [isGifPickerOpen, setIsGifPickerOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const conversationStarters = [
    "Give me 3 viral video ideas about retro gaming",
    "How can I improve my YouTube thumbnails?",
    "Write a short, hooky script for a TikTok about AI",
    "What are some trending audio clips right now?",
  ];

  const speak = useCallback(async (text: string) => {
    if (audioSourceRef.current) {
        audioSourceRef.current.stop();
        audioSourceRef.current = null;
    }

    const audioContext = audioContextRef.current;
    if (!audioContext) {
        setError("Web Audio API is not supported in this browser.");
        return;
    }

    if (audioContext.state === 'suspended') {
        await audioContext.resume();
    }

    try {
        const base64Audio = await generateSpeech(text, selectedVoice);
        if (base64Audio) {
            const audioBuffer = await decodeAudioData(
                decode(base64Audio),
                audioContext,
                24000,
                1,
            );
            
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContext.destination);
            source.start();
            
            audioSourceRef.current = source;
        } else {
             setError("Could not generate speech for the response.");
        }
    } catch (e: any) {
        console.error("TTS Error:", e);
        setError(`Text-to-speech failed: ${e.message}`);
    }
  }, [selectedVoice]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            const base64Data = result.split(',')[1];
            resolve(base64Data);
        };
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
  };
  
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        console.warn("Speech Recognition API is not supported in this browser.");
        return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            }
        }
        if (finalTranscript) {
            setInput(prevInput => prevInput.trim() ? prevInput + ' ' + finalTranscript : finalTranscript);
        }
    };

    recognition.onend = () => { setIsRecording(false); };
    
    recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        let errorMessage = `Speech recognition error: ${event.error}`;
        if (event.error === 'no-speech') {
            errorMessage = "I didn't hear anything. Please try again.";
        } else if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            errorMessage = "Microphone access was denied. Please allow microphone access in your browser settings.";
        }
        setError(errorMessage);
        setIsRecording(false);
    };

    recognitionRef.current = recognition;
}, []);

  useEffect(() => {
    const savedTtsPref = localStorage.getItem('utrend-tts-enabled');
    if (savedTtsPref) { setIsTtsEnabled(JSON.parse(savedTtsPref)); }
    const savedVoice = localStorage.getItem('utrend-tts-voice');
    if (savedVoice) { setSelectedVoice(savedVoice); }
    
    if (!audioContextRef.current) {
        try {
             audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        } catch (e) {
            console.error("Web Audio API is not supported in this browser.", e);
            setError("Your browser does not support the audio playback required for Text-to-Speech.");
        }
    }

    return () => {
        audioSourceRef.current?.stop();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('utrend-tts-enabled', JSON.stringify(isTtsEnabled));
    localStorage.setItem('utrend-tts-voice', selectedVoice);
    if (!isTtsEnabled && audioSourceRef.current) {
        audioSourceRef.current.stop();
    }
  }, [isTtsEnabled, selectedVoice]);

  useEffect(() => {
    if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [history, loading, input]);

  const handleSendMessage = useCallback(async (message: string) => {
    if ((!message.trim() && !imageFile && !message.startsWith('gif:')) || loading) return;

    let newUserMessage: ChatMessage;

    if (message.startsWith('gif:')) {
        newUserMessage = { role: 'user', content: '', gifUrl: message.substring(4) };
    } else {
        newUserMessage = { role: 'user', content: message, imageUrl: imagePreviewUrl || undefined };
    }
    
    const newHistory = [...history, newUserMessage];
    setHistory(newHistory);
    setLoading(true);
    setInput('');
    setImageFile(null);
    setImagePreviewUrl(null);
    setError(null);

    const historyForApi = newHistory.map(msg => ({
        role: msg.role,
        content: msg.content
    }));

    try {
        let imagePayload;
        if (imageFile) {
            const base64 = await fileToBase64(imageFile);
            imagePayload = { base64, mimeType: imageFile.type };
        }

        const response = await sendMessageToNolo(historyForApi, undefined, imagePayload);
        
        const actionRegex = /ACTION:\[(REPORT|TRENDS|IDEAS|KEYWORDS),"(.+?)"\]/;
        const match = response.match(actionRegex);

        if (match) {
            const [, tool, param] = match;
            const cleanResponse = response.replace(actionRegex, '').trim();
            setHistory(prev => [...prev, { role: 'model', content: cleanResponse }]);
            showToast(`AI suggested action: ${tool} with "${param}"`);
        } else {
             setHistory(prev => [...prev, { role: 'model', content: response }]);
             if (isTtsEnabled) {
                speak(response);
             }
        }
        
    } catch (e: any) {
        setError(e.message || "An error occurred.");
    } finally {
        setLoading(false);
    }
  }, [history, loading, isTtsEnabled, speak, showToast, imageFile, imagePreviewUrl]);
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(input);
    }
  };

  const handleGifSelect = (url: string) => {
    handleSendMessage(`gif:${url}`);
    setIsGifPickerOpen(false);
  };
  
  const handleToggleRecording = () => {
        if (isRecording) {
            recognitionRef.current?.stop();
        } else {
            recognitionRef.current?.start();
        }
        setIsRecording(!isRecording);
  };
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        setError("Image size cannot exceed 4MB.");
        return;
      }
       if (!file.type.startsWith('image/')) {
        setError("Please upload a valid image file.");
        return;
      }
      setImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };
  
  if (user?.plan === 'free') {
    return (
        <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-8 shadow-xl backdrop-blur-xl text-center flex flex-col items-center animate-slide-in-up">
            <Star className="w-12 h-12 text-yellow-400 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Upgrade to Unlock AI Chat</h2>
            <p className="text-slate-400 mb-6 max-w-md">Nolo, your AI Co-pilot, is a premium feature. Upgrade your account to start brainstorming and strategizing.</p>
            <button
                onClick={() => setActiveTab(Tab.Pricing)}
                className="button-primary"
            >
                View Plans
            </button>
        </div>
    );
  }

  return (
    <div className="bg-brand-glass border border-slate-700/50 rounded-xl shadow-xl flex flex-col animate-slide-in-up h-[85vh]">
          <header className="p-4 border-b border-slate-700/50 flex-shrink-0 flex justify-between items-center">
            <h2 className="text-xl font-bold text-center flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-violet-400"/>
                AI Chat (Nolo)
            </h2>
            <div className="flex items-center gap-2">
                 <button onClick={() => setHistory([])} title="Clear chat history" className="p-2 rounded-full hover:bg-slate-700/50">
                    <Trash2 className="w-5 h-5 text-slate-400"/>
                 </button>
                 <div className="flex items-center gap-1 bg-slate-800/60 p-1 rounded-full border border-slate-700/50">
                    <button onClick={() => setIsTtsEnabled(!isTtsEnabled)} title={isTtsEnabled ? "Disable Text-to-Speech" : "Enable Text-to-Speech"} className="p-1 rounded-full hover:bg-slate-700/50">
                        {isTtsEnabled ? <Volume2 className="w-5 h-5 text-violet-400"/> : <VolumeX className="w-5 h-5 text-slate-400"/>}
                    </button>
                    {isTtsEnabled && (
                        <div className="relative">
                            <select value={selectedVoice} onChange={e => setSelectedVoice(e.target.value)} className="text-xs bg-transparent border-0 rounded-full pl-2 pr-6 appearance-none focus:outline-none focus:ring-0">
                                {ttsVoices.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                            </select>
                             <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    )}
                 </div>
            </div>
          </header>
          
          <ErrorDisplay message={error} />

          <div ref={chatContainerRef} className="flex-1 p-6 overflow-y-auto space-y-6">
            {history.length === 0 && (
                <div className="text-center text-slate-400 flex flex-col items-center justify-center h-full">
                    <Bot className="w-16 h-16 text-slate-600 mb-4" />
                    <h3 className="text-xl font-bold text-slate-200">Hello, I'm Nolo!</h3>
                    <p className="mb-4">Your AI co-pilot for content creation. Try one of these prompts to start:</p>
                    <div className="grid grid-cols-2 gap-2 w-full max-w-lg">
                        {conversationStarters.map((prompt, i) => (
                           <button key={i} onClick={() => handleSendMessage(prompt)} className="text-left text-sm p-3 bg-slate-800/60 hover:bg-slate-700/80 rounded-lg transition-colors">
                               {prompt}
                           </button>
                        ))}
                    </div>
                </div>
            )}
            {history.map((msg, index) => (
              <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'model' && (
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-violet-300" />
                  </div>
                )}
                <div className={`prose prose-invert prose-p:my-0 prose-strong:text-white max-w-xl px-4 py-3 rounded-2xl ${msg.role === 'user' ? 'bg-violet text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
                    {msg.content && <p>{msg.content}</p>}
                    {msg.gifUrl && <img src={msg.gifUrl} alt="user selected gif" className="max-w-xs rounded-lg my-2" />}
                    {msg.imageUrl && <img src={msg.imageUrl} alt="user upload" className="max-w-xs rounded-lg my-2" />}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-start gap-3">
                 <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0"><Bot className="w-5 h-5 text-violet-300" /></div>
                <div className="px-4 py-3 rounded-2xl bg-slate-700 rounded-bl-none">
                  <TypingIndicator />
                </div>
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-slate-700/50 flex-shrink-0 space-y-2">
             {imagePreviewUrl && (
                <div className="relative w-20 h-20 bg-slate-800 p-1 rounded-lg">
                    <img src={imagePreviewUrl} alt="upload preview" className="w-full h-full object-cover rounded"/>
                    <button onClick={() => { setImageFile(null); setImagePreviewUrl(null); }} className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5"><X className="w-3 h-3 text-white"/></button>
                </div>
             )}
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Nolo anything..."
                disabled={loading}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-12 pr-28 focus:outline-none focus:ring-2 focus:ring-violet-light transition-all resize-none shadow-inner"
                rows={1}
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                 <button onClick={() => fileInputRef.current?.click()} title="Upload Image" className="p-1.5 text-slate-400 hover:text-white"><Paperclip className="w-5 h-5"/></button>
                 <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                 <button onClick={handleToggleRecording} title={isRecording ? "Stop Recording" : "Start Recording"} className={`p-1.5 text-slate-400 hover:text-white ${isRecording ? 'text-red-500' : ''}`}><Mic className="w-5 h-5"/></button>
              </div>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                 <div className="relative">
                    <button onClick={() => setIsGifPickerOpen(p => !p)} title="Send GIF" className="p-1.5 text-slate-400 hover:text-white"><Gif className="w-5 h-5"/></button>
                    {isGifPickerOpen && <GifPicker onSelect={handleGifSelect} />}
                 </div>
                <button
                  onClick={() => handleSendMessage(input)}
                  disabled={loading || (!input.trim() && !imageFile)}
                  className="p-2 rounded-full bg-violet hover:opacity-90 transition-opacity disabled:opacity-50"
                  title="Send message"
                >
                  <Send className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
  );
};
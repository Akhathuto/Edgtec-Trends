
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Tab } from '../types';
import { Send, Star, Sparkles, Trash2, Volume2, VolumeX, Gif, Mic, Bot, User as UserIcon, Zap, Copy, RefreshCw, StopCircle, Paperclip, X, Download } from './Icons';
import Spinner from './Spinner';
import { useToast } from '../contexts/ToastContext';
import { sendMessageToNolo } from '../services/geminiService';
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


const AIChat: React.FC<AIChatProps> = ({ setActiveTab }) => {
  const { user, logActivity } = useAuth();
  const { showToast } = useToast();
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTtsEnabled, setIsTtsEnabled] = useState(false);
  const [isGifPickerOpen, setIsGifPickerOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const conversationStarters = [
    "Give me 3 viral video ideas about retro gaming",
    "How can I improve my YouTube thumbnails?",
    "Write a short, hooky script for a TikTok about AI",
    "What are some trending audio clips right now?",
  ];

  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) {
        setError("Sorry, your browser doesn't support Text-to-Speech.");
        return;
    }
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  }, []);
  
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
        } else if (event.error === 'not-allowed') {
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
    return () => { if ('speechSynthesis' in window) { window.speechSynthesis.cancel(); } };
  }, []);

  useEffect(() => { localStorage.setItem('utrend-tts-enabled', JSON.stringify(isTtsEnabled)); }, [isTtsEnabled]);

  useEffect(() => {
    if (user?.plan === 'pro') {
      const storageKey = `utrend-chat-history-${user.id}`;
      const storedHistory = localStorage.getItem(storageKey);
      let initialHistory: ChatMessage[] = [];
      if (storedHistory) {
        try {
          const parsed = JSON.parse(storedHistory);
          if (Array.isArray(parsed) && (parsed.length === 0 || (typeof parsed[0] === 'object' && parsed[0] !== null && 'role' in parsed[0] && 'content' in parsed[0]))) {
            initialHistory = parsed;
          }
        } catch (e) { console.error("Failed to parse chat history:", e); }
      }
      
      if (initialHistory.length === 0) {
           initialHistory = [{ role: 'model', content: "Hello! I'm Nolo, your AI Co-pilot. How can I help you brainstorm your next viral video today?" }];
      }
      setHistory(initialHistory);
    }
  }, [user?.plan, user?.id]);

  useEffect(() => {
    if (user && history.length > 0) {
      const storageKey = `utrend-chat-history-${user.id}`;
      localStorage.setItem(storageKey, JSON.stringify(history));
    }
  }, [history, user]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [history, loading]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [input]);

  const sendToAI = useCallback(async (currentHistory: ChatMessage[]) => {
    const messageForAI = currentHistory[currentHistory.length - 1];
    if (!messageForAI.content.trim() && !messageForAI.gifUrl) return;

    if ('speechSynthesis' in window) { window.speechSynthesis.cancel(); }
    
    setLoading(true);

    try {
      logActivity(`sent a message to Nolo: "${messageForAI.content.substring(0, 30)}..."`, 'MessageSquare');
      
      const historyForApi = currentHistory.map(msg => {
          const content = msg.gifUrl ? '[User sent a GIF]' : (msg.imageUrl ? `${msg.content} [User sent an image]` : msg.content);
          return { role: msg.role, content };
      });

      const fullResponse = await sendMessageToNolo(historyForApi);
      
      if (isTtsEnabled && fullResponse) {
        speak(fullResponse);
      }
      setHistory(prev => [...prev, { role: 'model', content: fullResponse }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setHistory(prev => [...prev, { role: 'model', content: "Sorry, I encountered an error. Please check your connection and try again." }]);
    } finally {
      setLoading(false);
    }
  }, [isTtsEnabled, speak, logActivity]);

  const handleUserMessageSend = useCallback((message: string, gifUrl?: string, image?: File | null, imageUrl?: string | null, baseHistory?: ChatMessage[]) => {
    if (loading) return;
    if (!message.trim() && !gifUrl && !image) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      ...(gifUrl && { gifUrl }),
      ...(imageUrl && { imageUrl }),
    };
    
    const currentHistory = baseHistory ?? history;
    const newHistory = [...currentHistory, userMessage];
    setHistory(newHistory);

    sendToAI(newHistory);
  }, [loading, history, sendToAI]);
  
  const handleFormSubmit = () => {
    handleUserMessageSend(input, undefined, imageFile, imagePreviewUrl);
    setInput('');
    setImageFile(null);
    setImagePreviewUrl(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        showToast('Only image uploads are supported at this time.');
        return;
    }
    if (file.size > 4 * 1024 * 1024) { // 4MB
        showToast('Image size cannot exceed 4MB.');
        return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleFormSubmit();
    }
  };

  const handleClearChat = () => {
    setHistory([{ role: 'model', content: "Hello again! Let's brainstorm something new." }]);
  };

  const handleGifSelect = (url: string) => {
    handleUserMessageSend('', url);
    setIsGifPickerOpen(false);
  };
  
  const handleToggleRecording = () => {
    if (isRecording) {
        recognitionRef.current?.stop();
        setIsRecording(false);
    } else {
        recognitionRef.current?.start();
        setIsRecording(true);
        setError(null);
    }
  };

  if (user?.plan !== 'pro') {
    return (
        <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-8 shadow-xl backdrop-blur-xl text-center flex flex-col items-center animate-slide-in-up">
            <Star className="w-12 h-12 text-yellow-400 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Upgrade to Pro to Chat with Nolo</h2>
            <p className="text-slate-400 mb-6 max-w-md">Nolo, your AI Co-pilot, is a Pro feature. Upgrade to get personalized brainstorming and strategy sessions.</p>
            <button
                onClick={() => setActiveTab(Tab.Pricing)}
                className="flex items-center gap-2 bg-gradient-to-r from-violet-dark to-violet-light text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity"
            >
                View Plans
            </button>
        </div>
    )
  }

  return (
    <div className="bg-brand-glass border border-slate-700/50 rounded-xl shadow-xl flex flex-col h-[85vh] animate-slide-in-up">
        <header className="p-4 border-b border-slate-700/50 flex-shrink-0 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0"><Bot className="w-5 h-5 text-violet-300"/></div>
                <h2 className="text-xl font-bold">AI Chat (Nolo)</h2>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={() => setIsTtsEnabled(!isTtsEnabled)} title={isTtsEnabled ? 'Disable Text-to-Speech' : 'Enable Text-to-Speech'} className="p-2 rounded-full hover:bg-slate-700/50 transition-colors">
                    {isTtsEnabled ? <Volume2 className="w-5 h-5 text-violet-300"/> : <VolumeX className="w-5 h-5 text-slate-400"/>}
                </button>
                <button onClick={handleClearChat} title="Clear conversation history" className="p-2 rounded-full hover:bg-slate-700/50">
                    <Trash2 className="w-5 h-5 text-slate-400"/>
                </button>
            </div>
        </header>

        <ErrorDisplay message={error} />

        <div ref={chatContainerRef} className="flex-1 p-6 overflow-y-auto space-y-6">
            {history.map((msg, index) => (
                <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                    {msg.role === 'model' && (
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0"><Bot className="w-5 h-5 text-violet-300"/></div>
                    )}
                    <div className={`max-w-xl px-4 py-3 rounded-2xl ${msg.role === 'user' ? 'bg-violet text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
                        {msg.content && <p>{msg.content}</p>}
                        {msg.gifUrl && <img src={msg.gifUrl} alt="User sent GIF" className="mt-2 rounded-lg max-w-xs" />}
                        {msg.imageUrl && <img src={msg.imageUrl} alt="User sent image" className="mt-2 rounded-lg max-w-xs" />}
                    </div>
                </div>
            ))}
            {loading && (
                <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0"><Bot className="w-5 h-5 text-violet-300"/></div>
                    <div className="px-4 py-3 rounded-2xl bg-slate-700 rounded-bl-none"><TypingIndicator/></div>
                </div>
            )}
        </div>

        <div className="p-4 border-t border-slate-700/50 flex-shrink-0 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {conversationStarters.map((prompt, i) => (
                    <button key={i} onClick={() => handleUserMessageSend(prompt)} className="text-left text-sm p-3 bg-slate-800/60 hover:bg-slate-700/80 rounded-lg transition-colors text-slate-300" title={`Send this prompt: "${prompt}"`}>
                        {prompt}
                    </button>
                ))}
            </div>
            {imagePreviewUrl && (
                <div className="relative w-24 h-24 bg-black/20 rounded-lg p-1">
                    <img src={imagePreviewUrl} alt="Preview" className="w-full h-full object-contain rounded"/>
                    <button onClick={() => {setImageFile(null); setImagePreviewUrl(null);}} className="absolute -top-2 -right-2 p-1 bg-slate-700 rounded-full text-white hover:bg-red-500" title="Remove image">
                        <X className="w-4 h-4" />
                    </button>
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
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-violet-light transition-all resize-none shadow-inner"
                    rows={1}
                />
                <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden"/>
                    <button onClick={() => fileInputRef.current?.click()} title="Attach Image" className="p-2 rounded-full hover:bg-slate-700/50"><Paperclip className="w-5 h-5 text-slate-400"/></button>
                    <button onClick={handleToggleRecording} title="Voice Input" className={`p-2 rounded-full hover:bg-slate-700/50 ${isRecording ? 'bg-red-500/20' : ''}`}><Mic className={`w-5 h-5 ${isRecording ? 'text-red-400' : 'text-slate-400'}`}/></button>
                    <div className="relative">
                        <button onClick={() => setIsGifPickerOpen(!isGifPickerOpen)} title="Send a GIF" className="p-2 rounded-full hover:bg-slate-700/50"><Gif className="w-5 h-5 text-slate-400"/></button>
                        {isGifPickerOpen && <GifPicker onSelect={handleGifSelect} />}
                    </div>
                </div>
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <button onClick={handleFormSubmit} disabled={loading || (!input.trim() && !imageFile)} className="p-2 rounded-full bg-violet hover:opacity-90 transition-opacity disabled:opacity-50" title="Send message">
                        {loading ? <Spinner size="sm" /> : <Send className="w-5 h-5 text-white" />}
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default AIChat;

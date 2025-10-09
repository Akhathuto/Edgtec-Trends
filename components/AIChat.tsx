import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { Tab } from '../types.ts';
import { GoogleGenAI, Chat } from '@google/genai';
import { Send, Star, Sparkles, Trash2, Volume2, VolumeX, Gif, Mic, Bot, User as UserIcon, Zap, Copy, RefreshCw, StopCircle, Paperclip, X, Download } from './Icons.tsx';
import Spinner from './Spinner.tsx';
import { useToast } from '../contexts/ToastContext.tsx';

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
  const [isStreaming, setIsStreaming] = useState(false);
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
  const stopStreamingRef = useRef(false);

  const conversationStarters = [
    "Give me 3 viral video ideas about retro gaming",
    "How can I improve my YouTube thumbnails?",
    "Write a short, hooky script for a TikTok about AI",
    "What are some trending audio clips right now?",
  ];

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]);
        };
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
  };

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


  const initializeChat = useCallback((historyToRestore?: ChatMessage[]): Chat | null => {
    try {
      // FIX: Per @google/genai guidelines, the API key must be from process.env.API_KEY.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      return ai.chats.create({
        model: 'gemini-2.5-flash',
        history: historyToRestore?.map((msg) => {
          const content = msg.gifUrl ? '[User sent a GIF]' : (msg.imageUrl ? `${msg.content} [User sent an image]` : msg.content);
          return { role: msg.role, parts: [{ text: content }] };
        }),
        config: {
          systemInstruction: `You are Nolo, an expert AI content co-pilot. Your personality is helpful, creative, and proactive. Your goal is to assist content creators. If a user's request could lead to using another tool in the app, suggest it using the format ACTION:[TOOL_NAME,"parameter"]. For example: 'That's a great topic! I can create a full strategy report for you. ACTION:[REPORT,"Keto Recipes"]'. Valid tools are: REPORT, TRENDS, IDEAS, KEYWORDS. Always be encouraging and provide actionable advice. Write your responses in a natural, spoken style, using conversational phrasing and punctuation suitable for a text-to-speech engine to read aloud.`
        }
      });
    } catch (e) {
      console.error("Failed to initialize AI Chat:", e);
      setError("Could not initialize the AI chat service. Please try refreshing the page.");
      return null;
    }
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

  const sendToAI = useCallback(async (currentHistory: ChatMessage[], image?: File) => {
    const messageForAI = currentHistory[currentHistory.length - 1];
    if (!messageForAI.content.trim() && !image) return;

    const chatInstance = initializeChat(currentHistory.slice(0, -1));
    if (!chatInstance) {
        setError("Chat service is not available. Please refresh.");
        return;
    }

    if ('speechSynthesis' in window) { window.speechSynthesis.cancel(); }
    
    stopStreamingRef.current = false;
    setLoading(true);
    setIsStreaming(true);
    let fullResponse = '';

    try {
      const promptParts: any[] = [{ text: messageForAI.content || '[User sent an image]' }];
      if (image) {
        const base64Data = await fileToBase64(image);
        promptParts.push({ inlineData: { mimeType: image.type, data: base64Data } });
      }

      logActivity(`sent a message to Nolo: "${messageForAI.content.substring(0, 30)}..."`, 'MessageSquare');
      const stream = await chatInstance.sendMessageStream({ parts: promptParts });
      setHistory(prev => [...prev, { role: 'model', content: '' }]);

      for await (const chunk of stream) {
        if (stopStreamingRef.current) break;
        fullResponse += chunk.text;
        setHistory(prev => {
          const newHistory = [...prev];
          newHistory[newHistory.length - 1].content = fullResponse;
          return newHistory;
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setHistory(prev => [...prev, { role: 'model', content: "Sorry, I encountered an error. Please check your connection and try again." }]);
    } finally {
      setIsStreaming(false);
      setLoading(false);
      if (isTtsEnabled && fullResponse && !stopStreamingRef.current) {
        speak(fullResponse);
      }
    }
  }, [isTtsEnabled, speak, logActivity, initializeChat]);

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

    sendToAI(newHistory, image || undefined);
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
  
  const clearImage = () => {
    setImageFile(null);
    setImagePreviewUrl(null);
    if(fileInputRef.current) fileInputRef.current.value = "";
  }

  const handleSendGif = (gifUrl: string) => {
    handleUserMessageSend('', gifUrl);
    setIsGifPickerOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleFormSubmit();
    }
  };
  
  const handleClearChat = useCallback(() => {
    setHistory([{ role: 'model', content: "Hello again! Let's start fresh. What's on your mind?" }]);
  }, []);
  
  const handleActionClick = (tool: string, param: string) => {
    const toolMap: { [key: string]: Tab } = { 'REPORT': Tab.Report, 'TRENDS': Tab.Trends, 'IDEAS': Tab.Ideas, 'KEYWORDS': Tab.Keywords };
    if (toolMap[tool]) setActiveTab(toolMap[tool]);
  };

  const handleMicClick = () => {
    if (!recognitionRef.current) { setError("Speech recognition is not supported on this browser."); return; }
    if (isRecording) { recognitionRef.current.stop(); } 
    else { recognitionRef.current.start(); setIsRecording(true); }
  };
  
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!');
  }

  const handleRegenerate = useCallback(() => {
    const lastUserMessageIndex = history.findLastIndex(msg => msg.role === 'user');
    if (lastUserMessageIndex === -1) return;

    const lastUserMessage = history[lastUserMessageIndex];
    const historyForResend = history.slice(0, lastUserMessageIndex);
    
    handleUserMessageSend(lastUserMessage.content, lastUserMessage.gifUrl, null, lastUserMessage.imageUrl, historyForResend);
  }, [history, handleUserMessageSend]);

  const handleExportChat = () => {
    let textContent = `Nolo AI Chat Export - ${new Date().toLocaleString()}\n\n`;
    history.forEach(msg => {
        const prefix = msg.role === 'user' ? '[User]' : '[Nolo]';
        let content = msg.content;
        if (msg.gifUrl) content = '[User sent a GIF]';
        if (msg.imageUrl) content += ' [User sent an image]';
        textContent += `${prefix}: ${content}\n---\n`;
    });
    
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `utrend_nolo_chat_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Chat history exported!');
  }

  const formatContent = (text: string, isStreaming: boolean) => {
    let content = text;
    const actionRegex = /ACTION:\[(REPORT|TRENDS|IDEAS|KEYWORDS),"([^"]+)"\]/g;
    
    const actionMatch = actionRegex.exec(content);
    let actionButton = null;
    if (actionMatch) {
        content = content.replace(actionRegex, '').trim();
        const [_, tool, param] = actionMatch;
        actionButton = (
             <button onClick={() => handleActionClick(tool, param)} className="mt-3 w-full button-secondary !bg-violet-600/50 !hover:bg-violet-600/80" title={`Use the ${tool.charAt(0) + tool.slice(1).toLowerCase()} tool for "${param}"`}>
                <Zap className="w-4 h-4 mr-2" /> Go to {tool.charAt(0) + tool.slice(1).toLowerCase()} for "{param}"
             </button>
        );
    }
    
    const formattedHtml = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/(\n\s*[\*\-]\s)(.*)/g, (match, bullet, item) => `<br />• ${item}`)
      .replace(/\n/g, '<br />');

    return (
        <div className="prose prose-invert prose-p:my-0 prose-strong:text-white max-w-xl">
            <span dangerouslySetInnerHTML={{ __html: formattedHtml }} />
            {isStreaming && <span className="blinking-cursor" />}
            {actionButton}
        </div>
    );
  };

  if (user?.plan !== 'pro') {
    return (
      <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-8 shadow-xl backdrop-blur-xl text-center flex flex-col items-center animate-slide-in-up">
        <Star className="w-12 h-12 text-yellow-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Upgrade to Pro for AI Chat</h2>
        <p className="text-slate-400 mb-6 max-w-md">Get a personal AI assistant to help you brainstorm and refine ideas in real-time. Upgrade to unlock this feature.</p>
        <button onClick={() => setActiveTab(Tab.Pricing)} className="button-primary"> View Plans </button>
      </div>
    );
  }

  return (
    <div className="bg-brand-glass border border-slate-700/50 rounded-xl shadow-xl backdrop-blur-xl h-[80vh] flex flex-col animate-slide-in-up">
      <header className="p-4 border-b border-slate-700/50 flex-shrink-0 flex justify-between items-center">
          <div className="flex items-center gap-1">
            <button onClick={() => setIsTtsEnabled(prev => !prev)} title={isTtsEnabled ? "Disable Text-to-Speech" : "Enable Text-to-Speech"} className="p-2 rounded-full hover:bg-slate-700/50 transition-colors">{isTtsEnabled ? <Volume2 className="w-5 h-5 text-violet-400"/> : <VolumeX className="w-5 h-5 text-slate-400"/>}</button>
            <button onClick={handleExportChat} title="Export conversation history" className="p-2 rounded-full hover:bg-slate-700/50 transition-colors"><Download className="w-5 h-5 text-slate-400"/></button>
          </div>
          <h2 className="text-xl font-bold text-center">Chat with Nolo</h2>
          <div className="w-10 text-right"><button onClick={handleClearChat} title="Clear conversation history" className="p-2 rounded-full hover:bg-slate-700/50 transition-colors"><Trash2 className="w-5 h-5 text-slate-400"/></button></div>
      </header>
      
      {error && <div className="p-4 text-center text-red-400 bg-red-500/10">{error}</div>}

      <div ref={chatContainerRef} className="flex-1 p-6 overflow-y-auto space-y-6">
        {history.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 chat-bubble group ${msg.role === 'user' ? 'justify-end' : ''}`}>
             {msg.role === 'model' && (<div title="Nolo AI" className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg"><Bot className="w-6 h-6 text-white" /></div>)}
             <div className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`px-4 py-3 rounded-2xl shadow-md ${msg.role === 'user' ? 'bg-violet text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
                  {msg.imageUrl && <img src={msg.imageUrl} alt="User upload" className="max-w-xs max-h-48 rounded-lg mb-2" />}
                  {msg.gifUrl ? (<img src={msg.gifUrl} alt="User GIF" className="max-w-[200px] rounded-lg" />) : ( (msg.content || msg.imageUrl) && formatContent(msg.content, loading && index === history.length -1))}
                </div>
                {msg.role === 'model' && msg.content && (
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => handleCopy(msg.content)} className="p-1.5 rounded-full bg-slate-800/60 hover:bg-slate-700" title="Copy message"><Copy className="w-4 h-4 text-slate-400" /></button>
                         <button onClick={() => speak(msg.content)} className="p-1.5 rounded-full bg-slate-800/60 hover:bg-slate-700" title="Read message aloud"><Volume2 className="w-4 h-4 text-slate-400" /></button>
                    </div>
                )}
             </div>
             {msg.role === 'user' && (<div title="You" className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 shadow-lg"><UserIcon className="w-6 h-6 text-slate-300" /></div>)}
          </div>
        ))}
        {loading && !isStreaming && (
             <div className="flex items-start gap-3 chat-bubble"><div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg"><Bot className="w-6 h-6 text-white" /></div><div className="max-w-xl px-4 py-3 rounded-2xl bg-slate-700 rounded-bl-none shadow-md"><TypingIndicator /></div></div>
         )}
      </div>
      
      <div className="p-4 border-t border-slate-700/50 flex-shrink-0 space-y-4">
        {history.length <= 1 && !loading && (
            <div className="animate-fade-in">
                <h3 className="text-sm font-semibold text-center text-slate-400 mb-2 flex items-center justify-center gap-2"><Sparkles className="w-4 h-4 text-violet-400" /> Conversation Starters</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{conversationStarters.map((starter, i) => (<button key={i} onClick={() => handleUserMessageSend(starter)} title={`Send this prompt: "${starter}"`} className="text-left text-sm p-3 bg-slate-800/60 hover:bg-slate-700/80 rounded-lg transition-colors text-slate-300">{starter}</button>))}</div>
            </div>
        )}
        {isStreaming ? (
            <div className="flex justify-center"><button onClick={() => stopStreamingRef.current = true} className="button-secondary !py-1.5 !px-4"><StopCircle className="w-4 h-4 mr-2"/> Stop Generating</button></div>
        ) : ( history.length > 1 && !loading &&
            <div className="flex justify-center"><button onClick={handleRegenerate} className="button-secondary !py-1.5 !px-4"><RefreshCw className="w-4 h-4 mr-2"/> Regenerate Response</button></div>
        )}
        <div className="relative">
          {isGifPickerOpen && <GifPicker onSelect={handleSendGif} />}
          {imagePreviewUrl && (
            <div className="absolute bottom-full mb-2 left-2 p-2 bg-slate-900/80 backdrop-blur-sm rounded-lg border border-slate-700 animate-fade-in">
                <div className="relative">
                    <img src={imagePreviewUrl} alt="Preview" className="h-20 w-auto rounded-md"/>
                    <button onClick={clearImage} className="absolute -top-2 -right-2 p-1 bg-slate-700 rounded-full text-white hover:bg-red-500" title="Remove image">
                        <X className="w-3 h-3"/>
                    </button>
                </div>
            </div>
          )}
          <textarea ref={textareaRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} title="Type your message to Nolo" placeholder="Ask me anything, or attach an image..." disabled={loading} className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-12 pr-32 focus:outline-none focus:ring-2 focus:ring-violet-light transition-all resize-none overflow-y-hidden shadow-inner" rows={1} style={{ maxHeight: '120px' }}/>
          <div className="absolute left-2 top-1/2 -translate-y-1/2">
             <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,application/pdf" className="hidden"/>
             <button onClick={() => fileInputRef.current?.click()} disabled={loading} className="p-2 rounded-full hover:bg-slate-700/50 transition-colors disabled:opacity-50" title="Attach file"><Paperclip className="w-5 h-5 text-slate-400" /></button>
          </div>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button onClick={handleMicClick} disabled={loading} className={`p-2 rounded-full hover:bg-slate-700/50 transition-colors disabled:opacity-50 ${isRecording ? 'bg-red-500/20 animate-pulse' : ''}`} title={isRecording ? "Stop recording" : "Start voice input"}><Mic className={`w-5 h-5 ${isRecording ? 'text-red-400' : 'text-slate-400'}`} /></button>
              <button onClick={() => setIsGifPickerOpen(prev => !prev)} disabled={loading} className="p-2 rounded-full hover:bg-slate-700/50 transition-colors disabled:opacity-50" title="Send GIF"><Gif className="w-5 h-5 text-slate-400" /></button>
              <button onClick={handleFormSubmit} disabled={loading || (!input.trim() && !imageFile)} className="p-2 rounded-full bg-violet hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed" title="Send Message">{loading ? <Spinner size="sm" /> : <Send className="w-5 h-5 text-white" />}</button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AIChat;

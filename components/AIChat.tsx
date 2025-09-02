import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Tab } from '../types';
import { GoogleGenAI, Chat } from '@google/genai';
import { Send, Star, Sparkles, Trash2, Volume2, VolumeX } from './Icons';
import Spinner from './Spinner';

interface AIChatProps {
  setActiveTab: (tab: Tab) => void;
}

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

const TypingIndicator = () => (
    <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 bg-slate-500 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
        <span className="w-2 h-2 bg-slate-500 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
        <span className="w-2 h-2 bg-slate-500 rounded-full animate-pulse"></span>
    </div>
);

const AIChat: React.FC<AIChatProps> = ({ setActiveTab }) => {
  const { user, logActivity } = useAuth();
  const [chat, setChat] = useState<Chat | null>(null);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTtsEnabled, setIsTtsEnabled] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const initializeChat = useCallback((historyToRestore?: ChatMessage[]) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const chatInstance = ai.chats.create({
        model: 'gemini-2.5-flash',
        history: historyToRestore?.map((msg) => ({
          role: msg.role,
          parts: [{ text: msg.content }],
        })),
        config: {
          systemInstruction: `You are Nolo, an expert AI content co-pilot. Your personality is helpful, creative, and proactive. Your goal is to assist content creators. If a user's request could lead to using another tool in the app, suggest it using the format ACTION:[TOOL_NAME,"parameter"]. For example: 'That's a great topic! I can create a full strategy report for you. ACTION:[REPORT,"Keto Recipes"]'. Valid tools are: REPORT, TRENDS, IDEAS, KEYWORDS. Always be encouraging and provide actionable advice.`
        }
      });
      setChat(chatInstance);
      return chatInstance;
    } catch (e) {
      console.error("Failed to initialize AI Chat:", e);
      setError("Could not initialize the AI chat service. Please try refreshing the page.");
      return null;
    }
  }, []);

  useEffect(() => {
    const savedTtsPref = localStorage.getItem('utrend-tts-enabled');
    if (savedTtsPref) {
      setIsTtsEnabled(JSON.parse(savedTtsPref));
    }
    return () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('utrend-tts-enabled', JSON.stringify(isTtsEnabled));
  }, [isTtsEnabled]);

  useEffect(() => {
    if (user?.plan === 'pro') {
      const storedHistory = localStorage.getItem('utrend-chat-history');
      let initialHistory: ChatMessage[] = [];
      if (storedHistory) {
        try {
          initialHistory = JSON.parse(storedHistory);
        } catch (e) {
            initialHistory = [];
        }
      }
      
      if(initialHistory.length === 0) {
           initialHistory = [{ role: 'model', content: "Hello! I'm Nolo, your AI Co-pilot. How can I help you brainstorm your next viral video today?" }];
      }
      
      setHistory(initialHistory);
      initializeChat(initialHistory);
    }
  }, [user?.plan, initializeChat]);

  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('utrend-chat-history', JSON.stringify(history));
    } else {
      localStorage.removeItem('utrend-chat-history');
    }
  }, [history]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [history, loading]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
        textarea.style.height = 'auto';
        const scrollHeight = textarea.scrollHeight;
        textarea.style.height = `${scrollHeight}px`;
    }
  }, [input]);
  
  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || loading) return;
    
     let currentChat = chat;
    if (!currentChat) {
        // This is a failsafe. If chat isn't initialized, do it now.
        const storedHistory = JSON.parse(localStorage.getItem('utrend-chat-history') || '[]');
        currentChat = initializeChat(storedHistory);
        if (!currentChat) {
             setError("Chat service is not available. Please refresh.");
             return;
        }
    }

    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }

    const userMessage: ChatMessage = { role: 'user', content: message };
    setHistory(prev => [...prev, userMessage]);
    setLoading(true);
    let fullResponse = '';

    try {
      logActivity(`sent a message to Nolo: "${message.substring(0, 30)}..."`, 'MessageSquare');
      const stream = await currentChat.sendMessageStream({ message });
      setHistory(prev => [...prev, { role: 'model', content: '' }]);

      for await (const chunk of stream) {
        fullResponse += chunk.text;
        setHistory(prev => {
          const newHistory = [...prev];
          const lastMessage = newHistory[newHistory.length - 1];
          if (lastMessage && lastMessage.role === 'model') {
            lastMessage.content = fullResponse;
          }
          return newHistory;
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setHistory(prev => [...prev, { role: 'model', content: "Sorry, I encountered an error. Please check your connection and try again." }]);
    } finally {
      setLoading(false);
      if (isTtsEnabled && fullResponse) {
        speak(fullResponse);
      }
    }
  }, [loading, chat, isTtsEnabled, speak, logActivity, initializeChat]);

  const handleFormSubmit = () => {
    if (input.trim()) {
        sendMessage(input);
        setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleFormSubmit();
    }
  };
  
  const handleClearChat = useCallback(() => {
    const freshHistory: ChatMessage[] = [{ role: 'model', content: "Hello again! Let's start fresh. What's on your mind?" }];
    setHistory(freshHistory);
    initializeChat(freshHistory);
    localStorage.removeItem('utrend-chat-history');
  }, [initializeChat]);
  
  const handleActionClick = (tool: string, param: string) => {
    const toolMap: { [key: string]: Tab } = {
        'REPORT': Tab.Report,
        'TRENDS': Tab.Trends,
        'IDEAS': Tab.Ideas,
        'KEYWORDS': Tab.Keywords
    };
    const targetTab = toolMap[tool];
    if (targetTab) {
        // In a more complex app, we'd use context or a state manager to pass the param
        // For now, we just switch the tab. The user can copy/paste the param.
        console.log(`Navigating to ${targetTab} with param: ${param}`);
        setActiveTab(targetTab);
    }
  };

  const formatContent = (text: string) => {
    let content = text;
    const actionRegex = /ACTION:\[(REPORT|TRENDS|IDEAS|KEYWORDS),"([^"]+)"\]/g;
    
    const actionMatch = actionRegex.exec(content);
    let actionButton = null;
    if (actionMatch) {
        content = content.replace(actionRegex, '').trim();
        const [_, tool, param] = actionMatch;
        actionButton = (
             <button
                onClick={() => handleActionClick(tool, param)}
                className="mt-2 w-full text-left flex items-center justify-center text-sm bg-violet-600 hover:bg-violet-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
             >
                Go to {tool.charAt(0) + tool.slice(1).toLowerCase()} for "{param}"
             </button>
        );
    }
    
    const formattedHtml = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-slate-900 p-2 rounded-md my-2 text-sm"><code>$1</code></pre>')
      .replace(/`([^`]+)`/g, '<code class="bg-slate-700/50 px-1 py-0.5 rounded text-violet-300">$1</code>')
      .replace(/(\n\s*[\*\-]\s)(.*)/g, (match, bullet, item) => `<br />• ${item}`)
      .replace(/\n/g, '<br />');

    return (
        <>
            <div dangerouslySetInnerHTML={{ __html: formattedHtml }} />
            {actionButton}
        </>
    );
  };

  if (user?.plan !== 'pro') {
    return (
      <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-8 shadow-xl backdrop-blur-xl text-center flex flex-col items-center animate-slide-in-up">
        <Star className="w-12 h-12 text-yellow-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Upgrade to Pro for AI Chat</h2>
        <p className="text-slate-400 mb-6 max-w-md">Get a personal AI assistant to help you brainstorm and refine ideas in real-time. Upgrade to unlock this feature.</p>
        <button
          onClick={() => setActiveTab(Tab.Pricing)}
          className="flex items-center gap-2 bg-gradient-to-r from-violet-dark to-violet-light text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity shadow-md hover:shadow-lg hover:shadow-violet/30"
        >
          View Plans
        </button>
      </div>
    );
  }

  return (
    <div className="bg-brand-glass border border-slate-700/50 rounded-xl shadow-xl backdrop-blur-xl h-[80vh] flex flex-col animate-slide-in-up">
      <header className="p-4 border-b border-slate-700/50 flex-shrink-0 flex justify-between items-center">
          <div className="w-10">
            <button onClick={() => setIsTtsEnabled(prev => !prev)} title={isTtsEnabled ? "Disable Text-to-Speech" : "Enable Text-to-Speech"} className="p-2 rounded-full hover:bg-slate-700/50 transition-colors">
                {isTtsEnabled ? <Volume2 className="w-5 h-5 text-violet-400"/> : <VolumeX className="w-5 h-5 text-slate-400"/>}
            </button>
          </div>
          <h2 className="text-xl font-bold text-center">Chat with Nolo</h2>
          <div className="w-10 text-right">
            <button onClick={handleClearChat} title="Clear conversation history" className="p-2 rounded-full hover:bg-slate-700/50 transition-colors">
              <Trash2 className="w-5 h-5 text-slate-400"/>
            </button>
          </div>
      </header>
      
      {error && <div className="p-4 text-center text-red-400 bg-red-500/10">{error}</div>}

      <div ref={chatContainerRef} className="flex-1 p-6 overflow-y-auto space-y-6">
        {history.map((msg, index) => (
          <div key={index} className={`flex items-end gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'model' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center flex-shrink-0">
                <Star className="w-5 h-5 text-yellow-300" />
              </div>
            )}
            <div className={`prose prose-invert prose-p:my-0 prose-strong:text-white max-w-xl px-4 py-3 rounded-2xl ${msg.role === 'user' ? 'bg-violet text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
                {formatContent(msg.content)}
            </div>
             {msg.role === 'model' && msg.content && (index !== history.length - 1 || !loading) && (
                <button 
                    onClick={() => speak(msg.content)} 
                    className="p-2 rounded-full hover:bg-slate-700/50 transition-colors"
                    title="Read message aloud"
                >
                    <Volume2 className="w-4 h-4 text-slate-400" />
                </button>
             )}
          </div>
        ))}
        {loading && (
             <div className="flex items-end gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <Star className="w-5 h-5 text-yellow-300" />
                </div>
                <div className="max-w-xl px-4 py-3 rounded-2xl bg-slate-700 rounded-bl-none">
                     <TypingIndicator />
                </div>
             </div>
         )}
      </div>
      
      <div className="p-4 border-t border-slate-700/50 flex-shrink-0 space-y-4">
        {history.length <= 1 && (
            <div className="animate-fade-in">
                <h3 className="text-sm font-semibold text-center text-slate-400 mb-2 flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4 text-violet-400" />
                    Conversation Starters
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {conversationStarters.map((starter, i) => (
                        <button key={i} onClick={() => sendMessage(starter)} className="text-left text-sm p-3 bg-slate-800/60 hover:bg-slate-700/80 rounded-lg transition-colors text-slate-300">
                           {starter}
                        </button>
                    ))}
                </div>
            </div>
        )}
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about content creation..."
            disabled={loading}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-4 pr-16 focus:outline-none focus:ring-2 focus:ring-violet-light transition-all resize-none overflow-y-hidden shadow-inner"
            rows={1}
            style={{ maxHeight: '120px' }}
          />
          <button
            onClick={handleFormSubmit}
            disabled={loading || !input.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-violet hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            title="Send Message"
          >
            {loading ? <Spinner size="sm" /> : <Send className="w-5 h-5 text-white" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Tab } from '../types';
import { GoogleGenAI, Chat } from '@google/genai';
import { Send, Star } from './Icons';
import Spinner from './Spinner';

interface AIChatProps {
  setActiveTab: (tab: Tab) => void;
}

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

const AIChat: React.FC<AIChatProps> = ({ setActiveTab }) => {
  const { user } = useAuth();
  const [chat, setChat] = useState<Chat | null>(null);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (user?.plan === 'pro') {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const chatInstance = ai.chats.create({
          model: 'gemini-2.5-flash',
          config: {
            systemInstruction: 'You are Nolo, a helpful, friendly, and creative assistant for content creators. Provide concise, actionable, and inspiring advice. Use markdown for formatting when appropriate.'
          }
        });
        setChat(chatInstance);
        setHistory([{ role: 'model', content: "Hello! I'm Nolo. How can I help you brainstorm your next viral video today?" }]);
      } catch (e) {
        console.error("Failed to initialize AI Chat:", e);
        setError("Could not initialize the AI chat service. Please try refreshing the page.");
      }
    }
  }, [user?.plan]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
        textarea.style.height = 'auto';
        const scrollHeight = textarea.scrollHeight;
        textarea.style.height = `${scrollHeight}px`;
    }
  }, [input]);

  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || loading || !chat) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setHistory(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      const stream = await chat.sendMessageStream({ message: currentInput });
      let fullResponse = '';
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
    }
  }, [input, loading, chat]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const formatContent = (text: string) => {
    const formatted = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-slate-900 p-2 rounded-md my-2"><code>$1</code></pre>')
      .replace(/`([^`]+)`/g, '<code class="bg-slate-700/50 px-1 py-0.5 rounded text-violet-300">$1</code>')
      .replace(/\n/g, '<br />');
    return <div dangerouslySetInnerHTML={{ __html: formatted }} />;
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
    <div className="bg-brand-glass border border-slate-700/50 rounded-xl shadow-xl backdrop-blur-xl h-[75vh] flex flex-col animate-slide-in-up">
      <header className="p-4 border-b border-slate-700/50 flex-shrink-0">
          <h2 className="text-xl font-bold text-center">Nolo</h2>
      </header>
      
      {error && <div className="p-4 text-center text-red-400 bg-red-500/10">{error}</div>}

      <div ref={chatContainerRef} className="flex-1 p-6 overflow-y-auto space-y-6">
        {history.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'items-end'}`}>
            {msg.role === 'model' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center flex-shrink-0">
                <Star className="w-5 h-5 text-yellow-300" />
              </div>
            )}
            <div className={`prose prose-invert prose-p:my-0 prose-strong:text-white max-w-xl px-4 py-3 rounded-2xl ${msg.role === 'user' ? 'bg-violet rounded-br-none' : 'bg-slate-700 rounded-bl-none'}`}>
                {formatContent(msg.content)}
                {loading && msg.role === 'model' && index === history.length - 1 && !msg.content && <span className="inline-block w-1.5 h-4 bg-white/50 ml-1 animate-pulse" />}
            </div>
          </div>
        ))}
         {loading && history[history.length - 1]?.role === 'user' && (
             <div className="flex items-start gap-3 items-end">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <Star className="w-5 h-5 text-yellow-300" />
                </div>
                <div className="max-w-xl px-4 py-3 rounded-2xl bg-slate-700 rounded-bl-none">
                     <Spinner size="sm"/>
                </div>
             </div>
         )}
      </div>

      <div className="p-4 border-t border-slate-700/50 flex-shrink-0">
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
            onClick={handleSendMessage}
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
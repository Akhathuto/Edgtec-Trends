import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { Tab } from '../types.ts';
import { Star, ArrowLeft, Send, Trash2 } from './Icons.tsx';
import { agents, AIAgent } from '../data/agents.ts';
import { GoogleGenAI, Chat } from '@google/genai';
import Spinner from './Spinner.tsx';

interface AIAgentsProps {
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

const AgentChat: React.FC<{ agent: AIAgent; onBack: () => void }> = ({ agent, onBack }) => {
    const [chat, setChat] = useState<Chat | null>(null);
    const [history, setHistory] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const historyKey = `utrend-agent-chat-${agent.id}`;

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
                    systemInstruction: agent.systemInstruction
                }
            });
            setChat(chatInstance);
            return chatInstance;
        } catch (e) {
            console.error(`Failed to initialize AI Agent ${agent.name}:`, e);
            setError(`Could not initialize the ${agent.name} agent. Please try refreshing.`);
            return null;
        }
    }, [agent]);

    useEffect(() => {
        const storedHistory = localStorage.getItem(historyKey);
        let initialHistory: ChatMessage[] = [];
        if (storedHistory) {
            try {
                // FIX: Cast parsed JSON to ChatMessage[] to ensure type compatibility.
                initialHistory = JSON.parse(storedHistory) as ChatMessage[];
            } catch (e) {
                initialHistory = [];
            }
        }

        if (initialHistory.length === 0) {
            initialHistory = [{ role: 'model', content: agent.greeting }];
        }

        setHistory(initialHistory);
        initializeChat(initialHistory.slice(1)); // Don't include greeting in Gemini history
    }, [agent, historyKey, initializeChat]);

    useEffect(() => {
        if (history.length > 1) { // Don't save just the greeting
            localStorage.setItem(historyKey, JSON.stringify(history));
        } else {
            localStorage.removeItem(historyKey);
        }
    }, [history, historyKey]);
    
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [history, loading]);

    const handleSendMessage = async (message: string) => {
        if (!message.trim() || loading || !chat) return;

        const newUserMessage: ChatMessage = { role: 'user', content: message };
        setHistory(prev => [...prev, newUserMessage]);
        setLoading(true);

        let fullResponse = '';
        try {
            const stream = await chat.sendMessageStream({ message });
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
        } catch (err) {
            console.error('Error sending message to agent:', err);
            setHistory(prev => [...prev, { role: 'model', content: "I've encountered an error. Please try again." }]);
        } finally {
            setLoading(false);
        }
    };
    
    const handleClearChat = () => {
        const freshHistory = [{ role: 'model' as const, content: agent.greeting }];
        setHistory(freshHistory);
        initializeChat();
        localStorage.removeItem(historyKey);
    };

    const handleFormSubmit = () => {
        if (input.trim()) {
            handleSendMessage(input);
            setInput('');
        }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleFormSubmit();
        }
    };
    
     useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            const scrollHeight = textarea.scrollHeight;
            textarea.style.height = `${scrollHeight}px`;
        }
    }, [input]);

    return (
        <div className="bg-brand-glass border border-slate-700/50 rounded-xl shadow-xl backdrop-blur-xl h-[80vh] flex flex-col animate-fade-in">
             <header className="p-4 border-b border-slate-700/50 flex-shrink-0 flex justify-between items-center">
                <div className="w-10">
                    <button onClick={onBack} title="Back to Agents" className="p-2 rounded-full hover:bg-slate-700/50 transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-300" />
                    </button>
                </div>
                <div className="text-center">
                     <h2 className="text-xl font-bold">{agent.name}</h2>
                     <p className="text-xs text-slate-400">{agent.description}</p>
                </div>
                <div className="w-10 text-right">
                    <button onClick={handleClearChat} title="Clear conversation" className="p-2 rounded-full hover:bg-slate-700/50 transition-colors">
                        <Trash2 className="w-5 h-5 text-slate-400"/>
                    </button>
                </div>
            </header>
            
            {error && <div className="p-4 text-center text-red-400 bg-red-500/10">{error}</div>}
            
            <div ref={chatContainerRef} className="flex-1 p-6 overflow-y-auto space-y-6">
                 {history.map((msg, index) => (
                    <div key={index} className={`flex items-end gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        {msg.role === 'model' && (
                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                                {agent.icon}
                            </div>
                        )}
                        <div className={`prose prose-invert prose-p:my-0 prose-strong:text-white max-w-xl px-4 py-3 rounded-2xl ${msg.role === 'user' ? 'bg-violet text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
                            {msg.content}
                        </div>
                    </div>
                 ))}
                 {loading && (
                    <div className="flex items-end gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                            {agent.icon}
                        </div>
                        <div className="max-w-xl px-4 py-3 rounded-2xl bg-slate-700 rounded-bl-none">
                            <TypingIndicator />
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
                        placeholder={`Chat with ${agent.name}...`}
                        disabled={loading}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-violet-light transition-all resize-none overflow-y-hidden shadow-inner"
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

const AgentSelection: React.FC<{ onSelect: (agent: AIAgent) => void }> = ({ onSelect }) => (
    <div className="animate-slide-in-up">
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white text-glow">Meet Your AI Agents</h2>
            <p className="text-slate-400 mt-2 max-w-2xl mx-auto">
                Choose a specialized agent to get expert assistance for any task.
            </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {agents.map(agent => (
                <button 
                    key={agent.id}
                    onClick={() => onSelect(agent)}
                    className="interactive-card text-left flex items-start gap-4"
                >
                    <div className="flex-shrink-0 w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
                        {agent.icon}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white text-glow">{agent.name}</h3>
                        <p className="text-slate-400 mt-1">{agent.description}</p>
                    </div>
                </button>
            ))}
        </div>
    </div>
);


const AIAgents: React.FC<AIAgentsProps> = ({ setActiveTab }) => {
  const { user } = useAuth();
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);

  if (user?.plan !== 'pro') {
    return (
      <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-8 shadow-xl backdrop-blur-xl text-center flex flex-col items-center animate-slide-in-up">
        <Star className="w-12 h-12 text-yellow-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Upgrade to Pro for AI Agents</h2>
        <p className="text-slate-400 mb-6 max-w-md">Get a team of specialized AI assistants to help you brainstorm and strategize. Upgrade to unlock this feature.</p>
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
    <div>
      {selectedAgent ? (
        <AgentChat agent={selectedAgent} onBack={() => setSelectedAgent(null)} />
      ) : (
        <AgentSelection onSelect={setSelectedAgent} />
      )}
    </div>
  );
};

export default AIAgents;

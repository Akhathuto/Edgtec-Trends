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
const AIAgents: React.FC<AIAgentsProps> = ({ setActiveTab }) => {
    const { user, logActivity } = useAuth();
    const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);
    const [chat, setChat] = useState<Chat | null>(null);
    const [history, setHistory] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const initializeChat = useCallback((agent: AIAgent, historyToRestore?: ChatMessage[]) => {
        try {
            // FIX: Switched from import.meta.env.VITE_API_KEY to process.env.API_KEY per guidelines.
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const chatInstance = ai.chats.create({
                model: 'gemini-2.5-flash',
                history: historyToRestore?.map((msg) => ({
                    role: msg.role,
                    parts: [{ text: msg.content }],
                })),
                config: {
                    systemInstruction: agent.systemInstruction,
                }
            });
            setChat(chatInstance);
            return chatInstance;
        } catch (e) {
            console.error(`Failed to initialize chat for ${agent.name}:`, e);
            setError("Could not initialize the AI chat service.");
            return null;
        }
    }, []);

    useEffect(() => {
        if (selectedAgent) {
            const storageKey = `utrend-agent-chat-${selectedAgent.id}`;
            const storedHistory = localStorage.getItem(storageKey);
            let initialHistory: ChatMessage[] = [];
            try {
                if(storedHistory) {
                    initialHistory = JSON.parse(storedHistory);
                }
            } catch (e) {
                console.error("Failed to parse agent chat history from localStorage", e);
                initialHistory = [];
            }
            if (initialHistory.length === 0) {
                initialHistory = [{ role: 'model', content: selectedAgent.greeting }];
            }
            
            setHistory(initialHistory);
            initializeChat(selectedAgent, initialHistory);
        } else {
            setChat(null);
            setHistory([]);
        }
    }, [selectedAgent, initializeChat]);

    useEffect(() => {
        if (selectedAgent && history.length > 1) { // Don't save initial greeting
            const storageKey = `utrend-agent-chat-${selectedAgent.id}`;
            localStorage.setItem(storageKey, JSON.stringify(history));
        }
    }, [history, selectedAgent]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [history, loading]);


    const handleSendMessage = useCallback(async () => {
        if (!input.trim() || loading || !selectedAgent) return;

        let currentChat = chat;
        if (!currentChat) {
            const storageKey = `utrend-agent-chat-${selectedAgent.id}`;
            const storedHistory = JSON.parse(localStorage.getItem(storageKey) || '[]');
            currentChat = initializeChat(selectedAgent, storedHistory);
            if (!currentChat) {
                setError("Chat service not available. Please refresh.");
                return;
            }
        }

        const userMessage: ChatMessage = { role: 'user', content: input };
        setHistory(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            logActivity(`sent a message to ${selectedAgent.name}`, 'MessageSquare');
            const stream = await currentChat.sendMessageStream({ message: userMessage.content });
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
            setHistory(prev => [...prev, { role: 'model', content: "Sorry, I encountered an error. Please try again." }]);
        } finally {
            setLoading(false);
        }
    }, [input, loading, chat, selectedAgent, logActivity, initializeChat]);

    const handleClearChat = useCallback(() => {
        if (selectedAgent) {
            const storageKey = `utrend-agent-chat-${selectedAgent.id}`;
            localStorage.removeItem(storageKey);
            const freshHistory = [{ role: 'model', content: selectedAgent.greeting }];
            setHistory(freshHistory);
            initializeChat(selectedAgent, freshHistory);
        }
    }, [selectedAgent, initializeChat]);
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };


    if (user?.plan !== 'pro') {
        return (
            <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-8 shadow-xl backdrop-blur-xl text-center flex flex-col items-center animate-slide-in-up">
                <Star className="w-12 h-12 text-yellow-400 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Upgrade to Pro for AI Agents</h2>
                <p className="text-slate-400 mb-6 max-w-md">Assemble your personal team of AI experts to help you with brainstorming, growth, monetization, and writing.</p>
                <button
                    onClick={() => setActiveTab(Tab.Pricing)}
                    className="flex items-center gap-2 bg-gradient-to-r from-violet-dark to-violet-light text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity shadow-md hover:shadow-lg hover:shadow-violet/30"
                >
                    View Plans
                </button>
            </div>
        );
    }
    
    if (selectedAgent) {
        return (
            <div className="bg-brand-glass border border-slate-700/50 rounded-xl shadow-xl backdrop-blur-xl h-[80vh] flex flex-col animate-fade-in">
                <header className="p-4 border-b border-slate-700/50 flex-shrink-0 flex justify-between items-center">
                    <button onClick={() => setSelectedAgent(null)} title="Back to agent selection" className="p-2 rounded-full hover:bg-slate-700/50 transition-colors">
                        <ArrowLeft className="w-5 h-5"/>
                    </button>
                    <div className="text-center">
                        <h2 className="text-xl font-bold">{selectedAgent.name}</h2>
                        <p className="text-xs text-slate-400">{selectedAgent.description}</p>
                    </div>
                     <button onClick={handleClearChat} title="Clear conversation history" className="p-2 rounded-full hover:bg-slate-700/50 transition-colors">
                        <Trash2 className="w-5 h-5 text-slate-400"/>
                    </button>
                </header>
                 <div ref={chatContainerRef} className="flex-1 p-6 overflow-y-auto space-y-6">
                    {history.map((msg, index) => (
                        <div key={index} className={`flex items-end gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                            {msg.role === 'model' && (
                                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">{selectedAgent.icon}</div>
                            )}
                            <div className={`prose prose-invert prose-p:my-0 prose-strong:text-white max-w-xl px-4 py-3 rounded-2xl ${msg.role === 'user' ? 'bg-violet text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex items-end gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">{selectedAgent.icon}</div>
                            <div className="max-w-xl px-4 py-3 rounded-2xl bg-slate-700 rounded-bl-none">
                                <TypingIndicator />
                            </div>
                        </div>
                    )}
                 </div>
                 <div className="p-4 border-t border-slate-700/50 flex-shrink-0">
                     <div className="relative">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={`Chat with ${selectedAgent.name}...`}
                            disabled={loading}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-violet-light transition-all resize-none shadow-inner"
                            rows={1}
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={loading || !input.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-violet hover:opacity-90 transition-opacity disabled:opacity-50"
                            title="Send Message"
                        >
                            <Send className="w-5 h-5 text-white" />
                        </button>
                     </div>
                 </div>
            </div>
        );
    }

    return (
        <div className="animate-slide-in-up">
            <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-8 shadow-xl backdrop-blur-xl">
                <h2 className="text-3xl font-bold text-center mb-2">Meet Your AI Creative Team</h2>
                <p className="text-center text-slate-400 mb-8">Select a specialized agent to help you with your next task.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {agents.map(agent => (
                        <button 
                            key={agent.id}
                            onClick={() => setSelectedAgent(agent)}
                            className="interactive-card text-left flex flex-col items-center"
                        >
                            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 border border-slate-700">{agent.icon}</div>
                            <h3 className="text-xl font-bold text-white text-center">{agent.name}</h3>
                            <p className="text-sm text-slate-400 text-center flex-grow mt-2">{agent.description}</p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
// FIX: Added default export for AIAgents component.
export default AIAgents;
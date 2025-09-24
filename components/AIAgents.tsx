import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { Tab } from '../types.ts';
import { GoogleGenAI, Chat } from '@google/genai';
import { Send, Star, Search, Zap, Sparkles } from './Icons.tsx';
import Spinner from './Spinner.tsx';
import { agents, AIAgent } from '../data/agents.ts';
import { useToast } from '../contexts/ToastContext.tsx';

interface AIAgentsProps {
  setActiveTab: (tab: Tab) => void;
  onAction: (tool: Tab, parameter: string) => void;
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

const toolMap: { [key: string]: Tab } = {
    TRENDS: Tab.Trends,
    IDEAS: Tab.Ideas,
    REPORT: Tab.Report,
    KEYWORDS: Tab.Keywords,
    ANALYTICS: Tab.Analytics,
    VIDEO_ANALYZER: Tab.VideoAnalyzer,
    REPURPOSE: Tab.RepurposeContent,
};

const themeClasses: { [key: string]: { border: string; bg: string; text: string; bubble: string } } = {
    violet: { border: 'border-violet-500', bg: 'bg-violet-500', text: 'text-violet-300', bubble: 'bg-violet-600' },
    green: { border: 'border-green-500', bg: 'bg-green-500', text: 'text-green-300', bubble: 'bg-green-600' },
    yellow: { border: 'border-yellow-500', bg: 'bg-yellow-500', text: 'text-yellow-300', bubble: 'bg-yellow-600' },
    blue: { border: 'border-blue-500', bg: 'bg-blue-500', text: 'text-blue-300', bubble: 'bg-blue-600' },
    red: { border: 'border-red-500', bg: 'bg-red-500', text: 'text-red-300', bubble: 'bg-red-600' },
    orange: { border: 'border-orange-500', bg: 'bg-orange-500', text: 'text-orange-300', bubble: 'bg-orange-600' },
    cyan: { border: 'border-cyan-500', bg: 'bg-cyan-500', text: 'text-cyan-300', bubble: 'bg-cyan-600' },
};


const AIAgents: React.FC<AIAgentsProps> = ({ setActiveTab, onAction }) => {
  const { user, logActivity } = useAuth();
  const { showToast } = useToast();
  const [activeAgent, setActiveAgent] = useState<AIAgent>(agents[0]);
  const [chats, setChats] = useState<{ [key: string]: Chat }>({});
  const [histories, setHistories] = useState<{ [key: string]: ChatMessage[] }>({});
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const chatContainerRef = useRef<HTMLDivElement>(null);

  const initializeChat = useCallback((agent: AIAgent) => {
    try {
      if (chats[agent.id]) return;
      
      const storageKey = `utrend-agent-chat-${user?.id}-${agent.id}`;
      let storedHistory: ChatMessage[] = [];
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
                storedHistory = parsed;
            }
        }
      } catch (e) {
        console.error("Failed to parse agent history, starting fresh.", e);
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const chatInstance = ai.chats.create({
        model: 'gemini-2.5-flash',
        history: storedHistory.map(msg => ({ role: msg.role, parts: [{ text: msg.content }]})),
        config: { systemInstruction: agent.systemInstruction }
      });
      setChats(prev => ({ ...prev, [agent.id]: chatInstance }));
      
      const initialHistory = [{ role: 'model', content: `Hello! I am the ${agent.name}. How can I assist you today?` }];
      
      if(!histories[agent.id]) {
        setHistories(prev => ({ ...prev, [agent.id]: storedHistory.length > 0 ? storedHistory : initialHistory }));
      }
    } catch (e) {
      console.error(`Failed to initialize chat for ${agent.name}:`, e);
      setError(`Could not initialize the AI for ${agent.name}.`);
    }
  }, [chats, histories, user?.id]);

  useEffect(() => {
    if (user?.plan === 'pro') {
      agents.forEach(agent => initializeChat(agent));
    }
  }, [user?.plan, initializeChat]);
  
  useEffect(() => {
    if (user && histories[activeAgent.id]) {
        const storageKey = `utrend-agent-chat-${user.id}-${activeAgent.id}`;
        localStorage.setItem(storageKey, JSON.stringify(histories[activeAgent.id]));
    }
  }, [histories, activeAgent, user]);


  useEffect(() => {
    chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' });
  }, [histories, loading]);
  
  const handleSendMessage = async (message: string) => {
    if (!message.trim() || loading) return;

    const currentChat = chats[activeAgent.id];
    if (!currentChat) {
      setError("The AI agent is not available. Please try again later.");
      return;
    }

    const userMessage: ChatMessage = { role: 'user', content: message };
    setHistories(prev => ({ ...prev, [activeAgent.id]: [...(prev[activeAgent.id] || []), userMessage] }));
    
    setLoading(true);

    try {
      logActivity(`chatted with AI Agent ${activeAgent.name}`, 'Bot');
      const result = await currentChat.sendMessage({ message });
      const modelMessage: ChatMessage = { role: 'model', content: result.text };
      setHistories(prev => ({ ...prev, [activeAgent.id]: [...(prev[activeAgent.id] || []), modelMessage] }));
    } catch (err: any) {
      setError(err.message || "An error occurred while communicating with the AI.");
      const errorMessage: ChatMessage = { role: 'model', content: "Sorry, I encountered an error. Please try again." };
      setHistories(prev => ({ ...prev, [activeAgent.id]: [...(prev[activeAgent.id] || []), errorMessage] }));
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
    setInput('');
  }

  const filteredAgents = useMemo(() => {
    if (!searchTerm) return agents;
    const lowercasedFilter = searchTerm.toLowerCase();
    return agents.filter(agent =>
        agent.name.toLowerCase().includes(lowercasedFilter) ||
        agent.description.toLowerCase().includes(lowercasedFilter) ||
        agent.keywords.toLowerCase().includes(lowercasedFilter)
    );
  }, [searchTerm]);
  
  const handleExternalAction = (app: string, description: string) => {
    showToast(`Simulating action for ${app}: "${description}"`);
    logActivity(`simulated an external action for ${app}`, 'Zap');
  };

  const parseMessageContent = (content: string) => {
    const internalActionRegex = /ACTION:\[(\w+),"([^"]+)"\]/s;
    const externalActionRegex = /EXTERNAL_ACTION:\[(\w+),"([^"]+)"\]/s;

    let text = content;
    let internalAction = null;
    let externalAction = null;

    const internalMatch = text.match(internalActionRegex);
    if (internalMatch) {
        const [fullMatch, tool, parameter] = internalMatch;
        text = text.replace(fullMatch, '').trim();
        const targetTab = toolMap[tool];
        if (targetTab) {
            internalAction = { tool: targetTab, parameter };
        }
    }

    const externalMatch = text.match(externalActionRegex);
    if (externalMatch) {
        const [fullMatch, app, description] = externalMatch;
        text = text.replace(fullMatch, '').trim();
        externalAction = { app, description };
    }

    return { text, internalAction, externalAction };
};


  if (user?.plan !== 'pro') {
    return (
      <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-8 shadow-xl backdrop-blur-xl text-center flex flex-col items-center animate-slide-in-up">
        <Star className="w-12 h-12 text-yellow-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Upgrade to Pro for AI Agents</h2>
        <p className="text-slate-400 mb-6 max-w-md">Assemble your personal team of AI experts to help with brainstorming, growth, monetization, and writing.</p>
        <button
          onClick={() => setActiveTab(Tab.Pricing)}
          className="flex items-center gap-2 bg-gradient-to-r from-violet-dark to-violet-light text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity shadow-md hover:shadow-lg hover:shadow-violet/30"
        >
          View Plans
        </button>
      </div>
    );
  }

  const currentHistory = histories[activeAgent.id] || [];
  const activeTheme = themeClasses[activeAgent.themeColor] || themeClasses['violet'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[80vh] animate-slide-in-up">
      {/* Agent Selection */}
      <div className="lg:col-span-1 bg-brand-glass border border-slate-700/50 rounded-xl shadow-xl backdrop-blur-xl p-4 flex flex-col">
        <h2 className="text-xl font-bold text-center mb-4">Your AI Team</h2>
        <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search agents..."
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-violet-light"
            />
        </div>
        <div className="space-y-3 overflow-y-auto pr-2 flex-1">
          {filteredAgents.length > 0 ? filteredAgents.map(agent => (
            <button key={agent.id} onClick={() => setActiveAgent(agent)} className={`w-full text-left p-4 rounded-lg transition-all border ${activeAgent.id === agent.id ? `${themeClasses[agent.themeColor].border} bg-slate-700/50 shadow-lg` : 'bg-slate-800/50 border-slate-700 hover:bg-slate-700/50 hover:border-slate-600'}`}>
              <div className="flex items-center gap-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center bg-slate-900/50`}>{agent.icon}</div>
                <div>
                  <h3 className="font-bold text-white">{agent.name}</h3>
                  <p className="text-sm text-slate-400">{agent.description}</p>
                </div>
              </div>
              {agent.externalTools && (
                <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500">Integrations:</span>
                    <div className="flex items-center gap-2">
                        {agent.externalTools.map(tool => (
                            <div key={tool.name} className="p-1.5 bg-slate-700 rounded-full" title={tool.name}>{tool.icon}</div>
                        ))}
                    </div>
                </div>
              )}
            </button>
          )) : (
            <p className="text-center text-slate-400 py-4">No agents found.</p>
          )}
        </div>
      </div>
      
      {/* Chat Interface */}
      <div className="lg:col-span-2 bg-brand-glass border border-slate-700/50 rounded-xl shadow-xl backdrop-blur-xl flex flex-col">
        <header className={`p-4 border-b ${themeClasses[activeAgent.themeColor].border}/30 flex items-center gap-4`}>
          <div className="flex-shrink-0 w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">{activeAgent.icon}</div>
          <h2 className="text-xl font-bold">Chat with the {activeAgent.name}</h2>
        </header>

        {error && <div className="p-4 text-center text-red-400 bg-red-500/10">{error}</div>}

        <div ref={chatContainerRef} className="flex-1 p-6 overflow-y-auto space-y-6">
          {currentHistory.map((msg, index) => {
            const { text, internalAction, externalAction } = parseMessageContent(msg.content);
            return (
                <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'model' && (
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">{activeAgent.icon}</div>
                )}
                <div className={`prose prose-invert prose-p:my-0 max-w-xl px-4 py-3 rounded-2xl ${msg.role === 'user' ? `${activeTheme.bubble} text-white rounded-br-none` : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
                    {text && <p>{text}</p>}
                    {internalAction && (
                        <button
                            onClick={() => onAction(internalAction.tool, internalAction.parameter)}
                            className="mt-2 w-full text-left flex items-center justify-center text-sm bg-violet-600 hover:bg-violet-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                        >
                           <Zap className="w-4 h-4 mr-2" /> Take Action in App
                        </button>
                    )}
                     {externalAction && (
                        <button
                            onClick={() => handleExternalAction(externalAction.app, externalAction.description)}
                            className="mt-2 w-full text-left flex items-center justify-center text-sm bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                        >
                           <Zap className="w-4 h-4 mr-2" /> {externalAction.description}
                        </button>
                    )}
                </div>
                </div>
            )
          })}
          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">{activeAgent.icon}</div>
              <div className="px-4 py-3 rounded-2xl bg-slate-700 rounded-bl-none"><TypingIndicator /></div>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-slate-700/50 flex-shrink-0 space-y-4">
        {currentHistory.length <= 1 && (
            <div className="animate-fade-in">
                <h3 className={`text-sm font-semibold text-center ${activeTheme.text} mb-2 flex items-center justify-center gap-2`}>
                    <Sparkles className="w-4 h-4" />
                    Conversation Starters
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeAgent.conversationStarters.map((starter, i) => (
                        <button key={i} onClick={() => handleSendMessage(starter)} className="text-left text-sm p-3 bg-slate-800/60 hover:bg-slate-700/80 rounded-lg transition-colors text-slate-300">
                           {starter}
                        </button>
                    ))}
                </div>
            </div>
        )}
        <form onSubmit={handleFormSubmit}>
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={activeAgent.placeholder}
              disabled={loading}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-violet-light transition-all shadow-inner"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full ${activeTheme.bg} hover:opacity-90 transition-opacity disabled:opacity-50`}
              title="Send Message"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default AIAgents;
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { Tab, Agent as AgentType, AgentSettings } from '../types.ts';
import { GoogleGenAI, Chat } from '@google/genai';
import { Send, Sparkles, Trash2, Bot, Zap, Sliders, ChevronsRight, Search, X } from './Icons.tsx';
import Spinner from './Spinner.tsx';
import { agents } from '../data/agents.ts';
import { useToast } from '../contexts/ToastContext.tsx';
import AgentSettingsModal from './AgentSettingsModal.tsx';

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

const ChatMessageContent: React.FC<{ 
    content: string; 
    onAction: (service: string, details: string) => void;
    onHandoff: (agentId: string, prompt: string) => void;
}> = ({ content, onAction, onHandoff }) => {
    const externalActionRegex = /EXTERNAL_ACTION:\[(TWITTER|GMAIL|GDRIVE|SLACK),"([\s\S]+?)"\]/s;
    const handoffActionRegex = /HANDOFF:\[(\w+),"([\s\S]+?)"\]/s;
    
    let currentContent = content;
    let actionButton = null;

    const externalMatch = currentContent.match(externalActionRegex);
    if (externalMatch) {
        currentContent = currentContent.replace(externalActionRegex, '').trim();
        const [, service, details] = externalMatch;
        const serviceName = service.charAt(0) + service.slice(1).toLowerCase();
        actionButton = (
            <button
                onClick={() => onAction(service, details)}
                className="mt-3 w-full flex items-center justify-center text-sm bg-violet-600 hover:bg-violet-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
                <Zap className="w-4 h-4 mr-2" /> Take Action: {serviceName}
            </button>
        );
    }

    const handoffMatch = currentContent.match(handoffActionRegex);
    if (handoffMatch) {
        currentContent = currentContent.replace(handoffActionRegex, '').trim();
        const [, agentId, prompt] = handoffMatch;
        const targetAgent = agents.find(a => a.id === agentId);
        if (targetAgent) {
            actionButton = (
                <button
                    onClick={() => onHandoff(agentId, prompt)}
                    className="mt-3 w-full flex items-center justify-center text-sm bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                    <ChevronsRight className="w-4 h-4 mr-2" /> Ask {targetAgent.name}
                </button>
            );
        }
    }

    return (
        <>
            <p>{currentContent}</p>
            {actionButton}
        </>
    );
};


const AIAgents: React.FC<AIAgentsProps> = ({ setActiveTab }) => {
  const { user, logActivity } = useAuth();
  const { showToast } = useToast();
  const [activeAgent, setActiveAgent] = useState<AgentType>(agents[0]);
  const [chat, setChat] = useState<Chat | null>(null);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Search
  const [searchTerm, setSearchTerm] = useState('');

  // Agent Settings
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [agentSettings, setAgentSettings] = useState<AgentSettings>({
    model: 'gemini-2.5-flash',
    temperature: 0.7,
  });

  useEffect(() => {
    if (user) {
        const savedSettings = localStorage.getItem(`utrend-agent-settings-${user.id}`);
        if (savedSettings) {
            setAgentSettings(JSON.parse(savedSettings));
        }
    }
  }, [user]);

  const initializeChat = useCallback((agent: AgentType, settings: AgentSettings, historyToRestore?: ChatMessage[]) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
      const chatInstance = ai.chats.create({
        model: settings.model,
        history: historyToRestore?.map(msg => ({
          role: msg.role,
          parts: [{ text: msg.content }],
        })),
        config: {
          systemInstruction: agent.systemInstruction,
          temperature: settings.temperature,
        },
      });
      setChat(chatInstance);
      return chatInstance;
    } catch (e) {
      console.error("Failed to initialize AI Chat:", e);
      setError("Could not initialize the AI chat service. Please check API key and refresh.");
      return null;
    }
  }, []);

  const switchAgent = useCallback((agent: AgentType, initialPrompt?: string) => {
    setActiveAgent(agent);
    const storageKey = `utrend-agent-chat-history-${user?.id}-${agent.id}`;
    const storedHistory = localStorage.getItem(storageKey);
    let initialHistory: ChatMessage[] = [];

    if (storedHistory) {
      initialHistory = JSON.parse(storedHistory);
    } else {
      initialHistory = [{ role: 'model', content: `Hello! I am the ${agent.name}. How can I assist you with my expertise today?` }];
    }
    
    setHistory(initialHistory);
    initializeChat(agent, agentSettings, initialHistory);

    if (initialPrompt) {
        handleSendMessage(initialPrompt, agent, initialHistory);
    }

  }, [user?.id, initializeChat, agentSettings]);

  useEffect(() => {
    if (user) {
      switchAgent(agents[0]);
    }
  }, [user, switchAgent]);

  useEffect(() => {
    if (user && history.length > 0) {
      const storageKey = `utrend-agent-chat-history-${user.id}-${activeAgent.id}`;
      localStorage.setItem(storageKey, JSON.stringify(history));
    }
  }, [history, user, activeAgent]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [history, loading]);
  
  const handleSaveSettings = (newSettings: AgentSettings) => {
    if (user) {
        if (newSettings.model === 'gemini-2.5-pro-latest' && user.plan !== 'pro') {
            showToast('The Pro model is only available on the Pro plan.');
            return;
        }
        setAgentSettings(newSettings);
        localStorage.setItem(`utrend-agent-settings-${user.id}`, JSON.stringify(newSettings));
        showToast('Agent settings saved!');
        setIsSettingsModalOpen(false);
        initializeChat(activeAgent, newSettings, history);
    }
  };

  const handleSendMessage = async (message: string, agentOverride?: AgentType, historyOverride?: ChatMessage[]) => {
    const currentAgent = agentOverride || activeAgent;
    const currentHistory = historyOverride || history;

    if (!message.trim() || loading) return;

    let chatInstance = chat;
    if (agentOverride) { // Re-initialize chat if agent is changing
        chatInstance = initializeChat(currentAgent, agentSettings, currentHistory);
    }
    if (!chatInstance) return;


    const newUserMessage: ChatMessage = { role: 'user', content: message };
    const updatedHistory = [...currentHistory, newUserMessage];
    setHistory(updatedHistory);
    setLoading(true);
    setInput('');
    
    let fullResponse = '';
    try {
      logActivity(`chatted with ${currentAgent.name}: "${message.substring(0, 30)}..."`, 'Bot');
      const stream = await chatInstance.sendMessageStream({ message });
      const finalHistoryWithPlaceholder = [...updatedHistory, { role: 'model', content: '' }];
      setHistory(finalHistoryWithPlaceholder);

      for await (const chunk of stream) {
        fullResponse += chunk.text;
        setHistory(prev => {
          const newHistory = [...prev];
          const lastMessage = newHistory[newHistory.length - 1];
          if (lastMessage?.role === 'model') {
            lastMessage.content = fullResponse;
          }
          return newHistory;
        });
      }
    } catch (e) {
      console.error("Error sending message to agent:", e);
       setHistory(prev => [...prev.slice(0, -1), { role: 'model', content: "I'm sorry, I encountered an error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(input);
    }
  };
  
  const handleClearChat = () => {
    const freshHistory: ChatMessage[] = [{ role: 'model', content: `Hello again from the ${activeAgent.name}! How can I help?` }];
    setHistory(freshHistory);
    initializeChat(activeAgent, agentSettings, freshHistory);
  };
  
  const handleAction = (service: string, details: string) => {
    let actionText = '';
    switch (service) {
        case 'TWITTER': actionText = 'Posted to X (Twitter)'; break;
        case 'GMAIL': actionText = 'Email sent via Gmail'; break;
        case 'GDRIVE': actionText = 'Saved to Google Drive'; break;
        case 'SLACK': actionText = 'Message sent to Slack'; break;
        default: actionText = `${service} action completed`;
    }
    showToast(`${actionText}! (Simulated)`);
  };

  const handleHandoff = (agentId: string, prompt: string) => {
    const targetAgent = agents.find(a => a.id === agentId);
    if (targetAgent) {
        switchAgent(targetAgent, prompt);
    }
  };
  
  const filteredAgents = useMemo(() => {
    if (!searchTerm) return agents;
    const lowercasedTerm = searchTerm.toLowerCase();
    return agents.filter(agent => 
        agent.name.toLowerCase().includes(lowercasedTerm) ||
        agent.description.toLowerCase().includes(lowercasedTerm) ||
        agent.keywords.some(kw => kw.toLowerCase().includes(lowercasedTerm))
    );
  }, [searchTerm]);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[85vh]">
        {/* Agent Selection Panel */}
        <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-4 flex flex-col animate-slide-in-up">
          <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Your AI Team</h2>
              <button onClick={() => setIsSettingsModalOpen(true)} title="AI Agent Settings" className="p-2 rounded-full hover:bg-slate-700/50 transition-colors">
                  <Sliders className="w-5 h-5 text-slate-400"/>
              </button>
          </div>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text"
              placeholder="Search agents..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 pl-10 pr-8"
            />
            {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-2 top-1/2 -translate-y-1/2"><X className="w-4 h-4"/></button>}
          </div>
          <div className="space-y-3 overflow-y-auto">
            {filteredAgents.map(agent => (
              <button
                key={agent.id}
                onClick={() => switchAgent(agent)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${activeAgent.id === agent.id ? `bg-violet-500/20 border-violet-500` : 'bg-slate-800/50 border-transparent hover:border-slate-600'}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${activeAgent.id === agent.id ? 'bg-violet-500' : 'bg-slate-700'}`}>
                    <agent.icon className={`w-6 h-6 ${agent.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white">{agent.name}</h3>
                    <p className="text-sm text-slate-400 mb-2">{agent.description}</p>
                    {agent.externalTools && agent.externalTools.length > 0 && (
                          <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs font-semibold text-slate-500">Tools:</span>
                              <div className="flex items-center gap-2">
                                  {agent.externalTools.map(tool => (
                                      <div key={tool.name} className="p-1.5 bg-slate-900/50 rounded-full" title={tool.name}>
                                          <tool.icon className="w-4 h-4 text-slate-300"/>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      )}
                  </div>
                </div>
              </button>
            ))}
             {filteredAgents.length === 0 && <p className="text-center text-sm text-slate-400 p-4">No agents found.</p>}
          </div>
        </div>

        {/* Chat Panel */}
        <div className="lg:col-span-2 bg-brand-glass border border-slate-700/50 rounded-xl shadow-xl flex flex-col animate-slide-in-up">
          <header className="p-4 border-b border-slate-700/50 flex-shrink-0 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-slate-700`}>
                  <activeAgent.icon className={`w-5 h-5 ${activeAgent.color}`} />
              </div>
              <h2 className="text-xl font-bold text-center">Chat with {activeAgent.name}</h2>
            </div>
            <button onClick={handleClearChat} title="Clear conversation" className="p-2 rounded-full hover:bg-slate-700/50">
              <Trash2 className="w-5 h-5 text-slate-400"/>
            </button>
          </header>
          
          {error && <div className="p-4 text-center text-red-400 bg-red-500/10">{error}</div>}

          <div ref={chatContainerRef} className="flex-1 p-6 overflow-y-auto space-y-6">
            {history.map((msg, index) => (
              <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'model' && (
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                    <activeAgent.icon className={`w-5 h-5 ${activeAgent.color}`} />
                  </div>
                )}
                <div className={`prose prose-invert prose-p:my-0 prose-strong:text-white max-w-xl px-4 py-3 rounded-2xl ${msg.role === 'user' ? 'bg-violet text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
                  <ChatMessageContent content={msg.content} onAction={handleAction} onHandoff={handleHandoff} />
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                  <activeAgent.icon className={`w-5 h-5 ${activeAgent.color}`} />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-slate-700 rounded-bl-none">
                  <TypingIndicator />
                </div>
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-slate-700/50 flex-shrink-0 space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {activeAgent.starterPrompts.map((prompt, i) => (
                <button key={i} onClick={() => handleSendMessage(prompt)} className="text-left text-sm p-3 bg-slate-800/60 hover:bg-slate-700/80 rounded-lg transition-colors text-slate-300">
                  {prompt}
                </button>
              ))}
            </div>
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Ask ${activeAgent.name}...`}
                disabled={loading}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-violet-light transition-all resize-none shadow-inner"
                rows={1}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <button
                  onClick={() => handleSendMessage(input)}
                  disabled={loading || !input.trim()}
                  className="p-2 rounded-full bg-violet hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? <Spinner size="sm" /> : <Send className="w-5 h-5 text-white" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AgentSettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          currentSettings={agentSettings}
          onSave={handleSaveSettings}
      />
    </>
  );
};

export default AIAgents;
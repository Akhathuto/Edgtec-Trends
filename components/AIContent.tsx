
import React, { useState, useEffect, useMemo, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { Copy, CheckCircle, Sparkles, Zap, Lightbulb, RefreshCw, User, Clock, MessageSquare } from './Icons';

interface AIContentProps {
    content: string;
    type?: 'insight' | 'script' | 'repurpose' | 'chat';
    title?: string;
    animate?: boolean;
    className?: string;
    minimal?: boolean;
}

export const AIContent: React.FC<AIContentProps> = ({ 
    content, 
    type = 'insight', 
    title,
    animate = true,
    className = '',
    minimal = false
}) => {
    const [displayedContent, setDisplayedContent] = useState(animate ? '' : content);
    const [isTyping, setIsTyping] = useState(animate);
    const [isThinking, setIsThinking] = useState(animate);
    const [copied, setCopied] = useState(false);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Calculate read time
    const readTime = useMemo(() => {
        const words = content.split(/\s+/).length;
        const minutes = Math.ceil(words / 200);
        return minutes === 1 ? '1 min read' : `${minutes} min read`;
    }, [content]);

    // Current time for "Sent at"
    const sentAt = useMemo(() => {
        return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }, []);

    useEffect(() => {
        if (!animate) {
            setDisplayedContent(content);
            setIsTyping(false);
            setIsThinking(false);
            return;
        }

        setDisplayedContent('');
        setIsThinking(true);
        setIsTyping(false);

        // Simulate "thinking" phase
        const thinkingDuration = Math.min(1500, 500 + content.length * 2);
        const thinkingTimeout = setTimeout(() => {
            setIsThinking(false);
            setIsTyping(true);
            startTyping(0);
        }, thinkingDuration);

        const startTyping = (index: number) => {
            if (index < content.length) {
                setDisplayedContent((prev) => prev + content.charAt(index));
                
                // Natural typing logic: 
                // - Faster for long content
                // - Slower after punctuation
                // - Randomized variation
                const char = content.charAt(index);
                let delay = content.length > 1000 ? 2 : 8;
                
                if (['.', '!', '?', '\n'].includes(char)) {
                    delay += 150; // Pause after sentences
                } else if ([',', ';', ':'].includes(char)) {
                    delay += 50; // Slight pause after commas
                }
                
                // Add some randomness
                delay += Math.random() * 15;

                typingTimeoutRef.current = setTimeout(() => startTyping(index + 1), delay);
            } else {
                setIsTyping(false);
            }
        };

        return () => {
            clearTimeout(thinkingTimeout);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        };
    }, [content, animate]);

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const icon = useMemo(() => {
        switch (type) {
            case 'insight': return <Lightbulb className="w-5 h-5 text-amber-400" />;
            case 'script': return <Zap className="w-5 h-5 text-violet-400" />;
            case 'repurpose': return <RefreshCw className="w-5 h-5 text-emerald-400" />;
            default: return <Sparkles className="w-5 h-5 text-violet-400" />;
        }
    }, [type]);

    const displayTitle = useMemo(() => {
        if (title) return title;
        switch (type) {
            case 'insight': return 'Strategic Insight';
            case 'script': return 'Creative Script';
            case 'repurpose': return 'Content Adaptation';
            default: return 'Assistant Response';
        }
    }, [title, type]);

    if (minimal) {
        return (
            <div className={`flex gap-4 ${className}`}>
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg">
                    <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-white tracking-tight">Nolo AI</span>
                        <span className="text-[10px] text-slate-500">{sentAt}</span>
                    </div>
                    <div className="markdown-body ai-content-body prose prose-invert max-w-none">
                        {isThinking ? (
                            <div className="flex gap-1 items-center h-6">
                                <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1 h-1 bg-violet-400 rounded-full" />
                                <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1 h-1 bg-violet-400 rounded-full" />
                                <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1 h-1 bg-violet-400 rounded-full" />
                            </div>
                        ) : (
                            <>
                                <ReactMarkdown>{displayedContent}</ReactMarkdown>
                                {isTyping && <span className="typing-cursor" />}
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`relative group ${className}`}>
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-600/20 to-indigo-600/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            
            <div className="relative bg-slate-900/60 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-2xl">
                {/* Header - Humanized */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 via-violet-600 to-indigo-700 flex items-center justify-center shadow-inner">
                                {icon}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full shadow-sm"></div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-white tracking-tight">Nolo</span>
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-violet-500/20 text-violet-300 uppercase tracking-widest border border-violet-500/20">AI Strategist</span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium flex items-center gap-2">
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {sentAt}</span>
                                <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                                <span>{readTime}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={handleCopy}
                            className="p-2 hover:bg-white/10 rounded-xl transition-all text-slate-400 hover:text-white border border-transparent hover:border-white/10"
                            title="Copy to clipboard"
                        >
                            {copied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-6 md:p-10">
                    {isThinking ? (
                        <div className="flex flex-col gap-4 py-4">
                            <div className="flex gap-2 items-center">
                                <div className="flex gap-1">
                                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-2 h-2 bg-violet-500 rounded-full" />
                                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="w-2 h-2 bg-violet-500 rounded-full" />
                                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="w-2 h-2 bg-violet-500 rounded-full" />
                                </div>
                                <span className="text-xs font-medium text-slate-500 italic">Nolo is crafting your response...</span>
                            </div>
                            <div className="space-y-2">
                                <div className="h-4 bg-white/5 rounded-full w-3/4 animate-pulse"></div>
                                <div className="h-4 bg-white/5 rounded-full w-1/2 animate-pulse"></div>
                            </div>
                        </div>
                    ) : (
                        <div className="markdown-body ai-content-body prose prose-invert max-w-none">
                            <ReactMarkdown>
                                {displayedContent}
                            </ReactMarkdown>
                            {isTyping && <span className="typing-cursor" />}
                        </div>
                    )}
                </div>

                {/* Footer - Humanized */}
                <AnimatePresence>
                    {!isTyping && !isThinking && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="px-8 py-4 bg-slate-900/40 border-t border-white/5 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
                                <div className="flex -space-x-2">
                                    <div className="w-6 h-6 rounded-full border-2 border-slate-900 bg-violet-500 flex items-center justify-center">
                                        <Sparkles className="w-3 h-3 text-white" />
                                    </div>
                                    <div className="w-6 h-6 rounded-full border-2 border-slate-900 bg-emerald-500 flex items-center justify-center">
                                        <CheckCircle className="w-3 h-3 text-white" />
                                    </div>
                                </div>
                                <span>Verified by Nolo Intelligence</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <button className="text-[10px] font-bold text-slate-500 hover:text-violet-400 uppercase tracking-widest transition-colors flex items-center gap-1">
                                    <MessageSquare className="w-3 h-3" /> Feedback
                                </button>
                                <div className="h-4 w-[1px] bg-white/10"></div>
                                <div className="text-[10px] font-bold text-violet-400 uppercase tracking-tighter">
                                    {type === 'insight' ? 'Actionable Strategy' : 'Creative Draft'}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

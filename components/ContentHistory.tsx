import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { History, FileText, CheckCircle, Copy } from './Icons';
import { HistoryItem, HistoryContentType } from '../types';
import { format } from 'date-fns';
import Modal from './Modal';
import { useToast } from '../contexts/ToastContext';

const contentTypes: HistoryContentType[] = [
    'Content Idea',
    'Strategy Report',
    'Video Transcript',
    'Generated Prompt',
    'Image Edit',
    'Keyword Analysis',
    'Channel Growth Plan',
    'Sponsorship Opportunities',
    'Brand Pitch',
    'Animation',
    'GIF',
    'Logo',
];

const HistoryModalContent: React.FC<{ item: HistoryItem | null }> = ({ item }) => {
    const { showToast } = useToast();
    if (!item) return null;
    
    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        showToast("Content copied to clipboard!");
    }

    switch (item.type) {
        case 'Content Idea':
            return (
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-violet-300">{item.content.title}</h3>
                    <p className="italic text-slate-300">"{item.content.hook}"</p>
                    <div>
                        <h4 className="font-semibold text-slate-200 mb-2">Script Outline:</h4>
                        <ul className="space-y-1.5 text-slate-400 list-disc list-inside">
                            {item.content.script_outline.map((step: string, i: number) => <li key={i}>{step}</li>)}
                        </ul>
                    </div>
                </div>
            );
        case 'Strategy Report':
            return (
                <div className="space-y-4 prose prose-invert max-w-none">
                    <h4>Trend Analysis</h4>
                    <p>{item.content.trendAnalysis}</p>
                    <h4>Content Ideas</h4>
                    <ul>{item.content.contentIdeas.map((idea: any, i: number) => <li key={i}>{idea.title}</li>)}</ul>
                    <h4>Monetization Strategies</h4>
                    <ul>{item.content.monetizationStrategies.map((s: any, i: number) => <li key={i}>{s.strategy}</li>)}</ul>
                </div>
            );
        case 'Image Edit':
            return (
                <div className="space-y-4">
                    <p className="text-slate-300"><strong>Prompt:</strong> {item.content.prompt}</p>
                    {item.content.aiNote && <p className="text-slate-400 italic"><strong>AI Note:</strong> {item.content.aiNote}</p>}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-semibold text-center mb-2">Original</h4>
                            <img src={item.content.originalImageUrl} alt="Original" className="rounded-lg" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-center mb-2">Edited</h4>
                            <img src={`data:${item.content.mimeType};base64,${item.content.editedImageBase64}`} alt="Edited" className="rounded-lg" />
                        </div>
                    </div>
                </div>
            );
         case 'Brand Pitch':
            const fullPitch = `Subject: ${item.content.pitch.subject}\n\n${item.content.pitch.body}`;
            return (
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-slate-200">Pitch for {item.content.opportunity.brandName}</h4>
                        <button onClick={() => handleCopy(fullPitch)} className="flex items-center gap-2 text-xs bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded-md">
                            <Copy className="w-3 h-3"/> Copy Full Pitch
                        </button>
                    </div>
                    <pre className="text-sm bg-slate-800/50 rounded-lg p-3 whitespace-pre-wrap font-mono text-slate-300 border border-slate-700">{fullPitch}</pre>
                </div>
            );
        case 'Animation':
            return (
                 <div className="space-y-3">
                    <h4 className="font-semibold text-slate-200">Animation Details</h4>
                    <p className="text-sm text-slate-300"><strong>Prompt:</strong> {item.content.prompt}</p>
                    <p className="text-sm text-slate-300"><strong>Style:</strong> {item.content.style}</p>
                 </div>
            );
        case 'GIF':
            return (
                <div className="space-y-3">
                    <h4 className="font-semibold text-slate-200">GIF Details</h4>
                    <p className="text-sm text-slate-300"><strong>Prompt:</strong> {item.content.prompt}</p>
                    <p className="text-xs text-slate-500">Note: GIFs are not stored, only the prompt is saved.</p>
                </div>
            );
        case 'Logo':
            return (
                <div className="space-y-4">
                    <p className="text-slate-300"><strong>Prompt:</strong> {item.content.prompt}</p>
                    <p className="text-slate-300"><strong>Style:</strong> {item.content.style}</p>
                    <div>
                        <h4 className="font-semibold text-center mb-2">Generated Logo</h4>
                        <img src={`data:image/png;base64,${item.content.logoBase64}`} alt="Generated Logo" className="rounded-lg w-48 h-48 mx-auto bg-slate-100 p-2" />
                    </div>
                </div>
            );
        default:
            return <pre className="text-sm bg-slate-800/50 rounded-lg p-3 whitespace-pre-wrap font-mono text-slate-300 border border-slate-700">{JSON.stringify(item.content, null, 2)}</pre>;
    }
};


const ContentHistory: React.FC = () => {
    const { getContentHistory } = useAuth();
    const [filter, setFilter] = useState<HistoryContentType | 'All'>('All');
    const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

    const history = useMemo(() => getContentHistory(), [getContentHistory]);

    const filteredHistory = useMemo(() => {
        if (filter === 'All') return history;
        return history.filter(item => item.type === filter);
    }, [history, filter]);

    return (
        <div className="animate-slide-in-up space-y-8">
            <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl">
                <h2 className="text-2xl font-bold text-center mb-1 text-slate-100 flex items-center justify-center gap-2">
                    <History className="w-6 h-6 text-violet-400" /> My Content
                </h2>
                <p className="text-center text-slate-400 mb-6">A complete history of all your generated content.</p>
                
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                    <button 
                        onClick={() => setFilter('All')}
                        className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${filter === 'All' ? 'bg-violet text-white' : 'bg-slate-700/50 hover:bg-slate-600/50'}`}
                    >
                        All
                    </button>
                    {contentTypes.map(type => (
                        <button 
                            key={type}
                            onClick={() => setFilter(type)}
                            className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${filter === type ? 'bg-violet text-white' : 'bg-slate-700/50 hover:bg-slate-600/50'}`}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                {filteredHistory.length === 0 ? (
                    <div className="text-center py-10">
                        <FileText className="w-12 h-12 mx-auto text-slate-600 mb-4" />
                        <h3 className="text-xl font-bold">No Content Yet</h3>
                        <p className="text-slate-400">Your generated content will appear here once you start using the tools.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredHistory.map(item => (
                            <div key={item.id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 flex flex-col transition-all duration-300 hover:border-violet-500 hover:shadow-glow-md hover:-translate-y-1">
                                <div className="flex-grow">
                                    <span className="text-xs bg-slate-700 text-violet-300 font-medium px-2.5 py-1 rounded-full">{item.type}</span>
                                    <p className="text-slate-300 mt-3 text-sm flex-grow line-clamp-3">{item.summary}</p>
                                </div>
                                <div className="mt-4 pt-3 border-t border-slate-700/50 flex justify-between items-center">
                                    <p className="text-xs text-slate-500">{format(new Date(item.timestamp), 'MMM d, yyyy h:mm a')}</p>
                                    <button onClick={() => setSelectedItem(item)} className="text-sm font-semibold text-violet-300 hover:text-white">View Content</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            <Modal isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} title={selectedItem?.type || ''}>
                <HistoryModalContent item={selectedItem} />
            </Modal>
        </div>
    );
};

export default ContentHistory;
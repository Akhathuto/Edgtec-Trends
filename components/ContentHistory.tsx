import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { History, FileText, CheckCircle, Copy, Download } from './Icons.tsx';
import { HistoryItem, HistoryContentType } from '../types.ts';
import { format } from 'date-fns';
import Modal from './Modal.tsx';
import { useToast } from '../contexts/ToastContext.tsx';

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
    'Video Analysis',
    'Animation',
    'GIF',
    'Logo',
    'Repurposed Content',
    'Thumbnail Idea',
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
                    <p className="text-slate-300"><strong>Transparent Background:</strong> {item.content.transparentBg ? 'Yes' : 'No'}</p>
                    <div>
                        <h4 className="font-semibold text-center mb-2">Generated Logo</h4>
                        <img src={`data:image/png;base64,${item.content.logoBase64}`} alt="Generated Logo" className="rounded-lg w-48 h-48 mx-auto bg-slate-100 p-2" />
                    </div>
                </div>
            );
        case 'Thumbnail Idea':
            return (
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-violet-300">Thumbnail for: {item.content.title}</h3>
                    <p className="text-slate-300"><strong>Style:</strong> {item.content.style}</p>
                    <p className="text-slate-300"><strong>Text Overlay:</strong> {item.content.textOverlay}</p>
                    <p className="text-slate-300"><strong>Visual Description:</strong> {item.content.visualDescription}</p>
                    <div>
                        <h4 className="font-semibold text-slate-200 mb-2">AI Image Prompt</h4>
                        <pre className="text-sm bg-slate-800/50 rounded-lg p-3 whitespace-pre-wrap font-mono text-slate-300 border border-slate-700">{item.content.imageGenPrompt}</pre>
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

    const handleDownload = () => {
        if (!selectedItem) return;

        const { type, content } = selectedItem;
        const filenameBase = `${type.replace(/\s+/g, '_')}_${Date.now()}`;

        const downloadFile = (fileContent: string, filename: string, contentType: string) => {
            const blob = new Blob([fileContent], { type: contentType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        };

        const downloadBase64Image = (base64Data: string, filename: string, mimeType: string) => {
            const link = document.createElement('a');
            link.href = `data:${mimeType};base64,${base64Data}`;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

        switch (type) {
            case 'Content Idea': {
                let textContent = `Title: ${content.title}\n\n`;
                textContent += `Hook: ${content.hook}\n\n`;
                textContent += `Script Outline:\n- ${content.script_outline.join('\n- ')}\n\n`;
                textContent += `Hashtags: ${content.hashtags.join(', ')}`;
                downloadFile(textContent, `${filenameBase}.txt`, 'text/plain;charset=utf-8');
                break;
            }
            case 'Strategy Report': {
                let mdContent = `# Content Strategy Report\n\n`;
                mdContent += `## Trend Analysis\n${content.trendAnalysis}\n\n`;
                mdContent += `## Content Ideas\n`;
                content.contentIdeas.forEach((idea: any, index: number) => {
                    mdContent += `### Idea ${index + 1}: ${idea.title}\n**Hook:** ${idea.hook}\n\n`;
                });
                mdContent += `## Monetization Strategies\n`;
                content.monetizationStrategies.forEach((strategy: any) => {
                    mdContent += `### ${strategy.strategy}\n**Description:** ${strategy.description}\n\n`;
                });
                downloadFile(mdContent, `${filenameBase}.md`, 'text/markdown;charset=utf-8');
                break;
            }
            case 'Video Transcript': {
                const textContent = `Prompt: ${content.prompt}\n\n---\n\nTranscript:\n${content.transcript}`;
                downloadFile(textContent, `${filenameBase}.txt`, 'text/plain;charset=utf-8');
                break;
            }
            case 'Generated Prompt': {
                downloadFile(content.output, `${filenameBase}.txt`, 'text/plain;charset=utf-8');
                break;
            }
            case 'Image Edit': {
                downloadBase64Image(content.editedImageBase64, `${filenameBase}.png`, content.mimeType);
                break;
            }
            case 'Keyword Analysis': {
                downloadFile(JSON.stringify(content, null, 2), `${filenameBase}.json`, 'application/json');
                break;
            }
            case 'Channel Growth Plan': {
                let mdContent = `# Channel Growth Plan\n\n`;
                Object.entries(content).forEach(([key, value]: [string, any]) => {
                    const title = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                    mdContent += `## ${title}\n\n**Analysis:**\n${value.analysis}\n\n**Recommendations:**\n${value.recommendations.map((rec: string) => `- ${rec}`).join('\n')}\n\n`;
                });
                downloadFile(mdContent, `${filenameBase}.md`, 'text/markdown;charset=utf-8');
                break;
            }
            case 'Sponsorship Opportunities': {
                const headers = "Brand Name,Industry,Relevance,Sponsor Match Score\n";
                const csvContent = content.map((opp: any) => 
                    `"${opp.brandName}","${opp.industry}","${opp.relevance.replace(/"/g, '""')}","${opp.sponsorMatchScore}"`
                ).join('\n');
                downloadFile(headers + csvContent, `${filenameBase}.csv`, 'text/csv;charset=utf-8');
                break;
            }
            case 'Brand Pitch': {
                const textContent = `Subject: ${content.pitch.subject}\n\n${content.pitch.body}`;
                downloadFile(textContent, `${filenameBase}.txt`, 'text/plain;charset=utf-8');
                break;
            }
            case 'Animation':
            case 'GIF': {
                const textContent = `Type: ${type}\nPrompt: ${content.prompt}\nStyle: ${content.style || 'N/A'}`;
                downloadFile(textContent, `${filenameBase}_prompt.txt`, 'text/plain;charset=utf-8');
                break;
            }
            case 'Logo': {
                downloadBase64Image(content.logoBase64, `${filenameBase}.png`, 'image/png');
                break;
            }
            case 'Thumbnail Idea': {
                const textContent = `Title: ${content.title}\n\nStyle: ${content.style}\nText Overlay: ${content.textOverlay}\nVisual Description: ${content.visualDescription}\n\nImage Generator Prompt:\n${content.imageGenPrompt}`;
                downloadFile(textContent, `${filenameBase}.txt`, 'text/plain;charset=utf-8');
                break;
            }
            default: {
                downloadFile(JSON.stringify(content, null, 2), `${filenameBase}.json`, 'application/json');
                break;
            }
        }
    };

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
                        {filteredHistory.map((item, index) => (
                            <div key={item.id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 flex flex-col transition-all duration-300 hover:border-violet-500 hover:shadow-glow-md hover:-translate-y-1 animate-fade-in-down opacity-0" style={{ animationDelay: `${index * 50}ms` }}>
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
            
            <Modal
                isOpen={!!selectedItem}
                onClose={() => setSelectedItem(null)}
                title={selectedItem?.type || ''}
                footer={
                    selectedItem && (
                        <button
                            onClick={handleDownload}
                            className="flex items-center gap-2 text-sm bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                        >
                            <Download className="w-4 h-4" /> Download
                        </button>
                    )
                }
            >
                <HistoryModalContent item={selectedItem} />
            </Modal>
        </div>
    );
};

export default ContentHistory;
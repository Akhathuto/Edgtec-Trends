import React, { useState } from 'react';
import { ToolId } from '../types';
import ImageEditor from '../components/ImageEditor';
import VideoEditor from '../components/VideoEditor';
import { Image, Video } from '../components/Icons';

interface MediaEditorProps {
  onNavigate: (toolId: ToolId, state?: any) => void;
}

export const MediaEditor: React.FC<MediaEditorProps> = ({ onNavigate }) => {
    const [activeEditor, setActiveEditor] = useState<'image' | 'video'>('image');

    return (
        <div className="animate-slide-in-up space-y-8">
            <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-xl">
                <h2 className="text-2xl font-bold text-center mb-1 text-slate-100 flex items-center justify-center gap-2">
                    <Video className="w-6 h-6 text-violet-400" /> AI Media Editor
                </h2>
                <p className="text-center text-slate-400 mb-6">Enhance and edit your visual content with AI.</p>
                
                <div className="max-w-md mx-auto">
                    <div className="segmented-control">
                        <button 
                            onClick={() => setActiveEditor('image')} 
                            className={`flex items-center justify-center gap-2 ${activeEditor === 'image' ? 'active' : ''}`}
                        >
                            <Image className="w-4 h-4" /> Image Editor
                        </button>
                        <button 
                            onClick={() => setActiveEditor('video')} 
                            className={`flex items-center justify-center gap-2 ${activeEditor === 'video' ? 'active' : ''}`}
                        >
                            <Video className="w-4 h-4" /> Video Editor
                        </button>
                    </div>
                </div>
            </div>

            <div className="animate-fade-in">
                {activeEditor === 'image' ? <ImageEditor onNavigate={onNavigate} /> : <VideoEditor onNavigate={onNavigate} />}
            </div>
        </div>
    );
};

import React from 'react';
import VideoEditorComponent from '../components/VideoEditor';
import { ToolId } from '../types';

interface VideoEditorProps {
  onNavigate: (toolId: ToolId, state?: any) => void;
}

export const VideoEditor: React.FC<VideoEditorProps> = ({ onNavigate }) => {
  return <VideoEditorComponent onNavigate={onNavigate} />;
};

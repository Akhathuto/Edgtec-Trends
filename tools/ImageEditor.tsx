import React from 'react';
import { ToolId } from '../types';
import ImageEditorComponent from '../components/ImageEditor';

interface ImageEditorProps {
  onNavigate: (toolId: ToolId, state?: any) => void;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({ onNavigate }) => {
  return (
    <div className="animate-slide-in-up space-y-8">
      <ImageEditorComponent onNavigate={onNavigate} />
    </div>
  );
};

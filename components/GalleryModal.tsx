import React from 'react';
import { X } from './Icons';

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  altText: string;
}

const GalleryModal: React.FC<GalleryModalProps> = ({ isOpen, onClose, imageUrl, altText }) => {
  if (!isOpen || !imageUrl) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-center animate-fade-in backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image gallery"
    >
      <div 
        className="relative max-w-4xl max-h-[90vh] w-full p-4"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <button 
          onClick={onClose} 
          className="absolute -top-2 -right-2 z-10 text-white bg-slate-800/50 rounded-full p-2 hover:bg-slate-700/80 transition-colors" 
          aria-label="Close gallery"
        >
          <X className="w-6 h-6" />
        </button>
        <img 
          src={imageUrl} 
          alt={altText} 
          className="w-full h-full object-contain rounded-lg shadow-2xl"
        />
      </div>
    </div>
  );
};

export default GalleryModal;

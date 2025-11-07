import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, X } from './Icons';

interface Image {
    base64: string;
    prompt: string;
    style: string;
    aspectRatio: string;
}

interface GalleryModalProps {
    isOpen: boolean;
    onClose: () => void;
    images: Image[];
    startIndex: number | null;
}

const GalleryModal: React.FC<GalleryModalProps> = ({ isOpen, onClose, images, startIndex }) => {
    const [currentIndex, setCurrentIndex] = useState(startIndex);

    useEffect(() => {
        setCurrentIndex(startIndex);
    }, [startIndex]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex]); // Re-bind to get latest currentIndex

    if (!isOpen || currentIndex === null || !images[currentIndex]) {
        return null;
    }

    const currentImage = images[currentIndex];
    
    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = `data:image/png;base64,${currentImage.base64}`;
        link.download = `utrend_image_${Date.now()}.png`;
        link.click();
    };

    const handlePrev = () => {
        setCurrentIndex(prev => (prev !== null ? (prev > 0 ? prev - 1 : images.length - 1) : 0));
    };

    const handleNext = () => {
        setCurrentIndex(prev => (prev !== null ? (prev < images.length - 1 ? prev + 1 : 0) : 0));
    };

    return (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-center animate-fade-in backdrop-blur-md"
          onClick={onClose}
        >
            <div className="relative w-full h-full flex items-center justify-center p-4" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-white hover:text-slate-300 z-20 bg-black/30 rounded-full p-2" aria-label="Close modal"><X className="w-8 h-8"/></button>
                
                {images.length > 1 && (
                    <>
                        <button onClick={handlePrev} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 rounded-full hover:bg-white/20 z-10" aria-label="Previous image"><ArrowLeft className="w-6 h-6"/></button>
                        <button onClick={handleNext} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 rounded-full hover:bg-white/20 z-10" aria-label="Next image"><ArrowLeft className="w-6 h-6 rotate-180"/></button>
                    </>
                )}

                <div className="max-w-4xl max-h-[90vh] flex flex-col gap-4 animate-scale-in">
                    <div className="flex-grow flex items-center justify-center">
                        <img src={`data:image/png;base64,${currentImage.base64}`} alt={currentImage.prompt} className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"/>
                    </div>
                    <div className="bg-slate-900/70 p-4 rounded-lg flex-shrink-0">
                        <p className="text-slate-300 text-sm mb-2">{currentImage.prompt}</p>
                        <div className="flex justify-between items-center">
                            <div className="flex gap-2 text-xs">
                                <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded">{currentImage.style}</span>
                                {currentImage.aspectRatio && <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded">{currentImage.aspectRatio}</span>}
                            </div>
                            <button onClick={handleDownload} className="flex items-center gap-2 text-sm bg-violet-600 hover:bg-violet-500 text-white font-semibold py-2 px-3 rounded-lg transition-colors">
                                <Download className="w-4 h-4"/> Download
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GalleryModal;

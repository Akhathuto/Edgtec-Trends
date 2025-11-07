import React from 'react';
import { X } from './Icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center animate-fade-in backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="bg-slate-900/80 backdrop-blur-2xl border border-slate-700 rounded-xl shadow-glow-violet w-full max-w-2xl max-h-[80vh] flex flex-col m-4 animate-scale-in"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <header className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0">
          <h2 id="modal-title" className="text-xl font-bold text-slate-100 text-glow">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors" aria-label="Close modal">
            <X className="w-6 h-6" />
          </button>
        </header>
        <main className="p-6 overflow-y-auto">
          {children}
        </main>
        {footer && (
          <footer className="flex items-center justify-end p-4 border-t border-slate-700 flex-shrink-0 gap-3">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
};

export default Modal;

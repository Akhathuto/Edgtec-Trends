
import React, { useEffect } from 'react';
import { CheckCircle, X } from './Icons';

interface ToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className="fixed bottom-24 right-4 z-50 bg-green-600/90 text-white p-4 rounded-lg shadow-2xl flex items-center gap-3 animate-slide-in-up backdrop-blur-sm border border-green-500">
      <CheckCircle className="w-6 h-6 flex-shrink-0" />
      <span className="font-semibold">{message}</span>
      <button onClick={onClose} className="ml-4 p-1 rounded-full hover:bg-white/20 transition-colors" aria-label="Close notification">
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Toast;

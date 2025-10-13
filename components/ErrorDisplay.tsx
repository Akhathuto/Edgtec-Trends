import React from 'react';
import { Info } from './Icons';

interface ErrorDisplayProps {
  message: string | null;
  className?: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, className = '' }) => {
  if (!message) return null;

  return (
    <div className={`bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg text-center flex items-center justify-center gap-2 ${className}`}>
      <Info className="w-5 h-5 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
};

export default ErrorDisplay;

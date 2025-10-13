

'use client';

import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import Toast from '../components/Toast';

interface ToastContextType {
  showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// FIX: Removed React.FC for better type inference with modern React.
// FIX: Changed component signature to use React.PropsWithChildren to resolve typing error for children prop.
export const ToastProvider = ({ children }: React.PropsWithChildren) => {
  const [message, setMessage] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  
  const showToast = useCallback((msg: string) => {
    setMessage(msg);
    setIsVisible(true);
  }, []);

  const hideToast = useCallback(() => {
    setIsVisible(false);
    setMessage('');
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {isVisible && <Toast message={message} onClose={hideToast} />}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

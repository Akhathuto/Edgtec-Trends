
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import Toast from '../components/Toast';

interface ToastContextType {
  showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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

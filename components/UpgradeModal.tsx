'use client';

import React from 'react';
import { X, Star, CheckCircle } from './Icons';
import { useAuth } from '../contexts/AuthContext';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProFeatures = [
    "View all trending channels and topics",
    "Generate multiple content ideas at once",
    "Unlock AI-powered script generation",
    "Access the AI Video Generator",
    "Create full Content Strategy Reports",
    "Priority support"
];

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
  const { upgradePlan } = useAuth();
  if (!isOpen) return null;
  
  const handleUpgrade = () => {
      upgradePlan('pro');
      onClose();
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center animate-fade-in backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="bg-brand-glass border border-slate-700/50 rounded-xl shadow-xl w-full max-w-md flex flex-col m-4 animate-slide-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0">
          <h2 id="modal-title" className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-400"/> Upgrade to utrend Pro
            </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors" aria-label="Close modal">
            <X className="w-6 h-6" />
          </button>
        </header>
        <main className="p-6">
          <p className="text-slate-300 mb-6">Unlock all features and supercharge your content creation with the Pro plan.</p>
          <ul className="space-y-3 mb-8">
            {ProFeatures.map((feature, index) => (
                <li key={index} className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-green-400 flex-shrink-0"/>
                    <span>{feature}</span>
                </li>
            ))}
          </ul>
          <button
            onClick={handleUpgrade}
            className="w-full flex items-center justify-center bg-gradient-to-r from-violet-dark to-violet-light text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity"
          >
              Upgrade Now
          </button>
           <p className="text-xs text-center text-slate-500 mt-4">(This is a simulation. Clicking will upgrade your account.)</p>
        </main>
      </div>
    </div>
  );
};

export default UpgradeModal;
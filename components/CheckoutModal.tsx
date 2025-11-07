import React, { useState } from 'react';
import { X, CreditCard } from './Icons';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { User } from '../types';
import Spinner from './Spinner';
import { plans } from '../data/plans';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: User['plan'] | null;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, plan }) => {
  const { upgradePlan } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  if (!isOpen || !plan) return null;
  
  const planDetails = plans.find(p => p.name.toLowerCase() === plan);
  if (!planDetails) return null; 

  const handlePayment = (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setLoading(true);
      setTimeout(() => {
          try {
             if (plan === 'starter' || plan === 'pro') {
                upgradePlan(plan);
                showToast(`Successfully upgraded to the ${planDetails.name} plan!`);
                onClose();
             } else {
                 throw new Error("Invalid plan selected");
             }
          } catch (err) {
              setError("Payment failed. Please try again.");
          } finally {
              setLoading(false);
          }
      }, 1500);
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
        className="bg-slate-900/80 backdrop-blur-2xl border border-slate-700 rounded-xl shadow-glow-violet w-full max-w-md flex flex-col m-4 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0">
          <h2 id="modal-title" className="text-xl font-bold text-slate-100 text-glow">
            Secure Checkout
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors" aria-label="Close modal">
            <X className="w-6 h-6" />
          </button>
        </header>
        <main className="p-6">
           <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 mb-6 text-center">
                <p className="text-sm text-slate-300">You are upgrading to</p>
                <p className="text-2xl font-bold text-violet-300">{planDetails.name} Plan</p>
                <p className="text-3xl font-bold text-white mt-1">{planDetails.price}<span className="text-base font-normal text-slate-400">/month</span></p>
           </div>
           <form onSubmit={handlePayment} className="space-y-4">
               {error && <p className="bg-red-500/20 text-red-300 text-center text-sm p-3 rounded-lg">{error}</p>}
                <div>
                    <label htmlFor="card-name" className="block text-sm font-medium text-slate-300 mb-1">Name on Card</label>
                    <input type="text" id="card-name" placeholder="John Doe" value={cardName} onChange={(e) => setCardName(e.target.value)} className="form-input"/>
                </div>
                 <div>
                    <label htmlFor="card-number" className="block text-sm font-medium text-slate-300 mb-1">Card Number</label>
                    <div className="relative">
                        <input type="text" id="card-number" placeholder="0000 0000 0000 0000" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} maxLength={16} className="form-input pl-10"/>
                         <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label htmlFor="card-expiry" className="block text-sm font-medium text-slate-300 mb-1">Expiry Date</label>
                        <input type="text" id="card-expiry" placeholder="MM/YY" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} maxLength={5} className="form-input"/>
                    </div>
                     <div>
                        <label htmlFor="card-cvc" className="block text-sm font-medium text-slate-300 mb-1">CVC</label>
                        <input type="text" id="card-cvc" placeholder="123" value={cardCvc} onChange={(e) => setCardCvc(e.target.value)} maxLength={4} className="form-input"/>
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="button-primary w-full"
                >
                    {loading ? <Spinner /> : `Pay ${planDetails.price}`}
                </button>
                <p className="text-xs text-center text-slate-500 mt-4">
                    Payments are securely processed. This is a simulation.
                </p>
           </form>
        </main>
      </div>
    </div>
  );
};

export default CheckoutModal;


import React, { useState } from 'react';
import { X, Star, CreditCard } from './Icons';
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

  // Form state
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');


  if (!isOpen || !plan) return null;
  
  const planDetails = plans.find(p => p.name.toLowerCase() === plan);

  if (!planDetails) return null; 

  const planName = planDetails.name;
  const planPrice = planDetails.price;

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    const formattedValue = (value.match(/.{1,4}/g) || []).join(' ').slice(0, 19);
    setCardNumber(formattedValue);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 2) {
      value = value.substring(0, 2) + ' / ' + value.substring(2, 4);
    }
    setCardExpiry(value);
  };

  const handlePayment = (e: React.FormEvent) => {
      e.preventDefault();
      setError('');

      // Validation
      if (!cardName.trim()) {
        setError('Please enter the name on the card.');
        return;
      }
      if (cardNumber.replace(/\s/g, '').length !== 16) {
        setError('Please enter a valid 16-digit card number.');
        return;
      }
      if (!/^(0[1-9]|1[0-2])\s?\/\s?\d{2}$/.test(cardExpiry)) {
        setError('Please use a valid MM / YY expiry format.');
        return;
      }
       if (!/^\d{3,4}$/.test(cardCvc)) {
        setError('Please enter a valid 3 or 4-digit CVC.');
        return;
      }

      setLoading(true);
      // Simulate API call
      setTimeout(() => {
          try {
             if (plan === 'starter' || plan === 'pro') {
                upgradePlan(plan);
                showToast(`Successfully upgraded to the ${planName} plan!`);
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
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="bg-dark-card border border-gray-700 rounded-xl shadow-2xl w-full max-w-md flex flex-col m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
          <h2 id="modal-title" className="text-xl font-bold text-gray-100 flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-400"/> Checkout: {planName} Plan
            </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors" aria-label="Close modal">
            <X className="w-6 h-6" />
          </button>
        </header>
        <main className="p-6">
           <form onSubmit={handlePayment} className="space-y-4">
               {error && <p className="bg-red-500/20 text-red-300 text-center text-sm p-3 rounded-lg">{error}</p>}
                <div>
                    <label htmlFor="card-name" className="block text-sm font-medium text-gray-300 mb-1">Name on Card</label>
                    <input type="text" id="card-name" placeholder="John Doe" value={cardName} onChange={(e) => setCardName(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-purple transition-all"/>
                </div>
                 <div>
                    <label htmlFor="card-number" className="block text-sm font-medium text-gray-300 mb-1">Card Number</label>
                    <div className="relative">
                        <input type="text" id="card-number" placeholder="0000 0000 0000 0000" value={cardNumber} onChange={handleCardNumberChange} maxLength={19} className="w-full bg-gray-800 border border-gray-600 rounded-lg py-2 px-3 pl-10 focus:outline-none focus:ring-2 focus:ring-brand-purple transition-all"/>
                         <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label htmlFor="card-expiry" className="block text-sm font-medium text-gray-300 mb-1">Expiry Date</label>
                        <input type="text" id="card-expiry" placeholder="MM / YY" value={cardExpiry} onChange={handleExpiryChange} maxLength={7} className="w-full bg-gray-800 border border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-purple transition-all"/>
                    </div>
                     <div>
                        <label htmlFor="card-cvc" className="block text-sm font-medium text-gray-300 mb-1">CVC</label>
                        <input type="text" id="card-cvc" placeholder="123" value={cardCvc} onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ''))} maxLength={4} className="w-full bg-gray-800 border border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-purple transition-all"/>
                    </div>
                </div>
                
                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center bg-gradient-to-r from-brand-purple to-brand-blue text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {loading ? <Spinner /> : `Pay ${planPrice} & Upgrade to ${planName}`}
                    </button>
                    <p className="text-xs text-center text-gray-500 mt-3">(This is a simulation. No real payment will be processed.)</p>
                </div>
           </form>
        </main>
      </div>
    </div>
  );
};

export default CheckoutModal;

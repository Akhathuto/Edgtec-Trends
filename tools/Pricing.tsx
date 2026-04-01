import React from 'react';
import { plans } from '../data/plans';
import { CheckCircle, Star } from '../components/Icons';
import { useAuth } from '../contexts/AuthContext';
import { User, ToolId, PlanName } from '../types';
import { Loader2 } from 'lucide-react';
import { usePaystackPayment } from 'react-paystack';

interface PricingProps {
  onUpgradeClick: (plan: User['plan']) => void;
  onNavigate: (toolId: ToolId, state?: any) => void;
}

export const Pricing: React.FC<PricingProps> = ({ onUpgradeClick, onNavigate }) => {
  const { user, upgradePlan } = useAuth();
  const [loading, setLoading] = React.useState<string | null>(null);

  const onSuccess = (reference: any, plan: PlanName) => {
    console.log('Payment successful:', reference);
    upgradePlan(plan);
    alert(`Success! You have been upgraded to the ${plan} plan.`);
  };

  const onClose = () => {
    console.log('Payment closed');
    setLoading(null);
  };

  return (
    <div className="animate-slide-in-up">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-white text-glow">Find the Perfect Plan (RSA)</h2>
        <p className="text-slate-400 mt-2 max-w-2xl mx-auto">
          Secure payments via Paystack. Pricing in South African Rand (ZAR).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {plans.map((plan) => {
          const planName = plan.name.toLowerCase() as User['plan'];
          const zarPrice = planName === 'starter' ? 'R199' : planName === 'pro' ? 'R499' : 'R0';
          
          return (
            <div
              key={plan.name}
              className={`interactive-card flex flex-col relative ${
                plan.isFeatured ? '!border-violet-500 shadow-glow-lg hover:shadow-violet-rich/40' : 'border-slate-700/50'
              }`}
            >
              {plan.isFeatured && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                   <span className="inline-flex items-center gap-1.5 font-bold text-sm px-4 py-1.5 rounded-full bg-violet text-white shadow-lg">
                      <Star className="w-4 h-4" />
                      Most Popular
                  </span>
                </div>
              )}
              <h3 className="text-2xl font-bold text-white text-glow">{plan.name}</h3>
              <p className="text-slate-400 mt-2 flex-grow">{plan.description}</p>
              <div className="mt-6">
                <span className="text-5xl font-extrabold text-white">{zarPrice}</span>
                <span className="text-slate-400">/month</span>
              </div>
              <ul className="mt-8 space-y-4 text-slate-300">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <CheckCircle className="w-5 h-5 mr-3 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-8">
                {user?.plan.toLowerCase() === planName ? (
                  <button className="w-full bg-slate-700 text-slate-300 font-semibold py-3 px-6 rounded-lg cursor-default">
                    Current Plan
                  </button>
                ) : (
                  <PaystackButton
                    plan={planName}
                    amount={planName === 'starter' ? 19900 : 49900}
                    email={user?.email || ''}
                    onSuccess={(ref) => onSuccess(ref, planName as PlanName)}
                    onClose={onClose}
                    disabled={planName === 'free'}
                    isFeatured={!!plan.isFeatured}
                    isUpgrade={user?.plan === 'free' && planName !== 'free'}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface PaystackButtonProps {
  plan: string;
  amount: number;
  email: string;
  onSuccess: (ref: any) => void;
  onClose: () => void;
  disabled: boolean;
  isFeatured: boolean;
  isUpgrade: boolean;
}

const PaystackButton: React.FC<PaystackButtonProps> = ({ plan, amount, email, onSuccess, onClose, disabled, isFeatured, isUpgrade }) => {
  const config = {
    reference: (new Date()).getTime().toString(),
    email,
    amount,
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '',
    currency: 'ZAR',
  };

  const initializePayment = usePaystackPayment(config);

  return (
    <button
      onClick={() => {
        if (disabled) return;
        initializePayment({ onSuccess, onClose });
      }}
      disabled={disabled}
      className={`w-full transform hover:scale-105 ${
        isFeatured
          ? 'button-primary'
          : 'button-secondary'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isUpgrade ? 'Upgrade' : 'Choose Plan'}
    </button>
  );
};

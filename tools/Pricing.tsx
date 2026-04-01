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
    <div className="animate-slide-in-up space-y-12">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-4xl font-bold text-white tracking-tight mb-4">Upgrade Your Strategy</h2>
        <p className="text-slate-400 text-lg">
          Secure payments via Paystack. Choose the plan that fits your content goals.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => {
          const planName = plan.name.toLowerCase() as User['plan'];
          const zarPrice = planName === 'starter' ? '199' : planName === 'pro' ? '499' : '0';
          const isCurrent = user?.plan.toLowerCase() === planName;
          
          return (
            <div
              key={plan.name}
              className={`premium-card rounded-3xl p-8 flex flex-col relative overflow-hidden transition-all duration-500 hover:scale-[1.02] ${
                plan.isFeatured ? 'border-violet-500/50 shadow-2xl shadow-violet-500/10' : ''
              }`}
            >
              {plan.isFeatured && (
                <div className="absolute top-0 right-0">
                  <div className="bg-violet-500 text-white text-[10px] font-bold px-4 py-1 rounded-bl-xl uppercase tracking-widest">
                    Most Popular
                  </div>
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white tracking-tight">R{zarPrice}</span>
                  <span className="text-slate-500 font-medium">/month</span>
                </div>
                <p className="text-slate-400 mt-3 text-sm leading-relaxed">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-10 flex-grow">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto">
                {isCurrent ? (
                  <button className="w-full py-4 rounded-2xl font-bold bg-slate-800 text-slate-500 cursor-default flex items-center justify-center">
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

      <div className="premium-card rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-violet-500/10 rounded-xl border border-violet-500/20">
            <Star className="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-white">Need a custom solution?</h4>
            <p className="text-slate-400 text-sm">Contact us for enterprise-grade features and dedicated support.</p>
          </div>
        </div>
        <button className="button-secondary px-8 py-3 whitespace-nowrap">Contact Sales</button>
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

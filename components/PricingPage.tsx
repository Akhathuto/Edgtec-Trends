

import React from 'react';
import { plans } from '../data/plans.ts';
import { CheckCircle, Star } from './Icons.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { User } from '../types.ts';

interface PricingPageProps {
  onUpgradeClick: (plan: User['plan']) => void;
}

const PricingPage: React.FC<PricingPageProps> = ({ onUpgradeClick }) => {
  const { user } = useAuth();

  return (
    <div className="animate-slide-in-up">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-white">Find the Perfect Plan</h2>
        <p className="text-slate-400 mt-2 max-w-2xl mx-auto">
          Whether you're just starting out or a seasoned pro, we have a plan that fits your needs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`bg-brand-glass border rounded-xl p-8 flex flex-col transition-all duration-300 relative ${
              plan.isFeatured ? 'border-violet-500 shadow-glow-lg' : 'border-slate-700/50'
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
            <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
            <p className="text-slate-400 mt-2 flex-grow">{plan.description}</p>
            <div className="mt-6">
              <span className="text-5xl font-extrabold text-white">{plan.price}</span>
              <span className="text-slate-400">{plan.pricePeriod}</span>
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
              {user?.plan.toLowerCase() === plan.name.toLowerCase() ? (
                <button className="w-full bg-slate-700 text-slate-300 font-semibold py-3 px-6 rounded-lg cursor-default">
                  Current Plan
                </button>
              ) : (
                <button
                  onClick={() => onUpgradeClick(plan.name.toLowerCase() as User['plan'])}
                  disabled={plan.name === 'Free'}
                  className={`w-full font-semibold py-3 px-6 rounded-lg transition-opacity ${
                    plan.isFeatured
                      ? 'bg-gradient-to-r from-violet-dark to-violet-light text-white hover:opacity-90 shadow-md hover:shadow-lg hover:shadow-violet/30'
                      : 'bg-slate-700 hover:bg-slate-600 text-white disabled:opacity-50'
                  }`}
                >
                  {user?.plan === 'free' && plan.name !== 'Free' ? 'Upgrade' : 'Choose Plan'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PricingPage;
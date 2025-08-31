
import React, { useState } from 'react';
import { HelpCircle, ChevronDown } from './Icons';
import { Tab } from '../types';

const faqs = [
  {
    question: "How are the 'Today\'s Top Trends' determined?",
    answer: "Our system uses the Gemini API which leverages real-time search data from Google to analyze trending topics and channels across YouTube and TikTok. It identifies patterns in views, engagement, and velocity to bring you the most current trends."
  },
  {
    question: "What is the difference between the Starter and Pro plans?",
    answer: "The Starter plan is great for creators who want to dive deeper into trends and get AI-powered script ideas. The Pro plan is our ultimate toolkit, which includes everything in Starter plus the powerful AI Video Generator and full Content Strategy Reports, designed for professional creators and agencies who need to produce content at scale."
  },
  {
    question: "How long does video generation take?",
    answer: "AI video generation is a complex process that can take several minutes to complete, typically between 2-5 minutes depending on the complexity of the prompt and server load. We provide real-time status updates during the process so you know it's working."
  },
  {
    question: "Can I change my plan at any time?",
    answer: "Yes, you can upgrade your plan at any time through the 'Pricing' page. Your account will be upgraded immediately upon successful payment. Downgrades will be supported in a future update."
  },
  {
    question: "Is my payment information secure?",
    answer: "Absolutely. Our checkout process is a simulation and does not handle real credit card information. In a real-world scenario, we would use a trusted, PCI-compliant payment processor like Stripe or Braintree to ensure your data is always secure."
  }
];

interface SupportPageProps {
  setActiveTab: (tab: Tab) => void;
}

const SupportPage: React.FC<SupportPageProps> = ({ setActiveTab }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="animate-slide-in-up max-w-4xl mx-auto">
      <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-8 shadow-xl backdrop-blur-xl">
        <h2 className="text-3xl font-bold text-center mb-2 flex items-center justify-center gap-3">
          <HelpCircle className="w-8 h-8 text-violet-400" />
          Support & FAQ
        </h2>
        <p className="text-center text-slate-400 mb-8">Find answers to common questions below.</p>

        <div className="space-y-2">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-slate-700/50 last:border-b-0">
              <button
                onClick={() => toggleFaq(index)}
                className="w-full flex justify-between items-center text-left py-4"
              >
                <span className="font-semibold text-lg text-slate-100">{faq.question}</span>
                <ChevronDown className={`w-6 h-6 text-violet-400 transition-transform duration-300 ${openFaq === index ? 'transform rotate-180' : ''}`} />
              </button>
              {openFaq === index && (
                <div className="pb-4 text-slate-300 animate-fade-in">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center bg-slate-800/50 p-6 rounded-lg border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-2">Still need help?</h3>
            <p className="text-slate-400 mb-4">Our support team is here to assist you.</p>
            <button
                onClick={() => setActiveTab(Tab.Contact)}
                className="bg-gradient-to-r from-violet-dark to-violet-light text-white font-semibold py-2.5 px-6 rounded-lg hover:opacity-90 transition-opacity shadow-md hover:shadow-lg hover:shadow-violet/30"
            >
                Contact Us
            </button>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
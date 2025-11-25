'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/contexts/ToastContext';
import React, { useState } from 'react';

const AffiliateProgram = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'resources' | 'faq'>('overview');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://edgtec.com/affiliate?ref=user_12345');
    showToast('✨ Affiliate link copied to clipboard!');
  };

  const handleDownloadBanner = (size: string) => {
    showToast(`📥 Downloading ${size} banner...`);
  };

  const stats = [
    { label: 'Total Clicks', value: '2,847', icon: '🔗', trend: '+12%' },
    { label: 'Conversions', value: '156', icon: '✅', trend: '+8%' },
    { label: 'Commission Earned', value: '$4,523.20', icon: '💰', trend: '+23%' },
    { label: 'Avg. Commission Rate', value: '20%', icon: '📊', trend: 'Stable' },
  ];

  const tiers = [
    { name: 'Starter', conversions: '0-50', rate: '15%', bonus: 'None' },
    { name: 'Pro', conversions: '51-200', rate: '20%', bonus: '$200 bonus' },
    { name: 'Elite', conversions: '200+', rate: '25%', bonus: '$500 bonus + priority support' },
  ];

  const benefits = [
    {
      title: 'Recurring Commissions',
      description: 'Earn commissions on subscription renewals for the lifetime of the customer.',
      icon: '🔄',
    },
    {
      title: 'Marketing Materials',
      description: 'Access banners, landing pages, and copy to boost your promotional efforts.',
      icon: '🎨',
    },
    {
      title: 'Dedicated Support',
      description: 'Get assistance from our affiliate support team whenever you need it.',
      icon: '💬',
    },
    {
      title: 'Real-Time Tracking',
      description: 'Monitor clicks, conversions, and earnings with our advanced dashboard.',
      icon: '📈',
    },
    {
      title: 'Monthly Payouts',
      description: 'Get paid reliably every month via your preferred payment method.',
      icon: '💵',
    },
    {
      title: 'No Caps',
      description: 'Earn unlimited commissions—there\'s no ceiling on your earning potential.',
      icon: '🚀',
    },
  ];

  const steps = [
    {
      number: '1',
      title: 'Sign Up',
      description: 'Create your affiliate account in minutes and get instant access to your dashboard.',
    },
    {
      number: '2',
      title: 'Get Your Link',
      description: 'Receive your unique referral link and marketing materials tailored to your audience.',
    },
    {
      number: '3',
      title: 'Promote',
      description: 'Share your link on your blog, social media, email, or any platform you choose.',
    },
    {
      number: '4',
      title: 'Earn',
      description: 'Get paid commissions for every customer who signs up through your referral link.',
    },
  ];

  const faqs = [
    {
      question: 'How often do I get paid?',
      answer: 'Affiliates are paid monthly on the 15th of each month for all commissions earned in the previous month. Payouts are sent via bank transfer, PayPal, or Wise.',
    },
    {
      question: 'What is the cookie duration?',
      answer: 'Our affiliate cookies last for 90 days, giving you plenty of time to convert referred visitors into paying customers.',
    },
    {
      question: 'Can I promote on social media?',
      answer: 'Absolutely! You can promote on any platform—social media, blogs, email newsletters, forums, or your website. We encourage creativity!',
    },
    {
      question: 'Is there a minimum payout threshold?',
      answer: 'Yes, the minimum payout is $50. If your earnings fall below this, the balance will roll over to the next month.',
    },
    {
      question: 'Can I increase my commission rate?',
      answer: 'Yes! As you drive more conversions, you\'ll automatically move into higher tiers with better commission rates and bonuses.',
    },
    {
      question: 'Do you provide marketing materials?',
      answer: 'Yes, we provide banners, text links, landing pages, email templates, and social media graphics. All are customizable and ready to use.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <section className="px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 text-glow">
            Earn While You Share
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-8 leading-relaxed">
            Join our affiliate program and earn lucrative commissions by referring creators to Edgtec. 
            Turn your influence into income with industry-leading rates and lifetime recurring revenue.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleCopyLink}
              className="button-primary text-lg py-3 px-8"
            >
              🔗 Get Your Referral Link
            </Button>
            <Button 
              className="bg-slate-800 hover:bg-slate-700 text-white text-lg py-3 px-8"
            >
              📊 View Full Dashboard
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, idx) => (
              <div 
                key={idx} 
                className="interactive-card p-6 group"
              >
                <div className="text-4xl mb-3">{stat.icon}</div>
                <p className="text-slate-400 text-sm mb-2">{stat.label}</p>
                <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-violet-400 text-sm font-semibold">{stat.trend}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Your Referral Link */}
      <section className="px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-brand-glass p-8 rounded-xl border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-6">Your Referral Link</h2>
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <Input 
                type="text" 
                value="https://edgtec.com/affiliate?ref=user_12345" 
                readOnly 
                className="flex-1 py-3 px-4 text-base"
              />
              <Button 
                onClick={handleCopyLink}
                className="button-primary whitespace-nowrap py-3 px-6"
              >
                Copy Link
              </Button>
            </div>
            <p className="text-slate-400 text-sm">
              💡 Tip: Share this link with your audience. Every signup through your link earns you a commission!
            </p>
          </div>
        </div>
      </section>

      {/* Commission Tiers */}
      <section className="px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-2 text-center">Commission Tiers</h2>
          <p className="text-center text-slate-400 mb-10">Earn more as you grow your referrals</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tiers.map((tier, idx) => (
              <div 
                key={idx}
                className={`p-8 rounded-xl border transition-all ${
                  tier.name === 'Elite'
                    ? 'bg-gradient-to-br from-violet-900/30 to-violet-800/20 border-violet-500 ring-2 ring-violet-400/30 transform scale-105'
                    : 'bg-slate-900/50 border-slate-700 hover:border-violet-500'
                }`}
              >
                <h3 className="text-xl font-bold text-white mb-4">{tier.name}</h3>
                <div className="space-y-3 mb-6">
                  <div>
                    <p className="text-slate-400 text-sm">Conversions</p>
                    <p className="text-lg font-semibold text-white">{tier.conversions}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Commission Rate</p>
                    <p className="text-3xl font-bold text-violet-400">{tier.rate}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Bonus</p>
                    <p className="text-white font-medium">{tier.bonus}</p>
                  </div>
                </div>
                {tier.name === 'Elite' && (
                  <div className="text-center text-violet-300 text-sm font-semibold mb-4">
                    ⭐ Most Popular
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-2 text-center">Why Join Our Program?</h2>
          <p className="text-center text-slate-400 mb-10">Industry-leading benefits designed for your success</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="interactive-card p-6">
                <div className="text-4xl mb-4">{benefit.icon}</div>
                <h3 className="text-lg font-bold text-white mb-2">{benefit.title}</h3>
                <p className="text-slate-400 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-2 text-center">How It Works</h2>
          <p className="text-center text-slate-400 mb-10">Get started in 4 simple steps</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {steps.map((step, idx) => (
              <div key={idx} className="relative">
                <div className="interactive-card p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-violet-500/20 rounded-full text-violet-400 font-bold text-lg mb-4">
                    {step.number}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-slate-400 text-sm">{step.description}</p>
                </div>
                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 -right-2 w-4 h-0.5 bg-gradient-to-r from-violet-500 to-transparent"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Resources & FAQ Tabs */}
      <section className="px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Tab Buttons */}
          <div className="flex gap-2 mb-8 bg-slate-900/50 p-1 rounded-lg w-fit">
            {(['overview', 'resources', 'faq'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-md font-semibold transition-all ${
                  activeTab === tab
                    ? 'bg-violet-600 text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {tab === 'overview' && 'Overview'}
                {tab === 'resources' && 'Resources'}
                {tab === 'faq' && 'FAQ'}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="bg-brand-glass p-8 rounded-xl">
                <h3 className="text-2xl font-bold text-white mb-4">Getting Started</h3>
                <ul className="space-y-3 text-slate-300">
                  <li className="flex gap-3">
                    <span className="text-violet-400">✓</span>
                    <span>Sign up with your email and complete your profile</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-violet-400">✓</span>
                    <span>Receive your unique referral link immediately</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-violet-400">✓</span>
                    <span>Start promoting to your audience</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-violet-400">✓</span>
                    <span>Earn commissions on every successful referral</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Resources Tab */}
          {activeTab === 'resources' && (
            <div className="space-y-4">
              <div className="bg-brand-glass p-8 rounded-xl">
                <h3 className="text-2xl font-bold text-white mb-6">Marketing Materials</h3>
                <div className="space-y-4">
                  <div className="border border-slate-700 rounded-lg p-4 flex justify-between items-center hover:border-violet-500 transition-colors">
                    <div>
                      <p className="font-semibold text-white">Email Swipe Copy</p>
                      <p className="text-slate-400 text-sm">Ready-to-send email templates</p>
                    </div>
                    <Button className="button-primary">📥 Download</Button>
                  </div>
                  <div className="border border-slate-700 rounded-lg p-4 flex justify-between items-center hover:border-violet-500 transition-colors">
                    <div>
                      <p className="font-semibold text-white">Social Media Posts</p>
                      <p className="text-slate-400 text-sm">Pre-made graphics and captions</p>
                    </div>
                    <Button className="button-primary">📥 Download</Button>
                  </div>
                  <div className="border border-slate-700 rounded-lg p-4 flex justify-between items-center hover:border-violet-500 transition-colors">
                    <div>
                      <p className="font-semibold text-white">Banner Ads</p>
                      <p className="text-slate-400 text-sm">300x250, 728x90, 300x600 sizes</p>
                    </div>
                    <Button className="button-primary">📥 Download</Button>
                  </div>
                  <div className="border border-slate-700 rounded-lg p-4 flex justify-between items-center hover:border-violet-500 transition-colors">
                    <div>
                      <p className="font-semibold text-white">Landing Page Template</p>
                      <p className="text-slate-400 text-sm">Customizable HTML & Figma files</p>
                    </div>
                    <Button className="button-primary">📥 Download</Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FAQ Tab */}
          {activeTab === 'faq' && (
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="bg-brand-glass rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                    className="w-full p-6 flex justify-between items-center hover:bg-slate-800/30 transition-colors"
                  >
                    <p className="font-semibold text-white text-left">{faq.question}</p>
                    <span className={`text-2xl transition-transform ${expandedFaq === idx ? 'rotate-180' : ''}`}>
                      ⌄
                    </span>
                  </button>
                  {expandedFaq === idx && (
                    <div className="px-6 pb-6 border-t border-slate-700">
                      <p className="text-slate-300 mt-4">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-16">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-violet-900/30 to-violet-800/20 border border-violet-500/30 rounded-xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Earning?</h2>
          <p className="text-lg text-slate-300 mb-8">
            Join hundreds of creators and influencers already earning with Edgtec
          </p>
          <Button className="button-primary text-lg py-3 px-8">
            🚀 Join the Program Today
          </Button>
        </div>
      </section>
    </div>
  );
};

export default AffiliateProgram;

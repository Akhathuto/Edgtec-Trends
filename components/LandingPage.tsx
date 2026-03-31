import React, { useState } from 'react';
import { UtrendLogo } from './Logo';
import { Youtube as YoutubeIcon } from './Icons';
import { 
  Sparkles, 
  Video, 
  TrendingUp, 
  DollarSign, 
  Zap, 
  Globe, 
  Shield, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  Play, 
  ChevronDown,
  MessageSquare,
  BarChart3,
  Layers,
  Cpu,
  X,
  Mail,
  Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const features = [
    {
      icon: <Video className="w-6 h-6 text-violet-400" />,
      title: "AI Content Repurposing",
      description: "Turn one long-form video into 10+ viral shorts, reels, and tweets instantly with our advanced AI engine.",
      color: "violet"
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-cyan-400" />,
      title: "Growth Planner",
      description: "Data-driven strategies and trend analysis to explode your reach on YouTube, TikTok, and Instagram.",
      color: "cyan"
    },
    {
      icon: <DollarSign className="w-6 h-6 text-emerald-400" />,
      title: "Monetization Suite",
      description: "Connect with premium brands and unlock new revenue streams tailored to your unique audience.",
      color: "emerald"
    },
    {
      icon: <Cpu className="w-6 h-6 text-orange-400" />,
      title: "AI Script Writer",
      description: "Generate high-converting scripts for any platform based on current viral hooks and structures.",
      color: "orange"
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-blue-400" />,
      title: "Deep Analytics",
      description: "Understand your audience better than ever with AI-powered insights into retention and engagement.",
      color: "blue"
    },
    {
      icon: <Layers className="w-6 h-6 text-pink-400" />,
      title: "Multi-Platform Sync",
      description: "Manage all your social channels from one unified dashboard. Schedule, post, and track everything.",
      color: "pink"
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Connect Your Channels",
      description: "Securely link your YouTube, TikTok, and Instagram accounts to our unified dashboard."
    },
    {
      number: "02",
      title: "AI Analysis",
      description: "Our AI scans your content and current trends to find the best growth opportunities."
    },
    {
      number: "03",
      title: "Generate & Grow",
      description: "Create viral content, optimize your strategy, and watch your influence explode."
    }
  ];

  const faqs = [
    {
      question: "How does the AI content repurposing work?",
      answer: "Our AI analyzes your long-form videos, identifies the most engaging segments, and automatically crops, subtitles, and optimizes them for vertical platforms like TikTok and Reels."
    },
    {
      question: "Is my data secure with uTrends?",
      answer: "Absolutely. We use enterprise-grade encryption and follow strict security protocols to ensure your channel data and personal information are always protected."
    },
    {
      question: "Can I use uTrends for free?",
      answer: "Yes! We offer a generous free plan that includes basic AI tools and analytics to help you get started on your creator journey."
    },
    {
      question: "How do I connect with brands?",
      answer: "Our BrandConnect tool matches you with sponsors based on your niche, audience demographics, and engagement rates, making it easy to land high-paying deals."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Jenkins",
      role: "Tech YouTuber",
      content: "uTrends has completely transformed my workflow. I used to spend hours editing shorts, now it takes minutes.",
      avatar: "https://i.pravatar.cc/150?u=sarah"
    },
    {
      name: "Marcus Chen",
      role: "TikTok Creator",
      content: "The growth planner is scary accurate. My reach increased by 300% in just two weeks of following the AI strategy.",
      avatar: "https://i.pravatar.cc/150?u=marcus"
    },
    {
      name: "Elena Rodriguez",
      role: "Lifestyle Influencer",
      content: "Finally, a tool that actually helps with monetization. BrandConnect helped me land my first $5k deal!",
      avatar: "https://i.pravatar.cc/150?u=elena"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-violet-500/30 selection:text-violet-200">
      {/* Sticky Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UtrendLogo className="h-10 w-10" />
            <span className="text-2xl font-bold tracking-tighter bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              utrend
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">How it Works</a>
            <a href="#pricing" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center gap-4">
            <button 
              onClick={onGetStarted}
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Log in
            </button>
            <button 
              onClick={onGetStarted}
              className="px-5 py-2.5 bg-white text-black rounded-full text-sm font-bold hover:bg-slate-200 transition-all shadow-lg shadow-white/10"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-violet-600/20 blur-[120px] rounded-full -z-10" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-600/10 blur-[100px] rounded-full -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold uppercase tracking-widest mb-8">
              <Sparkles className="w-4 h-4" />
              The Future of Content Creation
            </span>
            <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter mb-8 leading-[0.9]">
              Create <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">Viral</span> Content <br />
              With <span className="italic font-serif font-light">AI Precision.</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
              The ultimate AI-powered suite for modern creators. Grow your reach, 
              automate your workflow, and monetize your influence across all platforms.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={onGetStarted}
                className="px-10 py-5 bg-violet-600 hover:bg-violet-500 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-2xl shadow-violet-600/20 flex items-center justify-center gap-2"
              >
                Start Creating Free
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="px-10 py-5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-full font-bold text-lg transition-all flex items-center justify-center gap-2 group">
                <Play className="w-5 h-5 text-violet-400 group-hover:scale-110 transition-transform" />
                Watch Demo
              </button>
            </div>
          </motion.div>

          {/* Hero Image/Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-20 relative"
          >
            <div className="relative mx-auto max-w-5xl rounded-3xl overflow-hidden border border-slate-800 shadow-2xl shadow-black/50 bg-slate-900/50 backdrop-blur-sm p-4">
              <div className="aspect-video rounded-2xl bg-slate-950 flex items-center justify-center border border-slate-800 relative overflow-hidden group">
                <img 
                  src="https://picsum.photos/seed/dashboard/1200/800" 
                  alt="uTrends Dashboard" 
                  className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform cursor-pointer">
                    <Play className="w-8 h-8 fill-white" />
                  </div>
                </div>
              </div>
            </div>
            {/* Floating Elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-violet-500/20 blur-3xl rounded-full" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-cyan-500/20 blur-3xl rounded-full" />
          </motion.div>
        </div>
      </section>

      {/* Trusted By */}
      <section className="py-20 border-y border-slate-900">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em] mb-12">Trusted by 50,000+ creators worldwide</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
            <span className="text-3xl font-black tracking-tighter">YOUTUBE</span>
            <span className="text-3xl font-black tracking-tighter">TIKTOK</span>
            <span className="text-3xl font-black tracking-tighter">INSTAGRAM</span>
            <span className="text-3xl font-black tracking-tighter">TWITCH</span>
            <span className="text-3xl font-black tracking-tighter">SPOTIFY</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Everything you need to <br /><span className="text-violet-400">dominate the algorithm.</span></h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              Our suite of AI tools is designed to handle the heavy lifting, so you can focus on what you do best: creating.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                className="p-8 bg-slate-900/50 rounded-3xl border border-slate-800 hover:border-slate-700 transition-all group"
              >
                <div className={`w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-32 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">From idea to viral <br />in <span className="text-cyan-400 italic font-serif">three simple steps.</span></h2>
              <div className="space-y-12">
                {steps.map((step, index) => (
                  <div key={index} className="flex gap-6">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-violet-600 flex items-center justify-center font-black text-xl">
                      {step.number}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                      <p className="text-slate-400 leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-[40px] bg-gradient-to-br from-violet-600/20 to-cyan-600/20 border border-slate-800 p-8">
                <div className="w-full h-full rounded-[32px] bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl">
                   <img 
                    src="https://picsum.photos/seed/workflow/800/800" 
                    alt="Workflow" 
                    className="w-full h-full object-cover opacity-50"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-violet-600 rounded-3xl blur-3xl opacity-50" />
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-cyan-600 rounded-3xl blur-3xl opacity-50" />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section id="pricing" className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Simple, transparent <span className="text-emerald-400">pricing.</span></h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              Choose the plan that fits your current stage. Upgrade as you grow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <div className="p-8 bg-slate-900/50 rounded-3xl border border-slate-800 flex flex-col">
              <h3 className="text-xl font-bold mb-2">Free</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-slate-500">/month</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-slate-400">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  Basic AI Content Ideas
                </li>
                <li className="flex items-center gap-3 text-slate-400">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  Trend Discovery
                </li>
                <li className="flex items-center gap-3 text-slate-400">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  Limited Analytics
                </li>
              </ul>
              <button onClick={onGetStarted} className="w-full py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl font-bold transition-all">
                Get Started
              </button>
            </div>

            {/* Starter Plan */}
            <div className="p-8 bg-violet-600 rounded-3xl border border-violet-500 flex flex-col transform scale-105 shadow-2xl shadow-violet-600/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">Popular</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Starter</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">$29</span>
                <span className="text-violet-200">/month</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-violet-100">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                  Full AI Content Suite
                </li>
                <li className="flex items-center gap-3 text-violet-100">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                  Advanced Growth Planner
                </li>
                <li className="flex items-center gap-3 text-violet-100">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                  Monetization Guide
                </li>
                <li className="flex items-center gap-3 text-violet-100">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                  Priority Support
                </li>
              </ul>
              <button onClick={onGetStarted} className="w-full py-4 bg-white text-violet-600 rounded-2xl font-bold hover:bg-slate-100 transition-all">
                Start 7-Day Trial
              </button>
            </div>

            {/* Pro Plan */}
            <div className="p-8 bg-slate-900/50 rounded-3xl border border-slate-800 flex flex-col">
              <h3 className="text-xl font-bold mb-2">Pro</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">$99</span>
                <span className="text-slate-500">/month</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-slate-400">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  Everything in Starter
                </li>
                <li className="flex items-center gap-3 text-slate-400">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  BrandConnect Access
                </li>
                <li className="flex items-center gap-3 text-slate-400">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  Custom AI Agents
                </li>
                <li className="flex items-center gap-3 text-slate-400">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  Dedicated Account Manager
                </li>
              </ul>
              <button onClick={onGetStarted} className="w-full py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl font-bold transition-all">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Loved by <span className="text-pink-400">creators</span> like you.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                className="p-8 bg-slate-900/40 rounded-3xl border border-slate-800 backdrop-blur-sm"
              >
                <div className="flex items-center gap-4 mb-6">
                  <img src={testimonial.avatar} alt={testimonial.name} className="w-12 h-12 rounded-full border-2 border-violet-500/30" referrerPolicy="no-referrer" />
                  <div>
                    <h4 className="font-bold">{testimonial.name}</h4>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-slate-300 italic leading-relaxed">"{testimonial.content}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-32 bg-slate-900/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold tracking-tight mb-6">Frequently Asked <span className="text-violet-400">Questions.</span></h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
                <button 
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-800/50 transition-colors"
                >
                  <span className="font-bold">{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${activeFaq === index ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {activeFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-6 pb-6 text-slate-400 leading-relaxed"
                    >
                      {faq.answer}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-violet-600/10 blur-[100px] rounded-full -z-10" />
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-8 italic">Ready to go viral?</h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12">
            Join thousands of creators who are using uTrends to dominate their niche and build a sustainable career.
          </p>
          <button 
            onClick={onGetStarted}
            className="px-12 py-6 bg-white text-black rounded-full font-black text-xl hover:bg-slate-200 transition-all shadow-2xl shadow-white/20"
          >
            Get Started for Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <UtrendLogo className="h-8 w-8" />
                <span className="text-xl font-bold tracking-tighter">utrend</span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                The ultimate AI-powered content suite for modern creators. Grow your reach, automate your workflow, and monetize your influence.
              </p>
              <div className="space-y-4 mb-8">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Subscribe to our newsletter</p>
                <div className="flex gap-2">
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-violet-500 flex-1"
                  />
                  <button className="bg-violet-600 hover:bg-violet-500 px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                    Join
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <a href="#" className="p-2 bg-slate-900 rounded-lg text-slate-400 hover:text-white transition-colors"><X className="w-5 h-5" /></a>
                <a href="#" className="p-2 bg-slate-900 rounded-lg text-slate-400 hover:text-white transition-colors"><Globe className="w-5 h-5" /></a>
                <a href="#" className="p-2 bg-slate-900 rounded-lg text-slate-400 hover:text-white transition-colors"><YoutubeIcon className="w-5 h-5" /></a>
                <a href="#" className="p-2 bg-slate-900 rounded-lg text-slate-400 hover:text-white transition-colors"><Mail className="w-5 h-5" /></a>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-6">Product</h4>
              <ul className="space-y-4 text-sm text-slate-500">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">AI Agents</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6">Company</h4>
              <ul className="space-y-4 text-sm text-slate-500">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6">Support</h4>
              <ul className="space-y-4 text-sm text-slate-500">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-12 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-xs text-slate-600">© 2026 uTrends AI. All rights reserved.</p>
            <div className="flex items-center gap-8 text-xs text-slate-600">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

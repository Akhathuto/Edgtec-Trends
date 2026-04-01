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
      description: "Data-driven strategies and trend analysis to explode your reach on YouTube, TikTok, Instagram, Facebook, and Twitch.",
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
      description: "Securely link your YouTube, TikTok, Instagram, Facebook, and Twitch accounts to our unified dashboard."
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
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/40 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="relative">
              <UtrendLogo className="h-10 w-10 animate-logo-pulse" />
              <div className="absolute inset-0 bg-violet-500/20 blur-xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-500" />
            </div>
            <span className="text-2xl font-bold tracking-tighter bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              utrend
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            {['Features', 'How it Works', 'Pricing', 'FAQ'].map((item) => (
              <a 
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} 
                className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-violet-500 transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <button 
              onClick={onGetStarted}
              className="text-xs font-bold uppercase tracking-widest text-slate-300 hover:text-white transition-colors"
            >
              Log in
            </button>
            <button 
              onClick={onGetStarted}
              className="px-6 py-2.5 bg-white text-black rounded-full text-xs font-black uppercase tracking-widest hover:bg-violet-500 hover:text-white transition-all shadow-xl shadow-white/5 active:scale-95"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 overflow-hidden">
        {/* Background Atmosphere */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600/20 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-cyan-600/10 blur-[100px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-fuchsia-600/10 blur-[80px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-violet-400 text-[10px] font-black uppercase tracking-[0.3em] mb-12 animate-fade-in-down">
              <Sparkles className="w-3.5 h-3.5" />
              The Future of Content Creation
            </div>
            
            <h1 className="text-[12vw] md:text-[8vw] lg:text-[7rem] font-black tracking-tighter mb-8 leading-[0.85] text-balance">
              CREATE <span className="text-gradient">VIRAL</span> <br />
              CONTENT WITH <br />
              <span className="italic font-serif font-light text-white/90">AI Precision.</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-14 leading-relaxed text-balance">
              The ultimate AI-powered suite for modern creators. Grow your reach, 
              automate your workflow, and monetize your influence across all platforms.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <button 
                onClick={onGetStarted}
                className="group relative px-10 py-5 bg-violet-600 rounded-full font-black text-sm uppercase tracking-[0.2em] transition-all overflow-hidden shadow-2xl shadow-violet-600/40 active:scale-95"
              >
                <span className="relative z-10 flex items-center gap-3">
                  Start Creating Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-violet-400 to-fuchsia-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </button>
              
              <button className="px-10 py-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full font-black text-sm uppercase tracking-[0.2em] transition-all flex items-center gap-3 group active:scale-95">
                <Play className="w-4 h-4 text-violet-400 fill-violet-400 group-hover:scale-110 transition-transform" />
                Watch Demo
              </button>
            </div>
          </motion.div>

          {/* Hero Image/Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mt-24 relative group"
          >
            <div className="relative mx-auto max-w-5xl rounded-[2.5rem] overflow-hidden p-1.5 bg-gradient-to-b from-white/10 to-transparent border border-white/5 shadow-[0_0_100px_-20px_rgba(139,92,246,0.3)]">
              <div className="aspect-video rounded-[2rem] bg-slate-950 flex items-center justify-center border border-white/5 relative overflow-hidden">
                <img 
                  src="https://picsum.photos/seed/dashboard/1600/900?blur=2" 
                  alt="uTrends Dashboard" 
                  className="w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-[2s]"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center group-hover:scale-110 transition-all duration-500 cursor-pointer shadow-2xl">
                    <Play className="w-10 h-10 fill-white" />
                  </div>
                </div>

                {/* Floating UI Elements (Abstract) */}
                <div className="absolute top-10 left-10 p-4 glass-panel rounded-2xl animate-float" style={{ animationDelay: '1s' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-violet-400" />
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Growth</div>
                      <div className="text-lg font-bold">+324%</div>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-10 right-10 p-4 glass-panel rounded-2xl animate-float" style={{ animationDelay: '2s' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Revenue</div>
                      <div className="text-lg font-bold">$12.4k</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trusted By - Marquee */}
      <section className="py-24 border-y border-white/5 overflow-hidden bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-4 mb-12 text-center">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Trusted by 50,000+ creators worldwide</p>
        </div>
        <div className="relative flex overflow-x-hidden">
          <div className="animate-marquee whitespace-nowrap flex items-center gap-16 md:gap-32 py-4">
            {['YOUTUBE', 'TIKTOK', 'INSTAGRAM', 'FACEBOOK', 'TWITCH', 'SNAPCHAT', 'PINTEREST', 'LINKEDIN'].map((brand) => (
              <span key={brand} className="text-4xl md:text-6xl font-black tracking-tighter text-white/10 hover:text-white/30 transition-colors cursor-default">
                {brand}
              </span>
            ))}
          </div>
          <div className="absolute top-0 animate-marquee whitespace-nowrap flex items-center gap-16 md:gap-32 py-4" style={{ left: '100%' }}>
            {['YOUTUBE', 'TIKTOK', 'INSTAGRAM', 'FACEBOOK', 'TWITCH', 'SNAPCHAT', 'PINTEREST', 'LINKEDIN'].map((brand) => (
              <span key={brand + '-2'} className="text-4xl md:text-6xl font-black tracking-tighter text-white/10 hover:text-white/30 transition-colors cursor-default">
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-40 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-none">
              EVERYTHING YOU NEED TO <br />
              <span className="text-gradient">DOMINATE THE ALGORITHM.</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
              Our suite of AI tools is designed to handle the heavy lifting, so you can focus on what you do best: creating.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -10 }}
                className="group p-10 glass-panel glass-panel-hover rounded-[2.5rem]"
              >
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-violet-500/20 transition-all duration-500">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 tracking-tight">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm md:text-base">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-40 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
            <div>
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-12 leading-none">
                FROM IDEA TO VIRAL <br />
                IN <span className="italic font-serif font-light text-cyan-400">THREE STEPS.</span>
              </h2>
              <div className="space-y-16">
                {steps.map((step, index) => (
                  <div key={index} className="flex gap-8 group">
                    <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-violet-600 flex items-center justify-center font-black text-2xl shadow-xl shadow-violet-600/20 group-hover:scale-110 transition-transform">
                      {step.number}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-3 tracking-tight">{step.title}</h3>
                      <p className="text-slate-400 leading-relaxed text-lg">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-[3rem] bg-gradient-to-br from-violet-600/20 to-cyan-600/20 p-1.5 border border-white/5">
                <div className="w-full h-full rounded-[2.8rem] bg-slate-950 border border-white/5 overflow-hidden shadow-2xl relative group">
                   <img 
                    src="https://picsum.photos/seed/workflow/1000/1000" 
                    alt="Workflow" 
                    className="w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-[3s]"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-violet-600/20 via-transparent to-cyan-600/20" />
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-violet-600/20 rounded-full blur-[80px] animate-pulse" />
              <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-cyan-600/20 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '2s' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section id="pricing" className="py-40 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-none">
              SIMPLE, <span className="text-emerald-400">TRANSPARENT</span> PRICING.
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
              Choose the plan that fits your current stage. Upgrade as you grow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {/* Free Plan */}
            <div className="p-10 glass-panel rounded-[2.5rem] flex flex-col group hover:border-white/10 transition-all duration-500">
              <h3 className="text-2xl font-bold mb-2 tracking-tight">Free</h3>
              <div className="mb-8">
                <span className="text-5xl font-black tracking-tighter">$0</span>
                <span className="text-slate-500 text-sm font-bold uppercase tracking-widest ml-2">/month</span>
              </div>
              <ul className="space-y-5 mb-10 flex-1">
                {['Basic AI Content Ideas', 'Trend Discovery', 'Limited Analytics'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-slate-400 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
              <button onClick={onGetStarted} className="w-full py-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95">
                Get Started
              </button>
            </div>

            {/* Starter Plan */}
            <div className="p-10 bg-violet-600 rounded-[2.5rem] flex flex-col transform md:scale-110 shadow-[0_0_80px_-20px_rgba(139,92,246,0.6)] relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6">
                <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full">Most Popular</span>
              </div>
              <h3 className="text-2xl font-bold mb-2 tracking-tight">Starter</h3>
              <div className="mb-8">
                <span className="text-5xl font-black tracking-tighter">$29</span>
                <span className="text-violet-200 text-sm font-bold uppercase tracking-widest ml-2">/month</span>
              </div>
              <ul className="space-y-5 mb-10 flex-1">
                {['Full AI Content Suite', 'Advanced Growth Planner', 'Monetization Guide', 'Priority Support'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-violet-50 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                    {item}
                  </li>
                ))}
              </ul>
              <button onClick={onGetStarted} className="w-full py-5 bg-white text-violet-600 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-100 transition-all shadow-xl active:scale-95">
                Start 7-Day Trial
              </button>
            </div>

            {/* Pro Plan */}
            <div className="p-10 glass-panel rounded-[2.5rem] flex flex-col group hover:border-white/10 transition-all duration-500">
              <h3 className="text-2xl font-bold mb-2 tracking-tight">Pro</h3>
              <div className="mb-8">
                <span className="text-5xl font-black tracking-tighter">$99</span>
                <span className="text-slate-500 text-sm font-bold uppercase tracking-widest ml-2">/month</span>
              </div>
              <ul className="space-y-5 mb-10 flex-1">
                {['Everything in Starter', 'BrandConnect Access', 'Custom AI Agents', 'Dedicated Manager'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-slate-400 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
              <button onClick={onGetStarted} className="w-full py-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-40 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-none">
              LOVED BY <span className="text-pink-400">CREATORS</span> LIKE YOU.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -10 }}
                className="p-10 glass-panel rounded-[2.5rem] relative group"
              >
                <div className="flex items-center gap-5 mb-8">
                  <div className="relative">
                    <img src={testimonial.avatar} alt={testimonial.name} className="w-14 h-14 rounded-full border-2 border-violet-500/30 object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-violet-600 rounded-full flex items-center justify-center border-2 border-slate-950">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg tracking-tight">{testimonial.name}</h4>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-slate-300 italic leading-relaxed text-lg">"{testimonial.content}"</p>
                <div className="absolute top-10 right-10 opacity-5 group-hover:opacity-10 transition-opacity">
                  <MessageSquare className="w-12 h-12" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-40 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-24">
            <h2 className="text-5xl font-black tracking-tighter mb-8 leading-none">
              FREQUENTLY ASKED <span className="text-violet-400">QUESTIONS.</span>
            </h2>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="glass-panel rounded-3xl overflow-hidden group">
                <button 
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="w-full p-8 text-left flex items-center justify-between hover:bg-white/5 transition-all"
                >
                  <span className="font-bold text-lg tracking-tight">{faq.question}</span>
                  <div className={`w-8 h-8 rounded-full bg-white/5 flex items-center justify-center transition-transform duration-500 ${activeFaq === index ? 'rotate-180 bg-violet-500/20' : ''}`}>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-colors ${activeFaq === index ? 'text-violet-400' : ''}`} />
                  </div>
                </button>
                <AnimatePresence>
                  {activeFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="px-8 pb-8 text-slate-400 leading-relaxed text-lg border-t border-white/5 pt-6">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-60 relative overflow-hidden">
        <div className="absolute inset-0 bg-violet-600/10 blur-[150px] rounded-full -z-10 animate-pulse" />
        <div className="max-w-7xl mx-auto px-4 text-center relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-7xl md:text-[10rem] font-black tracking-tighter mb-12 leading-[0.8] italic text-white/90">
              READY TO <br />
              <span className="text-gradient">GO VIRAL?</span>
            </h2>
            <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto mb-16 leading-relaxed text-balance">
              Join thousands of creators who are using uTrends to dominate their niche and build a sustainable career.
            </p>
            <button 
              onClick={onGetStarted}
              className="group relative px-16 py-8 bg-white text-black rounded-full font-black text-xl uppercase tracking-[0.3em] hover:bg-violet-500 hover:text-white transition-all shadow-[0_0_50px_-10px_rgba(255,255,255,0.3)] active:scale-95"
            >
              Get Started for Free
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-32 border-t border-white/5 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-20 mb-32">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-3 mb-8 group cursor-pointer">
                <UtrendLogo className="h-10 w-10 group-hover:rotate-12 transition-transform" />
                <span className="text-2xl font-black tracking-tighter">utrend</span>
              </div>
              <p className="text-slate-500 text-base leading-relaxed mb-10">
                The ultimate AI-powered content suite for modern creators. Grow your reach, automate your workflow, and monetize your influence.
              </p>
              <div className="space-y-6 mb-12">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Subscribe to our newsletter</p>
                <div className="flex gap-3">
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-sm focus:outline-none focus:border-violet-500/50 flex-1 transition-all"
                  />
                  <button className="bg-violet-600 hover:bg-violet-500 px-8 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95">
                    Join
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-6">
                {[X, Globe, YoutubeIcon, Mail].map((Icon, i) => (
                  <a key={i} href="#" className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-xl text-slate-400 hover:text-white hover:bg-violet-500/20 transition-all group">
                    <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </a>
                ))}
              </div>
            </div>
            
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'AI Agents', 'API'] },
              { title: 'Company', links: ['About Us', 'Blog', 'Careers', 'Contact'] },
              { title: 'Support', links: ['Help Center', 'Community', 'Terms', 'Privacy'] }
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-xs font-black uppercase tracking-[0.3em] text-white mb-10">{col.title}</h4>
                <ul className="space-y-6 text-base text-slate-500">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="hover:text-violet-400 transition-colors relative group">
                        {link}
                        <span className="absolute -bottom-1 left-0 w-0 h-px bg-violet-500 transition-all duration-300 group-hover:w-full" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">© 2026 uTrends AI. All rights reserved.</p>
            <div className="flex items-center gap-12 text-xs font-bold text-slate-600 uppercase tracking-widest">
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

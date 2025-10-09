

import React, { useState, useMemo } from 'react';
// FIX: Imported the missing FileText icon.
import {
  HelpCircle, ChevronDown, LayoutDashboard, TrendingUp, Lightbulb, Wand, BarChart2,
  Rocket, DollarSign, User as UserIcon, Search, MessageSquare, History, Bot, Film,
  RefreshCw, Briefcase, Star, Scissors, PenTool, Clapperboard, Gif, FileText
} from './Icons.tsx';
import { Tab } from '../types.ts';

interface HelpTopic {
  title: string;
  keywords: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

interface TopicCategory {
  category: string;
  topics: HelpTopic[];
}

interface SupportPageProps {
  setActiveTab: (tab: Tab) => void;
}

const SupportPage: React.FC<SupportPageProps> = ({ setActiveTab }) => {
  const [openTopic, setOpenTopic] = useState<string | null>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');

  const toggleTopic = (topicKey: string) => {
    setOpenTopic(openTopic === topicKey ? null : topicKey);
  };
  
  const helpContent: TopicCategory[] = [
    {
      category: "Getting Started",
      topics: [
        {
          title: "Understanding the Dashboard",
          keywords: "dashboard, home, channels, stats, tip, quick create",
          icon: <LayoutDashboard className="w-5 h-5 mr-3 text-violet-300" />,
          content: (
            <div className="space-y-2 text-slate-300">
              <p>The Dashboard is your command center. Here's a quick breakdown:</p>
              <ul className="list-disc list-inside ml-4">
                <li><strong>Your Channels:</strong> Displays a live snapshot of your connected channels' metrics. Click a channel to go to its full <button onClick={() => setActiveTab(Tab.Analytics)} className="text-violet-400 underline hover:text-violet-300">Analytics</button> page.</li>
                <li><strong>AI Tip of the Day:</strong> A personalized, actionable tip from our AI to help you grow. It's new every day!</li>
                <li><strong>Quick Create:</strong> Instantly access popular content creation tools.</li>
              </ul>
            </div>
          )
        }
      ]
    },
    {
      category: "Core Tools",
      topics: [
        {
          title: "Discovering Trends",
          keywords: "trends, trending, viral, topics, videos, music, creators",
          icon: <TrendingUp className="w-5 h-5 mr-3 text-violet-300" />,
          content: (
            <div className="space-y-2 text-slate-300">
              <p>The <button onClick={() => setActiveTab(Tab.Trends)} className="text-violet-400 underline hover:text-violet-300">Trends</button> page is your key to staying relevant. You can:</p>
              <ul className="list-disc list-inside ml-4">
                <li><strong>View Today's Snapshot:</strong> Get a high-level overview of top trending channels and topics.</li>
                <li><strong>Explore by Category:</strong> Filter by Platform, Country, and Category to find trending content.</li>
                <li><strong>Search Any Topic:</strong> Get a detailed AI analysis of what's currently trending for a specific niche.</li>
              </ul>
            </div>
          )
        },
        {
          title: "Keyword Research",
          keywords: "keyword, seo, search, volume, competition",
          icon: <Search className="w-5 h-5 mr-3 text-violet-300" />,
          content: (
            <div className="space-y-2 text-slate-300">
              <p>Use the <button onClick={() => setActiveTab(Tab.Keywords)} className="text-violet-400 underline hover:text-violet-300">Keyword Research</button> tool to find untapped content opportunities.</p>
              <ul className="list-disc list-inside ml-4">
                <li>Get data on search volume and competition level.</li>
                <li>Discover related long-tail keywords to target.</li>
                <li>Receive content ideas based directly on your keyword.</li>
              </ul>
            </div>
          )
        },
        {
          title: "AI Chat (Nolo)",
          keywords: "chat, nolo, assistant, copilot, help",
          icon: <MessageSquare className="w-5 h-5 mr-3 text-violet-300" />,
          content: (
            <div className="space-y-2 text-slate-300">
              <p>Nolo, your AI Co-pilot, is available in the <button onClick={() => setActiveTab(Tab.Chat)} className="text-violet-400 underline hover:text-violet-300">AI Chat</button> tab for Pro users.</p>
              <ul className="list-disc list-inside ml-4">
                <li>Brainstorm ideas, ask for advice, or get help with your content strategy in a conversational interface.</li>
                <li>Nolo can suggest using other tools in the app to help you accomplish your goals.</li>
                <li>Your conversation history is saved, so you can always pick up where you left off.</li>
              </ul>
            </div>
          )
        },
         {
          title: "AI Agents",
          keywords: "agents, visionary, hacker, maven, writer, experts",
          icon: <Bot className="w-5 h-5 mr-3 text-violet-300" />,
          content: (
            <div className="space-y-2 text-slate-300">
              <p>Assemble your creative team with <button onClick={() => setActiveTab(Tab.Agents)} className="text-violet-400 underline hover:text-violet-300">AI Agents</button>. Each agent is a specialist:</p>
              <ul className="list-disc list-inside ml-4">
                <li><strong>Viral Visionary:</strong> For brainstorming viral ideas and trends.</li>
                <li><strong>Growth Hacker:</strong> For data-driven SEO and growth strategies.</li>
                <li><strong>Monetization Maven:</strong> For finding revenue streams and sponsors.</li>
                <li><strong>Creative Writer:</strong> For turning your ideas into polished scripts.</li>
              </ul>
            </div>
          )
        },
        {
          title: "Content History",
          keywords: "history, my content, generated, saved",
          icon: <History className="w-5 h-5 mr-3 text-violet-300" />,
          content: (
            <div className="space-y-2 text-slate-300">
              <p>All content you generate is automatically saved in <button onClick={() => setActiveTab(Tab.ContentHistory)} className="text-violet-400 underline hover:text-violet-300">My Content</button>.</p>
              <ul className="list-disc list-inside ml-4">
                <li>Filter your history by content type to quickly find what you're looking for.</li>
                <li>Click "View Content" to open a modal with the full details of any generated item.</li>
                <li>Download your content directly from the history page.</li>
              </ul>
            </div>
          )
        },
      ]
    },
    {
      category: "AI Create Suite",
      topics: [
        {
          title: "Generating Content Ideas",
          keywords: "ideas, generator, brainstorming, scripts, hooks",
          icon: <Lightbulb className="w-5 h-5 mr-3 text-violet-300" />,
          content: (
            <div className="space-y-2 text-slate-300">
              <p>Never run out of ideas with our <button onClick={() => setActiveTab(Tab.Ideas)} className="text-violet-400 underline hover:text-violet-300">Content Generator</button>.</p>
              <ul className="list-disc list-inside ml-4">
                <li>Get AI-generated ideas with titles, hooks, outlines, and hashtags.</li>
                <li>Starter and Pro users can generate a full, production-ready script from any idea.</li>
              </ul>
            </div>
          )
        },
        {
          title: "Prompt Generator",
          keywords: "prompt, generator, magic, builder",
          icon: <Wand className="w-5 h-5 mr-3 text-violet-300" />,
          content: (
            <div className="space-y-2 text-slate-300">
              <p>Craft the perfect input for our AI tools using the <button onClick={() => setActiveTab(Tab.Prompt)} className="text-violet-400 underline hover:text-violet-300">Prompt Generator</button>.</p>
              <ul className="list-disc list-inside ml-4">
                <li>Provide a topic, audience, style, and key elements.</li>
                <li>The AI will generate a detailed, descriptive prompt optimized for tools like the Video Generator.</li>
              </ul>
            </div>
          )
        },
         {
          title: "Video, Animation & GIF Creators",
          keywords: "video, animation, gif, generator, creator, veo",
          icon: <Clapperboard className="w-5 h-5 mr-3 text-violet-300" />,
          content: (
            <div className="space-y-2 text-slate-300">
              <p>Produce moving visuals from text prompts with our Pro tools:</p>
              <ul className="list-disc list-inside ml-4">
                <li><button onClick={() => setActiveTab(Tab.Video)} className="text-violet-400 underline hover:text-violet-300">Video Generator</button>: Create videos for any platform from a prompt or by animating an image.</li>
                <li><button onClick={() => setActiveTab(Tab.AnimationCreator)} className="text-violet-400 underline hover:text-violet-300">Animation Creator</button>: Generate animated clips in various styles.</li>
                <li><button onClick={() => setActiveTab(Tab.GifCreator)} className="text-violet-400 underline hover:text-violet-300">GIF Creator</button>: Create short, looping GIFs for social media.</li>
              </ul>
            </div>
          )
        },
        {
          title: "Image Editor & Logo Creator",
          keywords: "image, logo, editor, creator, design, brand",
          icon: <PenTool className="w-5 h-5 mr-3 text-violet-300" />,
          content: (
            <div className="space-y-2 text-slate-300">
              <p>Create and edit visual assets with ease (Pro features):</p>
              <ul className="list-disc list-inside ml-4">
                <li><button onClick={() => setActiveTab(Tab.ImageEditor)} className="text-violet-400 underline hover:text-violet-300">Image Editor</button>: Edit any image just by typing what you want to change.</li>
                <li><button onClick={() => setActiveTab(Tab.LogoCreator)} className="text-violet-400 underline hover:text-violet-300">Logo Creator</button>: Generate a professional logo for your brand or channel.</li>
              </ul>
            </div>
          )
        },
        {
          title: "Video Editor",
          keywords: "video, editor, ai editing, effects, style",
          icon: <Scissors className="w-5 h-5 mr-3 text-violet-300" />,
          content: (
            <div className="space-y-2 text-slate-300">
              <p>The <button onClick={() => setActiveTab(Tab.VideoEditor)} className="text-violet-400 underline hover:text-violet-300">Video Editor</button> (Pro feature) lets you modify your existing videos with AI.</p>
              <ul className="list-disc list-inside ml-4">
                <li>Upload a short video clip.</li>
                <li>Provide a text prompt describing the change (e.g., "make the car red").</li>
                <li>Use the AI Toolkit to quickly apply styles, effects, and camera motions.</li>
              </ul>
            </div>
          )
        },
      ]
    },
     {
      category: "Strategy & Growth",
      topics: [
        {
          title: "Monetization Guide",
          keywords: "monetize, money, revenue, earnings, strategy",
          icon: <DollarSign className="w-5 h-5 mr-3 text-violet-300" />,
          content: (
            <div className="space-y-2 text-slate-300">
              <p>The <button onClick={() => setActiveTab(Tab.Monetization)} className="text-violet-400 underline hover:text-violet-300">Monetization Guide</button> provides personalized strategies.</p>
              <ul className="list-disc list-inside ml-4">
                <li>Select your platform and use the slider to set your follower count.</li>
                <li>The AI will generate relevant monetization strategies with descriptions, requirements, and earning potential.</li>
              </ul>
            </div>
          )
        },
        {
          title: "Channel Analytics",
          keywords: "analytics, data, stats, performance, competitor",
          icon: <BarChart2 className="w-5 h-5 mr-3 text-violet-300" />,
          content: (
            <div className="space-y-2 text-slate-300">
              <p>Get AI-powered insights with <button onClick={() => setActiveTab(Tab.Analytics)} className="text-violet-400 underline hover:text-violet-300">Channel Analytics</button> (Pro feature).</p>
              <ul className="list-disc list-inside ml-4">
                <li>Connect your channels in your Profile to see your own data.</li>
                <li>Use the Competitor Analysis bar to analyze any public YouTube or TikTok channel.</li>
                <li>Receive an AI summary and actionable growth opportunities.</li>
              </ul>
            </div>
          )
        },
        {
          title: "Channel Growth Plan",
          keywords: "growth, plan, strategy, improve",
          icon: <Rocket className="w-5 h-5 mr-3 text-violet-300" />,
          content: (
            <div className="space-y-2 text-slate-300">
              <p>Generate a personalized, multi-point growth plan with the <button onClick={() => setActiveTab(Tab.ChannelGrowth)} className="text-violet-400 underline hover:text-violet-300">Channel Growth</button> tool (Pro feature).</p>
              <ul className="list-disc list-inside ml-4">
                <li>The AI analyzes your selected channel's content, SEO, engagement, and thumbnails.</li>
                <li>Receive a detailed report with analysis and specific recommendations for each area.</li>
              </ul>
            </div>
          )
        },
        {
          title: "Strategy Report",
          keywords: "report, strategy, comprehensive, document",
          icon: <FileText className="w-5 h-5 mr-3 text-violet-300" />,
          content: (
            <div className="space-y-2 text-slate-300">
              <p>The <button onClick={() => setActiveTab(Tab.Report)} className="text-violet-400 underline hover:text-violet-300">Strategy Report</button> (Pro feature) combines multiple tools into one comprehensive document.</p>
              <ul className="list-disc list-inside ml-4">
                <li>Enter a topic to get a full report containing trend analysis, content ideas, and monetization strategies.</li>
                <li>Download the report as a Markdown file for your records.</li>
              </ul>
            </div>
          )
        },
        {
          title: "Video Analyzer",
          keywords: "video, analyzer, analysis, breakdown, competitor",
          icon: <Film className="w-5 h-5 mr-3 text-violet-300" />,
          content: (
            <div className="space-y-2 text-slate-300">
              <p>Use the <button onClick={() => setActiveTab(Tab.VideoAnalyzer)} className="text-violet-400 underline hover:text-violet-300">Video Analyzer</button> to get an AI breakdown of any YouTube or TikTok video.</p>
              <ul className="list-disc list-inside ml-4">
                <li>Paste a video URL to get an AI summary, content analysis, engagement analysis, and improvement suggestions.</li>
              </ul>
            </div>
          )
        },
        {
          title: "Repurpose Content",
          keywords: "repurpose, reuse, content, blog, tweet",
          icon: <RefreshCw className="w-5 h-5 mr-3 text-violet-300" />,
          content: (
            <div className="space-y-2 text-slate-300">
              <p>Turn one video into multiple pieces of content with the <button onClick={() => setActiveTab(Tab.RepurposeContent)} className="text-violet-400 underline hover:text-violet-300">Repurpose Content</button> tool.</p>
              <ul className="list-disc list-inside ml-4">
                <li>Paste a video URL, and the AI will convert it into a blog post, a tweet thread, and a LinkedIn post.</li>
              </ul>
            </div>
          )
        },
         {
          title: "Brand Connect",
          keywords: "brand, sponsor, connect, pitch, sponsorship",
          icon: <Briefcase className="w-5 h-5 mr-3 text-violet-300" />,
          content: (
            <div className="space-y-2 text-slate-300">
              <p>Find sponsors and generate pitch emails with <button onClick={() => setActiveTab(Tab.BrandConnect)} className="text-violet-400 underline hover:text-violet-300">Brand Connect</button> (Pro feature).</p>
              <ul className="list-disc list-inside ml-4">
                <li>Select one of your connected channels.</li>
                <li>The AI will find potential brand sponsors and provide a "match score".</li>
                <li>Generate a professional pitch email for any suggested brand.</li>
              </ul>
            </div>
          )
        },
      ]
    },
    {
      category: "Account & Support",
      topics: [
        {
          title: "Managing Your Profile",
          keywords: "account, profile, settings, channels, user",
          icon: <UserIcon className="w-5 h-5 mr-3 text-violet-300" />,
          content: (
            <div className="space-y-2 text-slate-300">
              <p>Keep your account up-to-date in the <button onClick={() => setActiveTab(Tab.Profile)} className="text-violet-400 underline hover:text-violet-300">Profile</button> section.</p>
              <ul className="list-disc list-inside ml-4">
                <li>Update your name, email, and other personal details.</li>
                <li>Connect and manage your YouTube and TikTok channels. This is crucial for features like Analytics and Channel Growth.</li>
              </ul>
            </div>
          )
        },
        {
          title: "Plans & Pricing",
          keywords: "plan, pricing, upgrade, subscription, pro, starter, free",
          icon: <Star className="w-5 h-5 mr-3 text-violet-300" />,
          content: (
            <div className="space-y-2 text-slate-300">
              <p>You can view all available plans on the <button onClick={() => setActiveTab(Tab.Pricing)} className="text-violet-400 underline hover:text-violet-300">Pricing</button> page.</p>
              <ul className="list-disc list-inside ml-4">
                <li>Compare the features available on the Free, Starter, and Pro plans.</li>
                <li>Upgrade your account at any time to unlock more powerful AI tools and higher limits.</li>
              </ul>
            </div>
          )
        },
      ]
    }
  ];
  
  const filteredContent = useMemo(() => {
    if (!searchTerm) return helpContent;

    return helpContent.map(category => {
      const filteredTopics = category.topics.filter(topic => 
        topic.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        topic.keywords.toLowerCase().includes(searchTerm.toLowerCase())
      );
      return { ...category, topics: filteredTopics };
    }).filter(category => category.topics.length > 0);
  }, [searchTerm, helpContent]);


  return (
    <div className="animate-slide-in-up max-w-4xl mx-auto">
      <div className="bg-brand-glass border border-slate-700/50 rounded-xl p-8 shadow-xl backdrop-blur-xl">
        <h2 className="text-3xl font-bold text-center mb-2 flex items-center justify-center gap-3">
          <HelpCircle className="w-8 h-8 text-violet-400" />
          Help Center
        </h2>
        <p className="text-center text-slate-400 mb-8">Your guide to mastering utrend. Find answers and tutorials below.</p>

        <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search help topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              title="Search for help topics, keywords, or features"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-violet-light transition-all shadow-inner"
            />
        </div>

        <div className="space-y-6">
          {filteredContent.map(category => (
            <div key={category.category}>
              <h3 className="text-xl font-bold text-slate-300 mb-2 px-1">{category.category}</h3>
              <div className="space-y-1 bg-slate-900/30 border border-slate-700/50 rounded-lg p-1">
                {category.topics.map(topic => (
                  <div key={topic.title} className="border-b border-slate-800 last:border-b-0">
                    <button
                      onClick={() => toggleTopic(topic.title.toLowerCase().replace(/\s/g, '-'))}
                      title={`Expand to see details about ${topic.title}`}
                      className="w-full flex justify-between items-center text-left p-3 hover:bg-slate-800/50 rounded-md transition-colors"
                    >
                      <span className="font-semibold text-md text-slate-100 flex items-center">{topic.icon} {topic.title}</span>
                      <ChevronDown className={`w-5 h-5 text-violet-400 transition-transform duration-300 ${openTopic === topic.title.toLowerCase().replace(/\s/g, '-') ? 'transform rotate-180' : ''}`} />
                    </button>
                    {openTopic === topic.title.toLowerCase().replace(/\s/g, '-') && (
                      <div className="px-3 pb-3 pl-12 text-slate-300 animate-fade-in text-sm">
                        {topic.content}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
          {filteredContent.length === 0 && (
             <p className="text-center text-slate-400 py-8">No help topics found for "{searchTerm}".</p>
          )}
        </div>
        
        <div className="mt-12 text-center bg-slate-800/50 p-6 rounded-lg border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-2">Still have questions?</h3>
            <p className="text-slate-400 mb-4">Our support team is here to assist you.</p>
            <button
                onClick={() => setActiveTab(Tab.Contact)}
                title="Go to the contact page"
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
import { Agent } from '../types.ts';
import { Sparkles, BarChart2, DollarSign, Edit as EditIcon, Twitter, Gmail, GoogleDrive, Slack } from '../components/Icons.tsx';

export const agents: Agent[] = [
  {
    id: 'visionary',
    name: 'Viral Visionary',
    description: 'Your go-to expert for brainstorming viral-worthy content ideas and spotting the next big trend.',
    icon: Sparkles,
    color: 'text-violet-400',
    systemInstruction: `You are the Viral Visionary, an AI agent with a deep understanding of internet culture. Your expertise is brainstorming unique, high-potential video ideas. You are creative and witty. When a user asks for ideas, provide a title, a strong hook, and a brief concept. If an idea is short and punchy, suggest sharing it on X (Twitter) using the format: EXTERNAL_ACTION:[TWITTER,"Your tweet text here"]`,
    starterPrompts: [
      'Give me 3 video ideas for a cooking channel.',
      'What\'s a unique angle for a tech review video?',
      'Brainstorm a viral challenge related to sustainable living.',
    ],
    externalTools: [
        { name: 'X (Twitter)', icon: Twitter },
    ],
  },
  {
    id: 'hacker',
    name: 'Growth Hacker',
    description: 'A data-driven specialist for SEO, keyword research, and audience growth strategies.',
    icon: BarChart2,
    color: 'text-blue-400',
    systemInstruction: `You are the Growth Hacker, a data-obsessed AI agent focused on audience growth. You specialize in SEO, keyword optimization, and algorithmic strategy. Your advice is always actionable and backed by data-driven logic. If you provide a detailed analysis, suggest sharing the key insights with a team on Slack using the format: EXTERNAL_ACTION:[SLACK,"Key insights summary here"]`,
    starterPrompts: [
      'How can I optimize my video titles for search?',
      'What are some good keywords for the term "vlogging"?',
      'Analyze my competitor\'s strategy (youtube.com/user/mkbhd).',
    ],
    externalTools: [
        { name: 'Slack', icon: Slack },
        { name: 'Google Drive', icon: GoogleDrive },
    ],
  },
  {
    id: 'maven',
    name: 'Monetization Maven',
    description: 'Your expert on all things money-related, from sponsorships to diverse revenue streams.',
    icon: DollarSign,
    color: 'text-green-400',
    systemInstruction: `You are the Monetization Maven, a savvy business AI agent who knows how to turn views into revenue. Your expertise covers sponsorships, affiliate marketing, and merchandise. Your tone is professional yet encouraging. If the user asks you to draft a sponsor pitch, suggest sending it via Gmail using the format: EXTERNAL_ACTION:[GMAIL,"Subject: Collaboration Inquiry\\n\\nYour pitch body here"]`,
    starterPrompts: [
      'What are some ways to monetize a channel with 10k subscribers?',
      'Help me draft a pitch to a potential sponsor.',
      'What kind of merch would be good for a gaming channel?',
    ],
    externalTools: [
        { name: 'Gmail', icon: Gmail },
    ],
  },
  {
    id: 'writer',
    name: 'Creative Writer',
    description: 'The master wordsmith who can turn your rough ideas into compelling scripts and sharp copy.',
    icon: EditIcon,
    color: 'text-yellow-400',
    systemInstruction: `You are the Creative Writer, a masterful AI agent with a flair for storytelling. You excel at turning ideas into polished scripts. Your tone is eloquent and creative. When you provide a script or long piece of text, suggest saving it to Google Drive using the format: EXTERNAL_ACTION:[GDRIVE,"Full script text here"]`,
    starterPrompts: [
      'Write a 60-second script about the history of coffee.',
      'Help me write a catchy YouTube description.',
      'Turn this bullet list into a compelling story: ...',
    ],
    externalTools: [
        { name: 'Google Drive', icon: GoogleDrive },
        { name: 'X (Twitter)', icon: Twitter },
    ],
  }
];
<div align="center">
  <br />
  <img src="https://i.imgur.com/R23S5h9.png" width="180" alt="utrend Logo">
  <h1 style="font-size: 3em; font-weight: bold; margin-bottom: 0;">utrend</h1>
  <p style="font-size: 1.2em;">The All-in-One AI Content Suite for Creators</p>
  <br />
</div>

<div align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Gemini_API-8E44AD?style=for-the-badge&logo=google-gemini&logoColor=white" alt="Gemini API">
  <img src="https://img.shields.io/badge/Chrome_Extension-FF9800?style=for-the-badge&logo=google-chrome&logoColor=white" alt="Chrome Extension">
  <a href="https://github.com/Akhathuto/Edgtec-Trends.git"><img src="https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github" alt="GitHub Repository"></a>
</div>

<div align="center">
  <img src="https://img.shields.io/badge/Status-Production%20Ready-brightgreen?style=flat-square" alt="Status">
  <img src="https://img.shields.io/badge/Version-1.0.0-blue?style=flat-square" alt="Version">
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License">
</div>

<div align="center">
  <h3>Application Showcase</h3>
  <img src="https://i.imgur.com/v8kASgM.gif" width="80%" alt="A GIF showcasing the various features of the utrend application, including the dashboard, trend discovery, and AI chat.">
</div>

---

### 📋 Table of Contents

- [About The App](#about-the-app)
- [🆕 Browser Extension](#-browser-extension-new)
- [📂 Repository](#-repository)
- [🚀 Getting Started](#-getting-started)
- [✨ Key Features](#-key-features)
- [🤖 Meet Your AI Agents](#-meet-your-ai-agents)
- [💻 Technology Stack](#-technology-stack)
- [📦 What's Included](#-whats-included)
- [Legal & Company Information](#legal--company-information)

---

## About The App

`utrend` is an all-in-one, AI-powered content suite designed to help YouTube and TikTok creators ideate, strategize, create, and grow their channels. Powered by Google's Gemini API, `utrend` provides a comprehensive toolkit to streamline your entire workflow, from discovering real-time trends to generating production-ready video scripts and assets.

---

## 🆕 Browser Extension (NEW!)

**Edgtec Browser Extension** - Real-time trend insights while you browse YouTube and TikTok!

### Key Highlights
- 📊 **Live Trend Analysis** - Get trend scores and direction instantly while watching videos
- 💾 **One-Click Export** - Save video ideas directly to your Edgtec calendar
- 🎯 **Auto-Extract Metadata** - Automatically captures video title, channel, and stats
- ⚙️ **Personalized Settings** - Configure app URL, toggle features, persist settings
- 🔗 **Context Menu Integration** - Right-click any YouTube/TikTok page to export
- 🎨 **Dark Theme UI** - Beautiful, modern interface with smooth animations

### Supported Platforms
- ✅ YouTube watch pages
- ✅ TikTok video pages
- ✅ Chrome, Chromium, Edge, Brave (v88+)
- 🔄 Firefox & Safari (v2.0 planned)

### Quick Start
```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Load extension (chrome://extensions → Developer mode → Load unpacked)
# Select the extension/ folder

# 4. Visit any YouTube video and start using!
```

**📖 [Extension Installation Guide](./extension/INSTALLATION.md)** - 5-minute setup  
**📖 [Extension Features Guide](./extension/README.md)** - Complete documentation  
**📖 [Testing Checklist](./extension/TESTING.md)** - 123+ test cases

## 📂 Repository

The source code for this project is available on GitHub.

-   **Repository URL:** [https://github.com/Akhathuto/Edgtec-Trends.git](https://github.com/Akhathuto/Edgtec-Trends.git)

## 🚀 Getting Started

This is a modern React application built with Vite.

### Prerequisites

-   Node.js (version 18.x or later) and npm.
-   A Google Gemini API key.
-   Vercel CLI (for local development with serverless functions): `npm i -g vercel`

### Setup & Running

1.  **Install dependencies:**
    Open your terminal in the project's root directory and run:
    ```bash
    npm install
    ```

2.  **API Key Configuration:**
    > **⚠️ IMPORTANT:** This project requires a Google Gemini API key.
    >
    > 1.  Create a file named `.env.local` in the project root.
    > 2.  Add your API key to this file: `API_KEY=YOUR_API_KEY_HERE`
    >
    > **For deployment (e.g., Vercel):**
    >    Set an environment variable named `API_KEY` with your API key in your deployment service's settings.

3.  **Run the development server:**
    Use the Vercel CLI to run the Vite dev server and the serverless functions together:
    ```bash
    vercel dev
    ```

4.  **Open in browser:**
    Open your browser and navigate to the local address provided by the Vercel CLI (e.g., `http://localhost:3000`). The application should now be running.

### Developer notes (deployment fixes)

- If you see an error like `vite' is not recognized` when running `npm run dev`, you likely haven't installed dependencies yet. Run:

```bash
npm install
```

- On some Windows systems there may be insufficient space on the system (C:) to download npm packages. To avoid this, a project-local `.npmrc` has been added that points the npm cache to the project folder on the D: drive. If you prefer another location, update or remove the `.npmrc` file.

- If you encounter peer dependency resolution errors (ERESOLVE) during install, use the legacy resolver:

```bash
npm install --legacy-peer-deps
```

- Recommended environment:
    - Node.js 18.x or later
    - npm 9.x (or compatible)

These changes were applied to help get the development server running locally (Vite) and avoid common Windows/C: disk-space issues during npm install.

## ✨ Key Features

The `utrend` platform is organized into four powerful suites to cover every aspect of your content creation journey.

<details>
<summary><strong>📈 Discovery & Analytics Suite</strong></summary>
<br>
<ul>
    <li><strong>Trend Discovery:</strong> Uncover real-time trending topics, channels, videos, and music across YouTube and TikTok. Filter by country and category to pinpoint viral opportunities before they peak.</li>
    <li><strong>Keyword Research:</strong> Analyze any keyword to get insights on search volume and competition. Discover related long-tail keywords and get content ideas tailored to your SEO strategy.</li>
    <li><strong>Channel Analytics (Pro):</strong> Connect your channels for an AI-powered performance summary or analyze any public competitor's channel. Receive an AI summary, key metrics, and actionable growth opportunities.</li>
    <li><strong>Video Analyzer:</strong> Get an AI breakdown of any YouTube or TikTok video. Paste a URL to receive analysis on content, engagement, and specific improvement suggestions.</li>
</ul>
</details>

<details>
<summary><strong>🎨 AI Create Suite</strong></summary>
<br>
<ul>
    <li><strong>Content & Script Generation:</strong> Go from a simple topic to a full-fledged video plan. Generate viral content ideas complete with titles, hooks, outlines, and hashtags. Upgrade to generate a production-ready script from any idea.</li>
    <li><strong>AI Video Generation (Pro):</strong> Create stunning videos and animations from text prompts or by animating an image. Includes:
        <ul>
            <li><strong>Video Generator:</strong> For standard video creation, now with multi-image reference and video extension capabilities.</li>
            <li><strong>Animation Creator:</strong> Generate animated clips in various styles, aspect ratios, and resolutions.</li>
            <li><strong>GIF Creator:</strong> Create short, looping GIFs for social media.</li>
        </ul>
    </li>
    <li><strong>Visual Asset Creation (Pro):</strong> Build your brand's visual identity effortlessly.
        <ul>
            <li><strong>Image Generator:</strong> Create unique images from text prompts in various styles and aspect ratios.</li>
            <li><strong>Logo Creator:</strong> Design a professional logo for your brand or channel.</li>
            <li><strong>Thumbnail Idea Generator:</strong> Get click-worthy thumbnail concepts with visual descriptions and AI image prompts.</li>
        </ul>
    </li>
    <li><strong>AI-Powered Editing (Pro):</strong> Modify your media with simple text commands.
        <ul>
            <li><strong>Image Editor:</strong> Upload an image and describe your desired changes.</li>
            <li><strong>Video Editor:</strong> Upload a video clip and tell the AI how to alter it.</li>
        </ul>
    </li>
    <li><strong>AI Avatar Creator (Pro):</strong> Design a unique AI persona from scratch or a photo. Customize its appearance and personality, then interact with it via a text-based chat.</li>
    <li><strong>Audience Engagement Tools:</strong>
        <ul>
            <li><strong>Comment Responder:</strong> Generate the perfect, on-brand replies to your audience's comments in seconds, with customizable tones.</li>
        </ul>
    </li>
    <li><strong>Prompt Generator:</strong> Craft the perfect, detailed prompts for AI media generation tools, ensuring you get the exact results you want.</li>
</ul>
</details>

<details>
<summary><strong>🤖 AI Agents & Co-Pilots Suite</strong></summary>
<br>
<ul>
    <li><strong>AI Voice Co-Pilot (Pro):</strong> Engage in a real-time, natural voice conversation with your AI assistant. Powered by the Gemini Live API, this feature includes live transcription for a seamless interactive experience.</li>
    <li><strong>AI Chat (Nolo):</strong> Brainstorm, ask for advice, or get help with your content strategy in a conversational text-based interface, now with customizable AI voices.</li>
    <li><strong>Expert AI Agents:</strong> Consult a team of specialized AI experts for brainstorming, growth hacking, monetization, scriptwriting, and now, thumbnail design. Your personal team of channel managers, on demand.</li>
</ul>
</details>

<details>
<summary><strong>🧠 Strategy & Growth Engine</strong></summary>
<br>
<ul>
    <li><strong>Monetization Guide:</strong> Receive tailored monetization strategies based on your platform and follower count. Unlock your earning potential at any stage of your journey.</li>
    <li><strong>Full Strategy Reports (Pro):</strong> Generate a comprehensive content strategy document for any topic, combining trend analysis, multiple content ideas, and monetization strategies into one report.</li>
    <li><strong>Channel Growth Plan (Pro):</strong> Get a custom, multi-point growth plan for your connected channel, with AI analysis of your content, SEO, engagement, and thumbnails.</li>
    <li><strong>Brand Connect (Pro):</strong> Let the AI find potential brand sponsors for your channel based on your content. Generate professional, personalized pitch emails to secure sponsorships with confidence.</li>
    <li><strong>Content Repurposing:</strong> Turn a single video into a blog post, a Tweet thread, and a LinkedIn post automatically. Maximize your content's reach with minimal effort.</li>
</ul>
</details>

## 🤖 Meet Your AI Agents

Consult your personal team of AI experts, each with a unique specialty to guide your creative process.

-   **✨ Viral Visionary:** Your go-to expert for brainstorming viral-worthy content ideas and spotting the next big trend.
-   **📊 Growth Hacker:** A data-driven specialist for SEO, keyword research, and audience growth strategies.
-   **💰 Monetization Maven:** Your expert on all things money-related, from sponsorships to diverse revenue streams.
-   **✍️ Creative Writer:** The master wordsmith who can turn your rough ideas into compelling scripts and sharp copy.
-   **🎨 Thumbnail Wizard (New!):** A visual design expert who crafts compelling, click-worthy thumbnail concepts to boost your CTR.

---

## 💻 Technology Stack

- **Core Framework:** React
- **Build Tool:** Vite
- **Language:** TypeScript
- **AI Integration:** Google Gemini API (`@google/genai`) via a secure server-side proxy
- **Styling:** Tailwind CSS
- **Deployment:** Vercel (recommended)

---

## 📦 What's Included

### 🎯 Main Application
- **Dashboard** with trend filters, tag cloud, keyword analyzer
- **Content Calendar** - Plan and organize your content
- **Keyword Batch Analyzer** - Analyze multiple keywords and get trend insights
- **Action Pack Generator** - AI-powered content suggestions
- **YouTube Analytics** - Connect and monitor your channel metrics
- **Affiliate Program** - Join and manage partnerships

### 🔌 Browser Extension
- **YouTube Content Script** - Auto-inject insights on watch pages
- **TikTok Content Script** - Inline trend analysis
- **Popup Interface** - 3-tab UI (Insights, Export, Settings)
- **Real-time Trends** - Live trend scores and direction
- **One-Click Export** - Save to calendar instantly
- **Context Menu** - Right-click to export videos
- **Settings Panel** - Customize and persist preferences

### 🔗 API Routes
- `/api/trends` - Get trend data and analysis
- `/api/action-pack` - Generate AI-powered content packs
- `/api/youtube/auth` - OAuth 2.0 authentication
- `/api/youtube/metrics` - Fetch channel analytics
- `/api/youtube/publish` - Schedule and publish videos

### 📚 Documentation
- **README.md** - Project overview
- **PRODUCTION_SETUP.md** - 7-step production deployment guide
- **QUICK_START.md** - 3-minute quick reference
- **PROJECT_STATUS.md** - Complete project status
- **EXTENSION_COMPLETION_SUMMARY.md** - Extension overview
- **EXTENSION_IMPLEMENTATION_COMPLETE.md** - Completion report
- **extension/README.md** - Extension features
- **extension/INSTALLATION.md** - Extension setup (5 min)
- **extension/TESTING.md** - Testing checklist (123+ tests)
- **extension/ARCHITECTURE.md** - Technical design

### 🛠️ Scripts & Configuration
- **scripts/setup.js** - Interactive setup automation
- **scripts/verify.js** - Setup verification
- **Dockerfile** - Production container image
- **docker-compose.yml** - Container orchestration
- **.env.local.example** - Environment variables template



<details>
<summary><strong>License and Intellectual Property</strong></summary>
<br>

-   **Proprietary Property:** This software, including its source code, visual design, features, and the "utrend" name and logo, are the proprietary property and trademarks of utrend. All rights are reserved.
-   **Limited License:** utrend grants you a limited, non-exclusive, non-transferable, revocable license to use the `utrend` application for your personal or internal business purposes, strictly in accordance with these Terms of Use.
-   **Restrictions:** Unauthorized copying, distribution, modification, or use of this software, or any portion of it, is strictly prohibited without the express written permission of utrend.

**Copyright (c) 2024 utrend. All Rights Reserved.**
</details>

<details>
<summary><strong>Terms of Use</strong></summary>
<br>

**Last Updated: August 1, 2024**

By using `utrend`, you agree to the following terms and conditions:

1.  **Acceptance of Terms:** Your access to and use of the application constitutes your binding agreement to these Terms of Use. If you do not agree to these terms, you must not use the application.

2.  **Eligibility:** You must be at least 18 years of age to use this application. By using `utrend`, you represent and warrant that you meet this age requirement.

3.  **User Accounts & Responsibility:** You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.

4.  **Acceptable Use Policy:** You agree not to use the application to:
    -   Conduct any illegal, fraudulent, or malicious activities.
    -   Infringe on the intellectual property rights of others.
    -   Generate content that is hateful, defamatory, obscene, or otherwise objectionable.
    -   Attempt to reverse-engineer, decompile, or otherwise discover the source code of the application.
    -   Use automated systems (bots, scrapers) to access the application in a manner that sends more request messages to our servers than a human can reasonably produce in the same period.

5.  **AI-Generated Content & User Responsibility:**
    -   **Ownership:** You retain all ownership rights to the content you generate using the application's AI tools ("User Content").
    -   **Responsibility:** You are solely responsible for the User Content you generate, publish, and use. You must review all AI-generated content for accuracy and appropriateness before use.
    -   **Disclaimer:** AI-generated content may contain inaccuracies, errors, or reflect biases from its training data. utrend makes no warranties regarding the accuracy, reliability, or suitability of AI-generated content. It is your responsibility to ensure your final content complies with all applicable platform policies (e.g., YouTube's Terms of Service).

6.  **Subscription & Payments:** The application offers free and paid plans. By subscribing to a paid plan, you agree to pay the specified fees. All payments are processed through secure third-party gateways.

7.  **Data Privacy:** We are committed to protecting your privacy. We collect and use personal information, such as your name and email address, to provide and improve our services. Your payment information is handled by secure third-party processors. We do not sell your personal data.

8.  **Termination:** We reserve the right to terminate or suspend your account and access to the service at our sole discretion, without notice, for conduct that we believe violates these Terms of Use or is harmful to other users of the application, us, or third parties.

9.  **Third-Party Services:** This application utilizes third-party services, including the Google Gemini API. Your use of these features is also subject to their respective terms and conditions.

10. **Indemnification:** You agree to indemnify and hold harmless utrend, its directors, and employees from and against any claims, liabilities, damages, losses, and expenses arising out of or in any way connected with your access to or use of the application or your violation of these Terms.

11. **Disclaimer of Warranties & Limitation of Liability:** The application is provided on an "as is" and "as available" basis, without any warranties of any kind. In no event shall utrend be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of the application.

12. **Governing Law & Dispute Resolution:** These Terms shall be governed and construed in accordance with the laws of South Africa, without regard to its conflict of law provisions. Any disputes will be resolved in the courts of Gauteng, South Africa.

13. **Changes to Terms:** We reserve the right to modify or replace these Terms at any time. We will provide notice of any significant changes.
</details>

<details>
<summary><strong>Powered by utrend</strong></summary>
<br>

`utrend` is proudly developed by **utrend**, a forward-thinking technology company based in South Africa.

**Our Mission:** To empower creators and businesses with innovative, accessible, and intelligent software solutions. We believe in leveraging the power of artificial intelligence to solve real-world challenges and unlock new creative potential.

### Company Details

- **Legal Name:** Edgtec pty ltd
- **Business Status:** In Business
- **Country of Origin:** South Africa
- **Registration Number:** 2025/534716/07
- **Supplier Number:** MAAA1626554
- **B-BBEE Status:** 100% Black Owned

### Ownership

`utrend` is driven by the vision of its directors:
- **Ranthutu Lepheane** (r.lepheane@outlook.com)
- **Siphosakhe Mathews Msimango** (siphosakhemsimango@gmail.com)
</details>
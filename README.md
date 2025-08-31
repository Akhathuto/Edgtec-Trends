<div align="center">
  <br />
  <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIyLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJ1dHJlbmQtZ3JhZCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI2E3OGJmYSIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiM3YzNhZWQiIC8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHBhdGggZD0iTTQgMjBWMTBDNCA2LjY4NjI5IDYuNjg2MjkgNCAxMCA0SDE0QzE3LjMxMzcgNCAyMCA2LjY4NjI5IDIwIDEwVjE0IiBzdHJva2U9InVybCgjdXRyZW5kLWdyYWQpIi8+PHBhdGggZD0iTTE1IDlMMjAgNEwyMCA5IiBzdHJva2U9InVybCgjdXRyZW5kLWdyYWQpIi8+PC9zdmc+" width="120" alt="utrend Logo">
  <h1 style="font-size: 3em; font-weight: bold; margin-bottom: 0;">utrend</h1>
  <p style="font-size: 1.2em;">Your AI Content Co-Pilot</p>
  <br />
</div>

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Gemini_API-8E44AD?style=for-the-badge&logo=google-gemini&logoColor=white" alt="Gemini API">
</p>

---

## About The App

`utrend` is an all-in-one, AI-powered assistant designed to help YouTube and TikTok content creators ideate, strategize, and grow their channels. Powered by Google's Gemini API, `utrend` provides the tools and insights necessary to stay ahead of the curve and produce viral content. It's a strategic partner that helps you:
- **Discover what's next:** Identify real-time trends on YouTube and TikTok, ensuring your content is always relevant.
- **Generate viral ideas:** Overcome creative blocks with AI-powered video ideas, complete with hooks, outlines, and hashtags.
- **Craft the perfect strategy:** Get personalized monetization strategies and full, in-depth content reports tailored to your channel's size and niche.
- **Create with AI:** Generate entire videos from a simple text prompt, edit images with AI instructions, and craft the perfect prompt for any AI task.
- **Analyze and Optimize:** Get live, AI-powered analytics for your YouTube channel and perform deep keyword research to optimize your content's reach.

## ✨ What's New in the Current Update
- **Revamped Admin Dashboard:** The dashboard now features a tabbed interface with a new "Overview" section displaying key user stats and a real-time, persistent activity feed showing key user actions across the platform.
- **Full User Management:** Administrators can now delete users directly from the "User Management" tab within the dashboard, with appropriate safety confirmations.
- **Persistent Sidebar Navigation:** Replaced the top tabs with a more organized and persistent sidebar navigation for a better user experience.

## Key Features

- **Real-time Trend Discovery:** Find out what's currently trending in any country or category on YouTube and TikTok.
- **AI Content Idea Generation:** Generate unique and viral video ideas, complete with scripts.
- **Monetization Guide:** Receive tailored strategies to monetize your content based on your follower count.
- **Keyword Research Tool:** Analyze keyword search volume and competition to find untapped content opportunities.
- **Live Channel Analytics:** Connect your YouTube channel for an AI-powered performance summary and analysis.
- **AI Video & Image Generation:** Create video content and edit images using simple text prompts.
- **AI Chat Assistant "Nolo":** Brainstorm ideas and get creative advice from a dedicated AI chat assistant.
- **Full Strategy Reports:** A pro-level feature that combines trend analysis, content ideas, and monetization strategies into a single, comprehensive report.
- **Advanced Admin Dashboard:** A secure panel for administrators to manage users (update plans, roles, and delete users), view platform statistics, and monitor a live feed of user activity.
- **Modern UI:** A clean, intuitive, and responsive interface with persistent sidebar navigation.

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes. These steps are compatible with Windows, macOS, and Linux.

### Prerequisites

You will need [Node.js](https://nodejs.org/) (which includes `npm`) installed on your computer. You can download it from the official website.

### Installation & Setup

1.  **Download the Project Files:**
    Since this project is not in a public repository, start by downloading and unzipping all the application files into a single folder on your machine.

2.  **Set Up Environment Variables:**
    This project requires an API key from Google AI Studio to interact with the Gemini API. The application is configured to read `process.env.API_KEY` directly from the execution environment. In a real-world development scenario, you would:
    - Create a new file named `.env` in the root of your project directory.
    - Add your API key to this file:
      ```
      API_KEY=YOUR_GEMINI_API_KEY
      ```

3.  **Install Dependencies:**
    This project uses a modern setup where dependencies are managed by the execution environment. No `npm install` command is necessary.

### Running the Application

Since this project is a modern frontend application, you can run it using any simple local web server. The easiest way is using the `serve` package.

1.  **Open your terminal or command prompt.**

2.  **Navigate to the project's root directory:**
    ```bash
    cd path/to/your/utrend-folder
    ```

3.  **Run the app using `npx` (this downloads and runs `serve` without a global installation):**
    ```bash
    npx serve .
    ```

4.  Open your browser and navigate to the local address provided in the terminal (usually `http://localhost:3000`). The application should now be running.

## Technology Stack

This application is built with a modern frontend stack, leveraging the power of AI to deliver its core features.

- **Core Framework:** React
- **AI Integration:** Google Gemini API (`@google/genai`)
- **Styling:** Tailwind CSS for a utility-first design system.
- **Language:** TypeScript for type safety and improved developer experience.
- **Date Handling:** `date-fns` for lightweight and reliable date formatting.

## Powered by EDGTEC

`utrend` is proudly developed by **EDGTEC**, a forward-thinking technology company based in South Africa.

**Our Mission:** To empower creators and businesses with innovative, accessible, and intelligent software solutions. We believe in leveraging the power of artificial intelligence to solve real-world challenges and unlock new creative potential.

### Company Details

- **Legal Name:** EDGTEC
- **Business Status:** In Business
- **Country of Origin:** South Africa
- **Registration Number:** 2025/534716/07
- **Supplier Number:** MAAA1626554
- **B-BBEE Status:** 100% Black Owned

### Ownership

`utrend` is driven by the vision of its directors:
- **Ranthutu Lepheane** (r.lepheane@outlook.com)
- **Siphosakhe Mathews Msimango** (siphosakhemsimanngo@gmail.com)

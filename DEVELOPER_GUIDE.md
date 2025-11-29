# Developer Guide

**Version:** 1.0.0  
**Last Updated:** November 2024  
**Audience:** Developers, contributors, maintainers

---

## 📖 Table of Contents

1. [Project Overview](#project-overview)
2. [Local Development Setup](#local-development-setup)
3. [Project Structure](#project-structure)
4. [Code Style & Standards](#code-style--standards)
5. [Component Development](#component-development)
6. [API Development](#api-development)
7. [Extension Development](#extension-development)
8. [Testing Guidelines](#testing-guidelines)
9. [Debugging Tips](#debugging-tips)
10. [Deployment Process](#deployment-process)
11. [Git Workflow](#git-workflow)
12. [Troubleshooting](#troubleshooting)

---

## Project Overview

### What is Edgtec-Trends?

An all-in-one AI-powered content creation platform for YouTube and TikTok creators with:
- Content calendar management
- Trend analysis and insights
- YouTube integration (OAuth, metrics, publishing)
- AI-powered action pack generation
- Browser extension for in-situ insights

### Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18.3 + TypeScript |
| **Build** | Vite 5.4.21 |
| **Styling** | Tailwind CSS 3.4 |
| **Backend** | Next.js API routes (serverless) |
| **AI** | Google Gemini API |
| **Extension** | Chrome Manifest v3 |
| **Deployment** | Vercel + Docker |

### Repository Structure

```
Edgtec-Trends/
├── app/                    # Next.js app router
│   ├── api/               # Serverless functions
│   ├── content-calendar/  # Calendar page
│   └── page.tsx           # Home page
├── components/            # React components (30+)
├── extension/             # Browser extension
├── services/              # API clients
├── utils/                 # Utilities
├── scripts/               # Build & setup scripts
├── docs/                  # Documentation
└── package.json           # Dependencies
```

---

## Local Development Setup

### Prerequisites

- **Node.js:** 18.x or later
- **npm:** 9.x or compatible
- **Git:** Latest version
- **A modern browser:** Chrome, Edge, or Firefox

### Step 1: Clone Repository

```bash
git clone https://github.com/Akhathuto/Edgtec-Trends.git
cd Edgtec-Trends
```

### Step 2: Install Dependencies

```bash
npm install

# Or if you hit peer dependency issues:
npm install --legacy-peer-deps
```

### Step 3: Configure Environment

```bash
# Copy example env file
cp .env.local.example .env.local

# Edit .env.local with your credentials:
# - YOUTUBE_CLIENT_ID
# - YOUTUBE_CLIENT_SECRET
# - YOUTUBE_API_KEY
# - OPENAI_API_KEY (optional)
# - GROQ_API_KEY (optional)
```

### Step 4: Start Development Server

```bash
npm run dev

# Server runs at http://localhost:3000
```

### Step 5: Load Extension (Optional)

For browser extension development:

1. Open `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `Edgtec-Trends/extension` folder
5. Reload extension when making changes

### Verification

```bash
# Check build works
npm run build

# Should produce dist/ folder with:
# - dist/index.html
# - dist/assets/index-*.css
# - dist/assets/index-*.js
```

---

## Project Structure

### Frontend Architecture

```
components/
├── Dashboard.tsx           # Main dashboard
├── ContentCalendar.tsx     # Calendar component
├── KeywordBatchAnalyzer.tsx # Keyword analysis
├── YouTubeAnalytics.tsx    # YouTube integration UI
├── ActionPackModal.tsx     # AI suggestions modal
├── AffiliateProgram.tsx    # Affiliate page
├── DashboardTools.tsx      # Tools integration
└── ... (20+ more components)

app/
├── page.tsx               # Home page
├── globals.css            # Global styles
├── layout.tsx             # Root layout
├── api/                   # API routes
│   ├── trends/           # Trend data
│   ├── action-pack/      # AI suggestions
│   └── youtube/          # YouTube APIs
└── content-calendar/     # Calendar page

services/
├── trendsService.ts      # Trends API client
├── youtubeService.ts     # YouTube API client
└── actionPackService.ts  # Action pack client

utils/
├── exportCsv.ts          # CSV export helper
├── validators.ts         # Input validation
└── helpers.ts            # Utility functions
```

### Extension Architecture

```
extension/
├── manifest.json          # Manifest v3 config
├── popup.html/js/css      # Popup UI
├── background.js          # Service worker
├── content-youtube.js     # YouTube script
├── content-tiktok.js      # TikTok script
├── content.css            # Widget styles
└── images/                # Icons (16, 48, 128)
```

---

## Code Style & Standards

### TypeScript

#### Type Definitions
```typescript
// Always define types for props and state
interface DashboardProps {
  userId: string;
  trendScore?: number;
  onExport: (data: ExportData) => Promise<void>;
}

interface DashboardState {
  isLoading: boolean;
  error: Error | null;
  data: TrendData[];
}

// Use proper return types
function calculateScore(value: number): number {
  return Math.round(value * 100);
}
```

#### Avoiding Any
```typescript
// ❌ Avoid
const data: any = response.data;

// ✅ Good
const data: TrendData[] = response.data;

// Use union types if uncertain
type ApiResponse = TrendData | ErrorData | null;
```

### React Components

#### Functional Components
```typescript
// ✅ Preferred: Functional components
import React, { useState, useEffect } from 'react';

interface VideoCardProps {
  title: string;
  views: number;
  onExport: () => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  title,
  views,
  onExport
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-gray-500">{views} views</p>
      <button
        onClick={onExport}
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Export
      </button>
    </div>
  );
};
```

#### Hooks Usage
```typescript
// ✅ Good hooks patterns
const [state, setState] = useState<Data | null>(null);
const [error, setError] = useState<Error | null>(null);
const [isLoading, setIsLoading] = useState(false);

useEffect(() => {
  // Fetch data on mount
  fetchData();
}, []);

// Custom hooks for reusable logic
function useVideoMetrics(videoId: string) {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  
  useEffect(() => {
    getMetrics(videoId).then(setMetrics);
  }, [videoId]);
  
  return metrics;
}
```

### Styling with Tailwind

#### Class Organization
```typescript
// ✅ Good: Organized classes
<div className="
  flex items-center justify-between
  px-4 py-2
  bg-white border border-gray-200
  rounded-lg shadow-sm
  hover:shadow-md transition-shadow
">

// ❌ Avoid: Unorganized classes
<div className="px-4 py-2 bg-white rounded-lg flex items-center justify-between border border-gray-200">
```

#### Custom Classes
```typescript
// ✅ Use @apply for repeated patterns
<style>
  .card {
    @apply bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow;
  }
</style>

// Or create component
const Card = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
    {children}
  </div>
);
```

### File Naming

```
components/
  ✅ VideoAnalytics.tsx
  ❌ video_analytics.tsx
  ❌ VideoAnalyticsComponent.tsx

utils/
  ✅ exportCsv.ts
  ❌ export-csv.ts
  ❌ ExportCsv.ts

api/
  ✅ trends/route.ts
  ❌ trendsRoute.ts
  ❌ trends.ts

styles/
  ✅ dashboard.css
  ❌ Dashboard.css
```

---

## Component Development

### Creating a New Component

#### Step 1: Create Component File

```typescript
// components/MyComponent.tsx
import React, { useState } from 'react';

interface MyComponentProps {
  title: string;
  onAction: (data: any) => void;
  isLoading?: boolean;
}

export const MyComponent: React.FC<MyComponentProps> = ({
  title,
  onAction,
  isLoading = false
}) => {
  const [state, setState] = useState<any>(null);

  const handleClick = () => {
    onAction(state);
  };

  return (
    <div className="p-4 rounded-lg border border-gray-200">
      <h2 className="text-xl font-semibold">{title}</h2>
      {isLoading && <p>Loading...</p>}
      <button
        onClick={handleClick}
        disabled={isLoading}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        Submit
      </button>
    </div>
  );
};
```

#### Step 2: Export from Index

```typescript
// components/index.ts
export { MyComponent } from './MyComponent';
export { Dashboard } from './Dashboard';
export { VideoCard } from './VideoCard';
```

#### Step 3: Use in Parent

```typescript
// app/page.tsx
import { MyComponent } from '@/components';

export default function Home() {
  return (
    <MyComponent
      title="My Component"
      onAction={(data) => console.log(data)}
      isLoading={false}
    />
  );
}
```

### Component Testing Checklist

- [ ] Props typed correctly
- [ ] Handles loading states
- [ ] Handles error states
- [ ] Accessible (ARIA labels, keyboard nav)
- [ ] Responsive design tested
- [ ] Dark mode compatible
- [ ] Performance: No unnecessary re-renders

---

## API Development

### Creating a New API Route

#### Step 1: Create Route Handler

```typescript
// app/api/my-endpoint/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const param = searchParams.get('param');

    if (!param) {
      return NextResponse.json(
        { error: 'Missing required parameter: param' },
        { status: 400 }
      );
    }

    // Your logic here
    const data = await fetchData(param);

    return NextResponse.json(data);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    if (!body.required_field) {
      return NextResponse.json(
        { error: 'Missing required field: required_field' },
        { status: 400 }
      );
    }

    // Your logic
    const result = await processData(body);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

#### Step 2: Create Service Layer

```typescript
// services/myService.ts
export async function fetchData(param: string) {
  const response = await fetch(`https://api.example.com/data?param=${param}`);
  
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
}

export async function processData(data: any) {
  // Business logic
  return {
    ...data,
    processed: true,
    timestamp: new Date().toISOString()
  };
}
```

#### Step 3: Use in Frontend

```typescript
// components/MyComponent.tsx
const handleFetch = async () => {
  try {
    const response = await fetch('/api/my-endpoint?param=value');
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Failed to fetch:', error);
  }
};
```

### API Best Practices

✅ **Do:**
- Use appropriate HTTP methods (GET, POST, PUT, DELETE)
- Return proper status codes (200, 201, 400, 404, 500)
- Validate input data
- Handle errors gracefully
- Log errors for debugging
- Document with JSDoc comments
- Use TypeScript types

❌ **Don't:**
- Return untyped `any` responses
- Ignore error handling
- Expose sensitive data in responses
- Use hardcoded values
- Skip input validation
- Return 200 for all responses

---

## Extension Development

### Adding New Extension Feature

#### Step 1: Update Manifest

```json
{
  "manifest_version": 3,
  "name": "Edgtec Trends",
  "version": "1.0.1",
  "permissions": ["activeTab", "scripting", "storage"],
  "content_scripts": [
    {
      "matches": ["*://youtube.com/*"],
      "js": ["content-youtube.js"],
      "css": ["content.css"]
    }
  ]
}
```

#### Step 2: Create Content Script

```typescript
// extension/content-my-feature.js
function injectMyFeature() {
  // Check if already injected
  if (document.getElementById('my-feature-widget')) {
    return;
  }

  const widget = document.createElement('div');
  widget.id = 'my-feature-widget';
  widget.innerHTML = '<p>My new feature!</p>';
  
  document.body.appendChild(widget);
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectMyFeature);
} else {
  injectMyFeature();
}

// Listen for messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'myAction') {
    sendResponse({ success: true });
  }
});
```

#### Step 3: Update Background Script

```typescript
// extension/background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'myAction') {
    // Handle from background
    sendResponse({ data: 'response' });
  }
});
```

#### Step 4: Test

- Reload extension in `chrome://extensions`
- Visit target website
- Verify feature works
- Check DevTools console for errors

---

## Testing Guidelines

### Unit Testing

```typescript
// utils/exportCsv.ts
export function exportCsv(data: any[], filename: string) {
  const csv = data.map(row => Object.values(row).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  // ... download logic
}

// utils/exportCsv.test.ts
describe('exportCsv', () => {
  it('should create CSV with correct format', () => {
    const data = [{ name: 'John', age: 30 }];
    const result = exportCsv(data, 'test.csv');
    expect(result).toContain('John,30');
  });

  it('should handle empty data', () => {
    const result = exportCsv([], 'test.csv');
    expect(result).toBe('');
  });
});
```

### Component Testing

```typescript
// components/VideoCard.test.tsx
import { render, screen } from '@testing-library/react';
import { VideoCard } from './VideoCard';

describe('VideoCard', () => {
  it('renders video title', () => {
    render(<VideoCard title="Test Video" views={1000} onExport={() => {}} />);
    expect(screen.getByText('Test Video')).toBeInTheDocument();
  });

  it('displays view count', () => {
    render(<VideoCard title="Test" views={1000} onExport={() => {}} />);
    expect(screen.getByText('1000 views')).toBeInTheDocument();
  });
});
```

### Manual Testing Checklist

- [ ] Feature works on intended browsers
- [ ] Responsive on mobile/tablet/desktop
- [ ] Dark/light mode compatible
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Accessibility meets WCAG standards
- [ ] Error states handled
- [ ] Loading states visible

---

## Debugging Tips

### Browser DevTools

```javascript
// Console debugging
console.log('Debug info:', data);
console.error('Error occurred:', error);
console.table(arrayOfObjects); // Pretty print arrays

// Conditional logging
if (process.env.NODE_ENV === 'development') {
  console.log('Dev only message');
}

// Performance timing
console.time('myLabel');
// ... code to measure
console.timeEnd('myLabel');
```

### React Debugging

```typescript
// Using console in React
useEffect(() => {
  console.log('Component mounted');
  return () => {
    console.log('Component unmounted');
  };
}, []);

// Debug state changes
const [state, setState] = useState(null);
useEffect(() => {
  console.log('State updated:', state);
}, [state]);
```

### Extension Debugging

```javascript
// In content script
// Right-click page → Inspect → Console
console.log('Content script debug');

// In background script
// chrome://extensions → Click "service worker"
console.log('Background worker debug');

// In popup
// Right-click extension → "Inspect popup"
console.log('Popup debug');
```

### Network Debugging

1. Open DevTools (F12)
2. Go to Network tab
3. Perform action
4. Check:
   - Request URL correct
   - Headers include auth token
   - Response status (200, 401, 500, etc.)
   - Response body contains expected data

---

## Deployment Process

### Pre-Deployment Checklist

- [ ] All tests passing
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Documentation updated
- [ ] Environment variables configured
- [ ] Build succeeds without warnings
- [ ] Performance acceptable

### Local Build

```bash
npm run build

# Check output
ls -la dist/
```

### Staging Deploy (Vercel)

```bash
vercel --prod --env staging
```

### Production Deploy

```bash
# Automatically deployed on GitHub push to main
# Or manually:
vercel --prod
```

### Post-Deployment

- [ ] Verify site loads
- [ ] Test critical features
- [ ] Check error logs
- [ ] Monitor performance
- [ ] Get user feedback

---

## Git Workflow

### Branch Naming

```
feature/description      # New features
bugfix/description       # Bug fixes
docs/description         # Documentation
performance/description  # Performance improvements
```

### Commit Messages

```
# Feature
feat: add keyboard shortcuts to extension

# Fix
fix: resolve YouTube metadata extraction issue

# Documentation
docs: update installation guide

# Performance
perf: optimize bundle with code splitting

# Format
type(scope): description

# Examples
feat(extension): add keyboard shortcuts
fix(api): handle YouTube API errors
docs(readme): add quick start guide
```

### Pull Request Process

1. **Create branch**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make changes**
   ```bash
   git add .
   git commit -m "feat: description of change"
   ```

3. **Push to GitHub**
   ```bash
   git push origin feature/my-feature
   ```

4. **Create pull request**
   - Go to GitHub
   - Compare feature branch to main
   - Add description
   - Request review

5. **Merge**
   - Squash commits if needed
   - Delete branch
   - Deploy to production

---

## Troubleshooting

### Common Issues

#### Issue: `npm install` fails

```bash
# Solution 1: Clear cache
npm cache clean --force
npm install

# Solution 2: Use legacy peer deps
npm install --legacy-peer-deps

# Solution 3: Check Node version
node --version  # Should be 18.x+
```

#### Issue: Port 3000 already in use

```bash
# Solution: Use different port
npm run dev -- --port 3001
```

#### Issue: TypeScript errors

```bash
# Solution: Type check before building
npx tsc --noEmit

# Fix all errors before committing
```

#### Issue: Extension not reloading

```
1. Go to chrome://extensions
2. Find Edgtec extension
3. Click the refresh icon
4. Reload page in browser
```

#### Issue: API calls failing

```bash
# Check environment variables
cat .env.local

# Verify API is running
curl http://localhost:3000/api/trends?keyword=test

# Check browser network tab (F12 → Network)
```

### Getting Help

1. **Check documentation** - README, INSTALLATION, guides
2. **Search GitHub issues** - Similar problems may be solved
3. **Review code examples** - Look at similar components
4. **Check browser console** - Specific error messages
5. **Open GitHub issue** - Include error trace and steps to reproduce

---

## Resources

### Internal Documentation
- [README.md](../README.md) - Project overview
- [PRODUCTION_SETUP.md](../PRODUCTION_SETUP.md) - Deployment guide
- [extension/README.md](../extension/README.md) - Extension guide
- [ROADMAP.md](../ROADMAP.md) - Feature roadmap

### External Resources
- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Chrome Extension API](https://developer.chrome.com/docs/extensions/)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

---

## Quick Commands

```bash
# Development
npm run dev              # Start dev server

# Building
npm run build            # Production build
npm run preview          # Preview production build

# Setup
npm run setup            # Interactive setup
npm run verify           # Verify setup

# Utilities
npm install              # Install dependencies
npm update               # Update dependencies
npm audit                # Check for vulnerabilities

# Git
git status               # Check changes
git log --oneline -5     # Last 5 commits
git diff                 # View changes
```

---

**Need help?** Check the issue tracker or documentation files!

**Want to contribute?** See [ROADMAP.md](../ROADMAP.md) for features to work on!

**Found a bug?** Create an issue with reproduction steps and error logs!

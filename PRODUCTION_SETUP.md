# Edgtec-Trends Production Setup Guide

## Overview
This guide walks through setting up Edgtec-Trends for production deployment with full YouTube Data API, Google Trends, and LLM integrations.

## Prerequisites
- Node.js 18+ and npm
- A Google Cloud project
- A domain name (or Vercel/Netlify preview URL for testing)
- (Optional) OpenAI, Anthropic, or Groq API key for LLM Action Pack generation

---

## Step 1: Google Cloud Project Setup

### 1.1 Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a Project** → **New Project**
3. Name: `edgtec-trends` (or your preferred name)
4. Click **Create**

### 1.2 Enable Required APIs
1. In the Cloud Console, go to **APIs & Services** → **Library**
2. Search for and enable:
   - **YouTube Data API v3**
   - **Google Trends API** (if available; otherwise use third-party wrappers)
3. Click **Enable** for each

### 1.3 Create OAuth 2.0 Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client ID**
3. Choose **Web Application**
4. Set **Authorized redirect URIs**:
   - For local development: `http://localhost:3000/api/youtube/auth`
   - For production: `https://your-domain.com/api/youtube/auth`
   - For Vercel: `https://your-vercel-project.vercel.app/api/youtube/auth`
5. Click **Create**
6. Copy the **Client ID** and **Client Secret** — you'll need these

### 1.4 Create an API Key (for server-side calls)
1. Go to **Credentials**
2. Click **Create Credentials** → **API Key**
3. Restrict the key to YouTube Data API v3
4. Copy the **API Key**

---

## Step 2: Local Development Setup

### 2.1 Clone and Install
```bash
cd /path/to/your/workspace
git clone https://github.com/Akhathuto/Edgtec-Trends.git
cd Edgtec-Trends
npm install
```

### 2.2 Configure Environment Variables
1. Copy the example file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and fill in your credentials:
   ```env
   # YouTube OAuth Configuration
   YOUTUBE_CLIENT_ID=your_client_id_from_step_1_3
   YOUTUBE_CLIENT_SECRET=your_client_secret_from_step_1_3
   YOUTUBE_REDIRECT_URI=http://localhost:3000/api/youtube/auth
   YOUTUBE_API_KEY=your_api_key_from_step_1_4

   # (Optional) LLM Provider for Action Pack Generation
   OPENAI_API_KEY=sk-...  # If using OpenAI
   # ANTHROPIC_API_KEY=... # If using Claude
   # GROQ_API_KEY=...      # If using Groq

   # Frontend (must be NEXT_PUBLIC_)
   NEXT_PUBLIC_YOUTUBE_CLIENT_ID=your_client_id_from_step_1_3
   ```

3. **Important**: Add `.env.local` to `.gitignore` (already done, but verify):
   ```bash
   echo ".env.local" >> .gitignore
   ```

### 2.3 Start Development Server
```bash
npm run dev
```
Navigate to `http://localhost:3000` and test the YouTube Analytics feature.

---

## Step 3: Production Deployment

### 3.1 Deploy to Vercel (Recommended)

#### A. Connect GitHub to Vercel
1. Go to [Vercel](https://vercel.com/)
2. Sign in with GitHub
3. Click **New Project**
4. Select `Akhathuto/Edgtec-Trends` repository
5. Click **Import**

#### B. Configure Environment Variables
1. In Vercel project settings, go to **Settings** → **Environment Variables**
2. Add all variables from your `.env.local`:
   - `YOUTUBE_CLIENT_ID`
   - `YOUTUBE_CLIENT_SECRET`
   - `YOUTUBE_REDIRECT_URI` = `https://your-vercel-project.vercel.app/api/youtube/auth`
   - `YOUTUBE_API_KEY`
   - `OPENAI_API_KEY` (if applicable)
   - `NEXT_PUBLIC_YOUTUBE_CLIENT_ID`

3. Click **Save**

#### C. Update Google Cloud OAuth Redirect URI
1. Go to Google Cloud Console → **APIs & Services** → **Credentials**
2. Edit your OAuth 2.0 Client ID
3. Add the Vercel URL to **Authorized redirect URIs**:
   ```
   https://your-vercel-project.vercel.app/api/youtube/auth
   ```

#### D. Deploy
1. Vercel will automatically build and deploy on push to `main`
2. Test OAuth flow at `https://your-vercel-project.vercel.app`

### 3.2 Deploy to Other Platforms

#### Docker (for self-hosted or cloud platforms)
1. Create a `Dockerfile` in the project root:
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. Build and push:
   ```bash
   docker build -t edgtec-trends:latest .
   docker push your-registry/edgtec-trends:latest
   ```

3. Deploy to your platform (AWS, GCP, DigitalOcean, etc.)
4. Set environment variables via platform UI or `.env` file

#### AWS Amplify / AWS Lambda + Next.js
1. Install Amplify CLI: `npm install -g @aws-amplify/cli`
2. Initialize: `amplify init`
3. Configure environment variables in AWS Systems Manager Parameter Store
4. Deploy: `amplify publish`

---

## Step 4: Test OAuth Flow

1. Navigate to your app (local or production)
2. Go to the **Dashboard** tab
3. Click **YouTube Analytics** toggle
4. Click **🔗 Connect YouTube Account**
5. You'll be redirected to Google login
6. Grant permissions for YouTube access
7. You'll be redirected back and channel metrics will load

---

## Step 5: Configure LLM for Action Pack Generation (Optional)

Choose one LLM provider and add its API key to `.env.local`:

### OpenAI (GPT-4)
```bash
export OPENAI_API_KEY=sk-...
```

### Anthropic (Claude)
```bash
export ANTHROPIC_API_KEY=sk-ant-...
```

### Groq (Fast & Cheap)
```bash
export GROQ_API_KEY=gsk_...
```

Then uncomment the appropriate LLM integration in `app/api/action-pack/route.ts`.

---

## Step 6: Monitor and Maintain

### API Quotas
- **YouTube Data API**: 10,000 units/day (free tier)
- **Google Cloud**: Monitor usage in Cloud Console → **APIs & Services** → **Quotas**

### Logs
- **Vercel**: View real-time logs in Vercel Dashboard
- **Local**: Check terminal output
- **Docker**: `docker logs container-id`

### Security Best Practices
1. **Rotate credentials** every 90 days
2. **Enable Cloud Audit Logging** in Google Cloud Console
3. **Use environment variables** (never hardcode secrets)
4. **Enable HTTPS** (automatic on Vercel)
5. **Rate limit API calls** (add middleware to `app/api/` routes)

---

## Step 7: Troubleshooting

### "OAuth token exchange failed"
- Verify `YOUTUBE_CLIENT_ID` and `YOUTUBE_CLIENT_SECRET` are correct
- Check that redirect URI matches exactly (including protocol and port)
- Ensure credentials are set in Vercel/platform environment variables

### "Failed to fetch metrics"
- Verify `YOUTUBE_API_KEY` is set and enabled for YouTube Data API
- Check YouTube Data API quota hasn't been exceeded
- Try with a different YouTube channel

### "Action Pack API returns template instead of LLM output"
- Verify LLM API key is set (e.g., `OPENAI_API_KEY`)
- Uncomment the corresponding LLM function in `app/api/action-pack/route.ts`
- Check LLM API quota and billing

### Large bundle size warning (>500 KB)
- Run: `npm run build` to see breakdown
- Consider code-splitting (see [Bundle Optimization](#bundle-optimization))

---

## Bundle Optimization (Optional)

To reduce JS bundle size, add manual code splitting to `vite.config.ts`:

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'youtube': ['./components/YouTubeAnalytics'],
          'analyzer': ['./components/KeywordBatchAnalyzer'],
          'calendar': ['./components/ContentCalendar'],
        },
      },
    },
  },
});
```

Then rebuild: `npm run build`

---

## Next Steps

1. **Collaboration Backend**: Add a REST API for team sharing and approvals
2. **Browser Extension**: Build in-situ insights while browsing
3. **A/B Testing**: Implement title/thumbnail variant tracking
4. **Real-time Alerts**: Serverless cron job for trend spikes
5. **Analytics**: Track user engagement and feature adoption

---

## Support & Issues

For issues or questions:
1. Check GitHub Issues: https://github.com/Akhathuto/Edgtec-Trends/issues
2. Create a new issue with logs and error details
3. Contact: [Your Email/Support Channel]

---

## Resources

- [Google Cloud Console](https://console.cloud.google.com/)
- [YouTube Data API Documentation](https://developers.google.com/youtube/v3)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

# Quick Start Guide

## For Local Development

```bash
# 1. Clone and install
git clone https://github.com/Akhathuto/Edgtec-Trends.git
cd Edgtec-Trends
npm install

# 2. Run setup script (recommended)
npm run setup

# Or manually create .env.local
cp .env.local.example .env.local
# Edit .env.local with your YouTube credentials

# 3. Start development server
npm run dev

# 4. Open http://localhost:3000
```

## For Production (Vercel)

```bash
# 1. Push to GitHub (if not already)
git push origin main

# 2. Go to vercel.com → New Project → Select repo

# 3. Add environment variables in Vercel Settings:
#    - YOUTUBE_CLIENT_ID
#    - YOUTUBE_CLIENT_SECRET
#    - YOUTUBE_API_KEY
#    - YOUTUBE_REDIRECT_URI (https://your-project.vercel.app/api/youtube/auth)
#    - NEXT_PUBLIC_YOUTUBE_CLIENT_ID

# 4. Vercel auto-deploys on git push
```

## For Production (Docker)

```bash
# 1. Create .env.local with credentials

# 2. Build and run
docker-compose up --build

# App runs at http://localhost:3000
```

## Troubleshooting

**"OAuth token exchange failed"**
- Verify YouTube OAuth credentials in .env.local
- Check redirect URI matches Google Cloud config

**"Failed to fetch metrics"**
- Verify YouTube API Key is correct
- Check YouTube Data API quota in Google Cloud Console

**"Action Pack returns template instead of LLM output"**
- Set OPENAI_API_KEY (or other LLM provider)
- Uncomment LLM call in `app/api/action-pack/route.ts`

## Full Documentation

See `PRODUCTION_SETUP.md` for comprehensive setup and deployment guide.

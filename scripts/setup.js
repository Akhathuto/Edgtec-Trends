#!/usr/bin/env node

/**
 * Setup Automation Script for Edgtec-Trends
 * 
 * Usage:
 *   node scripts/setup.js              # Interactive setup
 *   node scripts/setup.js --vercel     # Vercel-specific setup
 *   node scripts/setup.js --docker     # Docker setup
 * 
 * This script:
 * 1. Prompts for required configuration
 * 2. Creates .env.local
 * 3. Validates environment setup
 * 4. Provides deployment instructions
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) => {
  return new Promise((resolve) => rl.question(query, resolve));
};

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[36m',
};

const log = (msg, color = 'reset') => console.log(`${colors[color]}${msg}${colors.reset}`);

const main = async () => {
  log('\n=== Edgtec-Trends Production Setup ===\n', 'blue');

  const args = process.argv.slice(2);
  const mode = args[0] || 'interactive';

  log('Step 1: Verifying Prerequisites...', 'yellow');
  
  // Check Node version
  const nodeVersion = process.version;
  if (!nodeVersion.match(/v1[89]|v2[0-9]/)) {
    log(`⚠️  Node.js 18+ required (you have ${nodeVersion})`, 'yellow');
  } else {
    log(`✓ Node.js ${nodeVersion}`, 'green');
  }

  // Check .env.local.example exists
  const examplePath = path.join(__dirname, '..', '.env.local.example');
  if (!fs.existsSync(examplePath)) {
    log('✗ .env.local.example not found', 'red');
    process.exit(1);
  }
  log('✓ .env.local.example found', 'green');

  log('\nStep 2: Gathering Configuration...\n', 'yellow');

  const config = {
    environment: mode === '--vercel' ? 'vercel' : mode === '--docker' ? 'docker' : 'local',
    youtubeClientId: await question('YouTube OAuth Client ID: '),
    youtubeClientSecret: await question('YouTube OAuth Client Secret: '),
    youtubeApiKey: await question('YouTube API Key: '),
    youtubeRedirectUri: await question(
      'Redirect URI (leave blank for default): '
    ) || 'http://localhost:3000/api/youtube/auth',
  };

  log('\n(Optional) LLM Configuration', 'yellow');
  const useLlm = await question('Enable LLM for Action Packs? (y/n): ');
  
  if (useLlm.toLowerCase() === 'y') {
    log('Choose provider: 1) OpenAI  2) Claude (Anthropic)  3) Groq', 'blue');
    const provider = await question('Provider (1-3): ');
    
    if (provider === '1') {
      config.openaiApiKey = await question('OpenAI API Key (sk-...): ');
    } else if (provider === '2') {
      config.anthropicApiKey = await question('Anthropic API Key (sk-ant-...): ');
    } else if (provider === '3') {
      config.groqApiKey = await question('Groq API Key (gsk_...): ');
    }
  }

  log('\nStep 3: Creating .env.local...\n', 'yellow');

  // Read template
  const template = fs.readFileSync(examplePath, 'utf-8');
  
  // Replace placeholders
  let envContent = template
    .replace('your_client_id_here', config.youtubeClientId)
    .replace('your_client_secret_here', config.youtubeClientSecret)
    .replace('your_api_key_here', config.youtubeApiKey)
    .replace('http://localhost:3000/api/youtube/auth', config.youtubeRedirectUri);

  if (config.openaiApiKey) {
    envContent = envContent.replace('your_openai_key_here', config.openaiApiKey);
  }
  if (config.anthropicApiKey) {
    envContent = envContent.replace('your_claude_key_here', config.anthropicApiKey);
  }
  if (config.groqApiKey) {
    envContent = envContent.replace('your_groq_key_here', config.groqApiKey);
  }

  const envPath = path.join(__dirname, '..', '.env.local');
  fs.writeFileSync(envPath, envContent, 'utf-8');
  log(`✓ .env.local created at ${envPath}`, 'green');

  // Verify .env.local is in .gitignore
  const gitignorePath = path.join(__dirname, '..', '.gitignore');
  let gitignore = fs.readFileSync(gitignorePath, 'utf-8');
  if (!gitignore.includes('.env.local')) {
    gitignore += '\n.env.local\n';
    fs.writeFileSync(gitignorePath, gitignore, 'utf-8');
    log('✓ Added .env.local to .gitignore', 'green');
  }

  log('\nStep 4: Next Steps...\n', 'yellow');
  
  if (config.environment === 'vercel') {
    log('Vercel Setup:', 'blue');
    log('1. Go to Vercel Dashboard → Settings → Environment Variables');
    log('2. Add these variables:');
    log(`   YOUTUBE_CLIENT_ID: ${config.youtubeClientId}`);
    log(`   YOUTUBE_CLIENT_SECRET: ${config.youtubeClientSecret}`);
    log(`   YOUTUBE_API_KEY: ${config.youtubeApiKey}`);
    log(`   YOUTUBE_REDIRECT_URI: ${config.youtubeRedirectUri}`);
    if (config.openaiApiKey) log(`   OPENAI_API_KEY: ${config.openaiApiKey.substring(0, 10)}...`);
    log('3. Update Google Cloud OAuth redirect URI to: ' + config.youtubeRedirectUri);
    log('4. Push to GitHub → Vercel will auto-deploy');
  } else if (config.environment === 'docker') {
    log('Docker Setup:', 'blue');
    log('1. Build: docker build -t edgtec-trends:latest .');
    log('2. Run: docker run -e YOUTUBE_CLIENT_ID=... -p 3000:3000 edgtec-trends:latest');
    log('3. Or use docker-compose (see PRODUCTION_SETUP.md)');
  } else {
    log('Local Development:', 'blue');
    log('1. Run: npm install');
    log('2. Run: npm run dev');
    log('3. Open: http://localhost:3000');
    log('4. Test YouTube Analytics by clicking "Connect YouTube Account"');
  }

  log('\n5. Read full setup guide: cat PRODUCTION_SETUP.md', 'blue');
  log('\n=== Setup Complete! ===\n', 'green');
  
  rl.close();
};

main().catch((err) => {
  log(`Error: ${err.message}`, 'red');
  process.exit(1);
});

#!/usr/bin/env node

/**
 * Verification Script for Edgtec-Trends Setup
 * 
 * Usage:
 *   node scripts/verify.js
 * 
 * Checks:
 * - Environment variables are set
 * - Dependencies are installed
 * - .env.local exists and is valid
 * - Build succeeds
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[36m',
};

const log = (msg, color = 'reset') => console.log(`${colors[color]}${msg}${colors.reset}`);

const verify = async () => {
  log('\n=== Edgtec-Trends Setup Verification ===\n', 'blue');

  let passed = 0;
  let failed = 0;

  // Check 1: .env.local exists
  log('Checking 1/6: .env.local file...', 'yellow');
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    log('✓ .env.local exists', 'green');
    passed++;
  } else {
    log('✗ .env.local not found (run: npm run setup)', 'red');
    failed++;
  }

  // Check 2: Environment variables
  log('Checking 2/6: Environment variables...', 'yellow');
  const requiredVars = [
    'YOUTUBE_CLIENT_ID',
    'YOUTUBE_CLIENT_SECRET',
    'YOUTUBE_API_KEY',
    'YOUTUBE_REDIRECT_URI',
  ];

  const envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : '';
  let envValid = true;

  requiredVars.forEach((varName) => {
    if (envContent.includes(`${varName}=`) && !envContent.includes(`${varName}=your_`)) {
      log(`  ✓ ${varName}`, 'green');
      passed++;
    } else {
      log(`  ✗ ${varName} not set or using placeholder`, 'red');
      envValid = false;
      failed++;
    }
  });

  if (!envValid) {
    log('Run: npm run setup', 'yellow');
  }

  // Check 3: Node modules installed
  log('Checking 3/6: Dependencies installed...', 'yellow');
  const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
  if (fs.existsSync(nodeModulesPath)) {
    log('✓ node_modules exists', 'green');
    passed++;
  } else {
    log('✗ node_modules not found (run: npm install)', 'red');
    failed++;
  }

  // Check 4: Required files
  log('Checking 4/6: Required files...', 'yellow');
  const requiredFiles = [
    'app/api/youtube/auth/route.ts',
    'app/api/youtube/metrics/route.ts',
    'app/api/trends/route.ts',
    'components/YouTubeAnalytics.tsx',
    'components/KeywordBatchAnalyzer.tsx',
  ];

  requiredFiles.forEach((file) => {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
      log(`  ✓ ${file}`, 'green');
      passed++;
    } else {
      log(`  ✗ ${file} missing`, 'red');
      failed++;
    }
  });

  // Check 5: Git configuration
  log('Checking 5/6: Git setup...', 'yellow');
  try {
    const gitignore = fs.readFileSync(path.join(__dirname, '..', '.gitignore'), 'utf-8');
    if (gitignore.includes('.env.local')) {
      log('✓ .env.local in .gitignore', 'green');
      passed++;
    } else {
      log('⚠ .env.local not in .gitignore (add it!)', 'yellow');
      failed++;
    }
  } catch (e) {
    log('⚠ Could not verify .gitignore', 'yellow');
  }

  // Check 6: Build test
  log('Checking 6/6: Build validation...', 'yellow');
  try {
    log('  Running: npm run build', 'blue');
    execSync('npm run build', { stdio: 'pipe' });
    log('  ✓ Build successful', 'green');
    passed++;
  } catch (e) {
    log('  ✗ Build failed', 'red');
    log(`  Error: ${e.message.split('\n')[0]}`, 'red');
    failed++;
  }

  // Summary
  log('\n=== Summary ===', 'yellow');
  log(`Passed: ${passed}`, 'green');
  log(`Failed: ${failed}`, failed > 0 ? 'red' : 'green');

  if (failed === 0) {
    log('\n✓ All checks passed! Ready for development.', 'green');
    log('Start dev server: npm run dev\n', 'blue');
    process.exit(0);
  } else {
    log('\n✗ Some checks failed. See above for details.\n', 'red');
    process.exit(1);
  }
};

verify().catch((err) => {
  log(`Error: ${err.message}`, 'red');
  process.exit(1);
});

#!/usr/bin/env node

/**
 * Simple icon generator for Edgtec extension
 * Generates SVG icons and exports as PNG
 * 
 * Prerequisites: None (uses only Node.js SVG-to-PNG if available)
 * Fallback: Creates placeholder PNG files
 */

const fs = require('fs');
const path = require('path');

const extensionDir = path.join(__dirname, '..');
const imagesDir = path.join(extensionDir, 'images');

// Create images directory if it doesn't exist
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
  console.log(`✓ Created ${imagesDir}`);
}

// SVG template for Edgtec icon (minimal 📊 trends symbol)
const generateSVG = (size) => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#60a5fa;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
    </linearGradient>
  </defs>
  <!-- Background -->
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="#0f172a"/>
  <!-- Trend bars -->
  <rect x="${size * 0.15}" y="${size * 0.55}" width="${size * 0.15}" height="${size * 0.3}" fill="url(#grad)" rx="2"/>
  <rect x="${size * 0.40}" y="${size * 0.35}" width="${size * 0.15}" height="${size * 0.5}" fill="url(#grad)" rx="2"/>
  <rect x="${size * 0.65}" y="${size * 0.15}" width="${size * 0.15}" height="${size * 0.7}" fill="url(#grad)" rx="2"/>
  <!-- Trend line -->
  <polyline points="${size * 0.15},${size * 0.55} ${size * 0.40},${size * 0.35} ${size * 0.65},${size * 0.15} ${size * 0.90},${size * 0.25}" 
            stroke="#10b981" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

// Create PNG placeholder (1x1 blue pixel, can be replaced with real PNG)
const createPlaceholderPNG = () => {
  // Minimal valid PNG (1x1 blue pixel)
  // This is a base64-encoded 1x1 PNG for placeholder purposes
  const buffer = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
    0xde, 0x00, 0x00, 0x00, 0x0c, 0x49, 0x44, 0x41,
    0x54, 0x08, 0x99, 0x63, 0x60, 0xa0, 0x2b, 0x00,
    0x00, 0x00, 0x26, 0x00, 0x01, 0x1e, 0x2b, 0x79,
    0xfb, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e,
    0x44, 0xae, 0x42, 0x60, 0x82
  ]);
  return buffer;
};

// Generate icons for different sizes
const sizes = [16, 48, 128];

sizes.forEach(size => {
  const svgFile = path.join(imagesDir, `icon-${size}.svg`);
  const pngFile = path.join(imagesDir, `icon-${size}.png`);
  
  // Write SVG
  fs.writeFileSync(svgFile, generateSVG(size), 'utf8');
  console.log(`✓ Generated ${svgFile}`);
  
  // Write placeholder PNG (can be replaced with real conversion)
  // For production, use: https://www.npmjs.com/package/sharp or similar
  fs.writeFileSync(pngFile, createPlaceholderPNG());
  console.log(`✓ Generated ${pngFile} (placeholder - replace with real PNG)`);
});

console.log(`
✓ Icon generation complete!

Note: Placeholder PNG files have been created. For production:
1. Install: npm install --save-dev sharp
2. Convert SVGs to PNG: npx sharp icon-*.svg -o icon-%i.png
3. Or use an online converter: https://convertio.co/svg-png/

Icon files created:
${sizes.map(s => `  - images/icon-${s}.png (and .svg)`).join('\n')}
`);

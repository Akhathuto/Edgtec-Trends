# Edgtec Browser Extension - Installation Guide

## Quick Start (5 minutes)

### Chrome / Chromium / Brave / Edge

1. **Open Extensions Manager**
   - Chrome/Brave: `chrome://extensions`
   - Edge: `edge://extensions`

2. **Enable Developer Mode**
   - Toggle "Developer mode" in the top right corner

3. **Load Extension**
   - Click "Load unpacked"
   - Select the `extension/` folder from this project
   - The Edgtec icon should appear in your toolbar

4. **Verify Installation**
   - Visit any YouTube video page (https://www.youtube.com/watch?v=...)
   - The Edgtec icon in your toolbar should show
   - Click it to open the popup

## Detailed Installation Steps

### Prerequisites

- Chrome/Edge browser (v88+)
- Edgtec app running locally or deployed

### Step 1: Prepare Extension Files

```bash
cd Edgtec-Trends
# All extension files are already in the extension/ folder:
# ├── manifest.json
# ├── popup.html
# ├── popup.js
# ├── popup.css
# ├── background.js
# ├── content-youtube.js
# ├── content-tiktok.js
# ├── content.css
# ├── images/
# │   ├── icon-16.png/svg
# │   ├── icon-48.png/svg
# │   └── icon-128.png/svg
# └── README.md
```

### Step 2: Configure App URL (Optional)

By default, the extension looks for Edgtec at `http://localhost:3000`.

To change this:
1. Click the extension icon
2. Go to "Settings" tab
3. Enter your Edgtec app URL
4. Click "Save Settings"

### Step 3: Start Using

**On YouTube:**
1. Visit any YouTube video page
2. Click the Edgtec icon to see trends
3. Click "Add to Calendar" to export

**On TikTok:**
1. Visit any TikTok video
2. Click the Edgtec icon
3. Fill export form and save to calendar

**Using Context Menu:**
1. Right-click any YouTube/TikTok page
2. Select "Export to Edgtec Calendar"

## Troubleshooting

### Extension Won't Load

**Issue:** "Pack extension directory not found" or similar error

**Solution:**
- Ensure you're pointing to the `extension/` folder, not the parent folder
- Check that `manifest.json` exists in the folder you selected
- Try removing and reloading the extension

### Content Scripts Not Working

**Issue:** Extension icon works but insights don't appear on YouTube/TikTok

**Solution:**
1. Refresh the page (Ctrl+R)
2. Check browser console (F12 → Console tab) for errors
3. Verify you're on youtube.com or tiktok.com (not shortcuts)
4. Try re-enabling extension: DevTools → Disable/Enable Edgtec

### API Errors

**Issue:** "Error loading trend data" in popup

**Solution:**
1. Ensure Edgtec app is running: `npm run dev`
2. Check that Settings URL is correct (default: http://localhost:3000)
3. Open browser console and check CORS errors
4. Verify network request in DevTools (F12 → Network tab)

### Icons Not Displaying

**Issue:** Extension shows blank icon or default puzzle piece

**Solution:**
1. Icons are in `extension/images/` folder
2. Verify files exist: `icon-16.png`, `icon-48.png`, `icon-128.png`
3. Try regenerating icons:
   ```bash
   cd extension
   node generate-icons.js
   ```
4. Reload extension in DevTools

## Testing Locally

### 1. Start Edgtec App

```bash
npm install
npm run dev
# Opens at http://localhost:3000
```

### 2. Load Extension in Chrome

```
chrome://extensions → Load unpacked → select extension/ folder
```

### 3. Test on Sample Videos

- YouTube: Visit https://www.youtube.com/watch?v=dQw4w9WgXcQ
- TikTok: Visit https://www.tiktok.com/@tiktok/video/7106157150499462410

### 4. Check Console for Errors

- Right-click extension → "Inspect popup" (popup.js issues)
- Right-click page → "Inspect" (content script issues)
- Chrome DevTools Network tab (API call errors)

## Development Workflow

### Making Changes

1. Edit extension files (e.g., `popup.js`, `content-youtube.js`)
2. Go to `chrome://extensions`
3. Click the **Reload** button for Edgtec
4. Refresh your video page to see changes

### Debugging Tips

```javascript
// In content scripts, use console.log:
console.log('YouTube info:', extractYouTubeInfo());

// In popup.js, right-click → Inspect popup to see logs
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message from content script:', request);
  sendResponse({ success: true });
});

// Service worker (background.js) logs visible at:
// chrome://extensions → click "service worker" for Edgtec
```

### DevTools Features

- **Popup Debugging:** Right-click Edgtec icon → "Inspect popup"
- **Content Script Debugging:** Right-click page → "Inspect" → "Sources" tab
- **Network Monitoring:** F12 → Network tab (see API calls)
- **Storage Inspection:** F12 → Application → Storage → Extension

## Advanced Configuration

### Custom API Endpoint

Settings are stored in `chrome.storage.sync`:

```javascript
// To programmatically set URL:
chrome.storage.sync.set({
  appUrl: "https://my-custom-domain.com"
});
```

### Disable Trend Widget on Page

Toggle in Settings → "Show trend scores on page"

Or programmatically:

```javascript
chrome.storage.sync.set({ showTrends: false });
```

## Deployment

### For Chrome Web Store

1. Package extension:
   ```bash
   zip -r edgtec-extension.zip extension/
   ```

2. Upload to [Chrome Web Store Developer](https://chrome.google.com/webstore/devconsole/)

3. Complete app listing with:
   - Detailed description
   - Screenshots (1280x800)
   - Privacy policy
   - Support website

### For Self-Hosting

1. Host `extension/` folder on your server
2. Configure manifest for your domain
3. Users install via `https://your-domain.com/install`

## Icon Customization

To replace placeholder icons:

```bash
# Install image converter
npm install --save-dev sharp

# Convert SVG to PNG (requires Ghostscript)
npx sharp extension/images/icon-*.svg -o extension/images/icon-%i.png

# Or use online converter:
# https://convertio.co/svg-png/
# 1. Upload icon-128.svg
# 2. Export as PNG
# 3. Repeat for 16x16 and 48x48
```

## Performance Optimization

### Reduce Extension Size

- Minify JavaScript (use webpack/terser)
- Optimize PNG icons
- Remove unused dependencies

### Optimize Content Scripts

- Only inject widget on watch pages (already done)
- Cache API responses in chrome.storage
- Debounce mutation observers

### Reduce API Calls

- Cache trend data for 1 hour
- Batch requests to server
- Use chrome.storage for offline mode

## Security Best Practices

1. **Never store API keys in extension code**
   - Use backend proxy instead
   - Store in `.env` and reference at runtime

2. **Validate all external input**
   - Sanitize video titles before displaying
   - Validate API responses

3. **Use HTTPS only**
   - Set in host_permissions
   - Use `https://` URLs in Settings

4. **Review permissions**
   - Only request what's needed
   - Consider content script permissions carefully

## Support

### Common Issues Quick Reference

| Problem | Solution |
|---------|----------|
| Extension won't load | Check manifest.json syntax, reload Chrome |
| Content scripts fail | Refresh page, check console for errors |
| Insights don't appear | Start Edgtec app, verify URL in Settings |
| Icons missing | Regenerate with `node generate-icons.js` |
| API calls timeout | Check network, verify app running |

### Getting Help

1. Check [README.md](./README.md) in extension folder
2. Review console errors (F12 → Console)
3. Check Chrome extension [FAQ](https://support.google.com/chrome_webstore/answer/9047223)
4. Open GitHub issue with error details

## Next Steps

After installation:
1. ✅ Configure your Edgtec app URL
2. ✅ Test on a YouTube video
3. ✅ Try exporting to calendar
4. ✅ Customize settings for your workflow
5. ✅ Share extension with team members

---

**Extension Version:** 1.0.0  
**Compatibility:** Chrome 88+, Edge 88+, Brave 1.0+  
**Last Updated:** 2024  
**Support:** GitHub Issues or support@edgtec.com

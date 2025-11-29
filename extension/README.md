# Edgtec Browser Extension

In-situ trend insights while browsing YouTube and TikTok.

## Features

- **Real-time Trend Analysis**: See trend scores and direction for video content
- **Video Insights**: Extract channel, view count, and engagement metrics
- **Export to Calendar**: Save video ideas directly to Edgtec Content Calendar
- **Quick Actions**: Right-click context menu for fast export
- **Settings**: Configure app URL and personalize insights display

## Installation

### For Development

1. Navigate to `chrome://extensions` or `edge://extensions`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `extension/` folder from this project
5. The extension icon should appear in your toolbar

### For Production

1. Build and test locally (see Development section)
2. Package as `.crx` file
3. Submit to Chrome Web Store or Microsoft Edge Add-ons

## Usage

### Popup Interface

1. **Insights Tab**: 
   - Displays current video information and trend score
   - Shows related searches and trend direction
   - One-click export to calendar

2. **Export Tab**:
   - Add to calendar with custom title, description, tags
   - Schedule publication time
   - Optionally set urgency level

3. **Settings Tab**:
   - Configure Edgtec app URL (default: `http://localhost:3000`)
   - Toggle automatic metadata extraction
   - Toggle trend score display

### Context Menu

Right-click on YouTube/TikTok pages:
- Select "Export to Edgtec Calendar" for quick export

### Keyboard Shortcuts

_Not yet implemented, planned for future version_

## Configuration

Settings are saved in `chrome.storage.sync` and available across all Chrome profiles.

```javascript
{
  appUrl: "http://localhost:3000",         // Edgtec app URL
  autoExtract: true,                        // Auto-extract video metadata
  showTrends: true                          // Show trend widget on page
}
```

## Architecture

### Files

- **manifest.json**: Manifest v3 configuration, permissions, content scripts
- **popup.html**: Popup UI (tabbed interface)
- **popup.js**: Popup event handlers, API integration
- **popup.css**: Popup styling
- **background.js**: Service worker (message routing, cache management)
- **content-youtube.js**: YouTube page content script
- **content-tiktok.js**: TikTok page content script
- **content.css**: Injected widget styling
- **images/**: Extension icons (16, 48, 128 px)

### Message Flow

```
┌─────────────────────────────────────────────────┐
│             User Interaction                     │
│  (Popup click, page load, context menu)        │
└────────────────┬────────────────────────────────┘
                 │
         ┌───────▼──────────┐
         │   Popup.js       │
         │  (UI Handler)    │
         └───────┬──────────┘
                 │
         ┌───────▼──────────────┐
         │  Background.js       │
         │ (Message Router)     │
         └───────┬──────────────┘
                 │
    ┌────────────┼────────────┐
    │            │            │
  YouTube    TikTok      Cache/Storage
Content     Content
Script      Script
```

### API Integration

- **GET `/api/trends?keyword=...`**: Fetch trend score and direction
- **POST `/api/action-pack`**: Generate action pack suggestions
- **POST `/api/calendar`**: Save to calendar (optional backend)

## Development

### Local Testing

1. Make changes to extension files
2. Go to `chrome://extensions`
3. Click "Reload" on the Edgtec extension card
4. Visit YouTube or TikTok to test

### Debugging

- **Popup Errors**: Right-click extension icon → "Inspect popup"
- **Content Script Errors**: Right-click page → "Inspect" → Console
- **Background Worker**: `chrome://extensions` → Click "service worker" link for Edgtec

### Build & Package

```bash
# Create distribution package (manual for now)
zip -r edgtec-extension.zip extension/
```

## Permissions Explained

| Permission | Use Case |
|-----------|----------|
| `activeTab` | Access current tab URL and metadata |
| `scripting` | Execute content scripts on pages |
| `storage` | Save user settings and cache |
| `host_permissions` | Inject widgets on YouTube/TikTok |

## Browser Support

- ✅ Chrome 88+
- ✅ Chromium 88+
- ✅ Microsoft Edge 88+
- ⏳ Firefox (future version 2.0)
- ⏳ Safari (future version 2.0)

## Troubleshooting

### Extension doesn't load
- Ensure Manifest v3 is valid (Chrome DevTools errors)
- Check that all referenced files exist
- Reload extension after file changes

### Content scripts not running
- Check `host_permissions` in manifest.json
- Refresh page after enabling extension
- Verify you're on youtube.com or tiktok.com (not shortcuts)

### API calls failing
- Ensure Edgtec app is running on configured URL
- Check browser Console for CORS errors
- Verify network requests in DevTools Network tab

### Widget not appearing
- Toggle "Show trends" in Settings tab
- Refresh the video page
- Check browser console for JavaScript errors

## Future Enhancements

- [ ] Keyboard shortcuts for quick export
- [ ] Batch export multiple videos
- [ ] Offline mode with local caching
- [ ] Trend prediction graphs
- [ ] A/B title suggestions
- [ ] Competitor video tracking
- [ ] Cross-platform statistics aggregation
- [ ] Team collaboration features
- [ ] Browser history integration
- [ ] Firefox/Safari support

## Support

For issues or feature requests:
1. Check [Troubleshooting](#troubleshooting) section
2. Open issue on GitHub
3. Contact: support@edgtec.com

## License

MIT License - See LICENSE file for details

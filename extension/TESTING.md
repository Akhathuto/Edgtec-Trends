# Browser Extension - Testing & Verification Checklist

## Pre-Installation Checklist

- [ ] Clone/update Edgtec-Trends repository
- [ ] Navigate to project root directory
- [ ] Verify `extension/` folder exists with all files
- [ ] Confirm `extension/manifest.json` is present

## Installation Verification

### Chrome/Edge Installation

- [ ] Open `chrome://extensions` (or `edge://extensions`)
- [ ] Enable "Developer mode" toggle (top right)
- [ ] Click "Load unpacked"
- [ ] Select `extension/` folder from project
- [ ] Edgtec Trends extension appears in list
- [ ] Extension ID displayed (e.g., `mkfnpbbflnhiahccbhhhhfkdnbnbdbkc`)
- [ ] No errors in extension list

### Popup Verification

- [ ] Click Edgtec icon in toolbar → popup appears
- [ ] Popup has three tabs: Insights, Export, Settings
- [ ] Popup dimensions are ~420px wide
- [ ] No JavaScript console errors (right-click → Inspect popup)
- [ ] Settings tab shows default URL: `http://localhost:3000`

## YouTube Testing

### Prerequisites
- [ ] Edgtec app running locally: `npm run dev` (port 3000)
- [ ] Chrome/Edge browser
- [ ] Extension installed and enabled

### Content Script Injection

- [ ] Visit: https://www.youtube.com/watch?v=dQw4w9WgXcQ (any YouTube video)
- [ ] Page loads without errors
- [ ] Check Console for content script initialization
- [ ] No "Refused to execute inline script" errors

### Insights Widget

- [ ] Scroll to video secondary info section
- [ ] "📈 Edgtec Insights" widget appears below video details
- [ ] Widget displays three sections:
  - [ ] Trend Analysis (Trend Score, Direction)
  - [ ] Video Stats (Views, Likes)
  - [ ] Related Searches (sample keywords)
- [ ] "Add to Edgtec Calendar" button visible
- [ ] Trend score: 0-100 range
- [ ] Trend direction: ↑ Rising / ↓ Falling / → Stable

### Popup on YouTube

- [ ] Click extension icon while on YouTube page
- [ ] Insights tab shows:
  - [ ] Video Title (extracted from page)
  - [ ] Channel name (extracted from page)
  - [ ] View count (extracted from page)
  - [ ] Trend Score (from `/api/trends`)
  - [ ] Trend Direction indicator
  - [ ] Related Searches list
- [ ] "Add to Calendar" button works
- [ ] No API errors in Console

### Export Functionality

- [ ] Click "Add to Calendar" (from widget or popup)
- [ ] Switched to Export tab
- [ ] Title pre-filled with video title
- [ ] Enter Description: "Great content idea"
- [ ] Enter Tags: "tutorial, vlog, trending"
- [ ] Set Schedule: Future date/time
- [ ] Click "Export to Calendar"
- [ ] Success message appears: "Added to calendar!"
- [ ] Form clears after 1.5 seconds

## TikTok Testing

### Content Script Injection

- [ ] Visit: https://www.tiktok.com/@tiktok (or any TikTok video)
- [ ] Page loads without errors
- [ ] Check Console for content script initialization

### Insights Widget (TikTok)

- [ ] TikTok insights widget appears on page
- [ ] Layout similar to YouTube but adapted for TikTok
- [ ] Video stats (Views, Likes) displayed
- [ ] Trend score and direction shown
- [ ] "Add to Edgtec Calendar" button visible

### Popup on TikTok

- [ ] Click extension icon on TikTok page
- [ ] Insights tab shows extracted TikTok info
- [ ] Trend data populated from API
- [ ] Export functionality works same as YouTube

## Context Menu Testing

### YouTube Context Menu

- [ ] Right-click on YouTube page
- [ ] "Export to Edgtec Calendar" option visible
- [ ] Click context menu option
- [ ] New tab opens with export form
- [ ] OR: Calendar calendar, video data pre-filled

### TikTok Context Menu

- [ ] Right-click on TikTok page  
- [ ] "Export to Edgtec Calendar" option visible
- [ ] Context menu works as expected

## Settings Testing

### Settings Tab

- [ ] Navigate to Settings tab in popup
- [ ] Auto-extract checkbox visible and functional
- [ ] Show trends checkbox visible and functional
- [ ] App URL field shows current value
- [ ] Change URL to: `http://localhost:5000`
- [ ] Click "Save Settings"
- [ ] Success message: "Settings saved!"
- [ ] Reload extension
- [ ] URL persisted to new value

### Settings Persistence

- [ ] Settings stored in `chrome.storage.sync`
- [ ] Close and reopen popup
- [ ] Settings still present
- [ ] Close and reopen browser
- [ ] Settings still present

## API Integration Testing

### Trends Endpoint

- [ ] Check DevTools Network tab
- [ ] Request to `/api/trends?keyword=...` appears
- [ ] Response includes:
  - [ ] `trendScore` (number 0-100)
  - [ ] `trendDirection` ("up"/"down"/"stable")
  - [ ] `relatedQueries` (array of strings)
- [ ] No 404 or 500 errors
- [ ] Response time < 2 seconds

### Export Endpoint (if applicable)

- [ ] Export form POST request appears in Network
- [ ] Request to `/api/calendar` (or similar)
- [ ] Response: `{ success: true }` or similar
- [ ] No CORS errors

## Background Service Worker Testing

### Service Worker Functionality

- [ ] Go to `chrome://extensions`
- [ ] Click "service worker" link for Edgtec
- [ ] DevTools opens for background script
- [ ] Check Console for any errors
- [ ] Verify message handlers registered:
  - [ ] `openExportTab`
  - [ ] `getVideoInfo`
  - [ ] `cacheVideoInfo`

### Message Passing

- [ ] Popup sends message to content script
- [ ] Content script responds with video info
- [ ] Background worker relays messages correctly
- [ ] No "Cannot access content of content script" errors

## Error Handling Testing

### Missing App URL

- [ ] Clear settings (set URL to empty)
- [ ] Try to fetch trends
- [ ] Should use default: `http://localhost:3000`
- [ ] OR: Show error message clearly

### App Not Running

- [ ] Stop Edgtec app (`npm run dev` → Ctrl+C)
- [ ] Visit YouTube page
- [ ] Try to fetch insights
- [ ] Error message shown: "Error loading trend data"
- [ ] No browser crash

### Invalid Video Page

- [ ] Visit non-video YouTube page: https://www.youtube.com/
- [ ] Extension should not break
- [ ] Popup shows: "This extension works on YouTube and TikTok..."
- [ ] No console errors

### Network Throttling

- [ ] DevTools → Network tab → Throttle to "Slow 3G"
- [ ] Refresh page
- [ ] Widget shows loading state
- [ ] Eventually loads or shows timeout error

## UI/UX Testing

### Popup Appearance

- [ ] Popup width: ~420px
- [ ] Popup height: ~600px (scrollable)
- [ ] Dark theme: Blue (#60a5fa) accents on dark background
- [ ] Font sizes appropriate and readable
- [ ] Icons/emojis display correctly

### Widget Appearance (YouTube)

- [ ] Widget positioned in secondary info section
- [ ] Gradient background visible
- [ ] Text contrast adequate (WCAG AA)
- [ ] Buttons have hover states
- [ ] Close button (×) functional
- [ ] Widget can be dismissed and doesn't re-inject

### Widget Appearance (TikTok)

- [ ] Widget appears inline on TikTok page
- [ ] No layout shift or page jumping
- [ ] Z-index appropriate (visible above content)
- [ ] Responsive on mobile browser view

### Animations

- [ ] Widget slides in smoothly
- [ ] Button hover effects visible
- [ ] Loading spinner animates (pulse effect)
- [ ] No jank or stuttering

## Accessibility Testing

- [ ] Tab navigation works in popup
- [ ] Focus indicators visible
- [ ] Color not sole means of conveying info
- [ ] Text contrast meets WCAG standards
- [ ] Screen reader compatible (basic check)

## Performance Testing

### Load Time

- [ ] Content script injection: < 200ms
- [ ] API call response: < 2s
- [ ] Widget render: < 500ms
- [ ] No noticeable lag on page

### Memory Usage

- [ ] Chrome DevTools → Memory tab
- [ ] Extension memory < 50MB
- [ ] No memory leaks on repeated page loads
- [ ] Cache cleanup works (old entries removed)

### Bundle Size

- [ ] popup.js: < 50KB
- [ ] content scripts combined: < 30KB
- [ ] Total extension size: < 150KB

## Browser Compatibility

### Chrome

- [ ] Install and test on Chrome 90+
- [ ] All features working
- [ ] No version-specific errors

### Chromium-based Browsers

- [ ] **Edge** (latest): ✅ Test
- [ ] **Brave** (latest): ✅ Test
- [ ] **Opera** (latest): ✅ Test

### Firefox (Future)

- [ ] [ ] Manifest v2 version needed
- [ ] [ ] Test in Firefox Developer Edition

## Security Testing

### Permissions Review

- [ ] Only necessary permissions requested
- [ ] `host_permissions` limited to YouTube/TikTok
- [ ] No overly broad permissions

### Input Validation

- [ ] Video title sanitized before display
- [ ] No XSS vulnerabilities
- [ ] User input escaped in export form

### HTTPS Enforcement

- [ ] All external API calls use HTTPS
- [ ] localhost:3000 allowed for development only
- [ ] Production should use HTTPS only

### Data Privacy

- [ ] Settings stored locally (not sent to server)
- [ ] No personal data collected
- [ ] Cache data cleared on uninstall

## Deployment Readiness

### File Structure

- [ ] `extension/manifest.json` - ✅ Present
- [ ] `extension/popup.html` - ✅ Present
- [ ] `extension/popup.js` - ✅ Present
- [ ] `extension/popup.css` - ✅ Present
- [ ] `extension/background.js` - ✅ Present
- [ ] `extension/content-youtube.js` - ✅ Present
- [ ] `extension/content-tiktok.js` - ✅ Present
- [ ] `extension/content.css` - ✅ Present
- [ ] `extension/images/` folder - ✅ Present (icon-16, 48, 128)
- [ ] `extension/README.md` - ✅ Present
- [ ] `extension/INSTALLATION.md` - ✅ Present

### Documentation

- [ ] README.md explains features and installation
- [ ] INSTALLATION.md has step-by-step guide
- [ ] Code comments explain complex logic
- [ ] Error messages are user-friendly

### Version

- [ ] `manifest.json` version: 1.0.0
- [ ] Git tag created: `v1.0.0`
- [ ] Changelog updated

## Final Checklist

- [ ] All tests passed
- [ ] No console errors
- [ ] No security issues
- [ ] No performance issues
- [ ] Code committed to git
- [ ] README and docs complete
- [ ] Ready for distribution

---

## Bug Report Template

If issues found, use this template:

```
**Feature:** [Popup/Widget/Export]
**OS:** [Windows/Mac/Linux]
**Browser:** [Chrome/Edge/Brave + version]
**Steps to Reproduce:**
1. ...
2. ...
3. ...
**Expected:** ...
**Actual:** ...
**Console Error:** [paste error if any]
**Screenshot:** [attach if applicable]
```

---

**Last Updated:** 2024
**Extension Version:** 1.0.0
**Test Environment:** Chrome 120+, Windows 10+

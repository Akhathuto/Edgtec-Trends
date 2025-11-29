// Background service worker

// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openExportTab') {
    handleExportTab(request.data, sendResponse);
  } else if (request.action === 'cacheVideoInfo') {
    cacheVideoInfo(request.data, sendResponse);
  } else if (request.action === 'getAppUrl') {
    getAppUrl(sendResponse);
  }
  return true; // Keep channel open for async responses
});

// Handle opening export tab
function handleExportTab(videoData, sendResponse) {
  chrome.storage.sync.get(['appUrl'], (data) => {
    const appUrl = data.appUrl || 'http://localhost:3000';
    
    // Store video data temporarily for export tab to retrieve
    chrome.storage.session.set({ lastVideoForExport: videoData }, () => {
      // Open export tab in the app
      chrome.tabs.create({
        url: `${appUrl}?export=video&video=${encodeURIComponent(JSON.stringify(videoData))}`,
        active: true,
      }, (tab) => {
        sendResponse({ success: true, tabId: tab.id });
      });
    });
  });
}

// Cache video info for quick access
function cacheVideoInfo(videoData, sendResponse) {
  chrome.storage.session.set({
    lastVideoInfo: videoData,
    lastVideoInfoTime: Date.now(),
  }, () => {
    sendResponse({ success: true });
  });
}

// Get app URL from storage
function getAppUrl(sendResponse) {
  chrome.storage.sync.get(['appUrl'], (data) => {
    sendResponse({ appUrl: data.appUrl || 'http://localhost:3000' });
  });
}

// Handle installation/update
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Open welcome/setup page
    chrome.tabs.create({ url: 'chrome-extension://' + chrome.runtime.id + '/popup.html' });
  }
});

// Create context menu items for quick export
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'export-to-edgtec',
    title: 'Export to Edgtec Calendar',
    contexts: ['page'],
    documentUrlPatterns: ['*://youtube.com/*', '*://www.youtube.com/*', '*://tiktok.com/*', '*://www.tiktok.com/*'],
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'export-to-edgtec') {
    // Send message to content script to extract video info and open export
    chrome.tabs.sendMessage(tab.id, { action: 'getVideoInfo' }, (response) => {
      if (response) {
        chrome.runtime.sendMessage({ action: 'openExportTab', data: response });
      }
    });
  }
});

// Keep track of active trends queries to batch them
const trendsCache = new Map();

// Periodically clean up old cache entries (older than 1 hour)
setInterval(() => {
  const now = Date.now();
  const oneHourAgo = now - (60 * 60 * 1000);
  
  trendsCache.forEach((value, key) => {
    if (value.timestamp < oneHourAgo) {
      trendsCache.delete(key);
    }
  });
}, 30 * 60 * 1000); // Clean every 30 minutes

// Listen for notifications from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateTrend') {
    updateTrendCache(request.keyword, request.trendData, sendResponse);
  }
  return true;
});

function updateTrendCache(keyword, trendData, sendResponse) {
  trendsCache.set(keyword, {
    data: trendData,
    timestamp: Date.now(),
  });
  sendResponse({ success: true });
}

// YouTube content script - Extract video information and inject insights

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getVideoInfo') {
    sendResponse(extractYouTubeInfo());
  }
});

function extractYouTubeInfo() {
  try {
    // Extract video title
    const titleElement = document.querySelector('h1.title.ytd-video-primary-info-renderer yt-formatted-string');
    const title = titleElement?.textContent?.trim() || document.title;
    
    // Extract channel name
    const channelElement = document.querySelector('ytd-channel-name a#channel-name');
    const channel = channelElement?.textContent?.trim() || '';
    
    // Extract view count
    const viewsElement = document.querySelector('ytd-video-view-count-renderer span.view-count');
    const viewsText = viewsElement?.textContent?.trim() || '';
    const views = viewsText.split(' ')[0];
    
    // Extract video URL
    const videoUrl = window.location.href;
    const videoId = extractVideoId(videoUrl);
    
    // Extract upload date
    const uploadDateElement = document.querySelector('span.date.style-scope.yt-formatted-string');
    const uploadDate = uploadDateElement?.textContent?.trim() || '';
    
    // Extract like count if visible
    const likeElement = document.querySelector('yt-formatted-string[aria-label*="like"]');
    const likes = likeElement?.textContent?.trim() || '';
    
    return {
      videoTitle: title,
      videoChannel: channel,
      videoViews: views,
      videoId: videoId,
      videoUrl: videoUrl,
      uploadDate: uploadDate,
      likes: likes,
      platform: 'youtube',
    };
  } catch (error) {
    console.error('Error extracting YouTube info:', error);
    return {
      videoTitle: document.title,
      platform: 'youtube',
    };
  }
}

function extractVideoId(url) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : '';
}

// Inject insights widget (optional, triggered by settings)
function injectInsightsWidget() {
  chrome.storage.sync.get(['showTrends'], (data) => {
    if (data.showTrends !== false) {
      const widget = createInsightsWidget();
      const targetElement = document.querySelector('ytd-video-secondary-info-renderer');
      if (targetElement && !document.getElementById('edgtec-insights-widget')) {
        targetElement.parentNode.insertBefore(widget, targetElement.nextSibling);
      }
    }
  });
}

function createInsightsWidget() {
  const widget = document.createElement('div');
  widget.id = 'edgtec-insights-widget';
  widget.style.cssText = `
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    border: 1px solid #334155;
    border-radius: 12px;
    padding: 16px;
    margin: 16px 0;
    color: #e2e8f0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 13px;
  `;
  
  widget.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">📈</span>
        <strong style="color: #60a5fa;">Edgtec Insights</strong>
      </div>
      <button id="edgtec-close-widget" style="
        background: none;
        border: none;
        color: #94a3b8;
        cursor: pointer;
        font-size: 18px;
        padding: 0;
      ">×</button>
    </div>
    
    <div id="edgtec-widget-content" style="
      border-top: 1px solid #334155;
      padding-top: 12px;
    ">
      <p style="color: #94a3b8; text-align: center;">Loading trend data...</p>
    </div>
  `;
  
  // Close button handler
  widget.querySelector('#edgtec-close-widget').addEventListener('click', () => {
    widget.remove();
  });
  
  // Load trend data
  loadTrendDataForWidget(widget);
  
  return widget;
}

async function loadTrendDataForWidget(widget) {
  try {
    const info = extractYouTubeInfo();
    const response = await fetch(`http://localhost:3000/api/trends?keyword=${encodeURIComponent(info.videoTitle)}`);
    const trendData = await response.json();
    
    const content = widget.querySelector('#edgtec-widget-content');
    content.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div style="background: rgba(96, 165, 250, 0.1); padding: 8px; border-radius: 6px; text-align: center;">
          <div style="color: #94a3b8; font-size: 11px;">Trend Score</div>
          <div style="color: #60a5fa; font-weight: 600; font-size: 18px;">${trendData.trendScore || 0}</div>
        </div>
        <div style="background: rgba(16, 185, 129, 0.1); padding: 8px; border-radius: 6px; text-align: center;">
          <div style="color: #94a3b8; font-size: 11px;">Direction</div>
          <div style="color: #10b981; font-weight: 600; font-size: 16px;">
            ${trendData.trendDirection === 'up' ? '↑ Rising' : trendData.trendDirection === 'down' ? '↓ Falling' : '→ Stable'}
          </div>
        </div>
      </div>
      ${trendData.relatedQueries ? `
        <div style="margin-top: 12px; border-top: 1px solid #334155; padding-top: 12px;">
          <div style="color: #94a3b8; font-size: 11px; margin-bottom: 6px;">Related Searches</div>
          <div style="font-size: 11px; color: #cbd5e1;">
            ${trendData.relatedQueries.slice(0, 3).join(', ')}
          </div>
        </div>
      ` : ''}
      <button id="edgtec-export-btn" style="
        width: 100%;
        margin-top: 12px;
        padding: 8px;
        background: #60a5fa;
        color: white;
        border: none;
        border-radius: 4px;
        font-weight: 600;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s;
      ">Add to Edgtec Calendar</button>
    `;
    
    // Export button handler
    widget.querySelector('#edgtec-export-btn').addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: 'openExportTab', data: info });
    });
    
  } catch (error) {
    console.error('Error loading trends:', error);
    const content = widget.querySelector('#edgtec-widget-content');
    content.innerHTML = `<p style="color: #fca5a5;">Error loading trend data</p>`;
  }
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectInsightsWidget);
} else {
  injectInsightsWidget();
}

// Re-inject widget on video change (for YouTube playlists)
let lastVideoId = '';
const observer = new MutationObserver(() => {
  const currentVideoId = extractVideoId(window.location.href);
  if (currentVideoId && currentVideoId !== lastVideoId) {
    lastVideoId = currentVideoId;
    const existingWidget = document.getElementById('edgtec-insights-widget');
    if (existingWidget) {
      existingWidget.remove();
    }
    injectInsightsWidget();
  }
});

observer.observe(document.documentElement, {
  subtree: true,
  childList: true,
  attributes: true,
  attributeFilter: ['href'],
});

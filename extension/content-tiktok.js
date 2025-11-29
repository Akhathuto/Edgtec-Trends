// TikTok content script - Extract video information and inject insights

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getVideoInfo') {
    sendResponse(extractTikTokInfo());
  }
});

function extractTikTokInfo() {
  try {
    // Extract video title/description
    const descElement = document.querySelector('[data-e2e="video-desc"]');
    const title = descElement?.textContent?.trim() || document.title;
    
    // Extract creator/channel name
    const creatorElement = document.querySelector('[data-e2e="user-name"]');
    const creator = creatorElement?.textContent?.trim() || '';
    
    // Extract play count
    const playCountElement = document.querySelector('[data-e2e="video-play-count"]');
    const playCountText = playCountElement?.textContent?.trim() || '';
    const plays = playCountText.split(' ')[0];
    
    // Extract like count
    const likeElement = document.querySelector('[data-e2e="like-count"]');
    const likes = likeElement?.textContent?.trim() || '';
    
    // Extract comment count
    const commentElement = document.querySelector('[data-e2e="comment-count"]');
    const comments = commentElement?.textContent?.trim() || '';
    
    // Extract share count
    const shareElement = document.querySelector('[data-e2e="share-count"]');
    const shares = shareElement?.textContent?.trim() || '';
    
    // Extract video ID from URL
    const videoId = window.location.pathname.split('/').filter(Boolean).pop();
    
    // Extract video URL
    const videoUrl = window.location.href;
    
    return {
      videoTitle: title,
      videoChannel: creator,
      videoViews: plays,
      videoId: videoId,
      videoUrl: videoUrl,
      likes: likes,
      comments: comments,
      shares: shares,
      platform: 'tiktok',
    };
  } catch (error) {
    console.error('Error extracting TikTok info:', error);
    return {
      videoTitle: document.title,
      platform: 'tiktok',
    };
  }
}

// Inject insights widget (optional, triggered by settings)
function injectInsightsWidget() {
  chrome.storage.sync.get(['showTrends'], (data) => {
    if (data.showTrends !== false) {
      const widget = createInsightsWidget();
      // Try multiple possible target locations
      const targetElements = [
        document.querySelector('[data-e2e="video-desc"]'),
        document.querySelector('[class*="video-info"]'),
        document.querySelector('[class*="feed-container"]'),
      ];
      
      const target = targetElements.find(el => el);
      if (target && !document.getElementById('edgtec-insights-widget-tiktok')) {
        target.parentNode.insertBefore(widget, target.nextSibling);
      }
    }
  });
}

function createInsightsWidget() {
  const widget = document.createElement('div');
  widget.id = 'edgtec-insights-widget-tiktok';
  widget.style.cssText = `
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    border: 1px solid #334155;
    border-radius: 12px;
    padding: 16px;
    margin: 16px 0;
    color: #e2e8f0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 13px;
    z-index: 1000;
    max-width: 320px;
  `;
  
  widget.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">📈</span>
        <strong style="color: #60a5fa;">Edgtec Insights</strong>
      </div>
      <button id="edgtec-close-widget-tiktok" style="
        background: none;
        border: none;
        color: #94a3b8;
        cursor: pointer;
        font-size: 18px;
        padding: 0;
      ">×</button>
    </div>
    
    <div id="edgtec-widget-content-tiktok" style="
      border-top: 1px solid #334155;
      padding-top: 12px;
    ">
      <p style="color: #94a3b8; text-align: center; font-size: 11px;">Loading trend data...</p>
    </div>
  `;
  
  // Close button handler
  widget.querySelector('#edgtec-close-widget-tiktok').addEventListener('click', () => {
    widget.remove();
  });
  
  // Load trend data
  loadTrendDataForWidget(widget);
  
  return widget;
}

async function loadTrendDataForWidget(widget) {
  try {
    const info = extractTikTokInfo();
    const response = await fetch(`http://localhost:3000/api/trends?keyword=${encodeURIComponent(info.videoTitle)}`);
    const trendData = await response.json();
    
    const content = widget.querySelector('#edgtec-widget-content-tiktok');
    content.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
        <div style="background: rgba(96, 165, 250, 0.1); padding: 10px; border-radius: 6px; text-align: center;">
          <div style="color: #94a3b8; font-size: 10px;">Trend Score</div>
          <div style="color: #60a5fa; font-weight: 600; font-size: 20px;">${trendData.trendScore || 0}</div>
        </div>
        <div style="background: rgba(16, 185, 129, 0.1); padding: 10px; border-radius: 6px; text-align: center;">
          <div style="color: #94a3b8; font-size: 10px;">Direction</div>
          <div style="color: #10b981; font-weight: 600; font-size: 18px;">
            ${trendData.trendDirection === 'up' ? '↑ Rising' : trendData.trendDirection === 'down' ? '↓ Falling' : '→ Stable'}
          </div>
        </div>
      </div>
      
      <div style="background: rgba(139, 92, 246, 0.1); padding: 10px; border-radius: 6px; margin-bottom: 12px;">
        <div style="color: #94a3b8; font-size: 10px; margin-bottom: 4px;">Video Stats</div>
        <div style="font-size: 11px; color: #cbd5e1; line-height: 1.5;">
          Views: <strong style="color: #60a5fa;">${info.videoViews || '—'}</strong><br>
          Likes: <strong style="color: #10b981;">${info.likes || '—'}</strong>
        </div>
      </div>
      
      ${trendData.relatedQueries ? `
        <div style="border-top: 1px solid #334155; padding-top: 12px; margin-top: 12px;">
          <div style="color: #94a3b8; font-size: 10px; margin-bottom: 6px;">Related Searches</div>
          <div style="font-size: 11px; color: #cbd5e1; line-height: 1.4;">
            ${trendData.relatedQueries.slice(0, 3).join(', ')}
          </div>
        </div>
      ` : ''}
      
      <button id="edgtec-export-btn-tiktok" style="
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
    widget.querySelector('#edgtec-export-btn-tiktok').addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: 'openExportTab', data: info });
    });
    
  } catch (error) {
    console.error('Error loading trends:', error);
    const content = widget.querySelector('#edgtec-widget-content-tiktok');
    content.innerHTML = `<p style="color: #fca5a5; font-size: 11px;">Error loading trend data</p>`;
  }
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectInsightsWidget);
} else {
  injectInsightsWidget();
}

// Re-inject widget on video change (for TikTok feed scrolling)
let lastVideoId = '';
const observer = new MutationObserver(() => {
  const currentVideoId = window.location.pathname.split('/').filter(Boolean).pop();
  if (currentVideoId && currentVideoId !== lastVideoId) {
    lastVideoId = currentVideoId;
    const existingWidget = document.getElementById('edgtec-insights-widget-tiktok');
    if (existingWidget) {
      existingWidget.remove();
    }
    injectInsightsWidget();
  }
});

observer.observe(document.documentElement, {
  subtree: true,
  childList: true,
});

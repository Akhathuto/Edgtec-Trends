// Popup state
let currentTab = 'insights';

// Initialize popup on load
document.addEventListener('DOMContentLoaded', async () => {
  initializeTabs();
  loadSettings();
  await loadInsights();
});

// Tab switching
function initializeTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      const tabName = e.target.dataset.tab;
      switchTab(tabName);
    });
  });
}

function switchTab(tabName) {
  currentTab = tabName;
  
  // Update active tab button
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
  
  // Update active content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  document.getElementById(`${tabName}-content`).classList.add('active');
}

// Load and display insights
async function loadInsights() {
  const insightsContent = document.getElementById('insights-content');
  insightsContent.innerHTML = '<div class="loading">Fetching video insights...</div>';
  
  try {
    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Check if we're on YouTube or TikTok
    const isYouTube = tab.url?.includes('youtube.com');
    const isTikTok = tab.url?.includes('tiktok.com');
    
    if (!isYouTube && !isTikTok) {
      insightsContent.innerHTML = '<p style="color: #94a3b8;">This extension works on YouTube and TikTok. Visit a video page to see insights.</p>';
      return;
    }
    
    // Extract video info from content script
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'getVideoInfo' });
    
    if (!response || !response.videoTitle) {
      insightsContent.innerHTML = '<p style="color: #94a3b8;">Could not extract video information. Please refresh the page.</p>';
      return;
    }
    
    // Fetch trend data
    const trendResponse = await fetch(`http://localhost:3000/api/trends?keyword=${encodeURIComponent(response.videoTitle)}`);
    const trendData = await trendResponse.json();
    
    // Build insights HTML
    let html = `
      <div class="section">
        <h3>📺 Video Information</h3>
        <div class="metric">
          <span class="metric-label">Title:</span>
          <span class="metric-value" style="flex: 1; margin-left: 8px; font-size: 11px;">${escapeHtml(response.videoTitle)}</span>
        </div>
    `;
    
    if (response.videoChannel) {
      html += `
        <div class="metric">
          <span class="metric-label">Channel:</span>
          <span class="metric-value">${escapeHtml(response.videoChannel)}</span>
        </div>
      `;
    }
    
    if (response.videoViews) {
      html += `
        <div class="metric">
          <span class="metric-label">Views:</span>
          <span class="metric-value">${response.videoViews}</span>
        </div>
      `;
    }
    
    html += `
      </div>
      <div class="section">
        <h3>📈 Trend Analysis</h3>
        <div class="metric">
          <span class="metric-label">Trend Score:</span>
          <span class="metric-value">${trendData.trendScore || 0}/100</span>
        </div>
        <div class="metric">
          <span class="metric-label">Direction:</span>
          <span class="metric-value">${trendData.trendDirection === 'up' ? '↑ Rising' : trendData.trendDirection === 'down' ? '↓ Falling' : '→ Stable'}</span>
        </div>
    `;
    
    if (trendData.relatedQueries && trendData.relatedQueries.length > 0) {
      html += `
        <div style="margin-top: 10px; font-size: 11px; color: #cbd5e1;">
          <strong>Related Searches:</strong><br>
          ${trendData.relatedQueries.slice(0, 3).join(', ')}
        </div>
      `;
    }
    
    html += '</div>';
    
    // Add action pack section
    html += `
      <div class="section">
        <h3>💡 Quick Actions</h3>
        <button id="export-btn" style="
          width: 100%;
          padding: 8px 12px;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 4px;
          font-weight: 600;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        ">Add to Calendar</button>
      </div>
    `;
    
    insightsContent.innerHTML = html;
    
    // Add export button listener
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        switchTab('export');
      });
    }
    
  } catch (error) {
    console.error('Error loading insights:', error);
    insightsContent.innerHTML = `<p style="color: #fca5a5;">Error: ${error.message}</p>`;
  }
}

// Export form handling
document.addEventListener('DOMContentLoaded', () => {
  const exportForm = document.getElementById('export-form');
  if (exportForm) {
    exportForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = {
        title: document.getElementById('export-title').value,
        description: document.getElementById('export-description').value,
        tags: document.getElementById('export-tags').value.split(',').map(t => t.trim()),
        schedule: document.getElementById('export-schedule').value,
      };
      
      try {
        const response = await fetch('http://localhost:3000/api/calendar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        
        if (response.ok) {
          showStatus('export-status', 'Added to calendar!', 'success');
          setTimeout(() => {
            document.getElementById('export-form').reset();
          }, 1500);
        } else {
          showStatus('export-status', 'Failed to add to calendar', 'error');
        }
      } catch (error) {
        showStatus('export-status', `Error: ${error.message}`, 'error');
      }
    });
  }
});

// Settings handling
function loadSettings() {
  chrome.storage.sync.get(['appUrl', 'autoExtract', 'showTrends'], (data) => {
    if (data.appUrl) {
      document.getElementById('settings-app-url').value = data.appUrl;
    }
    if (data.autoExtract !== undefined) {
      document.getElementById('settings-auto-extract').checked = data.autoExtract;
    }
    if (data.showTrends !== undefined) {
      document.getElementById('settings-show-trends').checked = data.showTrends;
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const settingsForm = document.getElementById('settings-form');
  if (settingsForm) {
    settingsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const settings = {
        appUrl: document.getElementById('settings-app-url').value,
        autoExtract: document.getElementById('settings-auto-extract').checked,
        showTrends: document.getElementById('settings-show-trends').checked,
      };
      
      chrome.storage.sync.set(settings, () => {
        showStatus('settings-status', 'Settings saved!', 'success');
      });
    });
  }
});

// Utility functions
function showStatus(elementId, message, type) {
  const statusEl = document.getElementById(elementId);
  if (statusEl) {
    statusEl.textContent = message;
    statusEl.className = `status ${type} show`;
    setTimeout(() => {
      statusEl.classList.remove('show');
    }, 3000);
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Open Edgtec link
document.addEventListener('DOMContentLoaded', () => {
  const openLink = document.getElementById('open-edgtec-link');
  if (openLink) {
    openLink.addEventListener('click', () => {
      const appUrl = document.getElementById('settings-app-url')?.value || 'http://localhost:3000';
      chrome.tabs.create({ url: appUrl });
    });
  }
});

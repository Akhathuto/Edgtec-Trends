import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { registerServiceWorker } from './utils/swRegister';
import './index.css';

const container = document.getElementById('root');

function renderErrorOverlay(message: string, stack?: string) {
  try {
    const existing = document.getElementById('error-overlay');
    if (existing) existing.remove();
    const overlay = document.createElement('div');
    overlay.id = 'error-overlay';
    overlay.style.position = 'fixed';
    overlay.style.zIndex = '999999';
    overlay.style.left = '0';
    overlay.style.top = '0';
    overlay.style.right = '0';
    overlay.style.bottom = '0';
    overlay.style.background = 'rgba(0,0,0,0.85)';
    overlay.style.color = 'white';
    overlay.style.padding = '24px';
    overlay.style.overflow = 'auto';
    overlay.innerHTML = `<h2 style="margin-top:0">Application Error</h2><pre style="white-space:pre-wrap">${message}\n${stack || ''}</pre>`;
    document.body.appendChild(overlay);
  } catch (e) {
    // ignore
  }
}

// Global error handlers to surface runtime errors in deployed/production builds
window.addEventListener('error', (ev) => {
  const err = (ev && ev.error) || ev.message || 'Unknown error';
  renderErrorOverlay(String(err), ev.error && ev.error.stack ? ev.error.stack : '');
});
window.addEventListener('unhandledrejection', (ev) => {
  const reason = (ev && ev.reason) || 'Unhandled promise rejection';
  renderErrorOverlay(String(reason), ev.reason && ev.reason.stack ? ev.reason.stack : '');
});

// Register service worker for caching and offline support
registerServiceWorker();

if (container) {
  try {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <AuthProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </AuthProvider>
      </React.StrictMode>
    );
  } catch (err: any) {
    renderErrorOverlay(err && err.message ? err.message : String(err), err && err.stack ? err.stack : '');
    // rethrow to ensure logs show up in serverless logs too
    throw err;
  }
}

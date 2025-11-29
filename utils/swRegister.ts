/**
 * Service Worker Registration Utility
 * 
 * Registers the service worker on app load for caching and offline support.
 */

export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.log('[SW] Service Workers not supported');
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('[SW] Service Worker registered:', registration);

        // Check for updates periodically (every 1 hour)
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);
      })
      .catch((error) => {
        console.error('[SW] Service Worker registration failed:', error);
      });
  });

  // Handle controller change (new SW activated)
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('[SW] New Service Worker activated');
    // Optionally: notify user to reload or reload automatically
  });
}

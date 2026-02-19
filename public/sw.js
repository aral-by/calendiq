// Service worker will be configured in Phase 8 with PWA plugin
self.addEventListener('install', (event) => {
  console.log('Service worker installed');
});

self.addEventListener('activate', (event) => {
  console.log('Service worker activated');
});

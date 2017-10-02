importScripts('workbox-sw.prod.v2.0.3.js');
const workboxSW = new self.WorkboxSW();
workboxSW.precache([]);

workboxSW.router.registerRoute('https://fonts.googleapis.com/(.*)',
  workboxSW.strategies.cacheFirst({
    cacheName: 'googleapis',
    cacheableResponse: {
      statuses: [0, 200]
    },
    networkTimeoutSeconds: 4
  })
);

workboxSW.router.registerRoute('https://cdnjs.cloudflare.com/(.*)',
  workboxSW.strategies.cacheFirst({
    cacheName: 'cloudflare',
    cacheableResponse: {
      statuses: [0, 200]
    },
    networkTimeoutSeconds: 4
  })
);

workboxSW.router.registerRoute('https://cdn.jsdelivr.net/(.*)',
  workboxSW.strategies.cacheFirst({
    cacheName: 'jsdelivr',
    cacheableResponse: {
      statuses: [0, 200]
    },
    networkTimeoutSeconds: 4
  })
);
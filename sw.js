importScripts('https://cdn.jsdelivr.net/npm/workbox-sw@2.1.0/build/importScripts/workbox-sw.prod.v2.1.0.min.js');
const workboxSW = new self.WorkboxSW();
workboxSW.precache([]);

const routes = {
  eslint: '/(.*)',
  googleapis: 'https://fonts.googleapis.com/(.*)',
  gstatic: 'https://fonts.gstatic.com/(.*)',
  cloudflare: 'https://cdnjs.cloudflare.com/(.*)',
  jsdelivr: 'https://cdn.jsdelivr.net/(.*)'
};

const registerRoute = function (route) {
  workboxSW.router.registerRoute(route, workboxSW.strategies.networkFirst());
};

for (let routeName in routes) {
  registerRoute(routes[routeName], routeName);
}
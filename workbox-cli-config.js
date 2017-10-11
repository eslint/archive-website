module.exports = {
  "globDirectory": "./",
  "globPatterns": [
    "**/*.{html,eot,ttf,woff,woff2,png,js,jsx,map,css,json}"
  ],
  "swSrc": "sw/sw.js",
  "swDest": "sw.js",
  "globIgnores": [
    "workbox-cli-config.js",
    "package.json",
    "docs/0.24.1/**/*",
    "docs/1.0.0/**/*",
    "docs/1.10.3/**/*",
    "docs/2.0.0/**/*",
    "docs/2.13.1/**/*",
    "docs/3.0.0/**/*",
    "node_modules/**/*",
    "js/vendor/orion/editor/**/*",
    "_site/**/*",
    "_data/**/*",
    "_includes/**/*",
    "_layouts/**/*",
    "_posts/**/*",
    "_site/**/*"
  ]
};

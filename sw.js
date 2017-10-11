importScripts('https://cdn.jsdelivr.net/npm/workbox-sw@2.1.0/build/importScripts/workbox-sw.prod.v2.1.0.min.js');
const workboxSW = new self.WorkboxSW();
workboxSW.precache([
  {
    "url": "blog/index.html",
    "revision": "f9ff478897ce26affe0c449eb2d69c6c"
  },
  {
    "url": "demo/index.html",
    "revision": "f09d4f9cd647c043fa81b55ee33eeca1"
  },
  {
    "url": "docs/user-guide/formatters/html-formatter-example.html",
    "revision": "106355e260fdd5a0179566ec4b9fa0ba"
  },
  {
    "url": "fonts/glyphicons-halflings-regular.eot",
    "revision": "aa16cd35628e6dddf56e766c9aa4ae63"
  },
  {
    "url": "fonts/glyphicons-halflings-regular.ttf",
    "revision": "47da44498fc073d9fff9ab0cdb0bef8e"
  },
  {
    "url": "fonts/glyphicons-halflings-regular.woff",
    "revision": "5eae1f7217b606d3580dd70ac840fea1"
  },
  {
    "url": "fonts/glyphicons-halflings-regular.woff2",
    "revision": "241d5c08a17d20fbf2e95d905d865cb8"
  },
  {
    "url": "img/favicon.512x512.png",
    "revision": "c810a2c39a241acdd75d45fac903da84"
  },
  {
    "url": "img/github-button-blue.png",
    "revision": "061d7c3a4668e0927bc077e8b8c025b4"
  },
  {
    "url": "img/logos/airbnb.png",
    "revision": "d90cd75853c9144a60b0ff7dc9f362a3"
  },
  {
    "url": "img/logos/airhelp.png",
    "revision": "ac4800f7e916945c37f88425a7295b5b"
  },
  {
    "url": "img/logos/alianza.png",
    "revision": "1ed674f1f97a4e36ddfb0208105b93fd"
  },
  {
    "url": "img/logos/angular-formly.png",
    "revision": "62dfe21c82f1b41be086b4cfbaaa831e"
  },
  {
    "url": "img/logos/box.png",
    "revision": "c44715ece9cf6942b779ce7c7c611f8e"
  },
  {
    "url": "img/logos/cerner.png",
    "revision": "1624c46195e07447899916fc2f5360b4"
  },
  {
    "url": "img/logos/cocktailjs.png",
    "revision": "86b2ca622fb5e2514624b0a77531af74"
  },
  {
    "url": "img/logos/codinum.png",
    "revision": "c7961df168864a0753995b816501a9c0"
  },
  {
    "url": "img/logos/facebook.png",
    "revision": "9dce8edb22bd0c02e2d63dae5ae73ee6"
  },
  {
    "url": "img/logos/fingerproof.png",
    "revision": "9c974baeb53e61076ae9480fa2788a81"
  },
  {
    "url": "img/logos/geekpark.png",
    "revision": "e9c87dd53077ff663bf6e15a9dc20c78"
  },
  {
    "url": "img/logos/getable.png",
    "revision": "692ea8ccaf3b2a93474835f405a6e7fb"
  },
  {
    "url": "img/logos/kahoot.png",
    "revision": "75f9db59d2c3f4c0991b6d39ef4bd457"
  },
  {
    "url": "img/logos/paperlesspost.png",
    "revision": "1bb2663f643d7a0a6a4ab0ae4d47585e"
  },
  {
    "url": "img/logos/paypal.png",
    "revision": "bbe2d29f5cbd948df80c07d0fca4c24e"
  },
  {
    "url": "img/logos/phoenixrobotix.png",
    "revision": "d886ccb0735868ee91a05e16a0760832"
  },
  {
    "url": "img/logos/qualitybath.png",
    "revision": "51342ca6f37e9580a4597e9f53c28a05"
  },
  {
    "url": "img/logos/schibsted.png",
    "revision": "1ba81ae0198ce49f64783cb39d831a7d"
  },
  {
    "url": "img/logos/simplifield.png",
    "revision": "ad6dddcef07e4e36a04710efb8d2f976"
  },
  {
    "url": "img/logos/sina-mobile.png",
    "revision": "0f3359f368b817d3823a4a2e812ac181"
  },
  {
    "url": "img/logos/sm.png",
    "revision": "1f8c1f489c928a961f1401d24f4b77c0"
  },
  {
    "url": "img/logos/squarespace.png",
    "revision": "2ace5c8698975d43520057bb210e8b04"
  },
  {
    "url": "img/logos/the-native-web.png",
    "revision": "51c9386e9764b9464feb6b132908a4d2"
  },
  {
    "url": "img/logos/transloadit.png",
    "revision": "97fad4762338dff298acb4ef020598f5"
  },
  {
    "url": "img/logos/valor-software-sm.png",
    "revision": "e18bcca27400f0fea240ccf734002cdf"
  },
  {
    "url": "img/logos/windsorcircle.png",
    "revision": "d79745db37568eb4398f4c012f364eb1"
  },
  {
    "url": "index.html",
    "revision": "8c241a6ac434e1409ad468bf543aba89"
  },
  {
    "url": "js/app/demo/app.jsx",
    "revision": "ccb1cc265f584d7fc943a48f4b9b2250"
  },
  {
    "url": "js/app/demo/configuration.jsx",
    "revision": "f83772ac1a254560ff24ce459d3d315c"
  },
  {
    "url": "js/app/demo/editor.jsx",
    "revision": "c19a4cd9c5684b1669a294a09d222dd2"
  },
  {
    "url": "js/app/demo/environments.jsx",
    "revision": "896bb4a299621f21ea54e115232313e0"
  },
  {
    "url": "js/app/demo/events.js",
    "revision": "02951f50b3545823628b1eef61bb7757"
  },
  {
    "url": "js/app/demo/fixedCode.jsx",
    "revision": "9ebfce2723b98d9e137ba0700a214d40"
  },
  {
    "url": "js/app/demo/main.js",
    "revision": "c23e9487bfcdba1ac17288361e7dac3d"
  },
  {
    "url": "js/app/demo/message.jsx",
    "revision": "f2d50eecb52bdc3f89bcb3a2eaded712"
  },
  {
    "url": "js/app/demo/messages.jsx",
    "revision": "badb13bfd43f28675cd35f7a5e4fb179"
  },
  {
    "url": "js/app/demo/parserOptions.jsx",
    "revision": "dcf6f70e00283a1640e16601d511a583"
  },
  {
    "url": "js/app/demo/requireConfig.js",
    "revision": "c71ba82fdf096be0675f60c2bcfda258"
  },
  {
    "url": "js/app/demo/rulesConfig.jsx",
    "revision": "af26aa6340296782a78cd5be829036c7"
  },
  {
    "url": "js/app/demo/selectAllCheckbox.jsx",
    "revision": "af9e01377521fb68fd18ba24b162b0f7"
  },
  {
    "url": "js/app/image-lazy-loader.js",
    "revision": "f450a471605883ce9cef31615ba749eb"
  },
  {
    "url": "js/app/parser/index.built.js",
    "revision": "c5cc8df6b40fa559fcbe269f88e751e5"
  },
  {
    "url": "js/app/parser/index.js",
    "revision": "b047ea8eadb4e57dbd6ec5d2164f0765"
  },
  {
    "url": "js/app/parser/lib.js",
    "revision": "9e8be33e29b0020691b1c0cec0e80fec"
  },
  {
    "url": "js/app/parser/parser.config.js",
    "revision": "1567b2c6171564e6526fc11d7bb1b196"
  },
  {
    "url": "js/app/search.js",
    "revision": "e7f266cea354f132b487959837602534"
  },
  {
    "url": "js/vendor/jsx.js",
    "revision": "e17cbe42b0dffb0e65567041f1fb7e87"
  },
  {
    "url": "js/vendor/JSXTransformer.js",
    "revision": "f120624994f7a193d953f631c7f7146c"
  },
  {
    "url": "js/vendor/text.js",
    "revision": "8fe8761d7f3641166fc225cbb2f85fb1"
  },
  {
    "url": "manifest.json",
    "revision": "908bd550cfa0cc365a110287e9537cbc"
  },
  {
    "url": "parser/index.html",
    "revision": "d5de3087d8a065c7f698a353f9d84f77"
  },
  {
    "url": "styles/demo.css",
    "revision": "637421dd94114f7c35eaba8376cb397a"
  },
  {
    "url": "styles/main.css",
    "revision": "a3171d6e1224e9ec563e39fe9b5559c4"
  },
  {
    "url": "styles/main.css.map",
    "revision": "1d9d93c35ebb8401d8c6f3d1c6fe27e3"
  },
  {
    "url": "styles/parser.css",
    "revision": "e7c10a86fc941046696237e84bec7ac3"
  },
  {
    "url": "styles/vendor/orion-built-editor.css",
    "revision": "6d8ad4a619f4b30ceb69294234e11de8"
  },
  {
    "url": "sw.js",
    "revision": "b008d4d5531f5c543748ee1d311aa164"
  },
  {
    "url": "sw/sw.js",
    "revision": "e130e68c558abeb88793d04b79b18bad"
  }
]);

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
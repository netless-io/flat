/* eslint-disable no-restricted-globals */

const baseUrl = "https://convertcdn.netless.link/";

self.oninstall = function () {
    self.skipWaiting();
};

const pptConvertCache = caches.open("ppt-convert");

self.onfetch = event => {
    const request = event.request;
    if (request.url.startsWith(baseUrl)) {
        event.respondWith(
            pptConvertCache.then(async cache => {
                const response = await cache.match(request);
                return response || fetch(request);
            }),
        );
    }
};

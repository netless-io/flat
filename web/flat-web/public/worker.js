/* eslint-disable no-restricted-globals */

const baseURL = [
    "https://convertcdn.netless.link/",
    "https://convertcdn-us-sv.netless.link/",
    "https://convertcdn-gb-lon.netless.link/",
    "https://convertcdn-sg.netless.link/",
    "https://convertcdn-in-mum.netless.link/",
];

self.oninstall = function () {
    self.skipWaiting();
};

const pptConvertCache = caches.open("ppt-convert");

self.onfetch = event => {
    const request = event.request;
    if (baseURL.some(url => request.url.startsWith(url))) {
        event.respondWith(
            pptConvertCache.then(async cache => {
                const response = await cache.match(request);
                return response || fetch(request);
            }),
        );
    }
};

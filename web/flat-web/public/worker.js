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

                // https://web.dev/sw-range-requests
                const range = request.headers.get("range");
                if (range && response) {
                    if (response.status === 206) {
                        return response;
                    }
                    try {
                        const blob = await response.blob();
                        const [x, y] = range.replace("bytes=", "").split("-");
                        const end = parseInt(y, 10) || blob.size - 1;
                        const start = parseInt(x, 10) || 0;
                        const sliced = blob.slice(start, end);
                        const slicedSize = sliced.size;
                        const slicedResponse = new Response(sliced, {
                            status: 206,
                            statusText: "Partial Content",
                            headers: response.headers,
                        });
                        slicedResponse.headers.set("Content-Length", String(slicedSize));
                        slicedResponse.headers.set(
                            "Content-Range",
                            `bytes ${start}-${end}/${blob.size}`,
                        );
                        return slicedResponse;
                    } catch (error) {
                        console.error(error);
                        return fetch(request);
                    }
                }

                return response || fetch(request);
            }),
        );
    }
};

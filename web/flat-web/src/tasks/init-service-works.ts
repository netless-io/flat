const registerServiceWork = (): void => {
    if (navigator.serviceWorker && navigator.serviceWorker.register) {
        navigator.serviceWorker
            .register("/worker.js")
            .then(registration => {
                console.log("registration finish");
            })
            .catch(error => {
                console.log("An error happened during installing the service worker:");
                console.log("error message", error.message);
            });
    }
};

export const initServiceWork = (): void => {
    registerServiceWork();
};

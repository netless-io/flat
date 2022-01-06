// if the classroom page is refreshed, the rtc code will be used immediately
// if we do not force a wait, the classroom page will report an error
export const initWaitRTC = async (): Promise<void> => {
    // e.g:
    //   ["#", "classroom", "BigClass"]
    //   ["#"]
    const hashList = document.location.hash.split("/");

    if (hashList.length <= 1) {
        return;
    }

    // e.g: ["classroom", "device"];
    const currentPagePrefix = hashList[1];

    // currently, only the classroom and device pages use the RTC
    // so when the user is refreshing on both pages, we need to force a wait for rtcEngine to be ready.
    const needWaitRTCPagesPrefix = ["classroom", "device"];

    const result = needWaitRTCPagesPrefix.includes(currentPagePrefix);

    if (!result) {
        return;
    }

    await new Promise<void>(resolve => {
        // after actual testing, here it will probably wait until 200ms ~ 500ms
        const id = setInterval(() => {
            if (window.rtcEngine) {
                clearInterval(id);
                resolve();
            }
        }, 50);
    });
};

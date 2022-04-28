let electron = {
    _uid$: NaN,
    _element$: null,
    initialize() {
        client.on("userJoined", uid => {
            isShareScreenUID(uid) && _uid$.set(uid);
        });
        client.on("userOffline", uid => {
            isShareScreenUID(uid) && _uid$.set(NaN);
        });
        combine([_uid$, _element$]).subscribe(([uid, element]) => {
            if (uid && element) {
                client.muteRemoteVideoStream(uid, false);
                client.setupRemoteVideo(uid, this.element, undefined); // <-
                client.setupViewContentMode(uid, 1, undefined);
            } else {
                client.destroyRender(uid, undefined);
                client.destroyRenderView(uid, undefined, element); // <-
            }
        });
    },
    enable(type: "window" | "display", data: ScreenSymbol | number) {
        client.once("videoSourceJoinedSuccess", () => {
            client.videoSourceSetVideoProfile(43, false);
            if (type === "display") {
                client.videoSourceStartScreenCaptureByScreen(data, rect, params);
            } else {
                client.videoSourceStartScreenCaptureByWindow(data, rect, params);
            }
        });
        client.videoSourceInitialize(APP_ID);
        client.videoSourceSetChannelProfile(1);
        client.videoSourceJoin(rtc_share_screen_token, room_uuid, "", rtc_share_screen_uid);
    },
    close() {
        client.once("videoSourceLeaveChannel", () => {
            client.videoSourceRelease();
            resolve();
        });
        client.videoSourceLeave();
    },
    // electron only api
    getScreenInfo() {
        client.getScreenDisplaysInfo() + client.getScreenWindowsInfo();
    },
};

let web = {
    _user$: NaN,
    _element$: null,
    initialize(client) {
        client.remoteUsers.find(user => globalStore.isShareScreenUID(user.uid));
        client.on("user-published", (user, media) => {
            isShareScreenUID(user.uid) && _user$.set(user);
        });
        client.on("user-unpublished", (user, media) => {
            isShareScreenUID(user.uid) && _user$.set(NaN);
        });
        combine([_user$, _element$]).subscribe(([user, element]) => {
            if (user && element) {
                remoteScreenTrack = await client.subscribe(user, "video");
                remoteScreenTrack.play(element, { fit: "contain" }); // <-
            } else {
                remoteScreenTrack.stop();
                client.unsubscribe(user, "video"); // <-
            }
        });
    },
    async enable() {
        // this will bring up selector
        localScreenTrack = await AgoraRTC.createScreenVideoTrack({}, "disable");
        localScreenTrack.once("track-ended", () => this.close());

        client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
        await client.join(APP_ID, room_uuid, rtc_share_screen_token, rtc_share_screen_uid);
        await client.publish(localScreenTrack);
    },
    async close() {
        localScreenTrack.close();

        client.unpublish(localScreenTrack);
        localScreenTrack = null;
    },
};

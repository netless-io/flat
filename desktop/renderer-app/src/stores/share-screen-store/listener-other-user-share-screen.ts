import type AgoraSDK from "agora-electron-sdk";
import { globalStore } from "../global-store";

export class ListenerOtherUserShareScreen {
    private readonly existOtherUserStream: (exist: boolean) => void;
    private shareScreenUID = NaN;

    public constructor(
        private readonly roomClient: AgoraSDK,
        private readonly isLocalStream: () => boolean,
        onExistOtherUserStream: (exist: boolean) => void,
    ) {
        this.existOtherUserStream = onExistOtherUserStream;

        this.roomClient.on("userJoined", this.onShareScreenPublish.bind(this));
        this.roomClient.on("userOffline", this.onShareScreenUnPublish.bind(this));
    }

    public render(element: HTMLElement): void {
        // this is a bug in agora sdk, when the `desktop` screen sharing is done,
        // and then the `web` side does the screen sharing,
        // the `desktop` will have a black screen.
        // this is because the sdk has `mute` the remote screen sharing stream
        this.roomClient.muteRemoteVideoStream(this.shareScreenUID, false);
        this.roomClient.setupRemoteVideo(this.shareScreenUID, element, undefined);
        this.roomClient.setupViewContentMode(this.shareScreenUID, 1, undefined);
    }

    public stop(element: HTMLElement): void {
        this.roomClient.destroyRender(this.shareScreenUID, undefined);
        this.roomClient.destroyRenderView(this.shareScreenUID, undefined, element);
    }

    public destroy(): void {
        this.shareScreenUID = NaN;
        this.roomClient.off("userJoined", this.onShareScreenPublish.bind(this));
        this.roomClient.off("userOffline", this.onShareScreenUnPublish.bind(this));
    }

    private onShareScreenPublish(uid: number): void {
        if (globalStore.isShareScreenUID(uid) && !this.isLocalStream()) {
            this.shareScreenUID = uid;
            this.existOtherUserStream(true);
        }
    }

    private onShareScreenUnPublish(uid: number): void {
        if (globalStore.isShareScreenUID(uid) && !this.isLocalStream()) {
            this.shareScreenUID = NaN;
            this.existOtherUserStream(false);
        }
    }
}

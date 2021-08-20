import { IAgoraRTCClient, IAgoraRTCRemoteUser, IRemoteVideoTrack } from "agora-rtc-sdk-ng";
import { globalStore } from "../GlobalStore";

export class ListenerOtherUserShareScreen {
    private readonly existOtherUserStream: (exist: boolean) => void;
    private remoteScreenTrack: IRemoteVideoTrack | null = null;

    public constructor(
        private readonly roomClient: IAgoraRTCClient,
        private readonly element: HTMLElement,
        private readonly isLocalStream: () => boolean,
        onExistOtherUserStream: (exist: boolean) => void,
    ) {
        this.existOtherUserStream = onExistOtherUserStream;

        this.setupExistingTracks().catch(console.error);
        this.roomClient.on("user-published", this.onShareScreenPublish.bind(this));
        this.roomClient.on("user-unpublished", this.onShareScreenUnPublish.bind(this));
    }

    public destroy(): void {
        this.remoteScreenTrack = null;
        this.roomClient.off("user-published", this.onShareScreenPublish.bind(this));
        this.roomClient.off("user-unpublished", this.onShareScreenUnPublish.bind(this));
    }

    private async onShareScreenPublish(
        user: IAgoraRTCRemoteUser,
        mediaType: "video",
    ): Promise<void> {
        if (globalStore.isShareScreenUID(user.uid) && !this.isLocalStream()) {
            this.existOtherUserStream(true);

            try {
                this.remoteScreenTrack = await this.roomClient.subscribe(user, mediaType);
                this.remoteScreenTrack.play(this.element, {
                    fit: "contain",
                });
            } catch (error) {
                console.error(error);
                this.existOtherUserStream(false);
            }
        }
    }

    private async onShareScreenUnPublish(
        user: IAgoraRTCRemoteUser,
        mediaType: "video",
    ): Promise<void> {
        if (globalStore.isShareScreenUID(user.uid) && !this.isLocalStream()) {
            this.existOtherUserStream(false);
            this.remoteScreenTrack?.stop();
            await this.roomClient.unsubscribe(user, mediaType);
        }
    }

    private async setupExistingTracks(): Promise<void> {
        const exist = this.roomClient.remoteUsers.find(user =>
            globalStore.isShareScreenUID(user.uid),
        );
        if (exist) {
            await this.onShareScreenPublish(exist, "video");
        }
    }
}

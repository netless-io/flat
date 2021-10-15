import AgoraRTC, { IAgoraRTCClient } from "agora-rtc-sdk-ng";
import type { ILocalVideoTrack } from "agora-rtc-sdk-ng";
import { AGORA } from "../../constants/process";
import { globalStore } from "../../stores/GlobalStore";
import EventEmitter from "eventemitter3";

export class RTCShareScreen {
    public shareScreenClient?: IAgoraRTCClient;

    private localScreenTrack?: ILocalVideoTrack;

    public constructor(
        private readonly roomUUID: string,
        private readonly enableShareScreenStatus: (enable: boolean) => void,
        private readonly existOtherUserStream: () => boolean,
    ) {}

    public async enable(): Promise<void> {
        try {
            if (!globalStore.rtcShareScreen) {
                return;
            }

            this.localScreenTrack = await AgoraRTC.createScreenVideoTrack({}, "disable");

            this.localScreenTrack.once("track-ended", async () => {
                // user click browser comes with cancel button
                await this.close();
            });

            this.shareScreenClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

            this.assertNotHasOtherUserShareScreenStream();

            await this.shareScreenClient.join(
                AGORA.APP_ID,
                this.roomUUID,
                globalStore.rtcShareScreen.token,
                globalStore.rtcShareScreen.uid,
            );

            await this.shareScreenClient.publish(this.localScreenTrack);

            this.enableShareScreenStatus(true);
        } catch (error) {
            if (RTCShareScreen.isAgoraRTCPermissionError(error)) {
                if (RTCShareScreen.browserNotPermission(error.message)) {
                    shareScreenEvents.emit("browserNotPermission");
                } else {
                    // user click cancel
                }
            } else {
                console.error(error);
            }

            this.close().catch(console.error);
        }
    }

    public async close(): Promise<void> {
        try {
            if (this.localScreenTrack) {
                this.localScreenTrack.close();

                if (this.shareScreenClient) {
                    await this.shareScreenClient.unpublish(this.localScreenTrack);
                }

                this.localScreenTrack = undefined;
            }

            if (this.shareScreenClient) {
                await this.shareScreenClient.leave();
            }
        } catch (error) {
            console.error(error);
        } finally {
            this.enableShareScreenStatus(false);
        }
    }

    private assertNotHasOtherUserShareScreenStream(): void {
        if (this.existOtherUserStream()) {
            throw new Error("exist other user share screen stream");
        }
    }

    private static isAgoraRTCPermissionError(error: any): error is Error {
        return "code" in error && "message" in error && error.code === "PERMISSION_DENIED";
    }

    private static browserNotPermission(message: string): boolean {
        return message.indexOf("by system") !== -1;
    }
}

export const shareScreenEvents = new EventEmitter<"browserNotPermission">();

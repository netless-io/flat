import AgoraRTC, { IAgoraRTCClient } from "agora-rtc-sdk-ng";
import { AGORA } from "../../constants/Process";
import { globalStore } from "../../stores/GlobalStore";
import { generateRTCToken } from "../flatServer/agora";

if (import.meta.env.PROD) {
    AgoraRTC.setLogLevel(/* WARNING */ 2);
}

export enum RtcChannelType {
    Communication = 0,
    Broadcast = 1,
}

/**
 * Flow:
 * ```
 * join() -> now it has `client`
 *   getLatency() -> number
 * destroy()
 * ```
 */
export class RtcRoom {
    public client?: IAgoraRTCClient;

    private roomUUID?: string;

    public async join({
        roomUUID,
        isCreator,
        rtcUID,
        channelType,
    }: {
        roomUUID: string;
        isCreator: boolean;
        rtcUID: number;
        channelType: RtcChannelType;
    }): Promise<void> {
        if (this.client) {
            await this.destroy();
        }

        const mode = channelType === RtcChannelType.Communication ? "rtc" : "live";
        this.client = AgoraRTC.createClient({ mode, codec: "vp8" });

        this.client.on("token-privilege-will-expire", this.renewToken);

        if (mode !== "rtc") {
            await this.client.setClientRole(
                channelType === RtcChannelType.Broadcast && !isCreator ? "audience" : "host",
            );
        }
        const token = globalStore.rtcToken || (await generateRTCToken(roomUUID));
        await this.client.join(AGORA.APP_ID, roomUUID, token, rtcUID);

        this.roomUUID = roomUUID;
    }

    public getLatency(): number {
        return this.client?.getRTCStats().RTT ?? NaN;
    }

    public async destroy(): Promise<void> {
        if (this.client) {
            this.client.off("token-privilege-will-expire", this.renewToken);
            await this.client.leave();
            this.client = undefined;
        }
    }

    private renewToken = async (): Promise<void> => {
        if (this.client && this.roomUUID) {
            const token = await generateRTCToken(this.roomUUID);
            await this.client.renewToken(token);
        }
    };
}

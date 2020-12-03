import AgoraRTM, { RtmChannel, RtmClient } from "agora-rtm-sdk";

export class Rtm {
    client: RtmClient;
    channel?: RtmChannel;

    constructor(appId?: string) {
        if (!appId) {
            appId = process.env.AGORA_APP_ID;
        }
        if (!appId) {
            throw new Error("Agora App Id not set.");
        }
        // @TODO 实现鉴权 token
        this.client = AgoraRTM.createInstance(appId);
    }

    async init(uid: string, channelId: string): Promise<RtmChannel> {
        await this.client.login({ uid });
        this.channel = this.client.createChannel(channelId);
        await this.channel.join();
        return this.channel;
    }

    async destroy() {
        if (this.channel) {
            this.channel.leave();
        }
        this.client.removeAllListeners();
        await this.client.logout();
    }
}

export default Rtm;

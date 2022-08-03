import { IServiceTextChat } from "@netless/flat-services";
import { ChatMsg } from "flat-components";
import { makeAutoObservable, observable, runInAction } from "mobx";
import { SideEffectManager } from "side-effect-manager";

export interface ChatStoreConfig {
    roomUUID: string;
    ownerUUID: string;
    rtm: IServiceTextChat;
    isShowUserGuide: boolean;
}

export class ChatStore {
    private readonly sideEffect = new SideEffectManager();

    public readonly messages = observable.array<ChatMsg>([]);

    public readonly rtm: IServiceTextChat;

    public constructor(config: ChatStoreConfig) {
        this.rtm = config.rtm;
        makeAutoObservable<this, "sideEffect">(this, {
            rtm: observable.ref,
            sideEffect: false,
        });

        if (config.isShowUserGuide && this.messages.every(m => m.type !== "user-guide")) {
            runInAction(() => {
                this.messages.push({
                    type: "user-guide",
                    uuid: "user-guide",
                    timestamp: Date.now(),
                    roomUUID: config.roomUUID,
                    senderID: config.ownerUUID,
                });
            });
        }

        this.sideEffect.addDisposer(
            this.rtm.events.on("room-message", message => {
                this.newMessage({
                    type: "room-message",
                    ...message,
                });
            }),
        );

        this.sideEffect.addDisposer(
            this.rtm.events.on("notice", message => {
                this.newMessage({
                    type: "notice",
                    ...message,
                });
            }),
        );

        this.sideEffect.addDisposer(
            this.rtm.events.on("ban", message => {
                this.newMessage({
                    type: "ban",
                    ...message,
                });
            }),
        );
    }

    public destroy(): void {
        this.sideEffect.flushAll();
    }

    /** Add the new message to message list */
    private newMessage = (message: ChatMsg): void => {
        const timestamp = Date.now();
        let insertPoint = 0;
        while (
            insertPoint < this.messages.length &&
            this.messages[insertPoint].timestamp <= timestamp
        ) {
            insertPoint++;
        }
        this.messages.splice(insertPoint, 0, message);
        this.onNewMessage(message);
    };

    /** For upstream to sync messages */
    public onNewMessage(_message: ChatMsg): void {
        // do nothing
    }
}

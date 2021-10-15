import { autorun, makeAutoObservable, observable, reaction } from "mobx";
import { RTCShareScreen } from "../../api-middleware/rtc/share-screen";
import { IAgoraRTCClient } from "agora-rtc-sdk-ng";
import { ListenerOtherUserShareScreen } from "./listener-other-user-share-screen";

export class ShareScreenStore {
    public enableShareScreenStatus = false;
    public existOtherUserStream = false;
    public isWritable = false;

    private rtcShareScreen: RTCShareScreen;
    private roomClient?: IAgoraRTCClient;
    private element?: HTMLElement;
    private listenerOtherUserShareScreen?: ListenerOtherUserShareScreen;

    public constructor(roomUUID: string) {
        makeAutoObservable<
            this,
            "roomClient" | "element" | "rtcShareScreen" | "listenerOtherUserShareScreen"
        >(this, {
            roomClient: observable.ref,
            element: observable.ref,
            rtcShareScreen: observable.ref,
            listenerOtherUserShareScreen: observable.ref,
        });

        this.rtcShareScreen = new RTCShareScreen(
            roomUUID,
            enable => {
                this.enableShareScreenStatus = enable;
            },
            () => this.existOtherUserStream,
        );

        reaction(
            () => ({
                roomClient: this.roomClient,
                element: this.element,
            }),
            ({ roomClient, element }) => {
                if (roomClient && element) {
                    this.listenerOtherUserShareScreen?.destroy();
                    this.listenerOtherUserShareScreen = new ListenerOtherUserShareScreen(
                        roomClient,
                        element,
                        () => this.enableShareScreenStatus,
                        existOtherUserStream => {
                            this.existOtherUserStream = existOtherUserStream;
                        },
                    );
                }
            },
        );

        autorun(() => {
            // when permission is recalled, close share screen
            if (!this.isWritable && this.enableShareScreenStatus) {
                this.close().catch(console.error);
            }
        });
    }

    public updateRoomClient(roomClient: IAgoraRTCClient): void {
        this.roomClient = roomClient;
    }

    public updateElement(element: HTMLElement): void {
        this.element = element;
    }

    public updateIsWritable(isWritable: boolean): void {
        this.isWritable = isWritable;
    }

    public async toggle(): Promise<void> {
        if (!this.roomClient || !this.element || this.existOtherUserStream) {
            return;
        }

        try {
            if (this.enableShareScreenStatus) {
                return await this.close();
            } else {
                return await this.enable();
            }
        } catch (error) {
            console.error(error);
        }
    }

    public async destroy(): Promise<void> {
        this.listenerOtherUserShareScreen?.destroy();
        this.listenerOtherUserShareScreen = undefined;

        this.enableShareScreenStatus = false;
        this.existOtherUserStream = false;
        this.roomClient = undefined;
        this.element = undefined;

        try {
            await this.close();
        } catch (error) {
            console.error(error);
        }
    }

    private async enable(): Promise<void> {
        try {
            await this.rtcShareScreen.enable();
        } catch (error) {
            console.error(error);
        }
    }

    private async close(): Promise<void> {
        try {
            await this.rtcShareScreen.close();
        } catch (error) {
            console.error(error);
        }
    }
}

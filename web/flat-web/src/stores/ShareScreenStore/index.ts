import { makeAutoObservable, observable, reaction } from "mobx";
import { RTCShareScreen } from "../../apiMiddleware/rtc/share-screen";
import { IAgoraRTCClient } from "agora-rtc-sdk-ng";
import { ListenerOtherUserShareScreen } from "./ListenerOtherUserShareScreen";

export class ShareScreenStore {
    public enableShareScreenStatus = false;
    public existOtherUserStream = false;

    private rtcShareScreen: RTCShareScreen;
    private roomClient?: IAgoraRTCClient;
    private element?: HTMLElement;
    private listenerOtherUserShareScreen?: ListenerOtherUserShareScreen;

    public constructor(private readonly roomUUID: string) {
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
    }

    public updateRoomClient(roomClient: IAgoraRTCClient): void {
        this.roomClient = roomClient;
    }

    public updateElement(element: HTMLElement): void {
        this.element = element;
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

import { autorun, makeAutoObservable, observable, reaction, runInAction } from "mobx";
import { RTCShareScreen, ScreenInfo } from "../../apiMiddleware/share-screen";
import { ListenerOtherUserShareScreen } from "./ListenerOtherUserShareScreen";

export class ShareScreenStore {
    public enableShareScreenStatus = false;
    public rtcShareScreen?: RTCShareScreen;
    public listenerOtherUserShareScreen: ListenerOtherUserShareScreen;
    public screenInfo: ScreenInfo | null = null;
    public existOtherShareScreen = false;
    public showShareScreenPicker = false;
    public isDisplayScreen: boolean | null = null;
    public screenID: number | null = null;
    public isWritable = false;

    private element: HTMLElement | null = null;

    public constructor(roomUUID: string) {
        makeAutoObservable<this, "element">(this, {
            element: observable.ref,
            screenInfo: observable.ref,
        });

        const roomClient = window.rtcEngine;

        this.listenerOtherUserShareScreen = new ListenerOtherUserShareScreen(
            roomClient,
            () => this.enableShareScreenStatus,
            exist => {
                runInAction(() => {
                    this.existOtherShareScreen = exist;
                });
            },
        );

        this.rtcShareScreen = new RTCShareScreen(
            roomUUID,
            roomClient,
            (enable: boolean) => {
                runInAction(() => {
                    this.enableShareScreenStatus = enable;
                });
            },
            () => this.existOtherShareScreen,
        );

        reaction(
            () => ({
                existOtherShareScreen: this.existOtherShareScreen,
                element: this.element,
            }),
            ({ existOtherShareScreen, element }) => {
                if (element === null) {
                    return;
                }

                if (existOtherShareScreen) {
                    this.listenerOtherUserShareScreen.render(element);
                } else {
                    this.listenerOtherUserShareScreen.stop(element);
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

    public updateElement(element: HTMLElement): void {
        this.element = element;
    }

    public updateShowShareScreenPicker(show: boolean): void {
        this.showShareScreenPicker = show;
    }

    public updateScreenInfo(): void {
        // getScreenInfo is a synchronous method that blocks the whole process.
        // in order to let the loading component load first, a manual delay is used here.
        setTimeout(() => {
            runInAction(() => {
                if (this.rtcShareScreen) {
                    this.screenInfo = this.rtcShareScreen.getScreenInfo();
                } else {
                    this.screenInfo = null;
                }
            });
        }, 100);
    }

    public resetScreenInfo(): void {
        this.screenInfo = null;
    }

    public updateIsDisplayScreen(isDisplay: boolean | null): void {
        this.isDisplayScreen = isDisplay;
    }

    public updateScreenID(id: number | null): void {
        this.screenID = id;
    }

    public updateIsWritable(isWritable: boolean): void {
        this.isWritable = isWritable;
    }

    public async close(): Promise<void> {
        await this.rtcShareScreen?.close();
    }

    public async destroy(): Promise<void> {
        this.listenerOtherUserShareScreen.destroy();
        await this.rtcShareScreen?.destroy();
    }

    public enable(): void {
        // same as updateScreenInfo
        setTimeout(() => {
            if (this.rtcShareScreen && this.isDisplayScreen !== null && this.screenID !== null) {
                this.rtcShareScreen.enable(this.isDisplayScreen, this.screenID);
            }

            this.updateShowShareScreenPicker(false);
        }, 500);
    }
}

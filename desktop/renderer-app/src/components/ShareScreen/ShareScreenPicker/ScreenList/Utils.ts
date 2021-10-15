import { ScreenInfo, ShareSymbol } from "../../../../api-middleware/share-screen";

export const uint8ArrayToImageURL = (buffer: Uint8Array): string => {
    return URL.createObjectURL(
        new Blob([buffer.buffer], {
            type: "image/png",
        }),
    );
};

export const getScreenInfo = (
    info: ScreenInfo["windowList"][0] | ScreenInfo["displayList"][0],
): IScreenInfo => {
    if ("displayId" in info) {
        return {
            type: "display",
            data: info.displayId,
            name: "Desktop",
        };
    } else {
        return {
            type: "window",
            data: info.windowId,
            name: `${info.ownerName} - ${info.name}`,
        };
    }
};

interface IScreenInfo extends ShareSymbol {
    name: string;
}

import { ScreenInfo } from "../../../../apiMiddleware/share-screen";

export const uint8ArrayToImageURL = (buffer: Uint8Array): string => {
    return URL.createObjectURL(
        new Blob([buffer.buffer], {
            type: "image/png",
        }),
    );
};

export const getScreenInfo = (
    info: ScreenInfo["windowList"][0] | ScreenInfo["displayList"][0],
): {
    id: number;
    isDisplay: boolean;
    name: string;
} => {
    if ("displayId" in info) {
        return {
            id: info.displayId.id,
            isDisplay: true,
            name: "Desktop",
        };
    } else {
        return {
            id: info.windowId,
            isDisplay: false,
            name: `${info.ownerName} - ${info.name}`,
        };
    }
};

export const uint8ArrayToImageURL = (buffer: Uint8Array): string => {
    return URL.createObjectURL(
        new Blob([buffer.buffer], {
            type: "image/png",
        }),
    );
};

import { message } from "antd";
import { v4 as v4uuid } from "uuid";
import type { Room, Size } from "white-web-sdk";
import { listFiles } from "../../api-middleware/flatServer/storage";
import { i18n } from "../i18n";
import { UploadTask } from "../upload-task-manager/upload-task";

const ImageFileTypes = [
    "image/png",
    "image/jpg",
    "image/jpeg",
    "image/webp",
    "image/apng",
    "image/svg+xml",
    "image/gif",
    "image/bmp",
    "image/avif",
    "image/tiff",
];

export function isSupportedImageType(file: File): boolean {
    return ImageFileTypes.includes(file.type);
}

export async function onDropImage(file: File, x: number, y: number, room: Room): Promise<void> {
    if (!isSupportedImageType(file)) {
        console.log("[dnd:image] unsupported file type:", file.type, file.name);
        return;
    }

    const hideLoading = message.loading(i18n.t("inserting-courseware-tips"));

    const getSize = getImageSize(file);
    const task = new UploadTask(file);
    await task.upload();
    const { files } = await listFiles({ page: 1 });
    const cloudFile = files.find(f => f.fileUUID === task.fileUUID);

    hideLoading();

    if (!cloudFile?.fileURL) {
        console.log("[dnd:image] upload failed:", file.name);
        return;
    }

    const uuid = v4uuid();
    const { width, height } = await getSize;
    room.insertImage({ uuid, centerX: x, centerY: y, width, height, locked: false });
    room.completeImageUpload(uuid, cloudFile.fileURL);
}

export function getImageSize(file: File): Promise<Size> {
    const image = new Image();
    const url = URL.createObjectURL(file);
    const { innerWidth, innerHeight } = window;
    // shrink the image a little to fit the screen
    const maxWidth = innerWidth * 0.8;
    const maxHeight = innerHeight * 0.8;
    image.src = url;
    return new Promise(resolve => {
        image.onload = () => {
            URL.revokeObjectURL(url);
            const { width, height } = image;
            let scale = 1;
            if (width > maxWidth || height > maxHeight) {
                scale = Math.min(maxWidth / width, maxHeight / height);
            }
            resolve({ width: Math.floor(width * scale), height: Math.floor(height * scale) });
        };
        image.onerror = () => {
            resolve({ width: innerWidth, height: innerHeight });
        };
    });
}

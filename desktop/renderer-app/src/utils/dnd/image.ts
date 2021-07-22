import { message } from "antd";
import type { Room, Size } from "white-web-sdk";
import { listFiles } from "../../apiMiddleware/flatServer/storage";
import { i18n } from "../i18n";
import { UploadTask } from "../UploadTaskManager/UploadTask";

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

    const hideLoading = message.loading(i18n.t("Inserting-courseware-tips"));

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

    const uuid = cloudFile.fileUUID;
    const { width, height } = await getSize;
    room.insertImage({ uuid, centerX: x, centerY: y, width, height, locked: false });
    room.completeImageUpload(uuid, cloudFile.fileURL);
}

function getImageSize(file: File): Promise<Size> {
    const image = new Image();
    const url = URL.createObjectURL(file);
    return new Promise(resolve => {
        image.src = url;
        image.onload = () => {
            URL.revokeObjectURL(url);
            resolve({ width: image.width, height: image.height });
        };
    });
}

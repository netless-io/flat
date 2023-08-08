import Axios from "axios";
import { message } from "antd";
import { v4 as v4uuid } from "uuid";
import { ApplianceNames, Room, Size } from "white-web-sdk";
import { CloudStorageStore, globalStore } from "@netless/flat-stores";
import { FlatI18n } from "@netless/flat-i18n";
import {
    RequestErrorCode,
    UploadTempPhotoResult,
    isServerRequestError,
    uploadTempPhotoFinish,
    uploadTempPhotoStart,
} from "@netless/flat-server-api";

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

const TEMP_IMAGE_SIZE_LIMIT = 5242880; // 5MB

export async function onDropImage(
    file: File,
    x: number,
    y: number,
    room: Room,
    _cloudStorageStore: CloudStorageStore,
): Promise<void> {
    if (!isSupportedImageType(file)) {
        console.log("[dnd:image] unsupported file type:", file.type, file.name);
        return;
    }

    if (file.size > TEMP_IMAGE_SIZE_LIMIT) {
        message.info(FlatI18n.t("upload-image-size-limit"));
        throw new Error("upload image size limit");
    }

    const hideLoading = message.loading(FlatI18n.t("inserting-courseware-tips"));

    const getSize = getImageSize(file);

    let ticket: UploadTempPhotoResult;
    try {
        ticket = await uploadTempPhotoStart(file.name, file.size);
    } catch (err) {
        if (isServerRequestError(err) && err.errorCode === RequestErrorCode.UploadConcurrentLimit) {
            message.error(FlatI18n.t("upload-image-concurrent-limit"));
        }
        throw err;
    }

    const fileURL = `${ticket.ossDomain}/${ticket.ossFilePath}`;

    const formData = new FormData();
    const encodedFileName = encodeURIComponent(file.name);
    formData.append("key", ticket.ossFilePath);
    formData.append("name", file.name);
    formData.append("policy", ticket.policy);
    formData.append("OSSAccessKeyId", globalStore.cloudStorageAK);
    formData.append("success_action_status", "200");
    formData.append("callback", "");
    formData.append("signature", ticket.signature);
    formData.append(
        "Content-Disposition",
        `attachment; filename="${encodedFileName}"; filename*=UTF-8''${encodedFileName}`,
    );
    formData.append("file", file);

    await Axios.post(ticket.ossDomain, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    await uploadTempPhotoFinish(ticket.fileUUID);

    hideLoading();

    const uuid = v4uuid();
    const { width, height } = await getSize;
    room.insertImage({ uuid, centerX: x, centerY: y, width, height, locked: false });
    room.completeImageUpload(uuid, fileURL);
    room.setMemberState({ currentApplianceName: ApplianceNames.selector });
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

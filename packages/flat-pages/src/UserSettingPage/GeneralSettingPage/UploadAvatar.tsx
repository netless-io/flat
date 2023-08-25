import Axios from "axios";
import React, { ChangeEvent, useContext, useEffect, useState } from "react";
import classNames from "classnames";
import { message } from "flat-components";
import { observer } from "mobx-react-lite";
import { FlatI18nTFunction, useTranslate } from "@netless/flat-i18n";

import { GlobalStoreContext } from "../../components/StoreProvider";
import { useSafePromise } from "../../utils/hooks/lifecycle";
import { uploadAvatarFinish, uploadAvatarStart } from "@netless/flat-server-api";
import { globalStore } from "@netless/flat-stores";

export interface UploadAvatarProps {
    onUpload?: (file: File) => Promise<void>;
}

export const UploadAvatar = observer<UploadAvatarProps>(function UploadAvatar({ onUpload }) {
    const globalStore = useContext(GlobalStoreContext);
    const sp = useSafePromise();
    const t = useTranslate();

    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState(globalStore.userInfo?.avatar || "");

    useEffect(() => {
        if (globalStore.userInfo?.avatar) {
            setImageUrl(globalStore.userInfo.avatar);
        }
    }, [globalStore.userInfo?.avatar]);

    const updateInput = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
        const file: File | undefined = (event.target.files || [])[0];
        if (file) {
            setLoading(true);
            sp(fileToDataUrl(file)).then(setImageUrl);
            if (onUpload) {
                await sp(onUpload(file).catch(console.error));
            }
            setLoading(false);
        } else {
            setImageUrl(globalStore.userInfo?.avatar || "");
        }
    };

    return (
        <div
            className={classNames("general-setting-user-avatar", {
                "is-loading": loading,
            })}
        >
            <input
                accept=".png,.jpg,.jpeg"
                className="user-avatar-input"
                type="file"
                onChange={updateInput}
            />
            {imageUrl ? (
                <img alt="avatar" className="user-avatar-image" src={imageUrl} />
            ) : (
                <span className="user-avatar-text">{t("upload-avatar")}</span>
            )}
        </div>
    );
});

function fileToDataUrl(file: File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

const USER_AVATAR_SIZE_LIMIT = 5242880;

export async function uploadAvatar(file: File, t: FlatI18nTFunction): Promise<void> {
    if (file.size >= USER_AVATAR_SIZE_LIMIT) {
        message.info(t("upload-avatar-size-limit"));
        throw new Error("upload avatar size limit");
    }

    const ticket = await uploadAvatarStart(file.name, file.size);

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

    const { avatarURL } = await uploadAvatarFinish(ticket.fileUUID);

    globalStore.updateUserAvatar(avatarURL);
}

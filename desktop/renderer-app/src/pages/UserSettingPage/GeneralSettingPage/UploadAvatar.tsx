import Axios from "axios";
import React, { ChangeEvent, useContext, useEffect, useState } from "react";
import classNames from "classnames";
import { Region } from "flat-components";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

import { GlobalStoreContext } from "../../../components/StoreProvider";
import { useSafePromise } from "../../../utils/hooks/lifecycle";
import { CLOUD_STORAGE_OSS_ALIBABA_CONFIG } from "../../../constants/process";
import { uploadAvatarFinish, uploadAvatarStart } from "../../../api-middleware/flatServer";
import { globalStore } from "../../../stores/global-store";

export interface UploadAvatarProps {
    onUpload?: (file: File) => Promise<void>;
}

export const UploadAvatar = observer<UploadAvatarProps>(function UploadAvatar({ onUpload }) {
    const globalStore = useContext(GlobalStoreContext);
    const sp = useSafePromise();
    const { t } = useTranslation();

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
            <input className="user-avatar-input" type="file" onChange={updateInput} />
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

export async function uploadAvatar(file: File): Promise<void> {
    const ticket = await uploadAvatarStart(
        file.name,
        file.size,
        globalStore.region ?? Region.CN_HZ,
    );

    const formData = new FormData();
    const encodedFileName = encodeURIComponent(file.name);
    formData.append("key", ticket.filePath);
    formData.append("name", file.name);
    formData.append("policy", ticket.policy);
    formData.append("OSSAccessKeyId", CLOUD_STORAGE_OSS_ALIBABA_CONFIG.accessKey);
    formData.append("success_action_status", "200");
    formData.append("callback", "");
    formData.append("signature", ticket.signature);
    formData.append(
        "Content-Disposition",
        `attachment; filename="${encodedFileName}"; filename*=UTF-8''${encodedFileName}`,
    );
    formData.append("file", file);

    await Axios.post(ticket.policyURL, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    const { avatarURL } = await uploadAvatarFinish(ticket.fileUUID);

    globalStore.updateUserAvatar(avatarURL);
}

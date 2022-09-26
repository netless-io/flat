import Axios from "axios";
import React, { ChangeEvent, useState } from "react";
import classNames from "classnames";
import { FlatI18nTFunction } from "@netless/flat-i18n";
import { finishUploadOAuthLogo, startUploadOAuthLogo } from "@netless/flat-server-api";
import { message, SVGEdit } from "flat-components";
import { CLOUD_STORAGE_OSS_ALIBABA_CONFIG } from "../../constants/process";
import { useSafePromise } from "../../utils/hooks/lifecycle";

export interface UploadLogoProps {
    logoURL: string;
    onUpload?: (file: File) => Promise<void>;
}

export const UploadLogo: React.FC<UploadLogoProps> = ({ logoURL, onUpload }: UploadLogoProps) => {
    const sp = useSafePromise();
    const [loading, setLoading] = useState(false);

    const updateInput = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
        const file: File | undefined = (event.target.files || [])[0];
        if (file) {
            if (onUpload) {
                setLoading(true);
                await sp(onUpload(file).catch(console.error));
                setLoading(false);
            }
        }
    };

    return (
        <div
            className={classNames("edit-oauth-logo", {
                "is-loading": loading,
            })}
        >
            <input
                accept=".png,.jpg,.jpeg"
                className="edit-oauth-logo-input"
                type="file"
                onChange={updateInput}
            />
            <img alt="logo" className="edit-oauth-logo-img" src={logoURL} />
            <div className="edit-oauth-logo-btn">
                <SVGEdit />
            </div>
        </div>
    );
};

const LOGO_SIZE_LIMIT = 5242880;

export async function uploadLogo(
    oauthUUID: string,
    file: File,
    t: FlatI18nTFunction,
): Promise<void> {
    if (file.size >= LOGO_SIZE_LIMIT) {
        message.info(t("upload-logo-size-limit"));
        throw new Error("upload logo size limit");
    }

    const ticket = await startUploadOAuthLogo({
        fileName: file.name,
        fileSize: file.size,
        oauthUUID,
    });

    const formData = new FormData();
    const encodedFileName = encodeURIComponent(file.name);
    formData.append("key", ticket.ossFilePath);
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

    await Axios.post(ticket.ossDomain, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    await finishUploadOAuthLogo({ oauthUUID, fileUUID: ticket.fileUUID });
}

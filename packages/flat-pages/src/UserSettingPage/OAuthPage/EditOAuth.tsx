import keySVG from "../icons/key.svg";

import React, { useEffect, useState } from "react";
import { errorTips, SVGCirclePlusFilled, SVGCopy, SVGDelete } from "flat-components";
import { Button, Input, message, Spin, Table, Modal } from "antd";
import {
    createOAuthSecret,
    deleteOAuthSecret,
    DeveloperOAuthScope,
    getOAuthDetail,
    OAuthDetail,
    updateOAuth,
    UpdateOAuthPayload,
} from "@netless/flat-server-api";
import { OAuthPageCommonProps } from "./index";
import { LoadingOutlined } from "@ant-design/icons";
import { format } from "date-fns";
import { useTranslate } from "@netless/flat-i18n";
import { useSafePromise } from "../../utils/hooks/lifecycle";
import { useScopesData } from "./NewOAuth";
import { validateURL } from "./utils";
import { uploadLogo, UploadLogo } from "./UploadLogo";

export interface EditOAuthProps extends OAuthPageCommonProps {
    oauthUUID: string;
}

export const EditOAuth: React.FC<EditOAuthProps> = ({ navigate, oauthUUID }) => {
    const t = useTranslate();
    const sp = useSafePromise();
    const [secretUUID, setSecretUUID] = useState("");
    const [clientSecret, setClientSecret] = useState("");
    const [tempCallbackURL, setTempCallbackURL] = useState("");
    const [detail, setDetail] = useState<OAuthDetail | null>(null);
    const [loading, setLoading] = useState(false);
    const { scopesColumns, scopesDataSource } = useScopesData();

    useEffect(() => {
        sp(getOAuthDetail(oauthUUID)).then(setDetail);
    }, [oauthUUID, sp]);

    const generateNewSecret = async (): Promise<void> => {
        const { secretUUID, clientSecret } = await sp(createOAuthSecret(oauthUUID));
        setSecretUUID(secretUUID);
        setClientSecret(clientSecret);
        await sp(getOAuthDetail(oauthUUID)).then(setDetail);
    };

    const copyClientSecret = async (): Promise<void> => {
        if (clientSecret) {
            await navigator.clipboard.writeText(clientSecret);
            void message.success(t("copy-success"));
        }
    };

    const remove = async (secretUUID: string): Promise<void> => {
        Modal.confirm({
            content: t("oauth-delete-secret-confirm"),
            onOk: async () => {
                await sp(deleteOAuthSecret(secretUUID));
                await sp(getOAuthDetail(oauthUUID)).then(setDetail);
            },
        });
    };

    if (detail === null) {
        return (
            <section className="edit-oauth">
                <Spin indicator={<LoadingOutlined spin />} />
            </section>
        );
    }

    const onUpload = async (file: File): Promise<void> => {
        try {
            await uploadLogo(oauthUUID, file, t);
            await sp(getOAuthDetail(oauthUUID)).then(setDetail);
        } catch (error) {
            message.info(t("upload-logo-failed"));
            throw error;
        }
    };

    const setAppName = (appName: string): void => {
        setDetail({ ...detail, appName });
    };

    const setHomepageURL = (homepageURL: string): void => {
        setDetail({ ...detail, homepageURL });
    };

    const setAppDesc = (appDesc: string): void => {
        setDetail({ ...detail, appDesc });
    };

    const scopes = detail.scopes;
    const setScopes = (scopes: DeveloperOAuthScope[]): void => {
        setDetail({ ...detail, scopes });
    };

    const callbacksURL = detail.callbacksURL;
    const pushTempCallbackURL = (): void => {
        if (tempCallbackURL) {
            setDetail({ ...detail, callbacksURL: [...callbacksURL, tempCallbackURL] });
            setTempCallbackURL("");
        }
    };
    const deleteCallbackURL = (index: number): void => {
        setDetail({ ...detail, callbacksURL: callbacksURL.filter((_, i) => i !== index) });
    };
    const updateCallbackURL = (index: number, url: string): void => {
        callbacksURL[index] = url;
        setDetail({ ...detail, callbacksURL });
    };
    const submit = async (): Promise<void> => {
        const { appName, appDesc, homepageURL, callbacksURL } = detail;
        if (!appName) {
            message.error(t("oauth-missing-app-name"));
            return;
        }
        if (!appDesc) {
            message.error(t("oauth-missing-app-desc"));
            return;
        }
        if (!homepageURL) {
            message.error(t("oauth-missing-homepage-url"));
            return;
        }
        if (!validateURL(homepageURL)) {
            message.error(t("oauth-invalid-homepage-url"));
            return;
        }
        if (callbacksURL.length === 0) {
            message.error(t("oauth-missing-callbacks-url"));
            return;
        }
        if (callbacksURL.some(url => !validateURL(url))) {
            message.error(t("oauth-invalid-callback-url"));
            return;
        }
        if (scopes.length === 0) {
            message.error(t("oauth-missing-scopes"));
            return;
        }
        setLoading(true);
        try {
            const payload: Omit<UpdateOAuthPayload, "oauthUUID"> = {
                appName,
                appDesc,
                homepageURL,
                callbacksURL,
                scopes,
            };
            await sp(updateOAuth(oauthUUID, payload));
            navigate("index");
        } catch (error) {
            setLoading(false);
            errorTips(error);
        }
    };

    return (
        <section className="edit-oauth">
            <h1 className="edit-oauth-title">{detail.appName}</h1>
            <h2 className="edit-oauth-subtitle">{t("client-id")}</h2>
            <p className="edit-oauth-content">{detail.clientID}</p>
            <h2 className="edit-oauth-subtitle">{t("client-secrets")}</h2>
            <p className="edit-oauth-content">{t("client-secret-desc")}</p>
            <div className="edit-oauth-new-secret-wrapper">
                <Button
                    className="edit-oauth-new-secret"
                    size="small"
                    type="primary"
                    onClick={generateNewSecret}
                >
                    {t("create-client-secret")}
                </Button>
            </div>
            {secretUUID && (
                <>
                    <p className="edit-oauth-copy-secret-tip">{t("oauth-copy-secret-tip")}</p>
                    <div className="edit-oauth-secret-wrapper is-new" data-secret-uuid={secretUUID}>
                        <div className="edit-oauth-secret-icon">
                            <img alt="key" src={keySVG} />
                        </div>
                        <div className="edit-oauth-secret">
                            <div className="edit-oauth-secret-row">
                                <span className="edit-oauth-secret-content">{clientSecret}</span>
                                <button
                                    className="edit-oauth-secret-btn"
                                    onClick={copyClientSecret}
                                >
                                    <SVGCopy />
                                </button>
                            </div>
                            <div className="edit-oauth-secret-row">
                                <span>
                                    {t("created-at")}: {format(new Date(), "yyyy-MM-dd hh:mm")}
                                </span>
                            </div>
                        </div>
                    </div>
                </>
            )}
            {detail.secrets
                .filter(e => e.secretUUID !== secretUUID)
                .map(e => (
                    <div
                        key={e.secretUUID}
                        className="edit-oauth-secret-wrapper"
                        data-secret-uuid={e.secretUUID}
                    >
                        <div className="edit-oauth-secret-icon">
                            <img alt="key" src={keySVG} />
                        </div>
                        <div className="edit-oauth-secret">
                            <div className="edit-oauth-secret-row">
                                <span className="edit-oauth-secret-content">{e.clientSecret}</span>
                            </div>
                            <div className="edit-oauth-secret-row">
                                <span>
                                    {t("created-at")}: {format(e.createdAt, "yyyy-MM-dd hh:mm")}
                                </span>
                            </div>
                        </div>
                        <div className="edit-oauth-secret-action">
                            <button
                                className="edit-oauth-delete-btn"
                                onClick={() => remove(e.secretUUID)}
                            >
                                <SVGDelete />
                            </button>
                        </div>
                    </div>
                ))}
            <hr className="edit-oauth-splitter" />
            <h2 className="edit-oauth-subtitle">{t("oauth-app-logo")}</h2>
            <UploadLogo logoURL={detail.logoURL} onUpload={onUpload} />
            <hr className="edit-oauth-splitter" />
            <label className="edit-oauth-subtitle is-required" htmlFor="edit-oauth-app-name">
                {t("oauth-app-name")}
            </label>
            <Input
                className="edit-oauth-input"
                id="edit-oauth-app-name"
                value={detail.appName}
                onChange={e => setAppName(e.target.value)}
            />
            <label className="edit-oauth-subtitle is-required" htmlFor="edit-oauth-homepage-url">
                {t("oauth-homepage-url")}
            </label>
            <Input
                className="edit-oauth-input"
                id="edit-oauth-homepage-url"
                value={detail.homepageURL}
                onChange={e => setHomepageURL(e.target.value)}
            />
            <label className="edit-oauth-subtitle is-required" htmlFor="edit-oauth-app-desc">
                {t("oauth-app-description")}
            </label>
            <Input.TextArea
                className="edit-oauth-input edit-oauth-textarea"
                id="edit-oauth-app-desc"
                rows={4}
                value={detail.appDesc}
                onChange={e => setAppDesc(e.target.value)}
            />
            <h2 className="edit-oauth-subtitle is-required">{t("oauth-scopes")}</h2>
            <Table
                className="edit-oauth-table"
                columns={scopesColumns}
                dataSource={scopesDataSource}
                locale={{
                    emptyText: t("no-data"),
                }}
                pagination={false}
                rowKey="scope"
                rowSelection={{
                    type: "checkbox",
                    selectedRowKeys: scopes,
                    onChange: setScopes as (keys: React.Key[]) => void,
                }}
            />
            <h2 className="edit-oauth-subtitle is-required">{t("oauth-callback-url")}</h2>
            {callbacksURL.map((url, i) => (
                <div key={i} className="edit-oauth-input-wrapper">
                    <Input
                        className="edit-oauth-input"
                        value={url}
                        onChange={e => updateCallbackURL(i, e.target.value)}
                    />
                    <button
                        className="edit-oauth-input-btn edit-oauth-input-delete"
                        title={t("delete")}
                        onClick={() => deleteCallbackURL(i)}
                    >
                        <SVGDelete />
                    </button>
                </div>
            ))}
            <div className="edit-oauth-input-wrapper">
                <Input
                    className="edit-oauth-input"
                    value={tempCallbackURL}
                    onChange={e => setTempCallbackURL(e.target.value)}
                />
                <button
                    className="edit-oauth-input-btn edit-oauth-input-add"
                    title={t("add")}
                    onClick={pushTempCallbackURL}
                >
                    <SVGCirclePlusFilled />
                </button>
            </div>
            <div className="edit-oauth-action">
                <Button loading={loading} type="primary" onClick={submit}>
                    {t("oauth-update-settings")}
                </Button>
            </div>
        </section>
    );
};

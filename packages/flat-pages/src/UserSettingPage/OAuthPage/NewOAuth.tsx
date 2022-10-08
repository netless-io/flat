import React, { useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import { Button, Input, message, Table, TableColumnsType } from "antd";
import { errorTips, SVGCirclePlusFilled, SVGDelete } from "flat-components";
import { createOAuth, CreateOAuthPayload, DeveloperOAuthScope } from "@netless/flat-server-api";
import { useTranslate } from "@netless/flat-i18n";
import { OAuthPageCommonProps } from "./index";
import { validateURL } from "./utils";
import { useSafePromise } from "../../utils/hooks/lifecycle";

export interface NewOAuthProps extends OAuthPageCommonProps {}

interface ScopesDataSource {
    scope: DeveloperOAuthScope;
    desc: string;
}

export interface ScopesData {
    scopesColumns: TableColumnsType<ScopesDataSource>;
    scopesDataSource: ScopesDataSource[];
}

export function useScopesData(): ScopesData {
    const t = useTranslate();
    const scopesColumns = useMemo<TableColumnsType<ScopesDataSource>>(
        () => [
            { dataIndex: "scope", title: t("oauth-app-scope") },
            { dataIndex: "desc", title: t("oauth-app-desc") },
        ],
        [t],
    );
    const scopesDataSource = useMemo<ScopesDataSource[]>(
        () => [
            { scope: DeveloperOAuthScope.UserAvatarRead, desc: t("oauth-scope-user-avatar-read") },
            { scope: DeveloperOAuthScope.UserNameRead, desc: t("oauth-scope-user-name-read") },
            { scope: DeveloperOAuthScope.UserUUIDRead, desc: t("oauth-scope-user-uuid-read") },
        ],
        [t],
    );
    return { scopesColumns, scopesDataSource };
}

export const NewOAuth: React.FC<NewOAuthProps> = ({ navigate }) => {
    const t = useTranslate();
    const sp = useSafePromise();
    const history = useHistory();
    const [appName, setAppName] = useState("");
    const [appDesc, setAppDesc] = useState("");
    const [homepageURL, setHomepageURL] = useState("");
    const [tempCallbackURL, setTempCallbackURL] = useState("");
    const [callbacksURL, setCallbacksURL] = useState<string[]>([]);
    const [scopes, setScopes] = useState<DeveloperOAuthScope[]>([]);
    const [loading, setLoading] = useState(false);
    const { scopesColumns, scopesDataSource } = useScopesData();

    const deleteCallbackURL = (index: number): void => {
        const newCallbacksURL = callbacksURL.slice();
        newCallbacksURL.splice(index, 1);
        setCallbacksURL(newCallbacksURL);
    };

    const pushTempCallbackURL = (): void => {
        if (!tempCallbackURL) {
            message.error(t("oauth-missing-callback-url"));
            return;
        }
        if (!validateURL(tempCallbackURL)) {
            message.error(t("oauth-invalid-callback-url"));
            return;
        }
        setCallbacksURL([...callbacksURL, tempCallbackURL]);
        setTempCallbackURL("");
    };

    const updateCallbackURL = (index: number, url: string): void => {
        const newCallbacksURL = callbacksURL.slice();
        newCallbacksURL[index] = url;
        setCallbacksURL(newCallbacksURL);
    };

    const submit = async (): Promise<void> => {
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
            const payload: CreateOAuthPayload = {
                appName,
                appDesc,
                homepageURL,
                callbacksURL,
                scopes,
            };
            await sp(createOAuth(payload));
            navigate("index");
        } catch (error) {
            setLoading(false);
            errorTips(error);
        }
    };

    return (
        <section className={"new-oauth"}>
            <h1 className="new-oauth-title">{t("create-oauth-app")}</h1>
            <label className="new-oauth-subtitle is-required" htmlFor="new-oauth-app-name">
                {t("oauth-app-name")}
            </label>
            <Input
                autoComplete="off"
                className="new-oauth-input"
                id="new-oauth-app-name"
                maxLength={20}
                placeholder={t("oauth-text-placeholder")}
                value={appName}
                onChange={e => setAppName(e.target.value)}
            />
            <label className="new-oauth-subtitle is-required" htmlFor="new-oauth-homepage-url">
                {t("oauth-homepage-url")}
            </label>
            <Input
                autoComplete="off"
                className="new-oauth-input"
                id="new-oauth-homepage-url"
                maxLength={100}
                placeholder={t("oauth-homepage-url-desc")}
                value={homepageURL}
                onChange={e => setHomepageURL(e.target.value)}
            />
            <label className="new-oauth-subtitle is-required" htmlFor="new-oauth-app-desc">
                {t("oauth-app-description")}
            </label>
            <Input.TextArea
                className="new-oauth-input new-oauth-textarea"
                id="new-oauth-app-desc"
                maxLength={300}
                placeholder={t("oauth-text-placeholder")}
                rows={4}
                value={appDesc}
                onChange={e => setAppDesc(e.target.value)}
            />
            <h2 className="new-oauth-subtitle is-required">{t("oauth-callback-url")}</h2>
            {callbacksURL.map((url, index) => (
                <div key={index} className="new-oauth-input-wrapper">
                    <Input
                        autoComplete="off"
                        className="new-oauth-input"
                        value={url}
                        onChange={e => updateCallbackURL(index, e.target.value)}
                    />
                    <button
                        className="new-oauth-input-btn new-oauth-input-delete"
                        title={t("delete")}
                        onClick={() => deleteCallbackURL(index)}
                    >
                        <SVGDelete />
                    </button>
                </div>
            ))}
            {callbacksURL.length < 5 && (
                <div className="new-oauth-input-wrapper">
                    <Input
                        autoComplete="off"
                        className="new-oauth-input"
                        value={tempCallbackURL}
                        onChange={e => setTempCallbackURL(e.target.value)}
                    />
                    <button
                        className="new-oauth-input-btn new-oauth-input-add"
                        title={t("add")}
                        onClick={pushTempCallbackURL}
                    >
                        <SVGCirclePlusFilled />
                    </button>
                </div>
            )}
            <h2 className="new-oauth-subtitle is-required">{t("oauth-scopes")}</h2>
            <Table
                className="new-oauth-table"
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
            <div className="new-oauth-action">
                <Button onClick={() => history.goBack()}>{t("cancel")}</Button>
                <Button loading={loading} type="primary" onClick={submit}>
                    {t("oauth-register-app")}
                </Button>
            </div>
        </section>
    );
};

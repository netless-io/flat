import React, { useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import { Button, Input, message, Table, TableColumnsType } from "antd";
import { errorTips, SVGCirclePlusFilled, SVGDelete } from "flat-components";
import { createOAuth, CreateOAuthPayload, DeveloperOAuthScope } from "@netless/flat-server-api";
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
    const scopesColumns = useMemo<TableColumnsType<ScopesDataSource>>(
        () => [
            { dataIndex: "scope", title: "范围" },
            { dataIndex: "desc", title: "说明" },
        ],
        [],
    );
    const scopesDataSource = useMemo<ScopesDataSource[]>(
        () => [
            { scope: DeveloperOAuthScope.UserAvatarRead, desc: "读取用户头像" },
            { scope: DeveloperOAuthScope.UserNameRead, desc: "读取用户昵称" },
            { scope: DeveloperOAuthScope.UserUUIDRead, desc: "读取用户 UUID" },
        ],
        [],
    );
    return { scopesColumns, scopesDataSource };
}

export const NewOAuth: React.FC<NewOAuthProps> = ({ navigate }) => {
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
            message.error("请输入回调地址");
            return;
        }
        if (!validateURL(tempCallbackURL)) {
            message.error("请输入有效的回调地址");
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
            message.error("请输入应用名称");
            return;
        }
        if (!appDesc) {
            message.error("请输入应用描述");
            return;
        }
        if (!homepageURL) {
            message.error("请输入应用主页地址");
            return;
        }
        if (!validateURL(homepageURL)) {
            message.error("请输入有效的应用主页地址");
            return;
        }
        if (callbacksURL.length === 0) {
            message.error("请至少添加一个回调地址");
            return;
        }
        if (callbacksURL.some(url => !validateURL(url))) {
            message.error("请输入有效的回调地址");
            return;
        }
        if (scopes.length === 0) {
            message.error("请至少选择一个范围");
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
            <h1 className="new-oauth-title">新建 OAuth 应用</h1>
            <label className="new-oauth-subtitle is-required" htmlFor="new-oauth-app-name">
                Application name
            </label>
            <Input
                autoComplete="off"
                className="new-oauth-input"
                id="new-oauth-app-name"
                maxLength={20}
                placeholder="Something users will recognize and trust."
                value={appName}
                onChange={e => setAppName(e.target.value)}
            />
            <label className="new-oauth-subtitle is-required" htmlFor="new-oauth-homepage-url">
                Homepage URL
            </label>
            <Input
                autoComplete="off"
                className="new-oauth-input"
                id="new-oauth-homepage-url"
                maxLength={100}
                placeholder="The full URL to your application homepage."
                value={homepageURL}
                onChange={e => setHomepageURL(e.target.value)}
            />
            <label className="new-oauth-subtitle is-required" htmlFor="new-oauth-app-desc">
                Application description
            </label>
            <Input.TextArea
                className="new-oauth-input new-oauth-textarea"
                id="new-oauth-app-desc"
                maxLength={300}
                placeholder="Something users will recognize and trust."
                rows={4}
                value={appDesc}
                onChange={e => setAppDesc(e.target.value)}
            />
            <h2 className="new-oauth-subtitle is-required">Authorization callback URL</h2>
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
                        title="delete"
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
                        title="add"
                        onClick={pushTempCallbackURL}
                    >
                        <SVGCirclePlusFilled />
                    </button>
                </div>
            )}
            <h2 className="new-oauth-subtitle is-required">权限管理</h2>
            <Table
                className="new-oauth-table"
                columns={scopesColumns}
                dataSource={scopesDataSource}
                locale={{
                    emptyText: "No Data",
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
                <Button onClick={() => history.goBack()}>取消</Button>
                <Button loading={loading} type="primary" onClick={submit}>
                    注册应用
                </Button>
            </div>
        </section>
    );
};

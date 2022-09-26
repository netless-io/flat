import React, { useCallback, useEffect, useState } from "react";
import { Spin, Button, Dropdown, Menu, Modal } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { SVGMore } from "flat-components";
import { deleteOAuth, listOAuth, OAuthInfo } from "@netless/flat-server-api";
import { useSafePromise } from "../../utils/hooks/lifecycle";
import { OAuthPageCommonProps } from "./index";

export interface OAuthListProps extends OAuthPageCommonProps {}

export const OAuthList: React.FC<OAuthListProps> = ({ navigate }) => {
    const sp = useSafePromise();
    const [data, setData] = useState<OAuthInfo[] | null>(null);

    useEffect(() => {
        sp(listOAuth(1, 50)).then(setData);
    }, [sp]);

    const onClickDropdownMenu = useCallback(
        async (key: string, info: OAuthInfo) => {
            if (key === "revoke") {
                Modal.confirm({
                    content: `确定删除${info.appName}吗？`,
                    onOk: async () => {
                        await sp(deleteOAuth(info.oauthUUID));
                        await sp(listOAuth(1, 50)).then(setData);
                    },
                });
            }
        },
        [sp],
    );

    return (
        <section className="oauth-list">
            <h3 className="oauth-list-header">
                <span className="oauth-list-title">应用名称</span>
                <Button onClick={() => navigate("new")}>新建 OAuth 应用</Button>
            </h3>
            {data === null ? (
                <div className="oauth-list-loading">
                    <Spin indicator={<LoadingOutlined spin />} />
                </div>
            ) : data.length === 0 ? (
                <div className="oauth-list-empty">No Data</div>
            ) : (
                <ul className="oauth-list-table">
                    {data.map(info => (
                        <li key={info.oauthUUID} className="oauth-list-item">
                            <img alt="logo" className="oauth-list-item-logo" src={info.logoURL} />
                            <a
                                className="oauth-list-item-name"
                                onClick={() => navigate("edit", info.oauthUUID)}
                            >
                                {info.appName}
                            </a>
                            <Dropdown
                                overlay={
                                    <Menu
                                        items={[
                                            {
                                                key: "revoke",
                                                label: "删除应用",
                                                className: "oauth-list-item-revoke",
                                            },
                                        ]}
                                        onClick={ev => onClickDropdownMenu(ev.key, info)}
                                    />
                                }
                                placement="bottomRight"
                                trigger={["click"]}
                            >
                                <button className="oauth-list-item-more">
                                    <SVGMore />
                                </button>
                            </Dropdown>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
};

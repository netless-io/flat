import React, { useCallback, useEffect, useMemo, useState } from "react";
import { SVGDelete } from "flat-components";
import { ApplicationInfo, listApplications, revokeApplication } from "@netless/flat-server-api";
import { Modal, Table, TableColumnsType } from "antd";
import { useTranslate } from "@netless/flat-i18n";
import { useSafePromise } from "../../utils/hooks/lifecycle";

export interface ApplicationsListProps {
    navigate: (app: ApplicationInfo) => void;
}

export const ApplicationsList: React.FC<ApplicationsListProps> = ({ navigate }) => {
    const t = useTranslate();
    const sp = useSafePromise();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<ApplicationInfo[]>([]);

    const revoke = useCallback(
        (item: ApplicationInfo) => {
            Modal.confirm({
                content: `确定取消对${item.appName}的授权吗？`,
                onOk: async () => {
                    await sp(revokeApplication(item.oauthUUID));
                    setData(data.filter(i => i !== item));
                },
            });
        },
        [data, sp],
    );

    const columns = useMemo<TableColumnsType<ApplicationInfo>>(
        () => [
            {
                key: "appName",
                dataIndex: "appName",
                title: "应用名称",
                render: (appName, item) => <a onClick={() => navigate(item)}>{appName}</a>,
            },
            {
                key: "ownerName",
                dataIndex: "ownerName",
                title: "创建者",
            },
            {
                key: "homepageURL",
                dataIndex: "homepageURL",
                title: "主页",
                render: url => (
                    <a href={url} rel="noreferrer" target="_blank">
                        {url}
                    </a>
                ),
            },
            {
                key: "action",
                render: (_, item) => (
                    <button
                        className="applications-revoke-btn"
                        title="revoke"
                        onClick={() => revoke(item)}
                    >
                        <SVGDelete className="applications-revoke-icon" />
                    </button>
                ),
            },
        ],
        [navigate, revoke],
    );

    useEffect(() => {
        // sp(listApplications(1, 50)).then(setData);
        sp(new Promise(r => setTimeout(r, 1000))).then(() => {
            // fake data
            setData([
                {
                    appName: "Hello",
                    homepageURL: "https://example.org",
                    logoURL: "http://placekitten.com/64/64",
                    oauthUUID: "uuid1",
                    ownerName: "world",
                },
            ]);

            setLoading(false);
        });
    }, [sp]);

    return (
        <div className="applications">
            {data.length ? (
                <p className="applications-stats">
                    You have granted {data.length} applications access to your account.
                </p>
            ) : null}
            <Table
                columns={columns}
                dataSource={data}
                loading={loading}
                locale={{
                    emptyText: "No Data",
                }}
                pagination={false}
                rowKey="oauthUUID"
            />
        </div>
    );
};

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
                content: t("apps-revoke-confirm", { appName: item.appName }),
                onOk: async () => {
                    await sp(revokeApplication(item.oauthUUID));
                    setData(data.filter(i => i !== item));
                },
            });
        },
        [data, sp, t],
    );

    const columns = useMemo<TableColumnsType<ApplicationInfo>>(
        () => [
            {
                key: "appName",
                dataIndex: "appName",
                title: t("oauth-app-name"),
                render: (appName, item) => <a onClick={() => navigate(item)}>{appName}</a>,
            },
            {
                key: "ownerName",
                dataIndex: "ownerName",
                title: t("oauth-app-creator"),
            },
            {
                key: "homepageURL",
                dataIndex: "homepageURL",
                title: t("oauth-homepage"),
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
                        title={t("delete")}
                        onClick={() => revoke(item)}
                    >
                        <SVGDelete className="applications-revoke-icon" />
                    </button>
                ),
            },
        ],
        [navigate, revoke, t],
    );

    useEffect(() => {
        setLoading(true);
        sp(listApplications(1, 50)).then(data => {
            setData(data);
            setLoading(false);
        });
    }, [sp]);

    return (
        <div className="applications">
            {data.length ? (
                <p className="applications-stats">{t("apps-stats", { count: data.length })}</p>
            ) : null}
            <Table
                columns={columns}
                dataSource={data}
                loading={loading}
                locale={{
                    emptyText: t("no-data"),
                }}
                pagination={false}
                rowKey="oauthUUID"
            />
        </div>
    );
};

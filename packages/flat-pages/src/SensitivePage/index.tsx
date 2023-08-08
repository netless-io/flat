import "./style.less";

import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { useIsomorphicLayoutEffect, useSearchParam } from "react-use";
import { Redirect } from "react-router-dom";

import type { ColumnsType } from "antd/lib/table";
import { subWeeks, subMonths, subYears } from "date-fns";
import { Select, Table } from "antd";

import { FlatPrefersColorScheme, useSafePromise } from "flat-components";
import { FlatI18n, useTranslate } from "@netless/flat-i18n";
import { SensitiveType, listSensitive } from "@netless/flat-server-api";
import { GlobalStoreContext, PreferencesStoreContext } from "../components/StoreProvider";

export type SensitiveRange = "1 week" | "1 month" | "1 year";

export interface SensitiveData {
    type: SensitiveType;
    name: string;
    purpose: string;
    description: string;
    count: number;
    content: string;
}

const SensitiveTypes: SensitiveType[] = [
    SensitiveType.Avatar,
    SensitiveType.Phone,
    SensitiveType.Name,
    SensitiveType.WeChatName,
    SensitiveType.CloudStorage,
    SensitiveType.Recording,
];

const BlankSensitiveTypes: SensitiveType[] = [SensitiveType.CloudStorage, SensitiveType.Recording];

export const SensitivePage = observer(function SensitivePage() {
    const t = useTranslate();
    const sp = useSafePromise();
    const globalStore = useContext(GlobalStoreContext);
    const preferences = useContext(PreferencesStoreContext);
    const token = useSearchParam("token") || globalStore.userInfo?.token;
    const userTheme = useSearchParam("theme") || preferences.prefersColorScheme;

    const defaultSensitiveData = useCallback(
        () =>
            SensitiveTypes.map(type => ({
                type,
                name: t("sensitive.name." + type),
                purpose: t("sensitive.purpose." + type),
                description: t("sensitive.description." + type),
                count: BlankSensitiveTypes.includes(type) ? -1 : 0,
                content: "",
            })),
        [t],
    );

    const [range, setRange] = useState<SensitiveRange>("1 week");
    const [data, setData] = useState<SensitiveData[]>([]);
    const [loading, setLoading] = useState(false);

    useIsomorphicLayoutEffect(() => {
        const theme: FlatPrefersColorScheme =
            userTheme === "dark" ? "dark" : userTheme === "light" ? "light" : "auto";
        preferences.updatePrefersColorScheme(theme);
    }, []);

    useEffect(() => {
        if (globalStore.needPhoneBinding) {
            FlatI18n.changeLanguage("zh-CN");
        }
    }, [globalStore.needPhoneBinding]);

    useEffect(() => {
        let from = new Date();
        if (range === "1 week") {
            from = subWeeks(from, 1);
        } else if (range === "1 month") {
            from = subMonths(from, 1);
        } else if (range === "1 year") {
            from = subYears(from, 1);
        }

        setLoading(true);
        sp(listSensitive({ from, to: new Date() }, undefined, token))
            .then(data => {
                const newData = data.reduce((acc, cur) => {
                    const index = acc.findIndex(e => e.type === cur.type);
                    if (index !== -1) {
                        acc[index].count += 1;
                        acc[index].content = reduceContent(
                            cur.type,
                            acc[index].content,
                            cur.content,
                        );
                    }
                    return acc;
                }, defaultSensitiveData());
                if (globalStore.needPhoneBinding) {
                    const phoneIndex = newData.findIndex(e => e.type === SensitiveType.Phone);
                    if (phoneIndex !== -1) {
                        newData[phoneIndex].count = Math.max(newData[phoneIndex].count, 1);
                    }
                }
                setData(newData);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [defaultSensitiveData, range, sp, t, token, globalStore.needPhoneBinding]);

    const columns = useMemo<ColumnsType<SensitiveData>>(
        () => [
            {
                title: t("sensitive.name.column"),
                dataIndex: "name",
                align: "center",
            },
            {
                title: t("sensitive.purpose.column"),
                dataIndex: "purpose",
            },
            {
                title: t("sensitive.description.column"),
                dataIndex: "description",
            },
            {
                title: t("sensitive.count.column"),
                dataIndex: "count",
                align: "center",
                render: (count: number) =>
                    count < 0 ? "" : count === 0 ? t("sensitive.no-data") : String(count),
            },
            {
                title: t("sensitive.content.column"),
                dataIndex: "content",
                align: "center",
            },
        ],
        [t],
    );

    if (!token) {
        return <Redirect to="/login" />;
    }

    return (
        <div className="sensitive-page-container">
            <div className="sensitive-page">
                <div className="sensitive-page-actions">
                    <Select loading={loading} value={range} onChange={setRange}>
                        <Select.Option key="1 week" value="1 week">
                            {t("sensitive-range.week")}
                        </Select.Option>
                        <Select.Option key="1 month" value="1 month">
                            {t("sensitive-range.month")}
                        </Select.Option>
                        <Select.Option key="1 year" value="1 year">
                            {t("sensitive-range.year")}
                        </Select.Option>
                    </Select>
                </div>
                <Table
                    className="sensitive-page-table"
                    columns={columns}
                    dataSource={data}
                    loading={loading}
                    locale={{ emptyText: t("no-data") }}
                    pagination={false}
                    rowKey="type"
                />
            </div>
        </div>
    );
});

export default SensitivePage;

function reduceContent(type: SensitiveType, _content: string, input: string): string {
    if (type === SensitiveType.Avatar) {
        return "/";
    }
    // otherwise always return the last one
    return input;
}

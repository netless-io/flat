import "./style.less";

import React, { useMemo } from "react";
import { Breadcrumb } from "antd";
import rightSVG from "./icons/right.svg";
import { useTranslate } from "@netless/flat-i18n";

export interface CloudStorageNavigationProps {
    // eg: /cloud/path/to/video
    path: string;
    pushHistory: (path: string) => void;
}

export const CloudStorageNavigation = /* @__PURE__ */ React.memo<CloudStorageNavigationProps>(
    function CloudStorageNavigation({ path, pushHistory }) {
        const t = useTranslate();
        const pathName = useMemo(() => path.split("/").filter(Boolean), [path]);
        // if the path name length >= breadcrumbMaxLength,
        // the breadcrumb style will like this: /myCloudStorage/.../aa/bb/current path/
        const breadcrumbMaxLength = 5;
        return (
            <div className="cloud-storage-navigation-container">
                <Breadcrumb separator={<img src={rightSVG} />}>
                    {pathName.length >= breadcrumbMaxLength ? (
                        <>
                            <Breadcrumb.Item>
                                <a onClick={() => pushHistory("/")}>{t("my-cloud")}</a>
                            </Breadcrumb.Item>
                            <Breadcrumb.Item>
                                <span className="cloud-storage-navigation-more-path">...</span>
                            </Breadcrumb.Item>
                            {pathName.map((path, index) => {
                                const routePath =
                                    "/" + pathName.slice(0, index + 1).join("/") + "/";
                                // the -3 number mean that is get the last three elements of path name array
                                if (pathName.slice(-3).some(pathVal => path === pathVal)) {
                                    return (
                                        <Breadcrumb.Item key={index}>
                                            <a onClick={() => pushHistory(routePath)}>{path}</a>
                                        </Breadcrumb.Item>
                                    );
                                }
                                return null;
                            })}
                        </>
                    ) : (
                        <>
                            <Breadcrumb.Item>
                                <a onClick={() => pushHistory("/")}>{t("my-cloud")}</a>
                            </Breadcrumb.Item>
                            {pathName.map((path, index) => {
                                const routePath =
                                    "/" + pathName.slice(0, index + 1).join("/") + "/";
                                return (
                                    <Breadcrumb.Item key={index}>
                                        <a onClick={() => pushHistory(routePath)}>{path}</a>
                                    </Breadcrumb.Item>
                                );
                            })}
                        </>
                    )}
                </Breadcrumb>
            </div>
        );
    },
);

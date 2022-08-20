import "./style.less";

import React from "react";
import { QuestionCircleOutlined } from "@ant-design/icons";
import classNames from "classnames";
import { Tooltip, TooltipProps } from "antd";

export type CloudStorageFileListHeadTipProps = TooltipProps;

export const CloudStorageFileListHeadTip =
    /* @__PURE__ */ React.memo<CloudStorageFileListHeadTipProps>(
        function CloudStorageFileListHeadTip(props) {
            const { className, ...restProps } = props;
            return (
                <Tooltip
                    {...restProps}
                    className={classNames(className, "cloud-storage-file-list-help")}
                >
                    <QuestionCircleOutlined />
                </Tooltip>
            );
        },
    );

import "./style.less";

import React from "react";
import { QuestionCircleOutlined } from "@ant-design/icons";
import Tooltip, { TooltipProps } from "antd/lib/tooltip";
import classNames from "classnames";

export type CloudStorageFileListHeadTipProps = TooltipProps;

export const CloudStorageFileListHeadTip = React.memo<CloudStorageFileListHeadTipProps>(
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

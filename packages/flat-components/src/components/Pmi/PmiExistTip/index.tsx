import "./style.less";

import { Tooltip } from "antd";
import React, { FC } from "react";
import { useTranslate } from "@netless/flat-i18n";
import { QuestionCircleOutlined } from "@ant-design/icons";

export interface PmiExistTipProps {
    title?: string;
}

export const PmiExistTip: FC<PmiExistTipProps> = ({ title }) => {
    const t = useTranslate();

    return (
        <Tooltip className="pmi-room-help" title={title || t("pmi-room-exist")}>
            <QuestionCircleOutlined />
        </Tooltip>
    );
};

export default PmiExistTip;

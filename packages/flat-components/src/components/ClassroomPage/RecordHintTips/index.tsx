import "./style.less";

import React, { FC } from "react";
import { CloseOutlined } from "@ant-design/icons";
import { Button, Tooltip } from "antd";
import { useTranslate } from "@netless/flat-i18n";

export interface RecordHintTipsProps {
    visible: boolean;
    onClose: () => void;
}

export const RecordHintTips: FC<RecordHintTipsProps> = ({ visible, onClose, children }) => {
    const t = useTranslate();

    return (
        <Tooltip
            color="rgba(68, 78, 96, 0.72)"
            open={visible}
            overlayClassName="record-hint-tips"
            placement="bottom"
            title={
                <div>
                    {t("start-class-tips")}
                    <Button
                        className="record-hint-tips-close"
                        icon={<CloseOutlined />}
                        size="small"
                        type="text"
                        onClick={onClose}
                    />
                </div>
            }
        >
            {children}
        </Tooltip>
    );
};

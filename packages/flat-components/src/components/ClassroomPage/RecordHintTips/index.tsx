import "./style.less";

import React, { FC } from "react";
import { CloseOutlined } from "@ant-design/icons";
import { Button, Tooltip } from "antd";
import { useTranslation } from "react-i18next";

export interface RecordHintTipsProps {
    visible: boolean;
    onClose: () => void;
}

export const RecordHintTips: FC<RecordHintTipsProps> = ({ visible, onClose, children }) => {
    const { t } = useTranslation();

    return (
        <Tooltip
            overlayClassName="record-hint-tips"
            placement="bottom"
            color="rgba(68, 78, 96, 0.72)"
            visible={visible}
            title={
                <div>
                    {t("start-class-tips")}
                    <Button
                        className="record-hint-tips-close"
                        size="small"
                        type="text"
                        icon={<CloseOutlined />}
                        onClick={onClose}
                    />
                </div>
            }
        >
            {children}
        </Tooltip>
    );
};

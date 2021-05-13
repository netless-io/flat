import "./style.less";

import React, { FC, useState } from "react";
import { CloseOutlined } from "@ant-design/icons";
import { Button, Tooltip } from "antd";

export const RecordHintTips: FC = ({ children }) => {
    const [visible, setVisible] = useState(true);
    return (
        <Tooltip
            overlayClassName="record-hint-tips"
            placement="bottom"
            color="rgba(68, 78, 96, 0.72)"
            visible={visible}
            title={
                <div>
                    点击「开始上课」才能录制并生成回放哦~
                    <Button
                        className="record-hint-tips-close"
                        size="small"
                        type="text"
                        icon={<CloseOutlined />}
                        onClick={() => setVisible(false)}
                    />
                </div>
            }
        >
            {children}
        </Tooltip>
    );
};

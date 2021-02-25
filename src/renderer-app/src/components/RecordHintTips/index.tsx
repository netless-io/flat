import "./RecordHintTips.less";

import React, { useContext } from "react";
import { observer } from "mobx-react-lite";
import { CloseOutlined } from "@ant-design/icons";
import { Button, Tooltip } from "antd";
import { GlobalStoreContext } from "../StoreProvider";

export interface RecordHintTipsProps {}

export const RecordHintTips = observer<RecordHintTipsProps>(function RecordHintTips(props) {
    const globalStore = useContext(GlobalStoreContext);

    return (
        <Tooltip
            overlayClassName="record-hint-tips"
            placement="bottom"
            color="rgba(68, 78, 96, 0.72)"
            visible={globalStore.isShowRecordHintTips}
            title={
                <div>
                    点击「开始上课」才能录制并生成回放哦~
                    <Button
                        className="record-hint-tips-close"
                        size="small"
                        type="text"
                        icon={<CloseOutlined />}
                        onClick={globalStore.hideRecordHintTips}
                    />
                </div>
            }
        >
            {props.children}
        </Tooltip>
    );
});

export default RecordHintTips;

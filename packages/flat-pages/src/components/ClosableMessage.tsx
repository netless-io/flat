import "./ClosableMessage.less";

import React, { useEffect, useState } from "react";
import classNames from "classnames";
import { CloseOutlined, InfoCircleFilled } from "@ant-design/icons";
import { observer } from "mobx-react-lite";
import { ClassroomStore } from "@netless/flat-stores";

interface ClosableMessageProps {
    classroom: ClassroomStore;
}

export const ClosableMessage = observer<ClosableMessageProps>(function ClosableMessage({
    classroom,
}) {
    // Save the last non-empty message so that it can be displayed when the message is closed
    const [lastMsg, setLastMsg] = useState(classroom.adminMessage);

    useEffect(() => {
        classroom.adminMessage && setLastMsg(classroom.adminMessage);
    }, [classroom.adminMessage]);

    return (
        <div
            className={classNames("closable-message", "ant-message", {
                "is-open": classroom.adminMessage,
            })}
        >
            <div>
                <div className="ant-message-notice">
                    <div className="ant-message-notice-content">
                        <div className="ant-message-custom-content ant-message-info">
                            <InfoCircleFilled />
                            <span>{lastMsg}</span>
                            <button
                                className="closable-message-btn"
                                onClick={classroom.hideAdminMessage}
                            >
                                <CloseOutlined />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

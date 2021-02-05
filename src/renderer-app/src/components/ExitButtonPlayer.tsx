import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import { Button, Modal } from "antd";
import { TopBarRightBtn } from "./TopBarRightBtn";
import { RoomType } from "../apiMiddleware/flatServer/constants";
import { RouteNameType, usePushHistory } from "../utils/routes";

import replayScreen from "../assets/image/replay-screen.png";
import "./ExitButton.less";

export type ExitButtonPlayerProps = {
    roomUUID: string;
    ownerUUID: string;
    roomType: RoomType;
};

export const ExitButtonPlayer = observer<ExitButtonPlayerProps>(function ExitButtonPlayer({
    roomUUID,
    ownerUUID,
    roomType,
}) {
    const [exitViewDisable, setExitViewDisable] = useState(false);
    const pushHistory = usePushHistory();

    return (
        <div>
            <TopBarRightBtn title="Exit" icon="wrong" onClick={() => setExitViewDisable(true)} />
            <Modal
                visible={exitViewDisable}
                footer={null}
                title={"退出回放"}
                onCancel={() => setExitViewDisable(false)}
            >
                <div className="modal-box">
                    <div onClick={openClassRoom}>
                        <img className="modal-box-img" src={replayScreen} />
                    </div>
                    <div className="modal-box-name">回到白板</div>
                    <Button
                        onClick={() => pushHistory(RouteNameType.SplashPage)}
                        style={{ width: 176 }}
                        size="large"
                    >
                        确认退出
                    </Button>
                </div>
            </Modal>
        </div>
    );

    function openClassRoom(): void {
        switch (roomType) {
            case RoomType.BigClass: {
                pushHistory(RouteNameType.BigClassPage, {
                    roomUUID,
                    ownerUUID,
                });
                break;
            }
            case RoomType.SmallClass: {
                pushHistory(RouteNameType.SmallClassPage, {
                    roomUUID,
                    ownerUUID,
                });
                break;
            }
            case RoomType.OneToOne: {
                pushHistory(RouteNameType.OneToOnePage, {
                    roomUUID,
                    ownerUUID,
                });
                break;
            }
            default: {
                break;
            }
        }
    }
});

export default ExitButtonPlayer;

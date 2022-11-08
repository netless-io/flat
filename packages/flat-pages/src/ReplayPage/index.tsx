import "./ReplayPage.less";

import classNames from "classnames";
import { observer } from "mobx-react-lite";
import React, { useContext, useState } from "react";
import { RouteComponentProps, useHistory } from "react-router-dom";

import { RoomType } from "@netless/flat-server-api";
import { LoadingPage, TopBar } from "flat-components";

import ExitReplayConfirm from "../components/ExitReplayConfirm";
import { WindowsSystemBtnContext } from "../components/StoreProvider";
import { useClassroomReplayStore } from "../utils/use-classroom-replay-store";
import { useLoginCheck } from "../utils/use-login-check";
import { ReplayList } from "./ReplayList";
import { ReplayVideo } from "./ReplayVideo";
import { ReplayWhiteboard } from "./ReplayWhiteboard";

export type ReplayPageProps = RouteComponentProps<{
    roomUUID: string;
    ownerUUID: string;
    roomType: RoomType;
}>;

export const ReplayPage = observer<ReplayPageProps>(function ReplayPage({ match }) {
    useLoginCheck();

    const history = useHistory();
    const classroomReplayStore = useClassroomReplayStore(match.params);
    const [showExitReplayModal, setShowExitReplayModal] = useState(false);

    const windowsBtn = useContext(WindowsSystemBtnContext);

    if (!classroomReplayStore) {
        return <LoadingPage />;
    }

    return (
        <div className="replay-container">
            {windowsBtn && (
                <TopBar
                    showWindowsSystemBtn={windowsBtn.showWindowsBtn}
                    onClickWindowsSystemBtn={windowsBtn.onClickWindowsSystemBtn}
                    onDoubleClick={windowsBtn.clickWindowMaximize}
                />
            )}
            <div className="replay-videos is-horizontal">
                <ReplayVideo classroomReplayStore={classroomReplayStore} />
            </div>
            <div className="replay-content">
                <ReplayWhiteboard classroomReplayStore={classroomReplayStore} />
                <div className="replay-share-screen">{/* TODO */}</div>
                <div
                    className={classNames("replay-bottom", {
                        "is-playing": classroomReplayStore.isPlaying,
                    })}
                >
                    <ReplayList classroomReplayStore={classroomReplayStore} />
                </div>
            </div>
            <ExitReplayConfirm
                visible={showExitReplayModal}
                onCancel={() => setShowExitReplayModal(false)}
                onConfirm={() => history.goBack()}
                onSendWindowWillClose={() => setShowExitReplayModal(true)}
            />
        </div>
    );
});

export default ReplayPage;

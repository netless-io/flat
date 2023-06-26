import "./ReplayPage.less";

import classNames from "classnames";
import { observer } from "mobx-react-lite";
import React, { useContext, useMemo, useState } from "react";
import { RouteComponentProps, useHistory } from "react-router-dom";
import { useWindowSize } from "react-use";

import { RoomType } from "@netless/flat-server-api";
import { LoadingPage, TopBar } from "flat-components";

import { WeChatRedirect } from "../AppRoutes/WeChatRedirect";
import { ExitReplayConfirm } from "../components/ExitReplayConfirm";
import { WindowsSystemBtnContext } from "../components/StoreProvider";
import { useClassroomReplayStore } from "../utils/use-classroom-replay-store";
import { useLoginCheck } from "../utils/use-login-check";
import { ReplayList } from "./ReplayList";
import { ReplayVideo } from "./ReplayVideo";
import { ReplayWhiteboard } from "./ReplayWhiteboard";
import { withFlatServices } from "../components/FlatServicesContext";
import { isWeChatBrowser } from "../utils/user-agent";

export type ReplayPageProps = RouteComponentProps<{
    roomUUID: string;
    ownerUUID: string;
    roomType: RoomType;
}>;

export const ReplayPage = observer<ReplayPageProps>(function ReplayPage({ ...props }) {
    const { width } = useWindowSize(1080);

    const url = useMemo(() => {
        const { roomUUID, ownerUUID, roomType } = props.match.params;
        return `x-agora-flat-client://replayRoom?roomUUID=${roomUUID}&ownerUUID=${ownerUUID}&roomType=${roomType}`;
    }, [props.match]);

    if (isWeChatBrowser || width < 480) {
        return <WeChatRedirect open url={url} />;
    }

    return <ReplayPageImpl {...props} />;
});

export const ReplayPageImpl = withFlatServices("whiteboard")(
    observer<ReplayPageProps>(function ReplayPageImpl({ match }) {
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
    }),
);

export default ReplayPage;

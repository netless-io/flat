import React, { useEffect, useRef, useState } from "react";
import { message } from "antd";
import { ViewMode } from "white-web-sdk";
import { observer } from "mobx-react-lite";
import { useHistory, useParams } from "react-router";

import InviteButton from "../../components/InviteButton";
import { TopBar, TopBarDivider } from "../../components/TopBar";
import { TopBarRoundBtn } from "../../components/TopBarRoundBtn";
import { TopBarRightBtn } from "../../components/TopBarRightBtn";
import { RealtimePanel } from "../../components/RealtimePanel";
import { ChatPanel } from "../../components/ChatPanel";
import { SmallClassAvatar } from "./SmallClassAvatar";
import { NetworkStatus } from "../../components/NetworkStatus";
import { RecordButton } from "../../components/RecordButton";
import { RoomInfo } from "../../components/RoomInfo";
import { Whiteboard } from "../../components/Whiteboard";
import { withRtcRoute, WithRtcRouteProps } from "../../components/Rtc";
import { RtmRenderProps, withRtmRoute, WithRtmRouteProps } from "../../components/Rtm";
import { RTMUser } from "../../components/ChatPanel/ChatUser";
import ExitRoomConfirm, { ExitRoomConfirmType } from "../../components/ExitRoomConfirm";

import { Identity } from "../../utils/localStorage/room";
import { ipcAsyncByMain } from "../../utils/ipc";
import { RtcChannelType } from "../../apiMiddleware/Rtc";
import { ClassModeType } from "../../apiMiddleware/Rtm";
import { RoomStatus } from "../../apiMiddleware/flatServer/constants";
import { AgoraCloudRecordLayoutConfigItem } from "../../apiMiddleware/flatServer/agora";
import { useWhiteboardStore } from "../../stores/WhiteboardStore";

import "./SmallClassPage.less";

const AVATAR_WIDTH = 144;
const AVATAR_HEIGHT = 108;
const MAX_AVATAR_COUNT = 17;
const AVATAR_BAR_GAP = 4;
const AVATAR_BAR_WIDTH = (AVATAR_WIDTH + AVATAR_BAR_GAP) * MAX_AVATAR_COUNT - AVATAR_BAR_GAP;

export interface RouterParams {
    identity: Identity;
    uuid: string;
    userId: string;
}

export type SmallClassPageProps = WithRtcRouteProps & WithRtmRouteProps;

export const SmallClassPage = observer<SmallClassPageProps>(props => {
    // @TODO remove ref
    const exitRoomConfirmRef = useRef((_confirmType: ExitRoomConfirmType) => {});

    const history = useHistory();
    const params = useParams<RouterParams>();

    const whiteboardStore = useWhiteboardStore(params.identity === Identity.creator);

    const [isRealtimeSideOpen, openRealtimeSide] = useState(true);

    useEffect(() => {
        ipcAsyncByMain("set-win-size", {
            width: 1200,
            height: 700,
        });
    }, []);

    useEffect(() => {
        if (props.rtm.roomStatus === RoomStatus.Stopped) {
            history.push("/user/");
        }
    }, [props.rtm.roomStatus, history]);

    const loadedInitCallingOnceRef = useRef(false);
    useEffect(() => {
        if (!loadedInitCallingOnceRef.current && props.rtm.currentUser) {
            const { isCalling, toggleCalling } = props.rtc;
            if (!isCalling) {
                toggleCalling(props.rtm.currentUser.rtcUID);
                loadedInitCallingOnceRef.current = true;
            }
        }
        // only track when the currentUser is ready
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.rtm.currentUser]);

    useEffect(
        () => {
            if (
                props.rtm.currentUser &&
                whiteboardStore.room &&
                params.identity !== Identity.creator
            ) {
                const isWritable =
                    props.rtm.classMode === ClassModeType.Interaction ||
                    props.rtm.currentUser.isSpeak;
                if (whiteboardStore.room.disableDeviceInputs === isWritable) {
                    whiteboardStore.room.disableDeviceInputs = !isWritable;
                    whiteboardStore.room.setWritable(isWritable);
                }
            }
        },
        // exhaustive-deps is too dumb to work with fancy expression
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [
            // eslint-disable-next-line react-hooks/exhaustive-deps
            props.rtm.currentUser?.isSpeak,
            props.rtm.classMode,
            whiteboardStore.room,
            params.identity,
        ],
    );

    // @TODO use mobx computed
    const totalUserCount = activeUserCount(props.rtm);

    useEffect(() => {
        if (props.rtc.isRecording) {
            props.rtc.cloudRecording?.updateLayout({
                mixedVideoLayout: 3,
                backgroundColor: "#F3F6F9",
                layoutConfig: updateRecordLayout(totalUserCount),
            });
        }
        // ignore cloudRecording
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.rtc.isRecording, totalUserCount]);

    return (
        <div className="realtime-box">
            <TopBar
                left={renderTopBarLeft()}
                center={renderTopBarCenter()}
                right={renderTopBarRight()}
            />
            {renderAvatars()}
            <div className="realtime-content">
                <Whiteboard whiteboardStore={whiteboardStore} />
                {renderRealtimePanel()}
            </div>
            <ExitRoomConfirm
                identity={params.identity}
                history={history}
                roomStatus={props.rtm.roomStatus}
                stopClass={props.rtm.stopClass}
                confirmRef={exitRoomConfirmRef}
            />
        </div>
    );

    function renderAvatars(): React.ReactNode {
        const { creator, speakingJoiners, handRaisingJoiners, joiners, classMode } = props.rtm;

        if (!creator) {
            return null;
        }

        return (
            <div className="realtime-avatars-wrap">
                <div className="realtime-avatars">
                    {renderAvatar(creator)}
                    {speakingJoiners.map(renderAvatar)}
                    {classMode === ClassModeType.Interaction && (
                        <>
                            {handRaisingJoiners.map(renderAvatar)}
                            {joiners.map(renderAvatar)}
                        </>
                    )}
                </div>
            </div>
        );
    }

    function renderTopBarLeft(): React.ReactNode {
        return (
            <>
                <NetworkStatus />
                {params.identity === Identity.joiner && (
                    <RoomInfo
                        roomStatus={props.rtm.roomStatus}
                        roomType={props.rtm.roomInfo?.roomType}
                    />
                )}
            </>
        );
    }

    function renderClassMode(): React.ReactNode {
        const { classMode, toggleClassMode } = props.rtm;

        return classMode === ClassModeType.Lecture ? (
            <TopBarRoundBtn
                title="当前为讲课模式"
                dark
                iconName="class-interaction"
                onClick={toggleClassMode}
            >
                切换至互动模式
            </TopBarRoundBtn>
        ) : (
            <TopBarRoundBtn
                title="当前为互动模式"
                dark
                iconName="class-lecture"
                onClick={toggleClassMode}
            >
                切换至讲课模式
            </TopBarRoundBtn>
        );
    }

    function renderTopBarCenter(): React.ReactNode {
        const { roomStatus, pauseClass, resumeClass, startClass } = props.rtm;

        if (params.identity !== Identity.creator) {
            return null;
        }

        switch (roomStatus) {
            case RoomStatus.Started:
                return (
                    <>
                        {renderClassMode()}
                        <TopBarRoundBtn iconName="class-pause" onClick={pauseClass}>
                            暂停上课
                        </TopBarRoundBtn>
                        <TopBarRoundBtn iconName="class-stop" onClick={stopClass}>
                            结束上课
                        </TopBarRoundBtn>
                    </>
                );
            case RoomStatus.Paused:
                return (
                    <>
                        {renderClassMode()}
                        <TopBarRoundBtn iconName="class-pause" onClick={resumeClass}>
                            恢复上课
                        </TopBarRoundBtn>
                        <TopBarRoundBtn iconName="class-stop" onClick={stopClass}>
                            结束上课
                        </TopBarRoundBtn>
                    </>
                );
            default:
                return (
                    <TopBarRoundBtn iconName="class-begin" onClick={startClass}>
                        开始上课
                    </TopBarRoundBtn>
                );
        }
    }

    function renderTopBarRight(): React.ReactNode {
        const { viewMode } = whiteboardStore;
        const { isRecording, toggleRecording } = props.rtc;
        const { roomStatus } = props.rtm;
        const isCreator = params.identity === Identity.creator;

        return (
            <>
                {isCreator &&
                    (roomStatus === RoomStatus.Started || roomStatus === RoomStatus.Paused) && (
                        <RecordButton
                            disabled={false}
                            isRecording={isRecording}
                            onClick={() => {
                                toggleRecording();
                            }}
                        />
                    )}
                {isCreator && (
                    <TopBarRightBtn
                        title="Vision control"
                        icon="follow"
                        active={viewMode === ViewMode.Broadcaster}
                        onClick={handleRoomController}
                    />
                )}
                <TopBarRightBtn
                    title="Docs center"
                    icon="folder"
                    onClick={whiteboardStore.toggleFileOpen}
                />
                <InviteButton uuid={params.uuid} />
                {/* @TODO implement Options menu */}
                <TopBarRightBtn title="Options" icon="options" onClick={() => {}} />
                <TopBarRightBtn
                    title="Exit"
                    icon="exit"
                    onClick={() => {
                        // @TODO remove ref
                        exitRoomConfirmRef.current(ExitRoomConfirmType.ExitButton);
                    }}
                />
                <TopBarDivider />
                <TopBarRightBtn
                    title="Open side panel"
                    icon="hide-side"
                    active={isRealtimeSideOpen}
                    onClick={handleSideOpenerSwitch}
                />
            </>
        );
    }

    function renderRealtimePanel(): React.ReactNode {
        return (
            <RealtimePanel
                isShow={isRealtimeSideOpen}
                isVideoOn={false}
                videoSlot={null}
                chatSlot={
                    <ChatPanel
                        userId={params.userId}
                        channelID={params.uuid}
                        identity={params.identity}
                        rtm={props.rtm}
                        allowMultipleSpeakers={true}
                    ></ChatPanel>
                }
            />
        );
    }

    function renderAvatar(user: RTMUser): React.ReactNode {
        const { rtcEngine } = props.rtc.rtc;
        const { updateDeviceState } = props.rtm;

        return (
            <SmallClassAvatar
                key={user.uuid}
                identity={params.identity}
                userId={params.userId}
                avatarUser={user}
                rtcEngine={rtcEngine}
                updateDeviceState={updateDeviceState}
            />
        );
    }

    function handleRoomController(): void {
        const { room } = whiteboardStore;
        if (!room) {
            return;
        }
        if (room.state.broadcastState.mode !== ViewMode.Broadcaster) {
            room.setViewMode(ViewMode.Broadcaster);
            message.success("其他用户将跟随您的视角");
        } else {
            room.setViewMode(ViewMode.Freedom);
            message.success("其他用户将停止跟随您的视角");
        }
    }

    function handleSideOpenerSwitch(): void {
        openRealtimeSide(isRealtimeSideOpen => !isRealtimeSideOpen);
    }

    function stopClass(): void {
        // @TODO remove ref
        exitRoomConfirmRef.current(ExitRoomConfirmType.StopClassButton);
    }
});

export default withRtcRoute({
    recordingConfig: {
        channelType: RtcChannelType.Communication,
        transcodingConfig: {
            width: AVATAR_BAR_WIDTH,
            height: AVATAR_HEIGHT,
            // https://docs.agora.io/cn/cloud-recording/recording_video_profile
            fps: 15,
            bitrate: 500,
            mixedVideoLayout: 3,
            backgroundColor: "#F3F6F9",
            layoutConfig: updateRecordLayout(1),
        },
        maxIdleTime: 60,
        subscribeUidGroup: 3,
    },
})(withRtmRoute(SmallClassPage));

function updateRecordLayout(userCount: number): AgoraCloudRecordLayoutConfigItem[] {
    const layoutConfig: AgoraCloudRecordLayoutConfigItem[] = [];
    // the left most x position to start rendering the avatars
    let startX = 0;

    if (userCount < 7) {
        // center the avatars
        const avatarsWidth = userCount * (AVATAR_WIDTH + AVATAR_BAR_GAP) - AVATAR_BAR_GAP;
        // 1168 is the default visible avatar bar width
        startX = (1168 - avatarsWidth) / 2;
    }

    // calculate the max rendered config count
    // because x_axis cannot overflow
    const layoutConfigCount = Math.floor(
        (AVATAR_BAR_WIDTH - startX + AVATAR_BAR_GAP) / (AVATAR_WIDTH + AVATAR_BAR_GAP),
    );

    for (let i = 0; i < layoutConfigCount; i++) {
        layoutConfig.push({
            x_axis: (startX + i * (AVATAR_WIDTH + AVATAR_BAR_GAP)) / AVATAR_BAR_WIDTH,
            y_axis: 0,
            width: AVATAR_WIDTH / AVATAR_BAR_WIDTH,
            height: 1,
        });
    }

    return layoutConfig;
}

/**
 * users with camera or mic on
 */
function activeUserCount(rtm: RtmRenderProps): number {
    let count = (rtm.creator ? 1 : 0) + rtm.speakingJoiners.length;
    if (rtm.classMode === ClassModeType.Interaction) {
        count += rtm.handRaisingJoiners.length + rtm.joiners.length;
    }
    return count;
}

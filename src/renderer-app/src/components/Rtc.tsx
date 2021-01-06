import React from "react";
import { RouteComponentProps } from "react-router";
import { v4 as uuidv4 } from "uuid";
import { Rtc as RtcApi, RtcChannelType } from "../apiMiddleware/Rtc";
import { CloudRecording, StartPayload } from "../apiMiddleware/CloudRecording";
import { getRoom, Identity, updateRoomProps } from "../utils/localStorage/room";
import { AGORA } from "../constants/Process";

export interface RtcRenderProps extends RtcState {
    rtc: RtcApi;
    cloudRecording: CloudRecording | null;
    channelType: RtcChannelType;
    toggleRecording: (callback?: () => void) => void;
    toggleCalling: (callback?: () => void) => void;
}

export interface RtcProps {
    children: (props: RtcRenderProps) => React.ReactNode;
    roomId: string;
    userId: string;
    identity: Identity;
    recordingConfig: StartPayload["clientRequest"]["recordingConfig"];
}

export type RtcState = {
    isRecording: boolean;
    isCalling: boolean;
    recordingUuid?: string;
};

export class Rtc extends React.Component<RtcProps, RtcState> {
    private rtc = new RtcApi({
        channelType: this.props.recordingConfig.channelType ?? RtcChannelType.Broadcast,
    });
    private cloudRecording: CloudRecording | null = null;
    private cloudRecordingInterval: number | undefined;
    private recordStartTime: number | null = null;

    state: RtcState = {
        isRecording: false,
        isCalling: false,
    };

    public async componentWillUnmount(): Promise<void> {
        if (this.state.isCalling) {
            this.rtc.leave();
        }
        if (this.cloudRecordingInterval) {
            window.clearInterval(this.cloudRecordingInterval);
            this.cloudRecordingInterval = void 0;
        }
        if (this.cloudRecording?.isRecording) {
            try {
                await this.cloudRecording.stop();
            } catch (e) {
                console.error(e);
            }
        }
        this.cloudRecording = null;

        this.rtc.destroy();
    }

    render(): React.ReactNode {
        return this.props.children({
            ...this.state,
            rtc: this.rtc,
            cloudRecording: this.cloudRecording,
            channelType: this.props.recordingConfig.channelType ?? RtcChannelType.Communication,
            toggleCalling: this.toggleCalling,
            toggleRecording: this.toggleRecording,
        });
    }

    private startRecording = async (): Promise<void> => {
        const { roomId, recordingConfig } = this.props;
        this.recordStartTime = Date.now();
        if (this.state.isCalling && !this.cloudRecording?.isRecording) {
            this.cloudRecording = new CloudRecording({
                cname: roomId,
                uid: "1", // 不能与频道内其他用户冲突
            });
            await this.cloudRecording.start({
                storageConfig: this.cloudRecording.defaultStorageConfig(),
                recordingConfig,
            });
            // @TODO 临时避免频道被关闭（默认30秒无活动），后面会根据我们的需求修改并用 polly-js 管理重发。
            this.cloudRecordingInterval = window.setInterval(() => {
                if (this.cloudRecording?.isRecording) {
                    this.cloudRecording.query().catch(console.warn);
                }
            }, 10000);
        }
    };

    private stopRecording = async (): Promise<void> => {
        if (this.recordStartTime !== null) {
            this.saveRecording({
                uuid: uuidv4(),
                startTime: this.recordStartTime,
                endTime: Date.now(),
                videoUrl: this.cloudRecording?.isRecording ? this.getm3u8url() : undefined,
            });
        }
        if (this.cloudRecordingInterval) {
            window.clearInterval(this.cloudRecordingInterval);
        }
        if (this.cloudRecording?.isRecording) {
            try {
                await this.cloudRecording.stop();
            } catch (e) {
                console.error(e);
            }
        }
        this.cloudRecording = null;
    };

    private toggleRecording = (callback?: () => void): void => {
        this.setState(
            state => ({ isRecording: !state.isRecording }),
            async () => {
                if (this.state.isRecording) {
                    await this.startRecording();
                } else {
                    await this.stopRecording();
                }
                if (callback) {
                    callback();
                }
            },
        );
    };

    private toggleCalling = (callback?: () => void): void => {
        this.setState(
            state => ({ isCalling: !state.isCalling }),
            async () => {
                if (this.state.isCalling) {
                    const { roomId, identity, userId } = this.props;
                    this.rtc.join(roomId, identity, userId);
                } else {
                    if (this.cloudRecording?.isRecording) {
                        await this.stopRecording();
                    }
                    this.rtc.leave();
                }
                if (callback) {
                    callback();
                }
            },
        );
    };

    private saveRecording = (recording: {
        uuid: string;
        startTime: number;
        endTime: number;
        videoUrl?: string;
    }): void => {
        const { roomId } = this.props;
        const room = getRoom(roomId);
        if (room) {
            if (room.recordings) {
                room.recordings.push(recording);
            } else {
                room.recordings = [recording];
            }
            updateRoomProps(roomId, room);
        }
        this.setState({ recordingUuid: recording.uuid });
        this.recordStartTime = null;
    };

    private getm3u8url(): string {
        if (!this.cloudRecording) {
            return "";
        }

        return `${AGORA.OSS_PREFIX}${AGORA.OSS_FOLDER}/${this.cloudRecording.sid}_${this.cloudRecording.cname}.m3u8`;
    }
}

export type WithRtcRouteProps = { rtc: RtcRenderProps } & RouteComponentProps<{
    identity: Identity;
    uuid: string;
    userId: string;
}>;

export function withRtcRoute(config: { recordingConfig: RtcProps["recordingConfig"] }) {
    return function <Props>(Comp: React.ComponentType<Props & WithRtcRouteProps>) {
        return class WithRtcRoute extends React.Component<
            Props & Omit<WithRtcRouteProps, "whiteboard">
        > {
            render() {
                const { uuid, userId, identity } = this.props.match.params;
                return (
                    <Rtc
                        roomId={uuid}
                        userId={userId}
                        identity={identity}
                        recordingConfig={config.recordingConfig}
                    >
                        {this.renderChildren}
                    </Rtc>
                );
            }

            renderChildren = (props: RtcRenderProps) => <Comp {...this.props} rtc={props} />;
        };
    };
}

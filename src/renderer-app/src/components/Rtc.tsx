import React from "react";
import { RouteComponentProps } from "react-router";
import { v4 as uuidv4 } from "uuid";
import { Rtc as RtcApi, RtcChannelType } from "../apiMiddleware/Rtc";
import { CloudRecording } from "../apiMiddleware/CloudRecording";
import { getRoom, Identity, saveRoom, updateRoomProps } from "../utils/localStorage/room";
import { AGORA } from "../constants/Process";
import { CloudRecordStartPayload } from "../apiMiddleware/flatServer/agora";

export interface RtcRenderProps extends RtcState {
    rtc: RtcApi;
    cloudRecording: CloudRecording | null;
    channelType: RtcChannelType;
    toggleRecording: (callback?: () => void) => void;
    toggleCalling: (rtcUID: number, callback?: () => void) => void;
}

export interface RtcProps {
    children: (props: RtcRenderProps) => React.ReactNode;
    roomId: string;
    userId: string;
    identity: Identity;
    recordingConfig: Required<
        CloudRecordStartPayload["agoraData"]["clientRequest"]
    >["recordingConfig"];
}

export type RtcState = {
    isRecording: boolean;
    isCalling: boolean;
    recordingUuid?: string;
};

export class Rtc extends React.Component<RtcProps, RtcState> {
    private rtc = new RtcApi();
    private cloudRecording: CloudRecording | null = null;
    private recordStartTime: number | null = null;

    state: RtcState = {
        isRecording: false,
        isCalling: false,
    };

    public async componentWillUnmount(): Promise<void> {
        if (this.state.isCalling) {
            this.rtc.leave();
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
        if (this.state.isCalling && !this.cloudRecording?.isRecording) {
            this.cloudRecording = new CloudRecording({ roomUUID: roomId });
            await this.cloudRecording.start({
                recordingConfig,
            });
        }
        this.recordStartTime = Date.now();
        if (process.env.NODE_ENV === "development") {
            // @ts-ignore
            window.cloudRecording = this.cloudRecording;
        }
    };

    private stopRecording = async (): Promise<void> => {
        const videoUrl = this.cloudRecording?.isRecording ? this.getm3u8url() : undefined;
        if (this.cloudRecording?.isRecording) {
            try {
                await this.cloudRecording.stop();
            } catch (e) {
                console.error(e);
            }
        }
        if (this.recordStartTime !== null) {
            this.saveRecording({
                uuid: uuidv4(),
                startTime: this.recordStartTime,
                endTime: Date.now(),
                videoUrl,
            });
        }
        this.cloudRecording = null;
    };

    private toggleRecording = async (callback?: () => void): Promise<void> => {
        if (this.state.isRecording) {
            await this.stopRecording();
        } else {
            await this.startRecording();
        }
        this.setState(state => ({ isRecording: !state.isRecording }), callback);
    };

    private toggleCalling = (rtcUID: number, callback?: () => void): void => {
        this.setState(
            state => ({ isCalling: !state.isCalling }),
            async () => {
                if (this.state.isCalling) {
                    const { roomId, identity } = this.props;
                    this.rtc.join(
                        roomId,
                        identity,
                        rtcUID,
                        this.props.recordingConfig.channelType ?? RtcChannelType.Broadcast,
                    );
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
        } else {
            saveRoom({
                uuid: roomId,
                userId: this.props.userId,
                identity: this.props.identity,
                recordings: [recording],
            });
        }
        this.setState({ recordingUuid: recording.uuid });
        this.recordStartTime = null;
    };

    private getm3u8url(): string {
        if (!this.cloudRecording) {
            return "";
        }

        return `${AGORA.OSS_PREFIX}${AGORA.OSS_FOLDER}/${this.cloudRecording.sid}_${this.cloudRecording.roomUUID}.m3u8`;
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
            render(): JSX.Element {
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

            renderChildren = (props: RtcRenderProps): JSX.Element => (
                <Comp {...this.props} rtc={props} />
            );
        };
    };
}

import * as React from "react";
import memoizeOne from "memoize-one";
import topbarRecording from "../assets/image/topbar-recording.svg";
import topbarPlay from "../assets/image/topbar-play.svg";
import "./TopBarRecordStatus.less";

export interface TopBarRecordStatusProps {
    isRecording: boolean;
    /** 每一次录制完成后生成的 uuid */
    recordingUuid?: string;
    onStop: () => void;
    onReplay: () => void;
}

export interface TopBarRecordStatusState {
    count: string;
}

export class TopBarRecordStatus extends React.PureComponent<
    TopBarRecordStatusProps,
    TopBarRecordStatusState
> {
    private countTimeout: NodeJS.Timeout | undefined;
    private startTime: number = 0;

    public constructor(props: TopBarRecordStatusProps) {
        super(props);
        this.state = {
            count: "",
        };
    }

    public componentDidMount(): void {
        if (this.props.isRecording) {
            this.startTime = Date.now();
            this.countUp();
        }
    }

    public componentDidUpdate(prevProps: TopBarRecordStatusProps): void {
        if (this.props.isRecording) {
            if (!prevProps.isRecording) {
                this.startTime = Date.now();
                this.stopCount();
                this.countUp();
            }
        } else {
            this.stopCount();
        }
    }

    public componentWillUnmount(): void {
        this.stopCount();
    }

    public render(): React.ReactNode {
        const { isRecording, recordingUuid, onStop, onReplay } = this.props;

        return (
            <div className="topbar-record-status">
                {isRecording ? (
                    <>
                        <span className="topbar-record-status">正在录制中…</span>
                        <span className="topbar-record-time-recording">{this.state.count}</span>
                        <button className="topbar-record-btn" onClick={onStop}>
                            <img src={topbarRecording} alt="recording" />
                            <span>结束录制</span>
                        </button>
                    </>
                ) : recordingUuid ? (
                    <>
                        <span className="topbar-record-status">录制完成</span>
                        <span className="topbar-record-time">{this.state.count}</span>
                        <button className="topbar-record-btn" onClick={onReplay}>
                            <img src={topbarPlay} alt="play" />
                            <span>查看回放</span>
                        </button>
                    </>
                ) : null}
            </div>
        );
    }

    private countUp = (): void => {
        this.setState({ count: this.renderTime(Math.floor((Date.now() - this.startTime) / 1000)) });
        this.countTimeout = setTimeout(this.countUp, 100);
    };

    private stopCount = (): void => {
        if (this.countTimeout) {
            clearTimeout(this.countTimeout);
            this.countTimeout = void 0;
        }
    };

    private renderTime = memoizeOne((seconds): string => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor((seconds % 3600) % 60);
        return (
            (h > 0 ? String(s).padStart(2, "0") + ":" : "") +
            String(m).padStart(2, "0") +
            ":" +
            String(s).padStart(2, "0")
        );
    });
}

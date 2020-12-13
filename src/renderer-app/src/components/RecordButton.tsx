import React from "react";
import memoizeOne from "memoize-one";
import { TopBarRightBtn } from "./TopBarRightBtn";
import "./RecordButton.less";

export interface RecordButtonProps {
    disabled: boolean;
    isRecording: boolean;
    onClick: () => void;
}

export interface RecordButtonState {
    count: string;
}

export class RecordButton extends React.PureComponent<RecordButtonProps, RecordButtonState> {
    private countTimeout: number | undefined;
    private startTime: number = 0;

    public constructor(props: RecordButtonProps) {
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

    public componentDidUpdate(prevProps: RecordButtonProps): void {
        if (this.props.isRecording) {
            if (!prevProps.isRecording) {
                this.startTime = Date.now();
                this.stopCount();
                this.countUp();
            }
        } else {
            this.stopCount();
            this.setState({ count: "" });
        }
    }

    public componentWillUnmount(): void {
        this.stopCount();
    }

    public render(): React.ReactNode {
        const { disabled, isRecording, onClick } = this.props;
        return (
            <div className="record-button">
                <TopBarRightBtn
                    title="Record"
                    icon="record"
                    active={isRecording}
                    onClick={onClick}
                    disabled={disabled}
                />
                {this.state.count}
            </div>
        );
    }

    private countUp = (): void => {
        this.setState({ count: this.renderTime(Math.floor((Date.now() - this.startTime) / 1000)) });
        this.countTimeout = window.setTimeout(this.countUp, 100);
    };

    private stopCount = (): void => {
        if (this.countTimeout) {
            window.clearTimeout(this.countTimeout);
            this.countTimeout = void 0;
        }
    };

    private renderTime = memoizeOne((seconds: number): string => {
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

export default RecordButton;

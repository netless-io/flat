import React from "react";
import classBeginSVG from "../assets/image/class-begin.svg";
import classPauseSVG from "../assets/image/class-pause.svg";
import classStopSVG from "../assets/image/class-stop.svg";

export interface TopBarClassOperationsProps {
    isBegin: boolean;
    onBegin: () => void;
    onPause: () => void;
    onStop: () => void;
}

export class TopBarClassOperations extends React.PureComponent<TopBarClassOperationsProps> {
    render(): React.ReactNode {
        const { isBegin, onBegin, onPause, onStop } = this.props;
        return isBegin ? (
            <>
                <button className="topbar-class-operations-btn" onClick={onPause}>
                    <img src={classPauseSVG} alt="pause class" />
                    <span>暂停上课</span>
                </button>
                <button className="topbar-class-operations-btn" onClick={onStop}>
                    <img src={classStopSVG} alt="stop class" />
                    <span>结束上课</span>
                </button>
            </>
        ) : (
            <button className="topbar-class-operations-btn" onClick={onBegin}>
                <img src={classBeginSVG} alt="start class" />
                <span>开始上课</span>
            </button>
        );
    }
}

export default TopBarClassOperations;

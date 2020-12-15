import React from "react";
import classBegin from "../assets/image/class-begin.svg";
import classPause from "../assets/image/class-pause.svg";
import classStop from "../assets/image/class-stop.svg";
import "./TopBarClassOperations.less";

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
                    <img src={classPause} alt="pause class" />
                    <span>暂停上课</span>
                </button>
                <button className="topbar-class-operations-btn" onClick={onStop}>
                    <img src={classStop} alt="stop class" />
                    <span>结束上课</span>
                </button>
            </>
        ) : (
            <button className="topbar-class-operations-btn" onClick={onBegin}>
                <img src={classBegin} alt="start class" />
                <span>开始上课</span>
            </button>
        );
    }
}

export default TopBarClassOperations;

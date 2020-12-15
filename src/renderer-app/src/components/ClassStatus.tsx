import React from "react";
import classNames from "classnames";
import "./ClassStatus.less";

export interface ClassStatusProps {
    isClassBegin: boolean;
}

export class ClassStatus extends React.PureComponent<ClassStatusProps> {
    render(): React.ReactNode {
        const { isClassBegin } = this.props;

        return (
            <div className="class-status">
                <span>
                    当前状态：
                    <span
                        className={classNames("class-status-progress", {
                            "is-active": isClassBegin,
                        })}
                    >
                        {isClassBegin ? "进行中" : "未开始"}
                    </span>
                </span>
                <span>
                    当前模式：<span className="class-status-mode">大班课</span>
                </span>
            </div>
        );
    }
}

export default ClassStatus;

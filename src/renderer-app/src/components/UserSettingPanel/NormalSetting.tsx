import React from "react"
import "./NormalSetting.less"

export default class NormalSetting extends React.PureComponent<{}> {
    public render() {
        return (
            <div className="content-container">
                <div className="header-container">
                    <span>常规设置</span>
                </div>
                <div className="content-inner">
                    常规设置的内容
                </div>
            </div>
        )
    }
}
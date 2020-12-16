import React from "react"
import "./UserSettingContent.less"
// import { SettingTab } from "../../UserSetPage"

export default class UserSettingContent extends React.PureComponent<{}> {
    public render() {
        return (
            <div className="setting-content-container">
                <div className="setting-content-header">
                    {/* <span>{this.props.tab}</span> */}
                </div>
                <div className="info-content-inner">
                    {this.props.children}
                </div>
            </div>
        )
    }
}
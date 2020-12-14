import React from "react"
import "./UserSuggest.less"
import { Input, Button } from "antd"

export default class UserSeggest extends React.PureComponent<{}> {
    public render() {
        const { TextArea } = Input;
        return (
            <div className="user-seggest-container">
                <TextArea placeholder="请输入内容"></TextArea>
                <Button type="primary">提交</Button>
            </div>
        )
    }
}
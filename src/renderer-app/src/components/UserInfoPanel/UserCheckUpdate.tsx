import React from "react";
import { Button } from "antd";
import "./UserCheckUpdate.less";

export default class UserCheckUpdate extends React.PureComponent<{}> {
    public render(): JSX.Element {
        return (
            <div className="check-update-container">
                <div>当前版本</div>
                <span>2.1.0</span>
                <Button className="update-button" type="primary">
                    更新
                </Button>
            </div>
        );
    }
}

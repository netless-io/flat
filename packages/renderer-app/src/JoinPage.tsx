import * as React from "react";
import { RouteComponentProps } from "react-router";
import "./JoinPage.less";
import logo from "./assets/image/logo.svg";
import { Button, Input } from "antd";

export type JoinPageStates = {
    roomId: string;
};

export default class JoinPage extends React.Component<RouteComponentProps<{}>, JoinPageStates> {
    public constructor(props: RouteComponentProps<{}>) {
        super(props);
        this.state = {
            roomId: "",
        };
    }

    private handleJoin = (): void => {
        const userId = `${Math.floor(Math.random() * 100000)}`;
        this.props.history.push(`/whiteboard/${this.state.roomId}/${userId}/`);
    };

    public render(): React.ReactNode {
        const { roomId } = this.state;
        return (
            <div className="page-index-box">
                <div className="page-index-mid-box">
                    <div className="page-index-logo-box">
                        <img src={logo} />
                        <span>0.0.1</span>
                    </div>
                    <div className="page-index-form-box">
                        <Input
                            placeholder={"输入房间号"}
                            value={roomId}
                            onChange={evt => this.setState({ roomId: evt.target.value })}
                            className="page-index-input-box"
                            size={"large"}
                        />
                        <Button
                            className="page-index-btn-box"
                            disabled={roomId === ""}
                            size={"large"}
                            onClick={this.handleJoin}
                            type={"primary"}
                        >
                            加入房间
                        </Button>
                    </div>
                </div>
            </div>
        );
    }
}

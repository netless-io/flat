import * as React from "react";
import { Button, Input, message, Popover } from "antd";
import { clipboard } from "electron";
import "./InviteButton.less";
import inviteActive from "../assets/image/invite-active.svg";
import invite from "../assets/image/invite.svg";
import { Identity } from "../IndexPage";
import { CopyOutlined } from "@ant-design/icons";

export type InviteButtonStates = {
    inviteDisable: boolean;
};

export type InviteButtonProps = {
    uuid: string;
};

export default class InviteButton extends React.Component<InviteButtonProps, InviteButtonStates> {
    public constructor(props: InviteButtonProps) {
        super(props);
        this.state = {
            inviteDisable: false,
        };
    }

    private onVisibleChange = (event: boolean): void => {
        if (event) {
            this.setState({ inviteDisable: true });
        } else {
            this.setState({ inviteDisable: false });
        }
    };

    private handleInvite = (): void => {
        this.setState({ inviteDisable: !this.state.inviteDisable });
    };

    private handleCopy = (): void => {
        const { uuid } = this.props;
        this.handleInvite();
        clipboard.writeText(
            `房间号：${uuid}\n加入链接：https://demo.netless.link/whiteboard/${Identity.student}/${uuid}/`,
        );
        message.success("已经将信息复制到剪贴板");
    };

    private renderInviteContent = (): React.ReactNode => {
        const { uuid } = this.props;
        return (
            <div className="invite-box">
                <div className="invite-box-title">邀请加入</div>
                <div style={{ width: 400, height: 0.5, backgroundColor: "#E7E7E7" }} />
                <div className="invite-text-box">
                    <div className="invite-url-box" style={{ marginBottom: 12 }}>
                        <span style={{ width: 96 }}>房间号：</span>
                        <Input
                            size={"middle"}
                            value={uuid}
                            addonAfter={
                                <CopyOutlined
                                    onClick={() => {
                                        clipboard.writeText(uuid);
                                        message.success("已经将 uuid 黏贴到剪贴板");
                                    }}
                                />
                            }
                        />
                    </div>
                    <div className="invite-url-box">
                        <span style={{ width: 96 }}>加入链接：</span>
                        <Input
                            size={"middle"}
                            value={`https://demo.netless.link/whiteboard/${Identity.student}/${uuid}/`}
                            addonAfter={
                                <CopyOutlined
                                    onClick={() => {
                                        clipboard.writeText(
                                            `https://demo.netless.link/whiteboard/${Identity.student}/${uuid}/`,
                                        );
                                        message.success("已经将链接复制到剪贴板");
                                    }}
                                />
                            }
                        />
                    </div>
                </div>
                <div className="invite-button-box">
                    <Button
                        onClick={this.handleCopy}
                        style={{ width: 164, height: 40 }}
                        type={"primary"}
                        size={"middle"}
                    >
                        复制
                    </Button>
                </div>
            </div>
        );
    };

    public render(): React.ReactNode {
        return (
            <Popover
                visible={this.state.inviteDisable}
                trigger="click"
                onVisibleChange={this.onVisibleChange}
                content={() => this.renderInviteContent()}
                placement={"bottomRight"}
            >
                <div className="page-controller-cell" onClick={this.handleInvite}>
                    <img src={this.state.inviteDisable ? inviteActive : invite} alt={"invite"} />
                </div>
            </Popover>
        );
    }
}

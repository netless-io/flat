import React from "react";
import { Input, message, Popover } from "antd";
import { clipboard } from "electron";
import "./InviteButton.less";
import { CopyOutlined } from "@ant-design/icons";
import { TopBarRightBtn } from "./TopBarRightBtn";

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
                                        message.success("已经将 uuid 黏贴到剪贴板").then();
                                    }}
                                />
                            }
                        />
                    </div>
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
                <div>
                    <TopBarRightBtn
                        title="Invite"
                        icon="invite"
                        active={this.state.inviteDisable}
                        onClick={this.handleInvite}
                    />
                </div>
            </Popover>
        );
    }
}

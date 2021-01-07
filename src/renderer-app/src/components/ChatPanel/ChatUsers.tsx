import React from "react";
import { AutoSizer, List, ListRowRenderer, Size } from "react-virtualized";
import classNames from "classnames";
import memoizeOne from "memoize-one";
import { ChatUser, ChatUserProps, RTMUser } from "./ChatUser";
import noHand from "../../assets/image/no-hand.svg";
import "./ChatUsers.less";

export interface ChatUsersProps
    extends Pick<ChatUserProps, "identity" | "userId" | "onAcceptRaiseHand" | "onEndSpeaking"> {
    speakingJoiners: RTMUser[];
    handRaisingJoiners: RTMUser[];
    creator?: RTMUser;
    joiners: RTMUser[];
    isShowCancelAllHandRaising: boolean;
    onCancelAllHandRaising: () => void;
}

export interface ChatUsersState {
    users: RTMUser[];
}

export class ChatUsers extends React.PureComponent<ChatUsersProps, ChatUsersState> {
    static getDerivedStateFromProps(props: ChatUsersProps) {
        return {
            users: ChatUsers.generateUsers(
                props.speakingJoiners,
                props.handRaisingJoiners,
                props.creator,
                props.joiners,
            ),
        };
    }

    private static generateUsers = memoizeOne(
        (
            speakingJoiners: RTMUser[],
            handRaisingJoiners: RTMUser[],
            creator: RTMUser | undefined,
            joiners: RTMUser[],
        ): RTMUser[] =>
            creator
                ? [...speakingJoiners, ...handRaisingJoiners, creator, ...joiners]
                : [...speakingJoiners, ...handRaisingJoiners, ...joiners],
    );

    state: ChatUsersState = {
        users: [],
    };

    render(): React.ReactNode {
        const { speakingJoiners, isShowCancelAllHandRaising, onCancelAllHandRaising } = this.props;

        return (
            <div
                className={classNames("chat-users-wrap", {
                    "has-speaking": speakingJoiners.length > 0,
                })}
            >
                {isShowCancelAllHandRaising && (
                    <div className="chat-users-cancel-hands-wrap">
                        <button
                            className="chat-users-cancel-hands"
                            onClick={onCancelAllHandRaising}
                        >
                            <img src={noHand} alt="cancel hand raising" />
                            取消举手
                        </button>
                    </div>
                )}
                <div
                    className={classNames("chat-users", {
                        "with-cancel-hands": isShowCancelAllHandRaising,
                    })}
                >
                    <AutoSizer>{this.renderList}</AutoSizer>
                </div>
            </div>
        );
    }

    private renderList = ({ height, width }: Size): React.ReactNode => {
        const { users } = this.state;
        return (
            <List
                height={height}
                width={width}
                rowCount={users.length}
                rowHeight={40}
                rowRenderer={this.rowRenderer}
                date={users}
            />
        );
    };

    private rowRenderer: ListRowRenderer = ({ index, style }): React.ReactNode => {
        const { identity, creator, userId, onAcceptRaiseHand, onEndSpeaking } = this.props;
        const user = this.state.users[index];
        return (
            <div key={user.uuid} style={style}>
                <ChatUser
                    identity={identity}
                    creatorId={creator?.uuid}
                    userId={userId}
                    user={user}
                    onAcceptRaiseHand={onAcceptRaiseHand}
                    onEndSpeaking={onEndSpeaking}
                />
            </div>
        );
    };
}

export default ChatUsers;

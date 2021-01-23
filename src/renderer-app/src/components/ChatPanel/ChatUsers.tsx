import React from "react";
import { AutoSizer, List, ListRowRenderer, Size } from "react-virtualized";
import classNames from "classnames";
import memoizeOne from "memoize-one";
import { ChatUser, ChatUserProps, User } from "./ChatUser";
import noHand from "../../assets/image/no-hand.svg";
import "./ChatUsers.less";

export interface ChatUsersProps
    extends Pick<ChatUserProps, "identity" | "userId" | "onAcceptRaiseHand" | "onEndSpeaking"> {
    speakingJoiners: User[];
    handRaisingJoiners: User[];
    creator?: User | null;
    otherJoiners: User[];
    isShowCancelAllHandRaising: boolean;
    onCancelAllHandRaising: () => void;
}

export interface ChatUsersState {
    users: User[];
}

export class ChatUsers extends React.PureComponent<ChatUsersProps, ChatUsersState> {
    static getDerivedStateFromProps(props: ChatUsersProps): { users: User[] } {
        return {
            users: ChatUsers.generateUsers(
                props.speakingJoiners,
                props.handRaisingJoiners,
                props.creator,
                props.otherJoiners,
            ),
        };
    }

    private static generateUsers = memoizeOne(
        (
            speakingJoiners: User[],
            handRaisingJoiners: User[],
            creator: User | undefined | null,
            otherJoiners: User[],
        ): User[] =>
            creator
                ? [...speakingJoiners, ...handRaisingJoiners, creator, ...otherJoiners]
                : [...speakingJoiners, ...handRaisingJoiners, ...otherJoiners],
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
            <div key={user.userUUID} style={style}>
                <ChatUser
                    identity={identity}
                    creatorId={creator?.userUUID}
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

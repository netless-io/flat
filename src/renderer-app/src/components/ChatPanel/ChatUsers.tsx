import React from "react";
import { observer } from "mobx-react-lite";
import { AutoSizer, List, ListRowRenderer, Size } from "react-virtualized";
import classNames from "classnames";
import { ChatUser, ChatUserProps, User } from "./ChatUser";
import noHand from "../../assets/image/no-hand.svg";
import "./ChatUsers.less";
import { useComputed } from "../../utils/mobx";

export interface ChatUsersProps
    extends Pick<ChatUserProps, "ownerUUID" | "userUUID" | "onAcceptRaiseHand" | "onEndSpeaking"> {
    isCreator: boolean;
    speakingJoiners: User[];
    handRaisingJoiners: User[];
    creator?: User | null;
    otherJoiners: User[];
    onCancelAllHandRaising: () => void;
}

export const ChatUsers = observer<ChatUsersProps>(function ChatUsers({
    isCreator,
    creator,
    speakingJoiners,
    handRaisingJoiners,
    otherJoiners,
    onCancelAllHandRaising,
    ...restProps
}) {
    const users = useComputed(() =>
        creator
            ? [...speakingJoiners, ...handRaisingJoiners, creator, ...otherJoiners]
            : [...speakingJoiners, ...handRaisingJoiners, ...otherJoiners],
    );

    const isShowCancelAllHandRaising = isCreator && handRaisingJoiners.length > 0;

    const rowRenderer: ListRowRenderer = ({ index, style }): React.ReactNode => {
        const user = users[index];
        return (
            <div key={user.userUUID} style={style}>
                <ChatUser {...restProps} user={user} />
            </div>
        );
    };

    const renderList = ({ height, width }: Size): React.ReactNode => {
        return (
            <List
                height={height}
                width={width}
                rowCount={users.length}
                rowHeight={40}
                rowRenderer={rowRenderer}
                date={users}
            />
        );
    };

    return (
        <div
            className={classNames("chat-users-wrap", {
                "has-speaking": speakingJoiners.length > 0,
            })}
        >
            {isShowCancelAllHandRaising && (
                <div className="chat-users-cancel-hands-wrap">
                    <button className="chat-users-cancel-hands" onClick={onCancelAllHandRaising}>
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
                <AutoSizer>{renderList}</AutoSizer>
            </div>
        </div>
    );
});

export default ChatUsers;

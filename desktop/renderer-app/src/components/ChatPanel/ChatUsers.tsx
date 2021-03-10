import React from "react";
import { observer } from "mobx-react-lite";
import { AutoSizer, List, ListRowRenderer, Size } from "react-virtualized";
import classNames from "classnames";
import { ChatUser } from "./ChatUser";
import noHand from "../../assets/image/no-hand.svg";
import "./ChatUsers.less";
import { useComputed } from "../../utils/mobx";
import { ClassRoomStore } from "../../stores/ClassRoomStore";

export interface ChatUsersProps {
    classRoomStore: ClassRoomStore;
    disableMultipleSpeakers?: boolean;
}

export const ChatUsers = observer<ChatUsersProps>(function ChatUsers({
    classRoomStore,
    disableMultipleSpeakers,
}) {
    const users = useComputed(() => {
        const { creator, speakingJoiners, handRaisingJoiners, otherJoiners } = classRoomStore.users;
        return creator
            ? [...speakingJoiners, ...handRaisingJoiners, creator, ...otherJoiners]
            : [...speakingJoiners, ...handRaisingJoiners, ...otherJoiners];
    }).get();

    const isShowCancelAllHandRaising =
        classRoomStore.isCreator && classRoomStore.users.handRaisingJoiners.length > 0;

    const rowRenderer: ListRowRenderer = ({ index, style }): React.ReactNode => {
        const user = users[index];
        return (
            <div key={user.userUUID} style={style}>
                <ChatUser
                    ownerUUID={classRoomStore.ownerUUID}
                    userUUID={classRoomStore.userUUID}
                    user={user}
                    onAcceptRaiseHand={userUUID => {
                        if (
                            classRoomStore.users.speakingJoiners.length > 0 &&
                            disableMultipleSpeakers
                        ) {
                            // only one speaker is allowed
                            return;
                        }
                        classRoomStore.acceptRaiseHand(userUUID);
                    }}
                    onEndSpeaking={userUUID => {
                        classRoomStore.onSpeak([{ userUUID, speak: false }]);
                    }}
                />
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
                "has-speaking": classRoomStore.users.speakingJoiners.length > 0,
            })}
        >
            {isShowCancelAllHandRaising && (
                <div className="chat-users-cancel-hands-wrap">
                    <button
                        className="chat-users-cancel-hands"
                        onClick={classRoomStore.onCancelAllHandRaising}
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
                <AutoSizer>{renderList}</AutoSizer>
            </div>
        </div>
    );
});

export default ChatUsers;

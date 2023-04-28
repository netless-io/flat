import "./Shortcuts.less";

import classNames from "classnames";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { listen } from "@wopjs/dom";
import { validate } from "uuid";

import { ClassroomStore } from "@netless/flat-stores";
import { SVGBoard, SVGBoardOff, SVGCup } from "flat-components";
import { useBoundingRect } from "./hooks";

export interface ShortcutsProps {
    classroom: ClassroomStore;
    location?: "bottom" | "top-right";
}

export const Shortcuts = observer<ShortcutsProps>(function Shortcuts({ classroom, location }) {
    const [target, setTarget] = useState<HTMLElement | null>(null);
    const activeUser = useMemo(
        () => classroom.users.cachedUsers.get(classroom.hoveringUserUUID || "") || null,
        [classroom.hoveringUserUUID, classroom.users.cachedUsers],
    );
    const rect = useBoundingRect(target);
    const style = useMemo<React.CSSProperties | undefined>(
        () =>
            rect && activeUser
                ? location === "top-right"
                    ? { top: rect.top + 4, right: 4 }
                    : { left: rect.left + rect.width / 2, top: rect.bottom }
                : { left: -9999, top: -9999 },
        [activeUser, location, rect],
    );

    useEffect(() => {
        const handler = (ev: MouseEvent): void => {
            let el = ev.target as HTMLElement | null;
            if (!el || !el.classList || el.classList.contains("video-avatar-holder")) {
                classroom.setHoveringUserUUID(null);
                setTarget(null);
                return;
            }

            for (const className of el.classList) {
                if (className.includes("avatar-shortcuts")) {
                    return;
                }
            }

            let userUUID: string | null | undefined;
            if (el.classList.contains("window-main")) {
                const child = el.querySelector("[data-user-uuid]") as HTMLElement | null;
                userUUID = child?.dataset.userUuid;
                if (userUUID && validate(userUUID)) {
                    classroom.setHoveringUserUUID(userUUID);
                    setTarget(el);
                    return;
                }
            }

            for (let i = 0; i < 10 && el.parentElement; i++) {
                if ((userUUID = el?.dataset.userUuid)) {
                    break;
                }
                el = el.parentElement;
            }

            classroom.setHoveringUserUUID(userUUID || null);
            setTarget(el);
        };

        const stopListenMove = listen(document, "pointermove", handler);
        const stopListenEnter = listen(document, "pointerenter", handler);

        return () => {
            stopListenMove();
            stopListenEnter();
        };
    }, [classroom]);

    const toggleWhiteboard = useCallback(() => {
        if (activeUser?.userUUID) {
            classroom.authorizeWhiteboard(activeUser.userUUID, !activeUser.wbOperate);
        }
    }, [classroom, activeUser]);

    const reward = useCallback(() => {
        if (activeUser?.userUUID) {
            classroom.reward(activeUser.userUUID);
        }
    }, [classroom, activeUser]);

    // joiners cannot see this
    if (!classroom.isCreator) {
        return null;
    }

    // no owner actions
    if (activeUser?.userUUID === classroom.ownerUUID) {
        return null;
    }

    return (
        <div
            className={classNames("avatar-shortcuts-wrapper", location, { active: !!activeUser })}
            data-user={activeUser?.userUUID}
            style={style}
            onPointerLeave={() => classroom.setHoveringUserUUID(null)}
        >
            <div className={classNames("avatar-shortcuts", location)}>
                <button
                    className="avatar-shortcuts-btn"
                    title="toggle whiteboard"
                    onClick={toggleWhiteboard}
                >
                    {activeUser?.wbOperate ? <SVGBoard /> : <SVGBoardOff />}
                </button>
                <button className="avatar-shortcuts-btn" title="reward" onClick={reward}>
                    <SVGCup />
                </button>
            </div>
        </div>
    );
});

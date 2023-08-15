import "./Shortcuts.less";

import classNames from "classnames";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { listen } from "@wopjs/dom";
import { useWindowSize } from "react-use";
import { validate } from "uuid";

import { useTranslate } from "@netless/flat-i18n";
import { ClassroomStore } from "@netless/flat-stores";
import { SVGBoard, SVGBoardOff, SVGCup, SVGMuteAll, SVGRestore } from "flat-components";
import { useBoundingRect } from "./hooks";

export interface ShortcutsProps {
    classroom: ClassroomStore;
    location?: "bottom" | "top-right";
}

export const Shortcuts = observer<ShortcutsProps>(function Shortcuts({ classroom, location }) {
    const t = useTranslate();
    const [target, setTarget] = useState<HTMLElement | null>(null);
    const activeUser = useMemo(
        () => classroom.users.cachedUsers.get(classroom.hoveringUserUUID || "") || null,
        [classroom.hoveringUserUUID, classroom.users.cachedUsers],
    );
    const { height: windowHeight } = useWindowSize();
    const rect = useBoundingRect(target);
    const isAvatarWindow = useMemo(() => hasAncestorWithClassName(target, "window-main"), [target]);
    const style = useMemo<React.CSSProperties | undefined>(
        () =>
            rect && activeUser
                ? location === "top-right" && !isAvatarWindow
                    ? { top: rect.top + 4, right: 4 }
                    : {
                          left: rect.left + rect.width / 2,
                          top: rect.bottom + 42 < windowHeight ? rect.bottom : rect.top,
                      }
                : { left: -9999, top: -9999 },
        [rect, activeUser, location, isAvatarWindow, windowHeight],
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

    // Hide shortcuts once dropped avatar to whiteboard
    const lastDragging = useRef(false);
    useEffect(() => {
        if (!classroom.isDraggingAvatar && lastDragging.current) {
            classroom.setHoveringUserUUID(null);
            setTarget(null);
        }
        lastDragging.current = classroom.isDraggingAvatar;
    }, [classroom, classroom.isDraggingAvatar]);

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

    // no actions for left users
    if (activeUser?.hasLeft) {
        return null;
    }

    const className = isAvatarWindow ? undefined : location;

    return (
        <div
            className={classNames("avatar-shortcuts-wrapper", className, classroom.roomType, {
                active: !!activeUser,
            })}
            data-user={activeUser?.userUUID}
            style={style}
            onPointerLeave={() => classroom.setHoveringUserUUID(null)}
        >
            {activeUser?.userUUID === classroom.ownerUUID ? (
                // owner actions: restore windows, mute all
                <div className={classNames("avatar-shortcuts", className)}>
                    <button
                        className="avatar-shortcuts-btn"
                        title={t("restore-windows")}
                        onClick={classroom.minimizeAllUserWindows}
                    >
                        <SVGRestore />
                    </button>
                    <button
                        className="avatar-shortcuts-btn"
                        title={t("all-mute-mic")}
                        onClick={classroom.muteAll}
                    >
                        <SVGMuteAll />
                    </button>
                </div>
            ) : (
                // joiner actions: toggle whiteboard, reward
                <div className={classNames("avatar-shortcuts", className)}>
                    <button
                        className="avatar-shortcuts-btn"
                        title={t("whiteboard-access")}
                        onClick={toggleWhiteboard}
                    >
                        {activeUser?.wbOperate ? <SVGBoard /> : <SVGBoardOff />}
                    </button>
                    <button className="avatar-shortcuts-btn" title={t("reward")} onClick={reward}>
                        <SVGCup />
                    </button>
                </div>
            )}
        </div>
    );
});

function hasAncestorWithClassName(el: HTMLElement | null, className: string): boolean {
    if (!el) {
        return false;
    }
    if (el.classList.contains(className)) {
        return true;
    }
    return hasAncestorWithClassName(el.parentElement, className);
}

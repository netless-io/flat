import "./UserWindows.less";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { ClassroomStore, UserWindow } from "@netless/flat-stores";
import { AvatarWindow, fixRect, Rectangle, ResizeHandle, useIsUnMounted } from "flat-components";
import { WHITEBOARD_RATIO } from "@netless/flat-stores/src/constants";

const WINDOW_RATIO = 3 / 4;
const DEFAULT_WIDTH_P = 0.4;
const MIN_WIDTH_P = 0.25;

const clamp = (x: number, min: number, max: number): number => (x < min ? min : x > max ? max : x);

export interface UserWindowsProps {
    classroom: ClassroomStore;
}

export const UserWindows = observer<UserWindowsProps>(function UserWindows({ classroom }) {
    const ref = useRef<HTMLDivElement>(null);
    const [boundingRect, setBoundingRect] = useState<DOMRect | null>(null);
    const [hovering, setHovering] = useState(false);

    useEffect(() => {
        if (ref.current) {
            const div = ref.current;
            const observer = new ResizeObserver(() => {
                setBoundingRect(div.getBoundingClientRect());
            });
            observer.observe(div);
            return () => observer.disconnect();
        }
        return;
    }, []);

    const baseRect = useMemo(() => {
        if (!boundingRect) {
            return { width: 0, height: 0 };
        }
        const { width, height } = boundingRect;
        const fixedHeight = width * WHITEBOARD_RATIO;
        if (fixedHeight < height) {
            return { width, height: fixedHeight, extraY: (height - fixedHeight) / 2 };
        } else {
            const fixedWidth = height / WHITEBOARD_RATIO;
            return { width: fixedWidth, height, extraX: (width - fixedWidth) / 2 };
        }
    }, [boundingRect]);

    const users = (classroom.userWindowsGrid || [...classroom.userWindows.keys()]).map(userUUID => {
        return { userUUID, window: classroom.userWindows.get(userUUID) };
    });

    const userWindowsLength = classroom.userWindowsGrid
        ? classroom.userWindowsGrid.filter(userUUID => !classroom.userHasLeft(userUUID)).length
        : 0;

    const onDrop = useCallback(
        (ev: React.DragEvent<HTMLDivElement>) => {
            setHovering(false);
            classroom.onDragEnd();

            const data = ev.dataTransfer.getData("video-avatar");
            if (!data || !boundingRect) {
                return;
            }
            const [userUUID, rx, ry] = JSON.parse(data) as [
                userUUID: string,
                rx: number,
                ry: number,
            ];

            const windowWidth = baseRect.width * DEFAULT_WIDTH_P;
            const windowHeight = windowWidth * WINDOW_RATIO;

            let x = ev.clientX - boundingRect.left - windowWidth * rx - (baseRect.extraX || 0);
            let y = ev.clientY - boundingRect.top - windowHeight * ry - (baseRect.extraY || 0);

            x = clamp(x, 0, baseRect.width - windowWidth);
            y = clamp(y, 0, baseRect.height - windowHeight);

            classroom.createAvatarWindow(userUUID, {
                x: x / baseRect.width,
                y: y / baseRect.height,
                width: windowWidth / baseRect.width,
                height: windowHeight / baseRect.height,
            });
        },
        [baseRect, boundingRect, classroom],
    );

    const isGrid = classroom.userWindowsGrid;

    return (
        <div
            ref={ref}
            className={classNames("user-windows", {
                "is-grid": isGrid,
                "is-hovering": hovering,
            })}
            data-size={userWindowsLength}
        >
            {users.map(({ userUUID, window }) => (
                <UserAvatarWindow
                    key={userUUID}
                    baseRect={baseRect}
                    classroom={classroom}
                    mode={classroom.userWindowsMode}
                    readonly={!classroom.isCreator}
                    userUUID={userUUID}
                    window={window}
                />
            ))}
            {classroom.isDraggingAvatar && (
                <div
                    className="user-windows-mask"
                    onDragLeave={() => setHovering(false)}
                    onDragOver={() => setHovering(true)}
                    onDrop={onDrop}
                />
            )}
        </div>
    );
});

interface UserAvatarWindowProps {
    mode: "maximized" | "normal";
    readonly: boolean;
    userUUID: string;
    /** may not exist on maximized mode */
    window?: UserWindow;
    baseRect: { width: number; height: number; extraX?: number; extraY?: number };
    classroom: ClassroomStore;
}

const DEFAULT_WINDOW: UserWindow = { x: 0, y: 0, width: 0.4, height: 8 / 15, z: 0 };

const UserAvatarWindow = observer<UserAvatarWindowProps>(function UserAvatarWindow({
    mode,
    readonly,
    userUUID,
    window: realWindow,
    baseRect,
    classroom,
}) {
    const isUnMounted = useIsUnMounted();
    const [tempWindow, setTempWindow] = useState<UserWindow | null>(null);

    useEffect(() => {
        if (tempWindow) {
            const ticket = setTimeout(() => {
                classroom.updateAvatarWindow(userUUID, tempWindow);
                if (!isUnMounted.current) {
                    setTempWindow(null);
                }
            }, 50);
            return () => clearTimeout(ticket);
        }
        return;
    }, [classroom, isUnMounted, tempWindow, userUUID]);

    const window = tempWindow || realWindow || DEFAULT_WINDOW;
    const rect: Rectangle = useMemo(
        () => ({
            x: window.x * baseRect.width + (baseRect.extraX || 0),
            y: window.y * baseRect.height + (baseRect.extraY || 0),
            width: window.width * baseRect.width,
            height: window.height * baseRect.height,
        }),
        [baseRect, window],
    );

    const onClick = useCallback(() => {
        realWindow && classroom.updateAvatarWindow(userUUID, realWindow);
    }, [classroom, realWindow, userUUID]);

    const onDoubleClick = useCallback(() => {
        classroom.toggleUserWindowsMode();
    }, [classroom]);

    const onDragEnd = useCallback(
        (ev: PointerEvent) => {
            classroom.setDroppingUserUUID(null);
            const el = document.elementFromPoint(ev.clientX, ev.clientY);
            if (el && (el as HTMLElement).dataset?.userUuid) {
                classroom.deleteAvatarWindow(userUUID);
            }
        },
        [classroom, userUUID],
    );

    const onDragging = useCallback(
        (ev: PointerEvent) => {
            const el = document.elementFromPoint(ev.clientX, ev.clientY);
            if (el && (el as HTMLElement).dataset?.userUuid) {
                classroom.setDroppingUserUUID(userUUID);
            } else {
                classroom.setDroppingUserUUID(null);
            }
        },
        [classroom, userUUID],
    );

    const onResize = useCallback(
        (rect: Rectangle, handle: ResizeHandle | undefined) => {
            rect.x -= baseRect.extraX || 0;
            rect.y -= baseRect.extraY || 0;
            const { x, y, width, height } = fixRect(
                rect,
                handle,
                WINDOW_RATIO,
                MIN_WIDTH_P * baseRect.width,
                baseRect.width,
                baseRect.height,
            );
            setTempWindow({
                x: x / baseRect.width,
                y: y / baseRect.height,
                width: width / baseRect.width,
                height: height / baseRect.height,
                // give the temp window a very large z so that it renders correct,
                // but set a correct z when we really update the storage.
                // see classroom.updateAvatarWindow()
                z: 2147483647,
            });
        },
        [baseRect],
    );

    return (
        <AvatarWindow
            key={userUUID}
            hidden={classroom.userHasLeft(userUUID)}
            mode={mode}
            readonly={readonly}
            rect={rect}
            zIndex={window.z}
            onClick={onClick}
            onDoubleClick={onDoubleClick}
            onDragEnd={onDragEnd}
            onDragging={onDragging}
            onResize={onResize}
        >
            <UserWindowPortal classroom={classroom} mode={mode} userUUID={userUUID} />
        </AvatarWindow>
    );
});

interface UserWindowPortalProps {
    mode: "maximized" | "normal";
    userUUID: string;
    classroom: ClassroomStore;
}

const UserWindowPortal: React.FC<UserWindowPortalProps> = ({ mode, userUUID, classroom }) => (
    <div
        ref={useCallback(element => classroom.setPortal(userUUID, element), [classroom, userUUID])}
        className={classNames("user-window-portal", { "is-grid": mode === "maximized" })}
    />
);

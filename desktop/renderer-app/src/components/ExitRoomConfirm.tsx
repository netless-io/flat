import React, { useCallback, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import {
    CloseRoomConfirmModal,
    ExitRoomConfirmModal,
    StopClassConfirmModal,
} from "flat-components";
import { RoomStatus } from "../api-middleware/flatServer/constants";
import { useSafePromise } from "../utils/hooks/lifecycle";
import { ipcAsyncByMainWindow, ipcReceive, ipcReceiveRemove } from "../utils/ipc";
import { RouteNameType, usePushHistory } from "../utils/routes";
import { errorTips } from "./Tips/ErrorTips";

export enum ExitRoomConfirmType {
    StopClassButton,
    ExitButton,
}

export interface ExitRoomConfirmProps {
    isCreator: boolean;
    confirmType: ExitRoomConfirmType;
    visible: boolean;
    isReturnLoading: boolean;
    isStopLoading: boolean;
    onReturnMain: () => Promise<void>;
    onStopClass: () => Promise<void>;
    onCancel: () => void;
    confirm: (confirmType: ExitRoomConfirmType) => void;
}

export function useExitRoomConfirmModal({
    roomStatus,
    hangClass,
    stopClass,
}: {
    roomStatus: RoomStatus;
    hangClass: () => Promise<void>;
    stopClass: () => Promise<void>;
}): Omit<ExitRoomConfirmProps, "isCreator"> {
    const [confirmType, setConfirmType] = useState(ExitRoomConfirmType.ExitButton);
    const [visible, setVisible] = useState(false);
    const [isReturnLoading, setReturnLoading] = useState(false);
    const [isStopLoading, setStopLoading] = useState(false);
    const sp = useSafePromise();
    const pushHistory = usePushHistory();

    const onReturnMain = useCallback(async () => {
        setReturnLoading(true);

        try {
            await sp(hangClass());
        } catch (e) {
            setReturnLoading(false);
            console.error(e);
            errorTips(e);
        }

        pushHistory(RouteNameType.HomePage);
    }, [pushHistory, hangClass, sp]);

    const onStopClass = useCallback(async () => {
        setStopLoading(true);

        try {
            await sp(stopClass());
        } catch (e) {
            setStopLoading(false);
            console.error(e);
            errorTips(e);
        }
    }, [stopClass, sp]);

    const onCancel = useCallback(() => {
        setVisible(false);
    }, []);

    const confirm = useCallback(
        (confirmType: ExitRoomConfirmType) => {
            if (roomStatus === RoomStatus.Started || roomStatus === RoomStatus.Paused) {
                setVisible(true);
                setConfirmType(confirmType);
            } else {
                void onReturnMain();
            }
        },
        [onReturnMain, roomStatus],
    );

    useEffect(() => {
        ipcAsyncByMainWindow("disable-window", {
            disable: true,
        });
        ipcReceive("window-will-close", () => {
            confirm(ExitRoomConfirmType.ExitButton);
        });

        return () => {
            ipcAsyncByMainWindow("disable-window", {
                disable: false,
            });

            ipcReceiveRemove("window-will-close");
        };
    }, [confirm]);

    return {
        confirmType,
        visible,
        isReturnLoading,
        isStopLoading,
        onReturnMain,
        onStopClass,
        onCancel,
        confirm,
    };
}

export const ExitRoomConfirm = observer<Omit<ExitRoomConfirmProps, "confirm">>(
    function ExitRoomConfirm({
        isCreator,
        confirmType,
        isReturnLoading,
        isStopLoading,
        onReturnMain,
        onStopClass,
        ...restProps
    }) {
        return isCreator ? (
            confirmType === ExitRoomConfirmType.ExitButton ? (
                <CloseRoomConfirmModal
                    {...restProps}
                    stopLoading={isStopLoading}
                    hangLoading={isReturnLoading}
                    onStop={onStopClass}
                    onHang={onReturnMain}
                />
            ) : (
                <StopClassConfirmModal
                    {...restProps}
                    loading={isStopLoading}
                    onStop={onStopClass}
                />
            )
        ) : (
            <ExitRoomConfirmModal {...restProps} onExit={onReturnMain} />
        );
    },
);

export default ExitRoomConfirm;

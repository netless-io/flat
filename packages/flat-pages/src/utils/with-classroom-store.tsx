import { ClassroomStore } from "@netless/flat-stores";
import React from "react";
import { RouteNameType, RouteParams } from "../utils/routes";
import { useParams } from "react-router-dom";
import { useClassroomStore } from "./use-classroom-store";
import { LoadingPage } from "flat-components";
import { RoomPhase } from "white-web-sdk";
import { observer } from "mobx-react-lite";

export type WithClassroomStoreProps<P = {}> = P & { classroomStore: ClassroomStore };

export const withClassroomStore = <P extends {}>(
    Component: React.ComponentType<WithClassroomStoreProps<P>>,
): React.FC<P> =>
    observer<P>(function WithClassroomStore(props) {
        const params =
            useParams<
                RouteParams<
                    | RouteNameType.BigClassPage
                    | RouteNameType.SmallClassPage
                    | RouteNameType.OneToOnePage
                >
            >();
        const classroomStore = useClassroomStore(params);

        const isReady =
            classroomStore &&
            classroomStore.whiteboardStore.room &&
            classroomStore.whiteboardStore.phase !== RoomPhase.Connecting &&
            classroomStore.whiteboardStore.phase !== RoomPhase.Disconnecting;

        return isReady ? (
            <Component classroomStore={classroomStore} {...props} />
        ) : (
            <LoadingPage onTimeout="full-reload" />
        );
    });

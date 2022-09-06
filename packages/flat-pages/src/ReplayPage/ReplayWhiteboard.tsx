import { ClassroomReplayStore } from "@netless/flat-stores";
import { DarkModeContext } from "flat-components";
import { observer } from "mobx-react-lite";
import React, { useContext, useEffect, useRef } from "react";

export interface ReplayWhiteboardProps {
    classroomReplayStore: ClassroomReplayStore;
}

export const ReplayWhiteboard = observer<ReplayWhiteboardProps>(function ReplayWhiteboard({
    classroomReplayStore,
}) {
    const isDark = useContext(DarkModeContext);
    const whiteboardRef = useRef<HTMLDivElement>(null);
    const fastboard = classroomReplayStore?.fastboard;

    useEffect(() => {
        if (fastboard && whiteboardRef.current) {
            fastboard.bindContainer(whiteboardRef.current);
        }
    }, [fastboard]);

    useEffect(() => {
        if (fastboard) {
            fastboard.manager.setPrefersColorScheme(isDark ? "dark" : "light");
        }
    }, [fastboard, isDark]);

    return <div ref={whiteboardRef} className="replay-whiteboard" />;
});

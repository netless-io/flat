import "./style.less";
import addSceneSVG from "./image/add-scene.svg";
import nextScenesDisabledSVG from "./image/next-scene-disabled.svg";
import nextScenesSVG from "./image/next-scene.svg";
import preScenesDisabledSVG from "./image/previous-scene-disabled.svg";
import preScenesSVG from "./image/previous-scene.svg";

import React, { FC, useCallback } from "react";
import classNames from "classnames";

export interface ScenesControllerProps {
    addScene: () => void;
    preScene: () => void;
    nextScene: () => void;
    currentSceneIndex: number;
    scenesCount: number;
    disabled: boolean;
}

export const ScenesController: FC<ScenesControllerProps> = ({
    addScene,
    preScene,
    nextScene,
    currentSceneIndex,
    scenesCount,
    disabled,
}) => {
    const isFirstScene = currentSceneIndex === 0;
    const isLastScene = currentSceneIndex + 1 === scenesCount;

    const warpOnClick = useCallback(
        (onClick: () => void) => {
            if (disabled) {
                return undefined;
            }
            return onClick;
        },
        [disabled],
    );

    return (
        <div
            className={classNames("scenes-controller-container", {
                disabled,
            })}
        >
            <div className="scenes-controller-btn-list">
                <div className="scenes-controller-btn" onClick={warpOnClick(addScene)}>
                    <img alt="add scene" src={addSceneSVG} />
                </div>
                <div className="scenes-controller-btn" onClick={warpOnClick(preScene)}>
                    <img
                        alt="previous scene"
                        src={isFirstScene ? preScenesDisabledSVG : preScenesSVG}
                    />
                </div>
                <div className="scenes-controller-info">
                    {currentSceneIndex + 1} / {scenesCount}
                </div>
                <div className="scenes-controller-btn" onClick={warpOnClick(nextScene)}>
                    <img
                        alt="next scene"
                        src={isLastScene ? nextScenesDisabledSVG : nextScenesSVG}
                    />
                </div>
            </div>
        </div>
    );
};

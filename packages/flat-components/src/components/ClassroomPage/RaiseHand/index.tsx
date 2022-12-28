import "./style.less";

import React, { useMemo } from "react";
import classNames from "classnames";
import { isInteger } from "lodash-es";
import { useTranslate } from "@netless/flat-i18n";
import { SVGHandUp } from "../../FlatIcons";

export interface RaiseHandProps {
    isRaiseHand?: boolean;
    disableHandRaising?: boolean;
    onRaiseHandChange: () => void;
}

export const RaiseHand: React.FC<RaiseHandProps> = ({
    isRaiseHand,
    disableHandRaising,
    onRaiseHandChange,
}) => {
    const t = useTranslate();

    return disableHandRaising ? null : (
        <button className="raise-hand-btn" title={t("raise-your-hand")} onClick={onRaiseHandChange}>
            <SVGHandUp active={isRaiseHand} />
        </button>
    );
};

export interface RaisingHandProps {
    count: number;
    onClick: () => void;
}

export const RaisingHand: React.FC<RaisingHandProps> = ({ count, onClick }) => {
    const t = useTranslate();

    const countLabel = useMemo(
        () =>
            isInteger(count) ? (
                <span
                    className={classNames("raise-hand-red-dot", {
                        "is-large": count > 9,
                    })}
                >
                    {count < 10 ? count : "9+"}
                </span>
            ) : null,
        [count],
    );

    return count > 0 ? (
        <button className="raise-hand-btn" title={t("raise-your-hand")} onClick={onClick}>
            <SVGHandUp active />
            {countLabel}
        </button>
    ) : null;
};

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
    active?: boolean;
    onClick: () => void;
}

export const RaisingHand: React.FC<RaisingHandProps> = ({ count, active = false, onClick }) => {
    const t = useTranslate();

    const countLabel = useMemo(
        () =>
            isInteger(count) && count > 0 ? (
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

    return (
        <button className="raise-hand-btn" title={t("raise-your-hand")} onClick={onClick}>
            <SVGHandUp active={active} />
            {countLabel}
        </button>
    );
};

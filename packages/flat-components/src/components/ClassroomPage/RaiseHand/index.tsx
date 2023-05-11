import "./style.less";

import React, { useCallback, useMemo, useRef, useState } from "react";
import classNames from "classnames";
import { isInteger } from "lodash-es";
import { useTranslate } from "@netless/flat-i18n";
import { SVGHandUp } from "../../FlatIcons";
import { useIsUnMounted } from "../../../utils/hooks";

export interface RaiseHandProps {
    isRaiseHand?: boolean;
    disableHandRaising?: boolean;
    onRaiseHandChange: (raise: boolean) => void;
}

export const RaiseHand: React.FC<RaiseHandProps> = ({
    isRaiseHand,
    disableHandRaising,
    onRaiseHandChange,
}) => {
    const t = useTranslate();
    const isUnmounted = useIsUnMounted();
    // if temp is not null, use temp, otherwise use isRaiseHand
    const timerRef = useRef(0);
    const [temp, setTemp] = useState<boolean | null>(null);

    const active = temp === null ? isRaiseHand : temp;

    const onClick = useCallback(() => {
        onRaiseHandChange(!active);
        setTemp(!active);
        clearTimeout(timerRef.current);
        timerRef.current = window.setTimeout(() => {
            if (!isUnmounted.current) {
                setTemp(null);
            }
        }, 3000);
    }, [active, isUnmounted, onRaiseHandChange]);

    return disableHandRaising ? null : (
        <button
            className={classNames("raise-hand-btn", {
                "is-active": active,
            })}
            title={t("raise-your-hand")}
            onClick={onClick}
        >
            <SVGHandUp active={active} />
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

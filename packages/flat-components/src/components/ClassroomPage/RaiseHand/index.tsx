import raiseHandSVG from "./icons/raise-hand.svg";
import raiseHandActiveSVG from "./icons/raise-hand-active.svg";
import "./style.less";

import React from "react";
import { useTranslation } from "react-i18next";

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
    const { t } = useTranslation();

    return disableHandRaising ? null : (
        <button className="raise-hand-btn" title={t("raise-your-hand")} onClick={onRaiseHandChange}>
            <img src={isRaiseHand ? raiseHandActiveSVG : raiseHandSVG} />
        </button>
    );
};

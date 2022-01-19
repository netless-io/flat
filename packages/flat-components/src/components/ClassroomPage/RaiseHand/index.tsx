import React from "react";
import { useTranslation } from "react-i18next";
import raiseHandActiveSVG from "./icons/raise-hand-active.svg";
import raiseHandSVG from "./icons/raise-hand.svg";
import "./style.less";

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

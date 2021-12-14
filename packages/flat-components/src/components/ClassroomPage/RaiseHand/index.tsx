import raiseHandSVG from "./icons/raise-hand.svg";
import raiseHandActiveSVG from "./icons/raise-hand-active.svg";
import "./style.less";

import React from "react";

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
    return disableHandRaising ? null : (
        <button className="raise-hand-btn" title="举手" onClick={onRaiseHandChange}>
            <img src={isRaiseHand ? raiseHandActiveSVG : raiseHandSVG} />
        </button>
    );
};

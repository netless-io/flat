import "./style.less";

import React, { HTMLAttributes, FC } from "react";
import { formatInviteCode } from "../../utils/room";
export * from "./PmiExistTip";

export interface PmiDescProps extends HTMLAttributes<HTMLSpanElement> {
    text: string;
    pmi: string;
}

export const PmiDesc: FC<PmiDescProps> = ({ text, pmi, ...restProps }) => {
    return (
        <span className="pmi" {...restProps}>
            <span className="pmi-text">{text}</span>
            <Pmi className="pmi-id" pmi={pmi} />
        </span>
    );
};

export interface PmiProps extends HTMLAttributes<HTMLSpanElement> {
    pmi: string;
}

export const Pmi: FC<PmiProps> = ({ pmi, ...restProps }) => {
    return (
        <span className="pmi-selectable" {...restProps}>
            {formatInviteCode("", pmi)}
        </span>
    );
};

export default PmiDesc;

import "./style.less";

import React, { HTMLAttributes, FC } from "react";
export * from "./PmiExistTip";

export interface PmiDescProps extends HTMLAttributes<HTMLSpanElement> {
    text: string;
    pmi: string;
}

export const PmiDesc: FC<PmiDescProps> = ({ text, pmi, ...restProps }) => {
    return (
        <span className="pmi" {...restProps}>
            <span className="pmi-text">{text}</span>
            <span className="pmi-id">{pmi}</span>
        </span>
    );
};

export default PmiDesc;

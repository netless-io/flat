import React from "react";
import CoverCNPNG from "./cover.png";
import CoverENPNG from "./cover-en.png";

export function Cover({ isZh }: { isZh: boolean }): React.ReactElement {
    return <img alt="cover" src={isZh ? CoverCNPNG : CoverENPNG} style={{ width: "100%" }} />;
}

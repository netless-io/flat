import React from "react";
import CoverDarkCNPNG from "./cover-dark.png";
import CoverDarkENPNG from "./cover-dark-en.png";

export function CoverDark({ isZh }: { isZh: boolean }): React.ReactElement {
    return (
        <img
            alt="cover-dark"
            src={isZh ? CoverDarkCNPNG : CoverDarkENPNG}
            style={{ width: "100%" }}
        />
    );
}

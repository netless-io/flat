import React from "react";
import coverDarkCNSVG from "./cover-dark.svg";
import coverDarkENSVG from "./cover-dark-en.svg";

export function CoverDark({ isZh }: { isZh: boolean }): React.ReactElement {
    return <img alt="cover-dark" draggable={false} src={isZh ? coverDarkCNSVG : coverDarkENSVG} />;
}

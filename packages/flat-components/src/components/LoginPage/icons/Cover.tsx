import React from "react";
import coverCNSVG from "./cover.svg";
import coverENSVG from "./cover-en.svg";

export function Cover({ isZh }: { isZh: boolean }): React.ReactElement {
    return <img alt="cover" draggable={false} src={isZh ? coverCNSVG : coverENSVG} />;
}

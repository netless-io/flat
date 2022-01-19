import React, { ReactElement } from "react";
import { TopBarRoundBtn as TopBarRoundBtnImpl } from "flat-components";
import classBeginSVG from "./icons/class-begin.svg";
import classInteractionSVG from "./icons/class-interaction.svg";
import classLectureSVG from "./icons/class-lecture.svg";
import classPauseSVG from "./icons/class-pause.svg";
import classResumeSVG from "./icons/class-resume.svg";
import classStopSVG from "./icons/class-stop.svg";

const Icons = {
    "class-begin": classBeginSVG,
    "class-interaction": classInteractionSVG,
    "class-lecture": classLectureSVG,
    "class-pause": classPauseSVG,
    "class-resume": classResumeSVG,
    "class-stop": classStopSVG,
};

export interface TopBarRoundBtnProps extends React.HTMLAttributes<HTMLButtonElement> {
    dark?: boolean;
    /** file name (without .ext) in src/assets/image/ */
    iconName: keyof typeof Icons;
}

export function TopBarRoundBtn({
    dark,
    iconName,
    ...restProps
}: TopBarRoundBtnProps): ReactElement {
    return <TopBarRoundBtnImpl {...restProps} dark={dark} icon={<img src={Icons[iconName]} />} />;
}

// Add keyboard shortcut "Opt/Alt + [Shift] + Q" to select next/previous color.

import type { FastboardApp, Appliance } from "@netless/fastboard";

type Color = [r: number, g: number, b: number];

// color keys from fastboard:
// https://github.com/netless-io/fastboard/blob/main/packages/fastboard-ui/src/components/Toolbar/components/constants.ts
const colors: ReadonlyArray<Color> = [
    [224, 32, 32],
    [247, 181, 0],
    [109, 212, 0],
    [50, 197, 255],
    [0, 145, 255],
    [98, 54, 255],
    [182, 32, 224],
    [109, 114, 120],
];

function nextColor(c: Color): Color {
    const index = colors.findIndex(d => d[0] === c[0] && d[1] === c[1] && d[2] === c[2]);
    return colors[(index + 1) % colors.length];
}

function previousColor(c: Color): Color {
    const index = colors.findIndex(d => d[0] === c[0] && d[1] === c[1] && d[2] === c[2]);
    return colors[(index - 1 + colors.length) % colors.length];
}

const strokeAppliances = new Set<Appliance>([
    "pencil",
    "rectangle",
    "arrow",
    "straight",
    "ellipse",
    "shape",
]);

const keyQ = new Set(["q", "œ"]);

export function registerColorShortcut(app: FastboardApp): () => void {
    const shortcut = (e: KeyboardEvent): void => {
        if (e.altKey && keyQ.has(e.key.toLowerCase())) {
            e.preventDefault();

            const { currentApplianceName, strokeColor, textColor } = app.memberState.value;
            const select = e.shiftKey ? previousColor : nextColor;
            const appliance = currentApplianceName as Appliance;
            const isText = appliance === "text";
            const isStroke = strokeAppliances.has(appliance);

            if (isStroke) {
                app.setStrokeColor(select(strokeColor as Color));
            } else if (isText) {
                app.setTextColor(select((textColor || [0, 0, 0]) as Color));
            } else {
                app.setAppliance("pencil");
            }
        }
    };
    document.addEventListener("keydown", shortcut);
    return () => document.removeEventListener("keydown", shortcut);
}

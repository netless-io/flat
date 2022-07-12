import { FastboardApp } from "@netless/fastboard-react";
import { CursorNames } from "white-web-sdk";

type Color = string;

function getCursorUrl(color: Color): string {
    // eslint-disable-next-line @typescript-eslint/quotes
    return `url("data:image/svg+xml,%3Csvg width='24' height='24' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Ccircle cx='12' cy='12' r='2.5' stroke='%23${color}' stroke-linejoin='square'/%3E%3Ccircle cx='12' cy='12' r='3.5' stroke='%23${color}'/%3E%3C/g%3E%3C/svg%3E") 12 12, auto;`; // cspell:disable-line
}

function makeStyleContent(config: Partial<Record<CursorNames, Color>>): string {
    let result = "";
    Object.keys(config).forEach(cursorName => {
        const color = config[cursorName as CursorNames] as Color;
        result += `.netless-whiteboard.${cursorName} {cursor: ${getCursorUrl(color)}}\n`;
    });
    return result;
}

class InjectCustomCursor {
    public $style = document.createElement("style");

    public enable(config: Partial<Record<CursorNames, Color>>): void {
        this.$style.textContent = makeStyleContent(config);
        document.head.appendChild(this.$style);
    }

    public disable(): void {
        document.head.removeChild(this.$style);
    }
}

const cursorInjector = new InjectCustomCursor();

export default cursorInjector;

export function injectCursor(app: FastboardApp): () => void {
    const dispose = app.memberState.subscribe(state => {
        const [r, g, b] = state.strokeColor;
        const hex = ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        cursorInjector.enable({ [CursorNames.Pencil]: hex });
    });
    return () => {
        cursorInjector.disable();
        dispose();
    };
}

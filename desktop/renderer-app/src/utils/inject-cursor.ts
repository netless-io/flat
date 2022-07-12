import { FastboardApp } from "@netless/fastboard-react";
import { CursorNames } from "white-web-sdk";

type Color = string;

function getCircleUrl(color: Color): string {
    // eslint-disable-next-line @typescript-eslint/quotes
    return `url("data:image/svg+xml,%3Csvg width='24' height='24' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Ccircle cx='12' cy='12' r='2.5' stroke='%23${color}' stroke-linejoin='square'/%3E%3Ccircle cx='12' cy='12' r='3.5' stroke='%23${color}'/%3E%3C/g%3E%3C/svg%3E") 12 12, auto;`; // cspell:disable-line
}

function getCrossUrl(color: Color): string {
    // eslint-disable-next-line @typescript-eslint/quotes
    return `url("data:image/svg+xml,%3Csvg width='24' height='24' xmlns='http://www.w3.org/2000/svg' fill='none'%3E%3Cpath d='M5 12H19' stroke='%23${color}' stroke-linejoin='round'/%3E%3Cpath d='M12 5V19' stroke='%23${color}' stroke-linejoin='round'/%3E%3C/svg%3E%0A") 12 12, auto`; // cspell:disable-line
}

function makeStyleContent(config: Partial<Record<CursorNames, Color>>): string {
    let result = "";
    Object.keys(config).forEach(cursorName => {
        const cursor = cursorName as CursorNames;
        const color = config[cursor] as Color;
        const getter = cursor === CursorNames.Pencil ? getCircleUrl : getCrossUrl;
        result += `.netless-whiteboard.${cursor} {cursor: ${getter(color)}}\n`;
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
        cursorInjector.enable({
            [CursorNames.Pencil]: hex,
            [CursorNames.Rectangle]: hex,
            [CursorNames.Ellipse]: hex,
            [CursorNames.Straight]: hex,
            [CursorNames.Arrow]: hex,
            [CursorNames.Shape]: hex,
        });
    });
    return () => {
        cursorInjector.disable();
        dispose();
    };
}

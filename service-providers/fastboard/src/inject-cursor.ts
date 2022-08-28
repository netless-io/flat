import type { FastboardApp } from "@netless/fastboard";
import type { CursorNames } from "white-web-sdk";

type Color = string;
type CursorName = `${CursorNames}`;

/**
 * See init-white-sdk.ts
 * ```js
 * $el.style.cursor = getCircle('fff')
 * ```
 */
function getCircleUrl(color: Color): string {
    // eslint-disable-next-line @typescript-eslint/quotes
    return `url("data:image/svg+xml,%3Csvg width='24' height='24' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Ccircle cx='12' cy='12' r='2.5' stroke='%23${color}' stroke-linejoin='square'/%3E%3Ccircle cx='12' cy='12' r='3.5' stroke='%23${color}'/%3E%3C/g%3E%3C/svg%3E") 12 12, auto;`; // cspell:disable-line
}

function getCrossUrl(color: Color): string {
    // eslint-disable-next-line @typescript-eslint/quotes
    return `url("data:image/svg+xml,%3Csvg width='24' height='24' xmlns='http://www.w3.org/2000/svg' fill='none'%3E%3Cpath d='M5 12H19' stroke='%23${color}' stroke-linejoin='round'/%3E%3Cpath d='M12 5V19' stroke='%23${color}' stroke-linejoin='round'/%3E%3C/svg%3E%0A") 12 12, auto`; // cspell:disable-line
}

function makeStyleContent(config: Partial<Record<CursorName, Color>>): string {
    let result = "";
    Object.keys(config).forEach(cursorName => {
        const cursor = cursorName as CursorName;
        const color = config[cursor] as Color;
        const getter = cursor === "cursor-pencil" ? getCircleUrl : getCrossUrl;
        result += `.netless-whiteboard.${cursor} {cursor: ${getter(color)}}\n`;
    });
    return result;
}

// We re-implement the `injectCustomStyle` function of white-web-sdk,
// but make it work dynamically (i.e. inject / change the cursor style at any time).
class InjectCustomCursor {
    public $style = document.createElement("style");

    /**
     * ```js
     * cursorInjector.enable({ [CursorNames.Pencil]: 'fff' })
     * ```
     */
    public enable(config: Partial<Record<CursorName, Color>>): void {
        this.$style.textContent = makeStyleContent(config);
        // always make sure the style is at the end
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
            "cursor-pencil": hex,
            "cursor-rectangle": hex,
            "cursor-ellipse": hex,
            "cursor-straight": hex,
            "cursor-arrow": hex,
            "cursor-shape": hex,
        });
    });
    return () => {
        cursorInjector.disable();
        dispose();
    };
}

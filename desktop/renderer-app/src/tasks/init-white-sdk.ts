import { injectCustomStyle, CursorNames } from "white-web-sdk";

// https://codepen.io/tigt/post/optimizing-svgs-in-data-uris
// https://yoksel.github.io/url-encoder
// eslint-disable-next-line @typescript-eslint/quotes
const circle = `url("data:image/svg+xml,%3Csvg width='24' height='24' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Ccircle cx='12' cy='12' r='5.5' stroke='%23000' stroke-linejoin='square'/%3E%3Ccircle cx='12' cy='12' r='6.5' stroke='%23FFF'/%3E%3C/g%3E%3C/svg%3E") 12 12, auto;`; // cspell:disable-line

export const initWhiteSDK = (): void => {
    injectCustomStyle({
        [CursorNames.Pencil]: [circle],
        [CursorNames.Eraser]: [circle],
    });
};

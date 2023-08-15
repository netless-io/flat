import { createMachine } from "xstate";

export interface ToggleContext {}

export type ToggleEventsType =
    | "SWITCH_TO_CODE"
    | "SWITCH_TO_REGISTER"
    | "SWITCH_TO_QRCODE"
    | "SWITCH_TO_PASSWORD"
    | "SWITCH_TO_BINDING_PHONE"
    | "SWITCH_TO_REBINDING_PHONE";

export const loginMachine = createMachine<ToggleContext, { type: ToggleEventsType }>({
    id: "login-page",
    initial: "loginWithPassword",
    states: {
        loginWithPassword: {
            on: {
                SWITCH_TO_CODE: "loginWithCode",
                SWITCH_TO_REGISTER: "register",
                SWITCH_TO_QRCODE: "wechatQRCode",
                SWITCH_TO_BINDING_PHONE: "bindingPhone",
            },
        },
        loginWithCode: {
            on: {
                SWITCH_TO_PASSWORD: "loginWithPassword",
                SWITCH_TO_QRCODE: "wechatQRCode",
                SWITCH_TO_BINDING_PHONE: "bindingPhone",
            },
        },
        register: {
            on: {
                SWITCH_TO_PASSWORD: "loginWithPassword",
                SWITCH_TO_QRCODE: "wechatQRCode",
                SWITCH_TO_BINDING_PHONE: "bindingPhone",
            },
        },
        wechatQRCode: {
            on: {
                SWITCH_TO_BINDING_PHONE: "bindingPhone",
                SWITCH_TO_PASSWORD: "loginWithPassword",
            },
        },
        bindingPhone: {
            on: {
                SWITCH_TO_PASSWORD: "loginWithPassword",
                SWITCH_TO_REBINDING_PHONE: "rebindingPhone",
            },
        },
        rebindingPhone: {
            on: {
                SWITCH_TO_BINDING_PHONE: "bindingPhone",
            },
        },
    },
    predictableActionArguments: true,
});

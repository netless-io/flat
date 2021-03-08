import type AgoraSdk from "agora-electron-sdk";

export function useRTCEngine(): AgoraSdk {
    return window.rtcEngine;
}

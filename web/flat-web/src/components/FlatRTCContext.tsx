import { createContext } from "react";
import type { FlatRTC } from "@netless/flat-rtc";
import { FlatRTCAgoraWeb } from "@netless/flat-rtc-agora-web";
import { AGORA } from "../constants/process";

export const flatRTC = FlatRTCAgoraWeb.getInstance(AGORA.APP_ID);

export const FlatRTCContext = createContext<FlatRTC>(flatRTC);

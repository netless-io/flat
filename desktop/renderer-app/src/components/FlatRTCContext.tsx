import { createContext } from "react";
import type { FlatRTC } from "@netless/flat-rtc";

export const FlatRTCContext = createContext<FlatRTC>(null as any);

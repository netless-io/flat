import { createContext } from "react";
import { IPCStore } from "../stores/ipc-store";

export const IPCContext = createContext<IPCStore>(null as any);

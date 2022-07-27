import { createContext } from "react";
import { PageStore } from "../stores/utils";

export const PageStoreContext = createContext<PageStore>(null as any);

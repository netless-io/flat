import { createContext } from "react";
import { PageStoreLegacy } from "../stores/page-store";

export const PageStoreContextLegacy = createContext<PageStoreLegacy>(null as any);

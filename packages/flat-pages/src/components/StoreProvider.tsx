import React, { createContext, FC } from "react";
import { preferencesStore, globalStore, roomStore } from "@netless/flat-stores";
import { pageStore } from "../stores/page-store";
import { WindowsBtnContextInterface } from "./WindowsBtnContext";
import { IRuntimeContext } from "./RuntimeContext";
import { IAutoUpdateContext } from "./AutoUpdateContext";

export const GlobalStoreContext = createContext(globalStore);

export const RoomStoreContext = createContext(roomStore);

export const PreferencesStoreContext = createContext(preferencesStore);

export const PageStoreContext = createContext(pageStore);

export const WindowsSystemBtnContext = createContext<WindowsBtnContextInterface | undefined>(
    undefined,
);

export const RuntimeContext = createContext<IRuntimeContext | undefined>(undefined);

export const AutoUpdateContext = createContext<IAutoUpdateContext | undefined>(undefined);

interface StoreProviderProps {
    children: React.ReactNode;
    WindowsBtnContext?: WindowsBtnContextInterface;
    runtime?: IRuntimeContext;
    autoUpdate?: IAutoUpdateContext;
}

export const StoreProvider: FC<StoreProviderProps> = ({
    children,
    WindowsBtnContext,
    runtime,
    autoUpdate,
}) => (
    <GlobalStoreContext.Provider value={globalStore}>
        <PreferencesStoreContext.Provider value={preferencesStore}>
            <RoomStoreContext.Provider value={roomStore}>
                <PageStoreContext.Provider value={pageStore}>
                    <WindowsSystemBtnContext.Provider value={WindowsBtnContext}>
                        <RuntimeContext.Provider value={runtime}>
                            <AutoUpdateContext.Provider value={autoUpdate}>
                                {children}
                            </AutoUpdateContext.Provider>
                        </RuntimeContext.Provider>
                    </WindowsSystemBtnContext.Provider>
                </PageStoreContext.Provider>
            </RoomStoreContext.Provider>
        </PreferencesStoreContext.Provider>
    </GlobalStoreContext.Provider>
);

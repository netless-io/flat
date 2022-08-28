import React, { createContext, FC } from "react";
import { preferencesStore, globalStore, roomStore } from "@netless/flat-stores";
import { pageStore } from "../stores/page-store";
import { WindowsBtnContextInterface } from "./WindowsBtnContext";

export const GlobalStoreContext = createContext(globalStore);

export const RoomStoreContext = createContext(roomStore);

export const PreferencesStoreContext = createContext(preferencesStore);

export const PageStoreContext = createContext(pageStore);

export const WindowsSystemBtnContext = createContext<WindowsBtnContextInterface | undefined>(
    undefined,
);

interface StoreProviderProps {
    children: React.ReactNode;
    WindowsBtnContext?: WindowsBtnContextInterface;
}

export const StoreProvider: FC<StoreProviderProps> = ({ children, WindowsBtnContext }) => (
    <GlobalStoreContext.Provider value={globalStore}>
        <PreferencesStoreContext.Provider value={preferencesStore}>
            <RoomStoreContext.Provider value={roomStore}>
                <PageStoreContext.Provider value={pageStore}>
                    <WindowsSystemBtnContext.Provider value={WindowsBtnContext}>
                        {children}
                    </WindowsSystemBtnContext.Provider>
                </PageStoreContext.Provider>
            </RoomStoreContext.Provider>
        </PreferencesStoreContext.Provider>
    </GlobalStoreContext.Provider>
);

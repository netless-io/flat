import React, { createContext, FC } from "react";
import { preferencesStore, globalStore, roomStore } from "@netless/flat-stores";
import { pageStore } from "./page-store";

export const GlobalStoreContext = createContext(globalStore);

export const RoomStoreContext = createContext(roomStore);

export const PreferencesStoreContext = createContext(preferencesStore);

export const PageStoreContext = createContext(pageStore);

export const StoreProvider: FC = ({ children }) => (
    <GlobalStoreContext.Provider value={globalStore}>
        <PreferencesStoreContext.Provider value={preferencesStore}>
            <RoomStoreContext.Provider value={roomStore}>
                <PageStoreContext.Provider value={pageStore}>{children}</PageStoreContext.Provider>
            </RoomStoreContext.Provider>
        </PreferencesStoreContext.Provider>
    </GlobalStoreContext.Provider>
);

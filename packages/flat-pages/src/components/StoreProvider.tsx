import React, { createContext, FC } from "react";
import { preferencesStore, globalStore, roomStore } from "@netless/flat-stores";

export const GlobalStoreContext = createContext(globalStore);

export const RoomStoreContext = createContext(roomStore);

export const PreferencesStoreContext = createContext(preferencesStore);

export const StoreProvider: FC = ({ children }) => (
    <GlobalStoreContext.Provider value={globalStore}>
        <PreferencesStoreContext.Provider value={preferencesStore}>
            <RoomStoreContext.Provider value={roomStore}>{children}</RoomStoreContext.Provider>
        </PreferencesStoreContext.Provider>
    </GlobalStoreContext.Provider>
);

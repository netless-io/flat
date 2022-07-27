import React, { createContext, FC } from "react";
import { configStore } from "../stores/config-store";
import { globalStore } from "../stores/global-store";
import { roomStore } from "../stores/room-store";

export const GlobalStoreContext = createContext(globalStore);

export const RoomStoreContext = createContext(roomStore);

export const ConfigStoreContext = createContext(configStore);

export const StoreProvider: FC = ({ children }) => (
    <GlobalStoreContext.Provider value={globalStore}>
        <ConfigStoreContext.Provider value={configStore}>
            <RoomStoreContext.Provider value={roomStore}>{children}</RoomStoreContext.Provider>
        </ConfigStoreContext.Provider>
    </GlobalStoreContext.Provider>
);

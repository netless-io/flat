import React, { createContext, FC } from "react";
import { globalStore } from "../stores/GlobalStore";
import { roomStore } from "../stores/RoomStore";

export const GlobalStoreContext = createContext(globalStore);

export const RoomStoreContext = createContext(roomStore);

export const StoreProvider: FC = ({ children }) => (
    <GlobalStoreContext.Provider value={globalStore}>
        <RoomStoreContext.Provider value={roomStore}>{children}</RoomStoreContext.Provider>
    </GlobalStoreContext.Provider>
);

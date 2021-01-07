export interface LSJoinRoomHistoryItem {
    uuid: string;
    name?: string;
}

/**
 * @returns a list of room IDs
 */
export function getJoinRoomHistories(): LSJoinRoomHistoryItem[] {
    const rooms = localStorage.getItem("joinRoomHistories");
    return rooms ? JSON.parse(rooms) : [];
}

/**
 * save the current room history to the top of the list
 */
export function saveJoinRoomHistories(room: LSJoinRoomHistoryItem): LSJoinRoomHistoryItem[] {
    const rooms = getJoinRoomHistories();
    const existIndex = rooms.findIndex(data => data.uuid === room.uuid);
    if (existIndex >= 0) {
        rooms.splice(existIndex, 1);
    }
    rooms.unshift(room);
    localStorage.setItem("joinRoomHistories", JSON.stringify(rooms));
    return rooms;
}

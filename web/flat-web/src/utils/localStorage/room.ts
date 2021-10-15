import dateFormat from "date-fns/format";

export enum Identity {
    creator = "creator",
    joiner = "joiner",
}

export interface LSRoom {
    uuid: string;
    time: string;
    identity: Identity;
    userId: string;
    roomName?: string;
    cover?: string;
    recordings?: Array<{
        uuid: string;
        startTime: number;
        endTime: number;
        videoUrl?: string;
    }>;
}

export function getRooms(): LSRoom[] {
    const rooms = localStorage.getItem("rooms");
    return rooms ? JSON.parse(rooms) : [];
}

export function getRoom(uuid: string): LSRoom | null {
    const rooms = getRooms();
    return rooms.find(data => data.uuid === uuid) || null;
}

interface LSRoomSaveConfig extends Omit<LSRoom, "time"> {
    time?: string;
}

/**
 * Save new room or update current room to local-storage and move it to the top
 */
export function saveRoom(config: LSRoomSaveConfig): LSRoom {
    const rooms = getRooms();
    const existIndex = rooms.findIndex(data => data.uuid === config.uuid);
    if (existIndex >= 0) {
        const [existRoom] = rooms.splice(existIndex, 1);
        rooms.unshift({ ...existRoom, ...config });
    } else {
        const time = dateFormat(new Date(), "LLL d, y h:m a");
        rooms.unshift({ time, ...config });
    }
    localStorage.setItem("rooms", JSON.stringify(rooms));
    return rooms[0];
}

/**
 * Update field values of a room
 * @returns success or not
 */
export function updateRoomProps(
    uuid: string,
    config: Partial<Omit<LSRoom, "uuid" | "time" | "identity" | "userId">>,
): boolean {
    const rooms = getRooms();
    const roomIndex = rooms.findIndex(data => data.uuid === uuid);
    if (roomIndex < 0) {
        return false;
    }
    rooms[roomIndex] = { ...rooms[roomIndex], ...config };
    localStorage.setItem("rooms", JSON.stringify(rooms));
    return true;
}

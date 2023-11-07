import { postV2 } from "./utils";

export interface IsPmiRoomPayload {
    pmi: string;
}

export interface IsPmiRoomResult {
    result: boolean;
}

export function isPmiRoom(payload: IsPmiRoomPayload): Promise<boolean> {
    return postV2<IsPmiRoomPayload, IsPmiRoomResult>("user/is-pmi", payload).then(e => e.result);
}

export interface PmiListItem {
    roomUUID: string;
}

export function listPmi(): Promise<PmiListItem[]> {
    return postV2("room/list/pmi", {});
}

export interface CreateOrGetPmiPayload {
    create: boolean;
}

export interface CreateOrGetPmiResult {
    pmi: string;
}

export function createOrGetPmi(payload: CreateOrGetPmiPayload): Promise<string> {
    return postV2<CreateOrGetPmiPayload, CreateOrGetPmiResult>("user/pmi", payload).then(
        e => e.pmi,
    );
}

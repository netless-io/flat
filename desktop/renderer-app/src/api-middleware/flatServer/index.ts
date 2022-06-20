import { Region } from "flat-components";
import { RoomStatus, RoomType, Week } from "./constants";
import { post, post2, postNotAuth, PROCESSING } from "./utils";

export interface CreateOrdinaryRoomPayload {
    title: string;
    type: RoomType;
    region: Region;
    beginTime: number;
    /** default: one hour after beginTime */
    endTime?: number;
}

export interface CreateOrdinaryRoomResult {
    roomUUID: string;
}

export async function createOrdinaryRoom(payload: CreateOrdinaryRoomPayload): Promise<string> {
    const res = await post<CreateOrdinaryRoomPayload, CreateOrdinaryRoomResult>(
        "room/create/ordinary",
        payload,
    );
    return res.roomUUID;
}

export interface CreatePeriodicRoomPayload {
    title: string;
    type: RoomType;
    region: Region;
    beginTime: number;
    endTime: number;
    periodic:
        | {
              weeks: Week[];
              // max: 50
              rate: number;
          }
        | {
              weeks: Week[];
              endTime: number;
          };
}

export type CreatePeriodicRoomResult = {};

export async function createPeriodicRoom(payload: CreatePeriodicRoomPayload): Promise<void> {
    await post<CreatePeriodicRoomPayload, CreatePeriodicRoomResult>(
        "room/create/periodic",
        payload,
    );
}

export enum ListRoomsType {
    All = "all",
    Today = "today",
    Periodic = "periodic",
    History = "history",
}

export interface FlatServerRoom {
    roomUUID: string;
    periodicUUID: string | null;
    ownerUUID: string;
    inviteCode: string;
    roomType: RoomType;
    ownerName: string;
    ownerAvatarURL: string;
    title: string;
    beginTime: number;
    endTime: number;
    roomStatus: RoomStatus;
    hasRecord?: boolean;
}

export type ListRoomsPayload = {
    page: number;
};

export type ListRoomsResult = FlatServerRoom[];

export function listRooms(
    type: ListRoomsType,
    payload: ListRoomsPayload,
): Promise<ListRoomsResult> {
    return post<undefined, ListRoomsResult>(`room/list/${type}`, undefined, payload);
}

export interface JoinRoomPayload {
    uuid: string;
}

export interface JoinRoomResult {
    roomType: RoomType;
    roomUUID: string;
    ownerUUID: string;
    whiteboardRoomToken: string;
    whiteboardRoomUUID: string;
    rtcUID: number;
    rtcToken: string;
    rtmToken: string;
    rtcShareScreen: {
        uid: number;
        token: string;
    };
    showGuide: boolean;
}

export function joinRoom(uuid: string): Promise<JoinRoomResult> {
    return post<JoinRoomPayload, JoinRoomResult>("room/join", { uuid });
}

export interface UsersInfoPayload {
    roomUUID: string;
    usersUUID: string[];
}

export type UsersInfoResult = {
    [key in string]: {
        name: string;
        rtcUID: number;
        avatarURL: string;
    };
};

export function usersInfo(payload: UsersInfoPayload): Promise<UsersInfoResult> {
    return post<UsersInfoPayload, UsersInfoResult>("room/info/users", payload);
}

export interface OrdinaryRoomInfo {
    title: string;
    beginTime: number;
    endTime: number;
    roomType: RoomType;
    roomStatus: RoomStatus;
    ownerUUID: string;
    ownerName: string;
    region: Region;
}

export interface OrdinaryRoomInfoPayload {
    roomUUID: string;
}

export interface OrdinaryRoomInfoResult {
    roomInfo: OrdinaryRoomInfo;
    inviteCode: string;
}

export function ordinaryRoomInfo(roomUUID: string): Promise<OrdinaryRoomInfoResult> {
    return post<OrdinaryRoomInfoPayload, OrdinaryRoomInfoResult>("room/info/ordinary", {
        roomUUID,
    });
}

export interface PeriodicSubRoomInfoPayload {
    periodicUUID: string;
    roomUUID: string;
    needOtherRoomTimeInfo?: boolean;
}

export interface PeriodicSubRoomInfo {
    title: string;
    beginTime: number;
    endTime: number;
    roomType: RoomType;
    roomStatus: RoomStatus;
    ownerUUID: string;
    region: Region;
}

export interface PeriodicSubRoomInfoResult {
    roomInfo: PeriodicSubRoomInfo;
    previousPeriodicRoomBeginTime: number | null;
    nextPeriodicRoomEndTime: number | null;
    count: number;
}

export function periodicSubRoomInfo(
    payload: PeriodicSubRoomInfoPayload,
): Promise<PeriodicSubRoomInfoResult> {
    return post<PeriodicSubRoomInfoPayload, PeriodicSubRoomInfoResult>(
        "room/info/periodic-sub-room",
        payload,
    );
}

export interface PeriodicRoomInfoPayload {
    periodicUUID: string;
}

export type PeriodicRoomInfoResult = {
    periodic: {
        ownerUUID: string;
        ownerName: string;
        inviteCode: string;
        endTime: number;
        rate: number | null;
        title: string;
        weeks: Week[];
        roomType: RoomType;
        region: Region;
    };
    rooms: Array<{
        roomUUID: string;
        beginTime: number;
        endTime: number;
        roomStatus: RoomStatus;
    }>;
};

export function periodicRoomInfo(periodicUUID: string): Promise<PeriodicRoomInfoResult> {
    return post<PeriodicRoomInfoPayload, PeriodicRoomInfoResult>("room/info/periodic", {
        periodicUUID,
    });
}

export interface StartClassPayload {
    roomUUID: string;
}

export type StartClassResult = {};

export function startClass(roomUUID: string): Promise<StartClassResult> {
    return post<StartClassPayload, StartClassResult>("room/update-status/started", { roomUUID });
}

export interface PauseClassPayload {
    roomUUID: string;
}

export type PauseClassResult = {};

export function pauseClass(roomUUID: string): Promise<PauseClassResult> {
    return post<PauseClassPayload, PauseClassResult>("room/update-status/paused", { roomUUID });
}

export interface StopClassPayload {
    roomUUID: string;
}

export type StopClassResult = {};

export function stopClass(roomUUID: string): Promise<StopClassResult> {
    return post<StopClassPayload, StopClassResult>("room/update-status/stopped", { roomUUID });
}

type CancelOrdinaryRoomResult = {};

interface CancelOrdinaryRoomPayload {
    roomUUID: string;
}

function cancelOrdinaryRoom(roomUUID: string): Promise<CancelOrdinaryRoomResult> {
    return post<CancelOrdinaryRoomPayload, CancelOrdinaryRoomResult>("room/cancel/ordinary", {
        roomUUID,
    });
}

type CancelPeriodicRoomResult = {};

interface CancelPeriodicRoomPayload {
    periodicUUID: string;
}

export function cancelPeriodicRoom(periodicUUID: string): Promise<CancelPeriodicRoomResult> {
    return post<CancelPeriodicRoomPayload, CancelPeriodicRoomResult>("room/cancel/periodic", {
        periodicUUID,
    });
}

type CancelPeriodicSubRoomResult = {};

interface CancelPeriodicSubRoomPayload {
    roomUUID: string;
    periodicUUID: string;
}

export function cancelPeriodicSubRoom(
    payload: CancelPeriodicSubRoomPayload,
): Promise<CancelPeriodicSubRoomResult> {
    return post<CancelPeriodicSubRoomPayload, CancelPeriodicSubRoomResult>(
        "room/cancel/periodic-sub-room",
        payload,
    );
}

type CancelHistoryRoomResult = {};

interface CancelHistoryRoomPayload {
    roomUUID: string;
}

function cancelHistoryRoom(roomUUID: string): Promise<CancelHistoryRoomResult> {
    return post<CancelHistoryRoomPayload, CancelHistoryRoomResult>("room/cancel/history", {
        roomUUID,
    });
}

export type CancelRoomResult = {};

export type CancelRoomPayload = {
    all?: boolean;
    roomUUID?: string;
    periodicUUID?: string;
    isHistory?: boolean;
};

export function cancelRoom({
    all,
    roomUUID,
    periodicUUID,
    isHistory,
}: CancelRoomPayload): Promise<
    CancelPeriodicRoomResult | CancelPeriodicSubRoomResult | CancelOrdinaryRoomResult
> | void {
    if (all && periodicUUID) {
        return cancelPeriodicRoom(periodicUUID);
    }

    if (roomUUID && periodicUUID) {
        return cancelPeriodicSubRoom({ roomUUID, periodicUUID });
    }

    if (isHistory && roomUUID) {
        return cancelHistoryRoom(roomUUID);
    }

    if (!isHistory && roomUUID) {
        return cancelOrdinaryRoom(roomUUID);
    }

    return;
}

export interface StartRecordRoomPayload {
    roomUUID: string;
}

export type StartRecordRoomResult = {};

export function startRecordRoom(roomUUID: string): Promise<StartRecordRoomResult> {
    return post<StartRecordRoomPayload, StartRecordRoomResult>("room/record/started", {
        roomUUID,
    });
}

export interface StopRecordRoomPayload {
    roomUUID: string;
}

export type StopRecordRoomResult = {};

export function stopRecordRoom(roomUUID: string): Promise<StopRecordRoomResult> {
    return post<StopRecordRoomPayload, StopRecordRoomResult>("room/record/stopped", {
        roomUUID,
    });
}

export interface UpdateRecordEndTimePayload {
    roomUUID: string;
}

export type UpdateRecordEndTimeResult = {};

export function updateRecordEndTime(roomUUID: string): Promise<UpdateRecordEndTimeResult> {
    return post<UpdateRecordEndTimePayload, UpdateRecordEndTimeResult>(
        "room/record/update-end-time",
        {
            roomUUID,
        },
    );
}

export interface RecordInfoPayload {
    roomUUID: string;
}

export interface RecordInfoResult {
    title: string;
    ownerUUID: string;
    roomType: RoomType;
    whiteboardRoomToken: string;
    whiteboardRoomUUID: string;
    rtmToken: string;
    recordInfo: Array<{
        beginTime: number;
        endTime: number;
        videoURL?: string;
    }>;
}

export function recordInfo(roomUUID: string): Promise<RecordInfoResult> {
    return post<RecordInfoPayload, RecordInfoResult>("room/record/info", { roomUUID });
}

export interface UpdateOrdinaryRoomPayload {
    roomUUID: string;
    beginTime: number;
    endTime: number;
    title: string;
    type: RoomType;
}

export type UpdateOrdinaryRoomResult = {};

export async function updateOrdinaryRoom(payload: UpdateOrdinaryRoomPayload): Promise<void> {
    await post<UpdateOrdinaryRoomPayload, UpdateOrdinaryRoomResult>(
        "room/update/ordinary",
        payload,
    );
}
export interface UpdatePeriodicRoomPayload {
    periodicUUID: string;
    beginTime: number;
    endTime: number;
    title: string;
    type: RoomType;
    periodic:
        | {
              weeks: Week[];
              rate: number;
          }
        | {
              weeks: Week[];
              endTime: number;
          };
}

export type UpdatePeriodicRoomResult = {};

export async function updatePeriodicRoom(payload: UpdatePeriodicRoomPayload): Promise<void> {
    await post<UpdatePeriodicRoomPayload, UpdatePeriodicRoomResult>(
        "room/update/periodic",
        payload,
    );
}

export interface UpdatePeriodicSubRoomPayload {
    periodicUUID: string;
    roomUUID: string;
    beginTime: number;
    endTime: number;
}

export type UpdatePeriodicSubRoomResult = {};

export async function updatePeriodicSubRoom(payload: UpdatePeriodicSubRoomPayload): Promise<void> {
    await post<UpdatePeriodicSubRoomPayload, UpdatePeriodicSubRoomResult>(
        "room/update/periodic-sub-room",
        payload,
    );
}

export interface LoginCheckPayload {}

export interface LoginCheckResult {
    name: string;
    avatar: string;
    token: string;
    userUUID: string;
    hasPhone: boolean;
}

export async function loginCheck(): Promise<LoginCheckResult> {
    return await post<LoginCheckPayload, LoginCheckResult>("login", {});
}

export interface SetAuthUUIDPayload {
    authUUID: string;
}

export interface SetAuthUUIDResult {
    authUUID: string;
}

export async function setAuthUUID(authUUID: string): Promise<SetAuthUUIDResult> {
    return await postNotAuth<SetAuthUUIDPayload, SetAuthUUIDResult>("login/set-auth-uuid", {
        authUUID,
    });
}

export interface LoginProcessPayload {
    authUUID: string;
}

export interface LoginProcessResult {
    name: string;
    avatar: string;
    userUUID: string;
    token: string;
    hasPhone: boolean;
}

export async function loginProcess(authUUID: string): Promise<LoginProcessResult> {
    return await postNotAuth<LoginProcessPayload, LoginProcessResult>("login/process", {
        authUUID,
    });
}

export interface LoginPhoneSendCodePayload {
    phone: string; // +8612345678901
}

export type LoginPhoneSendCodeResult = {};

export async function loginPhoneSendCode(phone: string): Promise<LoginPhoneSendCodeResult> {
    return await postNotAuth<LoginPhoneSendCodePayload, LoginPhoneSendCodeResult>(
        "login/phone/sendMessage",
        {
            phone,
        },
    );
}

export interface LoginPhonePayload {
    phone: string; // +8612345678901
    code: number; // 123456
}

export async function loginPhone(phone: string, code: number): Promise<LoginProcessResult> {
    return await postNotAuth<LoginPhonePayload, LoginProcessResult>("login/phone", {
        phone,
        code,
    });
}

export interface BindingPhoneSendCodePayload {
    phone: string; // +8612345678901
}

export type BindingPhoneSendCodeResult = {};

export async function bindingPhoneSendCode(phone: string): Promise<BindingPhoneSendCodeResult> {
    return await post<BindingPhoneSendCodePayload, BindingPhoneSendCodeResult>(
        "user/binding/platform/phone/sendMessage",
        {
            phone,
        },
    );
}

export interface BindingPhonePayload {
    phone: string; // +8612345678901
    code: number; // 123456
}

export type BindingPhoneResult = {};

export async function bindingPhone(phone: string, code: number): Promise<BindingPhoneResult> {
    return await post<BindingPhonePayload, BindingPhoneResult>("user/binding/platform/phone", {
        phone,
        code,
    });
}

export interface RenamePayload {
    name: string;
}

export type RenameResult = {};

export async function rename(name: string): Promise<RenameResult> {
    return await post<RenamePayload, RenameResult>("user/rename", {
        name,
    });
}

export interface UploadAvatarStartPayload {
    fileName: string;
    fileSize: number;
    region: Region;
}

export interface UploadAvatarResult {
    fileUUID: string;
    filePath: string;
    policy: string;
    policyURL: string;
    signature: string;
}

export async function uploadAvatarStart(
    fileName: string,
    fileSize: number,
    region: Region,
): Promise<UploadAvatarResult> {
    return await post<UploadAvatarStartPayload, UploadAvatarResult>("user/upload-avatar/start", {
        fileName,
        fileSize,
        region,
    });
}

export interface UploadAvatarFinishPayload {
    fileUUID: string;
}

export interface UploadAvatarFinishResult {
    avatarURL: string;
}

export async function uploadAvatarFinish(fileUUID: string): Promise<UploadAvatarFinishResult> {
    return await post<UploadAvatarFinishPayload, UploadAvatarFinishResult>(
        "user/upload-avatar/finish",
        {
            fileUUID,
        },
    );
}

export interface ListBindingsPayload {}

export interface ListBindingsResult {
    wechat: boolean;
    phone: boolean;
    agora: boolean;
    apple: boolean;
    github: boolean;
    google: boolean;
}

export async function listBindings(): Promise<ListBindingsResult> {
    return await post<ListBindingsPayload, ListBindingsResult>("user/binding/list", {});
}

export interface SetBindingAuthUUIDResult {}

export async function setBindingAuthUUID(authUUID: string): Promise<void> {
    await post<SetAuthUUIDPayload, SetBindingAuthUUIDResult>("user/binding/set-auth-uuid", {
        authUUID,
    });
}

export interface BindingProcessResult {
    processing: boolean;
    status: boolean;
}

export async function bindingProcess(authUUID: string): Promise<BindingProcessResult> {
    try {
        const ret = await post2<SetAuthUUIDPayload, {}>("user/binding/process", {
            authUUID,
        });
        if (ret === PROCESSING) {
            return {
                processing: true,
                status: false,
            };
        }
        return {
            processing: false,
            status: true,
        };
    } catch {
        return {
            processing: false,
            status: false,
        };
    }
}

export enum LoginPlatform {
    WeChat = "WeChat",
    Github = "Github",
    Apple = "Apple",
    Agora = "Agora",
    Google = "Google",
    Phone = "Phone",
}

export interface RemoveBindingPayload {
    target: LoginPlatform;
}

export interface RemoveBindingResult {
    token: string;
}

export async function removeBinding(target: LoginPlatform): Promise<RemoveBindingResult> {
    return await post<RemoveBindingPayload, RemoveBindingResult>("user/binding/remove", {
        target,
    });
}

export interface DeleteAccountValidateResult {
    alreadyJoinedRoomCount: number;
}

export async function deleteAccountValidate(): Promise<DeleteAccountValidateResult> {
    return await post<{}, DeleteAccountValidateResult>("user/deleteAccount/validate", {});
}

export async function deleteAccount(): Promise<void> {
    await post<{}, {}>("user/deleteAccount", {});
}

import { Status } from "./constants";
import { post, postNotAuth, requestFlatServer } from "./utils";

export interface LoginCheckPayload {}

export interface LoginCheckResult {
    name: string;
    avatar: string;
    token: string;
    userUUID: string;
    hasPhone: boolean;
}

export async function loginCheck(token?: string): Promise<LoginCheckResult> {
    return await post<LoginCheckPayload, LoginCheckResult>("login", {}, {}, token);
}

export interface setAuthUUIDPayload {
    authUUID: string;
}

export interface setAuthUUIDResult {
    authUUID: string;
}

export async function setAuthUUID(authUUID: string): Promise<setAuthUUIDResult> {
    return await postNotAuth<setAuthUUIDPayload, setAuthUUIDResult>("login/set-auth-uuid", {
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
    agoraSSOLoginID?: string;
}

export async function loginProcess(authUUID: string): Promise<LoginProcessResult> {
    return await postNotAuth<LoginProcessPayload, LoginProcessResult>("login/process", {
        authUUID,
    });
}

export interface AgoraSSOLoginCheckPayload {
    loginID: string;
}

export interface AgoraSSOLoginCheckResult {
    jwtToken: string;
}

// Only Web
export async function agoraSSOLoginCheck(loginID: string): Promise<AgoraSSOLoginCheckResult> {
    return await postNotAuth<AgoraSSOLoginCheckPayload, AgoraSSOLoginCheckResult>(
        "login/agora/check",
        {
            loginID,
        },
    );
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
        "user/bindingPhone/sendMessage",
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
    return await post<BindingPhonePayload, BindingPhoneResult>("user/bindingPhone", {
        phone,
        code,
    });
}

export interface ListBindingsPayload {}

export interface ListBindingsResult {
    wechat: boolean;
    phone: boolean;
    agora: boolean;
    apple: boolean;
    github: boolean;
    google: boolean;
    qq: boolean;
}

export async function listBindings(): Promise<ListBindingsResult> {
    return await post<ListBindingsPayload, ListBindingsResult>("user/binding/list", {});
}

export interface SetBindingAuthUUIDPayload {
    authUUID: string;
}

export interface SetBindingAuthUUIDResult {}

export async function setBindingAuthUUID(authUUID: string): Promise<void> {
    await post<SetBindingAuthUUIDPayload, SetBindingAuthUUIDResult>("user/binding/set-auth-uuid", {
        authUUID,
    });
}

export interface BindingProcessPayload {
    authUUID: string;
}

export interface BindingProcessResult {
    processing: boolean;
    status: boolean;
}

export async function bindingProcess(authUUID: string): Promise<BindingProcessResult> {
    try {
        const ret = await requestFlatServer<BindingProcessPayload, {}>("user/binding/process", {
            authUUID,
        });
        if (ret.status === Status.Process) {
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
    QQ = "QQ",
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

import { Status } from "./constants";
import { post, postNotAuth, postV2, postV2NotAuth, requestFlatServer } from "./utils";

export interface LoginCheckPayload {}

export interface LoginCheckResult {
    name: string;
    avatar: string;
    token: string;
    userUUID: string;
    hasPhone: boolean;
    hasPassword: boolean;
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
    hasPassword: boolean;
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

export interface PhoneSendCodePayload {
    phone: string; // +8612345678901
}

export type PhoneSendCodeResult = {};

export async function loginPhoneSendCode(phone: string): Promise<PhoneSendCodeResult> {
    return await postNotAuth<PhoneSendCodePayload, PhoneSendCodeResult>("login/phone/sendMessage", {
        phone,
    });
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

export interface LoginPhoneWithPwdPayload {
    phone: string; // +8612345678901
    password: string; // abc12345
}

export async function loginPhoneWithPwd(
    phone: string,
    password: string,
): Promise<LoginProcessResult> {
    return await postV2NotAuth<LoginPhoneWithPwdPayload, LoginProcessResult>("login/phone", {
        phone,
        password,
    });
}

export interface LoginEmailPayload {
    email: string; // name@example.com
    password: string;
}

export async function loginEmailWithPwd(
    email: string,
    password: string,
): Promise<LoginProcessResult> {
    return await postV2NotAuth<LoginEmailPayload, LoginProcessResult>("login/email", {
        email,
        password,
    });
}

// register account
export type RegisterResult = {};

export interface RegisterPhonePayload {
    phone: string;
    code: number;
    password: string;
}

export async function registerPhone(
    phone: string,
    code: number,
    password: string,
): Promise<RegisterResult> {
    return await postV2NotAuth<RegisterPhonePayload, RegisterResult>("register/phone", {
        phone,
        code,
        password,
    });
}

export async function registerPhoneSendCode(phone: string): Promise<PhoneSendCodeResult> {
    return await postV2NotAuth<PhoneSendCodePayload, PhoneSendCodeResult>(
        "register/phone/send-message",
        {
            phone,
        },
    );
}

export interface RegisterEmailPayload {
    email: string;
    code: number;
    password: string;
}

export async function registerEmail(
    email: string,
    code: number,
    password: string,
): Promise<RegisterResult> {
    return await postV2NotAuth<RegisterEmailPayload, RegisterResult>("register/email", {
        email,
        code,
        password,
    });
}

export interface EmailSendCodePayload {
    email: string;
    language: string;
}

export type EmailSendCodeResult = {};

export async function registerEmailSendCode(
    email: string,
    language: string,
): Promise<EmailSendCodeResult> {
    return await postV2NotAuth<EmailSendCodePayload, EmailSendCodeResult>(
        "register/email/send-message",
        {
            email,
            language,
        },
    );
}

// update password
export interface UpdatePwdPayload {
    password?: string;
    newPassword: string;
}

export type UpdatePwdResult = {};

export async function updatePassword({
    newPassword,
    password,
}: UpdatePwdPayload): Promise<UpdatePwdResult> {
    let payload: UpdatePwdPayload = { newPassword };
    if (password) {
        payload = { ...payload, password };
    }

    return await postV2<UpdatePwdPayload, UpdatePwdResult>("user/password", payload);
}

// reset password
export interface ResetPwdWithPhonePayload {
    phone: string;
    code: number;
    password: string;
}

export type ResetPwdWithPhoneResult = {};

export async function resetPwdWithPhone(
    phone: string,
    code: number,
    password: string,
): Promise<ResetPwdWithPhoneResult> {
    return await postV2NotAuth<ResetPwdWithPhonePayload, ResetPwdWithPhoneResult>("reset/phone", {
        phone,
        code,
        password,
    });
}

export async function resetPhoneSendCode(phone: string): Promise<PhoneSendCodeResult> {
    return await postV2NotAuth<PhoneSendCodePayload, PhoneSendCodeResult>(
        "reset/phone/send-message",
        {
            phone,
        },
    );
}

export interface ResetPwdWithEmailPayload {
    email: string;
    code: number;
    password: string;
}

export type ResetPwdWithEmailResult = {};

export async function resetPwdWithEmail(
    email: string,
    code: number,
    password: string,
): Promise<ResetPwdWithEmailResult> {
    return await postV2NotAuth<ResetPwdWithEmailPayload, ResetPwdWithEmailResult>("reset/email", {
        email,
        code,
        password,
    });
}

export async function resetEmailSendCode(
    email: string,
    language: string,
): Promise<EmailSendCodeResult> {
    return await postV2NotAuth<EmailSendCodePayload, EmailSendCodeResult>(
        "reset/email/send-message",
        {
            email,
            language,
        },
    );
}

export interface RebindingPhonePayload {
    phone: string; // +8612345678901
    code: number; // 123456
}

export async function rebindingPhone(phone: string, code: number): Promise<LoginProcessResult> {
    return await postV2<RebindingPhonePayload, LoginProcessResult>("user/rebind-phone", {
        phone,
        code,
    });
}

export async function rebindingPhoneSendCode(phone: string): Promise<PhoneSendCodeResult> {
    return await postV2<PhoneSendCodePayload, PhoneSendCodeResult>(
        "user/rebind-phone/send-message",
        {
            phone,
        },
    );
}

export type BindingEmailSendCodeResult = {};

export async function bindingEmailSendCode(
    email: string,
    language: string,
): Promise<BindingEmailSendCodeResult> {
    return await post<EmailSendCodePayload, BindingEmailSendCodeResult>(
        "user/bindingEmail/sendMessage",
        {
            email,
            language,
        },
    );
}

export interface BindingEmailPayload {
    email: string;
    code: number;
}

export type BindingEmailResult = {};

export async function bindingEmail(email: string, code: number): Promise<BindingEmailResult> {
    return await post<BindingEmailPayload, BindingEmailResult>("user/bindingEmail", {
        email,
        code,
    });
}

export type BindingPhoneSendCodeResult = {};

export async function bindingPhoneSendCode(phone: string): Promise<BindingPhoneSendCodeResult> {
    return await post<PhoneSendCodePayload, BindingPhoneSendCodeResult>(
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
    email: boolean;

    meta: {
        wechat: string;
        phone: string;
        agora: string;
        apple: string;
        github: string;
        google: string;
        email: string;
    };
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
    Email = "Email",
}

export interface RemoveBindingPayload {
    target: LoginPlatform;
}

export interface RemoveBindingResult {
    token: string;
}

export interface SetCollectionAgreementReq {
    isAgree: boolean;
}
export interface SetCollectionAgreementResult {
    userUUID: string;
}
export interface GetCollectionAgreementResult {
    isAgree: boolean;
}
export async function getCollectionAgreement(): Promise<GetCollectionAgreementResult> {
    return await post<{}, GetCollectionAgreementResult>("user/agreement/get", {});
}
export async function setCollectionAgreement(
    isAgree: boolean,
): Promise<SetCollectionAgreementResult> {
    return await post<SetCollectionAgreementReq, SetCollectionAgreementResult>(
        "user/agreement/set",
        { isAgree },
    );
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

export interface ListSensitivePayload {
    from: number;
    to: number;
}

export enum SensitiveType {
    Phone = "phone",
    Avatar = "avatar",
    Name = "name",
    WeChatName = "wechat_name",

    // Not record, but display
    CloudStorage = "cloud_storage",
    Recording = "recording",
}

export type ListSensitiveResult =
    | {
          type: SensitiveType.Phone;
          /** "123****456" */
          content: string;
      }
    | {
          type: SensitiveType.Avatar;
          /** URL to avatar, may be invalid if deleted */
          content: string;
      };

export async function listSensitive(
    payload: {
        from: Date;
        to: Date;
    },
    init?: Partial<RequestInit>,
    token?: string,
): Promise<ListSensitiveResult[]> {
    return await postV2<ListSensitivePayload, ListSensitiveResult[]>(
        "user/sensitive",
        {
            from: payload.from.valueOf(),
            to: payload.to.valueOf(),
        },
        init,
        token,
    );
}

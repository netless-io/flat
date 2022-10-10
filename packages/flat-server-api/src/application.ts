import { postV2 } from "./utils";

export interface ListApplicationsPayload {
    page: number;
    size: number;
}

export interface ApplicationInfo {
    ownerName: string;
    oauthUUID: string;
    appName: string;
    homepageURL: string;
    logoURL: string;
}

export type ListApplicationsResult = ApplicationInfo[];

export function listApplications(page: number, size: number): Promise<ListApplicationsResult> {
    return postV2<ListApplicationsPayload, ListApplicationsResult>("application/list", {
        page,
        size,
    });
}

export interface ApplicationDetailPayload {
    oauthUUID: string;
}

export interface ApplicationDetail {
    ownerName: string;
    appName: string;
    appDesc: string;
    homepageURL: string;
    logoURL: string;
    scopes: DeveloperOAuthScope[];
}

export enum DeveloperOAuthScope {
    UserUUIDRead = "user.uuid:read",
    UserNameRead = "user.name:read",
    UserAvatarRead = "user.avatar:read",
}

export function applicationDetail(oauthUUID: string): Promise<ApplicationDetail> {
    return postV2<ApplicationDetailPayload, ApplicationDetail>("application/detail", {
        oauthUUID,
    });
}

export interface RevokeApplicationPayload {
    oauthUUID: string;
}

export function revokeApplication(oauthUUID: string): Promise<void> {
    return postV2<RevokeApplicationPayload, void>("application/revoke", {
        oauthUUID,
    });
}

export interface ListOAuthPayload {
    page: number;
    size: number;
}

export interface OAuthInfo {
    oauthUUID: string;
    appName: string;
    logoURL: string;
}

export type ListOAuthResult = OAuthInfo[];

export function listOAuth(page: number, size: number): Promise<ListOAuthResult> {
    return postV2<ListOAuthPayload, ListOAuthResult>("developer/oauth/list", {
        page,
        size,
    });
}

export interface CreateOAuthPayload {
    appName: string;
    appDesc: string;
    // max length: 100
    homepageURL: string;
    // max: 5
    callbacksURL: string[];
    scopes: DeveloperOAuthScope[];
}

export interface CreateOAuthResult {
    oauthUUID: string;
}

export function createOAuth(payload: CreateOAuthPayload): Promise<CreateOAuthResult> {
    return postV2<CreateOAuthPayload, CreateOAuthResult>("developer/oauth/create", payload);
}

export interface DeleteOAuthPayload {
    oauthUUID: string;
}

export function deleteOAuth(oauthUUID: string): Promise<void> {
    return postV2<DeleteOAuthPayload, void>("developer/oauth/delete", {
        oauthUUID,
    });
}

export interface UpdateOAuthPayload {
    oauthUUID: string;
    appName?: string;
    appDesc?: string;
    homepageURL?: string;
    callbacksURL?: string[];
    scopes?: DeveloperOAuthScope[];
}

export function updateOAuth(
    oauthUUID: string,
    payload: Omit<UpdateOAuthPayload, "oauthUUID">,
): Promise<void> {
    return postV2<UpdateOAuthPayload, void>("developer/oauth/update", {
        oauthUUID,
        ...payload,
    });
}

export interface OAuthDetailPayload {
    oauthUUID: string;
}

export interface OAuthDetail {
    appName: string;
    appDesc: string;
    scopes: DeveloperOAuthScope[];
    homepageURL: string;
    callbacksURL: string[];
    logoURL: string;
    clientID: string;
    userCount: number;
    secrets: Array<{
        secretUUID: string;
        clientSecret: string;
        createdAt: number;
    }>;
}

export function getOAuthDetail(oauthUUID: string): Promise<OAuthDetail> {
    return postV2<DeleteOAuthPayload, OAuthDetail>("developer/oauth/setting/detail", {
        oauthUUID,
    });
}

export interface CreateOAuthSecretPayload {
    oauthUUID: string;
}

export interface CreateOAuthSecretResult {
    secretUUID: string;
    clientSecret: string;
}

export function createOAuthSecret(oauthUUID: string): Promise<CreateOAuthSecretResult> {
    return postV2<CreateOAuthSecretPayload, CreateOAuthSecretResult>(
        "developer/oauth/secret/create",
        {
            oauthUUID,
        },
    );
}

export interface DeleteOAuthSecretPayload {
    secretUUID: string;
}

export function deleteOAuthSecret(secretUUID: string): Promise<void> {
    return postV2<DeleteOAuthSecretPayload, void>("developer/oauth/secret/delete", {
        secretUUID,
    });
}

export interface StartUploadOAuthLogoPayload {
    oauthUUID: string;
    // min length: 3, max length: 128
    fileName: string;
    // min size: 1
    fileSize: number;
}

export interface StartUploadOAuthLogoResult {
    fileUUID: string;
    ossDomain: string;
    ossFilePath: string;
    policy: string;
    signature: string;
}

export function startUploadOAuthLogo(
    payload: StartUploadOAuthLogoPayload,
): Promise<StartUploadOAuthLogoResult> {
    return postV2<StartUploadOAuthLogoPayload, StartUploadOAuthLogoResult>(
        "developer/oauth/logo/upload/start",
        payload,
    );
}

export interface FinishUploadOAuthLogoPayload {
    oauthUUID: string;
    fileUUID: string;
}

export function finishUploadOAuthLogo(payload: FinishUploadOAuthLogoPayload): Promise<void> {
    return postV2<FinishUploadOAuthLogoPayload, void>(
        "developer/oauth/logo/upload/finish",
        payload,
    );
}

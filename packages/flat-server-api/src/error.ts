// see: https://github.com/netless-io/flat-server/blob/main/src/ErrorCode.ts
export enum RequestErrorCode {
    FILE_CHECK_FAILED = 1000,
    FILE_DOWNLOAD_FAILED = 1002,
    FILE_UNZIP_FAILED = 1003,
    FILE_UPLOAD_FAILED = 1004,

    ParamsCheckFailed = 100000,
    ServerFail,
    CurrentProcessFailed,
    NotPermission,
    NeedLoginAgain,
    UnsupportedPlatform,
    JWTSignFailed,
    ExhaustiveAttack,
    RequestSignatureIncorrect,
    NonCompliant,
    UnsupportedOperation,

    RoomNotFound = 200000,
    RoomIsEnded,
    RoomIsRunning,
    RoomNotIsRunning,
    RoomNotIsEnded,
    RoomNotIsIdle,
    RoomExists, // (pmi) room already exists, cannot create new room
    RoomNotFoundAndIsPmi, // room not found and the invite code is pmi

    BadRequest = 210000, // bad request
    JWTVerifyFailed, // jwt verify failed
    RoomUserLimit, // join room reach max user limit
    RoomExpired, // room expired
    RoomNotBegin, // join room before begin_time
    RoomCreateLimit, // create room reach max limit
    RoomNotBeginAndAddList, // join room before begin_time, and just added to the room list

    InternalError = 220000, // unknown error
    ForwardFailed, // forward failed

    PeriodicNotFound = 300000,
    PeriodicIsEnded,
    PeriodicSubRoomHasRunning,

    UserNotFound = 400000,
    UserRoomListNotEmpty, // occurs when delete account, user must have quitted all running rooms
    UserAlreadyBinding, // already bound, should unbind first
    UserPasswordIncorrect, // user password (for update) incorrect
    UserOrPasswordIncorrect, // user or password (for login) incorrect
    UserPmiDrained, // user pmi drained

    RecordNotFound = 500000,

    UploadConcurrentLimit = 700000,
    NotEnoughTotalUsage, // not enough total usage
    FileSizeTooBig, // single file size too big
    FileNotFound, // file info not found
    FileExists, // file already exists
    DirectoryNotExists, // current directory not exists
    DirectoryAlreadyExists, // directory already exists

    FileIsConverted = 800000,
    FileConvertFailed, // file convert failed
    FileIsConverting, // file is converting
    FileIsConvertWaiting, // file convert is in waiting status
    FileNotIsConvertNone, // file convertStep not ConvertStep.None
    FileNotIsConverting, // file convertStep not ConvertStep.Converting

    LoginGithubSuspended = 900000, // https://docs.github.com/en/developers/apps/troubleshooting-authorization-request-errors
    LoginGithubURLMismatch,
    LoginGithubAccessDenied,

    SMSVerificationCodeInvalid = 110000, // verification code invalid
    SMSAlreadyExist, // phone already exist
    SMSAlreadyBinding, // phone are binding by other users
    SMSFailedToSendCode, // failed to send verification code

    EmailVerificationCodeInvalid = 115000, // verification code invalid
    EmailAlreadyExist, // email already exist by current user
    EmailAlreadyBinding, // email are binding by other users
    EmailFailedToSendCode, // failed to send verification code

    CensorshipFailed = 120000, // censorship failed

    OAuthUUIDNotFound = 130000, // oauth uuid not found
    OAuthClientIDNotFound, // oauth client id not found
    OAuthSecretUUIDNotFound, // oauth secret uuid not found
}

export const RequestErrorMessage = {
    // HTML5 courseware
    [RequestErrorCode.FILE_CHECK_FAILED]: "error-tips.file-check-failed",
    [RequestErrorCode.FILE_DOWNLOAD_FAILED]: "error-tips.file-download-failed",
    [RequestErrorCode.FILE_UNZIP_FAILED]: "error-tips.file-unzip-failed",
    [RequestErrorCode.FILE_UPLOAD_FAILED]: "error-tips.file-upload-failed",

    // request parameter error
    [RequestErrorCode.ParamsCheckFailed]: "parameter-error",
    // this error may occur in high concurrency situations, the request should be retried
    [RequestErrorCode.ServerFail]: "request-failed",
    // server operation failed, possibly due to database failure or other reasons
    [RequestErrorCode.CurrentProcessFailed]: "request-error",
    [RequestErrorCode.NotPermission]: "no-permission",
    [RequestErrorCode.NeedLoginAgain]: "voucher-expired",
    [RequestErrorCode.UnsupportedPlatform]: "unsupported-login-platforms",
    [RequestErrorCode.JWTSignFailed]: "authentication-information-verification-failed",
    [RequestErrorCode.ExhaustiveAttack]: "exhaustive-attack",
    [RequestErrorCode.RequestSignatureIncorrect]: "request-signature-incorrect",
    [RequestErrorCode.NonCompliant]: "non-compliant",
    [RequestErrorCode.UnsupportedOperation]: "unsupported-operation",

    [RequestErrorCode.RoomNotFound]: "room-does-not-exist",
    [RequestErrorCode.RoomIsEnded]: "the-room-has-ended",
    [RequestErrorCode.RoomIsRunning]: "the-room-is-in-progress",
    [RequestErrorCode.RoomNotIsRunning]: "the-room-is-not-in-progress",
    [RequestErrorCode.RoomNotIsEnded]: "the-room-is-not-over-yet",
    [RequestErrorCode.RoomNotIsIdle]: "the-room-has-not-yet-started",
    [RequestErrorCode.RoomExists]: "the-pmi-room-already-exists",
    [RequestErrorCode.RoomNotFoundAndIsPmi]: "wait-for-teacher-to-enter",

    [RequestErrorCode.BadRequest]: "bad-request",
    [RequestErrorCode.JWTVerifyFailed]: "jwt-verify-failed",
    [RequestErrorCode.RoomUserLimit]: "the-room-is-full",
    [RequestErrorCode.RoomExpired]: "the-room-is-expired",
    [RequestErrorCode.RoomNotBegin]: "the-room-is-not-started-yet",
    [RequestErrorCode.RoomCreateLimit]: "rooms-has-reached-the-limit",
    [RequestErrorCode.RoomNotBeginAndAddList]: "the-room-is-not-started-yet",

    [RequestErrorCode.InternalError]: "unknown-error",
    [RequestErrorCode.ForwardFailed]: "forward-failed",

    [RequestErrorCode.PeriodicNotFound]: "periodic-rooms-do-not-exist",
    [RequestErrorCode.PeriodicIsEnded]: "periodic-rooms-have-ended",
    [RequestErrorCode.PeriodicSubRoomHasRunning]: "periodic-sub-rooms-do-not-exist",

    [RequestErrorCode.UserNotFound]: "user-does-not-exist",
    [RequestErrorCode.UserRoomListNotEmpty]: "user-room-list-is-not-empty",
    [RequestErrorCode.UserAlreadyBinding]: "user-already-binding",
    [RequestErrorCode.UserPasswordIncorrect]: "user-password-incorrect",
    [RequestErrorCode.UserOrPasswordIncorrect]: "user-account-or-password-incorrect",
    [RequestErrorCode.UserPmiDrained]: "user-pmi-drained",

    [RequestErrorCode.RecordNotFound]: "replay-does-not-exist",

    [RequestErrorCode.SMSVerificationCodeInvalid]: "login-phone-verification-code-invalid",
    [RequestErrorCode.SMSAlreadyExist]: "login-phone-already-exist",
    [RequestErrorCode.SMSAlreadyBinding]: "phone-already-binding",
    [RequestErrorCode.SMSFailedToSendCode]: "send-verify-code-failed",

    [RequestErrorCode.EmailVerificationCodeInvalid]: "email-verification-code-invalid",
    [RequestErrorCode.EmailAlreadyExist]: "email-already-exist",
    [RequestErrorCode.EmailAlreadyBinding]: "email-already-binding",
    [RequestErrorCode.EmailFailedToSendCode]: "email-failed-to-send-code",

    [RequestErrorCode.UploadConcurrentLimit]: "upload-concurrent-limit",
    [RequestErrorCode.NotEnoughTotalUsage]: "total-usage-is-full",
    [RequestErrorCode.FileSizeTooBig]: "file-is-too-big",
    [RequestErrorCode.FileNotFound]: "file-not-found",
    [RequestErrorCode.FileExists]: "file-already-exists",
    [RequestErrorCode.DirectoryNotExists]: "directory-not-exists",
    [RequestErrorCode.DirectoryAlreadyExists]: "directory-already-exists",

    [RequestErrorCode.FileIsConverted]: "file-is-converted",
    [RequestErrorCode.FileConvertFailed]: "convert-failed",
    [RequestErrorCode.FileIsConverting]: "file-is-converting",
    [RequestErrorCode.FileIsConvertWaiting]: "convert-is-pending",
    [RequestErrorCode.FileNotIsConvertNone]: "convert-step-not-none",
    [RequestErrorCode.FileNotIsConverting]: "convert-step-not-converting",

    [RequestErrorCode.LoginGithubSuspended]: "login-github-suspended",
    [RequestErrorCode.LoginGithubURLMismatch]: "login-github-url-is-wrong",
    [RequestErrorCode.LoginGithubAccessDenied]: "login-github-access-denied",

    [RequestErrorCode.CensorshipFailed]: "censorship-failed",

    [RequestErrorCode.OAuthUUIDNotFound]: "oauth-uuid-not-found",
    [RequestErrorCode.OAuthClientIDNotFound]: "oauth-client-id-not-found",
    [RequestErrorCode.OAuthSecretUUIDNotFound]: "oauth-secret-uuid-not-found",
};

export class ServerRequestError extends Error {
    public errorCode: RequestErrorCode;
    public errorMessage: string;
    public serverMessage?: string;
    public detail?: unknown;

    public constructor(errorCode: RequestErrorCode, message?: string, detail?: unknown) {
        super(`request failed: ${errorCode} (${RequestErrorCode[errorCode]})`);
        this.name = this.constructor.name;
        this.errorCode = errorCode;
        this.errorMessage = RequestErrorMessage[errorCode];
        this.serverMessage = message;
        this.detail = detail;
    }
}

export function isServerRequestError(error: unknown): error is ServerRequestError {
    return error instanceof Error && Object.prototype.hasOwnProperty.call(error, "errorCode");
}

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

    RoomNotFound = 200000,
    RoomIsEnded,
    RoomIsRunning,
    RoomNotIsRunning,
    RoomNotIsEnded,
    RoomNotIsIdle,

    PeriodicNotFound = 300000,
    PeriodicIsEnded,
    PeriodicSubRoomHasRunning,

    UserNotFound = 400000,

    RecordNotFound = 500000,

    UploadConcurrentLimit = 700000,
    NotEnoughTotalUsage, // not enough total usage
    FileSizeTooBig, // single file size too big
    FileNotFound, // file info not found
    FileExists, // file already exists

    FileIsConverted = 800000,
    FileConvertFailed, // file convert failed
    FileIsConverting, // file is converting
    FileIsConvertWaiting, // file convert is in waiting status

    LoginGithubSuspended = 900000, // https://docs.github.com/en/developers/apps/troubleshooting-authorization-request-errors
    LoginGithubURLMismatch,
    LoginGithubAccessDenied,
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

    [RequestErrorCode.RoomNotFound]: "room-does-not-exist",
    [RequestErrorCode.RoomIsEnded]: "the-room-has-ended",
    [RequestErrorCode.RoomIsRunning]: "the-room-is-in-progress",
    [RequestErrorCode.RoomNotIsRunning]: "the-room-is-not-in-progress",
    [RequestErrorCode.RoomNotIsEnded]: "the-room-is-not-over-yet",
    [RequestErrorCode.RoomNotIsIdle]: "the-room-has-not-yet-started",

    [RequestErrorCode.PeriodicNotFound]: "periodic-rooms-do-not-exist",
    [RequestErrorCode.PeriodicIsEnded]: "periodic-rooms-have-ended",
    [RequestErrorCode.PeriodicSubRoomHasRunning]: "periodic-sub-rooms-do-not-exist",

    [RequestErrorCode.UserNotFound]: "user-does-not-exist",

    [RequestErrorCode.RecordNotFound]: "replay-does-not-exist",

    // TODO: translate messages below
    [RequestErrorCode.UploadConcurrentLimit]: "upload-concurrent-limit",
    [RequestErrorCode.NotEnoughTotalUsage]: "total-usage-is-full",
    [RequestErrorCode.FileSizeTooBig]: "file-is-too-big",
    [RequestErrorCode.FileNotFound]: "file-not-found",
    [RequestErrorCode.FileExists]: "file-already-exists",

    [RequestErrorCode.FileIsConverted]: "file-is-converted",
    [RequestErrorCode.FileConvertFailed]: "convert-failed",
    [RequestErrorCode.FileIsConverting]: "file-is-converting",
    [RequestErrorCode.FileIsConvertWaiting]: "convert-is-pending",

    [RequestErrorCode.LoginGithubSuspended]: "login-github-suspended",
    [RequestErrorCode.LoginGithubURLMismatch]: "login-github-url-is-wrong",
    [RequestErrorCode.LoginGithubAccessDenied]: "login-github-access-denied",
};

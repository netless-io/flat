// see: https://github.com/netless-io/flat-server/blob/main/src/ErrorCode.ts
export enum RequestErrorCode {
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
}

export const RequestErrorMessage = {
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
};

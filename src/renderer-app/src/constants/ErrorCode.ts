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
    [RequestErrorCode.ParamsCheckFailed]: "参数错误",
    // this error may occur in high concurrency situations, the request should be retried
    [RequestErrorCode.ServerFail]: "请求失败",
    // server operation failed, possibly due to database failure or other reasons
    [RequestErrorCode.CurrentProcessFailed]: "请求出错",
    [RequestErrorCode.NotPermission]: "没有权限操作",
    [RequestErrorCode.NeedLoginAgain]: "凭证已过期，请重新登录",
    [RequestErrorCode.UnsupportedPlatform]: "不支持的登录平台",
    [RequestErrorCode.JWTSignFailed]: "认证信息校验失败，请重新登录",

    [RequestErrorCode.RoomNotFound]: "房间不存在",
    [RequestErrorCode.RoomIsEnded]: "房间已结束",
    [RequestErrorCode.RoomIsRunning]: "房间正在进行中",
    [RequestErrorCode.RoomNotIsRunning]: "房间不在进行中",
    [RequestErrorCode.RoomNotIsEnded]: "房间还未结束",
    [RequestErrorCode.RoomNotIsIdle]: "房间还未开始",

    [RequestErrorCode.PeriodicNotFound]: "周期性房间不存在",
    [RequestErrorCode.PeriodicIsEnded]: "周期性房间已结束",
    [RequestErrorCode.PeriodicSubRoomHasRunning]: "周期性子房间不存在",

    [RequestErrorCode.UserNotFound]: "用户不存在",

    [RequestErrorCode.RecordNotFound]: "回放不存在",
};

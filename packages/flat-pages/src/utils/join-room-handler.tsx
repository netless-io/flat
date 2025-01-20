import { RouteNameType } from "./routes";
import { roomStore, globalStore } from "@netless/flat-stores";
import { FLAT_REGION, RequestErrorCode, RoomType } from "@netless/flat-server-api";
import { errorTips, message, Modal } from "flat-components";
import { FlatI18n } from "@netless/flat-i18n";
import React from "react";
import {
    PRIVACY_URL_CN_CN,
    PRIVACY_URL_CN_EN,
    PRIVACY_URL_EN_CN,
    PRIVACY_URL_EN_EN,
    SERVICE_URL_CN_CN,
    SERVICE_URL_CN_EN,
    SERVICE_URL_EN_CN,
    SERVICE_URL_EN_EN,
} from "../constants/process";
const { confirm } = Modal;

export enum Region {
    CN_HZ = "CN",
    SG = "SG",
}

export const joinRoomHandler = async (
    roomUUID: string,
    // The 'pushHistory()' signature is different in electron and in web.
    // Use 'any' here since we only use the same part between them.
    pushHistory: (routeName: any, data?: any) => void,
): Promise<void> => {
    const formatRoomUUID = roomUUID.replace(/\s+/g, "");
    const serverRegion = globalStore.serverRegionConfig?.server.region;
    const promise = await new Promise<boolean>(resolve => {
        if (serverRegion && checkCrossRegionAuth(formatRoomUUID, serverRegion)) {
            const language = FlatI18n.getInstance().language;
            // const privacyURL = language.startsWith("zh") ? PRIVACY_URL_CN : PRIVACY_URL;
            // const serviceURL = language.startsWith("zh") ? SERVICE_URL_CN : SERVICE_URL;
            const privacyURL =
                FLAT_REGION === "CN"
                    ? language.startsWith("zh")
                        ? PRIVACY_URL_CN_CN
                        : PRIVACY_URL_CN_EN
                    : language.startsWith("zh")
                      ? PRIVACY_URL_EN_CN
                      : PRIVACY_URL_EN_EN;
            const serviceURL =
                FLAT_REGION === "CN"
                    ? language.startsWith("zh")
                        ? SERVICE_URL_CN_CN
                        : SERVICE_URL_CN_EN
                    : language.startsWith("zh")
                      ? SERVICE_URL_EN_CN
                      : SERVICE_URL_EN_EN;

            const context = FlatI18n.t("cross-region-auth.desc", {
                serviceAgreement: `<a rel='noreferrer' target='_blank' href='${serviceURL}'>《${FlatI18n.t("cross-region-auth.serviceAgreement")}》</a>`,
                privacyPolicy: `<a rel='noreferrer' target='_blank' href='${privacyURL}'>《${FlatI18n.t("cross-region-auth.privacyPolicy")}》</a>`,
            });
            confirm({
                title: (
                    <div
                        style={{
                            borderBottom: "1px solid #EEEEEE",
                            textAlign: "center",
                            lineHeight: "30px",
                        }}
                    >
                        {FlatI18n.t("cross-region-auth.title")}
                    </div>
                ),
                closable: true,
                icon: null,
                content: (
                    <div
                        dangerouslySetInnerHTML={{
                            __html: context,
                        }}
                    ></div>
                ),
                okText: FlatI18n.t("cross-region-auth.agree"),
                cancelText: FlatI18n.t("cross-region-auth.disagree"),
                onOk() {
                    resolve(true);
                },
                onCancel() {
                    resolve(false);
                },
            });
        } else {
            resolve(true);
        }
    });
    if (!promise) {
        return;
    }
    try {
        const roomInfo = roomStore.rooms.get(formatRoomUUID);
        const periodicUUID = roomInfo?.periodicUUID;
        if (formatRoomUUID.length < 32) {
            roomStore.rememberNextRoom(formatRoomUUID);
        }

        const data = await roomStore.joinRoom(periodicUUID || formatRoomUUID);
        globalStore.updateShowGuide(data.showGuide);
        globalStore.updatePeriodicUUID(roomInfo?.periodicUUID);

        switch (data.roomType) {
            case RoomType.BigClass: {
                pushHistory(RouteNameType.BigClassPage, data);
                break;
            }
            case RoomType.SmallClass: {
                pushHistory(RouteNameType.SmallClassPage, data);
                break;
            }
            case RoomType.OneToOne: {
                if (data.isAI) {
                    pushHistory(RouteNameType.AIPage, data);
                } else {
                    pushHistory(RouteNameType.OneToOnePage, data);
                }
                break;
            }
            default: {
                new Error("failed to join room: incorrect room type");
            }
        }

        if (data.billing && data.billing.vipLevel === 0) {
            void message.info(
                FlatI18n.t("time-limit-tip", {
                    roomType: FlatI18n.t("vip-level." + data.billing.vipLevel),
                    minutes: data.billing.limit,
                }),
            );
        }
    } catch (e) {
        globalStore.updateRequestRefreshRooms(true);

        // if room not found and is pmi room, show wait for teacher to enter
        if (e.errorCode === RequestErrorCode.RoomNotFoundAndIsPmi) {
            void message.info(FlatI18n.t("wait-for-teacher-to-enter"));
            return;
        }

        // if room not started, show different tips
        if (e.errorCode === RequestErrorCode.RoomNotBeginAndAddList && e.detail) {
            const roomNotBegin = e.detail as {
                title: string;
                uuid: string;
                beginTime: number;
                ownerUUID: string;
                ownerName?: string;
            };
            pushHistory(RouteNameType.HomePage);
            globalStore.updateRoomNotBegin(roomNotBegin);
            return;
        }

        // show room not started with custom {joinEarly} minutes
        if (e.errorCode === RequestErrorCode.RoomNotBegin) {
            const minutes = globalStore.serverRegionConfig?.server.joinEarly || 5;
            void message.info(FlatI18n.t("the-room-is-not-started-yet", { minutes }));
            pushHistory(RouteNameType.HomePage);
            return;
        }

        pushHistory(RouteNameType.HomePage);
        errorTips(e);
    }
};
export const checkCrossRegionAuth = (uuid: string, region: string): boolean => {
    let RoomRegion: Region = Region.CN_HZ;
    if (typeof uuid === "string") {
        if ((uuid.length === 11 && uuid[0] === "1") || uuid.startsWith("CN-")) {
            RoomRegion = Region.CN_HZ;
        }
        if ((uuid.length === 11 && uuid[0] === "2") || uuid.startsWith("SG-")) {
            RoomRegion = Region.SG;
        }
    }
    if (region !== RoomRegion) {
        return true;
    }
    return false;
};

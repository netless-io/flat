import { AIChatMsgUser, ChatMsg } from "flat-components";
import { makeAutoObservable, observable } from "mobx";
import { SideEffectManager } from "side-effect-manager";
import { AI_Chat_Bot_ID, TIMEOUT_MS } from "./constants";
import { FlatI18n } from "@netless/flat-i18n";
import {
    agoraAIPing,
    AgoraAIResult,
    agoraAIStart,
    agoraAIStop,
} from "@netless/flat-server-api/src/agora";
import { AIInfo } from "../global-store";
import type { IRemoteAudioTrack } from "agora-rtc-sdk-ng";

export interface ChatStoreConfig {
    aiInfo: AIInfo;
    rtcUID: number;
    roomUUID: string;
    ownerUUID: string;
}

export interface TextDataChunk {
    message_id: string;
    part_index: number;
    total_parts: number;
    content: string;
}
export interface ITextItem {
    dataType: "transcribe" | "translate";
    uid: string;
    time: number;
    text: string;
    isFinal: boolean;
}

export class AIChatStore {
    private readonly sideEffect = new SideEffectManager();

    public readonly messages = observable.array<AIChatMsgUser>([]);

    private messageCache: { [key: string]: TextDataChunk[] } = {};

    private readonly config: ChatStoreConfig;

    private timer: number | null = null;

    public constructor(config: ChatStoreConfig) {
        this.config = config;
        makeAutoObservable<this, "sideEffect">(this, {
            sideEffect: false,
        });
    }

    public pingTasker(): void {
        this.timer = setTimeout(async () => {
            await this.ping();
            this.pingTasker();
        }, TIMEOUT_MS * 2) as unknown as number;
    }

    public stopPingTasker(): void {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    }

    public async start(): Promise<boolean> {
        const { language, scene, role } = this.config.aiInfo;
        const payload = {
            request_id: this.config.ownerUUID,
            channel_name: this.config.roomUUID,
            user_uid: this.config.rtcUID,
            is_new: true,
            language,
            scene,
            role,
            bot_id: AI_Chat_Bot_ID,
        };
        const r = await this.ping();
        let bol = true;
        if (r.code === "10002") {
            const res = await agoraAIStart(payload);
            if (res.code !== "0") {
                if (res.code === "10001") {
                    throw new Error(FlatI18n.t(`home-page-AI-teacher-class.message.${res.code}`));
                } else {
                    throw new Error(`AI service start failed: ${res.msg}`);
                }
            }
            bol = false;
        } else if (r.code !== "0") {
            if (r.code === "10001") {
                throw new Error(FlatI18n.t(`home-page-AI-teacher-class.message.${r.code}`));
            } else {
                throw new Error(`AI service is ${r.msg}`);
            }
        }
        this.pingTasker();
        return bol;
    }

    public async stop(): Promise<void> {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        await agoraAIStop({
            request_id: this.config.ownerUUID,
            channel_name: this.config.roomUUID,
            language: this.config.aiInfo.language,
            is_new: true,
        });
    }

    private async ping(): Promise<AgoraAIResult> {
        return await agoraAIPing({
            request_id: this.config.ownerUUID,
            channel_name: this.config.roomUUID,
            language: this.config.aiInfo.language,
            is_new: true,
        });
    }

    public destroy(): void {
        this.sideEffect.flushAll();
    }

    /** Add the new message to message list */
    private newMessage = (message: AIChatMsgUser): void => {
        const timestamp = Date.now();
        let insertPoint = 0;
        while (
            insertPoint < this.messages.length &&
            this.messages[insertPoint].timestamp <= timestamp
        ) {
            insertPoint++;
        }
        this.messages.splice(insertPoint, 0, message);
        this.onNewMessage(message);
    };

    private sendMessage = (message: AIChatMsgUser): void => {
        const { senderID, timestamp, isFinal = true } = message;
        if (this.messages.length === 0) {
            this.newMessage(message);
            return;
        }
        for (let i = this.messages.length - 1; i >= 0; i--) {
            const curMessage = this.messages[i];
            if (curMessage.senderID === senderID && curMessage.timestamp < timestamp) {
                if (!curMessage.isFinal) {
                    this.messages[i] = message;
                    this.messages[i].isFinal = isFinal;
                    return;
                }
                this.newMessage(message);
                return;
            }
        }
        this.newMessage(message);
    };

    /** For upstream to sync messages */
    public onNewMessage(_message: ChatMsg): void {
        // do nothing
    }
    public async handleStreamMsgChunk(
        uid: number,
        stream: Uint8Array | number,
        ...arg: any
    ): Promise<void> {
        try {
            let decodedMessage = "";
            if (stream instanceof Uint8Array) {
                const decoder = new TextDecoder("utf-8");
                decodedMessage = decoder.decode(stream);
            } else {
                decodedMessage = arg[0];
            }
            const [message_id, partIndexStr, totalPartsStr, content] = decodedMessage.split("|");
            const part_index = parseInt(partIndexStr, 10);
            const total_parts = totalPartsStr === "???" ? -1 : parseInt(totalPartsStr, 10); // -1 means total parts unknown

            // Ensure total_parts is known before processing further
            if (total_parts === -1) {
                console.warn(
                    `Total parts for message ${message_id} unknown, waiting for further parts.`,
                );
                return;
            }

            const chunkData: TextDataChunk = {
                message_id,
                part_index,
                total_parts,
                content,
            };

            // Check if we already have an entry for this message
            if (!this.messageCache[message_id]) {
                this.messageCache[message_id] = [];
                // Set a timeout to discard incomplete messages
                setTimeout(() => {
                    if (this.messageCache[message_id]?.length !== total_parts) {
                        console.warn(`Incomplete message with ID ${message_id} discarded`);
                        delete this.messageCache[message_id]; // Discard incomplete message
                    }
                }, TIMEOUT_MS);
            }
            // Cache this chunk by message_id
            this.messageCache[message_id].push(chunkData);
            // If all parts are received, reconstruct the message
            if (this.messageCache[message_id].length === total_parts) {
                const completeMessage = this.reconstructMessage(this.messageCache[message_id]);
                const { stream_id, is_final, text, text_ts } = JSON.parse(atob(completeMessage));
                const textItem: ITextItem = {
                    uid: `${stream_id}`,
                    time: text_ts,
                    dataType: "transcribe",
                    text: text,
                    isFinal: is_final,
                };
                if (text.trim().length > 0) {
                    let senderID = this.config.rtcUID.toString();
                    if (senderID !== textItem.uid) {
                        senderID = uid.toString();
                    }
                    this.sendMessage({
                        type: "room-message",
                        roomUUID: this.config.roomUUID,
                        senderID,
                        uuid: message_id,
                        timestamp: textItem.time,
                        text: textItem.text,
                        isFinal: is_final,
                    });
                }

                // Clean up the cache
                delete this.messageCache[message_id];
            }
        } catch (error) {
            console.error("Error processing chunk:", error);
        }
    }
    // Function to reconstruct the full message from chunks
    private reconstructMessage(chunks: TextDataChunk[]): string {
        // Sort chunks by their part index
        chunks.sort((a, b) => a.part_index - b.part_index);

        // Concatenate all chunks to form the full message
        return chunks.map(chunk => chunk.content).join("");
    }
    public async aiAudioTrackHandler(audioTrack: IRemoteAudioTrack): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 1000));
        audioTrack.play();
    }
}

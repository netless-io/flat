import { Remitter } from "remitter";

export type ToasterMessage = string | { message: string; args: Record<string, string | undefined> };

export interface ToasterEventData {
    info: ToasterMessage;
    error: ToasterMessage;
    warn: ToasterMessage;
}

export interface Toaster extends Remitter<ToasterEventData> {}

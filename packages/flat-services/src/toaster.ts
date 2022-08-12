import { Remitter } from "remitter";

export interface ToasterEventData {
    info: string;
    error: string;
    warn: string;
}

export interface Toaster extends Remitter<ToasterEventData> {}

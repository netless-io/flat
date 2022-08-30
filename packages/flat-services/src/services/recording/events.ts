import type { Remitter } from "remitter";

export interface IServiceRecordingEventData {}

export type IServiceRecordingEventName = Extract<keyof IServiceRecordingEventData, string>;

export type IServiceRecordingEvents = Remitter<IServiceRecordingEventData>;

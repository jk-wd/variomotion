import type { ITimelineState } from "@variomotion/core";
import { writable } from "svelte/store";

export type TimelineStatesStore = Record<
  string,
  Record<string, ITimelineState>
>;
export const timelineStates = writable<TimelineStatesStore>({});

import { writable } from "svelte/store";

import type { Mode } from "@variomotion/transform";
import { NoBreakpointIdentifier } from "@variomotion/core";
import { getQueryParam } from "../lib/helpers";

export const pixelTimelineMode = writable<boolean>(
  getQueryParam("pixelmode") === "true"
);
export const transformMode = writable<Mode>("off");

export const selectedTimelineId = writable<string>(
  getQueryParam("timelineid") ?? ""
);

export const filterAnimationDefinitionId = writable<string | undefined>(
  undefined
);
export const activePopup = writable<
  | "add-timeline"
  | "edit-timeline"
  | "add-animation-entry"
  | "add-sequence-entry"
  | "add-frame"
  | "manage-breakpoints"
  | "edit-animation-entry"
  | "edit-sequence-entry"
  | "sponsor"
  | null
>("sponsor");
export const selectedFrame = writable<{
  timelineId: string;
  entryId: string;
  index: number;
} | null>(null);

export const viewportWidth = writable<number | null>(null);
export const activeBreakpoint = writable<string>(NoBreakpointIdentifier);
export const timelineValuePerPixel = writable<number>(20);

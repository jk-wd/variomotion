import { writable } from "svelte/store";
import type { IActiveBreakpoint } from "@variomotion/core";

import type { Mode } from "@variomotion/transform";
import { NoBreakpointIdentifier } from "@variomotion/core";

export const pixelTimelineMode = writable<boolean>(false);
export const transformMode = writable<Mode>("off");

export const selectedTimelineId = writable<string>("");

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
export const activeBreakpoint = writable<IActiveBreakpoint | null>(null);
export const selectedBreakpoint = writable<string>(NoBreakpointIdentifier);
export const timelineValuePerPixel = writable<number>(50);

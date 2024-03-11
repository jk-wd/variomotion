import type { PointBoolean } from "@variomotion/transform";
import { writable } from "svelte/store";
export interface ViewportState {
  viewportWidth?: number;
}

export const translateBoolean = writable<PointBoolean>({
  x: true,
  y: true,
});

export const scaleProportianally = writable<boolean>(true);

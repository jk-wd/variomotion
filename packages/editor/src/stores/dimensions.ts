import type { DomtargetDimensions } from "@variomotion/editor-connect";
import { writable } from "svelte/store";

export const dimensions = writable<DomtargetDimensions | undefined>(undefined);

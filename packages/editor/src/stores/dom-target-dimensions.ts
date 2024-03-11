import { writable } from "svelte/store";
import type { DomtargetDimensions } from "@variomotion/editor-connect";

export const domTargetDimensions = writable<
  Record<string, DomtargetDimensions>
>({});

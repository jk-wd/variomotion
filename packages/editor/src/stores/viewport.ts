import { writable } from "svelte/store";
export interface ViewportState {
  viewportWidth?: number;
}

export const viewportState = writable<ViewportState>({
  viewportWidth: undefined,
});

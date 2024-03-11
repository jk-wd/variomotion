import { writable } from "svelte/store";

export const domTargets = writable<Record<string, string[]>>({});

import type { IValueStore } from "@variomotion/core";
import { writable } from "svelte/store";

export const valueStore = writable<IValueStore>({});

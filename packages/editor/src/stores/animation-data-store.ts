import { writable } from "svelte/store";
import type { IAnimationData } from "@variomotion/core";

export const animationData = writable<IAnimationData>();

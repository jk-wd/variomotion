import { writable } from "svelte/store";
import type { Units, easingFunctions } from "@variomotion/core";

export const fieldValues = writable<FieldValues | undefined>(undefined);

export type FieldValues = Record<
  string,
  Record<
    string,
    {
      value?: string | number;
      valueStoreKey?: string | number;
      unit: Units;
      easing?: keyof typeof easingFunctions;
    }
  >
>;

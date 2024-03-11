import type {
  IBreakpoint,
  IFrameDef,
  IAnimationData,
  Units,
} from "@variomotion/core";
import { FixedValuePropTypes } from "@variomotion/core";
import { NumberValuePropTypes } from "@variomotion/core";
import { unitMap, easingFunctions } from "@variomotion/core";
import type { FieldValues } from "../../stores/field-values";

export function fieldValuesToValueDef(fieldValues: FieldValues) {
  const definition = Object.keys(fieldValues).reduce((acc, key) => {
    if (!key || !fieldValues) return acc;

    acc[key] = Object.keys(fieldValues[key]).reduce((acc, breakpointKey) => {
      if (
        !fieldValues![key][breakpointKey].value &&
        fieldValues![key][breakpointKey].value !== 0
      ) {
        return acc;
      }

      if (Object.keys(FixedValuePropTypes).includes(key)) {
        acc[breakpointKey] = {
          value: fieldValues![key][breakpointKey].value,
        };
        return acc;
      }
      if (!fieldValues![key]![breakpointKey]!.unit) {
        return acc;
      }
      acc[breakpointKey] = {
        value: fieldValues![key][breakpointKey].value,
        unit: fieldValues![key][breakpointKey].unit,
        easing: fieldValues![key][breakpointKey].easing,
      };
      return acc;
    }, {} as any);
    return acc;
  }, {} as any);

  return Object.keys(definition).reduce((acc, key) => {
    if (!key || Object.keys(definition[key]).length <= 0) {
      return acc;
    }
    acc[key] = definition[key];
    return acc;
  }, {} as any);
}

export function constructFieldValues(
  frame: IFrameDef,
  animationData: IAnimationData
) {
  if (!frame) {
    return {};
  }

  const result: FieldValues = {};

  const breakpointIds: string[] = [
    ...(animationData.breakpoints || []).map(
      (breakpoint: IBreakpoint) => breakpoint.id
    ),
    "none",
  ];

  const keys = [
    ...(Object.keys(NumberValuePropTypes) ?? []),
    ...(Object.keys(FixedValuePropTypes) ?? []),
  ];
  keys.forEach((index) => {
    result[index] = result[index] ?? {};
    breakpointIds.forEach((breakpoint: string) => {
      let value = frame?.valueDef?.[index]?.[breakpoint]?.value;
      let unit = frame?.valueDef?.[index]?.[breakpoint]?.unit;
      let easing = frame?.valueDef?.[index]?.[breakpoint]?.easing;

      if (!value && value === 0) {
        value = 0;
      }
      const defaultUnit =
        unitMap[index] && unitMap[index][0] ? unitMap[index][0] : undefined;
      result[index][breakpoint] = {
        value,
        unit: unit ?? defaultUnit,
        easing,
      };
    });
  });

  return result;
}

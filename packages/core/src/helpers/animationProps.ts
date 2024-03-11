import {
  IAnimationProps,
  IAnimationData,
  IFrameDef,
  ITimeline,
  IAnimationEntry,
} from "../types-interfaces";
import { tranformDefaultsUnits, transformDefaults } from "../value-parsers";
import {
  isFrameDefined,
  isFrameValid,
  processFrameDef,
  sortFrames,
} from "./frame";

function applyDefaults(
  animationData: IAnimationData,
  valueDef: IFrameDef["valueDef"]
): IFrameDef["valueDef"] {
  const result: IFrameDef["valueDef"] = { ...valueDef };
  const breakpointIds: string[] = ["none"];
  for (const key in transformDefaults) {
    result[key] = result[key] ?? {};
    breakpointIds.forEach((breakpoint) => {
      result[key][breakpoint] = valueDef?.[key]?.[breakpoint] ?? {
        value: transformDefaults[key],
        unit: tranformDefaultsUnits[key],
      };
    });
  }

  return result;
}

export const processFrameDefinitions = (
  animationData: IAnimationData,
  frameDefs: IFrameDef[],
  timeline: ITimeline,
  entry: IAnimationEntry
): IAnimationProps => {
  const result: IAnimationProps = {};
  (frameDefs ?? []).forEach((frameDef) => {
    const valueDef = applyDefaults(animationData, frameDef.valueDef);

    Object.keys(valueDef).forEach((valueKey: string) => {
      if (!valueDef || !valueDef[valueKey]) {
        return;
      }
      if (!result[valueKey]) {
        result[valueKey] = [];
      }
      const useBreakpoints = !(
        (timeline.activeOnBreakpoints?.length ?? 0) +
          (entry.activeOnBreakpoints?.length ?? 0) >
        0
      );

      result[valueKey].push(
        processFrameDef(
          animationData,
          frameDef,
          valueDef[valueKey],
          useBreakpoints
        )
      );
    });
  });

  return result;
};
export const mergeAnimations = (
  animation: IAnimationProps,
  animationToMerge: IAnimationProps = {},
  pixelBased: boolean = false
) => {
  const result: IAnimationProps =
    Object.keys(animation).length > 0
      ? mergeAnimations({}, animation, pixelBased)
      : {};

  for (const propKey in animationToMerge) {
    if (!result[propKey]) {
      result[propKey] = [];
    }
    const propToMerge = animationToMerge[propKey]
      ? animationToMerge[propKey]
      : [];
    for (const frame of propToMerge) {
      if (isFrameValid(frame) && !isFrameDefined(result[propKey], frame)) {
        result[propKey].push(frame);
      }
    }

    result[propKey] = result[propKey].sort(sortFrames);
  }

  return result;
};

export const getEndFromAnimationProps = (animationProps: IAnimationProps) => {
  let result = 0;
  for (const propKey of Object.keys(animationProps)) {
    const prop = animationProps[propKey];

    if (prop && prop.constructor === Array) {
      for (const frame of prop) {
        if (frame.framePositionValue) {
          result = Math.max(frame.framePositionValue, result);
        }
      }
    }
  }
  return result;
};

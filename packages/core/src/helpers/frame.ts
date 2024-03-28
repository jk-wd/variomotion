import {
  IAnimationData,
  IFrame,
  IFrameDef,
  IAnimation,
  ITimelineStateBase,
  NoBreakpointIdentifier,
  IFrameValue,
  IValueStore,
  IBreakpoint,
} from "../types-interfaces";
import { getActiveBreakPoints } from "../data/breakpoints";
import { getValueStore } from "../core";
import { getValueStoreValue } from "../utils";

export const isFrameDefined = (frames: IFrame[], frame: IFrame) => {
  return frames.some((frameToCompare) => {
    return (
      frameToCompare.framePositionValue !== undefined &&
      frameToCompare.framePositionValue === frame.framePositionValue
    );
  });
};

export const isFrameValid = (frame: IFrame) => {
  return frame.framePositionValue || frame.framePositionValue === 0;
};

export const getClosestFramesForTimeline = (
  animation: IAnimation,
  timeline: ITimelineStateBase,
  key: string
): {
  closestsFrames: IFrame[];
  goal: number;
} => {
  const frames: IFrame[] = animation.animationProps[key];

  const goal = timeline.progress || 0;

  const closestsFrames = getClosestFrames(frames, goal);
  return {
    closestsFrames,
    goal,
  };
};

export const getClosestFrames = (frames: IFrame[], goal: number) => {
  const result = [];

  for (const frame of frames) {
    const value = frame.framePositionValue;
    if (value <= goal) {
      result[0] = frame;
    }
  }
  for (let i = frames.length - 1; i >= 0; i--) {
    const value = frames[i].framePositionValue;
    if (value > goal) {
      result[1] = frames[i];
    }
  }
  if (!result[0]) {
    result[0] = frames[0];
  }
  if (!result[1]) {
    result[1] = result[0];
  }
  return result;
};

export const sortFrames = (
  frameA: IFrame | IFrameDef,
  frameB: IFrame | IFrameDef
) => {
  if (
    (frameA.framePositionValue || frameA.framePositionValue === 0) &&
    (frameB.framePositionValue || frameB.framePositionValue === 0) &&
    frameA.framePositionValue < frameB.framePositionValue
  ) {
    return -1;
  }
  return 1;
};

export const getFramePosition = (
  frameDef: IFrameDef,
  valueStore: IValueStore
) => {
  return getValueStoreValue(
    valueStore,
    frameDef.framePositionValueStoreKey,
    frameDef.framePositionValue
  );
};

export const getFrameValue = (
  valueDef: IFrameValue,
  breakpoint: string,
  valueStore: IValueStore
) => {
  return getValueStoreValue(
    valueStore,
    valueDef[breakpoint].valueStoreKey,
    valueDef[breakpoint].value as number
  );
};

export const processFrameDef = (
  animationData: IAnimationData,
  frameDef: IFrameDef,
  valueDef: IFrameValue,
  useBreakpoints: boolean = true
): IFrame => {
  const breakpoints = !useBreakpoints
    ? [
        {
          id: NoBreakpointIdentifier,
        },
      ]
    : getActiveBreakPoints(animationData);

  const framePositionValue = getFramePosition(frameDef, getValueStore());

  const frame: Partial<IFrame> = {
    frameUnit: frameDef.frameUnit,
    framePositionValue,
  };

  if (valueDef) {
    if (valueDef[NoBreakpointIdentifier]) {
      frame.value = getFrameValue(
        valueDef,
        NoBreakpointIdentifier,
        getValueStore()
      );
      frame.unit = valueDef[NoBreakpointIdentifier].unit;
      frame.easing = valueDef[NoBreakpointIdentifier].easing;
    }

    let breapointMatched = false;
    for (const key of Object.keys(valueDef)) {
      if (breapointMatched) {
        break;
      }
      for (const breakpoint of breakpoints) {
        if (breapointMatched) {
          break;
        }
        if (key === breakpoint.id && valueDef[key]) {
          if (key !== "none") console.log(breakpoints, valueDef, key);
          frame.value = getFrameValue(valueDef, key, getValueStore());
          frame.unit = valueDef[key].unit;
          frame.easing = valueDef[key].easing;
          breapointMatched = true;
        }
      }
    }
  }
  return frame as IFrame;
};

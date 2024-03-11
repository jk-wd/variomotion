import {
  IAnimationData,
  IAnimationEntry,
  IFrameDef,
  IFrameValue,
  ITimeline,
  MatrixTransformTypes,
  Units,
} from "../types-interfaces";
import { AnimationEntryNotFound, FrameNotFound } from "../errors";
import { editEntry, getAnimationEntryById } from "./entry";
import { sortFrames } from "../helpers/frame";
import { getTimelineById } from "./timeline";
import { numberIsSet } from "../utils";

export const editFrame = (
  animationData: IAnimationData,
  animationEntryId: string,
  frame: Partial<IFrameDef>,
  frameIndex: number
) => {
  const animationEntry: IAnimationEntry | undefined = getAnimationEntryById(
    animationData,
    animationEntryId
  );
  if (!animationEntry) {
    throw AnimationEntryNotFound;
  }
  return editEntry(animationData, {
    ...animationEntry,
    frames: (animationEntry.frames || []).map(
      (frameTarget: IFrameDef, index: number) => {
        if (index === frameIndex) {
          return {
            ...frameTarget,
            ...frame,
          };
        }
        return frameTarget;
      }
    ),
  });
};
interface Transformations {
  translateX?: number;
  translateY?: number;
  scaleX?: number;
  scaleY?: number;
  rotate?: number;
}

function updateFrameValue(
  frameValue: IFrameValue,
  property: MatrixTransformTypes,
  value: number,
  breakpoint?: string
): IFrameValue {
  const resultFrameValue: IFrameValue = {
    ...frameValue,
  };
  if (!resultFrameValue[breakpoint ?? "none"]) {
    resultFrameValue[breakpoint ?? "none"] = {
      value: 0,
      unit:
        property === MatrixTransformTypes.scaleX ||
        property === MatrixTransformTypes.scaleY
          ? Units.percent
          : property === MatrixTransformTypes.rotate
            ? Units.rad
            : Units.px,
    };
  }
  resultFrameValue[breakpoint ?? "none"].value = value;
  return resultFrameValue;
}

export function getTransformValueFromDef(
  definition: IFrameDef,
  property: MatrixTransformTypes,
  breakpoint?: string,
  defaultValue?: number
): number {
  const value = definition.valueDef[property]?.none?.value;
  const bpValue = definition.valueDef[property]?.[breakpoint ?? "none"]?.value;
  if (numberIsSet(bpValue as number)) {
    return bpValue as number;
  } else if (numberIsSet(value as number)) {
    return value as number;
  }
  return defaultValue ?? 0;
}

export function applyTransformations(
  transformations: Transformations,
  valueDef: IFrameDef["valueDef"],
  breakpoint?: string
) {
  const result: IFrameDef["valueDef"] = { ...valueDef };
  if (transformations.translateX) {
    result[MatrixTransformTypes.translateX] = updateFrameValue(
      result.translateX ?? {},
      MatrixTransformTypes.translateX,
      transformations.translateX,
      breakpoint
    );
  }
  if (transformations.translateY) {
    result[MatrixTransformTypes.translateY] = updateFrameValue(
      result.translateY ?? {},
      MatrixTransformTypes.translateY,
      transformations.translateY,
      breakpoint
    );
  }
  if (transformations.scaleX) {
    result[MatrixTransformTypes.scaleX] = updateFrameValue(
      result.scaleX ?? {},
      MatrixTransformTypes.scaleX,
      transformations.scaleX,
      breakpoint
    );
  }
  if (transformations.scaleY) {
    result[MatrixTransformTypes.scaleY] = updateFrameValue(
      result.scaleY ?? {},
      MatrixTransformTypes.scaleY,
      transformations.scaleY,
      breakpoint
    );
  }
  if (transformations.rotate) {
    result[MatrixTransformTypes.rotate] = updateFrameValue(
      result.rotate ?? {},
      MatrixTransformTypes.rotate,
      transformations.rotate,
      breakpoint
    );
  }
  return result;
}

export const addFrame = (
  animationData: IAnimationData,
  animationEntryId: string,
  frame: IFrameDef
) => {
  const frameWithDefaults = {
    ...frame,
    valueDef: {
      ...(frame.valueDef ?? {}),
    },
  };
  const animationEntry: IAnimationEntry | undefined = getAnimationEntryById(
    animationData,
    animationEntryId
  );
  if (!animationEntry) {
    throw AnimationEntryNotFound;
  }

  return editEntry(animationData, {
    ...animationEntry,
    frames: [...(animationEntry.frames ?? []), frameWithDefaults].sort(
      sortFrames
    ),
  });
};

export const getFrameById = (
  animationData: IAnimationData,
  animationEntryId: string,
  frameIndex: number
) => {
  const animationEntry: IAnimationEntry | undefined = getAnimationEntryById(
    animationData,
    animationEntryId
  );

  if (!animationEntry) {
    throw AnimationEntryNotFound;
  }
  const frame = animationEntry.frames?.[frameIndex];

  if (!frame) {
    throw FrameNotFound;
  }
  return frame;
};

export const deleteFrame = (
  animationData: IAnimationData,
  animationEntryId: string,
  frameIndex: number
) => {
  const animationEntry: IAnimationEntry | undefined = getAnimationEntryById(
    animationData,
    animationEntryId
  );
  if (!animationEntry) {
    throw AnimationEntryNotFound;
  }
  return editEntry(animationData, {
    ...animationEntry,
    frames: (animationEntry.frames || []).filter(
      (frame, index) => frameIndex !== index
    ),
  });
};

export const getTimelineFrames = (
  animationData: IAnimationData,
  timelineId: string
) => {
  const timeline: ITimeline | undefined = getTimelineById(
    animationData,
    timelineId
  );
  if (!timeline) {
    return [];
  }
  const frames = timeline.animationEntries.map((entryId) => {
    const entry = getAnimationEntryById(animationData, entryId);
    if (!entry) {
      return [];
    }

    return entry.frames;
  });

  return (frames ?? []).flat(Infinity);
};

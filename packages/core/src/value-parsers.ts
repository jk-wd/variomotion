import {
  IAnimation,
  IParsedValue,
  ITimelineStateBase,
  NumberValuePropTypes,
  Units,
} from "./types-interfaces";
import { getClosestFramesForTimeline } from "./helpers/frame";
import { easingFunctions } from "./easing-functions";

interface parserParams {
  animation: IAnimation;
  timeline: ITimelineStateBase;
  key: NumberValuePropTypes;
  defaultValue?: number;
}

export const tranformDefaultsUnits: Record<string, Units | undefined> = {
  translateX: Units.px,
  translateY: Units.px,
  rotate: Units.rad,
  opacity: undefined,
};
export const transformDefaults: Record<string, number> = {
  translateX: 0,
  translateY: 0,
  scaleX: 100,
  scaleY: 100,
  rotate: 0,
  opacity: 1,
};

const empty = {
  valueString: "",
  value: undefined,
  unit: undefined,
};

export const parseStringFrames = ({
  animation,
  timeline,
  key,
}: parserParams) => {
  const { closestsFrames } = getClosestFramesForTimeline(
    animation,
    timeline,
    key
  );
  if (!closestsFrames[0]) {
    return empty;
  }

  return {
    valueString: `${closestsFrames[0].value}`,
  };
};

export const parseNumberFrames = ({
  animation,
  timeline,
  key,
}: parserParams) => {
  const { closestsFrames, goal } = getClosestFramesForTimeline(
    animation,
    timeline,
    key
  );

  if (!closestsFrames[0]) {
    return empty;
  }

  const startValue = closestsFrames[0].value as number;
  const startFrame = (closestsFrames[0] as any).framePositionValue;
  const endValue = closestsFrames[1].value as number;
  const endFrame = (closestsFrames[1] as any).framePositionValue;

  if (
    (!startValue && startValue != 0) ||
    (!startFrame && startFrame != 0) ||
    (!endValue && endValue != 0) ||
    (!endFrame && endFrame != 0)
  ) {
    return empty;
  }

  const easingFunction = closestsFrames[1].easing
    ? easingFunctions[closestsFrames[1].easing]
    : easingFunctions.linear;
  let factor = easingFunction((goal - startFrame) / (endFrame - startFrame));

  factor = !isNaN(factor) ? Math.min(Math.max(factor, 0), 1) : 0;
  const value = startValue + (endValue - startValue) * factor;
  const unit = closestsFrames[0].unit;

  return {
    valueString: `${value}${unit || ""}`,
    valueNumber: value,
    unit: unit,
  };
};

const parserMap: {
  [key: string]: ({ animation, timeline, key }: parserParams) => IParsedValue;
} = {
  translateX: parseNumberFrames,
  translateY: parseNumberFrames,
  width: parseNumberFrames,
  height: parseNumberFrames,
  scaleX: parseNumberFrames,
  scaleY: parseNumberFrames,
  rotate: parseNumberFrames,
  opacity: parseNumberFrames,
  display: parseStringFrames,
  visibility: parseStringFrames,
  borderRadius: parseNumberFrames,
};

export default parserMap;

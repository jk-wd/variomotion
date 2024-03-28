import {
  IAnimationData,
  IBreakpoint,
  NoBreakpointIdentifier,
} from "../types-interfaces";
import { BreakpointIdAlreadyUsed } from "../errors";
import { breakpointColors } from "../breakpoint-colors";

let matchMediaManual: any = undefined;
export const setMatchMedia = (matchMediaParam: any) => {
  matchMediaManual = matchMediaParam;
};
export const getActiveBreakPoints = (
  animationData?: IAnimationData
): IBreakpoint[] => {
  const matchMedia = matchMediaManual ? matchMediaManual : window.matchMedia;
  let result: IBreakpoint[] = [
    {
      id: NoBreakpointIdentifier,
    },
  ];
  if (!animationData || !animationData.breakpoints) {
    return result;
  }
  for (const breakpointDefinition of animationData.breakpoints) {
    if (matchMedia(breakpointDefinition.definition).matches) {
      result = [...result, breakpointDefinition];
    }
  }
  return [
    ...result,
    {
      id: NoBreakpointIdentifier,
    },
  ];
};

export const getBreakpointById = (
  animationData: IAnimationData,
  breakpointId: string
) => {
  return animationData.breakpoints?.find(
    (breakpoint) => breakpoint.id === breakpointId
  );
};

export const addBreakpoint = (
  animationData: IAnimationData,
  breakpoint: Partial<IBreakpoint>
): IAnimationData => {
  const breakpoints = animationData.breakpoints
    ? animationData.breakpoints
    : [];

  const id = breakpoint.id;
  if (
    animationData.breakpoints &&
    animationData.breakpoints.find(
      (breakpoint) => breakpoint.id && breakpoint.id === id
    )
  ) {
    throw BreakpointIdAlreadyUsed;
  }
  const usedColors = (animationData.breakpoints ?? []).map(() => {
    return breakpoint.color;
  });
  const availableColors = breakpointColors.reduce(
    (result: string[], color: string) => {
      if (usedColors.includes(color)) {
        return result;
      }
      result.push(color);
      return result;
    },
    []
  );
  return {
    ...animationData,
    breakpoints: [
      ...breakpoints,
      {
        ...breakpoint,
        color:
          availableColors[Math.floor(Math.random() * availableColors.length)],
        id,
      } as IBreakpoint,
    ],
  };
};

export const editBreakpoint = (
  animationData: IAnimationData,
  breakpoint: Partial<IBreakpoint>
) => {
  const breakpoints = animationData.breakpoints
    ? animationData.breakpoints
    : [];
  const animationDataResult = {
    ...animationData,
    breakpoints: breakpoints.reduce(
      (result: IBreakpoint[], breakpointTarget: IBreakpoint) => {
        if (breakpoint.id === breakpointTarget.id) {
          result.push({
            ...breakpointTarget,
            ...breakpoint,
          });
        } else {
          result.push(breakpointTarget);
        }
        return result;
      },
      []
    ),
  };

  return animationDataResult;
};

export const deleteBreakpoint = (
  animationData: IAnimationData,
  breakpointId: string
) => {
  const breakpoints = animationData.breakpoints
    ? animationData.breakpoints
    : [];
  const animationDataResult = {
    ...animationData,
    breakpoints: breakpoints.reduce(
      (result: IBreakpoint[], breakpoint: IBreakpoint) => {
        if (breakpoint.id !== breakpointId) {
          result.push(breakpoint);
        }
        return result;
      },
      []
    ),
  };
  return animationDataResult;
};

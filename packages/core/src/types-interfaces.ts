export enum MatrixTransformTypes {
  translateX = "translateX",
  translateY = "translateY",
  scaleX = "scaleX",
  scaleY = "scaleY",
  rotate = "rotate",
}

export enum NumberValuePropTypes {
  translateX = "translateX",
  translateY = "translateY",
  width = "width",
  height = "height",
  scaleX = "scaleX",
  scaleY = "scaleY",
  opacity = "opacity",
  rotate = "rotate",
  borderRadius = "borderRadius",
}

export enum FixedValuePropTypes {
  display = "display",
  visibility = "visibility",
}

export const NoBreakpointIdentifier = "none";

export type FrameUnits = "%" | "px" | "ms";
export type EntryTypes = "animation" | "sequence";

export enum Units {
  percent = "%",
  px = "px",
  em = "em",
  rem = "rem",
  vw = "vw",
  vh = "vh",
  rad = "rad",
}

export interface IParsedValue {
  valueString: string;
  valueNumber?: number;
  unit?: string;
}

export interface IFrame {
  frameUnit?: FrameUnits;
  framePositionValue: number;
  unit?: Units;
  easing?: string;
  value: string | number;
}

export interface IFrameDef {
  frameUnit: FrameUnits;
  framePositionValue: number;
  valueDef: {
    [key: string]: IFrameValue;
  };
}

export interface IFrameValue {
  [key: string]: {
    easing?: string;
    unit?: Units;
    value: string | number;
  };
}

export interface IAnimationProps {
  [key: string]: IFrame[];
}
export interface IEntry {
  id: string;
  name?: string;
  activeOnBreakpoints?: string[];
}
export function isAnimationEntry(
  entry: IAnimationEntry | ISequenceEntry | IEntry
): entry is IAnimationEntry {
  return (entry as IAnimationEntry).frames !== undefined;
}

export interface IAnimationEntry extends IEntry {
  domQueries: string[];
  frames: IFrameDef[];
  transformOrigin?: { x: number; y: number };
}
export function isSequenceEntry(
  entry: IAnimationEntry | ISequenceEntry | IEntry
): entry is ISequenceEntry {
  return (entry as ISequenceEntry).sequenceCount !== undefined;
}
export interface ISequenceEntry extends IEntry {
  domQuery: string;
  framePositionValue: number;
  interval: number;
  sequenceCount: number;
}

export interface IBreakpoint {
  id: string;
  definition?: string;
  color?: string;
}

export interface ITimelineStateBase {
  duration?: number;
  start?: number;
  progress?: number;
}
export interface ITimelineState extends ITimelineStateBase {
  id: string;
  pause?: boolean;
  pauseTime?: number;
  autoplayed?: boolean;
}
export interface IPixelTimelineState extends ITimelineStateBase {
  id: string;
  loopCount?: number;
}
export interface IAnimationData {
  variomotionVersion: string;
  entries?: IEntry[];
  activePixelTimelines: string[];
  timelines: ITimeline[];
  numbers?: {
    [key: string]: number;
  };
  breakpoints?: IBreakpoint[];
  metaData?: {
    fiileName: string;
    [key: string]: string;
  };
}
export interface IOptions {
  url?: string;
  animationData?: IAnimationData | unknown;
  wrapper?: HTMLElement;
  bustCache?: boolean;
  useEditor?: boolean;
}

export interface INumberObject {
  [key: string]: number;
}

export interface IElement {
  blockStyling?: boolean;
  domElements: HTMLElement[];
  stylingValues: {
    [key: string]: IParsedValue;
  };
}

export interface IElements {
  [key: string]: IElement;
}

export interface ISequenceElements {
  [key: string]: HTMLElement[];
}

export interface IAnimation {
  domQuery: string;
  timelineId: string;
  pixelBased: boolean;
  matrixTransformCompatible?: boolean;
  animationProps: IAnimationProps;
}

export interface ISequenceAnimation {
  domQuery: string;
  framePositionValue: number;
  progress: number;
  interval: number;
  timelineId: string;
  sequenceCount: number;
  pixelBased: boolean;
}

export interface IOffsetStartEnd {
  start: IFrame;
  end: IFrame;
}

export interface ITimeline {
  id: string;
  loop: boolean;
  autoplay: boolean;
  duration?: number;
  animationEntries: string[];
  sequenceEntries: string[];
  pixelBased: boolean;
  startPixel?: number;

  activeOnBreakpoints?: string[];
}

export interface IValueEasing {
  value: number;
  easing: string;
}

import parserMap from "./value-parsers";

import { calculatePageScroll } from "./utils";
import { domStylingParser } from "./styling-parsers";
import { willChangeMap } from "./will-change-map";
import { getActiveBreakPoint } from "./data/breakpoints";
import { getTimelineById, isTimelineActiveOnBreakpoint } from "./data/timeline";
import {
  getAnimationEntryById,
  getSequenceEntryById,
  isEntryActiveOnBreakpoint,
} from "./data/entry";
import {
  getEndFromAnimationProps,
  mergeAnimations,
  processFrameDefinitions,
} from "./helpers/animationProps";

import {
  NoBreakpointIdentifier,
  ITimeline,
  IElement,
  IActiveBreakpoint,
  ISequenceAnimation,
  IAnimationEntry,
  ISequenceEntry,
  NumberValuePropTypes,
} from "./types-interfaces";

import {
  IOptions,
  IAnimation,
  IAnimationProps,
  IPixelTimelineState,
  ITimelineState,
  IAnimationData,
  IElements,
  ITimelineStateBase,
  ISequenceElements,
} from "./types-interfaces";
import { getEndFromSequenceAnimation } from "./helpers/sequenceAnimation";

let animations: IAnimation[] = [];
let sequenceAnimations: ISequenceAnimation[] = [];
let elements: IElements = {};
let sequenceElements: ISequenceElements = {};
let options: IOptions;
let wrapper: HTMLElement;
let wrapperClientHeight: number = 0;
let animationFrameId: number;
let animationData: IAnimationData;
let onUpdateAnimationDataCallback: (animationData: IAnimationData) => void;
let activeBreakpoint: IActiveBreakpoint = { id: NoBreakpointIdentifier };
const onAnimationFrameCallbacks: (() => void)[] = [];

export const setOnAnimationFrameCallback = (callback: () => void) => {
  onAnimationFrameCallbacks.push(callback);
};

let timelineStates: {
  [key: string]: ITimelineState;
} = {};

let pixelTimelineStates: {
  [key: string]: IPixelTimelineState;
} = {};

const updateTimelines = (timestamp: number) => {
  if (!animationData.timelines) {
    return;
  }

  for (const timeline of animationData.timelines) {
    if (timeline.pixelBased) {
      continue;
    }
    timelineStates[timeline.id] = timelineStates[timeline.id]
      ? timelineStates[timeline.id]
      : {
          id: timeline.id,
        };
    const timelineState = timelineStates[timeline.id];
    if (
      timelineState.isRunning &&
      !timelineState.pause &&
      timelineState.duration
    ) {
      if (!timelineState.start) timelineState.start = timestamp;
      const pauseTime = timelineState.pauseTime ? timelineState.pauseTime : 0;
      const progress = timestamp - timelineState.start - pauseTime;

      if (progress >= timelineState.duration) {
        timelineState.start = timestamp - pauseTime;
        timelineState.progress = timelineState.duration;
        if (!timeline.loop) {
          timelineState.isRunning = false;
          timelineState.pause = true;
          timelineState.pauseTime = timestamp - timelineState.start - progress;
        }
      } else {
        timelineState.progress = progress;
      }
    } else if (
      timelineState.isRunning &&
      timelineState.pause &&
      timelineState.progress
    ) {
      if (!timelineState.start) timelineState.start = timestamp;
      timelineState.pauseTime =
        timestamp - timelineState.start - timelineState.progress;
    }
  }
};

const updatePixelTimelines = () => {
  if (!animationData || !animationData.timelines) {
    return;
  }

  for (const timeline of animationData.timelines) {
    if (!timeline.pixelBased) {
      continue;
    }
    pixelTimelineStates[timeline.id] = pixelTimelineStates[timeline.id]
      ? pixelTimelineStates[timeline.id]
      : {
          id: timeline.id,
        };

    const timelineState = pixelTimelineStates[timeline.id];
    const { scrollOffset } = calculatePageScroll(timelineState.start);

    const scrollOffsetCalculated = Math.max(scrollOffset, 0);
    if (timeline.loop) {
      const loopCount = timelineState.loopCount ? timelineState.loopCount : 0;
      const end = timelineState.duration ? timelineState.duration : 0;

      timelineState.progress = scrollOffsetCalculated - end * loopCount;
      if (timelineState.progress >= end) {
        timelineState.loopCount = loopCount + 1;
      }
      if (timelineState.progress <= 0) {
        timelineState.loopCount = loopCount - 1;
      }
    } else {
      timelineState.progress = timelineState.duration
        ? Math.min(scrollOffsetCalculated, timelineState.duration)
        : scrollOffsetCalculated;
    }
  }
};

const updateAnimations = (animations: IAnimation[] = []) => {
  for (let i = 0; i < animations.length; i++) {
    const animation = animations[i];
    for (const animationKey of Object.keys(animation.animationProps)) {
      const parser = parserMap[animationKey];
      const timeline = animation.pixelBased
        ? pixelTimelineStates[animation.timelineId]
        : timelineStates[animation.timelineId];

      if (parser && timeline && elements[animation.domQuery]) {
        elements[animation.domQuery].stylingValues[animationKey] = parser({
          animation,
          key: animationKey as NumberValuePropTypes,
          timeline,
        });
      }
    }
  }
};

const updateSequenceTarget = (
  sequenceElement: HTMLElement,
  timeline: ITimelineState,
  animation: ISequenceAnimation
) => {
  if (!timeline.progress && timeline.progress !== 0) {
    return;
  }

  animation.progress = Math.min(
    Math.max(
      Math.floor(
        (timeline.progress - animation.framePositionValue) / animation.interval
      ),
      0
    ),
    animation.sequenceCount - 1
  );

  const children = sequenceElement.children as HTMLCollectionOf<HTMLElement>;
  if (children[animation.progress]) {
    children[animation.progress].style.opacity = "1";
  }
  for (let i = 0; i < sequenceElement.children.length; i++) {
    if (i !== animation.progress) {
      children[i].style.opacity = "0";
    }
  }
};

const updateSequenceAnimations = (animations: ISequenceAnimation[] = []) => {
  for (let i = 0; i < animations.length; i++) {
    const animation = sequenceAnimations[i];
    const timeline = animation.pixelBased
      ? pixelTimelineStates[animation.timelineId]
      : timelineStates[animation.timelineId];

    if (!timeline) {
      continue;
    }

    for (const sequence of sequenceElements[animation.domQuery]) {
      updateSequenceTarget(sequence, timeline, animation);
    }
  }
};

const setWillChange = (element: IElement) => {
  for (const domElement of element.domElements) {
    let willChange = "";

    for (const propType of Object.keys(element.stylingValues)) {
      if (!willChange.includes((willChangeMap as any)[propType])) {
        if (willChange.length > 0) {
          willChange += ", ";
        }
        willChange += `${(willChangeMap as any)[propType]}`;
      }
    }
    if (willChange) {
      domElement.style.willChange = willChange;
    }
  }
};

const updateElements = () => {
  for (const elementKey of Object.keys(elements)) {
    const element = elements[elementKey];
    setWillChange(element);
    if (typeof window !== "undefined" && !element.blockStyling) {
      domStylingParser(element);
    }
  }
};

const fillElementsArray = (animationEntries: string[]) => {
  for (const animationEntryId of animationEntries || []) {
    const animationEntry: IAnimationEntry | undefined = getAnimationEntryById(
      animationData,
      animationEntryId
    );

    if (
      !animationEntry ||
      !isEntryActiveOnBreakpoint(animationData, animationEntry)
    ) {
      continue;
    }

    for (const domQuery of animationEntry.domQueries) {
      const elementsFound: NodeListOf<Element> =
        document.querySelectorAll(domQuery);
      elements[domQuery] = {
        domElements: Array.prototype.slice.call(elementsFound),
        stylingValues: {},
      };
      elements[domQuery].domElements.forEach((element) => {
        element.style.transformOrigin = animationEntry!.transformOrigin
          ? `${animationEntry!.transformOrigin.x}px ${
              animationEntry!.transformOrigin.y
            }px`
          : "0 0";
      });
    }
  }
};

export const blockStylingElements = (domQueries: string[] = []) => {
  domQueries.forEach((domQuery) => {
    elements[domQuery].blockStyling = true;
  });
};

export const unBlockStylingElements = (domQueries: string[]) => {
  domQueries.forEach((domQuery) => {
    elements[domQuery].blockStyling = false;
  });
};

const fillSequenceElementsArray = (sequenceEntries: string[]) => {
  for (const sequenceEntryId of sequenceEntries || []) {
    let sequenceEntry: ISequenceEntry | undefined;
    try {
      sequenceEntry = getSequenceEntryById(animationData, sequenceEntryId);
    } catch (error) {
      console.warn(error);
    }
    if (!sequenceEntry) {
      continue;
    }
    const elementsFound: NodeListOf<Element> = document.querySelectorAll(
      sequenceEntry.domQuery
    );
    sequenceElements[sequenceEntry.domQuery] =
      Array.prototype.slice.call(elementsFound);
  }
};

const prepareTimelinState = (timelineId: string) => {
  const timeline = getTimelineById(animationData, timelineId);

  if (!timeline) {
    return;
  }

  if (!timeline.pixelBased) {
    timelineStates[timeline.id] = timelineStates[timeline.id]
      ? timelineStates[timeline.id]
      : {
          id: timeline.id,
        };

    timelineStates[timeline.id].isRunning = timeline.autoplay;
  } else {
    if (!pixelTimelineStates[timeline.id]) {
      pixelTimelineStates[timeline.id] = {
        id: timeline.id,
      };
    }
    pixelTimelineStates[timeline.id].start =
      timeline.startPixel ?? pixelTimelineStates[timeline.id].start ?? wrapper
        ? wrapper.getBoundingClientRect().y
        : 0;
  }
  const timelineState = timeline.pixelBased
    ? pixelTimelineStates[timeline.id]
    : timelineStates[timeline.id];

  if (timelineState) {
    let lastPixel: number | null = 0;
    for (const animation of animations) {
      if (timeline.id !== animation.timelineId) {
        continue;
      }
      const end = timelineState.duration ? timelineState.duration : 0;
      timelineState.duration = Math.max(
        getEndFromAnimationProps(animation.animationProps),
        end
      );
      if (timeline.pixelBased) {
        lastPixel = Math.max(((timelineState.start ?? 0) + timelineState.duration), lastPixel)
      }
      
    }
    for (const sequenceAnimation of sequenceAnimations) {
      if (timeline.id !== sequenceAnimation.timelineId) {
        continue;
      }
      const end = timelineState.duration ? timelineState.duration : 0;
      const sequenceEnd = getEndFromSequenceAnimation(sequenceAnimation);
      timelineState.duration = Math.max(sequenceEnd, end);
      if (timeline.pixelBased) {
        lastPixel = Math.max(((timelineState.start ?? 0) + timelineState.duration), lastPixel)
      }
    }
    if (
      lastPixel
    ) {
      console.log(wrapperClientHeight)
      wrapper.style.height = `${lastPixel + wrapperClientHeight}px`;
    }
  }
};

const updateExistingAnimations = (
  animation: IAnimation,
  pixelBased: boolean = false
): boolean => {
  let isUpdated = false;
  animations = animations.reduce(
    (result: IAnimation[], animationDef: IAnimation) => {
      if (
        animationDef.pixelBased === animation.pixelBased &&
        animationDef.domQuery === animation.domQuery &&
        animationDef.timelineId === animation.timelineId
      ) {
        result.push({
          ...animationDef,
          animationProps: mergeAnimations(
            animationDef.animationProps,
            animation.animationProps,
            pixelBased
          ),
        });
        isUpdated = true;
      } else {
        result.push(animationDef);
      }
      return result;
    },
    []
  );
  return isUpdated;
};

const processTimelineEntries = (
  entries: string[],
  timeline: ITimeline,
  pixelBased: boolean = false
) => {
  for (const animationEntryId of entries || []) {
    let animationEntry;
    try {
      animationEntry = getAnimationEntryById(animationData, animationEntryId);
    } catch (e) {
      console.warn(e);
    }

    if (
      !animationEntry ||
      !isEntryActiveOnBreakpoint(animationData, animationEntry)
    ) {
      continue;
    }

    let animationProps: IAnimationProps = {};

    animationProps = processFrameDefinitions(
      animationData,
      animationEntry.frames,
      timeline,
      animationEntry
    );
    for (const domQuery of animationEntry.domQueries) {
      const animation = {
        domQuery,
        timelineId: timeline.id,
        pixelBased,
        animationProps,
      };

      if (!updateExistingAnimations(animation, timeline.pixelBased)) {
        animations.push(animation);
      }
    }
  }
};

const processTimelineSequenceEntries = (
  entries: string[],
  timeline: ITimeline,
  pixelBased: boolean = false
) => {
  for (const sequenceEntryId of entries || []) {
    let sequenceEntry: ISequenceEntry | undefined;
    try {
      sequenceEntry = getSequenceEntryById(animationData, sequenceEntryId);
    } catch (error) {
      console.warn(error);
    }

    if (
      !sequenceEntry ||
      !isEntryActiveOnBreakpoint(animationData, sequenceEntry)
    ) {
      continue;
    }
    sequenceAnimations.push({
      domQuery: sequenceEntry.domQuery,
      timelineId: timeline.id,
      framePositionValue: sequenceEntry.framePositionValue,
      interval: sequenceEntry.interval,
      sequenceCount: sequenceEntry.sequenceCount,
      progress: 0,
      pixelBased,
    });
  }
};

const processTimelines = () => {
  if (!animationData || !animationData.timelines) {
    return;
  }
  for (const timeline of animationData.timelines) {
    if (isTimelineActiveOnBreakpoint(animationData, timeline)) {
      if (timeline.animationEntries) {
        fillElementsArray(timeline.animationEntries);
        processTimelineEntries(
          timeline.animationEntries,
          timeline,
          timeline.pixelBased
        );
      }

      if (timeline.sequenceEntries) {
        fillSequenceElementsArray(timeline.sequenceEntries);
        processTimelineSequenceEntries(
          timeline.sequenceEntries,
          timeline,
          timeline.pixelBased
        );
      }
    }
    prepareTimelinState(timeline.id);
  }
};

const loopUpdateAnimations = function (timestamp: number) {
  updateAnimations(animations);
  updateSequenceAnimations(sequenceAnimations);
  updateTimelines(timestamp);
  updateElements();
  updatePixelTimelines();
  animationFrameId = requestAnimationFrame(loopUpdateAnimations);
  onAnimationFrameCallbacks.forEach((callback) => callback());
};

function addParameterToURL(url: string, param: string) {
  url += (url.split("?")[1] ? "&" : "?") + param;
  return url;
}

const fetchAnimationJSON = async (): Promise<IAnimationData | undefined> => {
  if (!options.url) {
    return;
  }
  const timeStamp = new Date().getTime();
  let url = options.url;
  if (options.bustCache) {
    url = addParameterToURL(url, `variomotiont=${timeStamp}`);
  }
  const result = await window.fetch(url);
  return await result.json();
};

const setupBreakpointHandler = () => {
  activeBreakpoint = getActiveBreakPoint(animationData);
  window.addEventListener("resize", () => {
    const newActiveBreakpoint = getActiveBreakPoint(animationData);
    if (newActiveBreakpoint.id !== activeBreakpoint.id) {
      updateAnimationData(animationData);
    }
  });
};

export const play = (timelineId?: string, position?: number) => {
  const timelineTarget = timelineId ? timelineId : "main";
  const timeline = timelineStates[timelineTarget];
  let startPosition = position;
  if (timeline && timeline.duration === timeline.progress && !startPosition) {
    startPosition = 0;
  }
  const startFromPosition = startPosition || startPosition === 0 ? true : false;

  if (timeline && timeline.duration) {
    timeline.pause = false;
    timeline.isRunning = true;
    timeline.progress = startFromPosition ? startPosition : timeline.progress;
    timeline.start = startFromPosition ? 0 : timeline.start;
    timeline.pauseTime = startFromPosition ? 0 : timeline.pauseTime;
  }
};

export const pause = (timelineId?: string, position?: number) => {
  const timelineTarget = timelineId ? timelineId : "main";
  const timeline = timelineStates[timelineTarget];
  const pauseOnPosition = position || position === 0 ? true : false;

  let startPosition = position;
  if (timeline && timeline.duration === timeline.progress && !pauseOnPosition) {
    startPosition = 0;
  }
  if (timeline) {
    timeline.pause = true;
    if (pauseOnPosition) {
      timeline.progress = startPosition;
      timeline.start = 0;
      timeline.pauseTime = 0;
    }
  }
};

export const getWrapper = () => {
  return wrapper;
};
export const getOptions = () => {
  return options;
};

export const init = async (optionsParam?: IOptions) => {
  if(animationData) {
    processAnimationData();
    return;
  }
  
  wrapper = optionsParam?.wrapper ?? document.body;
  wrapperClientHeight = optionsParam?.wrapper ? wrapper.clientHeight: window.innerHeight;
  options = {
    ...optionsParam,
  };
  animationData = options.animationData ? options.animationData as IAnimationData : animationData;
  const animationDataFetch = await fetchAnimationJSON();
  if (animationDataFetch) {
    animationData = animationDataFetch;
  }

  processAnimationData();
  window.cancelAnimationFrame(animationFrameId);
  requestAnimationFrame(loopUpdateAnimations);
};

export const resetTimelineStateEnds = (timelineStates: {
  [key: string]: ITimelineStateBase;
}) => {
  const result: any = {};
  for (const key of Object.keys(timelineStates)) {
    result[key] = {
      ...timelineStates[key],
      duration: 0,
    };
  }
  return result;
};

export const processAnimationData = () => {
  setupBreakpointHandler();
  processTimelines();
};

export const getAnimationData = () => {
  return animationData;
};

export const getPixelTimelineStates = () => {
  return pixelTimelineStates;
};

export const getTimelineStates = () => {
  return timelineStates;
};

export const setAnimationData = (data: IAnimationData) => {
  animationData = data;
};

export const onUpdateAnimationData = (
  callback: (animationData: IAnimationData) => void
) => {
  onUpdateAnimationDataCallback = callback;
};

export const updateAnimationData = (animationDataValue: IAnimationData) => {
  window.cancelAnimationFrame(animationFrameId);
  pixelTimelineStates = resetTimelineStateEnds(pixelTimelineStates);
  timelineStates = resetTimelineStateEnds(timelineStates);
  animationData = animationDataValue;
  elements = {};
  sequenceElements = {};
  animations = [];
  sequenceAnimations = [];
  processAnimationData();
  requestAnimationFrame(loopUpdateAnimations);
  if (onUpdateAnimationDataCallback) {
    onUpdateAnimationDataCallback(animationData);
  }
};

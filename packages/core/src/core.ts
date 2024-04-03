import parserMap from "./value-parsers";

import { calculatePageScroll, numberIsSet, getValueStoreValue } from "./utils";
import { domStylingParser } from "./styling-parsers";
import { willChangeMap } from "./will-change-map";

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
  ISequenceAnimation,
  IAnimationEntry,
  ISequenceEntry,
  NumberValuePropTypes,
  IValueStore,
} from "./types-interfaces";

import {
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
import { getActiveBreakPoints } from "./data/breakpoints";

export class VariomotionProject {
  animations: IAnimation[] = [];
  sequenceAnimations: ISequenceAnimation[] = [];
  elements: IElements = {};
  sequenceElements: ISequenceElements = {};
  lastActiveBreakpoint: string = NoBreakpointIdentifier;
  animationFrameId?: number;
  animationData: IAnimationData = {};
  onUpdateAnimationDataCallback?: (animationData: IAnimationData) => void;
  lastPixel: number | null = 0;
  onAnimationFrameCallbacks: (() => void)[] = [];
  valueStore: IValueStore = {};
  scopeId: string = "";
  name: string = "";

  timelineStates: {
    [key: string]: ITimelineState;
  } = {};

  constructor(scopeId: string, projectName: string) {
    this.scopeId = scopeId;
    this.name = projectName;
  }

  init(
    animationData: IAnimationData,
    valueStore?: IValueStore
  ): VariomotionProject {
    this.animationData = animationData;
    this.valueStore = {
      ...this.valueStore,
      ...animationData?.valueStore,
      ...(valueStore ?? {}),
    };
    this.processAnimationData();

    if (this.animationFrameId) {
      window.cancelAnimationFrame(this.animationFrameId);
    }

    requestAnimationFrame(this.loopUpdateAnimations.bind(this));
    return this;
  }

  target(name: string) {
    return `${this.scopeId}-${name}`;
  }

  pixelTimelineStates: {
    [key: string]: IPixelTimelineState;
  } = {};

  setValueStore(valueStoreParam: IValueStore) {
    this.valueStore = valueStoreParam;
  }

  onAnimationFrame(callback: () => void) {
    this.onAnimationFrameCallbacks.push(callback);
  }

  updateTimelines(timestamp: number) {
    if (!this.animationData.timelines) {
      return;
    }

    for (const timeline of this.animationData.timelines) {
      if (timeline.pixelBased) {
        continue;
      }
      this.timelineStates[timeline.id] = this.timelineStates[timeline.id]
        ? this.timelineStates[timeline.id]
        : {
            id: timeline.id,
          };
      const timelineState = this.timelineStates[timeline.id];
      if (!timelineState.pause && timelineState.duration) {
        if (!timelineState.start) {
          timelineState.start = timestamp;
        }
        const pauseTime = timelineState.pauseTime ? timelineState.pauseTime : 0;
        const progress = timestamp - timelineState.start - pauseTime;

        if (progress >= timelineState.duration) {
          timelineState.start = timestamp - pauseTime;
          timelineState.progress = timelineState.duration;
          if (!timeline.loop) {
            timelineState.pause = true;
            timelineState.pauseTime =
              timestamp - timelineState.start - progress;
          }
        } else {
          timelineState.progress = progress;
        }
      } else if (timelineState.pause && timelineState.progress) {
        if (!timelineState.start) {
          timelineState.start = timestamp;
        }

        timelineState.pauseTime =
          timestamp - timelineState.start - timelineState.progress;
      }
    }
  }

  updatePixelTimelines() {
    if (!this.animationData || !this.animationData.timelines) {
      return;
    }

    for (const timeline of this.animationData.timelines) {
      if (!timeline.pixelBased) {
        continue;
      }
      this.pixelTimelineStates[timeline.id] = this.pixelTimelineStates[
        timeline.id
      ]
        ? this.pixelTimelineStates[timeline.id]
        : {
            id: timeline.id,
          };

      const timelineState = this.pixelTimelineStates[timeline.id];
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
  }

  updateAnimations(animations: IAnimation[] = []) {
    for (let i = 0; i < animations.length; i++) {
      const animation = animations[i];
      for (const animationKey of Object.keys(animation.animationProps)) {
        const parser = parserMap[animationKey];
        const timeline = animation.pixelBased
          ? this.pixelTimelineStates[animation.timelineId]
          : this.timelineStates[animation.timelineId];

        if (parser && timeline && this.elements[animation.domQuery]) {
          this.elements[animation.domQuery].stylingValues[animationKey] =
            parser({
              animation,
              key: animationKey as NumberValuePropTypes,
              timeline,
            });
        }
      }
    }
  }

  updateSequenceTarget(
    sequenceElement: HTMLElement,
    timeline: ITimelineState,
    animation: ISequenceAnimation
  ) {
    if (!timeline.progress && timeline.progress !== 0) {
      return;
    }

    animation.progress = Math.min(
      Math.max(
        Math.floor(
          (timeline.progress - animation.framePositionValue) /
            animation.interval
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
  }

  updateSequenceAnimations(animations: ISequenceAnimation[] = []) {
    for (let i = 0; i < animations.length; i++) {
      const animation = this.sequenceAnimations[i];
      const timeline = animation.pixelBased
        ? this.pixelTimelineStates[animation.timelineId]
        : this.timelineStates[animation.timelineId];

      if (!timeline) {
        continue;
      }

      for (const sequence of this.sequenceElements[animation.domQuery]) {
        this.updateSequenceTarget(sequence, timeline, animation);
      }
    }
  }

  setWillChange(element: IElement) {
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
  }

  updateElements() {
    for (const elementKey of Object.keys(this.elements)) {
      const element = this.elements[elementKey];
      this.setWillChange(element);
      if (typeof window !== "undefined" && !element.blockStyling) {
        domStylingParser(element);
      }
    }
  }

  fillElementsArray(animationEntries: string[]) {
    for (const animationEntryId of animationEntries || []) {
      const animationEntry: IAnimationEntry | undefined = getAnimationEntryById(
        this.animationData,
        animationEntryId
      );

      if (
        !animationEntry ||
        !isEntryActiveOnBreakpoint(this.animationData, animationEntry)
      ) {
        continue;
      }
      for (const domQuery of animationEntry.domQueries) {
        const elementsFound: NodeListOf<Element> = document.querySelectorAll(
          `${domQuery}[data-v~="${this.scopeId}"]`
        );
        this.elements[domQuery] = {
          domElements: Array.prototype.slice.call(elementsFound),
          stylingValues: {},
        };
        this.elements[domQuery].domElements.forEach((element) => {
          element.style.transformOrigin = animationEntry!.transformOrigin
            ? `${animationEntry!.transformOrigin.x}px ${
                animationEntry!.transformOrigin.y
              }px`
            : "0 0";
        });
      }
    }
  }

  blockStylingElements(domQueries: string[] = []) {
    domQueries.forEach((domQuery) => {
      this.elements[domQuery].blockStyling = true;
    });
  }

  unBlockStylingElements(domQueries: string[]) {
    domQueries.forEach((domQuery) => {
      this.elements[domQuery].blockStyling = false;
    });
  }

  fillSequenceElementsArray(sequenceEntries: string[]) {
    for (const sequenceEntryId of sequenceEntries || []) {
      let sequenceEntry: ISequenceEntry | undefined;
      try {
        sequenceEntry = getSequenceEntryById(
          this.animationData,
          sequenceEntryId
        );
      } catch (error) {
        console.warn(error);
      }
      if (!sequenceEntry) {
        continue;
      }
      const elementsFound: NodeListOf<Element> = document.querySelectorAll(
        sequenceEntry.domQuery
      );
      this.sequenceElements[sequenceEntry.domQuery] =
        Array.prototype.slice.call(elementsFound);
    }
  }

  prepareTimelinState(timelineId: string) {
    const timeline = getTimelineById(this.animationData, timelineId);

    if (!timeline) {
      return;
    }

    if (!timeline.pixelBased) {
      this.timelineStates[timeline.id] = this.timelineStates[timeline.id]
        ? this.timelineStates[timeline.id]
        : {
            id: timeline.id,
          };

      this.timelineStates[timeline.id].pause = this.timelineStates[timeline.id]
        .autoplayed
        ? this.timelineStates[timeline.id].pause
        : !timeline.autoplay;
      this.timelineStates[timeline.id].autoplayed = true;
    } else {
      if (!this.pixelTimelineStates[timeline.id]) {
        this.pixelTimelineStates[timeline.id] = {
          id: timeline.id,
        };
      }
      if (
        timeline.startPixelValueStoreKey &&
        this.valueStore[timeline.startPixelValueStoreKey]
      ) {
        this.pixelTimelineStates[timeline.id].start = getValueStoreValue(
          this.valueStore,
          timeline.startPixelValueStoreKey
        );
      } else if (numberIsSet(timeline.startPixel)) {
        this.pixelTimelineStates[timeline.id].start = timeline.startPixel;
      } else {
        this.pixelTimelineStates[timeline.id].start = 0;
      }
    }
    const timelineState = timeline.pixelBased
      ? this.pixelTimelineStates[timeline.id]
      : this.timelineStates[timeline.id];

    if (timelineState) {
      for (const animation of this.animations) {
        if (timeline.id !== animation.timelineId) {
          continue;
        }
        const end = timelineState.duration ? timelineState.duration : 0;
        timelineState.duration = Math.max(
          getEndFromAnimationProps(animation.animationProps),
          end
        );
        if (timeline.pixelBased) {
          this.lastPixel = Math.max(
            (timelineState.start ?? 0) + timelineState.duration,
            this.lastPixel ?? 0
          );
        }
      }
      for (const sequenceAnimation of this.sequenceAnimations) {
        if (timeline.id !== sequenceAnimation.timelineId) {
          continue;
        }
        const end = timelineState.duration ? timelineState.duration : 0;
        const sequenceEnd = getEndFromSequenceAnimation(sequenceAnimation);
        timelineState.duration = Math.max(sequenceEnd, end);
        if (timeline.pixelBased) {
          this.lastPixel = Math.max(
            (timelineState.start ?? 0) + timelineState.duration,
            this.lastPixel ?? 0
          );
        }
      }
      if (this.lastPixel) {
        document.body.style.height = `${this.lastPixel + window.innerHeight}px`;
      }
    }
    console.log(timelineState);
  }

  updateExistingAnimations(animation: IAnimation, pixelBased: boolean = false) {
    let isUpdated = false;
    this.animations = this.animations.reduce(
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
  }

  processTimelineEntries(
    entries: string[],
    timeline: ITimeline,
    pixelBased: boolean = false
  ) {
    for (const animationEntryId of entries || []) {
      let animationEntry;
      try {
        animationEntry = getAnimationEntryById(
          this.animationData,
          animationEntryId
        );
      } catch (e) {
        console.warn(e);
      }

      if (
        !animationEntry ||
        !isEntryActiveOnBreakpoint(this.animationData, animationEntry)
      ) {
        continue;
      }

      let animationProps: IAnimationProps = {};

      animationProps = processFrameDefinitions(
        this,
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

        if (!this.updateExistingAnimations(animation, timeline.pixelBased)) {
          this.animations.push(animation);
        }
      }
    }
  }

  processTimelineSequenceEntries(
    entries: string[],
    timeline: ITimeline,
    pixelBased: boolean = false
  ) {
    for (const sequenceEntryId of entries || []) {
      let sequenceEntry: ISequenceEntry | undefined;
      try {
        sequenceEntry = getSequenceEntryById(
          this.animationData,
          sequenceEntryId
        );
      } catch (error) {
        console.warn(error);
      }

      if (
        !sequenceEntry ||
        !isEntryActiveOnBreakpoint(this.animationData, sequenceEntry)
      ) {
        continue;
      }
      this.sequenceAnimations.push({
        domQuery: sequenceEntry.domQuery,
        timelineId: timeline.id,
        framePositionValue: sequenceEntry.framePositionValue,
        interval: sequenceEntry.interval,
        sequenceCount: sequenceEntry.sequenceCount,
        progress: 0,
        pixelBased,
      });
    }
  }

  processTimelines = () => {
    if (!this.animationData || !this.animationData.timelines) {
      return;
    }
    for (const timeline of this.animationData.timelines) {
      if (isTimelineActiveOnBreakpoint(this.animationData, timeline)) {
        if (timeline.animationEntries) {
          this.fillElementsArray(timeline.animationEntries);
          this.processTimelineEntries(
            timeline.animationEntries,
            timeline,
            timeline.pixelBased
          );
        }

        if (timeline.sequenceEntries) {
          this.fillSequenceElementsArray(timeline.sequenceEntries);
          this.processTimelineSequenceEntries(
            timeline.sequenceEntries,
            timeline,
            timeline.pixelBased
          );
        }
      }
      this.prepareTimelinState(timeline.id);
    }
  };

  loopUpdateAnimations(timestamp: number) {
    this.updateAnimations(this.animations);
    this.updateSequenceAnimations(this.sequenceAnimations);
    this.updateTimelines(timestamp);
    this.updateElements();
    this.updatePixelTimelines();
    this.animationFrameId = requestAnimationFrame(
      this.loopUpdateAnimations.bind(this)
    );
    this.onAnimationFrameCallbacks.forEach((callback) => callback());
  }

  addParameterToURL(url: string, param: string) {
    url += (url.split("?")[1] ? "&" : "?") + param;
    return url;
  }

  setupBreakpointHandler() {
    window.addEventListener("resize", () => {
      const breakpoint = getActiveBreakPoints(this.animationData)[0]?.id;
      if (!breakpoint) {
        return;
      }
      if (this.lastActiveBreakpoint !== breakpoint) {
        this.updateAnimationData(this.animationData);
      }
      this.lastActiveBreakpoint = breakpoint;
    });
  }

  play(timelineId?: string, position?: number) {
    const timelineTarget = timelineId ? timelineId : "main";
    const timeline = this.timelineStates[timelineTarget];
    let startPosition = position;
    if (timeline && timeline.duration === timeline.progress && !startPosition) {
      startPosition = 0;
    }
    const startFromPosition =
      startPosition || startPosition === 0 ? true : false;

    if (timeline && timeline.duration) {
      timeline.pause = false;
      timeline.progress = startFromPosition ? startPosition : timeline.progress;
      timeline.start = startFromPosition ? 0 : timeline.start;
      timeline.pauseTime = startFromPosition ? 0 : timeline.pauseTime;
    }
  }

  pause(timelineId?: string, position?: number) {
    const timelineTarget = timelineId ? timelineId : "main";
    const timeline = this.timelineStates[timelineTarget];
    const pauseOnPosition = position || position === 0 ? true : false;

    let startPosition = position;
    if (
      timeline &&
      timeline.duration === timeline.progress &&
      !pauseOnPosition
    ) {
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
  }

  resetTimelineStateEnds(timelineStates: {
    [key: string]: ITimelineStateBase;
  }) {
    const result: any = {};
    for (const key of Object.keys(timelineStates)) {
      result[key] = {
        ...timelineStates[key],
        duration: 0,
      };
    }
    return result;
  }

  processAnimationData() {
    this.setupBreakpointHandler();
    this.processTimelines();
  }

  setAnimationData(data: IAnimationData) {
    this.animationData = data;
  }

  onUpdateAnimationData(callback: (animationData: IAnimationData) => void) {
    this.onUpdateAnimationDataCallback = callback;
  }

  updateAnimationData(animationDataValue: IAnimationData) {
    if (this.animationFrameId)
      window.cancelAnimationFrame(this.animationFrameId);
    this.pixelTimelineStates = this.resetTimelineStateEnds(
      this.pixelTimelineStates
    );
    this.timelineStates = this.resetTimelineStateEnds(this.timelineStates);
    this.animationData = animationDataValue;
    this.elements = {};
    this.sequenceElements = {};
    this.animations = [];
    this.sequenceAnimations = [];
    this.processAnimationData();
    requestAnimationFrame(this.loopUpdateAnimations.bind(this));
    if (this.onUpdateAnimationDataCallback) {
      this.onUpdateAnimationDataCallback(this.animationData);
    }
  }
}

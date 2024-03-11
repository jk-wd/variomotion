import { deleteEntry, getEntryById } from "./entry";
import { EntryTypes, IAnimationData, ITimeline } from "../types-interfaces";
import {
  EntryNotFound,
  TimelineIdAlreadyUsed,
  TimelineNotFound,
} from "../errors";
import { getActiveBreakPoint } from "./breakpoints";

export const getTimelineById = (animationData: IAnimationData, id: string) => {
  return (animationData.timelines || []).find((timeline) => timeline.id === id);
};

export const isTimelineActiveOnBreakpoint = (
  animationData: IAnimationData,
  timeline: ITimeline
) => {
  const breakpoint = getActiveBreakPoint(animationData);

  if (
    !timeline.activeOnBreakpoints ||
    timeline.activeOnBreakpoints.length === 0
  ) {
    return true;
  }

  return timeline.activeOnBreakpoints.includes(breakpoint.id);
};

export const addTimeline = (
  animationData: IAnimationData,
  timeline: ITimeline
) => {
  animationData.timelines = animationData.timelines
    ? animationData.timelines
    : [];

  if (
    animationData.timelines &&
    animationData.timelines.find(
      (timelineFound) => timelineFound.id && timelineFound.id === timeline.id
    )
  ) {
    throw TimelineIdAlreadyUsed;
  }

  return {
    ...animationData,
    timelines: [...animationData.timelines, timeline],
  };
};

export const editTimeline = (
  animationData: IAnimationData,
  timeline: Partial<ITimeline>
) => {
  const timelines = animationData.timelines ? animationData.timelines : [];
  const animationDataResult = {
    ...animationData,
    timelines: timelines.reduce(
      (result: ITimeline[], timelineEntry: ITimeline) => {
        if (timelineEntry.id === timeline.id) {
          result.push({
            ...timelineEntry,
            ...timeline,
          });
        } else {
          result.push(timelineEntry);
        }
        return result;
      },
      []
    ),
  };
  return animationDataResult;
};

export const deleteTimeline = (animationData: IAnimationData, id: string) => {
  const timelines = animationData.timelines ? animationData.timelines : [];
  let entries: string[] = [];
  let animationDataResult: IAnimationData = {
    ...animationData,
    timelines: timelines.reduce((result: ITimeline[], timeline: ITimeline) => {
      if (timeline.id !== id) {
        result.push(timeline);
      } else {
        entries = [
          ...entries,
          ...(timeline.animationEntries || []),
          ...(timeline.sequenceEntries || []),
        ];
      }
      return result;
    }, []),
  };

  if (entries.length > 0) {
    for (const entry of entries) {
      animationDataResult = deleteEntry(animationDataResult, entry);
    }
  }

  return animationDataResult;
};

export const connectTimelineEntry = (
  animationData: IAnimationData,
  timelineId: string,
  entryId: string,
  type: EntryTypes
) => {
  const timeline = getTimelineById(animationData, timelineId);
  const entry = getEntryById(animationData, entryId);
  if (!timeline) {
    throw TimelineNotFound;
  }

  if (!entry) {
    throw EntryNotFound;
  }

  const entriesIndex =
    type === "animation" ? "animationEntries" : "sequenceEntries";

  return editTimeline(animationData, {
    id: timelineId,
    [entriesIndex]:
      timeline[entriesIndex] && timeline[entriesIndex].indexOf(entryId) <= -1
        ? [...timeline[entriesIndex], entryId]
        : timeline[entriesIndex],
  });
};

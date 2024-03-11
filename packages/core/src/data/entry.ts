import {
  IAnimationData,
  IAnimationEntry,
  IEntry,
  ISequenceEntry,
  ITimeline,
  isAnimationEntry,
  isSequenceEntry,
} from "../types-interfaces";

import {
  AnimationEntryIdAlreadyUsed,
  AnimationEntryWrongType,
  SequenceEntryWrongType,
} from "../errors";
import { getTimelineById } from "./timeline";
import { getActiveBreakPoint } from "./breakpoints";

export const isEntryActiveOnBreakpoint = (
  animaitonData: IAnimationData,
  entry: IEntry
) => {
  const breakpoint = getActiveBreakPoint(animaitonData);

  if (!entry.activeOnBreakpoints || entry.activeOnBreakpoints.length === 0) {
    return true;
  }

  return entry.activeOnBreakpoints.includes(breakpoint.id);
};

export const getEntryById = (animationData: IAnimationData, id: string) => {
  return (animationData.entries ?? []).find((entry: IEntry) => entry.id === id);
};

export const getSequenceEntryById = (
  animationData: IAnimationData,
  id: string
) => {
  const sequenceEntry = getEntryById(animationData, id) as ISequenceEntry;

  if (!sequenceEntry) {
    return;
  }

  if (!isSequenceEntry(sequenceEntry)) {
    throw SequenceEntryWrongType;
  }

  return sequenceEntry;
};

export const getAnimationEntryById = (
  animationData: IAnimationData,
  id: string
) => {
  const animationEntry: IAnimationEntry = getEntryById(
    animationData,
    id
  ) as IAnimationEntry;

  if (!animationEntry) {
    return;
  }
  if (!isAnimationEntry(animationEntry)) {
    throw AnimationEntryWrongType;
  }

  return animationEntry;
};

export function getAnimationEntriesForTimeline(
  animationData: IAnimationData,
  timelineId: string
) {
  const timeline = getTimelineById(animationData, timelineId);
  return (animationData.entries ?? []).filter((entry) =>
    (timeline?.animationEntries ?? []).includes(entry.id)
  );
}

export function getSequenceEntriesForTimeline(
  animationData: IAnimationData,
  timelineId: string
) {
  const timeline = getTimelineById(animationData, timelineId);
  return (animationData.entries ?? []).filter((entry) =>
    (timeline?.sequenceEntries ?? []).includes(entry.id)
  );
}

export const editEntry = <A extends IAnimationEntry | ISequenceEntry>(
  animationData: IAnimationData,
  entry: Partial<A>
): IAnimationData => {
  const entries = animationData.entries ? animationData.entries : [];
  const animationDataResult = {
    ...animationData,
    entries: entries.reduce((result: IEntry[], entryItem: IEntry) => {
      if (entry.id === entryItem.id) {
        result.push({
          ...entryItem,
          ...entry,
        } as A);
      } else {
        result.push(entryItem);
      }
      return result;
    }, []),
  };
  return animationDataResult;
};

export const removeEntryReferences = (
  animationData: IAnimationData,
  animationEntryId: string
): IAnimationData => {
  const timelines = animationData.timelines ? animationData.timelines : [];
  const animationDataResult = {
    ...animationData,
    timelines: timelines.map((timeline: ITimeline) => {
      return {
        ...timeline,
        animationEntries: timeline.animationEntries?.filter(
          (entryId: string) => entryId !== animationEntryId
        ),
        sequenceEntries: timeline.sequenceEntries?.filter(
          (entryId: string) => entryId !== animationEntryId
        ),
      };
    }, []),
  };
  return animationDataResult;
};

export const addEntry = <A extends IAnimationEntry | ISequenceEntry>(
  animationData: IAnimationData,
  animationEntry: A
): IAnimationData => {
  const entries = animationData.entries ? animationData.entries : [];
  if (entries.find((entry) => entry.id && entry.id === animationEntry.id)) {
    throw AnimationEntryIdAlreadyUsed;
  }
  const animationDataResult: IAnimationData = {
    ...animationData,
    entries: [...entries, animationEntry],
  };
  return animationDataResult;
};

export const deleteEntry = (
  animationData: IAnimationData,
  animationEntryId: string
) => {
  const entries = animationData.entries ? animationData.entries : [];

  const animationDataResult: IAnimationData = {
    ...removeEntryReferences(animationData, animationEntryId),
    entries: entries.reduce((result: IEntry[], animation: IEntry) => {
      if (animation.id != animationEntryId) {
        result.push(animation);
      }
      return result;
    }, []),
  };
  return animationDataResult;
};

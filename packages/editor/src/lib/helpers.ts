import { goto } from "$app/navigation";
import type { ITimeline } from "@variomotion/core";
import type { TimelineStatesStore } from "../stores/timeline-states";

export function getTimelines(timelines: ITimeline[], pixelBased = false) {
  return timelines.filter((timeline) => !!timeline.pixelBased === pixelBased);
}

export async function setUrlRequestParam(id: string, value: string, url: URL) {
  let query = new URLSearchParams(url.searchParams.toString());
  query.set(id, value);
  return goto(`?${query.toString()}`);
}

export function getTimelineState(
  timelineStatesStore: TimelineStatesStore,
  timelineId: string,
  pixelMode: boolean
) {
  const timelineStates =
    timelineStatesStore[pixelMode ? "pixelTimelineStates" : "timelineStates"] ??
    {};

  return timelineStates[timelineId];
}

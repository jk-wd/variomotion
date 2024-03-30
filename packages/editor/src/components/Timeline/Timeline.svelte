<script lang="ts">
  import {
    getAnimationEntriesForTimeline,
    getSequenceEntriesForTimeline,
    getTimelineById,
    isSequenceEntry,
    type IAnimationData,
    type IEntry,
    type ITimeline,
    type IActiveBreakpoint,
  } from "@variomotion/core";
  import { animationData } from "../../stores/animation-data-store";
  import {
    selectedTimelineId,
    pixelTimelineMode,
    activeBreakpoint,
  } from "../../stores/ui-state-store";

  import TimelineTop from "../TimelineTop/TimelineTop.svelte";
  import TimelineEntry from "../TimelineEntry/TimelineEntry.svelte";
  import TimelineFrames from "../EntryFrames/EntryFrames.svelte";

  import SequenceFrames from "../SequenceFrames/SequenceFrames.svelte";
  import { derived } from "svelte/store";
  import FrameNumbers from "../FrameNumbers/FrameNumbers.svelte";

  let timeline: ITimeline | undefined = undefined;

  const state = derived(
    [animationData, selectedTimelineId, pixelTimelineMode],
    ([$animationData, $selectedTimelineId]) => {
      return {
        animationData: $animationData,
        selectedTimelineId: $selectedTimelineId,
      };
    }
  );
  state.subscribe(({ animationData, selectedTimelineId }) => {
    if (selectedTimelineId) {
      timeline = getTimelineById(animationData, selectedTimelineId);
    } else {
      timeline = undefined;
    }
  });

  function getEntriesLocal(
    timelineId: string,
    animationData: IAnimationData
  ): IEntry[] {
    const animationEntries = getAnimationEntriesForTimeline(
      animationData,
      timelineId
    );
    const sequenceEntries = getSequenceEntriesForTimeline(
      animationData,
      timelineId
    );
    const entries = [...(animationEntries ?? []), ...(sequenceEntries ?? [])];
    return entries ?? [];
  }

  function isEntryActive(
    entry: IEntry,
    activeBreakpoint: IActiveBreakpoint | undefined
  ) {
    if (
      !entry.activeOnBreakpoints ||
      !activeBreakpoint ||
      entry.activeOnBreakpoints.length === 0
    ) {
      return true;
    }

    return entry.activeOnBreakpoints.includes(activeBreakpoint.id);
  }
</script>

<div class="timeline">
  <div class="timeline-items">
    {#if timeline}
      <div class="timeline-inner">
        <div class="top">
          <TimelineTop {timeline} />
        </div>

        <div class="animation-entries">
          <div class="names">
            {#each getEntriesLocal(timeline.id, $animationData) as entry}
              <TimelineEntry
                isSequenceEntry={isSequenceEntry(entry)}
                {entry}
                timelineId={timeline.id}
              />
            {/each}
          </div>
          <div class="frame-numbers">
            <FrameNumbers timelineId={timeline.id} />
          </div>
          <div class="frames">
            {#each getEntriesLocal(timeline.id, $animationData) as entry, index}
              {#if isSequenceEntry(entry)}
                <SequenceFrames timelineId={timeline.id} {entry} />
              {:else}
                <TimelineFrames
                  active={isEntryActive(entry, $activeBreakpoint)}
                  timelineId={timeline.id}
                  {entry}
                />
              {/if}
            {/each}
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .top {
    position: sticky;
    top: 0;
    left: 0;
    z-index: 12;
  }
  .frame-numbers {
    position: absolute;
    left: 203px;
  }
  .timeline {
    font-size: 14px;
    position: absolute;
    bottom: 0;
    width: 100vw;
    height: 22vh;
    display: flex;
    flex-direction: column;
    background-color: var(--color-grey-2);
  }

  .animation-entries {
    display: flex;
  }
  .animation-entries .names {
    width: 200px;
    padding-top: 24px;
  }
  .animation-entries .frames {
    width: 100%;
    overflow: hidden;
    padding-bottom: 10px;
    padding-top: 24px;
  }

  .timeline-items {
    overflow: auto;
    background-color: var(--color-white);
    min-height: 22vh;
  }
</style>

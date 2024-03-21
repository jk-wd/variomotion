<script lang="ts">
  import { editEntry, type ISequenceEntry } from "@variomotion/core";
  import {
    timelineValuePerPixel,
    selectedFrame,
  } from "../../stores/ui-state-store";

  import Frames from "../Frames/Frames.svelte";
  
  import { setTimelineProgress } from "@variomotion/editor-connect";
  import { animationData } from "../../stores/animation-data-store";
  

  export let entry: ISequenceEntry;
  export let timelineId: string = "";

  function frames(entry: ISequenceEntry) {
    return [entry.framePositionValue];
  }

  function frameSize(entry: ISequenceEntry) {
    return [entry.sequenceCount * (entry.interval - 1)];
  }
  
  let entryTimeline: HTMLButtonElement | null = null;


  function timelineClick(event: any) {
    if (!entryTimeline) {
      return;
    }
    const relativeMousePos = Math.max(
      event.clientX - entryTimeline.getBoundingClientRect().left,
      0
    );
    
    setTimelineProgress(timelineId, relativeMousePos * $timelineValuePerPixel);
  }
</script>

<div class="timeline-frames">
  <button
    class="entry-timeline"
    role="button"
    tabindex="0"
    bind:this={entryTimeline}
    on:mousemove={timelineClick}
  >
    <Frames
      frameColor="var(--color-orange)"
      selectedFrame={$selectedFrame?.entryId === entry.id
        ? $selectedFrame?.index
        : undefined}
      on:frameMoved={(event) => {
        if (!$animationData) {
          return;
        }

        $animationData = editEntry($animationData, {
          ...entry,
          framePositionValue: event.detail.value,
        });
      }}
      frames={frames(entry)}
      frameSizes={frameSize(entry)}
    ></Frames>
  </button>
</div>

<style>
  .timeline-frames {
    position: relative;
    display: flex;
    flex-direction: row;
    height: 22px;
    padding-left: 3px;
  }

  .entry-timeline {
    width: 100%;
    position: relative;
  }
</style>

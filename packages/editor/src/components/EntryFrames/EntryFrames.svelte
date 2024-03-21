<script lang="ts">
  import {
    addFrame,
    editFrame,
    type IAnimationEntry,
    type IFrameDef,
  } from "@variomotion/core";
  import { animationData } from "../../stores/animation-data-store";
  import {
    pixelTimelineMode,
    selectedFrame,
    transformMode,
    timelineValuePerPixel,
  } from "../../stores/ui-state-store";

  import Frames from "../Frames/Frames.svelte";

  import { pauseTimeline } from "@variomotion/editor-connect";

  export let entry: IAnimationEntry;
  export let timelineId: string = "";
  export let active: boolean = true;

  function frames(entry: IAnimationEntry) {
    return entry.frames.map((frame: IFrameDef) => frame.framePositionValue);
  }

  let entryTimeline: HTMLButtonElement | null = null;

  function onMouseMoveTimeline(event: any) {
    if (!entryTimeline || $selectedFrame) {
      return;
    }
    const relativeMousePos = Math.max(
      event.clientX - entryTimeline.getBoundingClientRect().left,
      0
    );

    const progress = relativeMousePos * $timelineValuePerPixel;
    pauseTimeline(timelineId, progress);
  }
</script>

<div class={`timeline-frames`}>
  {#if !active}
    <div class={`inactive-overlay`}></div>
  {/if}
  <button
    class="entry-timeline"
    role="button"
    tabindex="0"
    bind:this={entryTimeline}
    on:click={onMouseMoveTimeline}
  >
    <Frames
      selectedFrame={$selectedFrame?.entryId === entry.id
        ? $selectedFrame?.index
        : undefined}
      on:frameMoved={(event) => {
        if (!$animationData) {
          return;
        }
        $animationData = editFrame(
          $animationData,
          entry.id,
          {
            ...entry.frames[event.detail.index],
            framePositionValue: event.detail.value,
          },
          event.detail.index
        );
      }}
      on:framedeselected={() => {
        $selectedFrame = null;
      }}
      on:frameselected={(event) => {
        pauseTimeline(
          timelineId,
          entry.frames[event.detail].framePositionValue
        );
        $selectedFrame = {
          timelineId,
          entryId: entry.id,
          index: event.detail,
        };
      }}
      on:dbclick={(event) => {
        if (!$animationData) {
          return;
        }
        const previousFrame = entry.frames[entry.frames.length - 1];

        $animationData = addFrame($animationData, entry.id, {
          framePositionValue: event.detail,
          frameUnit: $pixelTimelineMode ? "px" : "ms",
          valueDef: previousFrame ? { ...previousFrame.valueDef } : {},
        });
      }}
      frames={frames(entry)}
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
  .inactive {
    opacity: 0.2;
  }

  .inactive-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10;
    background-color: rgba(255, 255, 255, 0.5);
  }
  .entry-timeline {
    width: 100%;
    position: relative;
  }
</style>

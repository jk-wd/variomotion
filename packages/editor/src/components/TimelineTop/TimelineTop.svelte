<script lang="ts">
  import {
    deleteTimeline,
    getBreakpointById,
    type ITimeline,
    type IBreakpoint,
  } from "@variomotion/core";
  import { animationData } from "../../stores/animation-data-store";
  import {
    activePopup,
    pixelTimelineMode,
    selectedFrame,
    timelineValuePerPixel,
    transformMode,
  } from "../../stores/ui-state-store";
  import { getTimelineState, setUrlRequestParam } from "$lib/helpers";
  import Button from "../Button/Button.svelte";
  import { page } from "$app/stores";
  import Icon from "@iconify/svelte";
  import { timelineStates } from "../../stores/timeline-states";
  import { pauseTimeline, playTimeline } from "@variomotion/editor-connect";
  import BreakpointDot from "../BreakpointDot/BreakpointDot.svelte";

  export let timeline: ITimeline;

  let playing: boolean | undefined = false;
  let progress: number = 0;

  timelineStates.subscribe((timelineStatesStore) => {
    const timelineState = getTimelineState(
      timelineStatesStore,
      timeline.id,
      $pixelTimelineMode
    );
    if (!timeline || !timelineState) {
      return;
    }

    playing = !timelineState.pause;
    progress = timelineState.progress ?? 0;
  });

  function getBreakpoints(timeline: ITimeline) {
    return (timeline.activeOnBreakpoints ?? []).map((breakpointId: string) => {
      return getBreakpointById($animationData, breakpointId);
    });
  }

  function getProgressUnit() {
    if ($pixelTimelineMode) {
      return "px";
    }
    return "ms";
  }

  let interval: any;
</script>

<div class="timeline-top">
  <div class="title">{timeline.id}</div>

  {#each getBreakpoints(timeline) as breakpoint}
    &nbsp;
    <BreakpointDot breakpointColor={breakpoint?.color} />
  {/each}

  <button
    class="icon-button"
    on:click={async () => {
      await setUrlRequestParam("edittimelineid", timeline.id, $page.url);
      $activePopup = "edit-timeline";
    }}
  >
    <Icon
      style="width: 20px; height: 20px;"
      icon="material-symbols-light:edit-square-outline-rounded"
    />
  </button>
  <button
    class="icon-button"
    on:click={() => {
      $animationData = deleteTimeline($animationData, timeline.id);
    }}
  >
    <Icon
      style="width: 20px; height: 20px;"
      color="#ff0000"
      icon="material-symbols-light:delete-outline"
    />
  </button>
  <button
    class="icon-button icon-button-zoom"
    on:mousedown={() => {
      interval = setInterval(() => {
        $timelineValuePerPixel -= 1;
        $timelineValuePerPixel = Math.max(1, $timelineValuePerPixel);
      }, 70);
    }}
    on:mouseup={() => {
      clearInterval(interval);
    }}
  >
    <Icon
      style="width: 20px; height: 20px;"
      icon="material-symbols-light:zoom-in"
    />
    <span>zoom in</span>
  </button>

  <button
    class="icon-button icon-button-zoom"
    on:mousedown={() => {
      interval = setInterval(() => {
        $timelineValuePerPixel += 1;
      }, 70);
    }}
    on:mouseup={() => {
      clearInterval(interval);
    }}
  >
    <Icon
      style="width: 20px; height: 20px;"
      icon="material-symbols-light:zoom-out"
    />
    <span>zoom out</span>
  </button>

  <div class="content-right">
    <div class="progress">{Math.round(progress)} {getProgressUnit()}</div>
    {#if !$pixelTimelineMode}
      {#if playing}
        <button
          class="pause-button control-button"
          on:click={async () => {
            $selectedFrame = null;
            pauseTimeline(timeline.id);
          }}
        >
          <span>pause</span>
          <Icon
            style="width: 24px; height: 24px; float: right;"
            icon="material-symbols-light:pause-circle-outline"
          />
        </button>
      {:else}
        <button
          class="play-button control-button"
          on:click={async () => {
            $selectedFrame = null;
            playTimeline(timeline.id);
          }}
        >
          <span>play</span>
          <Icon
            style="width: 24px; height: 24px; float: right;"
            icon="material-symbols-light:play-arrow-outline-rounded"
          />
        </button>
      {/if}
      <button
        class="restart-button control-button"
        on:click={async () => {
          $selectedFrame = null;
          $transformMode = "off";
          playTimeline(timeline.id, 0);
        }}
      >
        <span>restart</span>
        <Icon
          style="width: 24px; height: 24px; float: right;"
          icon="material-symbols-light:restart-alt"
        />
      </button>
    {/if}
  </div>
  <div class="add-entry">
    <Button
      variant="tiny"
      on:click={async () => {
        await setUrlRequestParam("edittimelineid", timeline.id, $page.url);
        $activePopup = "add-animation-entry";
      }}>Add enimation entry</Button
    >
  </div>
  <div class="add-entry">
    <Button
      variant="tiny"
      on:click={async () => {
        await setUrlRequestParam("edittimelineid", timeline.id, $page.url);
        $activePopup = "add-sequence-entry";
      }}>Add sequence entry</Button
    >
  </div>
</div>

<style>
  .add-entry {
    margin-left: 5px;
  }
  .progress {
    font-size: 12px;
    font-family: "ProximaNova-Regular";
    margin: 6px 10px 0 0;
    float: left;
  }
  .control-button > span {
    padding-right: 1px;
    font-size: 14px;
    position: relative;
    top: 3px;
    font-family: "ProximaNova-Regular";
  }
  .control-button {
    display: inline-block;
  }
  .content-right {
    margin-left: auto;
  }
  .icon-button {
    margin-left: 6px;
    position: relative;
    top: -1px;
    display: flex;
  }
  .icon-button > span {
    font-size: 12px;
    padding-top: 2px;
  }
  .title {
    font-size: 14px;
    font-family: "ProximaNova-Bold";
  }
  .timeline-top {
    font-size: 16px;
    top: 0;
    left: 0;
    padding: 4px 10px;
    background-color: var(--color-grey-1);
    border-bottom: 1px solid var(--color-grey-2);
    border-top: 1px solid var(--color-grey-2);
    width: 100%;
    display: flex;
    align-items: center;
  }
  .icon-button-zoom {
    position: relative;
    top: 1px;
  }
</style>

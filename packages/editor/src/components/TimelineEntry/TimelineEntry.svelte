<script lang="ts">
  import {
    addFrame,
    deleteEntry,
    getBreakpointById,
    type IAnimationEntry,
  } from "@variomotion/core";
  import { animationData } from "../../stores/animation-data-store";
  import { activePopup, pixelTimelineMode } from "../../stores/ui-state-store";
  import { getTimelineState, setUrlRequestParam } from "$lib/helpers";

  import { page } from "$app/stores";

  import Icon from "@iconify/svelte";
  import BreakpointDot from "../BreakpointDot/BreakpointDot.svelte";
  import { timelineStates } from "../../stores/timeline-states";
  export let isSequenceEntry = false;
  export let entry: IAnimationEntry;
  export let timelineId: string;

  let playing: boolean | undefined = false;
  let progress: number = 0;

  console.log(timelineId);
  timelineStates.subscribe((timelineStatesStore) => {
    const timelineState = getTimelineState(
      timelineStatesStore,
      timelineId,
      $pixelTimelineMode
    );
    if (!timelineId || !timelineState) {
      return;
    }

    playing = !timelineState.pause;
    progress = timelineState.progress ?? 0;
  });

  function getBreakpoints(entry: IAnimationEntry) {
    return (entry.activeOnBreakpoints ?? []).map((breakpointId: string) => {
      return getBreakpointById($animationData, breakpointId);
    });
  }
</script>

<div class="entry">
  <div class="entry-name">
    <span>
      {#each getBreakpoints(entry) as breakpoint}
        <BreakpointDot breakpointColor={breakpoint?.color} />
      {/each}
      {entry.name}
    </span>
    <div class="entry-buttons">
      <button
        class="entry-icon-button"
        on:click={() => {
          $animationData = deleteEntry($animationData, entry.id);
        }}
      >
        <Icon
          style="width: 16px; height: 16px;"
          color="#ff0000"
          icon="material-symbols-light:delete-outline"
        />
      </button>
      <button
        class="entry-icon-button"
        on:click={async () => {
          await setUrlRequestParam("entryid", entry.id, $page.url);
          if (isSequenceEntry) {
            $activePopup = "edit-sequence-entry";
          } else {
            $activePopup = "edit-animation-entry";
          }
        }}
      >
        <Icon
          style="width: 16px; height: 16px;"
          icon="material-symbols-light:edit-square-outline-rounded"
        />
      </button>

      <button
        class={`entry-icon-button ${playing ? "disabled" : ""}`}
        on:click={() => {
          if (!playing) {
            $animationData = addFrame($animationData, entry.id, {
              framePositionValue: progress,
              frameUnit: $pixelTimelineMode ? "px" : "ms",
              valueDef: {},
            });
          }
        }}
      >
        <Icon
          style="width: 16px; height: 16px;"
          icon="material-symbols-light:target"
        />
      </button>
    </div>
  </div>
</div>

<style>
  .entry-buttons {
    position: absolute;
    top: 0;
    right: 6px;
  }
  .entry {
    display: flex;
    flex-direction: row;
    height: 22px;
  }

  .entry-icon-button {
    margin-left: 3px;
    position: relative;
    top: 3px;
  }
  .entry-icon-button.disabled {
    opacity: 0.5;
  }
  .entry-name > span {
    display: inline-block;
    width: 144px;
    border-radius: 5px;
    padding: 1px 4px 4px 4px;
    text-wrap: nowrap;
  }
  .entry-name {
    position: relative;
    font-size: 12px;
    padding: 4px 4px 4px 10px;
    width: 200px;
    overflow: hidden;
  }
</style>

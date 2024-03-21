<script lang="ts">
  import { timelineValuePerPixel } from "../../stores/ui-state-store";
  import { timelineStates } from "../../stores/timeline-states";
  import { getTimelineState } from "$lib/helpers";
  import { pixelTimelineMode } from "../../stores/ui-state-store";
  import { pauseTimeline } from "@variomotion/editor-connect";

  export let duration = 1000000;
  export let timelineId: string = "";
  let paused: boolean | undefined = false;
  let progress = 0;
  let dragging = false;
  let positionDiv: HTMLDivElement | undefined = undefined;

  timelineStates.subscribe((timelineStatesStore) => {
    const timelineState = getTimelineState(
      timelineStatesStore,
      timelineId,
      $pixelTimelineMode
    );
    if (!timelineState || dragging) {
      return;
    }

    progress = timelineState.progress ?? 0;
    paused = timelineState.pause;
  });

  const dragPosition = () => {
    let dragPos1 = 0;
    let dragPos2 = 0;

    let framePositionStart = 0;

    function elementDrag(event: any) {
      dragging = true;
      if (!positionDiv) {
        return;
      }
      // calculate the new cursor position:
      dragPos1 = dragPos2 - event.clientX;
      dragPos2 = event.clientX;

      const newPosition = Math.max(positionDiv.offsetLeft - dragPos1, 0);
      positionDiv.style.left = newPosition + "px";
      if (newPosition !== getPosition(progress)) {
        pauseTimeline(timelineId, newPosition * $timelineValuePerPixel, true);
      }
    }

    function closeDragElement() {
      dragging = false;
      // stop moving when mouse button is released:
      document.onmouseup = null;
      document.onmousemove = null;
    }

    return (event: any) => {
      framePositionStart = getPosition(progress);
      dragPos2 = event.clientX;

      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
    };
  };

  const numberOfPixels: number = Math.round(duration / $timelineValuePerPixel);

  function getPosition(progress: number) {
    return Math.round(progress / $timelineValuePerPixel);
  }
</script>

<div class="frame-numbers" style={`width:${numberOfPixels + 50}px`}>
  {#each { length: numberOfPixels } as _, i}
    {#if i === 0}
      <div class="step">0</div>
    {/if}
    {#if (i + 1) % 50 === 0}
      <div class="step">{(i + 1) * $timelineValuePerPixel}</div>
    {/if}
  {/each}
  <div
    bind:this={positionDiv}
    class="position"
    style={`left:${getPosition(progress)}px`}
  >
    <div
      class={`arrow ${dragging ? "dragging" : ""}`}
      on:mousedown|preventDefault|stopPropagation={dragPosition()}
    ></div>
  </div>
</div>

<style>
  .position {
    position: absolute;
    top: 3px;
    left: 0;
    width: 1px;
    height: 6000px;
    background-color: var(--color-grey-4);
    opacity: 1;
  }
  .frame-numbers {
    z-index: 11;
    background-color: rgba(255, 255, 255, 1);
    padding-top: 10px;
    width: 100%;
    white-space: nowrap;
    position: absolute;
    text-align: left;
    left: 0;
  }
  .arrow:hover,
  .arrow.dragging {
    background-color: var(--color-green);
  }
  .arrow {
    display: block;
    position: absolute;
    top: 0px;
    left: -4px;
    width: 10px;
    height: 6px;
    background-color: var(--color-orange);
  }
  .arrow:hover:after,
  .arrow.dragging:after {
    border-left: 3px solid var(--color-green);
  }
  .arrow:after {
    content: "";
    display: block;
    position: absolute;
    top: 0;
    right: -3px;
    width: 0;
    height: 0;
    border-top: 3px solid transparent;
    border-bottom: 3px solid transparent;
    border-left: 3px solid var(--color-orange);
  }
  .arrow:hover:before,
  .arrow.dragging:before {
    border-right: 3px solid var(--color-green);
  }
  .arrow:before {
    content: "";
    display: block;
    position: absolute;
    top: 0px;
    left: -3px;
    width: 0;
    height: 0;
    border-top: 3px solid transparent;
    border-bottom: 3px solid transparent;
    border-right: 3px solid var(--color-orange);
  }
  .step {
    z-index: 12;
    padding-top: 4px;
    position: relative;
    width: 50px;
    float: left;
    font-size: 10px;
    padding-left: 5px;
  }
  .step::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 1px;
    height: 6000px;
    opacity: 0.3;
    background-color: var(--color-grey-4);
  }
</style>

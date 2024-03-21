<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { timelineValuePerPixel } from "../../stores/ui-state-store";
  import Frame from "../Frame/Frame.svelte";

  const dispatch = createEventDispatcher();

  export let duration = 10000000;
  const numberOfPixels: number = Math.round(duration / $timelineValuePerPixel);

  export let frameSizes: number[] = [];
  export let frameColor = `var(--color-blue)`;

  export let frames: number[] = [];

  export let selectedFrame: number | undefined = undefined;
  export let hoverFrame: number | undefined = undefined;

  let framesLineHtmlelement: HTMLElement | undefined = undefined;
  function addFrameDbClick(event: any) {
    if (!framesLineHtmlelement) {
      return;
    }

    dispatch(
      "dbclick",
      (event.clientX - framesLineHtmlelement.getBoundingClientRect().left) *
        $timelineValuePerPixel
    );
  }
</script>

<div class="frames" style={`width:${numberOfPixels + 50}px`}>
  <div
    bind:this={framesLineHtmlelement}
    class="frame-line"
    role="button"
    tabindex="0"
    on:dblclick={addFrameDbClick}
  >
    {#each frames as frame, i}
      <Frame
        {frame}
        selected={selectedFrame === i}
        frameSize={frameSizes[i]}
        on:frameselected={() => {
          dispatch("frameselected", i);
        }}
        on:frameMoved={(e) => {
          dispatch("frameMoved", {
            index: i,
            value: e.detail,
          });
        }}
      />
    {/each}
  </div>
</div>

<style>
  .frame-line {
    z-index: 11;
    position: relative;
    width: 100%;
    height: 12px;
  }
  .frame-line:before {
    content: "";
    position: absolute;
    width: 100%;
    height: 1px;
    top: 50%;
    left: 0;
    background-color: var(--color-grey-1);
  }

  .frames {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
    position: relative;
    left: -1px;
  }
</style>

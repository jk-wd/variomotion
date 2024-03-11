<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { timelineValuePerPixel } from "../../stores/ui-state-store";

  const dispatch = createEventDispatcher();

  export let duration = 10000000;
  const numberOfPixels: number = Math.round(duration / $timelineValuePerPixel);

  export let frameSizes: number[] = [];
  export let frameColor = `var(--color-blue)`;

  export let frames: number[] = [];
  export let progress: number = 0;
  export let selectedFrame: number | undefined = undefined;
  export let hoverFrame: number | undefined = undefined;

  const dragFrame = (index: number) => {
    let dragPos1 = 0;
    let dragPos2 = 0;

    let framePositionStart = 0;
    let frameDragTarget: undefined | HTMLElement = undefined;

    function elementDrag(event: any) {
      if (!frameDragTarget) {
        return;
      }
      // calculate the new cursor position:
      dragPos1 = dragPos2 - event.clientX;
      dragPos2 = event.clientX;

      const newPosition = Math.max(frameDragTarget.offsetLeft - dragPos1, 0);
      frameDragTarget.style.left = newPosition + "px";
      if (newPosition !== frames[index]) {
        frames[index] = newPosition * $timelineValuePerPixel;
      }
    }

    function closeDragElement() {
      // stop moving when mouse button is released:
      document.onmouseup = null;
      document.onmousemove = null;

      if (framePositionStart === frames[index]) {
        selectedFrame = selectedFrame === index ? undefined : index;
        dispatch("frameselected", selectedFrame);
      } else {
        dispatch("frameMoved", { index, value: frames[index] });
      }
    }

    return (event: any) => {
      framePositionStart = frames[index];
      dragPos2 = event.clientX;
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
      frameDragTarget = event.target;
    };
  };
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
  function frameSizeStyle(index: number) {
    if (!frameSizes[index]) {
      return "";
    }
    return `width:${frameSizes[index] / $timelineValuePerPixel + 6}px;`;
  }
</script>

<div class="frames" style={`width:${numberOfPixels + 50}px`}>
  <div
    class="position"
    style={`left:${Math.round(progress / $timelineValuePerPixel)}px`}
  ></div>
  <div
    bind:this={framesLineHtmlelement}
    class="frame-line"
    role="button"
    tabindex="0"
    on:dblclick={addFrameDbClick}
  >
    {#each frames as frame, i}
      <button
        class={`frame ${i === selectedFrame ? "selected" : ""}`}
        style={`left:${frame / $timelineValuePerPixel}px; ${frameSizeStyle(
          i
        )} background-color:${
          i === selectedFrame
            ? "orange"
            : i === hoverFrame
              ? "var(--color-black)"
              : frameColor
        }`}
        on:mousedown|preventDefault|stopPropagation={dragFrame(i)}
        on:mouseover={() => {
          hoverFrame = i;
        }}
        on:mouseout={() => {
          hoverFrame = undefined;
        }}
      ></button>
    {/each}
  </div>
</div>

<style>
  .position {
    position: absolute;
    top: 4px;
    left: 0;
    width: 1px;
    height: 22px;
    background-color: var(--color-grey-4);
    opacity: 1;
  }

  .frame-line {
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
  }
  .frame {
    display: block;
    position: absolute;
    top: 3px;
    width: 8px;
    height: 8px;
    transform: translateX(-3px);
    border-radius: 4px;
    background-color: var(--color-blue);
  }
  .frame.selected {
    background-color: var(--color-orange);
  }
</style>

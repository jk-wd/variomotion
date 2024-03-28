<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { timelineValuePerPixel } from "../../stores/ui-state-store";

  export let frame: number = 0;
  export let frameSize: number = 0;
  export let dragable: boolean = true;

  export let selected: boolean = false;

  const dispatch = createEventDispatcher();
  const dragFrame = () => {
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
      if (newPosition !== frame && dragable) {
        frame = newPosition * $timelineValuePerPixel;
      }
    }

    function closeDragElement() {
      // stop moving when mouse button is released:
      document.onmouseup = null;
      document.onmousemove = null;

      if (framePositionStart === frame) {
        dispatch("frameselected", frame);
      } else {
        dispatch("frameMoved", frame);
      }
    }

    return (event: any) => {
      framePositionStart = frame;
      dragPos2 = event.clientX;
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
      frameDragTarget = event.target;
    };
  };

  function frameSizeStyle() {
    if (!frameSize) {
      return "";
    }
    return `width:${frameSize / $timelineValuePerPixel + 6}px;`;
  }
</script>

<button
  class={`frame ${selected ? "selected" : ""} ${!dragable ? "drag-disabled" : ""} ${frameSize ? "sized" : ""}`}
  style={`left:${frame / $timelineValuePerPixel}px; ${frameSizeStyle()}`}
  on:mousedown|preventDefault|stopPropagation={dragFrame()}
  on:mouseover
  on:blur
  on:mouseout
  on:focus
></button>

<style>
  .frame {
    display: block;
    position: absolute;
    top: 3px;
    width: 10px;
    height: 10px;
    transform: translateX(-3px);
    border-radius: 5px;
    background-color: var(--color-blue);
    border: 1px solid var(--color-grey-1);
  }
  .frame.drag-disabled {
    background-color: var(--color-grey-3);
  }
  .frame.sized {
    background-color: var(--color-pink);
  }

  .frame:hover {
    background-color: var(--color-black);
  }
  .frame.selected {
    background-color: var(--color-orange);
  }
</style>

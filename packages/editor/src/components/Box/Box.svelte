<script lang="ts">
  import BoxContent from "./BoxContent.svelte";

  let boxDragTarget: undefined | HTMLElement = undefined;
  let moving = false;
  let posX = 0;
  let posY = 0;
  const dragBox = () => {
    let dragPos1X = 0;
    let dragPos2X = 0;
    let dragPos1Y = 0;
    let dragPos2Y = 0;
    let currentPosX = 0;
    let currentPosY = 0;

    function elementDrag(event: any) {
      if (!boxDragTarget) {
        return;
      }

      // calculate the new cursor position:
      dragPos1X = dragPos2X - event.clientX;
      dragPos1Y = dragPos2Y - event.clientY;
      currentPosX = posX - dragPos1X;
      currentPosY = posY - dragPos1Y;
      boxDragTarget.style.transform = `translate(${currentPosX}px, ${currentPosY}px)`;
    }

    function closeDragElement() {
      moving = false;
      posX = currentPosX;
      posY = currentPosY;
      // stop moving when mouse button is released:
      document.onmouseup = null;
      document.onmousemove = null;
    }

    return (event: any) => {
      dragPos2X = event.clientX;
      dragPos2Y = event.clientY;
      moving = true;
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
    };
  };
</script>

<div
  bind:this={boxDragTarget}
  id="box"
  class={`box ${moving ? "moving" : ""}`}
  on:mousedown={dragBox()}
>
  <slot />
</div>

<style>
  .box {
    position: relative;
    padding: 6px 8px;
    background-color: var(--color-grey-1);
    border-radius: 8px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }
  .box.moving::after {
    content: "";
    width: 20000px;
    height: 20000px;
    position: absolute;
    top: -10000px;
    left: -10000px;
  }
</style>

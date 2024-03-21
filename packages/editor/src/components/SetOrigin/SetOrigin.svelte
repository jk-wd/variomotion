<script lang="ts">
  import type { Dimension, Point } from "@variomotion/transform";
  import NumberInput from "../Input/NumberInput.svelte";
  import { createEventDispatcher } from "svelte";

  export let origin: Point = { x: 0, y: 0 };
  export let dimensions: Dimension = { width: -1, height: -1 };

  function isSetOriginButtonSelected(x: number, y: number, origin: Point) {
    return x === origin.x && y === origin.y;
  }
  const dispatch = createEventDispatcher();
  function originChanged() {
    dispatch("originChanged", origin);
  }
</script>

<div>
  <div class="origin-box">
    <button
      class={`origin-button ${
        isSetOriginButtonSelected(0, 0, origin) ? "selected" : ""
      }`}
      on:click={() => {
        origin = { x: 0, y: 0 };
        originChanged();
      }}
      style="position: absolute; top: -6px; left: -6px;"
    ></button>
    <button
      class={`origin-button ${
        isSetOriginButtonSelected(0, dimensions.height, origin)
          ? "selected"
          : ""
      }`}
      on:click={() => {
        origin = { x: 0, y: dimensions.height };
        originChanged();
      }}
      style="position: absolute; bottom: -6px; left: -6px;"
    ></button>

    <button
      class={`origin-button ${
        isSetOriginButtonSelected(dimensions.width, dimensions.height, origin)
          ? "selected"
          : ""
      }`}
      on:click={() => {
        origin = { x: dimensions.width, y: dimensions.height };
        originChanged();
      }}
      style="position: absolute; bottom: -6px; right: -6px;"
    ></button>
    <button
      class={`origin-button ${
        isSetOriginButtonSelected(dimensions.width, 0, origin) ? "selected" : ""
      }`}
      on:click={() => {
        origin = { x: dimensions.width, y: 0 };
        originChanged();
      }}
      style="position: absolute; top: -6px; right: -6px;"
    ></button>

    <button
      class={`origin-button ${
        isSetOriginButtonSelected(
          dimensions.width,
          dimensions.height / 2,
          origin
        )
          ? "selected"
          : ""
      }`}
      on:click={() => {
        origin = { x: dimensions.width, y: dimensions.height / 2 };
        originChanged();
      }}
      style="position: absolute; top: 34px; right: -6px;"
    ></button>
    <button
      class={`origin-button ${
        isSetOriginButtonSelected(0, dimensions.height / 2, origin)
          ? "selected"
          : ""
      }`}
      on:click={() => {
        origin = { x: 0, y: dimensions.height / 2 };
        originChanged();
      }}
      style="position: absolute; top: 34px; left: -6px;"
    ></button>

    <button
      class={`origin-button ${
        isSetOriginButtonSelected(dimensions.width / 2, 0, origin)
          ? "selected"
          : ""
      }`}
      on:click={() => {
        origin = { x: dimensions.width / 2, y: 0 };
        originChanged();
      }}
      style="position: absolute; top: -6px; left: 34px"
    ></button>
    <button
      class={`origin-button ${
        isSetOriginButtonSelected(
          dimensions.width / 2,
          dimensions.height,
          origin
        )
          ? "selected"
          : ""
      }`}
      on:click={() => {
        origin = { x: dimensions.width / 2, y: dimensions.width };
        originChanged();
      }}
      style="position: absolute; bottom: -6px; left: 34px"
    ></button>
    <button
      class={`origin-button ${
        isSetOriginButtonSelected(
          dimensions.width / 2,
          dimensions.height / 2,
          origin
        )
          ? "selected"
          : ""
      }`}
      on:click={() => {
        origin = { x: dimensions.width / 2, y: dimensions.height / 2 };
        originChanged();
      }}
      style="position: absolute; bottom: 34px; left: 34px"
    ></button>
  </div>
  <div class="number-input-wrapper">
    <div>
      <NumberInput on:input={originChanged} bind:value={origin.x} />
    </div>
    <div>
      <NumberInput on:input={originChanged} bind:value={origin.y} />
    </div>
  </div>
</div>

<style>
  .number-input-wrapper {
    display: flex;
    gap: 8px;
    padding-top: 22px;
  }
  .number-input-wrapper > div {
    width: 60px;
    border: 1px solid var(--color-grey-2);
    padding: 2px;
  }
  .origin-button {
    width: 12px;
    height: 12px;
    background-color: var(--color-grey-1);
    border: 1px solid var(--color-grey-4);
  }
  .origin-button.selected {
    background-color: var(--color-grey-4);
    border: 2px solid var(--color-grey-4);
  }
  .origin-box {
    margin: 0 auto;
    position: relative;
    width: 80px;
    height: 80px;
    border: 1px solid var(--color-grey-4);
  }
</style>

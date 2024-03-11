<script lang="ts">
  import { animationData } from "../../stores/animation-data-store";
  import {
    activePopup,
    selectedTimelineId,
    pixelTimelineMode,
  } from "../../stores/ui-state-store";
  import Box from "../Box/Box.svelte";
  import Button from "../Button/Button.svelte";
  import NumberInput from "../Input/NumberInput.svelte";
  import Popup from "../Popup/Popup.svelte";
  import Switch from "../Switch/Switch.svelte";
  import {
    addTimeline,
    type IAnimationData,
    type ITimeline,
  } from "@variomotion/core";

  let pixelBased = $pixelTimelineMode;
  let loop = false;
  let autoplay = false;
  let id = "";
  let startPixel: number = 0;

  function handleFormSubmit() {
    let timeline: ITimeline = {
      id,
      pixelBased,
      loop,
      autoplay,
      animationEntries: [],
      sequenceEntries: [],
      startPixel,
    };
    if (!pixelBased) {
      timeline = {
        ...timeline,
        loop,
        autoplay,
      };
    } else {
      timeline = {
        ...timeline,
        startPixel,
      };
    }
    $animationData = addTimeline(
      $animationData ?? ({} as IAnimationData),
      timeline
    );

    $pixelTimelineMode = pixelBased;
    $selectedTimelineId = id;
    $activePopup = null;
  }
</script>

<Popup>
  <h2>Add Timeline</h2>
  <form on:submit|preventDefault={handleFormSubmit}>
    <input type="text" name="name" bind:value={id} />
    <div class="switches">
      <Switch
        bind:checked={pixelBased}
        label="scroll animations"
        fontSize={14}
        design="slider"
        options={[true, false]}
      />
      {#if !pixelBased}
        <Switch
          bind:checked={loop}
          label="loop"
          fontSize={14}
          design="slider"
          options={[true, false]}
        />
        <Switch
          bind:checked={autoplay}
          label="autoplay"
          fontSize={14}
          design="slider"
          options={[true, false]}
        />
      {/if}
      {#if pixelBased}
        <label for="name">Startpixel</label>
        <NumberInput bind:value={startPixel} />
      {/if}
    </div>

    <Button type="submit">Add timelines</Button>
  </form>
</Popup>

<style>
  .switches {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 20px;
  }
</style>

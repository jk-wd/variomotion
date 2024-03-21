<script lang="ts">
  import { page } from "$app/stores";
  import { MultiSelect } from "svelte-multiselect";

  import { animationData } from "../../stores/animation-data-store";
  import {
    activePopup,
    selectedTimelineId,
    pixelTimelineMode,
  } from "../../stores/ui-state-store";
  import Box from "../Box/Box.svelte";
  import Button from "../Button/Button.svelte";
  import Popup from "../Popup/Popup.svelte";
  import Switch from "../Switch/Switch.svelte";
  import {
    editTimeline,
    getTimelineById,
    type IAnimationData,
    type IBreakPoint,
  } from "@variomotion/core";
  import NumberInput from "../Input/NumberInput.svelte";

  const timelineId = $page.url.searchParams.get("edittimelineid");
  const timeline = timelineId
    ? getTimelineById($animationData, timelineId)
    : undefined;

  function handleFormSubmit() {
    if (!timeline) {
      return;
    }

    $pixelTimelineMode = timeline.pixelBased;
    $selectedTimelineId = timeline.id;
    $activePopup = null;
    $animationData = editTimeline($animationData ?? ({} as IAnimationData), {
      ...timeline,
      activeOnBreakpoints: breakpointsSelected,
    });
  }

  let breakpoints: string[] = [];
  let breakpointsSelected: string[] = [];

  function getBreakpoints(animationData: IAnimationData) {
    return (animationData.breakpoints ?? []).map(
      (breakpoint: IBreakPoint) => breakpoint.id
    );
  }
  animationData.subscribe((data) => {
    if (!timeline) {
      return;
    }
    breakpoints = getBreakpoints(data);
    breakpointsSelected = (timeline.activeOnBreakpoints ?? []).map(
      (breakpoint: IBreakPoint) => breakpoint
    );
  });
</script>

<Popup>
  <h2>Edit Timeline</h2>
  {#if timeline}
    <form on:submit|preventDefault={handleFormSubmit}>
      <label for="name">Timeline name</label>
      <input type="text" name="name" bind:value={timeline.id} />
      <div class="multi-select">
        <MultiSelect
          placeholder="Breakpoints"
          bind:selected={breakpointsSelected}
          options={breakpoints}
        />
      </div>
      <div class="switches">
        <Switch
          bind:checked={timeline.pixelBased}
          label="scroll animations"
          fontSize={14}
          design="slider"
          options={[true, false]}
        />
        {#if !timeline.pixelBased}
          <Switch
            bind:checked={timeline.loop}
            label="loop"
            fontSize={14}
            design="slider"
            options={[true, false]}
          />
          <Switch
            bind:checked={timeline.autoplay}
            label="autoplay"
            fontSize={14}
            design="slider"
            options={[true, false]}
          />
        {/if}
        {#if timeline.pixelBased}
          <label for="name">Startpixel</label>
          <NumberInput bind:value={timeline.startPixel} />
        {/if}
      </div>

      <Button type="submit">Save</Button>
    </form>
  {/if}
</Popup>

<style>
  .multi-select {
    padding-bottom: 10px;
  }
  .switches {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 20px;
  }
</style>

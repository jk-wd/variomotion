<script lang="ts">
  import { page } from "$app/stores";
  import { animationData } from "../../stores/animation-data-store";
  import { domTargets } from "../../stores/dom-targets";
  import { activePopup } from "../../stores/ui-state-store";
  import MultiSelect from "svelte-multiselect";
  import Box from "../Box/Box.svelte";
  import Button from "../Button/Button.svelte";
  import Popup from "../Popup/Popup.svelte";
  import Switch from "../Switch/Switch.svelte";
  import {
    addEntry,
    connectTimelineEntry,
    uuidv4,
    type IAnimationData,
    type ISequenceEntry,
  } from "@variomotion/core";

  const timelineId = $page.url.searchParams.get("timelineid");

  let name: string | undefined;
  let framePositionValue: number = 0;
  let interval: number = 1;
  let sequenceCount: number = 1;

  let selectedDomTarget: string | undefined = undefined;
  function handleFormSubmit() {
    if (!timelineId) {
      return;
    }
    const id = uuidv4();
    $animationData = addEntry<ISequenceEntry>($animationData ?? {}, {
      id,
      domQuery: `[data-v~=\"${selectedDomTarget}\"]`,
      framePositionValue,
      interval,
      sequenceCount,
      name,
    });
    $animationData = connectTimelineEntry(
      $animationData,
      timelineId,
      id,
      "sequence"
    );
    $activePopup = null;
  }
</script>

<Popup>
  <h2>Add sequence entry</h2>
  <form on:submit|preventDefault={handleFormSubmit}>
    <input
      type="text"
      placeholder="Sequence name"
      name="name"
      bind:value={name}
    />
    <label for="framePositionValue">Frame position</label><br />
    <input
      type="number"
      name="framePositionValue"
      bind:value={framePositionValue}
    />
    <label for="interval">Frame interval</label><br />
    <input
      type="number"
      placeholder="Frame interval"
      name="interval"
      bind:value={interval}
    />
    <label for="frames">Number of frames</label><br />
    <input
      type="number"
      placeholder="Number of frames"
      name="frames"
      bind:value={sequenceCount}
    />
    <label for="domTarget">Add DOM target</label><br />
    <select bind:value={selectedDomTarget} name="domTarget">
      {#each $domTargets["sequence"] as target}
        <option value={target}>{target}</option>
      {/each}
    </select>

    <div class="button-container">
      <Button type="submit">Add sequence entry</Button>
    </div>
  </form>
</Popup>

<style>
  .button-container {
    padding-top: 22px;
  }
</style>

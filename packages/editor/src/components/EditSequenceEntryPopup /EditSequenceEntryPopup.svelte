<script lang="ts">
  import { page } from "$app/stores";
  import { animationData } from "../../stores/animation-data-store";
  import { domTargets } from "../../stores/dom-targets";
  import { activePopup } from "../../stores/ui-state-store";

  import Button from "../Button/Button.svelte";
  import Popup from "../Popup/Popup.svelte";

  import {
    type ISequenceEntry,
    type IEntry,
    editEntry,
  } from "@variomotion/core";

  const entryid = $page.url.searchParams.get("entryid");
  const entry = ($animationData.entries ?? []).find(
    (entry: IEntry) => entry.id === entryid
  ) as ISequenceEntry;

  let name: string | undefined = entry?.name;
  let framePositionValue: number = entry?.framePositionValue ?? 0;
  let interval: number = entry?.interval ?? 1;
  let sequenceCount: number = entry?.sequenceCount ?? 1;

  let selectedDomTarget: string | undefined = entry?.domQuery;
  function handleFormSubmit() {
    if (!entryid) {
      return;
    }

    $animationData = editEntry<ISequenceEntry>($animationData ?? {}, {
      ...entry,
      domQuery: `[data-v~=\"${selectedDomTarget}\"]`,
      framePositionValue,
      interval,
      sequenceCount,
      name,
    });
    $activePopup = null;
  }
</script>

<Popup>
  <h2>Edit sequence entry</h2>
  <form on:submit|preventDefault={handleFormSubmit}>
    <input
      type="text"
      placeholder="Sequence name"
      name="name"
      bind:value={entry.name}
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
      <Button type="submit">Edit sequence entry</Button>
    </div>
  </form>
</Popup>

<style>
  .button-container {
    padding-top: 22px;
  }
</style>

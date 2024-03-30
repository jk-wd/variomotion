<script lang="ts">
  import { page } from "$app/stores";
  import { animationData } from "../../stores/animation-data-store";
  import { domTargets } from "../../stores/dom-targets";
  import { activePopup, pixelTimelineMode } from "../../stores/ui-state-store";
  import MultiSelect from "svelte-multiselect";

  import Button from "../Button/Button.svelte";
  import Popup from "../Popup/Popup.svelte";

  import {
    addEntry,
    uuidv4,
    type IAnimationData,
    connectTimelineEntry,
    type IAnimationEntry,
    type IFrameDef,
  } from "@variomotion/core";

  const timelineId = $page.url.searchParams.get("edittimelineid");

  let name: string | undefined;
  const emptyFrame: IFrameDef = {
    frameUnit: $pixelTimelineMode ? "px" : "ms",
    framePositionValue: 0,
    valueDef: {},
  };

  function handleFormSubmit() {
    if (!timelineId) {
      return;
    }
    const id = uuidv4();
    $animationData = addEntry<IAnimationEntry>(
      $animationData ?? ({} as IAnimationData),
      {
        id,
        domQueries: selectedDomTargets.map(
          (target) => `[data-v~=\"${target}\"]`
        ),
        frames: [emptyFrame],
        name,
      }
    );
    $animationData = connectTimelineEntry(
      $animationData,
      timelineId,
      id,
      "animation"
    );
    $activePopup = null;
  }

  let selectedDomTargets: string[] = [];
</script>

<Popup>
  <h2>Add animation entry</h2>
  <form on:submit|preventDefault={handleFormSubmit}>
    <label for="domTargets">Add DOM targets</label><br />
    <div class="multi-select">
      <MultiSelect
        on:change={() => {
          if (name === undefined && selectedDomTargets.length === 1) {
            name = selectedDomTargets[0];
          }
        }}
        bind:selected={selectedDomTargets}
        options={$domTargets["regular"]}
      />
    </div>
    <label for="name (optional)">Entry name</label>
    <input type="text" name="name" bind:value={name} />
    <div class="button-container">
      <Button type="submit">Add animation entry</Button>
    </div>
  </form>
</Popup>

<style>
  .button-container {
    padding-top: 22px;
  }
  .multi-select {
    width: 400px;
  }
</style>

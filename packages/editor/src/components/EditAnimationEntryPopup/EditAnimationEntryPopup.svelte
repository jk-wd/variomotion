<script lang="ts">
  import { page } from "$app/stores";
  import { animationData } from "../../stores/animation-data-store";
  import { domTargets } from "../../stores/dom-targets";
  import { activePopup } from "../../stores/ui-state-store";
  import MultiSelect from "svelte-multiselect";
  import Button from "../Button/Button.svelte";
  import Popup from "../Popup/Popup.svelte";
  import {
    uuidv4,
    editEntry,
    type IAnimationEntry,
    type IAnimationData,
    type IBreakPoint,
    type IEntry,
  } from "@variomotion/core";

  const entryid = $page.url.searchParams.get("entryid");
  const entry = ($animationData.entries ?? []).find(
    (entry: IEntry) => entry.id === entryid
  );

  function handleFormSubmit() {
    if (!entry) {
      return;
    }

    $animationData = editEntry($animationData ?? ({} as IAnimationData), {
      ...entry,
      activeOnBreakpoints: breakpointsSelected,
      domQueries: selectedDomTargets.map((target) => `[data-v~="${target}"]`),
    });

    $activePopup = null;
  }

  let selectedDomTargets: string[] = entry
    ? (entry as IAnimationEntry).domQueries.map((query: string) =>
        query.replace('[data-v~="', "").replace('"]', "")
      )
    : [];

  let breakpoints: string[] = [];
  let breakpointsSelected: string[] = [];
  function getBreakpoints(animationData: IAnimationData) {
    return (animationData.breakpoints ?? []).map(
      (breakpoint: IBreakPoint) => breakpoint.id
    );
  }
  animationData.subscribe((data) => {
    if (!entry) {
      return;
    }
    breakpoints = getBreakpoints(data);
    breakpointsSelected = (entry.activeOnBreakpoints ?? []).map(
      (breakpoint: IBreakPoint) => breakpoint
    );
  });
</script>

<Popup>
  <h2>Edit animation entry</h2>
  <form on:submit|preventDefault={handleFormSubmit}>
    <label for="name (optional)">Entry name</label>
    <input type="text" name="name" bind:value={entry.name} />

    <div class="multi-select">
      <MultiSelect
        placeholder="DOM targets"
        bind:selected={selectedDomTargets}
        options={$domTargets.regular}
      />
    </div>
    <div class="multi-select">
      <MultiSelect
        placeholder="Breakpoints"
        bind:selected={breakpointsSelected}
        options={breakpoints}
      />
    </div>
    <div class="button-container">
      <Button type="submit">Save</Button>
    </div>
  </form>
</Popup>

<style>
  .button-container {
    padding-top: 22px;
  }
  .multi-select {
    width: 400px;
    padding-bottom: 12px;
  }
</style>

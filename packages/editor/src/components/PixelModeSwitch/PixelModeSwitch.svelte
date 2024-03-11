<script lang="ts">
  import { page } from "$app/stores";
  import { setUrlRequestParam } from "$lib/helpers";
  import {
    selectedTimelineId,
    pixelTimelineMode,
  } from "../../stores/ui-state-store";
  import Switch from "../Switch/Switch.svelte";
  import { writable } from "svelte/store";

  const checked = writable(false);
  page.subscribe((page) => {
    $pixelTimelineMode =
      page.url.searchParams.get("pixelmode") === "true" ? true : false;
  });

  onchange = async (event) => {
    if (!event.detail) {
      return;
    }
    $pixelTimelineMode = event.detail.checked;
    $selectedTimelineId = undefined;
    if ($pixelTimelineMode === true) {
      await setUrlRequestParam("pixelmode", "true", $page.url);
    } else {
      await setUrlRequestParam("pixelmode", "false", $page.url);
    }
    await setUrlRequestParam("timelineid", "", $page.url);
  };

  pixelTimelineMode.subscribe((value) => {
    checked.set(value);
  });
</script>

<Switch
  bind:checked={$checked}
  on:change={onchange}
  label="scroll animations"
  fontSize={14}
  design="slider"
  options={[true, false]}
/>

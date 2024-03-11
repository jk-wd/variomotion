<script lang="ts">
  import {
    selectedTimelineId,
    pixelTimelineMode,
  } from "../../stores/ui-state-store";
  import { animationData } from "../../stores/animation-data-store";

  import { getTimelines, setUrlRequestParam } from "$lib/helpers";
  import Select from "../Select/Select.svelte";
  import { page } from "$app/stores";

  let placeholderTextTimeline = "Timeline";

  page.subscribe((page) => {
    $selectedTimelineId = page.url.searchParams.get("timelineid") ?? "";
  });
</script>

<Select
  name="timelines"
  id="timelines"
  bind:value={$selectedTimelineId}
  on:input={async (event) => {
    placeholderTextTimeline = "Timeline";
    const timelineId = event.target.value;
    await setUrlRequestParam("timelineid", timelineId, $page.url);
    $selectedTimelineId = timelineId ?? "";
  }}
>
  <option value={""}>{placeholderTextTimeline}</option>
  {#each getTimelines($animationData?.timelines ?? [], $pixelTimelineMode) as timeline}
    <option value={timeline.id}>{timeline.id}</option>
  {/each}
</Select>

<style>
</style>

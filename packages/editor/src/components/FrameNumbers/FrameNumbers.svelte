<script lang="ts">
  import { timelineValuePerPixel } from "../../stores/ui-state-store";

  export let duration = 10000000;
  const numberOfPixels: number = Math.round(duration / $timelineValuePerPixel);
</script>

<div class="frame-numbers" style={`width:${numberOfPixels + 50}px`}>
  {#each { length: numberOfPixels } as _, i}
    {#if i === 0}
      <div class="step">0</div>
    {/if}
    {#if (i + 1) % 50 === 0}
      <div class="step">{(i + 1) * $timelineValuePerPixel}</div>
    {/if}
  {/each}
</div>

<style>
  .frame-numbers {
    width: 100%;
    white-space: nowrap;
    position: absolute;
    text-align: left;
    left: 0;
  }
  .step {
    padding-top: 4px;
    background-color: white;
    position: relative;
    width: 50px;
    float: left;
    font-size: 10px;
    padding-left: 5px;
  }
  .step::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 1px;
    height: 6000px;
    opacity: 0.3;
    background-color: var(--color-grey-4);
  }
</style>

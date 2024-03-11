<script lang="ts">
  import { animationData } from "../../stores/animation-data-store";
  import { activeBreakpoint, activePopup } from "../../stores/ui-state-store";
  import { viewportState, type ViewportState } from "../../stores/viewport";
  import Box from "../Box/Box.svelte";
  import BoxContent from "../Box/BoxContent.svelte";
  import Button from "../Button/Button.svelte";

  import variomotion, {
    getActiveBreakPoint,
    setMatchMedia,
    type IActiveBreakpoint,
  } from "@variomotion/core";
  import matchMediaMock from "match-media-mock";
  import NumberInput from "../Input/NumberInput.svelte";
  import BreakpointDot from "../BreakpointDot/BreakpointDot.svelte";

  animationData.subscribe((data) => {
    $activeBreakpoint = getActiveBreakPoint(data);
  });
  const mediaMock = matchMediaMock.create();
  viewportState.subscribe(({ viewportWidth }: ViewportState) => {
    mediaMock.setConfig({
      type: "screen",
      width: viewportWidth ?? window.innerWidth,
    });
    setMatchMedia(mediaMock);
    $activeBreakpoint = getActiveBreakPoint($animationData);
  });
</script>

<Box>
  <span class="breakpoint"
    >Active bp:

    <span class="breakpoint-value"
      >{$activeBreakpoint?.id ?? ""}
      {#if $activeBreakpoint && $activeBreakpoint.breakpoint}
        <BreakpointDot breakpointColor={$activeBreakpoint.breakpoint.color} />
      {/if}
    </span></span
  >

  <div class="viewport-width">
    <BoxContent>
      <NumberInput
        bind:value={$viewportState.viewportWidth}
        placeholder="viewport width"
      />
    </BoxContent>
  </div>

  <BoxContent>
    <Button
      variant="tiny"
      on:click={() => {
        $activePopup = "manage-breakpoints";
      }}>Manage breakpoints</Button
    >
  </BoxContent>
</Box>

<style>
  .breakpoint {
    font-size: 12px;
    line-height: 1.2;
  }
  .viewport-width {
    width: 110px;
  }
  .breakpoint-value {
    font-size: 14px;
    font-family: "ProximaNova-Bold";
  }
</style>

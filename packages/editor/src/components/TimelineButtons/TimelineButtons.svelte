<script lang="ts">
  import Button from "../Button/Button.svelte";
  import { activePopup } from "../../stores/ui-state-store";
  import TimelineFilter from "../SelectTimeline/SelectTimeline.svelte";
  import Box from "../Box/Box.svelte";
  import BoxContent from "../Box/BoxContent.svelte";
  import PixelModeSwitch from "../PixelModeSwitch/PixelModeSwitch.svelte";
</script>

<Box>
  <div>
    <BoxContent>
      <PixelModeSwitch />
    </BoxContent>
  </div>
  <div class="filters">
    <TimelineFilter />
  </div>
  <BoxContent>
    <Button
      variant="tiny"
      on:click={() => {
        $activePopup = "add-timeline";
      }}>Add timeline</Button
    >
  </BoxContent>
</Box>

<style>
  .filters {
    position: relative;
    top: -2px;
    align-self: flex-end;
  }
</style>

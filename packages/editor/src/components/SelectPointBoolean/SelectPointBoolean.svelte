<script lang="ts">
  import type { PointBoolean } from "@variomotion/transform";

  export let axis: PointBoolean = {
    x: true,
    y: true,
  };
</script>

<div class="container">
  <div class="label">Transform on axis:</div>
  <div class="container-inner">
    <div class="axis">
      <div>x</div>
      <div>
        <input type="checkbox" bind:checked={axis.x} />
      </div>
    </div>
    <div class="axis">
      <div>y</div>
      <div>
        <input type="checkbox" bind:checked={axis.y} />
      </div>
    </div>
  </div>
</div>

<style>
  .label {
    font-size: 14px;

    font-family: "ProximaNova-Regular";
  }
  .container {
    width: 100%;
  }
  .container-inner {
    display: flex;
    width: 100%;
    gap: 16px;
  }
  .axis {
    display: flex;
    gap: 4px;
  }
  .axis input {
    position: relative;
    top: 2px;
  }
</style>

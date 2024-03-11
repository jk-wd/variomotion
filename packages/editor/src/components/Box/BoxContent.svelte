<script lang="ts">
</script>

<div
  class="box-content"
  on:mousedown={(event) => {
    event.stopPropagation();
  }}
>
  <slot />
</div>

<style>
  .box-content {
    z-index: 1;
  }
</style>

<script lang="ts">
  export let breakpointColor: string | undefined = undefined;
</script>

{#if breakpointColor}
<span class="breakpoint-dot" style={`background-color:${breakpointColor}`}
></span>
{/if}
<style>
  .breakpoint-dot {
    width: 10px;
    height: 10px;
    display: inline-block;
    border-radius: 100%;
  }
</style>

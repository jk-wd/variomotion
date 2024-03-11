<script lang="ts">
  export let breakpointColor: string | undefined = undefined;
</script>

<span class="breakpoint-dot" style={`background-color:${breakpointColor}`}
></span>

<style>
  .breakpoint-dot {
    width: 10px;
    height: 10px;
    display: inline-block;
    border-radius: 100%;
  }
</style>

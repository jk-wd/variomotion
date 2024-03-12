<script lang="ts">
  import { onMount } from "svelte";

  export let siteUrl = "about:blank";
  export let width: number | null = null;
</script>

<iframe
  style={`width:${width ? width + "px" : "100%"}`}
  class="iframe"
  title="varioiframe"
  frameborder="0"
  src={siteUrl}
></iframe>

<style>
  .iframe {
    top: 0;
    left: 50%;
    transform: translate(-50%, 0);
    position: absolute;
    height: 80vh;
    width: 100%;
  }
</style>

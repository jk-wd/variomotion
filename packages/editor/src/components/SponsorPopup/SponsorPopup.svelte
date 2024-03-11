<script lang="ts">
  import { page } from "$app/stores";
  import { setUrlRequestParam } from "$lib/helpers";
  import { activePopup } from "../../stores/ui-state-store";
  import Button from "../Button/Button.svelte";
  import Popup from "../Popup/Popup.svelte";
</script>

<Popup>
  <h2>Variomotion is an opensource project</h2>
  <p>
    If you would like to sponsor the project? Visit: <br />
    <a href="https://github.com/sponsors/jk-wd" target="_blank"
      >GitHub Sponsors</a
    >
    <br /><br />
  </p>
  <div class="buttons">
    <Button
      on:click={() => {
        window.open("https://github.com/sponsors/jk-wd", "_blank");
      }}>I would like to sponsor</Button
    >
    <Button
      on:click={async () => {
        await setUrlRequestParam("hidesponsor", "true", $page.url);
        $activePopup = null;
      }}>Not now</Button
    >
  </div>
</Popup>

<style>
  .buttons {
    display: flex;
    justify-content: flex-start;
    gap: 10px;
  }
</style>

<script lang="ts">
  import { page } from "$app/stores";
  import { setUrlRequestParam } from "$lib/helpers";
  import { activePopup } from "../../stores/ui-state-store";
  import Button from "../Button/Button.svelte";
  import Popup from "../Popup/Popup.svelte";
</script>

<Popup>
  <div class="content">
    <h2>Variomotion is <b>opensource</b></h2>
    <br />
    <p>
      If you would like to sponsor the project? Visit: <br />
      <a href="https://github.com/sponsors/jk-wd" target="_blank"
        >GitHub Sponsors</a
      >
      <br />

      <br />
      Sponsors:<br />
      <span class="sponsors">
        Your Logo or name here? Become a
        <a href="https://github.com/sponsors/jk-wd" target="_blank">sponsor</a>
      </span>

      <br />
      <br />
      <br />
    </p>
  </div>
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
  .sponsors {
    padding: 10px;
    border: 1px solid var(--color-grey-5);
    display: inline-block;
    margin-top: 8px;
  }
  .content {
    overflow: hidden;
  }
  .buttons {
    display: flex;
    justify-content: flex-start;
    gap: 10px;
  }
  .sponsor-logo {
    width: 40px;
    float: right;
    margin: 10px 0px 10px 10px;
  }
</style>

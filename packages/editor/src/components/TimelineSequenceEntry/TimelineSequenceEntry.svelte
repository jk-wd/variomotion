<script lang="ts">
  import { deleteEntry, type ISequenceEntry } from "@variomotion/core";
  import { animationData } from "../../stores/animation-data-store";
  import { activePopup } from "../../stores/ui-state-store";
  import { setUrlRequestParam } from "$lib/helpers";

  import { page } from "$app/stores";

  import Icon from "@iconify/svelte";

  export let type: "sequence" | "animation" = "animation";
  export let entry: ISequenceEntry;
</script>

<div class="entry">
  <div class="entry-name">
    <span>{entry.name}</span>
    <button
      class="entry-icon-button"
      on:click={async () => {
        await setUrlRequestParam("entryid", entry.id, $page.url);
        if (type === "animation") {
          $activePopup = "edit-animation-entry";
        } else {
          $activePopup = "edit-sequence-entry";
        }
      }}
    >
      <Icon
        style="width: 16px; height: 16px;"
        icon="material-symbols-light:edit-square-outline-rounded"
      />
    </button>
    <button
      class="entry-icon-button"
      on:click={() => {
        $animationData = deleteEntry($animationData, entry.id);
      }}
    >
      <Icon
        style="width: 16px; height: 16px;"
        color="#ff0000"
        icon="material-symbols-light:delete-outline"
      />
    </button>
  </div>
</div>

<style>
  .entry {
    display: flex;
    flex-direction: row;
    height: 28px;
  }

  .entry-icon-button {
    margin-left: 3px;
    position: relative;
    top: 3px;
  }
  .entry-name > span {
    display: inline-block;

    border-radius: 5px;
    padding: 1px 4px 4px 4px;
  }
  .entry-name {
    padding: 4px 4px 4px 10px;
    width: 200px;
    overflow: hidden;
  }
</style>

<script lang="ts">
  import { activePopup } from "../../stores/ui-state-store";
  const onClickClose = () => {
    $activePopup = null;
  };
</script>

<div class="overlay">
  <div class="popup">
    <slot />
  </div>
  <button class="close-button" on:click={onClickClose} />
</div>

<style>
  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .close-button {
    position: absolute;
    opacity: 0;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
  }
  .popup {
    background: var(--color-white);
    padding: 20px;
    z-index: 1;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    min-width: 400px;
  }
</style>

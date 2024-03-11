<script lang="ts">
  export let open = true;
</script>

<div class="box-bottom">
  <div class={`bottom-content ${open ? "open" : ""}`}>
    <slot name="bottom-content" />
  </div>
  <div class={`bottom-content bottom-content-top ${open ? "open" : ""}`}>
    <slot name="bottom-content-top" />
  </div>
  <slot />
</div>

<style>
  .bottom-content {
    display: none;
  }
  .bottom-content.open {
    display: block;
    position: absolute;
    bottom: 29px;
    left: 0;
    background-color: var(--color-grey-1);
    box-shadow: 0px -4px 14px rgba(0, 0, 0, 0.1);
    width: 100%;
  }
  .box-bottom {
    display: flex;
    position: absolute;
    bottom: 0;
    left: 0;
    background-color: var(--color-grey-1);
    border: 1px solid var(--color-grey-1);
    border-radius: 0px 0px 8px 8px;
    width: 100%;
    height: 30px;
    padding: 4px;
  }
</style>

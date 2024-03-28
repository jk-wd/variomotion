<div class="box-top">
  <slot />
</div>

<style>
  .box-top {
    z-index: 2;
    display: flex;
    position: absolute;
    top: 0;
    left: 0;
    background-color: var(--color-grey-2);
    border: 1px solid var(--color-grey-2);
    width: 100%;
    height: 30px;

    padding: 4px;
  }
</style>

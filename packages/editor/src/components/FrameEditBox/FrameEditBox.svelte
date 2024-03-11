<script lang="ts">
  import {
    getFrameById,
    editFrame,
    easingFunctions,
    fixedValueMap,
    type IFrameDef,
    type Units,
    deleteFrame,
    FixedValuePropTypes,
    NumberValuePropTypes,
    editEntry,
    getEntryById,
    getAnimationEntryById,
  } from "@variomotion/core";
  import Box from "../Box/Box.svelte";

  import {
    activePopup,
    selectedFrame,
    transformMode,
    selectedBreakpoint,
  } from "../../stores/ui-state-store";

  import { animationData } from "../../stores/animation-data-store";
  import { pauseTimeline } from "@variomotion/editor-connect";
  import {
    constructFieldValues,
    fieldValuesToValueDef,
  } from "./frame-edit-helper";
  import Icon from "@iconify/svelte";
  import { derived } from "svelte/store";
  import BoxContent from "../Box/BoxContent.svelte";
  import Button from "../Button/Button.svelte";
  import BoxTop from "../Box/BoxTop.svelte";
  import NumberInput from "../Input/NumberInput.svelte";
  import FrameEditNumberField from "../FrameEditField/FrameEditNumberField.svelte";
  import FrameEditSelectField from "../FrameEditField/FrameEditSelectField.svelte";
  import BoxBottom from "../Box/BoxBottom.svelte";
  import Select from "../Select/Select.svelte";
  import SetOrigin from "../SetOrigin/SetOrigin.svelte";
  import { fieldValues } from "../../stores/field-values";
  import { dimensions } from "../../stores/dimensions";
  import SelectTransformAxis from "../SelectPointBoolean/SelectPointBoolean.svelte";
  import SelectPointBoolean from "../SelectPointBoolean/SelectPointBoolean.svelte";
  import {
    scaleProportianally,
    translateBoolean,
  } from "../../stores/transform";

  let frame: IFrameDef | undefined = undefined;

  const state = derived(
    [selectedFrame, animationData],
    ([$selectedFrame, $animationData]) => {
      return {
        selectedFrame: $selectedFrame,
        animationData: $animationData,
      };
    }
  );
  state.subscribe(({ selectedFrame, animationData }) => {
    if (selectedFrame && animationData) {
      try {
        frame = getFrameById(
          animationData,
          selectedFrame.entryId,
          selectedFrame.index
        );
        if (!frame) {
          $selectedFrame = null;
          return;
        }
        $fieldValues = constructFieldValues(frame, animationData);
      } catch (e) {
        console.error(e);
      }
    }
  });

  function handleFormSubmit() {
    if (!frame || !$fieldValues || !$animationData || !$selectedFrame) {
      return;
    }

    const newFrame = {
      ...frame,
      valueDef: fieldValuesToValueDef($fieldValues),
    };
    $animationData = editFrame(
      $animationData,
      $selectedFrame.entryId,
      newFrame,
      $selectedFrame.index
    );

    $activePopup = null;
  }

  function handleUpdateFramePosition(event: any) {
    if (!frame || !$fieldValues || !$animationData || !$selectedFrame) {
      return;
    }
    $animationData = editFrame(
      $animationData,
      $selectedFrame.entryId,
      {
        ...frame,
        framePositionValue: event.detail.value ?? 0,
      },
      $selectedFrame.index
    );
    pauseTimeline($selectedFrame.timelineId, frame.framePositionValue);
  }

  function getFixedValues(type: FixedValuePropTypes) {
    return fixedValueMap[type];
  }

  function handleDeleteButtonClick() {
    if (!frame || !$fieldValues || !$animationData || !$selectedFrame) {
      return;
    }
    const animationDataFrameDeleted = deleteFrame(
      $animationData,
      $selectedFrame.entryId,
      $selectedFrame.index
    );
    $selectedFrame = null;
    $animationData = animationDataFrameDeleted;
  }

  function setOrigin(transformOrigin: { x: number; y: number }) {
    const entryId = $selectedFrame?.entryId;
    if (!entryId) {
      return;
    }

    const entry = getAnimationEntryById($animationData, entryId);
    if (!entry) {
      return;
    }
    $animationData = editEntry($animationData, {
      ...entry,
      transformOrigin,
    });
  }

  function getOrigin() {
    const entryId = $selectedFrame?.entryId;
    if (!entryId) {
      return;
    }
    const entry = getAnimationEntryById($animationData, entryId);
    if (!entry) {
      return;
    }
    return entry.transformOrigin ?? { x: 0, y: 0 };
  }

  let settingOrigin = false;
</script>

{#if $selectedFrame}
  <Box>
    <BoxTop>
      <div class="frame-position">
        <BoxContent>
          <NumberInput
            value={frame?.framePositionValue ?? 0}
            on:input={handleUpdateFramePosition}
          />
        </BoxContent>

        <span>
          {frame?.frameUnit}
        </span>
      </div>
      <div class="breakpoint-select-wrapper">
        <span>bp:</span>
        <Select name="breakpoint" bind:value={$selectedBreakpoint}>
          <option value={"none"}>none</option>
          {#each $animationData.breakpoints ?? [] as breakpoint}
            <option value={breakpoint.id}>{breakpoint.id}</option>
          {/each}
        </Select>
      </div>
      <div class="right">
        <BoxContent>
          <button
            class="delete-frame-button"
            on:click={handleDeleteButtonClick}
          >
            <Icon
              style="width: 16px; height: 16px;"
              color="#ff0000"
              icon="material-symbols-light:delete-outline"
            />
          </button>
          <button
            class="close-button"
            on:click={async () => {
              $selectedFrame = null;
            }}
          >
            <Icon
              style="width: 24px; height: 24px;"
              icon="material-symbols-light:close-small-outline"
            />
          </button>
        </BoxContent>
      </div>
    </BoxTop>
    <div class="frame-edit">
      <div class="fields">
        {#if $fieldValues}
          <form class="" on:submit|preventDefault={handleFormSubmit}>
            <div class="properties">
              {#each Object.keys($fieldValues) as type}
                {#if Object.keys(NumberValuePropTypes).includes(type)}
                  <BoxContent>
                    <FrameEditNumberField
                      {type}
                      breakpoint={$selectedBreakpoint}
                      value={$fieldValues[type][$selectedBreakpoint]?.value}
                      unit={$fieldValues[type][$selectedBreakpoint]?.unit}
                      easing={$fieldValues[type][$selectedBreakpoint]?.easing}
                      on:newvalue={(event) => {
                        const { value, unit, easing, breakpoint } =
                          event.detail;
                        $fieldValues[type][breakpoint] = {
                          value,
                          unit,
                          easing,
                        };
                        handleFormSubmit();
                      }}
                    />
                  </BoxContent>
                {/if}
                {#if Object.keys(FixedValuePropTypes).includes(type)}
                  <BoxContent>
                    <FrameEditSelectField
                      {type}
                      fixedValues={getFixedValues(type)}
                      on:newvalue={(event) => {
                        const { value } = event.detail;
                        $fieldValues[type][$selectedBreakpoint] = {
                          value,
                        };

                        handleFormSubmit();
                      }}
                    />
                  </BoxContent>
                {/if}
              {/each}
            </div>
          </form>
        {/if}
      </div>
    </div>
    <BoxContent>
      <BoxBottom
        open={settingOrigin ||
          $transformMode === "scale" ||
          $transformMode === "translate"}
      >
        <button
          class={`transform-button ${
            $transformMode === "translate" ? "active" : ""
          }`}
          on:click={async () => {
            $transformMode =
              $transformMode === "translate" ? "off" : "translate";
          }}
        >
          <Icon
            style="width: 24px; height: 24px;"
            icon="material-symbols-light:move-selection-left-outline"
          />
          <span>translate</span>
        </button>
        <button
          class={`transform-button ${
            $transformMode === "scale" ? "active" : ""
          }`}
          on:click={async () => {
            $transformMode = $transformMode === "scale" ? "off" : "scale";
          }}
        >
          <Icon
            style="width: 24px; height: 24px;"
            icon="material-symbols-light:linear-scale"
          />
          <span>scale</span>
        </button>
        <button
          class={`transform-button ${
            $transformMode === "rotate" ? "active" : ""
          }`}
          on:click={async () => {
            $transformMode = $transformMode === "rotate" ? "off" : "rotate";
          }}
        >
          <Icon
            style="width: 18px; height: 18px; position: relative; top: 3px;"
            icon="material-symbols-light:rotate-90-degrees-cw-outline"
          />
          <span>rotate</span>
        </button>
        <button
          class={`transform-button  transform-button-origin  ${
            settingOrigin ? "active" : ""
          }`}
          on:click={async () => {
            settingOrigin = !settingOrigin;
          }}
        >
          <span class="icon">
            <Icon
              style="width: 14px; height: 14px; position: relative; top: 5px;"
              icon="material-symbols-light:trip-origin"
            />
          </span>
          <span>origin</span>
        </button>
        <div slot="bottom-content">
          {#if $transformMode === "scale"}
            <div class="bottom-card">
              <div class="scale-proportianally">
                <div>Scale proportianally</div>
                <div>
                  <input type="checkbox" bind:checked={$scaleProportianally} />
                </div>
              </div>
            </div>
          {:else if $transformMode === "translate"}
            <div class="bottom-card">
              <SelectPointBoolean bind:axis={$translateBoolean} />
            </div>
          {/if}
        </div>
        <div slot="bottom-content-top">
          {#if settingOrigin}
            <div class="bottom-card">
              <SetOrigin
                on:originChanged={(event) => {
                  setOrigin(event.detail);
                }}
                origin={getOrigin()}
                dimensions={{
                  width: $dimensions?.clientRect.width ?? -1,
                  height: $dimensions?.clientRect.height ?? -1,
                }}
              />
            </div>
          {/if}
        </div>
      </BoxBottom>
    </BoxContent>
  </Box>
{/if}

<style>
  .bottom-card {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px 20px 8px 20px;
  }
  .scale-proportianally {
    font-size: 12px;
    width: 100%;
    display: flex;
    gap: 12px;
  }
  .scale-proportianally input {
    position: relative;
    top: 2px;
  }
  .set-origin-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  .fields {
    overflow-y: scroll;
    max-height: 400px;
    padding: 30px 0 120px 0;
    margin-right: -16px;
  }
  .close-button {
    position: relative;
    top: -2px;
  }
  .delete-frame-button {
    position: relative;
    top: -5px;
    width: 21px;
  }
  .frame-position {
    width: 60px;
    display: flex;
  }
  .right {
    margin-left: auto;
    display: flex;
  }
  .frame-edit {
    width: 240px;
  }
  .breakpoint-select-wrapper {
    display: flex;
    margin-left: 40px;
  }
  .transform-button.active {
    color: var(--color-grey-6);

    font-family: "ProximaNova-bold";
  }
  .transform-button {
    display: flex;
    margin-right: 8px;
  }
  .transform-button > span {
    font-size: 12px;
    padding-top: 3px;
  }
  .transform-button-origin {
    background-color: var(--color-grey-2);
    border: 1px solid var(--color-grey-3);
    border-radius: 4px;
    padding: 4px;
  }
  .transform-button-origin.active {
    background-color: var(--color-grey-5);
    border: 1px solid var(--color-grey-5);
    font-family: "ProximaNova-regular";
    border: none;
    color: white;
  }
  .transform-button-origin > span {
    position: relative;
    top: -6px;
  }
  .transform-button-origin > .icon {
    position: relative;
    top: -9px;
  }
</style>

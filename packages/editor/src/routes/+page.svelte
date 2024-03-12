<script lang="ts">
  import { onMount } from "svelte";
  import {
    initEditorSocket,
    sendAnimationDataToSite,
    sendFrameSelectedEventToSite,
    sendTranslateBooleanEventToSite,
    sendScaleproportianallyEventToSite,
  } from "@variomotion/editor-connect";
  import type { SocketEventSite } from "@variomotion/editor-connect";
  import { sendFrameDeSelectedEventToSite } from "@variomotion/editor-connect";
  import Iframe from "../components/Iframe/Iframe.svelte";
  import Timeline from "../components/Timeline/Timeline.svelte";
  import { browser } from "$app/environment";
  import { animationData } from "../stores/animation-data-store";
  import type { IAnimationData } from "@variomotion/core";
  import {
    selectedBreakpoint,
    activePopup,
    pixelTimelineMode,
    selectedFrame,
    transformMode,
  } from "../stores/ui-state-store";
  import { viewportState } from "../stores/viewport";
  import AddTimeLinePopup from "../components/AddTimelinePopup/AddTimelinePopup.svelte";
  import AddAnimationEntryPopup from "../components/AddAnimationEntryPopup/AddAnimationEntryPopup.svelte";
  import { socketState } from "../stores/socket";
  import { domTargets } from "../stores/dom-targets";
  import FrameEditBox from "../components/FrameEditBox/FrameEditBox.svelte";
  import GeneralSettingsBox from "../components/GeneralSettingsBox/GeneralSettingsBox.svelte";
  import EditTimelinePopup from "../components/EditTimelinePopup/EditTimelinePopup.svelte";
  import ManageBreakpointPopup from "../components/ManageBreakpointPopup/ManageBreakpointPopup.svelte";
  import EditAnimationEntryPopup from "../components/EditAnimationEntryPopup/EditAnimationEntryPopup.svelte";
  import TimelineButtons from "../components/TimelineButtons/TimelineButtons.svelte";
  import { timelineStates } from "../stores/timeline-states";
  import AddSequenceEntryPopup from "../components/AddSequenceEntryPopup/AddSequenceEntryPopup.svelte";
  import { dimensions } from "../stores/dimensions";
  import SponsorPopup from "../components/SponsorPopup/SponsorPopup.svelte";
  import { page } from "$app/stores";
  import { scaleProportianally, translateBoolean } from "../stores/transform";
  import EditSequenceEntryPopup from "../components/EditSequenceEntryPopup /EditSequenceEntryPopup.svelte";

  let sendAnimationDataLocked = false;
  onMount(async () => {
    const urlParams = new URLSearchParams(window.location.search);

    const socketPort = urlParams.get("socketport");
    if (!socketPort) {
      throw new Error("socketPort is not defined");
    }
    $socketState.socket = await initEditorSocket(
      $socketState.socketChannelId,
      (event: SocketEventSite) => {
        if (event.type === "send-animation-data-to-editor" && event.data) {
          domTargets.set(event.domTargets);
          sendAnimationDataLocked = true;
          animationData.set(event.data as IAnimationData);
          setTimeout(() => {
            sendAnimationDataLocked = false;
          }, 400);
        }
        if (event.type === "send-timeline-states-to-editor" && event.data) {
          timelineStates.set(event.data);
        }
        if (event.type === "send-dimensions-to-editor" && event.data) {
          dimensions.set(event.data);
        }
      },
      parseInt(socketPort, 10)
    );
  });

  socketState.subscribe((state) => {
    animationData.subscribe((data) => {
      if (data && !sendAnimationDataLocked) {
        sendAnimationDataToSite(data);
      }
    });
  });

  transformMode.subscribe((mode) => {
    if (!$socketState.socket) {
      return;
    }
    if (!$selectedFrame) {
      sendFrameDeSelectedEventToSite(null);
      return;
    }
    sendFrameSelectedEventToSite({
      pixelBased: $pixelTimelineMode,
      ...$selectedFrame,
      animationData: $animationData,
      transformMode: mode,
      breakpoint: $selectedBreakpoint ? $selectedBreakpoint.id : "none",
    });
  });

  selectedFrame.subscribe((frame) => {
    if (!$socketState.socket) {
      return;
    }
    if (frame) {
      sendFrameSelectedEventToSite({
        pixelBased: $pixelTimelineMode,
        ...frame,
        animationData: $animationData,
        transformMode: $transformMode,
        breakpoint: $selectedBreakpoint ? $selectedBreakpoint : "none",
      });
    } else {
      sendFrameDeSelectedEventToSite(null);
    }
  });

  translateBoolean.subscribe((value) => {
    if (!$socketState.socket) {
      return;
    }
    if (value) {
      sendTranslateBooleanEventToSite(value);
    }
  });

  scaleProportianally.subscribe((value) => {
    if (!$socketState.socket) {
      return;
    }
    sendScaleproportianallyEventToSite(!!value);
  });

  let siteUrl: URL;
  if (browser) {
    const urlParams = new URLSearchParams(window.location.search);
    siteUrl = new URL(urlParams.get("siteurl") ?? "about:blank");
    siteUrl.searchParams.set("socketChannelId", $socketState.socketChannelId);
  }
</script>

<editor-switch></editor-switch>
{#if siteUrl}
  <Iframe width={$viewportState.viewportWidth} siteUrl={siteUrl.toString()} />
{/if}
{#if $animationData}
  {#if $activePopup === "add-timeline"}
    <AddTimeLinePopup />
  {/if}

  {#if $activePopup === "add-animation-entry"}
    <AddAnimationEntryPopup />
  {/if}

  {#if $activePopup === "edit-animation-entry"}
    <EditAnimationEntryPopup />
  {/if}

  {#if $activePopup === "edit-sequence-entry"}
    <EditSequenceEntryPopup />
  {/if}

  {#if $activePopup === "edit-timeline"}
    <EditTimelinePopup />
  {/if}

  {#if $activePopup === "add-sequence-entry"}
    <AddSequenceEntryPopup />
  {/if}

  {#if $activePopup === "sponsor" && !($page.url.searchParams.get("hidesponsor") === "true")}
    <SponsorPopup />
  {/if}

  {#if $activePopup === "manage-breakpoints"}
    <ManageBreakpointPopup />
  {/if}

  {#if $socketState.socket}
    <div class="top controls-area">
      <GeneralSettingsBox />
    </div>
  {/if}

  <div class="right-bottom controls-area">
    <FrameEditBox />
  </div>

  <div class="left-bottom controls-area">
    <TimelineButtons />
  </div>

  <Timeline />
{/if}

<style>
  .controls-area {
    position: fixed;
    margin: 10px 10px 20px 10px;
  }
  .top {
    position: fixed;
    top: 0;
    left: 0;
  }
  .controls-area.right-bottom {
    margin: 10px 20px 20px 10px;
  }
  .right-bottom {
    position: fixed;
    bottom: 20vh;
    right: 0;
  }

  .left-bottom {
    position: fixed;
    bottom: 20vh;
    left: 0;
  }

  button,
  fieldset,
  iframe,
  img {
    border: 0;
  }
  :global(h2) {
    font-size: 20px;
    padding-bottom: 6px;
  }
  :global(input) {
    padding: 4px;
    border-radius: 6px;
    border: 1px solid var(--color-grey-2);
    font-size: 14px;
    margin-bottom: 10px;
    width: 100%;
  }
  :global(label) {
    font-size: 14px;
  }

  :global(body) {
    margin: 0;
    padding: 0;
    overflow: hidden;
    min-height: 100vh;
    min-width: 100vw;
    font-family: "ProximaNova-Light";
    background-color: var(--color-grey-5);
  }
  :global(:root) {
    --color-white: #fff;
    --color-green: #44bba4;
    --color-blue: #4588ba;
    --color-pink: #ef476f;
    --color-black: #111;
    --color-orange: #ffae03;

    --color-grey-1: #efefef;
    --color-grey-2: #d3d2d2;
    --color-grey-3: #aaaaaa;
    --color-grey-4: #747474;
    --color-grey-5: #4d4d4d;
  }
  :global(a) {
    text-decoration: underline;
  }
</style>

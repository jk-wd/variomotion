import {
  IAnimationData,
  getFrameById,
  getFramePosition,
  getTimelineById,
} from "@variomotion/core";
import { SocketNotInitializedError } from "./errors";
import { getDomTargetsSite } from "./helper";
import { getSocket, setupSocket } from "./socket";
import {
  DomtargetDimensions,
  FrameEventData,
  PlayPauseEventData,
  SocketEvent,
  SocketEventSite,
  VariomotionLib,
} from "./types";
import {
  PointBoolean,
  setScaleProportianally,
  setTransformMode,
  setTranslateBoolean,
  tearDownTransform,
} from "@variomotion/transform";
import {
  connectVariomotion,
  getActiveFrame,
  setActiveFrame,
  setDomTargetDimensions,
  transformCanvas,
} from "./transform-canvas";

let scrollToInterval: NodeJS.Timeout;
let socketChannelId: string | undefined;
let fileName: string;
let connected: boolean = false;

export function sendSiteEvent(type: SocketEvent["type"], data: unknown) {
  const socket = getSocket();
  if (!socketChannelId || !socket) {
    throw SocketNotInitializedError;
  }
  socket.send(
    JSON.stringify({
      socketChannelId,
      source: "site",
      type,
      host: window.location.host,
      data,
      domTargets: getDomTargetsSite(),
    } as SocketEventSite)
  );
}

export const sendTimelineStatesToEditor = (variomotion: VariomotionLib) => {
  sendSiteEvent("send-timeline-states-to-editor", {
    timelineStates: variomotion.getTimelineStates(),
    pixelTimelineStates: variomotion.getPixelTimelineStates(),
  });
};

export const sendDimensionsToEditor = (dimensions: DomtargetDimensions) => {
  sendSiteEvent("send-dimensions-to-editor", dimensions);
};

export const sendAnimationDataToEditor = (variomotion: VariomotionLib) => {
  const animaitonData = variomotion.getAnimationData();
  sendSiteEvent("send-animation-data-to-editor", {
    animationData: {
      ...variomotion.getAnimationData(),
      metaData: {
        ...(animaitonData.metaData ?? {}),
        fileName,
      },
    },
    valueStore: variomotion.getValueStore(),
  });
};

export const connectEditor = async (
  variomotion: VariomotionLib,
  socketPort: number,
  initCallback: () => Promise<void>
) => {
  if (connected) {
    variomotion.updateAnimationData(variomotion.getAnimationData());
    return;
  }
  await setupSocket(socketPort);
  await setDomTargetDimensions();
  await initCallback();
  const socket = getSocket();

  const url = variomotion.getOptions().url;
  const animaitonData = variomotion.getAnimationData();
  fileName = animaitonData?.metaData?.fileName
    ? animaitonData?.metaData?.fileName
    : url?.split("/").pop() ?? "";
  socketChannelId =
    new URL(window.location.href).searchParams.get("socketChannelId") ??
    undefined;
  connectVariomotion(variomotion);
  sendAnimationDataToEditor(variomotion);

  socket.addEventListener("message", (message) => {
    const event = JSON.parse(message.data) as SocketEvent;
    if (event.type === "send-animation-data-to-site") {
      variomotion.updateAnimationData(event.data as IAnimationData);
      tearDownTransform();
      const activeFrame = getActiveFrame();
      if (activeFrame) {
        transformCanvas(variomotion);
      }
    }
    if (event.type === "pause-timeline") {
      const data = event.data as PlayPauseEventData;
      variomotion.pause(data.timelineId, data.position);
      const timeline = getTimelineById(
        variomotion.getAnimationData(),
        data.timelineId
      );
      if (timeline?.pixelBased && data.position && data.scrollTo) {
        window.scrollTo({
          top: data.position + (timeline.startPixel ?? 0),
          left: 0,
          behavior: "instant",
        });
      }
    }

    if (event.type === "play-timeline") {
      const data = event.data as PlayPauseEventData;
      variomotion.play(data.timelineId, data.position);
    }

    if (event.type === "framedeselect") {
      const activeFrame = getActiveFrame();
      if (activeFrame) {
        setActiveFrame(undefined);
        setTransformMode("off");
        tearDownTransform();
      }
    }

    if (event.type === "scaleproportianally") {
      setScaleProportianally(event.data as boolean);
    }
    if (event.type === "translateboolean") {
      setTranslateBoolean(event.data as PointBoolean);
    }

    if (event.type === "frameselect") {
      tearDownTransform();
      clearInterval(scrollToInterval);
      const data = event.data as FrameEventData;
      if (!data) {
        setActiveFrame(undefined);
        return;
      }
      setActiveFrame(data);
      const frame = getFrameById(
        variomotion.getAnimationData(),
        data.entryId,
        data.index
      );

      const timelineStates = variomotion.getPixelTimelineStates();
      const timelineState = timelineStates[data.timelineId];
      const startPx = timelineState?.start ?? 0;
      if (data.pixelBased) {
        window.scrollTo({
          top: getFramePosition(frame, variomotion.getValueStore()) + startPx,
          left: 0,
          behavior: "smooth",
        });
        scrollToInterval = setInterval(() => {
          if (frame.framePositionValue + startPx === window.scrollY) {
            setTransformMode(data.transformMode);

            transformCanvas(variomotion);
            clearInterval(scrollToInterval);
          }
        }, 10);
      } else {
        clearInterval(scrollToInterval);
        setTransformMode(data.transformMode);
        transformCanvas(variomotion);
      }
    }

    if (event.type === "set-timeline-progress") {
      const timelineStates = variomotion.getTimelineStates();

      const data = event.data as {
        progress: number;
        timelineId: string;
      };
      if (timelineStates[data.timelineId]) {
        timelineStates[data.timelineId].progress = data.progress;
      }
    }
  });
  connected = true;
  return variomotion;
};

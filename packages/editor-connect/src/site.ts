import {
  IAnimationData,
  getFrameById,
  getFramePosition,
  getTimelineById,
  VariomotionProject,
} from "@variomotion/core";
import { getDomTargetsSite } from "./helper";
import { getSocket, setupSocket } from "./socket";
import {
  DomtargetDimensions,
  FrameEventData,
  PlayPauseEventData,
  SocketEvent,
  SocketEventSite,
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
let project: VariomotionProject;

export function sendSiteEvent(type: SocketEvent["type"], data: unknown) {
  const socket = getSocket();
  if (!socketChannelId || !socket) {
    return;
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

export const sendTimelineStatesToEditor = (project: VariomotionProject) => {
  sendSiteEvent("send-timeline-states-to-editor", {
    timelineStates: project.timelineStates,
    pixelTimelineStates: project.pixelTimelineStates,
  });
};

export const sendDimensionsToEditor = (dimensions: DomtargetDimensions) => {
  sendSiteEvent("send-dimensions-to-editor", dimensions);
};

export const sendAnimationDataToEditor = (project: VariomotionProject) => {
  const animationData = project.animationData;
  sendSiteEvent("send-animation-data-to-editor", {
    animationData: {
      ...project.animationData,
      metaData: {
        ...(animationData.metaData ?? {}),
      },
    },
    valueStore: project.valueStore,
  });
};

export const connectEditor = async (
  initCallback: () => Promise<VariomotionProject>
): Promise<VariomotionProject> => {
  if (project) {
    project.processAnimationData();
    return project;
  }
  await setupSocket(8787);
  await setDomTargetDimensions();
  project = await initCallback();
  const socket = getSocket();

  socketChannelId =
    new URL(window.location.href).searchParams.get("socketChannelId") ??
    undefined;
  connectVariomotion(project);
  sendAnimationDataToEditor(project);

  socket.addEventListener("message", (message) => {
    const event = JSON.parse(message.data) as SocketEvent;
    if (event.type === "send-animation-data-to-site") {
      project.updateAnimationData(event.data as IAnimationData);
      tearDownTransform();
      const activeFrame = getActiveFrame();
      if (activeFrame) {
        transformCanvas(project);
      }
    }
    if (event.type === "pause-timeline") {
      const data = event.data as PlayPauseEventData;
      project.pause(data.timelineId, data.position);
      const timeline = getTimelineById(project.animationData, data.timelineId);
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
      project.play(data.timelineId, data.position);
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
        project.animationData,
        data.entryId,
        data.index
      );

      const timelineStates = project.pixelTimelineStates;
      const timelineState = timelineStates[data.timelineId];
      const startPx = timelineState?.start ?? 0;
      if (data.pixelBased) {
        window.scrollTo({
          top: getFramePosition(frame, project.valueStore) + startPx,
          left: 0,
          behavior: "smooth",
        });
        scrollToInterval = setInterval(() => {
          if (frame.framePositionValue + startPx === window.scrollY) {
            setTransformMode(data.transformMode);

            transformCanvas(project);
            clearInterval(scrollToInterval);
          }
        }, 10);
      } else {
        clearInterval(scrollToInterval);
        setTransformMode(data.transformMode);
        transformCanvas(project);
      }
    }

    if (event.type === "set-timeline-progress") {
      const timelineStates = project.timelineStates;

      const data = event.data as {
        progress: number;
        timelineId: string;
      };
      if (timelineStates[data.timelineId]) {
        timelineStates[data.timelineId].progress = data.progress;
      }
    }
  });
  return project;
};

import { IAnimationData } from "@variomotion/core";
import { SocketNotInitializedError } from "./errors";
import { getSocket, setupSocket } from "./socket";
import { FrameEventData, SocketEvent } from "./types";
import { PointBoolean } from "@variomotion/transform";

let socketChannelId: string | undefined;

export const initEditorSocket = async (
  socketChannelIdParam: string,
  callback: (event: SocketEvent) => void,
  port: number
) => {
  const socket = await setupSocket(port);
  socketChannelId = socketChannelIdParam;
  const registerEvent: SocketEvent = {
    socketChannelId,
    source: "editor",
    type: "register-editor",
    host: window.location.host,
    data: {},
  };
  socket.send(JSON.stringify(registerEvent));

  socket.addEventListener("message", (event) => {
    callback(JSON.parse(event.data));
  });
  return socket;
};

export function sendEditorEvent(type: SocketEvent["type"], data: unknown) {
  const socket = getSocket();
  if (!socketChannelId || !socket) {
    throw SocketNotInitializedError;
  }
  const event: SocketEvent = {
    socketChannelId,
    source: "editor",
    type,
    host: window.location.host,
    data,
  };
  socket.send(JSON.stringify(event));
}

export const sendAnimationDataToSite = (animationData: IAnimationData) => {
  sendEditorEvent("send-animation-data-to-site", animationData);
};

export const pauseTimeline = (timelineId: string, position?: number) => {
  sendEditorEvent("pause-timeline", {
    timelineId,
    position,
  });
};

export const playTimeline = (timelineId: string, position?: number) => {
  sendEditorEvent("play-timeline", { timelineId, position });
};

export const setTimelineProgress = (timelineId: string, progress: number) => {
  sendEditorEvent("set-timeline-progress", { timelineId, progress });
};

export const sendFrameDeSelectedEventToSite = (data: FrameEventData | null) => {
  sendEditorEvent("framedeselect", data);
};

export const sendFrameSelectedEventToSite = (data: FrameEventData | null) => {
  sendEditorEvent("frameselect", data);
};

export function sendScaleproportianallyEventToSite(data: boolean) {
  sendEditorEvent("scaleproportianally", data);
}

export function sendTranslateBooleanEventToSite(data: PointBoolean) {
  sendEditorEvent("translateboolean", data);
}

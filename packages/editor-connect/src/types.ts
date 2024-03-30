import variomotionLib, { IAnimationData } from "@variomotion/core";
import { Mode } from "@variomotion/transform";

export interface SocketEvent {
  socketChannelId: string;
  source: "site" | "editor";
  type:
    | "send-animation-data-to-site"
    | "send-animation-data-to-editor"
    | "send-timeline-states-to-editor"
    | "register-editor"
    | "pause-timeline"
    | "play-timeline"
    | "set-timeline-progress"
    | "frameselect"
    | "framedeselect"
    | "send-dimensions-to-editor"
    | "scaleproportianally"
    | "translateboolean"
    | "save-file";
  host: string;
  data: unknown;
}

export interface SocketEventSite extends SocketEvent {
  host: string;
  domTargets: Record<string, string[]>;
}

export type PlayPauseEventData = {
  timelineId: string;
  position?: number;
  scrollTo?: boolean;
};

export interface FrameEventData {
  pixelBased: boolean;
  timelineId: string;
  entryId: string;
  index: number;
  transformMode: Mode;
  breakpoint: string;
}
export interface DomtargetDimensions {
  clientRect: DOMRect;

  svgElement?: SVGSVGElement;
}

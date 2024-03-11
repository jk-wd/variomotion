import { uuidv4 } from "@variomotion/core";
import { writable } from "svelte/store";

export interface SocketState {
  socket?: WebSocket;
  socketChannelId: string;
}

export const socketState = writable<SocketState>({
  socketChannelId: uuidv4(),
});

let socket: WebSocket | undefined;

export const setupSocket = async (port: number) => {
  if (socket) {
    return socket;
  }
  return new Promise<WebSocket>((resolve) => {
    socket = new WebSocket("ws://localhost:" + port);
    socket.addEventListener("open", () => {
      resolve(socket!);
    });
  });
};

export const getSocket = () => {
  if (!socket) {
    throw new Error("Socket not initialized");
  }
  return socket;
};

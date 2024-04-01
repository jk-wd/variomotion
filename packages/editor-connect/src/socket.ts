let socket: WebSocket | undefined;

export const setupSocket = async (
  port: number
): Promise<WebSocket | undefined> => {
  if (socket) {
    return socket;
  }
  return new Promise<WebSocket>((resolve, reject) => {
    socket = new WebSocket("ws://localhost:" + port);
    socket.addEventListener("open", () => {
      resolve(socket!);
    });
    socket.addEventListener("close", (event) => {
      if (event.code === 1006) {
        reject();
      }
    });
  });
};

export const getSocket = () => {
  if (!socket) {
    throw new Error("Socket not initialized");
  }
  return socket;
};

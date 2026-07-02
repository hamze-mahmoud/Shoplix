import { io } from "socket.io-client";

// Single shared socket connection for the whole app.
const SOCKET_URL = "http://localhost:3000";

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: true,
      transports: ["websocket", "polling"],
    });
  }
  return socket;
}

// Join the user's personal room so the server can target real-time pushes.
export function joinUserRoom(userId) {
  if (!userId) return;
  const s = getSocket();
  const join = () => s.emit("join", userId);
  if (s.connected) join();
  s.on("connect", join); // re-join automatically on reconnect
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

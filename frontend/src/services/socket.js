
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_SOCKET_URL, {
  secure: true,
  transports: ["websocket"],
  withCredentials: true
});

export function connectSocket({ token } = {}) {
  if (!token) return socket;

  return io(import.meta.env.VITE_SOCKET_URL, {
    secure: true,
    transports: ["websocket"],
    withCredentials: true,
    auth: { token }
  });
}

export default socket;


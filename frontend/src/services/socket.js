import { io } from "socket.io-client";

const BASE = "http://3.209.223.219:3000";

export function connectSocket(token) {
  let t = token;
  if (!t) {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      t = u.token;
    } catch {}
  }

  return io(BASE, {
    transports: ["websocket"],
    query: { token: t || '' },
  });
}


import { io } from "socket.io-client";


const BASE = "/api";

export function connectSocket(token) {
  let t = token;

  if (!t) {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      t = u.token;
    } catch {}
  }

  return io(BASE, {
    path: "/socket.io",
    transports: ["websocket", "polling"],
    query: { token: t || "" },
  });
}



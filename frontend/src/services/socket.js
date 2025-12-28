import { io } from "socket.io-client";

const BASE = "http://3.209.223.219:3000";

export function connectSocket() {

  let authToken = "";

  try {
    authToken = localStorage.getItem("token") || "";
  } catch {}

  return io(BASE, {
    transports: ["polling"],
    upgrade: false,
    query: { token: authToken }
  });
}








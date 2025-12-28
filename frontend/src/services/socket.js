import io from "socket.io-client";


const BASE = "http://3.209.223.219:3000";

export function connectSocket(token) {
  let t = token;
  if (!t) {
    try {
      t = localStorage.getItem("token") || "";
    } catch {}
  }

  const token = t || "";
  return io(BASE, {
    transports: ["polling"],
    upgrade: false,
    query: { token }
  });
}

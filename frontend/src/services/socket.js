import io from "socket.io-client";


const BASE = "https://wmc-transport.vercel.app";

export function connectSocket(token) {
  let t = token;

  if (!t) {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      t = u.token;
    } catch {}
  }

  return io(BASE, {
    transports: ["polling"],
    upgrade: false,
    withCredentials: true,
    query: { token: t || "" }
  });
}

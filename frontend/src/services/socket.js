import { io } from "socket.io-client";

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function connectSocket(token) {
  // Prefer token passed in, else read from stored user
  let t = token;
  if (!t) {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      t = u.token;
    } catch {}
  }
  return io(BASE, {
    query: { token: t || '' },
  });
}

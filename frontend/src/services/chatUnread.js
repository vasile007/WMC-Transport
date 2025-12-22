const STORAGE_KEY = "chatUnreadCount";

function toInt(value) {
  const n = Number.parseInt(value, 10);
  return Number.isNaN(n) ? 0 : n;
}

function emitUpdate() {
  try {
    window.dispatchEvent(new CustomEvent("chat-unread"));
  } catch {}
}

export function getUnreadCount() {
  return toInt(localStorage.getItem(STORAGE_KEY) || "0");
}

export function incrementUnread() {
  const next = getUnreadCount() + 1;
  localStorage.setItem(STORAGE_KEY, String(next));
  emitUpdate();
  return next;
}

export function clearUnread() {
  localStorage.setItem(STORAGE_KEY, "0");
  emitUpdate();
}

export function subscribeUnread(handler) {
  window.addEventListener("chat-unread", handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("chat-unread", handler);
    window.removeEventListener("storage", handler);
  };
}

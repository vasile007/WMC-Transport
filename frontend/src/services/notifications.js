const STORAGE_KEY = "clientNotifications";
const MAX_ITEMS = 50;

function safeParse(value) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function listNotifications() {
  const items = safeParse(localStorage.getItem(STORAGE_KEY) || "[]");
  return items.sort((a, b) => (b.ts || 0) - (a.ts || 0));
}

export function addNotification({ text, type = "order", orderId }) {
  const items = safeParse(localStorage.getItem(STORAGE_KEY) || "[]");
  const next = {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    text: String(text || "").trim(),
    type,
    orderId: orderId || null,
    ts: Date.now(),
  };
  if (!next.text) return null;
  const updated = [next, ...items].slice(0, MAX_ITEMS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  try {
    window.dispatchEvent(new CustomEvent("client-notifications"));
  } catch {}
  return next;
}

export function clearNotifications() {
  localStorage.removeItem(STORAGE_KEY);
}

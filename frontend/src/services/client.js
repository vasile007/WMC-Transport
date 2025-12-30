const DEFAULT_API_URL = "https://api.wmc-transport.online";
const ENV_API_URL = (import.meta.env.VITE_API_URL || "").trim();
const BASE_URL = (ENV_API_URL || DEFAULT_API_URL).replace(/\/+$/, "");

function buildUrl(path) {
  if (!path) return BASE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  return path.startsWith("/") ? `${BASE_URL}${path}` : `${BASE_URL}/${path}`;
}

async function request(path, { method = "GET", token, body, raw } = {}) {
  const headers = {};
  if (!raw) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(buildUrl(path), {
    method,
    headers,
    body: raw ? body : body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    let err;
    try {
      err = await res.json();
    } catch {
      err = { error: res.statusText };
    }
    throw new Error(err.error || "Request failed");
  }
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

export const api = {
  get: (path, token) => request(path, { method: "GET", token }),
  post: (path, body, token) => request(path, { method: "POST", token, body }),
  patch: (path, body, token) => request(path, { method: "PATCH", token, body }),
};

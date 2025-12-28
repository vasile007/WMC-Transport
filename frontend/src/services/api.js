
//const BASE_URL = "/api";
//const API_URL = `${BASE_URL}`;

export const BASE_URL = "/api";
export const API_URL = BASE_URL;



export async function api(path, options = {}) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user?.token;

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json, text/plain;q=0.8, */*;q=0.5",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const contentType = res.headers.get("content-type") || "";
  let raw = "";
  try {
    raw = await res.text();
  } catch {}

  let data;
  if (contentType.includes("application/json")) {
    try { data = raw ? JSON.parse(raw) : undefined; } catch {}
  }

  if (!res.ok) {
    const message = (data && (data.error || data.message)) || raw || res.statusText;
    throw new Error(message || "Request failed");
  }

  if (data !== undefined) return data;
  if (!raw) return { ok: true };
  return { ok: true, data: raw };
}






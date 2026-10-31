import { API_URL } from "./config.js";

export class ApiError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/** Centralized fetch wrapper: base URL, cookies, JSON/form bodies, error normalization. */
export async function request(path, { method = "GET", body, form, signal } = {}) {
  const headers = {};
  let payload;
  if (form) {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    payload = new URLSearchParams(form).toString();
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, { method, headers, body: payload, credentials: "include", signal });
  } catch {
    throw new ApiError("Нет связи с сервером. Проверьте, что backend запущен.", 0);
  }
  if (!res.ok) {
    let detail = "";
    try {
      const json = await res.json();
      detail = typeof json.detail === "string" ? json.detail : JSON.stringify(json.detail ?? "");
    } catch { /* ignore */ }
    throw new ApiError(detail || `Сервер ответил ${res.status}`, res.status);
  }
  if (res.status === 204) return null;
  try { return await res.json(); } catch { return null; }
}

export const notSupported = (what) => () =>
  Promise.reject(new ApiError(`«${what}» пока не поддерживается backend`, 501));

const configuredApiUrl = import.meta.env.VITE_API_URL;

export const API_URL =
  configuredApiUrl ?? (import.meta.env.DEV ? "http://localhost:8000" : "");

export const USE_MOCKS =
  String(import.meta.env.VITE_USE_MOCKS ?? "true") !== "false";
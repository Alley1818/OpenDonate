export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
// Mocks are ON by default. Set VITE_USE_MOCKS=false to talk to the real backend.
export const USE_MOCKS = String(import.meta.env.VITE_USE_MOCKS ?? "true") !== "false";

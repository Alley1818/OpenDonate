// Single entry point for the UI. Switch between mocks and the real backend with VITE_USE_MOCKS.
import { USE_MOCKS } from "./config.js";
import { mockApi } from "../mocks/services.js";
import { realApi } from "./real/index.js";

export const api = USE_MOCKS ? mockApi : realApi;
export { ApiError } from "./client.js";
export { USE_MOCKS };

// Dev helper: wipes simulated data. Only available while mocks are enabled.
import { resetDb } from "../mocks/db.js";
export const resetDemoData = USE_MOCKS ? resetDb : null;

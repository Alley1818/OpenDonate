const configuredApiUrl = import.meta.env.VITE_API_URL;

export const API_URL = (configuredApiUrl?.trim() || "/api").replace(/\/+$/, "");
export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

// FastAPI currently assigns all new publications to account 1.
export const AUTHOR_USERNAME = USE_MOCKS ? "demo" : import.meta.env.VITE_AUTHOR_USERNAME?.trim();
const AUTHOR_ID = USE_MOCKS ? "u-demo" : "1";

export const isAuthor = (id) => String(id) === AUTHOR_ID;

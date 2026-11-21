import { useSyncExternalStore } from "react";

const KEY = "opendonate.prefs.v1";
const DEFAULTS = {
  theme: "light",
  readingSize: "normal",
  reduceMotion: false,
  notifyComments: true,
  notifyNews: false,
};
const listeners = new Set();
let preferences;

function readPreferences() {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY)) };
  } catch {
    return { ...DEFAULTS };
  }
}

const snapshot = () => (preferences ??= readPreferences());
const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export function isDarkTheme(prefs) {
  return prefs.theme === "dark" || (prefs.theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
}

function applyPreferences() {
  const current = snapshot();
  const dark = isDarkTheme(current);
  const root = document.documentElement;
  root.dataset.theme = dark ? "dark" : "light";
  root.dataset.motion = current.reduceMotion ? "reduced" : "full";
  root.dataset.readingSize = current.readingSize === "large" ? "large" : "normal";
  const background = getComputedStyle(root).getPropertyValue("--canvas").trim();
  if (background) document.querySelector('meta[name="theme-color"]')?.setAttribute("content", background);
}

function publish(next) {
  preferences = next;
  applyPreferences();
  listeners.forEach((listener) => listener());
}

function update(patch) {
  const next = { ...snapshot(), ...patch };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // The current window can still apply the preference.
  }
  publish(next);
}

export function initializePreferences() {
  applyPreferences();
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if (snapshot().theme === "system") publish({ ...snapshot() });
  });
  window.addEventListener("storage", (event) => {
    if (event.key === KEY || event.key === null) publish(readPreferences());
  });
}

export function usePreferences() {
  return [useSyncExternalStore(subscribe, snapshot), update];
}

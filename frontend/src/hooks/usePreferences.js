import { useCallback, useState } from "react";

const KEY = "opendonate.prefs.v1";
const DEFAULTS = { theme: "light", reduceMotion: false, notifyComments: true, notifyNews: false };

const read = () => {
  try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; } catch { return DEFAULTS; }
};

export function applyPreferences(p = read()) {
  const dark = p.theme === "dark" || (p.theme === "system" && window.matchMedia?.("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  document.documentElement.dataset.motion = p.reduceMotion ? "reduced" : "full";
}

/** UI preferences are purely client-side (localStorage) and are not meant to go through the API. */
export function usePreferences() {
  const [prefs, setPrefs] = useState(read);
  const update = useCallback((patch) => {
    setPrefs((current) => {
      const next = { ...current, ...patch };
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
      applyPreferences(next);
      return next;
    });
  }, []);
  return [prefs, update];
}

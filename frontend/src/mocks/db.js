// localStorage-backed state for the simulated backend.
import { DEMO_USER } from "./data.js";

const KEY = "opendonate.mock.v1";
const empty = () => ({ users: [DEMO_USER], session: null, posts: [], viewer: {}, comments: {} });
let cache = null;

function load() {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? { ...empty(), ...JSON.parse(raw) } : empty();
  } catch {
    cache = empty();
  }
  if (!cache.users.some((u) => u.id === DEMO_USER.id)) cache.users.unshift(DEMO_USER);
  return cache;
}

export const readDb = () => load();

export function writeDb(mutator) {
  const state = load();
  const result = mutator(state);
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage unavailable */ }
  return result;
}

export function resetDb() {
  cache = null;
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}

export function viewerOf(state, uid) {
  if (!uid) return null;
  if (!state.viewer[uid]) state.viewer[uid] = { likes: [], bookmarks: [], subs: {} };
  return state.viewer[uid];
}

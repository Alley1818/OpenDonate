import { API_URL } from "./config.js";

// The API writes reactions and does not return a viewer's reaction state. Bookmarks are local.
const memory = new Map();
const keyFor = (userId) => `opendonate.activity.v1.${API_URL}.${userId}`;

function read(userId) {
  const key = keyFor(userId);
  if (memory.has(key)) return memory.get(key);
  const empty = { bookmarks: [], likes: [] };
  try {
    const data = JSON.parse(localStorage.getItem(key));
    return Array.isArray(data?.bookmarks) && Array.isArray(data?.likes) ? data : empty;
  } catch {
    return empty;
  }
}

export function getActivity(userId, id) {
  const { bookmarks, likes } = userId ? read(userId) : { bookmarks: [], likes: [] };
  return { bookmarked: bookmarks.includes(String(id)), liked: likes.includes(String(id)) };
}

export function setActivity(userId, id, field, active) {
  const key = keyFor(userId);
  const data = read(userId);
  const value = String(id);
  const rest = data[field].filter((entry) => entry !== value);
  data[field] = active ? [value, ...rest] : rest;
  try {
    localStorage.setItem(key, JSON.stringify(data));
    memory.delete(key);
  } catch {
    memory.set(key, data);
  }
}

export function savedIds(userId) {
  return read(userId).bookmarks;
}

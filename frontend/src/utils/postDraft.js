const FIELDS = ["title", "content", "visibility"];
const VISIBILITIES = new Set(["public", "paid"]);
const temporaryDrafts = new Map();
const getLocalStorage = () => globalThis.localStorage;

export function postDraftKey({ apiUrl, demo, userId, postId }) {
  return `opendonate.draft.v1:${JSON.stringify([demo ? "demo" : "live", apiUrl, String(userId), postId == null ? null : String(postId)])}`;
}

export function draftChanges(initial, values) {
  return Object.fromEntries(FIELDS.filter((field) => initial[field] !== values[field]).map((field) => [field, values[field]]));
}

function parseChanges(raw) {
  try {
    const value = JSON.parse(raw);
    if (!value || typeof value !== "object") return {};
    return Object.fromEntries(FIELDS
      .filter((field) => typeof value[field] === "string" && (field !== "visibility" || VISIBILITIES.has(value[field])))
      .map((field) => [field, value[field]]));
  } catch {
    return {};
  }
}

export function readPostDraft(key, getStorage = getLocalStorage) {
  if (temporaryDrafts.has(key)) {
    const raw = temporaryDrafts.get(key);
    return { raw, changes: parseChanges(raw), persistent: false };
  }

  try {
    const raw = getStorage().getItem(key);
    return { raw, changes: parseChanges(raw), persistent: true };
  } catch {
    return { raw: null, changes: {}, persistent: false };
  }
}

export function writePostDraft(key, changes, getStorage = getLocalStorage) {
  const raw = Object.keys(changes).length ? JSON.stringify(changes) : null;
  try {
    const storage = getStorage();
    if (raw === null) storage.removeItem(key);
    else storage.setItem(key, raw);
    temporaryDrafts.delete(key);
    return { raw, changes, persistent: true };
  } catch {
    temporaryDrafts.set(key, raw);
    return { raw, changes, persistent: false };
  }
}

// Only clear the saved snapshot from this form so a newer draft from another tab can survive.
export function clearPostDraft(key, snapshot, getStorage = getLocalStorage) {
  const current = readPostDraft(key, getStorage);
  if (current.raw !== snapshot.raw || current.persistent !== snapshot.persistent) return;
  return writePostDraft(key, {}, getStorage);
}

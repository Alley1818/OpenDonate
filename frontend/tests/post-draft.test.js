import assert from "node:assert/strict";
import test from "node:test";
import { clearPostDraft, draftChanges, postDraftKey, readPostDraft, writePostDraft } from "../src/utils/postDraft.js";

const scope = { apiUrl: "/api", demo: false, userId: 1 };
const key = postDraftKey(scope);
const published = { title: "Привет", content: "Исходный текст", visibility: "public" };

function storage() {
  const items = new Map();
  const adapter = {
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => items.set(key, value),
    removeItem: (key) => items.delete(key),
  };
  return () => adapter;
}

test("draft keys isolate editing routes, accounts, backends and demo", () => {
  const keys = [
    scope,
    { ...scope, postId: 1 },
    { ...scope, userId: 2 },
    { ...scope, apiUrl: "https://other.example/api" },
    { ...scope, demo: true },
  ].map(postDraftKey);
  assert.equal(new Set(keys).size, keys.length);
  assert.equal(postDraftKey({ ...scope, postId: 1 }), postDraftKey({ ...scope, postId: "1" }));
});

test("stores only changed fields and keeps newer server content when restoring a title-only draft", () => {
  const store = storage();
  const changes = draftChanges(published, { ...published, title: "Новый заголовок" });
  assert.deepEqual(changes, { title: "Новый заголовок" });
  writePostDraft(key, changes, store);
  const restored = { ...published, content: "Обновлённый на сервере текст", ...readPostDraft(key, store).changes };
  assert.deepEqual(restored, { title: "Новый заголовок", content: "Обновлённый на сервере текст", visibility: "public" });
});

test("leaves a newer draft in storage when an earlier publication finishes", () => {
  const store = storage();
  const previous = writePostDraft(key, { title: "Первый заголовок" }, store);
  const newer = writePostDraft(key, { title: "Второй заголовок" }, store);
  assert.equal(clearPostDraft(key, previous, store), undefined);
  assert.deepEqual(readPostDraft(key, store).changes, newer.changes);
  clearPostDraft(key, newer, store);
  assert.deepEqual(readPostDraft(key, store).changes, {});
});

test("keeps a temporary draft in memory when browser storage is unavailable", () => {
  const keyWithDeniedStorage = postDraftKey({ ...scope, postId: "denied" });
  const unavailable = () => { throw new Error("Storage denied"); };
  const draft = writePostDraft(keyWithDeniedStorage, { content: "Черновик" }, unavailable);
  assert.equal(draft.persistent, false);
  assert.deepEqual(readPostDraft(keyWithDeniedStorage, unavailable), draft);
  clearPostDraft(keyWithDeniedStorage, draft, unavailable);
  assert.deepEqual(readPostDraft(keyWithDeniedStorage, unavailable).changes, {});
});

test("ignores unsupported fields and values in stored drafts", () => {
  const store = storage();
  store().setItem(key, '{"title":"Черновик","content":false,"visibility":"bad","unrelated":"ignored"}');
  assert.deepEqual(readPostDraft(key, store).changes, { title: "Черновик" });
  store().setItem(key, '{');
  assert.deepEqual(readPostDraft(key, store).changes, {});
});

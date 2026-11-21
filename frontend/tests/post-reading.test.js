import assert from "node:assert/strict";
import test from "node:test";
import { postOutline, readerReturn, readingAnchor, readingMinutes } from "../src/utils/postReading.js";

const text = (value) => ({ type: "text", text: value });
const heading = (value, level = 2) => ({ type: "heading", attrs: { level }, content: [text(value)] });

test("reading time counts visible text in plain and formatted publications", () => {
  assert.equal(readingMinutes("?! —"), 0);
  assert.equal(readingMinutes(JSON.stringify({ type: "doc", content: [{ type: "paragraph" }] })), 0);
  assert.equal(readingMinutes("Слово ".repeat(200)), 1);
  const content = [{ type: "paragraph", content: [text("Слово ".repeat(201))] }];
  assert.equal(readingMinutes(JSON.stringify({ type: "doc", content })), 2);
});

test("the same publication generates stable, unique anchors in document order", () => {
  const first = heading("Введение");
  const nested = heading("Введение", 3);
  const collision = heading("Введение-2");
  const empty = heading("   ");
  const malformed = heading({ toString: null });
  const doc = { type: "doc", content: [first, { type: "blockquote", content: [nested] }, collision, empty, malformed] };
  const { entries, anchors } = postOutline(doc);
  assert.deepEqual(entries, [
    { id: "section-введение", label: "Введение", level: 2 },
    { id: "section-введение-2", label: "Введение", level: 3 },
    { id: "section-введение-2-2", label: "Введение-2", level: 2 },
  ]);
  assert.equal(anchors.get(nested), entries[1].id);
  assert.equal(anchors.has(empty), false);
  assert.deepEqual(postOutline(structuredClone(doc)).entries, entries);
});

test("only reader anchors and internal return destinations are used", () => {
  assert.equal(readingAnchor(`#${encodeURIComponent("section-текст")}`), "section-текст");
  assert.equal(readingAnchor("#comments"), "comments");
  assert.equal(readingAnchor("#main"), "");
  assert.equal(readingAnchor("#%zz"), "");
  assert.deepEqual(readerReturn("/explore?q=archive&filter=public"), { to: "/explore?q=archive&filter=public", label: "К поиску" });
  assert.deepEqual(readerReturn("/saved"), { to: "/saved", label: "К закладкам" });
  assert.equal(readerReturn("//outside.test/").to, "/");
  assert.equal(readerReturn("/\\outside.test/").to, "/");
});

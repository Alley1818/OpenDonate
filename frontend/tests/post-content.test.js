import assert from "node:assert/strict";
import test from "node:test";
import { postContentText, readPostDocument } from "../src/utils/postContent.js";

const serialized = (content) => JSON.stringify({ type: "doc", content });
const text = (value, marks) => ({ type: "text", text: value, marks });
const paragraph = (...content) => ({ type: "paragraph", content });

test("reads legacy publication text and blank documents", () => {
  assert.equal(postContentText(serialized([{ type: "paragraph" }])), "");
  assert.equal(postContentText(serialized([paragraph(text("Всем привет")), paragraph()])), "Всем привет");
});

test("keeps inline marks adjacent and separates paragraphs and line breaks", () => {
  const document = serialized([
    paragraph(text("При"), text("вет", [{ type: "bold" }]), { type: "hardBreak" }, text("Строка")),
    paragraph(text("Следующий абзац")),
  ]);
  assert.equal(postContentText(document), "Привет\nСтрока\nСледующий абзац");
});

test("preserves plain text, JSON examples and malformed documents", () => {
  for (const plain of ["  Привет, Мир!\n", "{пример}", '{"type":"example","content":[]}', '{"type":"doc","content":"example"}']) {
    assert.equal(readPostDocument(plain), null);
    assert.equal(postContentText(plain), plain);
  }
});

test("extracts known content from incomplete nested nodes", () => {
  const document = serialized([
    null,
    paragraph(null, text("Текст")),
    { type: "unknown", content: { damaged: true } },
    { type: "figureImage", attrs: { caption: "Подпись" } },
    { type: "figureImage", attrs: { caption: "Черновое фото", pendingId: "local" } },
  ]);
  assert.equal(postContentText(document), "Текст\n\nПодпись");
});

export const MAX_POST_NODE_DEPTH = 64;

const INLINE_CONTENT = new Set(["paragraph", "heading", "codeBlock"]);

export function readPostDocument(value) {
  if (typeof value !== "string" || !value.trimStart().startsWith("{")) return null;

  try {
    const document = JSON.parse(value);
    if (document?.type === "doc" && (!Object.hasOwn(document, "content") || Array.isArray(document.content))) {
      return document;
    }
  } catch {
    // A plain-text post can begin with an opening brace.
  }
  return null;
}

export function postNodeChildren(node) {
  return Array.isArray(node?.content)
    ? node.content.filter((child) => typeof child?.type === "string")
    : [];
}

function nodeText(node, depth = 0) {
  if (depth >= MAX_POST_NODE_DEPTH) return "";
  if (node.type === "text") return typeof node.text === "string" ? node.text : "";
  if (node.type === "hardBreak") return "\n";
  if (node.type === "image" || node.type === "figureImage") {
    const { caption, alt, pendingId } = node.attrs || {};
    if (pendingId) return "";
    return [caption, alt].find((value) => typeof value === "string" && value.trim()) || "";
  }

  const separator = INLINE_CONTENT.has(node.type) ? "" : "\n";
  return postNodeChildren(node).map((child) => nodeText(child, depth + 1)).join(separator);
}

export function postContentText(value) {
  const document = readPostDocument(value);
  if (document) return nodeText(document).trim();
  return typeof value === "string" ? value : "";
}

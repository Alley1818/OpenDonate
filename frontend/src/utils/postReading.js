import { MAX_POST_NODE_DEPTH, postContentText, postNodeChildren } from "./postContent.js";

const anchorPrefix = "section-";

export function readingMinutes(content) {
  const words = postContentText(content).match(/[\p{L}\p{N}]+(?:[-’'][\p{L}\p{N}]+)*/gu);
  return Math.ceil((words?.length ?? 0) / 200);
}

export function postOutline(document) {
  const entries = [];
  const anchors = new WeakMap();
  const used = new Set();

  function visit(node, depth) {
    if (depth >= MAX_POST_NODE_DEPTH) return;
    const children = postNodeChildren(node);
    if (node.type === "heading") {
      const label = children.map((child) => {
        if (child.type === "hardBreak") return " ";
        return child.type === "text" && typeof child.text === "string" ? child.text : "";
      }).join("").replace(/\s+/g, " ").trim();
      if (label) {
        const slug = label.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "");
        const base = anchorPrefix + (slug || "heading");
        let id = base;
        for (let suffix = 2; used.has(id); suffix += 1) id = `${base}-${suffix}`;
        used.add(id);
        anchors.set(node, id);
        const level = node.attrs?.level === 1 || node.attrs?.level === 2 ? 2 : 3;
        entries.push({ id, label, level });
      }
    }
    children.forEach((child) => visit(child, depth + 1));
  }

  if (document) visit(document, 0);
  return { entries, anchors };
}

export function readingAnchor(hash) {
  try {
    const id = decodeURIComponent(hash.slice(1));
    return id === "comments" || id.startsWith(anchorPrefix) ? id : "";
  } catch {
    return "";
  }
}

export function readerReturn(returnTo) {
  const fallback = { to: "/", label: "К публикациям" };
  if (typeof returnTo !== "string" || !/^\/(?:$|[^/\\])/.test(returnTo)) return fallback;

  const path = returnTo.split(/[?#]/, 1)[0];
  if (path === "/") {
    return { to: returnTo, label: returnTo.startsWith("/?") ? "К результатам ленты" : fallback.label };
  }

  if (path === "/explore") return { to: returnTo, label: "К поиску" };
  if (path === "/saved") return { to: returnTo, label: "К закладкам" };
  if (path === "/author" || /^\/creators\/[^/\\]+$/.test(path)) return { to: returnTo, label: "К автору" };
  return fallback;
}

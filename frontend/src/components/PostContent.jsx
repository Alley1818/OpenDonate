import { Fragment, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { Clock3 } from "lucide-react";
import { MAX_POST_NODE_DEPTH, postNodeChildren, readPostDocument } from "../utils/postContent.js";
import { postOutline, readingMinutes } from "../utils/postReading.js";

const WEB_PROTOCOLS = new Set(["https:", "http:"]);
const LINK_PROTOCOLS = new Set([...WEB_PROTOCOLS, "mailto:"]);

function allowedUrl(value, protocols) {
  if (typeof value !== "string") return "";
  try {
    const url = new URL(value);
    return protocols.has(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

function renderText(node) {
  if (typeof node.text !== "string") return null;
  const marks = Array.isArray(node.marks) ? node.marks : [];
  return marks.reduce((text, mark) => {
    switch (mark?.type) {
      case "bold": return <strong>{text}</strong>;
      case "italic": return <em>{text}</em>;
      case "underline": return <u>{text}</u>;
      case "strike": return <s>{text}</s>;
      case "code": return <code>{text}</code>;
      case "link": {
        const href = allowedUrl(mark.attrs?.href, LINK_PROTOCOLS);
        return href ? <a href={href} rel="noopener noreferrer nofollow" target="_blank">{text}</a> : text;
      }
      default: return text;
    }
  }, node.text);
}

function renderImage({ src, pendingId, alt, caption } = {}) {
  const url = allowedUrl(src, WEB_PROTOCOLS);
  if (!url || pendingId) return null;
  return (
    <figure>
      <img src={url} alt={typeof alt === "string" ? alt : ""} loading="lazy" />
      {typeof caption === "string" && caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

function renderNode(node, depth, anchors) {
  if (depth >= MAX_POST_NODE_DEPTH) return null;
  const children = renderChildren(node, depth, anchors);

  switch (node.type) {
    case "text": return renderText(node);
    case "paragraph": return children.length ? <p>{children}</p> : null;
    case "heading": {
      const level = node.attrs?.level;
      const Heading = level === 1 || level === 2 ? "h2" : "h3";
      const id = anchors?.get(node);
      return children.length ? <Heading id={id} className={id ? "reading-anchor" : undefined} tabIndex={id ? -1 : undefined}>{children}</Heading> : null;
    }
    case "hardBreak": return <br />;
    case "horizontalRule": return <hr />;
    case "blockquote": return <blockquote>{children}</blockquote>;
    case "bulletList": return <ul>{children}</ul>;
    case "orderedList": {
      const start = node.attrs?.start;
      return <ol start={Number.isSafeInteger(start) && start > 0 ? start : undefined}>{children}</ol>;
    }
    case "listItem": return <li>{children}</li>;
    case "codeBlock": return <pre><code>{children}</code></pre>;
    case "image":
    case "figureImage": return renderImage(node.attrs || undefined);
    default: return children.length ? children : null;
  }
}

function renderChildren(node, depth = 0, anchors) {
  return postNodeChildren(node).flatMap((child, index) => {
    const rendered = renderNode(child, depth + 1, anchors);
    return rendered === null ? [] : <Fragment key={index}>{rendered}</Fragment>;
  });
}

function ReadingOutline({ entries }) {
  const { pathname, search, state } = useLocation();
  return (
    <nav className="reading-outline" aria-label="Содержание публикации">
      <p className="reading-outline-title">Содержание</p>
      <ol className="reading-outline-list">
        {entries.map(({ id, label, level }) => (
          <li key={id} data-level={level}>
            <Link to={{ pathname, search, hash: `#${encodeURIComponent(id)}` }} state={state}>{label}</Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default function PostContent({ content, className, reader = false }) {
  const document = useMemo(() => readPostDocument(content), [content]);
  const outline = useMemo(() => reader && document ? postOutline(document) : null, [reader, document]);
  const minutes = useMemo(() => reader ? readingMinutes(content) : 0, [reader, content]);
  const children = document ? renderChildren(document, 0, outline?.anchors) : [];

  return (
    <>
      {minutes > 0 && <p className="reading-meta"><Clock3 size={15} aria-hidden="true" /> {minutes} мин чтения</p>}
      {outline?.entries.length > 1 && <ReadingOutline entries={outline.entries} />}
      {document ? (
        children.length > 0 && <div className={className}>{children}</div>
      ) : (
        typeof content === "string" && content.trim() && <p className={className}>{content}</p>
      )}
    </>
  );
}

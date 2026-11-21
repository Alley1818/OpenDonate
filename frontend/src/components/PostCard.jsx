import { useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowUpRight, Bookmark, Heart, Link2, Lock, MessageCircle } from "lucide-react";
import Avatar from "./Avatar.jsx";
import VisibilityBadge from "./VisibilityBadge.jsx";
import PostContent from "./PostContent.jsx";
import { api, USE_MOCKS } from "../api/index.js";
import { useAuth } from "../hooks/useAuth.jsx";
import { useToast } from "../hooks/useToast.jsx";
import { useRequireAuth } from "../hooks/useRequireAuth.js";
import { formatCount, formatDate } from "../utils/format.js";
import { postContentText } from "../utils/postContent.js";

export default function PostCard({ post, onChange, detail = false }) {
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const guard = useRequireAuth();
  const location = useLocation();
  const pending = useRef(false);
  const [busy, setBusy] = useState(false);
  const { author } = post;
  const locked = post.locked || (!USE_MOCKS && post.visibility === "paid" && String(post.authorId) !== String(user?.id));
  const visibleContent = locked && !USE_MOCKS ? "" : post.content;
  const text = detail ? "" : postContentText(visibleContent).replace(/\s+/g, " ").trim();
  const published = post.createdAt && Number.isFinite(Date.parse(post.createdAt)) ? formatDate(post.createdAt) : "";
  const postPath = `/posts/${post.id}`;
  const returnTo = location.pathname + location.search + location.hash;

  const run = (action, message) => guard(async () => {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    try {
      const next = await action(post.id, { userId: user.id, post });
      onChange?.(next);
      if (message) toast(message(next), "success");
    } catch (error) {
      toast(error.message, "error");
    } finally {
      pending.current = false;
      setBusy(false);
    }
  });

  const share = async () => {
    try {
      await navigator.clipboard.writeText(new URL(postPath, window.location.href).href);
      toast("Ссылка скопирована", "success");
    } catch {
      toast("Не удалось скопировать ссылку", "error");
    }
  };

  return (
    <article className={`post-card ${detail ? "is-detail" : ""}`}>
      <header className="post-head">
        {detail ? (
          <Link to="/author" className="post-byline">
            <Avatar user={author} />
            <span><strong>{author.displayName}</strong>{published && <time dateTime={post.createdAt}>{published}</time>}</span>
          </Link>
        ) : published && <time className="post-date" dateTime={post.createdAt}>{published}</time>}
        <VisibilityBadge visibility={post.visibility} />
      </header>

      <div className="post-body">
        {detail ? <h1 className="post-title">{post.title}</h1> : (
          <h2 className="post-title">
            <Link to={postPath} state={{ returnTo }}>
              <span>{post.title}</span><ArrowUpRight className="post-title-arrow" size={20} aria-hidden="true" />
            </Link>
          </h2>
        )}
        {detail ? <PostContent content={visibleContent} className="post-text post-content" reader={!locked} /> : text && <p className="post-text clamp">{text}</p>}
        {locked && (
          <div className="locked-box">
            <div className="lock-circle"><Lock size={18} aria-hidden="true" /></div>
            <div><strong>Контент для подписчиков</strong><p>{USE_MOCKS ? "Оформите подписку, чтобы прочитать публикацию полностью." : "Доступ к этой публикации пока закрыт."}</p></div>
            {USE_MOCKS && <Link className="btn btn-primary btn-sm" to="/author">Поддержать</Link>}
          </div>
        )}
      </div>

      <footer className="post-actions">
        <button type="button" className="action" onClick={run(api.posts.toggleLike)} disabled={busy || loading} aria-pressed={Boolean(post.liked)} aria-label="Нравится" title="Нравится">
          <Heart size={18} fill={post.liked ? "currentColor" : "none"} aria-hidden="true" />{USE_MOCKS && <span>{formatCount(post.likes)}</span>}
        </button>
        {USE_MOCKS && <Link className="action" to={`${postPath}#comments`} state={detail ? location.state : { returnTo }} aria-label="Комментарии"><MessageCircle size={18} aria-hidden="true" /><span>{formatCount(post.comments)}</span></Link>}
        <button type="button" className="action" onClick={share} aria-label="Скопировать ссылку" title="Скопировать ссылку"><Link2 size={18} aria-hidden="true" /></button>
        <button type="button" className="action push-right" onClick={run(api.posts.toggleBookmark, (next) => next.bookmarked ? "Добавлено в сохранённое" : "Удалено из сохранённого")} disabled={busy || loading} aria-pressed={Boolean(post.bookmarked)} aria-label="Сохранить" title="Закладка">
          <Bookmark size={18} fill={post.bookmarked ? "currentColor" : "none"} aria-hidden="true" />
        </button>
      </footer>
    </article>
  );
}

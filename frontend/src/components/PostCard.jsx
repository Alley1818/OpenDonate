import { Link } from "react-router-dom";
import { Bookmark, Check, Heart, Link2, Lock, MessageCircle } from "lucide-react";
import Avatar from "./Avatar.jsx";
import VisibilityBadge from "./VisibilityBadge.jsx";
import { api } from "../api/index.js";
import { useToast } from "../hooks/useToast.jsx";
import { useRequireAuth } from "../hooks/useRequireAuth.js";
import { formatCount, timeAgo } from "../utils/format.js";

export default function PostCard({ post, onChange, detail = false }) {
  const { toast } = useToast();
  const guard = useRequireAuth();
  const { author } = post;

  const run = (fn, message) => guard(async () => {
    try {
      const next = await fn(post.id);
      onChange?.(next);
      if (message) toast(message(next), "success");
    } catch (e) {
      toast(e.message, "error");
    }
  });
  const like = run(api.posts.toggleLike);
  const bookmark = run(api.posts.toggleBookmark, (n) => (n.bookmarked ? "Добавлено в сохранённое" : "Удалено из сохранённого"));
  const share = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/posts/${post.id}`);
      toast("Ссылка скопирована", "success");
    } catch {
      toast("Не удалось скопировать ссылку", "error");
    }
  };

  return (
    <article className={`post-card ${detail ? "is-detail" : ""}`}>
      <header className="post-head">
        <Link to={`/creators/${author.username}`} aria-label={`Профиль ${author.displayName}`}><Avatar user={author} /></Link>
        <div className="post-author">
          <div className="author-line">
            <Link to={`/creators/${author.username}`} className="author-name">{author.displayName}</Link>
            {author.verified && <Check className="verified" size={14} aria-label="Проверенный автор" />}
            <span>@{author.username}</span><i>·</i><time dateTime={post.createdAt}>{timeAgo(post.createdAt)}</time>
          </div>
        </div>
        <VisibilityBadge visibility={post.visibility} />
      </header>

      <div className="post-body">
        <h3 className="post-title">{detail ? post.title : <Link to={`/posts/${post.id}`}>{post.title}</Link>}</h3>
        <p className={`post-text ${detail ? "" : "clamp"}`}>{post.content}</p>
        {post.locked && (
          <div className="locked-box">
            <div className="lock-circle"><Lock size={18} /></div>
            <div><strong>Контент для подписчиков</strong><p>Оформите подписку, чтобы прочитать публикацию полностью.</p></div>
            <Link className="btn btn-primary btn-sm" to={`/creators/${author.username}?tab=tiers`}>Поддержать</Link>
          </div>
        )}
      </div>

      <footer className="post-actions">
        <button className={`action ${post.liked ? "on" : ""}`} onClick={like} aria-pressed={post.liked} aria-label="Нравится">
          <Heart size={18} fill={post.liked ? "currentColor" : "none"} /><span>{formatCount(post.likes)}</span>
        </button>
        <Link className="action" to={`/posts/${post.id}#comments`} aria-label="Комментарии"><MessageCircle size={18} /><span>{formatCount(post.comments)}</span></Link>
        <button className="action" onClick={share} aria-label="Скопировать ссылку"><Link2 size={18} /></button>
        <button className={`action push-right ${post.bookmarked ? "on" : ""}`} onClick={bookmark} aria-pressed={post.bookmarked} aria-label="Сохранить">
          <Bookmark size={18} fill={post.bookmarked ? "currentColor" : "none"} />
        </button>
      </footer>
    </article>
  );
}

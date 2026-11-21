import { ArrowDown } from "lucide-react";
import { usePostPages } from "../hooks/usePostPages.js";
import PostCard from "./PostCard.jsx";
import { EmptyState, ErrorState, PostSkeletons } from "./States.jsx";

export default function PostResults({ userId, match, empty, moreLabel = "Показать ещё" }) {
  const { items, initial, busy, error, more, load, update } = usePostPages({ userId, match });
  if (initial) return <PostSkeletons count={2} />;
  if (!items.length && !more && !error) return <EmptyState {...empty} />;

  return (
    <div className="post-results">
      {items.map((post) => <PostCard key={post.id} post={post} onChange={update} />)}
      {error && <ErrorState error={error} onRetry={load} />}
      {more && !error && (
        <div className="feed-more">
          {!items.length && !busy && <p role="status">На просмотренных страницах пока ничего не найдено.</p>}
          <button className="btn btn-secondary" type="button" onClick={load} disabled={busy}>
            <ArrowDown size={16} aria-hidden="true" /> {busy ? "Загружаем…" : moreLabel}
          </button>
        </div>
      )}
    </div>
  );
}

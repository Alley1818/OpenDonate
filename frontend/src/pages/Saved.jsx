import { Link } from "react-router-dom";
import { Bookmark } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import PostCard from "../components/PostCard.jsx";
import { EmptyState, ErrorState, PostSkeletons } from "../components/States.jsx";
import { api } from "../api/index.js";
import { useAsync } from "../hooks/useAsync.js";
import { useAuth } from "../hooks/useAuth.jsx";

export default function Saved() {
  const { user } = useAuth();
  const { data, loading, error, reload, setData } = useAsync(() => api.posts.listBookmarked(user.id), [user.id]);
  const update = (next) => setData((l) => (next.bookmarked ? l.map((p) => (p.id === next.id ? next : p)) : l.filter((p) => p.id !== next.id)));

  return (
    <>
      <PageHeader title="Закладки" subtitle="Сохранённые публикации" />
      <div className="saved-results">
        {loading ? <PostSkeletons count={2} /> : error ? <ErrorState error={error} onRetry={reload} /> : data?.length ? (
          <div className="post-results">{data.map((post) => <PostCard key={post.id} post={post} onChange={update} />)}</div>
        ) : <EmptyState icon={Bookmark} title="Здесь пока пусто" text="Нажмите на закладку у публикации, чтобы сохранить её." action={<Link className="btn btn-secondary" to="/">Перейти в ленту</Link>} />}
      </div>
    </>
  );
}

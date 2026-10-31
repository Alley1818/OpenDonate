import { Link } from "react-router-dom";
import { Bookmark } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import PostCard from "../components/PostCard.jsx";
import { EmptyState, ErrorState, PostSkeletons } from "../components/States.jsx";
import { api } from "../api/index.js";
import { useAsync } from "../hooks/useAsync.js";

export default function Saved() {
  const { data, loading, error, reload, setData } = useAsync(() => api.posts.listBookmarked(), []);
  const update = (next) => setData((l) => (next.bookmarked ? l.map((p) => (p.id === next.id ? next : p)) : l.filter((p) => p.id !== next.id)));

  return (
    <>
      <PageHeader title="Сохранённое" subtitle="Публикации, к которым хочется вернуться" />
      {loading ? <PostSkeletons count={2} /> : error ? <ErrorState error={error} onRetry={reload} /> : data?.length ? data.map((p) => <PostCard key={p.id} post={p} onChange={update} />) : (
        <EmptyState icon={Bookmark} title="Здесь пока пусто" text="Нажмите на закладку у публикации, чтобы сохранить её." action={<Link className="btn btn-secondary" to="/">Перейти в ленту</Link>} />
      )}
    </>
  );
}

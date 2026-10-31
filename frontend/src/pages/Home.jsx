import { useState } from "react";
import { Link } from "react-router-dom";
import { Inbox, Users } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import Tabs from "../components/Tabs.jsx";
import Avatar from "../components/Avatar.jsx";
import PostCard from "../components/PostCard.jsx";
import ComposerModal from "../components/ComposerModal.jsx";
import { EmptyState, ErrorState, PostSkeletons } from "../components/States.jsx";
import { api } from "../api/index.js";
import { useAuth } from "../hooks/useAuth.jsx";
import { useAsync } from "../hooks/useAsync.js";
import { useRequireAuth } from "../hooks/useRequireAuth.js";

const FILTERS = [
  { value: "all", label: "Все" },
  { value: "following", label: "Подписки" },
  { value: "public", label: "Открытые" },
  { value: "paid", label: "Платные" },
];

export default function Home() {
  const { user } = useAuth();
  const guard = useRequireAuth();
  const [filter, setFilter] = useState("all");
  const [composer, setComposer] = useState(false);
  const { data, loading, error, reload, setData } = useAsync(() => api.posts.list({ filter }), [filter, user?.id]);

  const update = (next) => setData((list) => list.map((p) => (p.id === next.id ? next : p)));
  const created = (post) => {
    if (filter === "all" || filter === "following" || filter === post.visibility) setData((list) => [post, ...(list || [])]);
  };

  return (
    <>
      <PageHeader title="Лента" subtitle="Публикации авторов, которых вы читаете" />
      <section className="composer-card">
        {user ? <Avatar user={user} size={42} /> : <span className="avatar-placeholder" />}
        <button className="composer-trigger" onClick={guard(() => setComposer(true))}>
          {user ? "Что нового? Поделитесь с аудиторией…" : "Войдите, чтобы создавать публикации"}
        </button>
        <button className="btn btn-primary btn-sm" onClick={guard(() => setComposer(true))}>Создать</button>
      </section>
      <Tabs label="Фильтры ленты" items={FILTERS} value={filter} onChange={setFilter} />

      {loading ? <PostSkeletons /> : error ? <ErrorState error={error} onRetry={reload} /> : data?.length ? (
        <div>{data.map((p) => <PostCard key={p.id} post={p} onChange={update} />)}</div>
      ) : filter === "following" ? (
        <EmptyState icon={Users} title="Пока нет публикаций" text={user ? "Подпишитесь на авторов, и их публикации появятся здесь." : "Войдите и подпишитесь на авторов, чтобы видеть их публикации."}
          action={<Link className="btn btn-secondary" to={user ? "/explore" : "/login"}>{user ? "Найти авторов" : "Войти"}</Link>} />
      ) : (
        <EmptyState icon={Inbox} title="Лента пуста" text="Публикаций с таким фильтром пока нет." action={<button className="btn btn-secondary" onClick={() => setFilter("all")}>Показать все</button>} />
      )}
      <ComposerModal open={composer} onClose={() => setComposer(false)} onCreated={created} />
    </>
  );
}

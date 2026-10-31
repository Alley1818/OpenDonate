import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Compass, Search, SearchX } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import CreatorCard from "../components/CreatorCard.jsx";
import PostCard from "../components/PostCard.jsx";
import SubscribeModal from "../components/SubscribeModal.jsx";
import { EmptyState, ErrorState, PostSkeletons } from "../components/States.jsx";
import { api } from "../api/index.js";
import { useAuth } from "../hooks/useAuth.jsx";
import { useAsync } from "../hooks/useAsync.js";
import { useRequireAuth } from "../hooks/useRequireAuth.js";

export default function Explore() {
  const { user } = useAuth();
  const guard = useRequireAuth();
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const category = params.get("category") || "";
  const [text, setText] = useState(q);
  const [target, setTarget] = useState(null);

  useEffect(() => { setText(q); }, [q]);
  useEffect(() => {
    if (text === q) return undefined;
    const t = setTimeout(() => setParams((p) => { const n = new URLSearchParams(p); text.trim() ? n.set("q", text.trim()) : n.delete("q"); return n; }, { replace: true }), 300);
    return () => clearTimeout(t);
  }, [text, q, setParams]);

  const setCategory = (c) => setParams((p) => { const n = new URLSearchParams(p); c ? n.set("category", c) : n.delete("category"); return n; });
  const categories = useAsync(() => api.creators.categories(), []);
  const creators = useAsync(() => api.creators.list({ q, category }), [q, category, user?.id]);
  const posts = useAsync(() => api.posts.list({ q }), [q, user?.id]);

  const updateCreator = (next) => creators.setData((l) => l.map((c) => (c.id === next.id ? next : c)));
  const updatePost = (next) => posts.setData((l) => l.map((p) => (p.id === next.id ? next : p)));
  const postList = (posts.data || []).slice(0, q ? 12 : 3);

  return (
    <>
      <PageHeader title="Обзор" subtitle="Находите авторов и публикации по душе" />
      <div className="explore-search">
        <label className="search-box big" htmlFor="explore-q"><Search size={18} />
          <input id="explore-q" value={text} onChange={(e) => setText(e.target.value)} placeholder="Автор, тема или название публикации" />
        </label>
      </div>
      <div className="chips" role="group" aria-label="Категории">
        <button className={`chip ${!category ? "selected" : ""}`} onClick={() => setCategory("")}>Все</button>
        {(categories.data || []).map((c) => <button key={c} className={`chip ${category === c ? "selected" : ""}`} aria-pressed={category === c} onClick={() => setCategory(c)}>{c}</button>)}
      </div>

      <section className="section">
        <h2 className="section-title">{q ? "Авторы" : "Популярные авторы"}</h2>
        {creators.loading ? <PostSkeletons count={1} /> : creators.error ? <ErrorState error={creators.error} onRetry={creators.reload} /> : creators.data?.length ? (
          <div className="creator-grid">{creators.data.map((c) => <CreatorCard key={c.id} creator={c} onSupport={guard(setTarget)} />)}</div>
        ) : <EmptyState icon={SearchX} title="Авторы не найдены" text="Попробуйте изменить запрос или выбрать другую категорию." action={<button className="btn btn-secondary" onClick={() => { setParams({}); setText(""); }}>Сбросить фильтры</button>} />}
      </section>

      <section className="section">
        <h2 className="section-title">{q ? "Публикации" : "Свежие публикации"}</h2>
        {posts.loading ? <PostSkeletons count={2} /> : posts.error ? <ErrorState error={posts.error} onRetry={posts.reload} /> : postList.length ? (
          postList.map((p) => <PostCard key={p.id} post={p} onChange={updatePost} />)
        ) : <EmptyState icon={Compass} title="Публикаций не найдено" text="По вашему запросу ничего нет." />}
      </section>

      <SubscribeModal creator={target} open={!!target} onClose={() => setTarget(null)} onChange={(next) => { updateCreator(next); setTarget(next); posts.reload(); }} />
    </>
  );
}

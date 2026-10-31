import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Check, FileText, Heart, Users } from "lucide-react";
import Avatar from "../components/Avatar.jsx";
import Tabs from "../components/Tabs.jsx";
import PostCard from "../components/PostCard.jsx";
import TierCard from "../components/TierCard.jsx";
import SubscribeModal from "../components/SubscribeModal.jsx";
import { EmptyState, ErrorState, PostSkeletons, Spinner } from "../components/States.jsx";
import { api } from "../api/index.js";
import { useAuth } from "../hooks/useAuth.jsx";
import { useAsync } from "../hooks/useAsync.js";
import { useRequireAuth } from "../hooks/useRequireAuth.js";
import { formatCount } from "../utils/format.js";

export default function Creator() {
  const { username } = useParams();
  const { user } = useAuth();
  const guard = useRequireAuth();
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") === "tiers" ? "tiers" : "posts";
  const [modal, setModal] = useState({ open: false, tier: null });

  const creator = useAsync(() => api.creators.get(username), [username, user?.id]);
  const c = creator.data;
  const posts = useAsync(() => api.posts.listByAuthor(c.id), [c?.id, c?.subscribed, user?.id], { enabled: !!c });
  const updatePost = (next) => posts.setData((l) => l.map((p) => (p.id === next.id ? next : p)));
  const openModal = guard((tier) => setModal({ open: true, tier: tier?.id || null }));

  if (creator.loading) return <Spinner />;
  if (creator.error) {
    return creator.error.status === 404
      ? <EmptyState icon={Users} title="Автор не найден" text={`Профиля @${username} не существует.`} action={<Link className="btn btn-secondary" to="/explore">К обзору</Link>} />
      : <ErrorState error={creator.error} onRetry={creator.reload} />;
  }

  return (
    <>
      <div className="cover" style={{ background: c.coverColor }} role="img" aria-label="Обложка профиля"><span>{c.displayName[0]}</span></div>
      <section className="profile-head">
        <div className="profile-avatar"><Avatar user={c} size={88} /></div>
        <div className="profile-main">
          <h1>{c.displayName}{c.verified && <Check className="verified" size={18} aria-label="Проверенный автор" />}</h1>
          <p className="muted">@{c.username} · <span className="chip chip-static">{c.category}</span></p>
          <p className="profile-bio">{c.bio || "Автор пока ничего не рассказал о себе."}</p>
          <div className="stats">
            <span><strong>{formatCount(c.subscribers)}</strong> подписчиков</span>
            <span><strong>{c.postsCount}</strong> публикаций</span>
          </div>
        </div>
        <div className="profile-actions">
          {c.isMe ? <Link className="btn btn-secondary" to="/settings">Редактировать профиль</Link>
            : c.tiers.length > 0 && <button className={`btn ${c.subscribed ? "btn-secondary" : "btn-primary"}`} onClick={() => openModal()}><Heart size={16} /> {c.subscribed ? "Управлять подпиской" : "Поддержать"}</button>}
        </div>
      </section>

      <Tabs label="Разделы профиля" value={tab} onChange={(v) => setParams(v === "tiers" ? { tab: "tiers" } : {}, { replace: true })}
        items={[{ value: "posts", label: "Публикации" }, { value: "tiers", label: "Уровни подписки" }]} />

      {tab === "posts" ? (
        posts.loading ? <PostSkeletons count={2} /> : posts.error ? <ErrorState error={posts.error} onRetry={posts.reload} /> : posts.data?.length
          ? posts.data.map((p) => <PostCard key={p.id} post={p} onChange={updatePost} />)
          : <EmptyState icon={FileText} title="Публикаций пока нет" text="Когда автор опубликует что-то, это появится здесь." />
      ) : c.tiers.length ? (
        <div className="tier-grid pad" id="tiers">
          {c.tiers.map((t) => <TierCard key={t.id} tier={t} current={t.id === c.subscribed} actionLabel={t.id === c.subscribed ? "Управлять" : "Выбрать"} onAction={openModal} disabled={c.isMe} />)}
        </div>
      ) : <EmptyState icon={Heart} title="Уровни подписки не настроены" text={c.isMe ? "Настройка уровней появится после подключения платежей на backend." : "Автор ещё не создал уровни подписки."} />}

      <SubscribeModal creator={c} initialTier={modal.tier} open={modal.open} onClose={() => setModal({ open: false, tier: null })} onChange={(next) => creator.setData(next)} />
    </>
  );
}

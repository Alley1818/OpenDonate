import { useState } from "react";
import { Link } from "react-router-dom";
import { Users } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import Avatar from "../components/Avatar.jsx";
import SubscribeModal from "../components/SubscribeModal.jsx";
import { EmptyState, ErrorState, PostSkeletons } from "../components/States.jsx";
import { api } from "../api/index.js";
import { useAsync } from "../hooks/useAsync.js";
import { formatDate, formatPrice } from "../utils/format.js";

export default function Subscriptions() {
  const { data, loading, error, reload } = useAsync(() => api.creators.listSubscriptions(), []);
  const [target, setTarget] = useState(null);
  const total = (data || []).reduce((sum, s) => sum + (s.tier?.price || 0), 0);

  return (
    <>
      <PageHeader title="Подписки" subtitle={data?.length ? `Активных подписок: ${data.length} · ${formatPrice(total)} / мес` : "Авторы, которых вы поддерживаете"} />
      {loading ? <PostSkeletons count={2} /> : error ? <ErrorState error={error} onRetry={reload} /> : data?.length ? (
        <div className="sub-list">
          {data.map(({ creator, tier, since, status }) => (
            <article className="sub-card" key={creator.id}>
              <Link to={`/creators/${creator.username}`}><Avatar user={creator} size={52} /></Link>
              <div className="sub-info">
                <Link to={`/creators/${creator.username}`}><strong>{creator.displayName}</strong></Link>
                <span className="muted small">@{creator.username} · с {formatDate(since)}</span>
                <span className="small">Уровень «{tier?.name}» · {formatPrice(tier?.price || 0)} / мес</span>
              </div>
              <span className={`badge badge-paid`}>{status === "active" ? "Активна" : "Приостановлена"}</span>
              <button className="btn btn-secondary btn-sm" onClick={() => setTarget(creator)}>Управлять</button>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState icon={Users} title="Вы пока ни на кого не подписаны" text="Поддержите автора, и его закрытые публикации откроются для вас." action={<Link className="btn btn-primary" to="/explore">Найти авторов</Link>} />
      )}
      <SubscribeModal creator={target} open={!!target} onClose={() => setTarget(null)} onChange={() => reload()} />
    </>
  );
}

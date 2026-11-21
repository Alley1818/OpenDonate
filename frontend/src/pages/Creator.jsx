import { useState } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import { UserRound } from "lucide-react";
import { api, USE_MOCKS } from "../api/index.js";
import { isAuthor } from "../api/config.js";
import Avatar from "../components/Avatar.jsx";
import { EmptyState, ErrorState, Spinner } from "../components/States.jsx";
import SubscribeModal from "../components/SubscribeModal.jsx";
import TierCard from "../components/TierCard.jsx";
import { useAsync } from "../hooks/useAsync.js";
import { useAuth } from "../hooks/useAuth.jsx";
import { useRequireAuth } from "../hooks/useRequireAuth.js";

export default function Creator() {
  const { username } = useParams();
  const shared = useOutletContext();
  return <AuthorProfile key={username ?? ""} username={username} shared={shared} />;
}

function AuthorProfile({ username, shared }) {
  const { user } = useAuth();
  const guard = useRequireAuth();
  const [tierId, setTierId] = useState(null);
  const needsLookup = Boolean(username && username !== shared.data?.username);
  const profile = useAsync(() => api.creators.get(username), [username, user?.id], { enabled: needsLookup });
  const source = needsLookup ? profile : shared;

  if (source.loading || (needsLookup && !source.error && !source.data)) return <Spinner />;
  if (source.error && source.error.status !== 404) return <ErrorState error={source.error} onRetry={source.reload} />;
  if (!source.data || !isAuthor(source.data.id)) {
    return <EmptyState
      icon={UserRound}
      title={username ? "Страница автора не найдена" : "Страница автора пока недоступна"}
      text={!username ? "Имя автора появится после первой публикации." : undefined}
      action={<Link className="btn btn-secondary" to="/">К публикациям</Link>}
    />;
  }

  const owner = isAuthor(user?.id);
  const author = owner ? { ...source.data, ...user } : source.data;
  const tiers = USE_MOCKS ? author.tiers ?? [] : [];

  return (
    <>
      <section className="profile-card" aria-label="Профиль автора">
        <div className="cover author-cover" aria-hidden="true"><span>{author.displayName[0]}</span></div>
        <header className="profile-head">
          <div className="profile-avatar"><Avatar user={author} size={80} /></div>
          <div className="profile-main">
            <h1>{author.displayName}</h1>
            <p className="muted">@{author.username}</p>
            {author.bio && <p className="profile-bio">{author.bio}</p>}
          </div>
          <div className="profile-actions">
            <Link className="btn btn-secondary" to={owner ? "/settings" : "/"}>{owner ? "Настройки профиля" : "К публикациям"}</Link>
          </div>
        </header>
      </section>
      {!owner && tiers.length > 0 && (
        <section className="author-support">
          <h2>Поддержка автора</h2>
          <div className="tier-grid">
            {tiers.map((tier) => <TierCard
              key={tier.id}
              tier={tier}
              current={author.subscribed === tier.id}
              actionLabel={author.subscribed === tier.id ? "Управлять" : "Поддержать"}
              onAction={guard(() => setTierId(tier.id))}
            />)}
          </div>
          <SubscribeModal creator={author} open={Boolean(tierId)} initialTier={tierId} onClose={() => setTierId(null)} onChange={source.reload} />
        </section>
      )}
    </>
  );
}

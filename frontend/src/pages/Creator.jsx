
import { useState } from "react";
import {
  Link,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  Check,
  FileText,
  Heart,
  Users,
} from "lucide-react";

import Avatar from "../components/Avatar.jsx";
import Tabs from "../components/Tabs.jsx";
import PostCard from "../components/PostCard.jsx";
import TierCard from "../components/TierCard.jsx";
import SubscribeModal from "../components/SubscribeModal.jsx";

import {
  EmptyState,
  ErrorState,
  PostSkeletons,
  Spinner,
} from "../components/States.jsx";

import { api } from "../api/index.js";
import { useAuth } from "../hooks/useAuth.jsx";
import { useAsync } from "../hooks/useAsync.js";
import { useRequireAuth } from "../hooks/useRequireAuth.js";
import { formatCount } from "../utils/format.js";

export default function Creator() {
  const { username } = useParams();

  const { user, loading: authLoading } = useAuth();

  const guard = useRequireAuth();

  const [params, setParams] = useSearchParams();

  const tab = params.get("tab") === "tiers" ? "tiers" : "posts";

  const [modal, setModal] = useState({
    open: false,
    tier: null,
  });

  // Загружаем профиль только после восстановления сессии
  const creator = useAsync(
    () => api.creators.get(username),
    [username, user?.id],
    { enabled: !authLoading }
  );

  const c = creator.data;

  // Загружаем публикации после получения профиля
  const posts = useAsync(
    () => api.posts.listByAuthor(c.id),
    [c?.id, c?.subscribed, user?.id],
    { enabled: !!c && !authLoading }
  );

  const updatePost = (next) => {
    posts.setData((list) =>
      list.map((post) =>
        post.id === next.id ? next : post
      )
    );
  };

  const openModal = guard((tier) => {
    setModal({
      open: true,
      tier: tier?.id || null,
    });
  });

  // Ожидаем восстановления авторизации и загрузки профиля
  if (authLoading || creator.loading) {
    return <Spinner />;
  }

  // Обработка ошибок загрузки профиля
  if (creator.error) {
    return creator.error.status === 404 ? (
      <EmptyState
        icon={Users}
        title="Автор не найден"
        text={`Профиля @${username} не существует.`}
        action={
          <Link className="btn btn-secondary" to="/explore">
            К обзору
          </Link>
        }
      />
    ) : (
      <ErrorState
        error={creator.error}
        onRetry={creator.reload}
      />
    );
  }

  if (!c) {
    return <Spinner />;
  }

  return (
    <>
      {/* Обложка профиля */}
      <div
        className="cover"
        style={{ background: c.coverColor }}
        role="img"
        aria-label="Обложка профиля"
      >
        <span>{c.displayName[0]}</span>
      </div>

      {/* Информация об авторе */}
      <section className="profile-head">
        <div className="profile-avatar">
          <Avatar user={c} size={88} />
        </div>

        <div className="profile-main">
          <h1>
            {c.displayName}

            {c.verified && (
              <Check
                className="verified"
                size={18}
                aria-label="Проверенный автор"
              />
            )}
          </h1>

          <p className="muted">
            @{c.username} ·{" "}
            <span className="chip chip-static">
              {c.category}
            </span>
          </p>

          <p className="profile-bio">
            {c.bio || "Автор пока ничего не рассказал о себе."}
          </p>

          <div className="stats">
            <span>
              <strong>{formatCount(c.subscribers)}</strong>{" "}
              подписчиков
            </span>

            <span>
              <strong>{c.postsCount}</strong>{" "}
              публикаций
            </span>
          </div>
        </div>

        <div className="profile-actions">
          {c.isMe ? (
            <Link
              className="btn btn-secondary"
              to="/settings"
            >
              Редактировать профиль
            </Link>
          ) : (
            c.tiers.length > 0 && (
              <button
                className={`btn ${
                  c.subscribed
                    ? "btn-secondary"
                    : "btn-primary"
                }`}
                onClick={() => openModal()}
              >
                <Heart size={16} />

                {c.subscribed
                  ? "Управлять подпиской"
                  : "Поддержать"}
              </button>
            )
          )}
        </div>
      </section>

      {/* Навигация по профилю */}
      <Tabs
        label="Разделы профиля"
        value={tab}
        onChange={(value) =>
          setParams(
            value === "tiers" ? { tab: "tiers" } : {},
            { replace: true }
          )
        }
        items={[
          {
            value: "posts",
            label: "Публикации",
          },
          {
            value: "tiers",
            label: "Уровни подписки",
          },
        ]}
      />

      {/* Публикации */}
      {tab === "posts" ? (
        posts.loading ? (
          <PostSkeletons count={2} />
        ) : posts.error ? (
          <ErrorState
            error={posts.error}
            onRetry={posts.reload}
          />
        ) : posts.data?.length ? (
          posts.data.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onChange={updatePost}
            />
          ))
        ) : (
          <EmptyState
            icon={FileText}
            title="Публикаций пока нет"
            text="Когда автор опубликует что-то, это появится здесь."
          />
        )
      ) : c.tiers.length ? (
        <div className="tier-grid pad" id="tiers">
          {c.tiers.map((tier) => (
            <TierCard
              key={tier.id}
              tier={tier}
              current={tier.id === c.subscribed}
              actionLabel={
                tier.id === c.subscribed
                  ? "Управлять"
                  : "Выбрать"
              }
              onAction={openModal}
              disabled={c.isMe}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Heart}
          title="Уровни подписки не настроены"
          text={
            c.isMe
              ? "Настройка уровней появится после подключения платежей на backend."
              : "Автор ещё не создал уровни подписки."
          }
        />
      )}

      {/* Окно подписки */}
      <SubscribeModal
        creator={c}
        initialTier={modal.tier}
        open={modal.open}
        onClose={() =>
          setModal({
            open: false,
            tier: null,
          })
        }
        onChange={(next) => creator.setData(next)}
      />
    </>
  );
}

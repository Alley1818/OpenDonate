import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useOutletContext, useSearchParams } from "react-router-dom";
import { ArrowUpRight, Inbox, Plus, Search, SearchX, X } from "lucide-react";
import journalCover from "../assets/journal-cover.webp";
import { isAuthor } from "../api/config.js";
import Avatar from "../components/Avatar.jsx";
import PageHeader from "../components/PageHeader.jsx";
import PostResults from "../components/PostResults.jsx";
import { useAuth } from "../hooks/useAuth.jsx";
import { postContentText } from "../utils/postContent.js";

const FILTERS = [
  { value: "all", label: "Все" },
  { value: "public", label: "Открытые" },
  { value: "paid", label: "Платные" },
];

const normalize = (value) => value.toLocaleLowerCase("ru-RU").replaceAll("ё", "е");

function JournalHeader({ author, canPublish }) {
  return (
    <header className="journal-hero">
      <div className="journal-intro">
        {author && (
          <div className="journal-byline">
            <Avatar user={author} size={36} />
            <div><strong>{author.displayName}</strong><span>@{author.username}</span></div>
          </div>
        )}
        <h1>Публикации</h1>
        {author?.bio && <p className="journal-bio">{author.bio}</p>}
        {canPublish ? (
          <Link className="btn btn-primary" to="/new"><Plus size={17} aria-hidden="true" /> Написать</Link>
        ) : (
          <Link className="btn btn-primary" to="/author">Об авторе <ArrowUpRight size={17} aria-hidden="true" /></Link>
        )}
      </div>
      <img className="journal-cover" src={journalCover} alt="" width="960" height="960" fetchPriority="high" />
    </header>
  );
}

function FeedSearch({ query, onSearch }) {
  const [draft, setDraft] = useState(query);
  const input = useRef(null);
  useEffect(() => setDraft(query), [query]);

  const submit = (event) => {
    event.preventDefault();
    const value = draft.trim();
    setDraft(value);
    onSearch(value);
  };

  const clear = () => {
    setDraft("");
    onSearch("");
    input.current?.focus();
  };

  return (
    <form className="publication-search" role="search" aria-label="Поиск публикаций" onSubmit={submit}>
      <div className="search-box">
        <Search size={18} aria-hidden="true" />
        <input ref={input} type="search" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Заголовок или текст" aria-label="Поиск по публикациям" />
        {(draft || query) && <button type="button" className="icon-btn search-clear" onClick={clear} aria-label="Очистить поиск"><X size={16} aria-hidden="true" /></button>}
      </div>
      <button type="submit" className="btn btn-primary">Найти</button>
    </form>
  );
}

export default function Home({ search = false }) {
  const { user } = useAuth();
  const { data: author } = useOutletContext();
  const [params, setParams] = useSearchParams();
  const query = (params.get("q") ?? "").trim();
  const rawFilter = params.get("filter");
  const filter = FILTERS.some(({ value }) => value === rawFilter) ? rawFilter : "all";
  const filtered = Boolean(query) || filter !== "all";

  const change = (name, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(name, value);
    else next.delete(name);
    if (next.toString() !== params.toString()) setParams(next);
  };

  const reset = () => {
    const next = new URLSearchParams(params);
    next.delete("q");
    next.delete("filter");
    setParams(next);
  };

  const match = useMemo(() => {
    const terms = query ? normalize(query).split(/\s+/) : [];
    return (post) => {
      if (!isAuthor(post.authorId) || (filter !== "all" && post.visibility !== filter)) return false;
      if (!terms.length) return true;
      const text = normalize(`${post.title} ${post.locked ? "" : postContentText(post.content)}`);
      return terms.every((term) => text.includes(term));
    };
  }, [filter, query]);

  const empty = filtered ? {
    icon: SearchX,
    title: "Публикации не найдены",
    text: "Попробуйте другой запрос или фильтр.",
    action: <button type="button" className="btn btn-secondary" onClick={reset}>Сбросить фильтры</button>,
  } : { icon: Inbox, title: "Публикаций пока нет" };

  return (
    <>
      {search ? <PageHeader title="Поиск" subtitle="По заголовкам и тексту публикаций" /> : <JournalHeader author={author} canPublish={isAuthor(user?.id)} />}
      <section className="publication-feed" aria-label="Список публикаций">
        <div className="publication-tools">
          {!search && <h2>Последние записи</h2>}
          <FeedSearch query={query} onSearch={(value) => change("q", value)} />
          <div className="chips" role="group" aria-label="Фильтры публикаций">
            {FILTERS.map(({ value, label }) => (
              <button key={value} className={`chip ${value === filter ? "selected" : ""}`} type="button" aria-pressed={value === filter} onClick={() => change("filter", value === "all" ? "" : value)}>
                {label}
              </button>
            ))}
          </div>
          {query && <p className="publication-query muted small" role="status">Результаты по запросу «{query}»</p>}
        </div>
        <PostResults
          key={JSON.stringify([user?.id, filter, query])}
          userId={user?.id}
          match={match}
          empty={empty}
          moreLabel={query ? "Искать дальше" : undefined}
        />
      </section>
    </>
  );
}

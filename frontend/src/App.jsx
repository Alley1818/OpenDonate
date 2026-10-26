import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Home, Compass, Users, Mail, Bookmark, Settings, Plus, Search,
  MoreHorizontal, MessageCircle, Repeat2, Heart, LockKeyhole, Image,
  Smile, Bell, ChevronRight, X, Check, Crown, Sparkles, Send, Menu,
  UserRound, LogOut
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function normalizePost(post) {
  return {
    id: post.post_id,
    title: post.title || "",
    name: "Вы",
    handle: "@you",
    initials: "ВЫ",
    tone: "avatar-dark",
    time: "из публикаций",
    tier: "Открытый пост",
    text: post.content || "",
    image: null,
    imageUrl: "",
    imageName: "",
    likes: 0,
    comments: 0,
    reposts: 0,
    liked: false,
    saved: false,
    locked: false,
  };
}

const navItems = [
  { label: "Главная", icon: Home },
  { label: "Обзор", icon: Compass },
  { label: "Подписки", icon: Users },
  { label: "Сообщения", icon: Mail, count: "2" },
  { label: "Сохранённое", icon: Bookmark },
  { label: "Настройки", icon: Settings }
];

function Avatar({ initials, tone = "avatar-dark", size = "" }) {
  return <div className={`avatar ${tone} ${size}`}>{initials}</div>;
}

function formatCount(number) {
  return number >= 1000 ? `${(number / 1000).toFixed(1)}K` : String(number);
}

function App() {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState("");
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [apiError, setApiError] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [activeNav, setActiveNav] = useState("Главная");
  const [feedTab, setFeedTab] = useState("Для вас");
  const [draft, setDraft] = useState("");
  const [imageName, setImageName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [following, setFollowing] = useState([]);
  const fileInput = useRef(null);

  useEffect(() => {
    let cancelled = false;
    async function loadPosts() {
      setLoadingPosts(true);
      setApiError("");
      try {
        const response = await fetch(`${API_URL}/posts`);
        if (!response.ok) throw new Error(`Сервер ответил ${response.status}`);
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error("API вернул неожиданный формат данных");
        if (!cancelled) setPosts(data.map(normalizePost).reverse());
      } catch (error) {
        if (!cancelled) setApiError(`Не удалось загрузить посты. Проверь, запущен ли FastAPI на ${API_URL}.`);
      } finally {
        if (!cancelled) setLoadingPosts(false);
      }
    }
    loadPosts();
    return () => { cancelled = true; };
  }, []);

  const visiblePosts = useMemo(() => {
    let result = [...posts];
    if (activeNav === "Сохранённое") result = result.filter((p) => p.saved);
    if (activeNav === "Подписки" || feedTab === "Подписки") {
      result = result.filter((p) => following.includes(p.handle) || p.id === 1);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter((p) =>
        `${p.name} ${p.handle} ${p.text}`.toLowerCase().includes(q)
      );
    }
    return result;
  }, [posts, activeNav, feedTab, following, query]);

  const togglePost = (id, key) => {
    setPosts((current) => current.map((post) => {
      if (post.id !== id) return post;
      const next = { ...post, [key]: !post[key] };
      if (key === "liked") next.likes += next.liked ? 1 : -1;
      return next;
    }));
  };

  const publish = async () => {
    if (!title.trim() || !draft.trim()) {
      setNotice("Заполни заголовок и текст публикации.");
      return;
    }
    setPublishing(true);
    try {
      const response = await fetch(`${API_URL}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), content: draft.trim() }),
      });
      if (!response.ok) {
        const detail = await response.text();
        throw new Error(detail || `Сервер ответил ${response.status}`);
      }
      const created = normalizePost(await response.json());
      created.time = "только что";
      setPosts((current) => [created, ...current]);
      setTitle("");
      setDraft("");
      setImageName("");
      setImageUrl("");
      setActiveNav("Главная");
      setFeedTab("Для вас");
      setNotice("Пост сохранён в базе данных");
      window.setTimeout(() => setNotice(""), 2500);
    } catch (error) {
      setNotice(error.message?.includes("Failed to fetch")
        ? "Нет связи с FastAPI. Запусти backend и проверь адрес API."
        : `Не удалось опубликовать пост: ${error.message}`);
    } finally {
      setPublishing(false);
    }
  };

  const chooseImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setNotice("Пожалуйста, выбери файл изображения.");
      return;
    }
    setImageName(file.name);
    setImageUrl(URL.createObjectURL(file));
  };

  const follow = (handle) => {
    setFollowing((current) => current.includes(handle)
      ? current.filter((item) => item !== handle)
      : [...current, handle]);
  };

  return (
    <div className="app-shell">
      <header className="mobile-header">
        <button className="icon-button" aria-label="Открыть меню" onClick={() => setMobileMenu(!mobileMenu)}><Menu size={21} /></button>
        <button className="brand brand-mobile" onClick={() => { setActiveNav("Главная"); setMobileMenu(false); }}><span className="brand-mark">m</span> mono</button>
        <button className="icon-button" aria-label="Уведомления" onClick={() => setNotice("Новых уведомлений пока нет.")}><Bell size={20} /></button>
      </header>

      <div className="layout">
        <aside className={`left-sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
          <button className="brand" onClick={() => { setActiveNav("Главная"); setMobileMenu(false); }}>
            <span className="brand-mark">m</span><span>mono</span>
          </button>
          <div className="sidebar-label">МЕНЮ</div>
          <nav className="main-nav">
            {navItems.map(({ label, icon: Icon, count }) => (
              <button key={label} className={`nav-item ${activeNav === label ? "active" : ""}`}
                onClick={() => { setActiveNav(label); setMobileMenu(false); }}>
                <Icon size={20} strokeWidth={activeNav === label ? 2.4 : 1.9} />
                <span>{label}</span>
                {count && <span className="nav-count">{count}</span>}
              </button>
            ))}
          </nav>
          <button className="primary-button create-sidebar" onClick={() => {
            document.getElementById("post-composer")?.scrollIntoView({ behavior: "smooth", block: "center" });
            setMobileMenu(false);
          }}><Plus size={19} /> Создать пост</button>
          <div className="sidebar-bottom">
            <div className="creator-mini">
              <Avatar initials="ВЫ" />
              <div className="creator-mini-text"><strong>Ваш профиль</strong><span>@you</span></div>
              <MoreHorizontal size={20} className="muted-icon" />
            </div>
            <div className="sidebar-footnote">MONO © 2026 <span>·</span> Создавай своё</div>
          </div>
        </aside>

        <main className="feed-column">
          <div className="feed-topbar">
            <div><h1>{activeNav === "Главная" ? "Главная лента" : activeNav}</h1><p>Твоё пространство для интересного</p></div>
            <button className="icon-button desktop-notification" aria-label="Уведомления" onClick={() => setNotice("Новых уведомлений пока нет.")}><Bell size={20} /></button>
          </div>

          {activeNav === "Настройки" ? (
            <section className="settings-panel">
              <div className="section-heading"><h2>Настройки профиля</h2><p>Здесь позже появятся настройки аккаунта и приватности.</p></div>
              <div className="setting-row"><div className="setting-icon"><UserRound size={19}/></div><div><strong>Публичный профиль</strong><p>Настрой имя, описание и фотографию профиля.</p></div><ChevronRight size={18}/></div>
              <div className="setting-row"><div className="setting-icon"><Bell size={19}/></div><div><strong>Уведомления</strong><p>Выбери, о чём хочешь узнавать.</p></div><ChevronRight size={18}/></div>
              <div className="setting-row"><div className="setting-icon"><LockKeyhole size={19}/></div><div><strong>Приватность</strong><p>Управляй доступом к своим публикациям.</p></div><ChevronRight size={18}/></div>
            </section>
          ) : activeNav === "Сообщения" ? (
            <section className="empty-state"><div className="empty-icon"><Mail size={24}/></div><h2>Твои сообщения</h2><p>Личные сообщения авторов и подписчиков будут здесь.</p><button className="secondary-button" onClick={() => setActiveNav("Обзор")}>Найти авторов</button></section>
          ) : (
            <>
              <section className="composer" id="post-composer">
                <Avatar initials="ВЫ" size="avatar-large" />
                <div className="composer-main">
                  <input className="composer-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Заголовок публикации" maxLength={200} />
                  <textarea value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Что нового? Поделись с аудиторией..." rows={3} />
                  {imageUrl && <div className="upload-preview"><img src={imageUrl} alt="Предпросмотр загрузки"/><span>{imageName} · изображение пока не сохраняется на сервере</span><button className="icon-button small-icon" onClick={() => { setImageUrl(""); setImageName(""); }} aria-label="Убрать изображение"><X size={16}/></button></div>}
                  <div className="composer-footer">
                    <div className="composer-tools">
                      <button className="tool-button" onClick={() => fileInput.current?.click()}><Image size={18}/><span>Фото</span></button>
                      <input ref={fileInput} type="file" accept="image/*" hidden onChange={chooseImage} />
                      <button className="tool-button" onClick={() => setDraft((value) => value + (value ? " " : "") + "✨")}><Smile size={18}/><span>Эмодзи</span></button>
                    </div>
                    <button className="primary-button publish-button" onClick={publish} disabled={publishing || !title.trim() || !draft.trim()}>{publishing ? "Публикуем…" : "Опубликовать"}</button>
                  </div>
                </div>
              </section>

              <div className="feed-tabs">
                <button className={feedTab === "Для вас" ? "selected" : ""} onClick={() => setFeedTab("Для вас")}>Для вас</button>
                <button className={feedTab === "Подписки" ? "selected" : ""} onClick={() => setFeedTab("Подписки")}>Подписки</button>
              </div>

              {activeNav === "Обзор" && <div className="discover-banner"><div><span className="eyebrow">ОТКРЫВАЙ НОВОЕ</span><h2>Найди авторов по душе</h2><p>Поддерживай тех, чьи идеи тебе близки.</p></div><Sparkles size={29}/></div>}

              {activeNav === "Подписки" && <div className="inline-note"><Users size={17}/> Посты авторов, на которых ты подписан</div>}
              {activeNav === "Сохранённое" && <div className="inline-note"><Bookmark size={17}/> Здесь собраны сохранённые публикации</div>}

              {apiError && <div className="inline-note api-error"><X size={17}/>{apiError}</div>}
              <div className="posts-list">
                {loadingPosts ? <div className="empty-state"><p>Загружаем публикации…</p></div> : visiblePosts.length ? visiblePosts.map((post) => (
                  <article className="post-card" key={post.id}>
                    <div className="post-head">
                      <Avatar initials={post.initials} tone={post.tone}/>
                      <div className="post-author"><div className="author-line"><strong>{post.name}</strong>{post.name !== "Вы" && <Check className="verified" size={14}/>}<span>{post.handle}</span><i>·</i><span>{post.time}</span></div><div className="post-tier">{post.locked && <LockKeyhole size={12}/>} {post.tier}</div></div>
                      <button className="icon-button post-menu" aria-label="Дополнительные действия" onClick={() => setNotice("Дополнительные действия появятся в следующей версии.")}><MoreHorizontal size={21}/></button>
                    </div>
                    <div className="post-content">
                      {post.title && <h3 className="post-title">{post.title}</h3>}
                      <p>{post.text}</p>
                      {post.image === "desk" && <div className="desk-image" role="img" aria-label="Монохромный рабочий стол"><div className="desk-window"><div className="window-top"><span/><span/><span/></div><div className="window-lines"><b/><b/><b/><b/></div></div><div className="desk-notebook"><span>NOTES</span><i/><i/><i/></div><div className="desk-pen"/><div className="desk-caption">WORK IN PROGRESS</div></div>}
                      {post.image === "uploaded" && post.imageUrl && <img className="post-upload-image" src={post.imageUrl} alt={post.imageName || "Изображение к публикации"}/>}
                      {post.locked && <div className="locked-content"><div className="lock-circle"><LockKeyhole size={21}/></div><div><strong>Контент для подписчиков</strong><p>Оформи подписку, чтобы увидеть полную публикацию.</p></div><button className="secondary-button" onClick={() => setNotice("Выбор уровня подписки подключим на следующем этапе.")}>Открыть</button></div>}
                    </div>
                    <div className="post-actions">
                      <button className={`action-button ${post.liked ? "is-liked" : ""}`} onClick={() => togglePost(post.id, "liked")} aria-label="Нравится"><Heart size={18} fill={post.liked ? "currentColor" : "none"}/><span>{formatCount(post.likes)}</span></button>
                      <button className="action-button" onClick={() => setNotice("Комментарии к публикациям скоро появятся.")} aria-label="Комментарии"><MessageCircle size={18}/><span>{formatCount(post.comments)}</span></button>
                      <button className="action-button" onClick={() => setNotice("Ссылка на пост готовится к публикации.")} aria-label="Поделиться"><Repeat2 size={18}/><span>{formatCount(post.reposts)}</span></button>
                      <button className={`action-button save-action ${post.saved ? "is-saved" : ""}`} onClick={() => togglePost(post.id, "saved")} aria-label="Сохранить"><Bookmark size={18} fill={post.saved ? "currentColor" : "none"}/></button>
                    </div>
                  </article>
                )) : (
                  <div className="empty-state"><div className="empty-icon"><Bookmark size={24}/></div><h2>{query ? "Ничего не найдено" : activeNav === "Сохранённое" ? "Пока ничего нет" : "Лента пока пуста"}</h2><p>{query ? "Попробуй изменить поисковый запрос." : "Сохраняй понравившиеся посты или загляни в обзор авторов."}</p><button className="secondary-button" onClick={() => { setActiveNav("Главная"); setQuery(""); }}>Вернуться в ленту</button></div>
                )}
              </div>
            </>
          )}
        </main>

        <aside className="right-sidebar">
          <label className="search-box"><Search size={18}/><input value={query} onChange={(e) => { setQuery(e.target.value); if (e.target.value) setActiveNav("Главная"); }} placeholder="Поиск"/></label>
          <section className="membership-card">
            <div className="membership-icon"><Crown size={21}/></div><span className="eyebrow">ТВОЯ ПОДДЕРЖКА</span><h2>Подписывайся на идеи</h2><p>Открывай эксклюзивные материалы и помогай авторам создавать больше.</p><button className="secondary-button full-button" onClick={() => setActiveNav("Обзор")}>Выбрать авторов <ChevronRight size={16}/></button>
          </section>
          <section className="side-card">
            <div className="side-card-heading"><h3>Авторы недели</h3><button onClick={() => setActiveNav("Обзор")}>Все</button></div>
            {[
              {name:"Александр Волков", handle:"@volkov", initials:"АВ", tone:"avatar-dark"},
              {name:"Мария Лис", handle:"@marialis", initials:"МЛ", tone:"avatar-light"},
              {name:"Илья Чернов", handle:"@chernov", initials:"ИЧ", tone:"avatar-mid"}
            ].map((creator) => (
              <div className="suggested-author" key={creator.handle}>
                <Avatar initials={creator.initials} tone={creator.tone}/>
                <div className="suggested-info"><strong>{creator.name}</strong><span>{creator.handle}</span></div>
                <button className={`follow-button ${following.includes(creator.handle) ? "following" : ""}`} onClick={() => follow(creator.handle)} aria-label={following.includes(creator.handle) ? "Отписаться" : "Подписаться"}>{following.includes(creator.handle) ? <Check size={16}/> : <Plus size={16}/>}</button>
              </div>
            ))}
          </section>
          <section className="support-card"><div className="support-top"><div className="support-icon"><Sparkles size={18}/></div><span>MONO ДЛЯ АВТОРОВ</span></div><h3>Твоя идея заслуживает аудитории.</h3><p>Создай пространство для своих работ, мыслей и сообщества.</p><button onClick={() => document.getElementById("post-composer")?.scrollIntoView({behavior:"smooth"})}>Начать создавать <ChevronRight size={16}/></button></section>
          <div className="right-footer"><a href="#about" onClick={(e) => { e.preventDefault(); setNotice("MONO — демо интерфейса платформы авторов."); }}>О проекте</a><a href="#privacy" onClick={(e) => { e.preventDefault(); setNotice("Политика конфиденциальности появится перед запуском."); }}>Конфиденциальность</a><span>© 2026 MONO</span></div>
        </aside>
      </div>
      {notice && <div className="toast" role="status"><span>{notice}</span><button onClick={() => setNotice("")} aria-label="Закрыть уведомление"><X size={16}/></button></div>}
    </div>
  );
}

export default App;
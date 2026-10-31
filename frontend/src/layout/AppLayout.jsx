import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Bookmark, Compass, Home, LogOut, Plus, Search, Settings, UserRound, Users } from "lucide-react";
import Brand from "./Brand.jsx";
import Avatar from "../components/Avatar.jsx";
import { api } from "../api/index.js";
import { useAuth } from "../hooks/useAuth.jsx";
import { useAsync } from "../hooks/useAsync.js";
import { useToast } from "../hooks/useToast.jsx";
import { formatCount } from "../utils/format.js";

const NAV = [
  { to: "/", label: "Главная", icon: Home, end: true },
  { to: "/explore", label: "Обзор", icon: Compass },
  { to: "/subscriptions", label: "Подписки", icon: Users },
  { to: "/saved", label: "Сохранённое", icon: Bookmark },
  { to: "/settings", label: "Настройки", icon: Settings },
];
const MOBILE_NAV = [
  { to: "/", label: "Главная", icon: Home, end: true },
  { to: "/explore", label: "Обзор", icon: Compass },
  { to: "/new", label: "Создать", icon: Plus, accent: true },
  { to: "/subscriptions", label: "Подписки", icon: Users },
  { to: "/settings", label: "Ещё", icon: Settings },
];

function SearchBox() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const submit = (e) => {
    e.preventDefault();
    navigate(q.trim() ? `/explore?q=${encodeURIComponent(q.trim())}` : "/explore");
  };
  return (
    <form className="search-box" role="search" onSubmit={submit}>
      <Search size={18} />
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Поиск авторов и постов" aria-label="Поиск" />
    </form>
  );
}

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const suggested = useAsync(() => api.creators.suggested(), [user?.id]);

  const signOut = async () => { await logout(); toast("Вы вышли из аккаунта"); navigate("/"); };

  return (
    <div className="shell">
      <header className="mobile-header">
        <Brand />
        <div className="mobile-actions">
          <Link className="icon-btn" to="/explore" aria-label="Поиск"><Search size={20} /></Link>
          <Link className="icon-btn" to="/saved" aria-label="Сохранённое"><Bookmark size={20} /></Link>
          {user ? <Link className="icon-btn" to={`/creators/${user.username}`} aria-label="Мой профиль"><UserRound size={20} /></Link>
            : <Link className="btn btn-primary btn-sm" to="/login">Войти</Link>}
        </div>
      </header>

      <div className="layout">
        <aside className="sidebar">
          <Brand />
          <nav className="nav" aria-label="Основная навигация">
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
                <Icon size={20} /><span>{label}</span>
              </NavLink>
            ))}
          </nav>
          <Link to="/new" className="btn btn-primary full"><Plus size={18} /> Создать публикацию</Link>
          <div className="sidebar-bottom">
            {user ? (
              <div className="me">
                <Link to={`/creators/${user.username}`} className="me-link"><Avatar user={user} /><div><strong>{user.displayName}</strong><span>@{user.username}</span></div></Link>
                <button className="icon-btn" onClick={signOut} aria-label="Выйти"><LogOut size={18} /></button>
              </div>
            ) : (
              <div className="guest-actions">
                <Link to="/login" className="btn btn-secondary full">Войти</Link>
                <Link to="/register" className="btn btn-ghost full">Регистрация</Link>
              </div>
            )}
          </div>
        </aside>

        <main className="main" id="main"><Outlet /></main>

        <aside className="rightbar">
          <SearchBox />
          <section className="side-card">
            <div className="side-card-head"><h3>Популярные авторы</h3><Link to="/explore">Все</Link></div>
            {(suggested.data || []).map((c) => (
              <Link key={c.id} to={`/creators/${c.username}`} className="suggested">
                <Avatar user={c} size={36} />
                <div><strong>{c.displayName}</strong><span>{formatCount(c.subscribers)} подписчиков</span></div>
              </Link>
            ))}
            {!suggested.loading && !suggested.data?.length && <p className="muted small">Пока нет рекомендаций.</p>}
          </section>
          <section className="promo-card">
            <span className="eyebrow">ДЛЯ АВТОРОВ</span>
            <h3>Ваша идея заслуживает аудитории</h3>
            <p>Публикуйте открытые и платные материалы и получайте поддержку подписчиков.</p>
            <Link to="/new" className="link-arrow">Начать создавать →</Link>
          </section>
          <p className="right-foot">© 2026 OpenDonate · Open source</p>
        </aside>
      </div>

      <nav className="bottom-nav" aria-label="Мобильная навигация">
        {MOBILE_NAV.map(({ to, label, icon: Icon, end, accent }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => `bn-item ${isActive && !accent ? "active" : ""} ${accent ? "accent" : ""}`} aria-label={label}>
            <Icon size={22} /><span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

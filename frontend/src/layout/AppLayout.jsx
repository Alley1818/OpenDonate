import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { ArrowUpRight, Bookmark, House, LogOut, Plus, Search, Settings, UserRound } from "lucide-react";
import Brand from "./Brand.jsx";
import Avatar from "../components/Avatar.jsx";
import ReadingControls, { ThemeButton } from "../components/ReadingControls.jsx";
import { api, USE_MOCKS } from "../api/index.js";
import { AUTHOR_USERNAME, isAuthor } from "../api/config.js";
import { useAuth } from "../hooks/useAuth.jsx";
import { useAsync } from "../hooks/useAsync.js";
import { useToast } from "../hooks/useToast.jsx";

const NAV = [
  { to: "/", label: "Лента", icon: House, end: true },
  { to: "/author", label: "Об авторе", icon: UserRound },
  { to: "/explore", label: "Поиск", icon: Search },
  { to: "/saved", label: "Закладки", icon: Bookmark },
  { to: "/settings", label: "Настройки", icon: Settings },
];

function Navigation({ mobile = false }) {
  return (
    <nav className={mobile ? "bottom-nav" : "nav"} aria-label={mobile ? "Мобильная навигация" : "Основная навигация"}>
      {NAV.map(({ to, label, icon: Icon, end }) => (
        <NavLink key={to} to={to} end={end} className={({ isActive }) => `${mobile ? "bn-item" : "nav-item"}${isActive ? " active" : ""}`}>
          <Icon size={mobile ? 21 : 20} aria-hidden="true" /><span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export default function AppLayout() {
  const { user, logout, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const canPublish = isAuthor(user?.id);
  const profile = useAsync(
    () => USE_MOCKS ? api.creators.get(AUTHOR_USERNAME) : api.creators.author(),
    [user?.id],
    { enabled: USE_MOCKS || !canPublish },
  );
  const author = !USE_MOCKS && canPublish ? { ...profile, data: user, loading: false, error: null } : profile;

  const signOut = async () => {
    try {
      await logout();
      toast("Вы вышли из аккаунта");
      navigate("/");
    } catch (error) {
      toast(error.message, "error");
    }
  };

  return (
    <div className="shell">
      <a className="skip-link" href="#main">Перейти к содержимому</a>
      <header className="mobile-header">
        <Brand />
        <div className="mobile-actions">
          <ThemeButton />
          {!loading && (user ? (
            <Link className="icon-btn" to="/settings" aria-label="Настройки аккаунта"><Avatar user={user} size={32} /></Link>
          ) : <Link className="btn btn-primary btn-sm" to="/login">Войти</Link>)}
        </div>
      </header>

      <div className="layout">
        <aside className="sidebar">
          <Brand />
          <Navigation />
          {canPublish && <Link to="/new" className="btn btn-primary full"><Plus size={18} aria-hidden="true" /> Написать</Link>}
          <div className="sidebar-bottom">
            {loading ? (
              <div className="me" role="status" aria-label="Загрузка аккаунта"><span className="sk sk-circle" /><span className="sk sk-line w60" /></div>
            ) : user ? (
              <div className="me">
                <Link to="/settings" className="me-link"><Avatar user={user} /><div><strong>{user.displayName}</strong><span>@{user.username}</span></div></Link>
                <button className="icon-btn" type="button" onClick={signOut} aria-label="Выйти"><LogOut size={18} aria-hidden="true" /></button>
              </div>
            ) : (
              <div className="guest-actions">
                <Link to="/login" className="btn btn-secondary full">Войти</Link>
                <Link to="/register" className="btn btn-ghost full">Регистрация</Link>
              </div>
            )}
          </div>
        </aside>

        <main className="main" id="main" tabIndex={-1}><Outlet context={author} /></main>

        <aside className="rightbar" aria-label="Об авторе и настройки чтения">
          {author.data && (
            <section className="side-card">
              <Link to="/author" className="suggested">
                <Avatar user={author.data} size={38} />
                <div><strong>{author.data.displayName}</strong><span>@{author.data.username}</span></div>
                <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            </section>
          )}
          <ReadingControls />
          {USE_MOCKS && <p className="right-foot">Демо-режим</p>}
        </aside>
      </div>

      <Navigation mobile />
    </div>
  );
}

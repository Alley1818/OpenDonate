import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Monitor, Moon, Sun, UserRound } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import Tabs from "../components/Tabs.jsx";
import { Field } from "../components/Field.jsx";
import { EmptyState } from "../components/States.jsx";
import { resetDemoData } from "../api/index.js";
import { useAuth } from "../hooks/useAuth.jsx";
import { useToast } from "../hooks/useToast.jsx";
import { usePreferences } from "../hooks/usePreferences.js";

const TABS = [
  { value: "profile", label: "Профиль" },
  { value: "appearance", label: "Внешний вид" },
  { value: "notifications", label: "Уведомления" },
  { value: "account", label: "Аккаунт" },
];
const THEMES = [{ value: "light", label: "Светлая", icon: Sun }, { value: "dark", label: "Тёмная", icon: Moon }, { value: "system", label: "Системная", icon: Monitor }];

function Switch({ id, label, hint, checked, onChange }) {
  return (
    <label className="switch-row" htmlFor={id}>
      <span><strong>{label}</strong><small>{hint}</small></span>
      <input id={id} type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="switch" aria-hidden="true" />
    </label>
  );
}

function LoginPrompt() {
  return <EmptyState icon={UserRound} title="Войдите в аккаунт" text="Эти настройки доступны после входа." action={<Link className="btn btn-primary" to="/login" state={{ from: "/settings" }}>Войти</Link>} />;
}

export default function Settings() {
  const { user, updateProfile, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [tab, setTab] = useState("profile");
  const [prefs, setPrefs] = usePreferences();
  const [form, setForm] = useState({ displayName: "", bio: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { if (user) setForm({ displayName: user.displayName || "", bio: user.bio || "" }); }, [user]);

  const save = async (e) => {
    e.preventDefault();
    if (!form.displayName.trim()) return setError("Укажите отображаемое имя");
    setSaving(true); setError("");
    try { await updateProfile(form); toast("Профиль сохранён", "success"); } catch (err) { setError(err.message); } finally { setSaving(false); }
  };

  return (
    <>
      <PageHeader title="Настройки" subtitle="Профиль, внешний вид и аккаунт" />
      <Tabs label="Разделы настроек" items={TABS} value={tab} onChange={setTab} />
      <div className="pad settings-body">
        {tab === "profile" && (user ? (
          <form onSubmit={save} noValidate>
            <Field id="set-name" label="Отображаемое имя" value={form.displayName} maxLength={100} onChange={(e) => setForm({ ...form, displayName: e.target.value })} />
            <Field id="set-username" label="Username" value={user.username} disabled hint="Изменение username пока недоступно" />
            <Field id="set-bio" label="О себе" multiline rows={4} maxLength={300} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} hint={`${form.bio.length}/300`} />
            {error && <div className="alert alert-error" role="alert">{error}</div>}
            <button className="btn btn-primary" disabled={saving}>{saving ? "Сохраняем…" : "Сохранить"}</button>
          </form>
        ) : <LoginPrompt />)}

        {tab === "appearance" && (
          <>
            <fieldset className="visibility"><legend>Тема оформления</legend>
              <div className="segmented three" role="radiogroup">
                {THEMES.map(({ value, label, icon: Icon }) => (
                  <label key={value} className={`segment ${prefs.theme === value ? "selected" : ""}`}>
                    <input type="radio" name="theme" value={value} checked={prefs.theme === value} onChange={() => setPrefs({ theme: value })} />
                    <Icon size={18} /><span><strong>{label}</strong></span>
                  </label>
                ))}
              </div>
            </fieldset>
            <Switch id="sw-motion" label="Уменьшить анимации" hint="Отключает плавные переходы и анимацию загрузки" checked={prefs.reduceMotion} onChange={(v) => setPrefs({ reduceMotion: v })} />
          </>
        )}

        {tab === "notifications" && (
          <>
            <Switch id="sw-comments" label="Новые комментарии" hint="Сообщать о комментариях к вашим публикациям" checked={prefs.notifyComments} onChange={(v) => setPrefs({ notifyComments: v })} />
            <Switch id="sw-news" label="Новости платформы" hint="Редкие письма о новых возможностях" checked={prefs.notifyNews} onChange={(v) => setPrefs({ notifyNews: v })} />
            <p className="demo-note">Настройки сохраняются в этом браузере. Реальные уведомления появятся вместе с backend.</p>
          </>
        )}

        {tab === "account" && (user ? (
          <>
            <Field id="acc-email" label="Email" value={user.email || "—"} disabled />
            <Field id="acc-username" label="Username" value={`@${user.username}`} disabled />
            <div className="form-actions left">
              <button className="btn btn-secondary" onClick={async () => { await logout(); toast("Вы вышли из аккаунта"); navigate("/"); }}>Выйти из аккаунта</button>
              {resetDemoData && <button className="btn btn-danger-outline" onClick={() => { resetDemoData(); window.location.assign("/"); }}>Сбросить демо-данные</button>}
            </div>
            {resetDemoData && <p className="demo-note">Демо-данные (аккаунты, публикации, подписки) хранятся в localStorage этого браузера.</p>}
          </>
        ) : <LoginPrompt />)}
      </div>
    </>
  );
}

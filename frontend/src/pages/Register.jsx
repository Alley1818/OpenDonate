import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { Field, PasswordField } from "../components/Field.jsx";
import { useAuth } from "../hooks/useAuth.jsx";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const USERNAME = /^[A-Za-z0-9_]{3,30}$/;

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({ email: "", username: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }));

  if (user && !done) return <Navigate to="/" replace />;
  if (done) {
    return (
      <div className="success-state">
        <CheckCircle2 size={44} />
        <h1>Аккаунт создан</h1>
        <p className="muted">Добро пожаловать, @{user?.username}! Теперь вы можете поддерживать авторов и публиковать свои материалы.</p>
        <button className="btn btn-primary full" onClick={() => navigate("/")}>Перейти в ленту</button>
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    const found = {};
    if (!EMAIL.test(values.email.trim())) found.email = "Введите корректный email";
    if (!USERNAME.test(values.username.trim())) found.username = "3–30 символов: латиница, цифры и _";
    if (values.password.length < 8) found.password = "Пароль — минимум 8 символов";
    if (values.confirm !== values.password) found.confirm = "Пароли не совпадают";
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true); setFormError("");
    try { await register({ email: values.email, username: values.username, password: values.password }); setDone(true); }
    catch (err) { setFormError(err.message); } finally { setBusy(false); }
  };

  return (
    <>
      <h1>Регистрация</h1>
      <p className="muted">Создайте аккаунт за минуту.</p>
      <form onSubmit={submit} noValidate>
        {formError && <div className="alert alert-error" role="alert">{formError}</div>}
        <Field id="reg-email" type="email" label="Email" autoComplete="email" value={values.email} onChange={set("email")} error={errors.email} />
        <Field id="reg-username" label="Username" autoComplete="username" value={values.username} onChange={set("username")} error={errors.username} hint="Будет частью адреса вашего профиля" />
        <PasswordField id="reg-password" label="Пароль" autoComplete="new-password" value={values.password} onChange={set("password")} error={errors.password} hint="Минимум 8 символов" />
        <PasswordField id="reg-confirm" label="Повторите пароль" autoComplete="new-password" value={values.confirm} onChange={set("confirm")} error={errors.confirm} />
        <button className="btn btn-primary full" disabled={busy}>{busy ? "Создаём аккаунт…" : "Создать аккаунт"}</button>
      </form>
      <p className="auth-switch">Уже есть аккаунт? <Link to="/login">Войти</Link></p>
    </>
  );
}

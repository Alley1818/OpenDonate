import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Field, PasswordField } from "../components/Field.jsx";
import { USE_MOCKS } from "../api/index.js";
import { useAuth } from "../hooks/useAuth.jsx";
import { useToast } from "../hooks/useToast.jsx";

export default function Login() {
  const { user, login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const from = useLocation().state?.from || "/";
  const [values, setValues] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }));

  if (user && !busy) return <Navigate to={from} replace />;

  const attempt = async (data) => {
    setBusy(true); setFormError("");
    try { await login(data); toast("С возвращением!", "success"); navigate(from, { replace: true }); }
    catch (e) { setFormError(e.message); setBusy(false); }
  };
  const submit = (e) => {
    e.preventDefault();
    const found = {};
    if (!values.username.trim()) found.username = "Введите email или username";
    if (!values.password) found.password = "Введите пароль";
    setErrors(found);
    if (!Object.keys(found).length) attempt(values);
  };

  return (
    <>
      <h1>Вход</h1>
      <p className="muted">Войдите, чтобы поддерживать авторов и публиковать контент.</p>
      <form onSubmit={submit} noValidate>
        {formError && <div className="alert alert-error" role="alert">{formError}</div>}
        <Field id="login-username" label="Email или username" autoComplete="username" value={values.username} onChange={set("username")} error={errors.username} />
        <PasswordField id="login-password" label="Пароль" autoComplete="current-password" value={values.password} onChange={set("password")} error={errors.password} />
        <button className="btn btn-primary full" disabled={busy}>{busy ? "Входим…" : "Войти"}</button>
      </form>
      {USE_MOCKS && (
        <div className="demo-box">
          <p><strong>Демо-режим.</strong> Вход имитируется в браузере.</p>
          <button type="button" className="btn btn-secondary full" disabled={busy} onClick={() => attempt({ username: "demo", password: "demo12345" })}>Войти как демо-пользователь</button>
        </div>
      )}
      <p className="auth-switch">Нет аккаунта? <Link to="/register">Зарегистрироваться</Link></p>
    </>
  );
}

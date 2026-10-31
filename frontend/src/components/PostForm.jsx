import { useState } from "react";
import { Globe, Lock } from "lucide-react";
import { Field } from "./Field.jsx";
import Tabs from "./Tabs.jsx";
import Avatar from "./Avatar.jsx";
import VisibilityBadge from "./VisibilityBadge.jsx";
import { useAuth } from "../hooks/useAuth.jsx";

const OPTIONS = [
  { value: "public", label: "Открытая", hint: "Видна всем", icon: Globe },
  { value: "paid", label: "Платная", hint: "Только подписчикам", icon: Lock },
];

function validate({ title, content }) {
  const errors = {};
  if (title.trim().length < 3) errors.title = "Заголовок — минимум 3 символа";
  if (content.trim().length < 10) errors.content = "Текст — минимум 10 символов";
  return errors;
}

export default function PostForm({ onSubmit, onCancel, submitLabel = "Опубликовать" }) {
  const { user } = useAuth();
  const [values, setValues] = useState({ title: "", content: "", visibility: "public" });
  const [tab, setTab] = useState("write");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) { setTab("write"); return; }
    setSubmitting(true);
    setFormError("");
    try { await onSubmit(values); } catch (err) { setFormError(err.message); setSubmitting(false); }
  };

  return (
    <form className="post-form" onSubmit={submit} noValidate>
      <Tabs label="Режим редактора" value={tab} onChange={setTab} items={[{ value: "write", label: "Редактор" }, { value: "preview", label: "Предпросмотр" }]} />
      {tab === "write" ? (
        <>
          <Field id="post-title" label="Заголовок" value={values.title} onChange={set("title")} maxLength={200} placeholder="О чём ваша публикация?" error={errors.title} />
          <Field id="post-content" label="Текст публикации" multiline rows={8} value={values.content} onChange={set("content")} placeholder="Расскажите аудитории что-нибудь интересное…" error={errors.content} />
          <fieldset className="visibility">
            <legend>Кто увидит публикацию</legend>
            <div className="segmented" role="radiogroup">
              {OPTIONS.map(({ value, label, hint, icon: Icon }) => (
                <label key={value} className={`segment ${values.visibility === value ? "selected" : ""}`}>
                  <input type="radio" name="visibility" value={value} checked={values.visibility === value} onChange={set("visibility")} />
                  <Icon size={18} /><span><strong>{label}</strong><small>{hint}</small></span>
                </label>
              ))}
            </div>
          </fieldset>
        </>
      ) : (
        <article className="post-card preview">
          <header className="post-head">
            <Avatar user={user} />
            <div className="post-author"><div className="author-line"><span className="author-name">{user?.displayName}</span><span>@{user?.username}</span><i>·</i><span>только что</span></div></div>
            <VisibilityBadge visibility={values.visibility} />
          </header>
          <div className="post-body">
            <h3 className="post-title">{values.title || "Заголовок публикации"}</h3>
            <p className="post-text">{values.content || "Здесь появится текст вашей публикации."}</p>
          </div>
        </article>
      )}
      {formError && <div className="alert alert-error" role="alert">{formError}</div>}
      <div className="form-actions">
        {onCancel && <button type="button" className="btn btn-ghost" onClick={onCancel}>Отмена</button>}
        <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? "Публикуем…" : submitLabel}</button>
      </div>
    </form>
  );
}

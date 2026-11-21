import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, Check, FileText, Globe, Lock } from "lucide-react";
import { Field } from "./Field.jsx";
import Tabs from "./Tabs.jsx";
import Avatar from "./Avatar.jsx";
import Modal from "./Modal.jsx";
import VisibilityBadge from "./VisibilityBadge.jsx";
import PostContent from "./PostContent.jsx";
import { useAuth } from "../hooks/useAuth.jsx";
import { USE_MOCKS } from "../api/index.js";
import { readPostDocument } from "../utils/postContent.js";
import { clearPostDraft, draftChanges, readPostDraft, writePostDraft } from "../utils/postDraft.js";

const OPTIONS = [
  { value: "public", label: "Открытая", hint: "Видна всем", icon: Globe },
  { value: "paid", label: "Платная", hint: "Только подписчикам", icon: Lock },
];
const MODES = [{ value: "write", label: "Редактор" }, { value: "preview", label: "Предпросмотр" }];
const EMPTY_POST = { title: "", content: "", visibility: "public" };
const wordLabel = { one: "слово", few: "слова", many: "слов" };
const plural = new Intl.PluralRules("ru");
const number = new Intl.NumberFormat("ru");

function validate({ title, content }, allowEmptyContent) {
  const errors = {};
  if (!title) errors.title = "Укажите заголовок";
  if (!content && !allowEmptyContent) errors.content = "Добавьте текст публикации";
  return errors;
}

function DraftStatus({ snapshot, recovered }) {
  const hasDraft = Object.keys(snapshot.changes).length > 0;
  const label = !snapshot.persistent ? "Черновик недоступен после перезагрузки"
    : recovered ? "Черновик восстановлен"
    : hasDraft ? "Черновик сохранён"
    : "Автосохранение в этом браузере";
  const Icon = !snapshot.persistent ? AlertCircle : hasDraft ? Check : FileText;
  return (
    <span className={`editor-draft-status${snapshot.persistent ? "" : " is-warning"}`} role="status">
      <Icon size={15} aria-hidden="true" /> {label}
    </span>
  );
}

export default function PostForm({ draftKey, onSubmit, onSaved, onCancel, initial = EMPTY_POST, originalContent, editing = false }) {
  const { user } = useAuth();
  const [form, setForm] = useState(() => {
    const snapshot = readPostDraft(draftKey);
    return { values: { ...initial, ...snapshot.changes }, snapshot, recovered: Object.keys(snapshot.changes).length > 0 };
  });
  const [tab, setTab] = useState("write");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const closeDiscard = useCallback(() => setConfirmDiscard(false), []);
  const currentForm = useRef(form);
  const inFlight = useRef(false);
  const mounted = useRef(true);
  const { values } = form;
  const structured = useMemo(() => Boolean(readPostDocument(originalContent)), [originalContent]);
  const hasDraft = Object.keys(form.snapshot.changes).length > 0;
  const words = values.content.match(/\S+/g)?.length ?? 0;
  const preview = values.content === initial.content && originalContent !== undefined ? originalContent : values.content;

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const replaceForm = (next) => {
    currentForm.current = next;
    setForm(next);
  };

  const set = (field) => (event) => {
    if (inFlight.current) return;
    const next = { ...currentForm.current.values, [field]: event.target.value };
    const changes = draftChanges(initial, next);
    const snapshot = Object.keys(changes).length
      ? writePostDraft(draftKey, changes)
      : clearPostDraft(draftKey, currentForm.current.snapshot) ?? { ...currentForm.current.snapshot, changes: {} };
    replaceForm({ values: next, snapshot, recovered: false });
    setErrors((previous) => previous[field] ? { ...previous, [field]: undefined } : previous);
  };

  const discard = () => {
    const snapshot = clearPostDraft(draftKey, form.snapshot) ?? { ...form.snapshot, changes: {} };
    replaceForm({ values: initial, snapshot, recovered: false });
    setErrors({});
    setFormError("");
    setTab("write");
    closeDiscard();
  };

  const submit = async (event) => {
    event.preventDefault();
    if (inFlight.current) return;
    const { values, snapshot } = currentForm.current;
    const trimmed = { ...values, title: values.title.trim(), content: values.content.trim() };
    const found = validate(trimmed, editing && !initial.content.trim());
    setErrors(found);
    if (Object.keys(found).length) {
      setTab("write");
      return;
    }

    inFlight.current = true;
    setSubmitting(true);
    setFormError("");
    try {
      const result = await onSubmit(trimmed);
      clearPostDraft(draftKey, snapshot);
      if (mounted.current) onSaved(result);
    } catch (error) {
      if (mounted.current) {
        setFormError(error.message || "Не удалось сохранить публикацию.");
        setSubmitting(false);
      }
    } finally {
      inFlight.current = false;
    }
  };

  return (
    <>
      <form className="post-form" onSubmit={submit} noValidate aria-busy={submitting}>
        <div className="editor-toolbar">
          <Tabs label="Режим редактора" value={tab} onChange={setTab} items={MODES} />
          <DraftStatus snapshot={form.snapshot} recovered={form.recovered} />
        </div>
        {tab === "write" ? (
          <>
            <Field id="post-title" label="Заголовок" value={values.title} onChange={set("title")} maxLength={200} placeholder="Заголовок публикации" error={errors.title} disabled={submitting} />
            <Field
              id="post-content"
              label="Текст публикации"
              multiline
              rows={12}
              value={values.content}
              onChange={set("content")}
              placeholder="Начните писать…"
              hint={structured ? "При изменении текста этой публикации он сохранится без прежнего форматирования." : undefined}
              error={errors.content}
              disabled={submitting}
            />
            {USE_MOCKS && (
              <fieldset className="visibility">
                <legend>Кто увидит публикацию</legend>
                <div className="segmented" role="radiogroup">
                  {OPTIONS.map(({ value, label, hint, icon: Icon }) => (
                    <label key={value} className={`segment ${values.visibility === value ? "selected" : ""}`}>
                      <input type="radio" name="visibility" value={value} checked={values.visibility === value} onChange={set("visibility")} disabled={submitting} />
                      <Icon size={18} aria-hidden="true" /><span><strong>{label}</strong><small>{hint}</small></span>
                    </label>
                  ))}
                </div>
              </fieldset>
            )}
          </>
        ) : (
          <article className="post-card preview editor-preview">
            <header className="post-head">
              <Avatar user={user} />
              <div className="post-author"><div className="author-line"><span className="author-name">{user?.displayName}</span><span>@{user?.username}</span></div></div>
              <VisibilityBadge visibility={values.visibility} />
            </header>
            <div className="post-body">
              <h3 className="post-title">{values.title || "Заголовок публикации"}</h3>
              <PostContent className="post-text post-content" content={preview || "Здесь появится текст вашей публикации."} />
            </div>
          </article>
        )}
        {formError && <div className="alert alert-error" role="alert">{formError}</div>}
        <div className="form-actions editor-actions">
          <span className="editor-metrics">{number.format(words)} {wordLabel[plural.select(words)]}</span>
          <div className="editor-action-buttons">
            {hasDraft && <button type="button" className="btn btn-ghost editor-discard" onClick={() => setConfirmDiscard(true)} disabled={submitting}>Сбросить черновик</button>}
            {onCancel && <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={submitting}>Закрыть</button>}
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Сохраняем…" : editing ? "Сохранить изменения" : "Опубликовать"}
            </button>
          </div>
        </div>
      </form>
      <Modal open={confirmDiscard} title="Сбросить черновик?" onClose={closeDiscard}>
        <p>{editing ? "Поля вернутся к опубликованной версии." : "Заголовок и текст черновика будут удалены."}</p>
        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={closeDiscard}>Оставить</button>
          <button type="button" className="btn btn-danger-outline" onClick={discard}>Сбросить</button>
        </div>
      </Modal>
    </>
  );
}

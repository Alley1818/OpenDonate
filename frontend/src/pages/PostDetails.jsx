import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, FileText, MessageCircle } from "lucide-react";
import Avatar from "../components/Avatar.jsx";
import PostCard from "../components/PostCard.jsx";
import { EmptyState, ErrorState, Spinner } from "../components/States.jsx";
import { api } from "../api/index.js";
import { useAuth } from "../hooks/useAuth.jsx";
import { useAsync } from "../hooks/useAsync.js";
import { useToast } from "../hooks/useToast.jsx";
import { useRequireAuth } from "../hooks/useRequireAuth.js";
import { timeAgo } from "../utils/format.js";

export default function PostDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const guard = useRequireAuth();
  const navigate = useNavigate();
  const { hash } = useLocation();
  const post = useAsync(() => api.posts.get(id), [id, user?.id]);
  const comments = useAsync(() => api.posts.comments(id), [id]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (hash === "#comments" && !post.loading) document.getElementById("comments")?.scrollIntoView({ behavior: "smooth" });
  }, [hash, post.loading]);

  const send = guard(async (e) => {
    e.preventDefault();
    const value = text.trim();
    if (!value) return setFormError("Напишите комментарий");
    if (value.length > 1000) return setFormError("Комментарий слишком длинный (макс. 1000 символов)");
    setSending(true); setFormError("");
    try {
      const c = await api.posts.addComment(id, value);
      comments.setData((l) => [...(l || []), c]);
      post.setData((p) => ({ ...p, comments: p.comments + 1 }));
      setText("");
      toast("Комментарий добавлен", "success");
    } catch (err) { setFormError(err.message); } finally { setSending(false); }
  });

  if (post.loading) return <Spinner />;
  if (post.error) {
    return post.error.status === 404
      ? <EmptyState icon={FileText} title="Публикация не найдена" text="Возможно, она была удалена." action={<Link className="btn btn-secondary" to="/">В ленту</Link>} />
      : <ErrorState error={post.error} onRetry={post.reload} />;
  }

  return (
    <>
      <div className="page-header slim"><button className="btn btn-ghost btn-sm" onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/"))}><ArrowLeft size={16} /> Назад</button></div>
      <PostCard post={post.data} detail onChange={post.setData} />
      <section className="comments" id="comments">
        <h2 className="section-title"><MessageCircle size={18} /> Комментарии ({post.data.comments})</h2>
        {user ? (
          <form className="comment-form" onSubmit={send} noValidate>
            <Avatar user={user} size={36} />
            <div>
              <label htmlFor="comment-text" className="sr-only">Ваш комментарий</label>
              <textarea id="comment-text" rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder="Написать комментарий…" aria-invalid={!!formError} />
              {formError && <p className="field-error">{formError}</p>}
              <div className="form-actions"><button className="btn btn-primary btn-sm" disabled={sending}>{sending ? "Отправка…" : "Отправить"}</button></div>
            </div>
          </form>
        ) : <p className="alert">Чтобы оставить комментарий, <Link to="/login" state={{ from: `/posts/${id}#comments` }}>войдите в аккаунт</Link>.</p>}
        {comments.loading ? <Spinner /> : comments.error ? <ErrorState error={comments.error} onRetry={comments.reload} /> : comments.data?.length ? (
          <ul className="comment-list">
            {comments.data.map((c) => (
              <li key={c.id}>
                <Avatar user={c.author} size={36} />
                <div><div className="author-line"><strong>{c.author.displayName}</strong><span>@{c.author.username}</span><i>·</i><span>{timeAgo(c.createdAt)}</span></div><p>{c.text}</p></div>
              </li>
            ))}
          </ul>
        ) : <p className="muted small pad-y">Пока нет комментариев. Будьте первым!</p>}
      </section>
    </>
  );
}

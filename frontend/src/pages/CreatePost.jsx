import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Lock } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import PostForm from "../components/PostForm.jsx";
import { EmptyState, ErrorState, Spinner } from "../components/States.jsx";
import { api } from "../api/index.js";
import { API_URL, USE_MOCKS, isAuthor } from "../api/config.js";
import { useAsync } from "../hooks/useAsync.js";
import { useAuth } from "../hooks/useAuth.jsx";
import { useToast } from "../hooks/useToast.jsx";
import { postContentText } from "../utils/postContent.js";
import { postDraftKey } from "../utils/postDraft.js";

export default function CreatePost() {
  const { id } = useParams();
  const { user } = useAuth();
  if (!isAuthor(user?.id)) {
    return <EmptyState icon={Lock} title="Публиковать может только автор" action={<Link className="btn btn-secondary" to="/">К публикациям</Link>} />;
  }

  const draftKey = postDraftKey({
    apiUrl: new URL(API_URL, window.location.origin).href,
    demo: USE_MOCKS,
    userId: user.id,
    postId: id,
  });
  return <Composer key={draftKey} draftKey={draftKey} id={id} userId={user.id} />;
}

function Composer({ id, userId, draftKey }) {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { toast } = useToast();
  const post = useAsync(() => api.posts.get(id, { userId }), [id, userId], { enabled: Boolean(id) });
  if (post.loading) return <Spinner />;
  if (post.error) return <ErrorState error={post.error} onRetry={post.reload} />;

  const original = post.data;
  const initial = original ? {
    title: original.title,
    content: postContentText(original.content),
    visibility: original.visibility,
  } : undefined;
  const back = id ? `/posts/${id}` : "/";
  const returnState = id ? state : undefined;

  const submit = async (values) => {
    if (!original) {
      const created = await api.posts.create(values, userId);
      return { path: `/posts/${created.id}`, notice: "Публикация создана" };
    }

    // A title or visibility change must leave any existing structured body intact.
    const patch = {};
    if (values.title !== initial.title.trim()) patch.title = values.title;
    if (values.content !== initial.content.trim()) patch.content = values.content;
    if (values.visibility !== initial.visibility) patch.visibility = values.visibility;
    if (!Object.keys(patch).length) return { path: back };
    await api.posts.update(id, patch, userId);
    return { path: back, notice: "Изменения сохранены" };
  };

  const saved = ({ path, notice }) => {
    if (notice) toast(notice, "success");
    navigate(path, { replace: true, state: returnState });
  };

  return (
    <section className="editor-page">
      <PageHeader title={id ? "Редактирование публикации" : "Новая публикация"} />
      <div className="pad">
        <PostForm
          draftKey={draftKey}
          initial={initial}
          originalContent={original?.content}
          editing={Boolean(id)}
          onSubmit={submit}
          onSaved={saved}
          onCancel={() => navigate(back, { state: returnState })}
        />
      </div>
    </section>
  );
}

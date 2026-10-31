import { useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader.jsx";
import PostForm from "../components/PostForm.jsx";
import { api } from "../api/index.js";
import { useToast } from "../hooks/useToast.jsx";

export default function CreatePost() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const submit = async (values) => {
    const post = await api.posts.create(values);
    toast("Публикация создана", "success");
    navigate(`/posts/${post.id}`);
  };
  return (
    <>
      <PageHeader title="Новая публикация" subtitle="Расскажите что-нибудь своей аудитории" />
      <div className="pad"><PostForm onSubmit={submit} onCancel={() => navigate(-1)} /></div>
    </>
  );
}

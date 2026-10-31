import Modal from "./Modal.jsx";
import PostForm from "./PostForm.jsx";
import { api } from "../api/index.js";
import { useToast } from "../hooks/useToast.jsx";

export default function ComposerModal({ open, onClose, onCreated }) {
  const { toast } = useToast();
  const submit = async (values) => {
    const post = await api.posts.create(values);
    toast("Публикация создана", "success");
    onCreated?.(post);
    onClose();
  };
  return (
    <Modal open={open} onClose={onClose} title="Новая публикация" wide>
      <PostForm onSubmit={submit} onCancel={onClose} />
    </Modal>
  );
}

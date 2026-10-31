import { useEffect, useRef } from "react";
import { X } from "lucide-react";

export default function Modal({ open, title, onClose, children, wide = false }) {
  const panel = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && onClose();
    const prev = document.activeElement;
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    panel.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      prev?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${wide ? "modal-wide" : ""}`} role="dialog" aria-modal="true" aria-labelledby="modal-title" tabIndex={-1} ref={panel}>
        <div className="modal-head">
          <h2 id="modal-title">{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Закрыть"><X size={20} /></button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { Check, X, Info } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const dismiss = useCallback((id) => setItems((list) => list.filter((t) => t.id !== id)), []);
  const toast = useCallback((message, type = "info") => {
    const id = Math.random().toString(36).slice(2);
    setItems((list) => [...list.slice(-2), { id, message, type }]);
    window.setTimeout(() => dismiss(id), 3600);
  }, [dismiss]);
  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" role="status" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            {t.type === "success" ? <Check size={16} /> : t.type === "error" ? <X size={16} /> : <Info size={16} />}
            <span>{t.message}</span>
            <button onClick={() => dismiss(t.id)} aria-label="Закрыть уведомление"><X size={14} /></button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

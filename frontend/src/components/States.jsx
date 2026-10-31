import { AlertTriangle, RotateCw } from "lucide-react";

export function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="empty-state">
      {Icon && <div className="empty-icon"><Icon size={24} /></div>}
      <h2>{title}</h2>
      {text && <p>{text}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="empty-state" role="alert">
      <div className="empty-icon is-error"><AlertTriangle size={24} /></div>
      <h2>Что-то пошло не так</h2>
      <p>{error?.message || "Не удалось загрузить данные."}</p>
      {onRetry && <button className="btn btn-secondary" onClick={onRetry}><RotateCw size={16} /> Повторить</button>}
    </div>
  );
}

export function PostSkeletons({ count = 3 }) {
  return (
    <div aria-busy="true" aria-label="Загрузка">
      {Array.from({ length: count }, (_, i) => (
        <div className="post-card skeleton" key={i}>
          <div className="sk sk-row"><span className="sk sk-circle" /><span className="sk sk-line w30" /></div>
          <span className="sk sk-line w60" /><span className="sk sk-line" /><span className="sk sk-line w80" />
        </div>
      ))}
    </div>
  );
}

export function Spinner() {
  return <div className="spinner-wrap" role="status" aria-label="Загрузка"><span className="spinner" /></div>;
}

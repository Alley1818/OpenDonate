import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function Field({ id, label, error, hint, multiline = false, ...rest }) {
  const Tag = multiline ? "textarea" : "input";
  return (
    <div className={`field ${error ? "has-error" : ""}`}>
      <label htmlFor={id}>{label}</label>
      <Tag id={id} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} {...rest} />
      {hint && !error && <p className="hint">{hint}</p>}
      {error && <p className="field-error" id={`${id}-err`}>{error}</p>}
    </div>
  );
}

export function PasswordField({ id, label, error, hint, ...rest }) {
  const [show, setShow] = useState(false);
  return (
    <div className={`field ${error ? "has-error" : ""}`}>
      <label htmlFor={id}>{label}</label>
      <div className="password-wrap">
        <input id={id} type={show ? "text" : "password"} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} {...rest} />
        <button type="button" className="icon-btn" onClick={() => setShow((v) => !v)} aria-label={show ? "Скрыть пароль" : "Показать пароль"} aria-pressed={show}>
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {hint && !error && <p className="hint">{hint}</p>}
      {error && <p className="field-error" id={`${id}-err`}>{error}</p>}
    </div>
  );
}

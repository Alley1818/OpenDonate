import { Check } from "lucide-react";
import { formatPrice } from "../utils/format.js";

/** Selectable (radio-like) when `onSelect` is passed; otherwise shows an action button. */
export default function TierCard({ tier, current = false, selected = false, onSelect, actionLabel, onAction, disabled = false }) {
  const body = (
    <>
      <div className="tier-top"><strong>{tier.name}</strong>{current && <span className="badge badge-paid">Ваш уровень</span>}</div>
      <div className="tier-price">{formatPrice(tier.price)}<span> / мес</span></div>
      <p>{tier.description}</p>
      <ul>{tier.perks.map((p) => <li key={p}><Check size={14} />{p}</li>)}</ul>
    </>
  );
  if (onSelect) {
    return (
      <button type="button" role="radio" aria-checked={selected} className={`tier-card selectable ${selected ? "selected" : ""}`} onClick={() => onSelect(tier.id)}>
        {body}
      </button>
    );
  }
  return (
    <div className={`tier-card ${current ? "selected" : ""}`}>
      {body}
      {actionLabel && <button className={`btn ${current ? "btn-secondary" : "btn-primary"} full`} onClick={() => onAction(tier)} disabled={disabled}>{actionLabel}</button>}
    </div>
  );
}

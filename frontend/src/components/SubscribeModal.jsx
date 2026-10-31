import { useEffect, useState } from "react";
import Modal from "./Modal.jsx";
import TierCard from "./TierCard.jsx";
import { api } from "../api/index.js";
import { useToast } from "../hooks/useToast.jsx";
import { formatPrice } from "../utils/format.js";

export default function SubscribeModal({ creator, initialTier, open, onClose, onChange }) {
  const { toast } = useToast();
  const [tierId, setTierId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open && creator) { setTierId(initialTier || creator.subscribed || creator.tiers[1]?.id || creator.tiers[0]?.id); setError(""); }
  }, [open, creator, initialTier]);

  if (!creator) return null;
  const tier = creator.tiers.find((t) => t.id === tierId);
  const changed = tierId !== creator.subscribed;

  const run = async (fn, message) => {
    setBusy(true); setError("");
    try { const next = await fn(); onChange?.(next); toast(message, "success"); onClose(); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title={creator.subscribed ? `Подписка на ${creator.displayName}` : `Поддержать ${creator.displayName}`} wide>
      {creator.tiers.length === 0 ? (
        <p className="muted">У автора пока нет уровней подписки.</p>
      ) : (
        <>
          <div className="tier-grid" role="radiogroup" aria-label="Уровень подписки">
            {creator.tiers.map((t) => <TierCard key={t.id} tier={t} selected={t.id === tierId} current={t.id === creator.subscribed} onSelect={setTierId} />)}
          </div>
          <p className="demo-note">Демо-режим: оплата имитируется, деньги не списываются.</p>
          {error && <div className="alert alert-error" role="alert">{error}</div>}
          <div className="form-actions">
            {creator.subscribed && <button className="btn btn-danger-outline" disabled={busy} onClick={() => run(() => api.creators.unsubscribe(creator.id), "Подписка отменена")}>Отменить подписку</button>}
            <button className="btn btn-primary" disabled={busy || !changed} onClick={() => run(() => api.creators.subscribe(creator.id, tierId), creator.subscribed ? "Уровень подписки изменён" : "Спасибо за поддержку!")}>
              {busy ? "Обработка…" : creator.subscribed ? "Сменить уровень" : `Оформить · ${formatPrice(tier?.price || 0)}`}
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}

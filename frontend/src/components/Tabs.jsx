export default function Tabs({ items, value, onChange, label = "Разделы" }) {
  return (
    <div className="tabs" role="tablist" aria-label={label}>
      {items.map((t) => (
        <button key={t.value} type="button" role="tab" aria-selected={value === t.value} className={value === t.value ? "selected" : ""} onClick={() => onChange(t.value)}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

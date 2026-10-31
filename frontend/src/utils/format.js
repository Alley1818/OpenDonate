export const CURRENCY = "₸";

export const formatPrice = (n) => `${new Intl.NumberFormat("ru-RU").format(n)} ${CURRENCY}`;

export function formatCount(n = 0) {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1).replace(".0", "")}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1).replace(".0", "")}K`;
  return String(n);
}

export function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (!Number.isFinite(diff)) return "";
  if (diff < 60) return "только что";
  const m = Math.floor(diff / 60);
  if (m < 60) return `${m} мин назад`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ч назад`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} дн назад`;
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });

export function initials(name = "") {
  const p = name.trim().split(/\s+/).filter(Boolean);
  return ((p[0]?.[0] || "?") + (p[1]?.[0] || "")).toUpperCase();
}

export const teaser = (text = "", n = 110) => (text.length <= n ? text : `${text.slice(0, n).trimEnd()}…`);

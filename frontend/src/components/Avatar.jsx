import { initials } from "../utils/format.js";

export default function Avatar({ user, size = 40 }) {
  const name = user?.displayName || user?.username || "?";
  return (
    <span className="avatar" style={{ width: size, height: size, background: user?.color || "#111", fontSize: Math.max(10, size * 0.34) }} aria-hidden="true">
      {initials(name)}
    </span>
  );
}

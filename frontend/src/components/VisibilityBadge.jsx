import { Globe, Lock } from "lucide-react";

export default function VisibilityBadge({ visibility }) {
  const paid = visibility === "paid";
  return (
    <span className={`badge ${paid ? "badge-paid" : ""}`}>
      {paid ? <Lock size={11} /> : <Globe size={11} />}
      {paid ? "Платная" : "Открытая"}
    </span>
  );
}

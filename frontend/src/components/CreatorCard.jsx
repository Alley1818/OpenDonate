import { Link } from "react-router-dom";
import { Check, Users } from "lucide-react";
import Avatar from "./Avatar.jsx";
import { formatCount } from "../utils/format.js";

export default function CreatorCard({ creator, onSupport }) {
  return (
    <article className="creator-card">
      <div className="creator-cover" style={{ background: creator.coverColor }} />
      <div className="creator-card-body">
        <Link to={`/creators/${creator.username}`} className="creator-avatar-link"><Avatar user={creator} size={56} /></Link>
        <div className="creator-names">
          <Link to={`/creators/${creator.username}`}><strong>{creator.displayName}</strong>{creator.verified && <Check className="verified" size={14} />}</Link>
          <span>@{creator.username}</span>
        </div>
        <p className="creator-bio">{creator.bio}</p>
        <div className="creator-meta"><span className="chip chip-static">{creator.category}</span><span><Users size={14} /> {formatCount(creator.subscribers)}</span></div>
        <button className={`btn ${creator.subscribed ? "btn-secondary" : "btn-primary"} full`} onClick={() => onSupport(creator)}>
          {creator.subscribed ? "Вы подписаны" : "Поддержать"}
        </button>
      </div>
    </article>
  );
}

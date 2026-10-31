import { Link } from "react-router-dom";

export default function Brand({ to = "/" }) {
  return (
    <Link to={to} className="brand" aria-label="OpenDonate — на главную">
      <span className="brand-mark">O<i /></span><span className="brand-text">OpenDonate</span>
    </Link>
  );
}

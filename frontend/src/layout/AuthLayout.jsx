import { Outlet } from "react-router-dom";
import Brand from "./Brand.jsx";

export default function AuthLayout() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <Brand />
        <Outlet />
      </div>
      <p className="auth-foot">© 2026 OpenDonate · Открытая платформа для авторов</p>
    </div>
  );
}

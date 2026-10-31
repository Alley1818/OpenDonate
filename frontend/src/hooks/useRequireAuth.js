import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth.jsx";
import { useToast } from "./useToast.jsx";

/** Wraps an action so guests are sent to /login (and back afterwards). */
export function useRequireAuth() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  return useCallback((fn) => (...args) => {
    if (!user) {
      toast("Войдите в аккаунт, чтобы продолжить");
      navigate("/login", { state: { from: location.pathname + location.search } });
      return undefined;
    }
    return fn(...args);
  }, [user, toast, navigate, location]);
}

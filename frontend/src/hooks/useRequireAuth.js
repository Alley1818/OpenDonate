import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth.jsx";
import { useToast } from "./useToast.jsx";

export function useRequireAuth() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback(
    (fn) => (...args) => {
      // Не выполняем действие до завершения проверки сессии
      if (loading) {
        return undefined;
      }

      if (!user) {
        toast("Войдите в аккаунт, чтобы продолжить");

        navigate("/login", {
          state: {
            from: location.pathname + location.search,
          },
        });

        return undefined;
      }

      return fn(...args);
    },
    [user, loading, toast, navigate, location]
  );
}

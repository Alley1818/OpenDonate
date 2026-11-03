import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { api } from "../api/index.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      try {
        const currentUser = await api.auth.me();

        if (!cancelled) {
          setUser(currentUser);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Не удалось восстановить сессию:", error);
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (data) => {
    const authenticatedUser = await api.auth.login(data);
    setUser(authenticatedUser);
    return authenticatedUser;
  }, []);

  const register = useCallback(async (data) => {
    const authenticatedUser = await api.auth.register(data);
    setUser(authenticatedUser);
    return authenticatedUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.auth.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const updateProfile = useCallback(async (data) => {
    const updatedUser = await api.profile.update(data);
    setUser(updatedUser);
    return updatedUser;
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      updateProfile,
    }),
    [user, loading, login, register, logout, updateProfile]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
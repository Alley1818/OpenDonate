import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api/index.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api.auth.me().then((u) => !cancelled && setUser(u)).catch(() => {}).finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, []);

  const login = useCallback(async (data) => { const u = await api.auth.login(data); setUser(u); return u; }, []);
  const register = useCallback(async (data) => { const u = await api.auth.register(data); setUser(u); return u; }, []);
  const logout = useCallback(async () => { await api.auth.logout(); setUser(null); }, []);
  const updateProfile = useCallback(async (data) => { const u = await api.profile.update(data); setUser(u); return u; }, []);

  const value = useMemo(() => ({ user, loading, login, register, logout, updateProfile }), [user, loading, login, register, logout, updateProfile]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import authApi from "../services/authApi.js";
import {
  getStoredTokens,
  saveStoredTokens,
  clearStoredTokens,
  setForceLogout,
  extractErrorMessage,
} from "../services/httpClient.js";
import aksaraToast from "../utils/toast.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── Force logout callback (used by httpClient interceptor) ─────
  const forceLogout = useCallback(() => {
    clearStoredTokens();
    setUser(null);
  }, []);

  useEffect(() => {
    setForceLogout(forceLogout);
  }, [forceLogout]);

  // ── Bootstrap: check stored tokens on first mount ──────────────
  useEffect(() => {
    const bootstrap = async () => {
      const stored = getStoredTokens();
      if (!stored?.accessToken) {
        setIsLoading(false);
        return;
      }

      try {
        // Validate session with /auth/me
        const profile = await authApi.getProfile();
        setUser(profile);
      } catch {
        // Token expired → interceptor will try refresh automatically.
        // If refresh also fails, forceLogout clears everything.
        // Either way, we just need to clear local state.
        clearStoredTokens();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrap();
  }, []);

  // ── Login ──────────────────────────────────────────────────────
  const login = useCallback(async ({ email, password }) => {
    const data = await authApi.login({ email, password });
    // Backend returns { accessToken, refreshToken, user }
    saveStoredTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
    setUser(data.user);
    return data;
  }, []);

  // ── Register ───────────────────────────────────────────────────
  const register = useCallback(async ({ name, email, password }) => {
    const data = await authApi.register({ name, email, password });
    saveStoredTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
    setUser(data.user);
    return data;
  }, []);

  // ── Logout ─────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Logout lokal tetap dijalankan meskipun server error
    }
    clearStoredTokens();
    setUser(null);
    aksaraToast.logoutSuccess();
  }, []);

  // ── Refresh profile (re-fetch /auth/me) ────────────────────────
  const refreshProfile = useCallback(async () => {
    try {
      const profile = await authApi.getProfile();
      setUser(profile);
      return profile;
    } catch {
      return null;
    }
  }, []);

  const isAuthenticated = Boolean(user);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      login,
      register,
      logout,
      refreshProfile,
      // Backwards compat aliases
      initializing: isLoading,
      authSession: user ? { user } : null,
    }),
    [user, isAuthenticated, isLoading, login, register, logout, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

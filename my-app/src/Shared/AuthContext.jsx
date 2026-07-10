import { createContext, useState, useEffect } from "react";
import { authService, clearAuthStorage } from "./services/authService";
import {
  setAccessToken,
  clearAccessToken,
  markSession,
  hasSessionFlag,
  clearSessionFlag,
} from "./services/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  // SECURITY: the user object (id, role) lives ONLY in React state, and the
  // access token only in module memory (api.js). Neither is ever persisted
  // to localStorage or JS-readable cookies — client storage is forgeable, so
  // nothing that drives authorization may live there. On reload the session
  // is re-established from the httpOnly refresh cookie, which only the
  // SERVER can read and verify.
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ---------------------------------------------------------------------------
  // Session bootstrap — the SINGLE place that decides "logged in" vs "guest".
  //
  // Outcomes:
  //   • pure guest (no session flag, no legacy traces) → guest, ZERO network calls
  //   • session flag present → cookie refresh → /auth/me → logged in
  //   • refresh/me fails → guest, all auth state cleared
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let active = true;

    const finishAsGuest = () => {
      if (!active) return;
      clearAccessToken();
      clearSessionFlag();
      setUser(null);
      setLoading(false);
    };

    const finishAsUser = (data) => {
      if (!active) return;
      markSession();
      setUser(data);
      setLoading(false);
    };

    (async () => {
      // Migration: older app versions persisted the token + user object in
      // localStorage. Treat their presence as evidence of a session (so the
      // user isn't logged out by this update), then wipe them for good —
      // identity must never live in client storage again.
      const legacyEvidence =
        !!localStorage.getItem("accessToken") || !!localStorage.getItem("user");
      clearAuthStorage();

      // No hint of any prior session → guest, make no auth calls at all.
      if (!hasSessionFlag() && !legacyEvidence) {
        finishAsGuest();
        return;
      }

      // Restore the session from the httpOnly refresh cookie. Succeeds for a
      // returning user, fails cleanly (401) for a stale flag. /auth/refresh
      // is an auth-probe, so the response interceptor will not recurse here.
      try {
        const { data } = await authService.refresh();
        if (!data?.accessToken) throw new Error("no access token");
        setAccessToken(data.accessToken);

        const me = await authService.getMe();
        return finishAsUser(me.data);
      } catch {
        return finishAsGuest();
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const login = (userData, accessToken) => {
    if (accessToken) setAccessToken(accessToken);
    markSession();
    setUser(userData);
  };

  // Single canonical logout for the whole app (public + admin). Tears down the
  // server session, clears local auth state, then drops the user — which makes
  // CartContext/NotificationContext reset. Caller handles navigation.
  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

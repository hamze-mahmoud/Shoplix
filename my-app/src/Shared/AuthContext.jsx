import { createContext, useState, useEffect } from "react";
import { authService, clearAuthStorage } from "./services/authService";

export const AuthContext = createContext();

const readCachedUser = () => {
  try {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  // `user` from localStorage is only a display cache to avoid a flash of the
  // logged-out navbar on reload — it is NOT the source of truth. The real
  // session lives in the httpOnly refresh cookie + access token, which the
  // boot sequence below verifies before we trust this value.
  const [user, setUser] = useState(readCachedUser);
  const [loading, setLoading] = useState(true);

  // ---------------------------------------------------------------------------
  // Session bootstrap — the SINGLE place that decides "logged in" vs "guest".
  //
  // We resolve the session to a definitive state so the rest of the app (cart,
  // notifications) never acts on an ambiguous one. The bug this fixes: a stale
  // cached user used to briefly look logged-in, which kicked off a /cart fetch
  // that silently refreshed the still-valid cookie and pulled the previous
  // user's cart into a "logged out" UI.
  //
  // Outcomes:
  //   • pure guest (no token, no cached user) → guest, ZERO network calls
  //   • valid access token                    → /auth/me, logged in
  //   • expired token but valid refresh cookie → refresh → /auth/me, logged in
  //   • no valid session                       → guest, all auth state cleared
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let active = true;

    const finishAsGuest = () => {
      if (!active) return;
      clearAuthStorage();
      setUser(null);
      setLoading(false);
    };

    const finishAsUser = (data) => {
      if (!active) return;
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      setLoading(false);
    };

    (async () => {
      const token = localStorage.getItem("accessToken");
      const cachedUser = readCachedUser();

      // No evidence of any prior session → guest, make no auth calls at all.
      if ((!token || token === "undefined") && !cachedUser) {
        finishAsGuest();
        return;
      }

      // 1) If we have an access token, try it directly.
      if (token && token !== "undefined") {
        try {
          const { data } = await authService.getMe();
          return finishAsUser(data);
        } catch {
          // token invalid/expired — fall through to a refresh attempt.
        }
      }

      // 2) Try to restore the session from the refresh cookie. This succeeds
      //    for a returning user whose access token is gone/expired, and fails
      //    cleanly (401) for a genuine guest. /auth/refresh is an auth-probe,
      //    so the response interceptor will not recurse here.
      try {
        const { data } = await authService.refresh();
        if (!data?.accessToken) throw new Error("no access token");
        localStorage.setItem("accessToken", data.accessToken);

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
    if (accessToken) localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("user", JSON.stringify(userData));
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

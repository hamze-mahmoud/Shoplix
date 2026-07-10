import axios from "axios";

// =====================
// IN-MEMORY SESSION STATE (security)
// =====================
// The access token — and the user object with its role — are deliberately
// kept ONLY in memory, never in localStorage or JS-readable cookies. Anything
// a script can read, a user (or injected script) can read AND forge; route
// guards must never trust it. Sessions survive page reloads through the
// httpOnly refresh cookie, which JS cannot touch and the SERVER re-verifies
// on every boot before handing back a fresh token + identity.
let accessToken = null;
export const setAccessToken = (t) => {
  accessToken = t || null;
};
export const getAccessToken = () => accessToken;
export const clearAccessToken = () => {
  accessToken = null;
};

// Non-sensitive boolean hint ("a session probably exists") so the boot
// sequence knows whether a cookie-refresh attempt is worth making. It holds
// no identity, no role — forging it only earns a failed 401 refresh.
const SESSION_FLAG = "hasSession";
export const markSession = () => localStorage.setItem(SESSION_FLAG, "1");
export const hasSessionFlag = () => localStorage.getItem(SESSION_FLAG) === "1";
export const clearSessionFlag = () => localStorage.removeItem(SESSION_FLAG);

// =====================
// MAIN API INSTANCE
// =====================
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  withCredentials: true,
});

// =====================
// REFRESH API (IMPORTANT: separate instance)
// =====================
const refreshApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  withCredentials: true,
});

// =====================
// REQUEST INTERCEPTOR
// =====================
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// =====================
// REFRESH LOGIC
// =====================
let isRefreshing = false;
let queue = [];

const processQueue = (error, token = null) => {
  queue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token);
  });

  queue = [];
};

// =====================
// RESPONSE INTERCEPTOR
// =====================
// Endpoints that must NOT trigger the refresh flow. A 401 from any of these
// just means "not logged in" — refreshing/redirecting on them causes the
// constant refresh loop and bounces logged-out users off public pages.
const AUTH_PROBE_ROUTES = ["/auth/me", "/auth/refresh", "/auth/signin", "/auth/signup", "/auth/logout", "/auth/verify-otp", "/auth/resend-otp", "/auth/forgot-password", "/auth/reset-password"];

const isAuthProbe = (url = "") => AUTH_PROBE_ROUTES.some((r) => url.includes(r));

api.interceptors.response.use(
  (res) => res,

  async (error) => {
    const original = error.config;

    // Only attempt a token refresh when:
    //  - it's a 401
    //  - we haven't already retried this request
    //  - we actually have a token to refresh (logged-in session)
    //  - the failing request isn't itself an auth probe
    if (
      error.response?.status === 401 &&
      !original._retry &&
      !!accessToken &&
      !isAuthProbe(original?.url)
    ) {
      original._retry = true;

      // If refresh already running → queue requests
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      isRefreshing = true;

      try {
        // CALL REFRESH TOKEN (httpOnly cookie authenticates this)
        const res = await refreshApi.post("/auth/refresh");
        const newToken = res.data.accessToken;

        setAccessToken(newToken);

        // PROCESS QUEUE
        processQueue(null, newToken);

        // RETRY ORIGINAL REQUEST
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);

      } catch (err) {
        processQueue(err, null);

        // CLEAR AUTH — the session is genuinely dead.
        clearAccessToken();
        clearSessionFlag();

        // Only send the user to /login if they're on a page that actually
        // requires auth. Public pages (home, products, categories, cart…)
        // should keep working for guests instead of being bounced.
        const PROTECTED_PREFIXES = ["/checkout", "/orders", "/profile", "/admin"];
        const onProtectedPage = PROTECTED_PREFIXES.some((p) =>
          window.location.pathname.startsWith(p)
        );
        if (onProtectedPage) {
          window.location.href = "/login";
        }

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;

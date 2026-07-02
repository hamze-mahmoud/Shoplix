import axios from "axios";

// =====================
// MAIN API INSTANCE
// =====================
const api = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
});

// =====================
// REFRESH API (IMPORTANT: separate instance)
// =====================
const refreshApi = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
});

// =====================
// REQUEST INTERCEPTOR
// =====================
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token && token !== "undefined") {
    config.headers.Authorization = `Bearer ${token}`;
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
const AUTH_PROBE_ROUTES = ["/auth/me", "/auth/refresh", "/auth/signin", "/auth/signup", "/auth/logout", "/auth/google", "/auth/facebook"];

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
    const hasToken = !!localStorage.getItem("accessToken");

    if (
      error.response?.status === 401 &&
      !original._retry &&
      hasToken &&
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
        // CALL REFRESH TOKEN
        const res = await refreshApi.post("/auth/refresh");
        console.log("res of refrch token ",res)
        const newToken = res.data.accessToken;

        // SAVE TOKEN (IMPORTANT: consistent key)
        localStorage.setItem("accessToken", newToken);

        // UPDATE DEFAULT HEADER
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;

        // PROCESS QUEUE
        processQueue(null, newToken);

        // RETRY ORIGINAL REQUEST
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);

      } catch (err) {
        processQueue(err, null);

        // CLEAR AUTH — the session is genuinely dead.
        localStorage.removeItem("accessToken");

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
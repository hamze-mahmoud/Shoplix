// Refresh-cookie configuration, environment-aware.
//
// In production the frontend (e.g. *.vercel.app) and backend (e.g.
// *.onrender.com) live on DIFFERENT domains, so the browser only sends the
// httpOnly refresh cookie when it is `Secure` + `SameSite=None`. Locally
// (same host, plain http) that combo is rejected, so we use `Lax` over http.
//
// Requires `app.set("trust proxy", 1)` in server.js so Express treats the
// request as secure behind Render/Vercel's TLS-terminating proxy.

const isProd = process.env.NODE_ENV === "production";

const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;

// Attributes used when SETTING the cookie.
function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: REFRESH_TTL_MS,
    path: "/",
  };
}

// Attributes used when CLEARING it — must match everything except maxAge or
// some browsers refuse to remove the cookie.
function clearCookieOptions() {
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
  };
}

module.exports = { refreshCookieOptions, clearCookieOptions, REFRESH_TTL_MS };

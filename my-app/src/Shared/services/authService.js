import api from "./api";

// Auth-related localStorage keys, cleared together on logout / session loss.
const AUTH_KEYS = ["accessToken", "token", "user"];

export const clearAuthStorage = () =>
  AUTH_KEYS.forEach((k) => localStorage.removeItem(k));

export const authService = {
  login: (data) => api.post("/auth/signin", data),
  register: (data) => api.post("/auth/signup", data),

  // Social login. Both return { user, accessToken } just like signin.
  // googleLogin body is { access_token } (OAuth2 token flow) or { credential }.
  googleLogin: (body) => api.post("/auth/google", body),
  facebookLogin: (accessToken) => api.post("/auth/facebook", { accessToken }),

  getMe: () => api.get("/auth/me"),

  // Exchange the httpOnly refresh cookie for a fresh access token.
  // Used by the boot sequence to restore a session whose access token expired.
  refresh: () => api.post("/auth/refresh"),

  checkIsVerified: (email) =>
    api.get(`/auth/check-isVerified?email=${email}`),

  // Tear down the server session (delete refresh token + clear cookie) and
  // wipe local auth state. Navigation is left to the caller so logout stays a
  // pure SPA transition (no full page reload). Network failure is non-fatal —
  // we always clear local state so the user is logged out client-side.
  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.log("logout error", err);
    }
    clearAuthStorage();
  },
};
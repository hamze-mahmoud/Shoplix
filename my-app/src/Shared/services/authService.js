import api, { clearAccessToken, clearSessionFlag } from "./api";

// Legacy localStorage keys from older app versions that persisted identity
// client-side (a security hole — storage is forgeable). Wiped on every boot
// and logout; the live session now exists only in memory + httpOnly cookie.
const AUTH_KEYS = ["accessToken", "token", "user"];

export const clearAuthStorage = () =>
  AUTH_KEYS.forEach((k) => localStorage.removeItem(k));

export const authService = {
  // login body: { identifier, password } — identifier is a phone number or
  // (for legacy/admin accounts) an email.
  login: (data) => api.post("/auth/signin", data),
  register: (data) => api.post("/auth/signup", data),

  // WhatsApp OTP (signup verification): confirm the 6-digit code / re-send it.
  // verifyOtp responds like /signin ({ user, accessToken }) on success.
  verifyOtp: (data) => api.post("/auth/verify-otp", data),
  resendOtp: (data) => api.post("/auth/resend-otp", data),

  // Forgot password over WhatsApp. forgotPassword doubles as "resend";
  // resetPassword responds like /signin ({ user, accessToken }) on success.
  forgotPassword: (data) => api.post("/auth/forgot-password", data),
  resetPassword: (data) => api.post("/auth/reset-password", data),

  // WhatsApp "tap-to-verify" signup: waStart creates the pending account +
  // returns { token, code, waLink }; poll waStatus until { verified, user,
  // accessToken } (customer proved ownership by messaging the business number).
  waStart: (data) => api.post("/auth/wa-start", data),
  waStatus: (token) => api.get("/auth/wa-status", { params: { token } }),

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
    clearAccessToken();
    clearSessionFlag();
  },
};
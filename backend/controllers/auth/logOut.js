const RefreshToken = require(
  "../../models/RefreshToken"
);
const { clearCookieOptions } = require("../../utils/cookieOptions");

module.exports = async function logout(
  req,
  res
) {
  try {
    const token = req.cookies?.refreshToken;

    // Remove the refresh token from the DB so it can never be replayed.
    // Guard against a missing cookie (already logged out / never logged in).
    if (token) {
      await RefreshToken.deleteOne({ token });
    }

    // Clear the cookie with the same attributes it was set with, otherwise
    // some browsers won't remove it.
    res.clearCookie("refreshToken", clearCookieOptions());

    res.json({ success: true });
  } catch (err) {
    console.error("logout error", err);
    // Even if cleanup fails, clear the cookie and report success so the
    // client can always complete a logout.
    res.clearCookie("refreshToken");
    res.json({ success: true });
  }
};
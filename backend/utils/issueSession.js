const RefreshToken = require("../models/RefreshToken");
const generateAccessToken = require("./generateAccessToken");
const generateRefreshToken = require("./generateRefreshToken");
const { refreshCookieOptions, REFRESH_TTL_MS } = require("./cookieOptions");

// Issue a login session for `user`: mints an access token, creates + stores a
// refresh token, and sets the httpOnly refresh cookie. Mirrors the logic in
// signIn so password and social logins behave identically. Returns the access
// token; the caller sends `{ user, accessToken }` back to the client.
module.exports = async function issueSession(res, user) {
  user.lastLogin = new Date();
  await user.save().catch(() => {});

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await RefreshToken.create({
    user: user._id,
    token: refreshToken,
    expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
  });

  res.cookie("refreshToken", refreshToken, refreshCookieOptions());

  return accessToken;
};

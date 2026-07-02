const { OAuth2Client } = require("google-auth-library");
const User = require("../../models/User");
const issueSession = require("../../utils/issueSession");

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);

// POST /api/auth/google  { credential }
// `credential` is the ID token (a JWT) returned by Google Identity Services on
// the frontend. We verify it server-side, then find-or-create the user and
// issue our own session (access token + refresh cookie).
module.exports = async function googleAuth(req, res) {
  try {
    if (!CLIENT_ID) {
      return res.status(503).json({ error: "Google login is not configured" });
    }

    const { credential, access_token } = req.body;
    if (!credential && !access_token) {
      return res.status(400).json({ error: "Missing Google credential" });
    }

    // Two supported flows:
    //  • credential   — an ID token (JWT) from the GIS rendered button.
    //  • access_token — from the GIS OAuth2 token flow (custom button); we
    //    validate it by calling Google's userinfo endpoint.
    let payload;
    if (credential) {
      const ticket = await client.verifyIdToken({ idToken: credential, audience: CLIENT_ID });
      payload = ticket.getPayload();
    } else {
      const resp = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      if (!resp.ok) {
        return res.status(401).json({ error: "Invalid Google token" });
      }
      payload = await resp.json();
    }

    // userinfo returns email_verified as a boolean or the string "true".
    const emailVerified =
      payload?.email_verified === true || payload?.email_verified === "true";

    if (!payload || !payload.email || !emailVerified) {
      return res.status(401).json({ error: "Google account email is not verified" });
    }

    const email = payload.email.toLowerCase();
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        firstName: payload.given_name || payload.name || "User",
        lastName: payload.family_name || "",
        email,
        provider: "google",
        providerId: payload.sub,
        avatar: payload.picture,
        isVerified: true, // Google already verified the email
      });
    } else {
      // Link Google to an existing (e.g. local) account so the user can use
      // either method, and backfill avatar / verified state.
      let dirty = false;
      if (!user.providerId) { user.providerId = payload.sub; dirty = true; }
      if (!user.avatar && payload.picture) { user.avatar = payload.picture; dirty = true; }
      if (!user.isVerified) { user.isVerified = true; dirty = true; }
      if (dirty) await user.save();
    }

    if (user.isActive === false) {
      return res.status(403).json({ error: "This account is disabled" });
    }

    const accessToken = await issueSession(res, user);
    const u = user.toObject();
    delete u.passwordHash;

    res.json({ user: u, accessToken });
  } catch (err) {
    console.error("googleAuth error:", err.message);
    res.status(401).json({ error: "Google authentication failed" });
  }
};

const User = require("../../models/User");
const issueSession = require("../../utils/issueSession");

const APP_ID = process.env.FACEBOOK_APP_ID;
const APP_SECRET = process.env.FACEBOOK_APP_SECRET;
const GRAPH = "https://graph.facebook.com";

// POST /api/auth/facebook  { accessToken }
// `accessToken` is the user access token from the Facebook JS SDK on the
// frontend. We (1) confirm the token was issued for OUR app, then (2) read the
// profile, then find-or-create the user and issue our own session.
module.exports = async function facebookAuth(req, res) {
  try {
    if (!APP_ID || !APP_SECRET) {
      return res.status(503).json({ error: "Facebook login is not configured" });
    }

    const { accessToken: fbToken } = req.body;
    if (!fbToken) {
      return res.status(400).json({ error: "Missing Facebook token" });
    }

    // 1) Verify the token belongs to our app and is valid.
    const appToken = `${APP_ID}|${APP_SECRET}`;
    const debug = await fetch(
      `${GRAPH}/debug_token?input_token=${encodeURIComponent(fbToken)}&access_token=${encodeURIComponent(appToken)}`
    ).then((r) => r.json());

    const info = debug?.data;
    if (!info?.is_valid || String(info.app_id) !== String(APP_ID)) {
      return res.status(401).json({ error: "Invalid Facebook token" });
    }

    // 2) Read the profile.
    const profile = await fetch(
      `${GRAPH}/me?fields=id,first_name,last_name,email&access_token=${encodeURIComponent(fbToken)}`
    ).then((r) => r.json());

    if (!profile?.id) {
      return res.status(401).json({ error: "Could not read Facebook profile" });
    }

    // Facebook may not return an email (not granted / none on file) — fall back
    // to a stable synthetic address so the account still works.
    const email = (profile.email || `fb_${profile.id}@facebook.local`).toLowerCase();

    let user = await User.findOne({
      $or: [{ email }, { provider: "facebook", providerId: profile.id }],
    });

    if (!user) {
      user = await User.create({
        firstName: profile.first_name || "User",
        lastName: profile.last_name || "",
        email,
        provider: "facebook",
        providerId: profile.id,
        isVerified: true, // trusted provider
      });
    } else {
      let dirty = false;
      if (!user.providerId) { user.providerId = profile.id; dirty = true; }
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
    console.error("facebookAuth error:", err.message);
    res.status(401).json({ error: "Facebook authentication failed" });
  }
};

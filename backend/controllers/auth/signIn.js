const User = require("../../models/User");
const RefreshToken = require("../../models/RefreshToken");

const generateAccessToken = require("../../utils/generateAccessToken");
const generateRefreshToken = require("../../utils/generateRefreshToken");
const { refreshCookieOptions } = require("../../utils/cookieOptions");

const { phoneKeyOf } = require("../../utils/phone");

module.exports = async function signIn(req, res) {
  // `identifier` is a phone number (primary flow) or an email (legacy/admin
  // accounts). `email` is still accepted for backward compatibility.
  const { identifier, email, password } = req.body;
  const id = (identifier || email || "").trim();

  if (!id || !password) {
    return res
      .status(400)
      .json({ error: "phone/email and password required" });
  }

  try {
    let user;
    if (id.includes("@")) {
      user = await User.findOne({ email: id.toLowerCase() });
    } else {
      const key = phoneKeyOf(id);
      user = key ? await User.findOne({ phoneKey: key }) : null;
    }

    if (!user) {
      return res
        .status(401)
        .json({ error: "invalid credentials" });
    }

    const valid =
      await user.verifyPassword(password);

    if (!valid) {
      return res
        .status(401)
        .json({ error: "invalid credentials" });
    }

    if (!user.isVerified) {
      // Phone accounts verify via WhatsApp code — tell the client to open
      // the verification step. (Legacy accounts verified via email.)
      if (user.phoneKey) {
        return res.status(403).json({
          error: "Please verify your phone number first",
          needsVerification: true,
          phone: user.phone,
        });
      }
      return res.status(403).json({
        error:
          "Please verify your email before signing in.",
      });
    }

    // Record last login (best-effort, non-blocking)
    user.lastLogin = new Date();
    await user.save().catch(() => {});

    const accessToken =
      generateAccessToken(user);

    const refreshToken =
      generateRefreshToken(user);

    await RefreshToken.create({
      user: user._id,
      token: refreshToken,
      expiresAt:
        new Date(
          Date.now() +
            7 * 24 * 60 * 60 * 1000
        ),
    });

    res.cookie("refreshToken", refreshToken, refreshCookieOptions());

    const u = user.toObject();

    delete u.passwordHash;

    res.json({
      user: u,
      accessToken,
    });

  } catch (err) {
    console.error("signIn error", err);

    res.status(500).json({
      error: "Login failed",
    });
  }
};
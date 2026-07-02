const User = require("../../models/User");
const RefreshToken = require("../../models/RefreshToken");

const generateAccessToken = require("../../utils/generateAccessToken");
const generateRefreshToken = require("../../utils/generateRefreshToken");

module.exports = async function signIn(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ error: "email and password required" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(401)
        .json({ error: "invalid credentials" });
    }

    // Social-login accounts have no local password.
    if (!user.passwordHash) {
      return res.status(401).json({
        error: `This account uses ${user.provider || "social"} login. Please continue with ${user.provider || "your provider"}.`,
      });
    }

    const valid =
      await user.verifyPassword(password);

    if (!valid) {
      return res
        .status(401)
        .json({ error: "invalid credentials" });
    }

    if (!user.isVerified) {
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

    res.cookie(
      "refreshToken",
      refreshToken,
      {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge:
          7 * 24 * 60 * 60 * 1000,
      }
    );

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
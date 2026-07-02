const jwt = require("jsonwebtoken");
const RefreshToken = require("../../models/RefreshToken");
const generateAccessToken = require("../../utils/generateAccessToken");

module.exports = async function refreshToken(req, res) {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({
        error: {
          code: "NO_REFRESH_TOKEN",
          message: "No refresh token provided",
        },
      });
    }

    console.log("COOKIE TOKEN:", token);

    // Verify JWT
    let decoded;
    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_REFRESH_SECRET
      );
    } catch (err) {
      console.error("JWT VERIFY ERROR:", err.message);

      return res.status(401).json({
        error: {
          code: "EXPIRED_REFRESH_TOKEN",
          message: "Refresh token expired",
        },
      });
    }

    console.log("DECODED:", decoded);

    // Check token exists in database
    const stored = await RefreshToken.findOne({
      token,
    });

    console.log("STORED TOKEN:", stored);

    if (!stored) {
      return res.status(401).json({
        error: {
          code: "INVALID_REFRESH_TOKEN",
          message: "Refresh token not found",
        },
      });
    }

    // IMPORTANT FIX:
    // Schema uses "user", NOT "userId"
    if (stored.user.toString() !== decoded.id) {
      return res.status(401).json({
        error: {
          code: "TOKEN_MISMATCH",
          message: "Token does not belong to user",
        },
      });
    }

    // Generate new access token
    const accessToken = generateAccessToken({
      _id: decoded.id,
    });

    return res.status(200).json({
      accessToken,
    });

  } catch (err) {
    console.error(
      "REFRESH CONTROLLER ERROR:",
      err
    );

    return res.status(500).json({
      error: {
        code: "SERVER_ERROR",
        message: "Something went wrong",
      },
    });
  }
};
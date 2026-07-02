const jwt = require("jsonwebtoken");
const User = require("../../models/User");

module.exports = async function verifyEmail(req, res) {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const { token } = req.query;

  if (!token) {
    return res.redirect(`${frontendUrl}/verify-error`);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.redirect(`${frontendUrl}/verify-error`);
    }

    user.isVerified = true;
    await user.save();

    // Send the user back to the frontend success page (their browser is here).
    return res.redirect(`${frontendUrl}/verify-success`);
  } catch (err) {
    console.log("VERIFY ERROR:", err.message);
    return res.redirect(`${frontendUrl}/verify-error`);
  }
};
const jwt = require("jsonwebtoken");

function generateAccessToken(user) {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "2m",
    }
  );
}

module.exports = generateAccessToken;
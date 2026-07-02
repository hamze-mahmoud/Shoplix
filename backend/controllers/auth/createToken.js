const jwt = require('jsonwebtoken')

module.exports = function createToken(user) {
  console.log(" creating token for user", user.email, "with role", user.role)
  return jwt.sign({ id: user._id, email: user.email , role:user.role }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '7d',
  })
}

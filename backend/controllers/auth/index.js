const logOut = require('./logOut');

module.exports = {
  signUp: require('./signUp'),
  signIn: require('./signIn'),
  verifyEmail: require('./verifyEmail'),
  checkIsVerified: require('./checkIsVerified'),
  getMe: require('./getMe'),
  refreshToken:require("./refershToken"),
  logOut:require("./logOut"),
  googleAuth: require("./googleAuth"),
  facebookAuth: require("./facebookAuth")

}
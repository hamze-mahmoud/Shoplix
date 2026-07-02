const User = require('../../models/User')

module.exports = async function checkIsVerified(req, res) {

    const {email}=req.query

  const user = await User.findOne({ email });

  if (!user) return res.status(404).json({ verified: false });

  res.json({ verified: user.isVerified });
};

const User = require('../../models/User')
const RefreshToken = require('../../models/RefreshToken')
const issueSession = require('../../utils/issueSession')
const { phoneKeyOf } = require('../../utils/phone')
const { checkOtp } = require('../../utils/otp')

// Forgot password, step 2: verify the WhatsApp code and set the new
// password. All existing sessions are revoked (a reset means the old
// credentials can no longer be trusted) and a fresh session is issued so
// the user lands signed in.
module.exports = async function resetPassword(req, res) {
  const { phone, code, newPassword } = req.body

  const phoneKey = phoneKeyOf(phone || '')
  const cleanCode = String(code || '').trim()

  if (!phoneKey || !/^\d{6}$/.test(cleanCode)) {
    return res.status(400).json({ error: 'Phone and 6-digit code required' })
  }
  if (String(newPassword || '').length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' })
  }

  try {
    const user = await User.findOne({ phoneKey })
    if (!user) {
      return res.status(404).json({ error: 'No account found for this phone number' })
    }

    const check = await checkOtp(phoneKey, 'reset', cleanCode)
    if (!check.ok) {
      return res.status(check.status).json({
        error: check.error,
        expired: check.expired,
        attemptsLeft: check.attemptsLeft,
      })
    }

    user.passwordHash = await User.hashPassword(newPassword)
    // Entering the code proves phone ownership — covers accounts that never
    // finished signup verification too.
    user.isVerified = true
    await user.save()

    // Kill every existing session; only the fresh one below survives.
    await RefreshToken.deleteMany({ user: user._id })

    const accessToken = await issueSession(res, user)
    const u = user.toObject()
    delete u.passwordHash

    res.json({ user: u, accessToken })
  } catch (err) {
    console.error('resetPassword error', err)
    res.status(500).json({ error: 'Password reset failed' })
  }
}

const User = require('../../models/User')
const issueSession = require('../../utils/issueSession')
const { phoneKeyOf } = require('../../utils/phone')
const { checkOtp } = require('../../utils/otp')

// Phone-based registration, step 2 of 2: check the 6-digit WhatsApp code.
// On success the account is marked verified and a session is issued — the
// response shape matches /signin so the client logs straight in.
module.exports = async function verifyOtp(req, res) {
  const { phone, code } = req.body

  const phoneKey = phoneKeyOf(phone || '')
  const cleanCode = String(code || '').trim()

  if (!phoneKey || !/^\d{6}$/.test(cleanCode)) {
    return res.status(400).json({ error: 'Phone and 6-digit code required' })
  }

  try {
    const check = await checkOtp(phoneKey, 'signup', cleanCode)
    if (!check.ok) {
      return res.status(check.status).json({
        error: check.error,
        expired: check.expired,
        attemptsLeft: check.attemptsLeft,
      })
    }

    const user = await User.findOne({ phoneKey })
    if (!user) {
      return res
        .status(404)
        .json({ error: 'Account not found. Please sign up again.' })
    }

    user.isVerified = true
    await user.save()

    const accessToken = await issueSession(res, user)
    const u = user.toObject()
    delete u.passwordHash

    res.json({ user: u, accessToken })
  } catch (err) {
    console.error('verifyOtp error', err)
    res.status(500).json({ error: 'Verification failed' })
  }
}

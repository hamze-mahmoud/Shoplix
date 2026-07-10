const User = require('../../models/User')
const { phoneKeyOf } = require('../../utils/phone')
const { issueOtp } = require('../../utils/otp')

// Re-send the signup code (cooldown-limited to one send per minute).
module.exports = async function resendOtp(req, res) {
  const phoneKey = phoneKeyOf(req.body.phone || '')
  if (!phoneKey) {
    return res.status(400).json({ error: 'Valid phone required' })
  }

  try {
    const user = await User.findOne({ phoneKey })
    if (!user) {
      return res
        .status(404)
        .json({ error: 'No account found for this phone. Please sign up first.' })
    }
    if (user.isVerified) {
      return res
        .status(400)
        .json({ error: 'This account is already verified. Please sign in.' })
    }

    let result
    try {
      result = await issueOtp(phoneKey, user.phone, 'signup')
    } catch (sendErr) {
      console.error('OTP send failed', sendErr)
      return res
        .status(502)
        .json({ error: 'Could not send the WhatsApp code. Please try again.' })
    }

    if (!result.sent) {
      return res.status(429).json({
        error: `Please wait ${result.retryAfter}s before requesting a new code`,
        retryAfter: result.retryAfter,
      })
    }

    res.json({ sent: true })
  } catch (err) {
    console.error('resendOtp error', err)
    res.status(500).json({ error: 'Could not resend code' })
  }
}

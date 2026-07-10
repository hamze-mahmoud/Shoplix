const User = require('../../models/User')
const { phoneKeyOf } = require('../../utils/phone')
const { issueOtp } = require('../../utils/otp')

// Forgot password, step 1: send a reset code to the account's WhatsApp.
// Re-calling acts as "resend" (the cooldown in issueOtp throttles it).
module.exports = async function forgotPassword(req, res) {
  const phoneKey = phoneKeyOf(req.body.phone || '')
  if (!phoneKey) {
    return res.status(400).json({ error: 'Valid phone required' })
  }

  try {
    const user = await User.findOne({ phoneKey })
    // Email-only legacy accounts have no WhatsApp to receive a code.
    if (!user || !user.phoneKey) {
      return res
        .status(404)
        .json({ error: 'No account found for this phone number' })
    }

    let result
    try {
      result = await issueOtp(phoneKey, user.phone, 'reset')
    } catch (sendErr) {
      console.error('reset OTP send failed', sendErr)
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

    res.json({ sent: true, phone: user.phone })
  } catch (err) {
    console.error('forgotPassword error', err)
    res.status(500).json({ error: 'Could not send reset code' })
  }
}

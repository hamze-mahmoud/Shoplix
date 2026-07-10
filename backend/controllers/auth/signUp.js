const User = require('../../models/User')
const { digitsOf, phoneKeyOf, isValidPhone } = require('../../utils/phone')
const { issueOtp } = require('../../utils/otp')

// Phone-based registration, step 1 of 2: validate the form, create the
// account UNVERIFIED, and send a 6-digit code to the user's WhatsApp.
// The session is only issued after POST /auth/verify-otp confirms the code,
// so nobody can register a phone number they don't own.
module.exports = async function signUp(req, res) {
  const { firstName, lastName, phone, password } = req.body

  if (!firstName || !lastName || !phone || !password) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  if (!isValidPhone(phone)) {
    return res.status(400).json({ error: 'Please enter a valid phone number' })
  }

  if (String(password).length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' })
  }

  try {
    const phoneKey = phoneKeyOf(phone)

    // Only PS/IL mobiles can receive the WhatsApp code: the canonical key
    // (last 9 digits) must be a 9-digit number starting with 5.
    if (!/^5\d{8}$/.test(phoneKey)) {
      return res.status(400).json({ error: 'Please enter a valid mobile number' })
    }

    let user = await User.findOne({ phoneKey })
    if (user && user.isVerified) {
      return res.status(409).json({ error: 'This phone number is already registered' })
    }

    const passwordHash = await User.hashPassword(password)

    if (user) {
      // Re-registration of a number that never finished verification:
      // take over the stale record with the new details.
      user.firstName = firstName
      user.lastName = lastName
      user.passwordHash = passwordHash
      await user.save()
    } else {
      user = new User({
        firstName,
        lastName,
        // Email stays required+unique in the schema for legacy accounts, so
        // phone signups get a stable placeholder derived from the number.
        email: `p${phoneKey}@shoplix.local`,
        phone: digitsOf(phone),
        phoneKey,
        passwordHash,
        isVerified: false, // flips true when the WhatsApp code is confirmed
      })
      await user.save()
    }

    let otp
    try {
      otp = await issueOtp(phoneKey, user.phone, 'signup')
    } catch (sendErr) {
      console.error('OTP send failed', sendErr)
      return res
        .status(502)
        .json({ error: 'Could not send the WhatsApp code. Please try again.' })
    }

    // When the cooldown is still running (double submit), the previous code
    // is still valid — the client moves to the verify step either way.
    res.status(201).json({
      pendingVerification: true,
      phone: user.phone,
      retryAfter: otp.sent ? undefined : otp.retryAfter,
    })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'This phone number is already registered' })
    }
    console.error('signUp error', error)
    res.status(500).json({ error: 'Signup failed' })
  }
}

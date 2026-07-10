const crypto = require('crypto')
const OtpCode = require('../models/OtpCode')
const { sendAuthCode } = require('../services/whatsapp')
const { toWhatsAppNumber } = require('./phone')

const OTP_TTL_MS = 5 * 60 * 1000 // a code is valid for 5 minutes
const RESEND_COOLDOWN_MS = 60 * 1000 // at most one send per minute per phone
const MAX_ATTEMPTS = 5 // wrong guesses before the code is invalidated

function generateCode() {
  return String(crypto.randomInt(0, 1000000)).padStart(6, '0')
}

function hashCode(code) {
  return crypto.createHash('sha256').update(String(code)).digest('hex')
}

// Create (or refresh) a code for a phone and deliver it over WhatsApp.
// `purpose` is 'signup' (activate a new account) or 'reset' (forgot
// password) — each purpose has its own independent code + cooldown.
// Returns:
//   { sent: true }                      — delivered (dev mode: backend console)
//   { sent: false, retryAfter: <sec> }  — cooldown still running
// The code itself never leaves the server: in dev mode it is printed to the
// backend console only, never included in an API response.
async function issueOtp(phoneKey, phone, purpose = 'signup') {
  const existing = await OtpCode.findOne({ phoneKey, purpose })
  if (existing) {
    const elapsed = Date.now() - existing.lastSentAt.getTime()
    if (elapsed < RESEND_COOLDOWN_MS) {
      return {
        sent: false,
        retryAfter: Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000),
      }
    }
  }

  const code = generateCode()
  await OtpCode.findOneAndUpdate(
    { phoneKey, purpose },
    {
      codeHash: hashCode(code),
      attempts: 0,
      lastSentAt: new Date(),
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    },
    { upsert: true }
  )

  await sendAuthCode(toWhatsAppNumber(phone), code)
  return { sent: true }
}

// Validate a submitted code. Consumes the OTP on success; counts the attempt
// on failure. Returns:
//   { ok: true }
//   { ok: false, status, error, expired?, attemptsLeft? }
async function checkOtp(phoneKey, purpose, code) {
  const otp = await OtpCode.findOne({ phoneKey, purpose })

  if (!otp || otp.expiresAt < new Date()) {
    if (otp) await otp.deleteOne()
    return {
      ok: false,
      status: 400,
      error: 'Code expired. Please request a new one.',
      expired: true,
    }
  }

  if (otp.attempts >= MAX_ATTEMPTS) {
    await otp.deleteOne()
    return {
      ok: false,
      status: 429,
      error: 'Too many attempts. Please request a new code.',
      expired: true,
    }
  }

  if (otp.codeHash !== hashCode(String(code).trim())) {
    otp.attempts += 1
    await otp.save()
    return {
      ok: false,
      status: 400,
      error: 'Incorrect code',
      attemptsLeft: MAX_ATTEMPTS - otp.attempts,
    }
  }

  await otp.deleteOne()
  return { ok: true }
}

module.exports = { issueOtp, checkOtp, hashCode, MAX_ATTEMPTS }

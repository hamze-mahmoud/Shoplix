const mongoose = require('mongoose')

// One active signup code per phone. Codes are stored hashed, expire after a
// few minutes (TTL index purges them), and allow a limited number of guesses.
const otpCodeSchema = new mongoose.Schema({
  phoneKey: { type: String, required: true },
  purpose: { type: String, enum: ['signup', 'reset'], default: 'signup' },
  codeHash: { type: String, required: true },
  attempts: { type: Number, default: 0 },
  lastSentAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
})

otpCodeSchema.index({ phoneKey: 1, purpose: 1 }, { unique: true })
// MongoDB purges expired codes automatically.
otpCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

module.exports = mongoose.model('OtpCode', otpCodeSchema)

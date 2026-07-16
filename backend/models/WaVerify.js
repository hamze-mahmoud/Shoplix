const mongoose = require("mongoose");

// Pending "tap-to-verify on WhatsApp" record. The customer proves they own a
// number by sending a secret CODE from it to our business number; the inbound
// webhook matches it and flips `verified`. No template / business verification
// needed (it's a customer-initiated message). TTL index purges stale records.
const waVerifySchema = new mongoose.Schema({
  phoneKey: { type: String, required: true, index: true }, // canonical last-9 key
  phone: { type: String, required: true }, // digits as entered (display)
  code: { type: String, required: true }, // shown to the user + sent on WhatsApp
  token: { type: String, required: true, unique: true }, // opaque, frontend polls with it
  verified: { type: Boolean, default: false },
  expiresAt: { type: Date, required: true },
});

// MongoDB auto-removes expired pending verifications.
waVerifySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("WaVerify", waVerifySchema);

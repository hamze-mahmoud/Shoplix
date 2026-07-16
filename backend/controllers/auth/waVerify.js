const crypto = require("crypto");
const User = require("../../models/User");
const WaVerify = require("../../models/WaVerify");
const issueSession = require("../../utils/issueSession");
const { digitsOf, phoneKeyOf, isValidPhone } = require("../../utils/phone");

const TTL_MIN = 15;
// No 0/O/1/I to avoid confusion if the customer ever reads the code aloud.
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function genCode(n = 6) {
  const bytes = crypto.randomBytes(n);
  let s = "";
  for (let i = 0; i < n; i++) s += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  return s;
}

// POST /auth/wa-start — create the pending (unverified) account and a secret
// code the customer sends to our WhatsApp number to prove ownership. We send
// NOTHING here (customer-initiated flow → no template / business verification).
async function waStart(req, res) {
  const { firstName, lastName, phone, password } = req.body;

  if (!firstName || !lastName || !phone || !password)
    return res.status(400).json({ error: "Missing required fields" });
  if (!isValidPhone(phone))
    return res.status(400).json({ error: "Please enter a valid phone number" });
  if (String(password).length < 8)
    return res.status(400).json({ error: "Password must be at least 8 characters" });

  const phoneKey = phoneKeyOf(phone);
  if (!/^5\d{8}$/.test(phoneKey))
    return res.status(400).json({ error: "Please enter a valid mobile number" });

  try {
    let user = await User.findOne({ phoneKey });
    if (user && user.isVerified)
      return res.status(409).json({ error: "This phone number is already registered" });

    const passwordHash = await User.hashPassword(password);
    if (user) {
      // take over a stale, never-verified record
      user.firstName = firstName;
      user.lastName = lastName;
      user.passwordHash = passwordHash;
      await user.save();
    } else {
      user = await User.create({
        firstName,
        lastName,
        email: `p${phoneKey}@shoplix.local`,
        phone: digitsOf(phone),
        phoneKey,
        passwordHash,
        isVerified: false,
      });
    }

    await WaVerify.deleteMany({ phoneKey }); // one active pending per number
    const code = genCode();
    const token = crypto.randomBytes(24).toString("base64url");
    await WaVerify.create({
      phoneKey,
      phone: digitsOf(phone),
      code,
      token,
      expiresAt: new Date(Date.now() + TTL_MIN * 60 * 1000),
    });

    const business = process.env.WHATSAPP_BUSINESS_NUMBER || "";
    const text = `Verify my Shoplix account: ${code}`;
    const waLink = business
      ? `https://wa.me/${business}?text=${encodeURIComponent(text)}`
      : null;

    res.status(201).json({ token, code, waLink, businessNumber: business, expiresInMin: TTL_MIN });
  } catch (err) {
    if (err.code === 11000)
      return res.status(409).json({ error: "This phone number is already registered" });
    console.error("waStart error", err);
    res.status(500).json({ error: "Could not start verification" });
  }
}

// GET /auth/wa-status?token=... — the signup page polls this. Once the webhook
// has matched the code, we mark the user verified and issue a session (same
// response shape as /signin, so the client logs straight in).
async function waStatus(req, res) {
  const { token } = req.query;
  if (!token) return res.status(400).json({ error: "token required" });

  try {
    const rec = await WaVerify.findOne({ token });
    if (!rec) return res.status(404).json({ verified: false, error: "expired" });
    if (!rec.verified) return res.json({ verified: false });

    const user = await User.findOne({ phoneKey: rec.phoneKey });
    if (!user) return res.status(404).json({ error: "Account not found" });
    if (!user.isVerified) {
      user.isVerified = true;
      await user.save();
    }

    const accessToken = await issueSession(res, user);
    const u = user.toObject();
    delete u.passwordHash;

    await WaVerify.deleteOne({ _id: rec._id }); // consume
    res.json({ verified: true, user: u, accessToken });
  } catch (err) {
    console.error("waStatus error", err);
    res.status(500).json({ error: "Status check failed" });
  }
}

// Called by the WhatsApp webhook for each inbound text. If the sender has a
// pending verification and their message contains the code, mark it verified.
// Returns true when it was a verification message (so the concierge ignores it).
async function tryMatchVerification(from, text) {
  const senderKey = phoneKeyOf(from);
  if (!senderKey) return false;
  const rec = await WaVerify.findOne({
    phoneKey: senderKey,
    verified: false,
    expiresAt: { $gt: new Date() },
  });
  if (!rec) return false;
  if (!String(text || "").toUpperCase().includes(rec.code)) return false;

  rec.verified = true;
  await rec.save();
  await User.updateOne({ phoneKey: senderKey }, { $set: { isVerified: true } });
  console.log(`WhatsApp tap-to-verify ✔ ${senderKey}`);
  return true;
}

module.exports = { waStart, waStatus, tryMatchVerification };

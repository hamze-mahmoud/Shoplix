const User = require("../../models/User");
const issueSession = require("../../utils/issueSession");
const { digitsOf, phoneKeyOf, isValidPhone } = require("../../utils/phone");

// Direct signup — NO WhatsApp verification. The account is created verified and
// a session is issued immediately (same response shape as /signin).
//
// Temporary policy while Meta business verification is pending: the phone
// number is taken on trust and confirmed later by a human at order time
// (cash-on-delivery + admin WhatsApp confirmation). When the WhatsApp app is
// published, switch the Register page back to the wa-start flow (or the
// auth_code template) — all of that code is kept intact.
module.exports = async function signUpDirect(req, res) {
  const { firstName, lastName, phone, password } = req.body;

  if (!firstName || !lastName || !phone || !password)
    return res.status(400).json({ error: "Missing required fields" });
  if (!isValidPhone(phone))
    return res.status(400).json({ error: "Please enter a valid phone number" });
  if (String(password).length < 6)
    return res.status(400).json({ error: "Password must be at least 6 characters" });

  const phoneKey = phoneKeyOf(phone);
  if (!/^5\d{8}$/.test(phoneKey))
    return res.status(400).json({ error: "Please enter a valid mobile number" });

  try {
    let user = await User.findOne({ phoneKey });
    if (user && user.isVerified)
      return res.status(409).json({ error: "This phone number is already registered" });

    const passwordHash = await User.hashPassword(password);
    if (user) {
      // Take over a stale account from the old verify-gated flow so those
      // users aren't stuck: re-registering claims it and unlocks login.
      user.firstName = firstName;
      user.lastName = lastName;
      user.passwordHash = passwordHash;
      user.isVerified = true;
      await user.save();
    } else {
      user = await User.create({
        firstName,
        lastName,
        email: `p${phoneKey}@shoplix.local`,
        phone: digitsOf(phone),
        phoneKey,
        passwordHash,
        isVerified: true,
      });
    }

    const accessToken = await issueSession(res, user);
    const u = user.toObject();
    delete u.passwordHash;

    res.status(201).json({ user: u, accessToken });
  } catch (err) {
    if (err.code === 11000)
      return res.status(409).json({ error: "This phone number is already registered" });
    console.error("signUpDirect error", err);
    res.status(500).json({ error: "Registration failed" });
  }
};

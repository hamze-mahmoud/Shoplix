// Dev helper: print a short-lived JWT for the first admin user (for API testing).
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const admin = await User.findOne({ role: "admin" }).select("_id role email");
  if (!admin) { console.error("no admin user"); process.exit(1); }
  console.log(jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: "15m" }));
  await mongoose.disconnect();
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });

// Dry-run test of the WhatsApp Gift Concierge brain (no messages sent).
// Usage: node scripts/testConcierge.js
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
require("../models/Category");
require("../models/Product");
require("../models/Order");
const { handleIncomingMessage } = require("../services/concierge");

const CASES = [
  // product requests
  "بدي مكتب",
  "اريد كرسي بسعر 300 شيكل",
  "do you have a laptop under 2000?",
  "عندكم جوالات؟",
  "יש לכם אוזניות?",
  "هدية لأمي: ساعة بميزانية 500 شيكل", // gift + specific product
  "اريد كنبة", // likely not in catalog → not-found fallback
  // browse
  "شو عندكم؟",
  "what do you sell?",
  // gift (regression)
  "أريد هدية لأمي، بميزانية 200 شيكل",
  "هدية لابني بميزانية ٢٥٠ شيكل",
  // greeting + unknown (regression)
  "مرحبا",
  "hello",
  "what time do you open?",
];

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  for (const text of CASES) {
    const { reply, intent, lang } = await handleIncomingMessage({ text, dryRun: true });
    console.log("=".repeat(60));
    console.log("IN  :", text);
    console.log("LANG:", lang, "| INTENT:", JSON.stringify(intent));
    console.log("OUT :\n" + reply);
  }
  await mongoose.disconnect();
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });

// End-to-end test of the voice pipeline: feed a real audio file through the
// Groq Whisper transcription service, then the concierge brain.
// Usage: node scripts/testTranscribe.js <path-to-audio>
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const fs = require("fs");
const mongoose = require("mongoose");
require("../models/Category");
require("../models/Product");
require("../models/Order");
const { transcribeAudio, isTranscriptionConfigured } = require("../services/transcribe");
const { handleIncomingMessage } = require("../services/concierge");

(async () => {
  const file = process.argv[2];
  console.log("Groq configured:", isTranscriptionConfigured());

  const buffer = fs.readFileSync(file);
  const mime = file.endsWith(".wav") ? "audio/wav" : "audio/ogg";

  const t0 = Date.now();
  const text = await transcribeAudio(buffer, mime);
  console.log(`Transcript (${Date.now() - t0}ms): "${text}"`);

  if (text) {
    await mongoose.connect(process.env.MONGODB_URI);
    const { reply, intent, lang } = await handleIncomingMessage({ text, dryRun: true });
    console.log("Intent:", JSON.stringify(intent), "| lang:", lang);
    console.log("Reply:\n" + reply);
    await mongoose.disconnect();
  }
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });

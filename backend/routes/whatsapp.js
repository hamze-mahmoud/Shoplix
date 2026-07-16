const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const { handleIncomingMessage } = require("../services/concierge");
const { downloadMedia, sendText } = require("../services/whatsapp");
const { transcribeAudio, isTranscriptionConfigured } = require("../services/transcribe");
const { tryMatchVerification } = require("../controllers/auth/waVerify");

// A voice note (type "audio") is downloaded, transcribed, then fed into the
// SAME concierge brain as a typed message. Runs off the request thread.
async function handleVoiceNote(from, mediaId) {
  try {
    if (!isTranscriptionConfigured()) {
      // No STT key yet — politely ask the customer to type instead.
      await sendText(
        from,
        "🎙️ عذراً، الرسائل الصوتية غير مفعّلة بعد. اكتب طلبك نصاً من فضلك 🙏\n" +
          "🎙️ Voice messages aren't enabled yet — please type your request."
      );
      return;
    }
    const { buffer, mime } = await downloadMedia(mediaId);
    const text = await transcribeAudio(buffer, mime);
    console.log(`Concierge 🎙️→ +${from}: "${text}"`);
    if (!text) {
      await sendText(
        from,
        "🤔 لم أتمكّن من فهم الرسالة الصوتية. حاول مرة أخرى أو اكتب طلبك.\n" +
          "🤔 I couldn't understand the voice note — please try again or type."
      );
      return;
    }
    await handleIncomingMessage({ from, text });
  } catch (e) {
    console.error("voice note handling failed:", e.message);
  }
}

// ============================================================
// WhatsApp inbound (Gift Concierge).
//
// GET  /api/whatsapp/webhook   — Meta's one-time verification handshake.
// POST /api/whatsapp/webhook   — inbound messages (customers writing to
//                                 the business number). Must 200 fast;
//                                 processing happens off the request.
// POST /api/whatsapp/simulate  — admin-only dry-run: test the concierge
//                                 brain locally without Meta/tunnel.
//
// To go live: expose this server publicly (deploy or tunnel), then in
// Meta app dashboard → WhatsApp → Configuration set:
//   Callback URL:  https://<your-host>/api/whatsapp/webhook
//   Verify token:  value of WHATSAPP_WEBHOOK_VERIFY_TOKEN
// and subscribe to the "messages" webhook field.
// ============================================================

const VERIFY_TOKEN = () =>
  process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "shoplix-webhook";

// Meta verification handshake
router.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  if (mode === "subscribe" && token === VERIFY_TOKEN()) {
    console.log("WhatsApp webhook verified ✔");
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

// Inbound events
router.post("/webhook", (req, res) => {
  // Ack immediately — Meta retries (and eventually disables) slow webhooks.
  res.sendStatus(200);

  try {
    const entries = req.body?.entry || [];
    for (const entry of entries) {
      for (const change of entry.changes || []) {
        const messages = change.value?.messages || [];
        for (const msg of messages) {
          const from = msg.from; // international digits, e.g. 970599...

          // Voice note / audio → transcribe, then run the brain.
          if (msg.type === "audio" && msg.audio?.id) {
            console.log(`Concierge ← +${from}: [voice note]`);
            setImmediate(() => handleVoiceNote(from, msg.audio.id));
            continue;
          }

          // Typed text.
          if (msg.type === "text" && msg.text?.body) {
            const text = msg.text.body;
            setImmediate(async () => {
              try {
                // A signup verification code takes priority over the concierge.
                const isVerification = await tryMatchVerification(from, text);
                if (isVerification) {
                  await sendText(
                    from,
                    "✅ تم التحقق من رقمك بنجاح! يمكنك العودة إلى المتجر الآن.\n" +
                      "✅ Your number is verified! You can return to the store now."
                  ).catch(() => {});
                  return;
                }
                console.log(`Concierge ← +${from}: ${text}`);
                await handleIncomingMessage({ from, text });
              } catch (e) {
                console.error("inbound handling failed:", e.message);
              }
            });
          }
        }
      }
    }
  } catch (e) {
    console.error("webhook parse error:", e.message);
  }
});

// Admin dry-run simulator: { text, from? } → the reply the customer would get
router.post("/simulate", protect, admin, async (req, res) => {
  try {
    const { text, from } = req.body || {};
    if (!text) return res.status(400).json({ error: "text required" });
    const result = await handleIncomingMessage({ from, text, dryRun: true });
    res.json({ success: true, ...result });
  } catch (e) {
    console.error("simulate error:", e);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;

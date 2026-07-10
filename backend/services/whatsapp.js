// WhatsApp delivery for auth codes.
//
// Production path: the official Meta WhatsApp Business Cloud API. Configure
// WHATSAPP_ACCESS_TOKEN + WHATSAPP_PHONE_NUMBER_ID (see .env) plus an approved
// "authentication" template; the code goes out as a template message with a
// copy-code button.
//
// Dev path: when the Cloud API is not configured, nothing is sent — the code
// is printed to this console and surfaced to the controller so local signup
// can be tested end-to-end without a Meta account.

const GRAPH_VERSION = process.env.WHATSAPP_GRAPH_VERSION || 'v22.0'

function isConfigured() {
  return !!(
    process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID
  )
}

async function postMessage(payload) {
  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messaging_product: 'whatsapp', ...payload }),
  })
  const detail = await res.text().catch(() => '')
  return { ok: res.ok, status: res.status, detail }
}

async function sendAuthCode(toNumber, code) {
  if (!isConfigured()) {
    console.log('\n──────────────── WhatsApp DEV MODE ────────────────')
    console.log(`  Auth code for +${toNumber}:  ${code}`)
    console.log('  (set WHATSAPP_ACCESS_TOKEN + WHATSAPP_PHONE_NUMBER_ID')
    console.log('   in backend/.env to send real WhatsApp messages)')
    console.log('────────────────────────────────────────────────────\n')
    return { dev: true }
  }

  // Preferred: approved AUTHENTICATION template (required for production —
  // works once a real number is connected and the template is approved).
  const template = await postMessage({
    to: toNumber,
    type: 'template',
    template: {
      name: process.env.WHATSAPP_TEMPLATE_NAME || 'auth_code',
      language: { code: process.env.WHATSAPP_TEMPLATE_LANG || 'en' },
      components: [
        { type: 'body', parameters: [{ type: 'text', text: code }] },
        // Authentication templates ship with a copy-code button that must
        // receive the same code as a URL-button parameter.
        {
          type: 'button',
          sub_type: 'url',
          index: '0',
          parameters: [{ type: 'text', text: code }],
        },
      ],
    },
  })
  if (template.ok) return { dev: false }

  // Fallback: free-form text. Meta only delivers it inside the 24h customer
  // service window (the recipient must have messaged the business number
  // first). This is the only path on TEST numbers, which cannot create
  // authentication templates at all.
  console.warn('WhatsApp template send failed — trying plain text.', template.status, template.detail)
  const text = await postMessage({
    to: toNumber,
    type: 'text',
    text: { body: `Shoplix: رمز التحقق الخاص بك | Your verification code:\n\n*${code}*\n\nصالح لمدة 5 دقائق / valid for 5 minutes.` },
  })
  if (text.ok) return { dev: false }

  console.error('WhatsApp text send failed too.', text.status, text.detail)
  console.error('HINT: on a test number the recipient must first send any WhatsApp message TO the business number to open the 24h session window.')
  throw new Error('WhatsApp send failed')
}

// Plain text message (concierge replies). Inbound customer messages open the
// 24h service window, so free-form replies are always deliverable — and free.
async function sendText(toNumber, body) {
  if (!isConfigured()) {
    console.log('\n──────────── WhatsApp DEV MODE (text) ────────────')
    console.log(`  To +${toNumber}:\n${body}`)
    console.log('───────────────────────────────────────────────────\n')
    return { dev: true }
  }
  const res = await postMessage({
    to: toNumber,
    type: 'text',
    text: { body, preview_url: true },
  })
  if (!res.ok) {
    console.error('WhatsApp sendText failed', res.status, res.detail)
    throw new Error('WhatsApp sendText failed')
  }
  return { dev: false }
}

// Download an inbound media object (e.g. a voice note) by its media id.
// Two steps per Meta's API: resolve the id → a short-lived signed URL, then
// fetch the bytes with the access token. Returns { buffer, mime }.
async function downloadMedia(mediaId) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN
  if (!token) throw new Error('WhatsApp not configured')

  const metaRes = await fetch(
    `https://graph.facebook.com/${GRAPH_VERSION}/${mediaId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  if (!metaRes.ok) {
    throw new Error(`media lookup failed ${metaRes.status}`)
  }
  const { url, mime_type } = await metaRes.json()

  // The media URL also requires the bearer token.
  const binRes = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  if (!binRes.ok) throw new Error(`media download failed ${binRes.status}`)
  const buffer = Buffer.from(await binRes.arrayBuffer())
  return { buffer, mime: mime_type || 'audio/ogg' }
}

module.exports = { sendAuthCode, sendText, isConfigured, downloadMedia }

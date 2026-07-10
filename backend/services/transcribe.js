// Speech-to-text for WhatsApp voice notes.
//
// Uses Groq's hosted Whisper (OpenAI's model, fast + a generous free tier).
// Graceful-optional: with no GROQ_API_KEY the caller falls back to asking the
// customer to type. Whisper auto-detects Arabic / Hebrew / English, so voice
// notes in any of the three work with no language hint.

const GROQ_URL = 'https://api.groq.com/openai/v1/audio/transcriptions'
const MODEL = process.env.GROQ_WHISPER_MODEL || 'whisper-large-v3-turbo'

function isTranscriptionConfigured() {
  return !!process.env.GROQ_API_KEY
}

// buffer: audio bytes (WhatsApp voice notes are OGG/Opus). Returns the
// transcript string, or "" when transcription is unavailable/failed.
async function transcribeAudio(buffer, mime = 'audio/ogg') {
  if (!isTranscriptionConfigured()) return ''

  const ext = mime.includes('mp4') || mime.includes('m4a')
    ? 'm4a'
    : mime.includes('mpeg') || mime.includes('mp3')
    ? 'mp3'
    : mime.includes('wav')
    ? 'wav'
    : 'ogg'

  const form = new FormData()
  form.append('file', new Blob([buffer], { type: mime }), `voice.${ext}`)
  form.append('model', MODEL)
  // response_format text → the body IS the transcript (no JSON parsing)
  form.append('response_format', 'text')

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
    body: form,
    signal: AbortSignal.timeout(20000),
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    console.error('Groq transcription failed', res.status, detail)
    return ''
  }
  return (await res.text()).trim()
}

module.exports = { transcribeAudio, isTranscriptionConfigured }

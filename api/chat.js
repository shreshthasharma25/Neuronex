/**
 * api/chat.js — Vercel Serverless Function
 *
 * Handles POST /api/chat in production (deployed on Vercel).
 * Uses the Gemini REST API directly via native fetch — no SDK import needed.
 * Native fetch is available in Node.js 18+, which is the Vercel default.
 *
 * SECURITY: GEMINI_API_KEY is read from process.env only (Vercel env vars).
 * It is NEVER sent to the browser or client code.
 */

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

// Models in preference order — verified working with this API key tier.
// gemini-3.6-flash is the current recommended model per Google's own 404 messages.
const CANDIDATE_MODELS = [
  'gemini-3.6-flash',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Vercel auto-parses JSON bodies; req.body is already an object.
    const { message, patientContext, conversationHistory } = req.body || {};

    if (!message || !String(message).trim()) {
      res.status(400).json({ status: 'error', available: false, message: 'No message provided.' });
      return;
    }

    // ── Read API key from Vercel environment variable (server-side only) ────
    const apiKey = (process.env.GEMINI_API_KEY || '').trim().replace(/^["']|["']$/g, '');

    if (!apiKey) {
      console.error('[api/chat] GEMINI_API_KEY is not set in environment variables.');
      res.status(200).json({
        status: 'no_key',
        available: false,
        message: 'AI service is not configured on the server.'
      });
      return;
    }

    const targetLang = patientContext?.patientProfile?.language || 'English';
    const patientName =
      patientContext?.patientProfile?.preferredName ||
      patientContext?.patientProfile?.fullName ||
      'the patient';

    // ── System prompt ────────────────────────────────────────────────────────
    const systemInstructionText = `You are a supportive, calm, patient, and warm AI memory companion for an elderly person named ${patientName}.

IMPORTANT BEHAVIOR RULES:
1. When answering casual check-ins or quick questions, speak simply, clearly, and warmly in short sentences.
2. If the user explicitly asks for an explanation, story, or a specific length (e.g. "Explain in 3 paragraphs" or "Tell me more about..."), provide a thorough, complete, and well-structured answer matching their request without cutting it short.
3. Never shame the patient for forgetting anything.
4. Be reassuring, polite, and gentle.
5. For general knowledge questions (e.g. locations, history, science, daily topics), answer accurately, calmly, and helpfully.
6. For personal questions about the patient's life, family, home, medicines, routine, memories, or tasks: ONLY use the information provided in the STORED PATIENT CONTEXT below.
7. NEVER invent, assume, or hallucinate family members, relatives, dates, anniversaries, medicines, dosages, appointments, locations, or personal facts.
8. If the patient asks for personal information that is NOT in the stored Patient Context, DO NOT GUESS. Gently say: "I don't have that information yet. You can ask your family member or caregiver to add it." (translated into ${targetLang}).
9. CRITICAL MEDICAL SAFETY RULE: You are an assistant, NOT a doctor. You must NEVER diagnose dementia, Alzheimer's, or any medical condition. NEVER say "You have worsening dementia", "You need a doctor", or "Your brain health score is bad".
10. LANGUAGE RULE: The patient's chosen language is "${targetLang}". Compose your reply in ${targetLang} unless the user explicitly speaks/asks in another language.

STORED PATIENT CONTEXT:
${JSON.stringify(patientContext, null, 2)}`;

    // ── Build contents array (always structured [{role, parts}] format) ──────
    const contents = [];
    if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      for (const turn of conversationHistory.slice(-6)) {
        if (turn.sender === 'user' && turn.text) {
          contents.push({ role: 'user', parts: [{ text: turn.text }] });
        } else if (turn.sender === 'assistant' && turn.text && turn.id !== 'welcome') {
          contents.push({ role: 'model', parts: [{ text: turn.text }] });
        }
      }
    }
    contents.push({ role: 'user', parts: [{ text: String(message).trim() }] });

    // ── Call Gemini REST API directly via native fetch ───────────────────────
    // No SDK import — avoids all bundling issues in Vercel's serverless environment.
    // Native fetch is available in Node.js 18+.
    let replyText = '';
    let apiSuccess = false;
    let lastErrMsg = '';

    for (const modelName of CANDIDATE_MODELS) {
      try {
        const url = `${GEMINI_API_BASE}/${modelName}:generateContent?key=${apiKey}`;

        const geminiBody = {
          system_instruction: {
            parts: [{ text: systemInstructionText }]
          },
          contents,
          generationConfig: {
            maxOutputTokens: 2048,
            temperature: 0.4
          }
        };

        const geminiRes = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(geminiBody)
        });

        const geminiData = await geminiRes.json();

        if (!geminiRes.ok) {
          lastErrMsg = `${modelName}: HTTP ${geminiRes.status} — ${geminiData.error?.message || 'unknown error'}`;
          console.warn('[api/chat]', lastErrMsg);
          continue;
        }

        // Extract text from Gemini response structure
        const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (text) {
          replyText = text;
          apiSuccess = true;
          break;
        } else {
          const reason = geminiData.candidates?.[0]?.finishReason || 'no text';
          lastErrMsg = `${modelName}: response OK but no text (finishReason=${reason})`;
          console.warn('[api/chat]', lastErrMsg);
        }
      } catch (fetchErr) {
        lastErrMsg = `${modelName}: fetch error — ${fetchErr.message}`;
        console.warn('[api/chat]', lastErrMsg);
      }
    }

    if (apiSuccess && replyText) {
      res.status(200).json({
        status: 'success',
        available: true,
        reply: replyText
      });
    } else {
      console.error('[api/chat] All models failed. Last error:', lastErrMsg);
      res.status(200).json({
        status: 'api_unavailable',
        available: false,
        message: 'The AI assistant is temporarily unavailable. Please try again.'
      });
    }
  } catch (err) {
    console.error('[api/chat] Unhandled handler error:', err);
    res.status(500).json({
      status: 'server_error',
      available: false,
      message: 'The AI assistant is temporarily unavailable. Please try again.'
    });
  }
}

/**
 * api/chat.js — Vercel Serverless Function
 *
 * Handles POST /api/chat in production (deployed on Vercel).
 * Uses the Gemini REST API directly via native fetch — no SDK import needed.
 * Native fetch is available in Node.js 18+, which is the Vercel default.
 *
 * SECURITY: GEMINI_API_KEY is read from process.env only (Vercel env vars).
 * It is NEVER sent to the browser or client code. Make sure this variable
 * is set as a plain server-side env var in Vercel — NOT prefixed with
 * VITE_ (Vite bundles VITE_-prefixed vars into client-side JS, which would
 * leak the key to the browser).
 */

// Give the function room to try a couple of models with real timeouts
// without Vercel killing it mid-request. Requires a Pro plan for >10s;
// on Hobby this is capped at 10s regardless of what's set here.
export const config = {
  maxDuration: 30,
};

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

// Models in preference order.
// NOTE (Sep 2026): gemini-2.0-flash was shut down by Google on June 1, 2026 —
// do not add it back. gemini-2.5-flash is past its own deprecation window and
// has been reported disappearing without notice, so it's kept as a secondary
// fallback only, not relied on. Re-check https://ai.google.dev/gemini-api/docs/deprecations
// periodically and update this list — Google ships new shutdowns often.
const CANDIDATE_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-2.5-flash-lite',
];

// How long to wait for a single Gemini attempt before giving up on it and
// trying the next model. Keep the sum of all attempts comfortably under
// maxDuration above.
const PER_ATTEMPT_TIMEOUT_MS = 9000;

// Transient errors worth a single quick retry on the *same* model before
// moving on (rate limit / server hiccup), vs. errors where retrying the
// same model is pointless (bad request, not found, safety block).
const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);

// Restrict this in production once you know your real frontend origin(s),
// e.g. via an ALLOWED_ORIGIN env var. '*' is fine while the frontend and
// this function are served from the same Vercel deployment/domain.
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    res.status(405).json({ status: 'error', available: false, message: 'Method not allowed' });
    return;
  }

  try {
    const { message, patientContext, conversationHistory } = req.body || {};

    if (!message || !String(message).trim()) {
      res.status(400).json({ status: 'error', available: false, message: 'No message provided.' });
      return;
    }

    // ── Read API key from Vercel environment variable (server-side only) ────
    const rawApiKey = process.env.GEMINI_API_KEY || '';
    const apiKey = rawApiKey.trim().replace(/^["']|["']$/g, '');

    if (!apiKey) {
      console.error('[api/chat] GEMINI_API_KEY is not set in this environment.');
      res.status(200).json({
        status: 'no_key',
        available: false,
        message: 'AI service is not configured on the server.',
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
${JSON.stringify(patientContext ?? {}, null, 2)}`;

    // ── Build contents array (always structured [{role, parts}] format) ──────
    const contents = [];
    if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      for (const turn of conversationHistory.slice(-6)) {
        if (turn?.sender === 'user' && turn.text) {
          contents.push({ role: 'user', parts: [{ text: turn.text }] });
        } else if (turn?.sender === 'assistant' && turn.text && turn.id !== 'welcome') {
          contents.push({ role: 'model', parts: [{ text: turn.text }] });
        }
      }
    }
    contents.push({ role: 'user', parts: [{ text: String(message).trim() }] });

    const geminiBody = {
      system_instruction: { parts: [{ text: systemInstructionText }] },
      contents,
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.4,
      },
    };

    // ── Call Gemini REST API directly via native fetch ───────────────────────
    let replyText = '';
    let apiSuccess = false;
    let lastErrMsg = '';
    let sawSafetyBlock = false;
    let sawQuotaExceeded = false;

    modelLoop: for (const modelName of CANDIDATE_MODELS) {
      const url = `${GEMINI_API_BASE}/${modelName}:generateContent?key=${apiKey}`;

      // One quick retry for transient errors (rate limit / server hiccup)
      // before giving up on this model and moving to the next one.
      for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
          const geminiRes = await fetchWithTimeout(
            url,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(geminiBody),
            },
            PER_ATTEMPT_TIMEOUT_MS
          );

          let geminiData;
          try {
            geminiData = await geminiRes.json();
          } catch {
            geminiData = {};
          }

          if (!geminiRes.ok) {
            lastErrMsg = `${modelName}: HTTP ${geminiRes.status} — ${geminiData.error?.message || 'unknown error'}`;
            console.warn('[api/chat]', lastErrMsg);

            if (geminiRes.status === 429) sawQuotaExceeded = true;

            if (RETRYABLE_STATUS_CODES.has(geminiRes.status) && attempt === 0) {
              await sleep(500);
              continue; // retry same model once
            }
            break; // move on to next model
          }

          const candidate = geminiData.candidates?.[0];
          const text = candidate?.content?.parts?.[0]?.text?.trim();

          if (text) {
            replyText = text;
            apiSuccess = true;
            break modelLoop;
          }

          const reason = candidate?.finishReason || 'no text';
          lastErrMsg = `${modelName}: response OK but no text (finishReason=${reason})`;
          console.warn('[api/chat]', lastErrMsg);
          if (reason === 'SAFETY' || reason === 'BLOCKLIST' || reason === 'PROHIBITED_CONTENT') {
            sawSafetyBlock = true;
          }
          break; // no point retrying the same model for a content/safety issue
        } catch (fetchErr) {
          const isTimeout = fetchErr?.name === 'AbortError';
          lastErrMsg = `${modelName}: ${isTimeout ? 'timed out' : `fetch error — ${fetchErr.message}`}`;
          console.warn('[api/chat]', lastErrMsg);
          if (attempt === 0) {
            await sleep(500);
            continue; // retry same model once on timeout/network error
          }
          break;
        }
      }
    }

    if (apiSuccess && replyText) {
      res.status(200).json({
        status: 'success',
        available: true,
        reply: replyText,
      });
      return;
    }

    console.error('[api/chat] All models failed. Last error:', lastErrMsg);

    if (sawSafetyBlock) {
      res.status(200).json({
        status: 'safety_blocked',
        available: false,
        message: "I'm not able to answer that one. Let's try something else.",
      });
      return;
    }

    if (sawQuotaExceeded) {
      res.status(200).json({
        status: 'quota_exceeded',
        available: false,
        message: 'The AI assistant is very busy right now. Please try again in a moment.',
      });
      return;
    }

    res.status(200).json({
      status: 'api_unavailable',
      available: false,
      message: 'The AI assistant is temporarily unavailable. Please try again.',
    });
  } catch (err) {
    console.error('[api/chat] Unhandled handler error:', err);
    res.status(500).json({
      status: 'server_error',
      available: false,
      message: 'The AI assistant is temporarily unavailable. Please try again.',
    });
  }
}
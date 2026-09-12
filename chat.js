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

// Formats "now" in the patient's own timezone when we have one, so the
// model can answer orientation questions ("what day is it?") correctly
// instead of guessing from training data. Falls back to UTC.
function getCurrentDateTimeString(timeZone) {
  try {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZone: timeZone || 'UTC',
      timeZoneName: 'short',
    }).format(new Date());
  } catch {
    // Invalid/unrecognized timeZone string — fall back safely.
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'UTC',
      timeZoneName: 'short',
    }).format(new Date());
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
    const patientTimeZone = patientContext?.patientProfile?.timeZone || null;
    const currentDateTime = getCurrentDateTimeString(patientTimeZone);

    // Caregiver-configurable setting for how to handle questions about a
    // deceased loved one. This is intentionally NOT hardcoded to one
    // approach — care guidance is genuinely split between always telling
    // the truth vs. gentle redirection (sometimes called "validation
    // therapy") to avoid repeated grief. Default is the gentler redirect,
    // but this should be a deliberate choice made with a caregiver or
    // clinician per patient, set via patientContext.carePreferences.
    const griefApproach =
      patientContext?.carePreferences?.deceasedLovedOnesApproach === 'truth'
        ? 'truth'
        : 'redirect';

    // ── System prompt ────────────────────────────────────────────────────────
    const systemInstructionText = `You are a supportive, calm, patient, and warm AI memory companion for an elderly person named ${patientName}. Many people you talk with have dementia or memory difficulties — every rule below is written with that in mind.

CURRENT DATE AND TIME: ${currentDateTime}. Use this directly to answer orientation questions like "what day is it," "what's today's date," or "what time is it" — never guess or rely on your own training data for this.

IMPORTANT BEHAVIOR RULES:

Tone and style:
1. For casual check-ins or quick questions, speak simply, clearly, and warmly in short sentences.
2. Use one clear idea per sentence. Avoid compound or nested clauses, and avoid vague pronouns like "it," "that," or "he/she" when the noun could be repeated instead — clarity matters more than variety here.
3. If the user explicitly asks for an explanation, story, or a specific length (e.g. "Explain in 3 paragraphs" or "Tell me more about..."), provide a thorough, complete, and well-structured answer matching their request without cutting it short.
4. Never shame the patient for forgetting anything, and never point out that they asked something before. If a question is repeated — even many times in the same conversation — answer it fresh, with the same warmth and patience as the first time. Do not say things like "you already asked me this" or "as I mentioned."
5. Do not quiz, test, or prompt the patient to recall names, dates, or past conversation ("Do you remember who this is?", "What did we talk about earlier?") unless the patient themselves asks to play a memory game. Unsolicited recall questions can feel like being tested and cause shame or anxiety.

Answering general vs. personal questions:
6. For general knowledge questions (locations, history, science, daily topics, hobbies, casual conversation, light jokes) not about the patient's own life, answer accurately, calmly, and helpfully — engage naturally, like a knowledgeable friend. Keep these answers simple and plain by default too (see rule 2) unless the patient asks for more depth.
7. Do not give specific medical, legal, or financial advice (e.g. what medication dose to take, whether to sign a document, what to invest in). General education is fine (e.g. "what is a will"), but defer situational decisions to the patient's family or a professional.
8. If a request sounds like it could be a scam (e.g. "someone called asking for my bank details/OTP/password"), gently advise caution and suggest checking with a family member before acting or sharing anything — do not just answer neutrally.
9. If the patient asks for help moving money, making a payment, or a bank transfer of any kind — even if it doesn't sound like a scam — do not walk them through it directly. Gently suggest involving a family member or caregiver first.
10. Do not give directions, transit routes, addresses, or specific travel instructions for the patient to go somewhere alone (e.g. "how do I get to my old house," "which bus goes to the market"), even if you know the answer. Gently suggest they check with a caregiver or family member before heading out, without being alarming about it.
11. Avoid sarcasm, irony, or jokes that rely on saying the opposite of what you mean — say what you mean plainly and warmly instead.
12. For personal questions about the patient's life, family, home, medicines, routine, memories, or tasks: ONLY use the information provided in the STORED PATIENT CONTEXT below.
13. NEVER invent, assume, or hallucinate family members, relatives, dates, anniversaries, medicines, dosages, appointments, locations, or personal facts.
14. If the patient asks for personal information that is NOT in the stored Patient Context, DO NOT GUESS. Gently say: "I don't have that information yet. You can ask your family member or caregiver to add it." (translated into ${targetLang}).
15. If the patient states something as fact that seems to accuse a real person in their Patient Context of wrongdoing (e.g. taking or hiding something) and this is not documented anywhere in the Patient Context, do not agree with or reinforce the accusation. Respond gently and neutrally, and avoid confirming claims about other people that you cannot verify.
16. For questions about current events, today's news, or anything time-sensitive (e.g. who currently holds a position, current weather, ongoing events), do not answer with confident specifics from memory — you have no live information. Acknowledge you're not sure of the latest details rather than guessing.
17. For distressing or upsetting general topics (tragedies, disasters, frightening news), respond gently and briefly rather than in graphic detail.

Emotional and safety situations:
18. If the patient expresses confusion about where they are, wanting to "go home" while already home, or similar disorientation, do not bluntly contradict them or argue. Respond gently, validate the feeling behind what they said, and softly redirect toward something reassuring and familiar (e.g. a comforting routine, a favorite topic from their context) rather than repeatedly insisting on a fact that may cause distress.
19. ${
      griefApproach === 'truth'
        ? 'If the patient asks about a loved one who has passed away and this is recorded in the Patient Context, answer honestly and gently, with warmth and space for their feelings.'
        : 'If the patient asks about a loved one who has passed away, avoid bluntly restating the loss. Respond warmly and redirect gently toward a comforting memory or topic instead of repeating the fact of their death, unless the caregiver has explicitly configured this patient for direct honesty.'
    } This setting is caregiver-configurable per patient (patientContext.carePreferences.deceasedLovedOnesApproach) and should be set in consultation with the family or a care professional, not left to default for every patient.
20. If the patient describes something that sounds like a medical emergency or immediate safety risk (a fall, chest pain, severe pain, difficulty breathing, being lost outside, or similar), respond seriously and clearly: tell them to contact a caregiver or emergency services right away, and keep the message simple and direct rather than conversational. Do not attempt to diagnose or reassure them that it's nothing.
21. You are an assistant, NOT a doctor. NEVER diagnose dementia, Alzheimer's, or any medical condition, and NEVER say things like "you have worsening dementia," "you need a doctor," or "your brain health score is bad."
22. You are a helpful companion, not a replacement for human connection. Do not encourage the patient to rely on you instead of family, friends, or caregivers, and do not describe yourself as their only friend or the one who understands them best. If the patient expresses loneliness or isolation, respond warmly but gently encourage reaching out to a real person in their life.

Language:
23. The patient's chosen language is "${targetLang}". Compose your reply in ${targetLang} unless the user explicitly speaks/asks in another language.

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

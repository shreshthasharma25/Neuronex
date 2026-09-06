/**
 * api/chat.js — Vercel Serverless Function
 *
 * Handles POST /api/chat in production (deployed on Vercel).
 * This is the production counterpart of the Vite dev-server middleware
 * defined in vite.config.js (which only works locally during `npm run dev`).
 *
 * Vercel's file-based routing automatically maps:
 *   POST https://your-domain.vercel.app/api/chat  →  this file
 *
 * SECURITY: GEMINI_API_KEY is read from process.env (Vercel env vars).
 * It is NEVER sent to the browser / client.
 */

// Static top-level import — required for Vercel's bundler to include the package.
// Dynamic `await import(...)` inside the function body is NOT reliably bundled by Vercel.
import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { message, patientContext, conversationHistory } = req.body || {};

    if (!message || !String(message).trim()) {
      res.status(400).json({ status: 'error', available: false, message: 'No message provided.' });
      return;
    }

    // ── Resolve API key from Vercel environment variables ──────────────────
    const apiKey = (process.env.GEMINI_API_KEY || '').trim().replace(/^["']|["']$/g, '');

    if (!apiKey) {
      res.status(200).json({
        status: 'no_key',
        available: false,
        message: 'No GEMINI_API_KEY configured in server environment.'
      });
      return;
    }

    const targetLang = patientContext?.patientProfile?.language || 'English';
    const patientName =
      patientContext?.patientProfile?.preferredName ||
      patientContext?.patientProfile?.fullName ||
      'the patient';

    // ── Build system prompt ────────────────────────────────────────────────
    const systemInstruction = `You are a supportive, calm, patient, and warm AI memory companion for an elderly person named ${patientName}.

IMPORTANT BEHAVIOR RULES:
1. When answering casual check-ins or quick questions, speak simply, clearly, and warmly in short sentences.
2. If the user explicitly asks for an explanation, story, or a specific length (e.g. "Explain in 3 paragraphs" or "Tell me more about..."), provide a thorough, complete, and well-structured answer matching their request without cutting it short.
3. Never shame the patient for forgetting anything.
4. Be reassuring, polite, and gentle.
5. For general knowledge questions (e.g. locations, history, science, daily topics), answer accurately, calmly, and helpfully.
6. For personal questions about the patient's life, family, home, medicines, routine, memories, or tasks: ONLY use the information provided in the STORED PATIENT CONTEXT below.
7. NEVER invent, assume, or hallucinate family members, relatives, dates, anniversaries, medicines, dosages, appointments, locations, or personal facts.
8. If the patient asks for personal information that is NOT in the stored Patient Context, DO NOT GUESS. Gently say: "I don't have that information yet. You can ask your family member or caregiver to add it." (translated into ${targetLang}).
9. CRITICAL MEDICAL SAFETY RULE: You are an assistant, NOT a doctor. You must NEVER diagnose dementia, Alzheimer's, or any medical condition.
10. LANGUAGE RULE: The patient's chosen language is "${targetLang}". Compose your reply in ${targetLang} unless the user explicitly speaks/asks in another language.

STORED PATIENT CONTEXT:
${JSON.stringify(patientContext, null, 2)}`;

    // ── Build contents array (always structured — never pass raw string) ───
    // @google/genai v2.x requires contents to be [{role, parts}] format.
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

    // ── Call Gemini via @google/genai SDK (static import, correct params) ──
    const ai = new GoogleGenAI({ apiKey });

    // Candidate models in preference order (valid Gemini model IDs)
    const candidateModels = [
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-1.5-flash-latest',
      'gemini-2.5-flash'
    ];

    let replyText = '';
    let apiSuccess = false;
    let lastErr = null;

    for (const modelName of candidateModels) {
      try {
        const sdkResponse = await ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction,
            maxOutputTokens: 2048,
            temperature: 0.4
          }
        });

        const text = sdkResponse.text?.trim();
        if (text) {
          replyText = text;
          apiSuccess = true;
          break;
        }
      } catch (modelErr) {
        lastErr = modelErr;
        console.warn(`[api/chat] ${modelName} failed:`, modelErr?.message || modelErr);
      }
    }

    if (apiSuccess && replyText) {
      res.status(200).json({
        status: 'success',
        available: true,
        reply: replyText
      });
    } else {
      console.error('[api/chat] All models failed. Last error:', lastErr?.message || lastErr);
      res.status(200).json({
        status: 'api_unavailable',
        available: false,
        message: 'The AI assistant is temporarily unavailable. Please try again.'
      });
    }
  } catch (err) {
    console.error('[api/chat] Handler error:', err);
    res.status(500).json({
      status: 'server_error',
      available: false,
      message: 'The AI assistant is temporarily unavailable. Please try again.'
    });
  }
}

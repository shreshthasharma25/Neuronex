import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

function aiChatApiPlugin(env) {
  return {
    name: 'ai-chat-api',
    configureServer(server) {
      server.middlewares.use('/api/chat', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
          try {
            const { message, patientContext, conversationHistory } = JSON.parse(body || '{}');

            // 1. Resolve GEMINI_API_KEY server-side only (never exposed to client)
            let fileEnvKey = '';
            try {
              const fs = await import('fs');
              if (fs.existsSync('.env')) {
                const envContent = fs.readFileSync('.env', 'utf8');
                const match = envContent.match(/^.*GEMINI.*API_KEY\s*=\s*(["']?)(.*?)\1\s*$/im);
                if (match && match[2] && match[2].trim()) {
                  fileEnvKey = match[2].trim();
                }
              }
            } catch (e) {}

            let rawApiKey = fileEnvKey;
            if (!rawApiKey) {
              for (const [key, value] of Object.entries(process.env)) {
                if (key.toUpperCase().includes('GEMINI') && key.toUpperCase().includes('API_KEY')) {
                  rawApiKey = value;
                  break;
                }
              }
            }
            if (!rawApiKey && env) {
              for (const [key, value] of Object.entries(env)) {
                if (key.toUpperCase().includes('GEMINI') && key.toUpperCase().includes('API_KEY')) {
                  rawApiKey = value;
                  break;
                }
              }
            }

            const apiKey = String(rawApiKey || '').trim().replace(/^["']|["']$/g, '');

            if (!apiKey) {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                status: 'no_key',
                available: false,
                message: 'No GEMINI_API_KEY configured in server environment.'
              }));
              return;
            }

            const targetLang = patientContext?.patientProfile?.language || 'English';

            // Construct strictly grounded, dementia-safe system instructions
            const systemPrompt = `You are a supportive, calm, patient, and warm AI memory companion for an elderly person named ${patientContext?.patientProfile?.preferredName || patientContext?.patientProfile?.fullName || 'the patient'}.

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

            // Build contents payload including previous conversation history if provided
            let contentsPayload = [];
            if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
              for (const turn of conversationHistory.slice(-6)) {
                if (turn.sender === 'user' && turn.text) {
                  contentsPayload.push({ role: 'user', parts: [{ text: turn.text }] });
                } else if (turn.sender === 'assistant' && turn.text && turn.id !== 'welcome') {
                  contentsPayload.push({ role: 'model', parts: [{ text: turn.text }] });
                }
              }
            }
            // Add current turn
            contentsPayload.push({ role: 'user', parts: [{ text: message }] });

            // Call Gemini REST API directly — no SDK, same approach as api/chat.js in production.
            // Native fetch is available in Node.js 18+.
            const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
            const candidateModels = ['gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-2.0-flash'];
            let replyText = '';
            let apiSuccess = false;
            let lastErrMsg = '';

            for (const modelName of candidateModels) {
              try {
                const url = `${GEMINI_BASE}/${modelName}:generateContent?key=${apiKey}`;
                const geminiBody = {
                  system_instruction: { parts: [{ text: systemPrompt }] },
                  contents: contentsPayload,
                  generationConfig: { maxOutputTokens: 2048, temperature: 0.4 }
                };
                const geminiRes = await fetch(url, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(geminiBody)
                });
                const geminiData = await geminiRes.json();
                if (!geminiRes.ok) {
                  lastErrMsg = `${modelName}: HTTP ${geminiRes.status} — ${geminiData.error?.message || ''}`;
                  console.warn('[dev/api/chat]', lastErrMsg);
                  continue;
                }
                const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
                if (text) {
                  replyText = text;
                  apiSuccess = true;
                  break;
                } else {
                  lastErrMsg = `${modelName}: no text in response`;
                  console.warn('[dev/api/chat]', lastErrMsg);
                }
              } catch (fetchErr) {
                lastErrMsg = `${modelName}: ${fetchErr.message}`;
                console.warn('[dev/api/chat]', lastErrMsg);
              }
            }

            res.setHeader('Content-Type', 'application/json');
            if (apiSuccess && replyText) {
              res.end(JSON.stringify({ status: 'success', available: true, reply: replyText }));
            } else {
              console.error('[dev/api/chat] All models failed:', lastErrMsg);
              res.end(JSON.stringify({
                status: 'api_unavailable',
                available: false,
                message: 'The AI assistant is temporarily unavailable. Please try again.'
              }));
            }
          } catch (err) {
            console.error('Error processing /api/chat:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              status: 'server_error',
              available: false,
              message: 'The AI assistant is temporarily unavailable. Please try again.'
            }));
          }
        });
      });
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), aiChatApiPlugin(env)],
    server: {
      port: 3000,
      open: false
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // Core React runtime
            'vendor-react': ['react', 'react-dom'],
            // Supabase client
            'vendor-supabase': ['@supabase/supabase-js'],
            // Google GenAI SDK
            'vendor-genai': ['@google/genai'],
            // Lucide icons (large package)
            'vendor-lucide': ['lucide-react'],
            // All brain-exercise game components
            'games': [
              './src/components/games/MemoryTwin',
              './src/components/games/MemoryBasket',
              './src/components/games/FamilyMemory',
              './src/components/games/PictureMemory',
              './src/components/games/PatternMemory',
              './src/components/games/DailyRoutine',
              './src/components/games/OddOneOut',
              './src/components/games/GameResult'
            ]
          }
        }
      }
    }
  };
});

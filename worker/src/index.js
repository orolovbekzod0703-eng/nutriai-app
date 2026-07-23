/* ═══════════════════════════════════════════════════════════
   NutriAI proksi — Cloudflare Worker
   • Firebase ID token'ni tekshiradi (faqat kirgan foydalanuvchi)
   • Har foydalanuvchiga kunlik AI limiti qo'yadi (KV)
   • Cloudflare Workers AI (bepul) orqali tahlil qiladi
   ═══════════════════════════════════════════════════════════ */

const DAILY_LIMIT = 40;
const VISION_MODEL = "@cf/llava-hf/llava-1.5-7b-hf";           // rasmni tavsiflaydi
const TEXT_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast"; // JSON + kaloriya hisoblaydi

export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN || "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
      "Vary": "Origin",
    };
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (request.method !== "POST") return json({ error: { message: "Method not allowed" } }, 405, cors);

    // 1) Firebase ID token
    const authH = request.headers.get("Authorization") || "";
    const token = authH.startsWith("Bearer ") ? authH.slice(7) : "";
    if (!token) return json({ error: { message: "Avval hisobingizga kiring" } }, 401, cors);

    let uid;
    try {
      const claims = await verifyFirebaseToken(token, env.FIREBASE_PROJECT_ID);
      uid = claims.sub;
    } catch (e) {
      return json({ error: { message: "Token noto'g'ri: " + e.message } }, 401, cors);
    }

    // 2) Kunlik limit (KV)
    if (env.RL) {
      const day = new Date().toISOString().slice(0, 10);
      const key = `c:${uid}:${day}`;
      const cur = parseInt((await env.RL.get(key)) || "0", 10);
      if (cur >= DAILY_LIMIT) {
        return json({ error: { message: `Kunlik AI limiti (${DAILY_LIMIT}) tugadi. Ertaga urinib ko'ring.` } }, 429, cors);
      }
      await env.RL.put(key, String(cur + 1), { expirationTtl: 172800 });
    }

    // 3) So'rov (Gemini "contents" formatida keladi)
    let body;
    try { body = await request.json(); } catch { return json({ error: { message: "Bad JSON" } }, 400, cors); }
    const maxTokens = body?.generationConfig?.maxOutputTokens || 1200;

    try {
      const text = await runAI(env, body.contents || [], maxTokens);
      // Frontend Gemini shaklini kutadi — shu shaklda qaytaramiz
      return json({ candidates: [{ content: { parts: [{ text }] } }] }, 200, cors);
    } catch (e) {
      return json({ error: { message: "AI xatosi: " + (e?.message || "nomalum") } }, 502, cors);
    }
  },
};

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), { status, headers: { ...cors, "Content-Type": "application/json" } });
}

function b64ToBytes(b64) {
  const bin = atob(b64);
  const arr = new Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}

// Workers AI javobi string yoki obyekt bo'lishi mumkin — har doim matnga o'giramiz
function extractText(out) {
  if (out == null) return "";
  if (typeof out === "string") return out;
  const r = out.response;
  if (typeof r === "string") return r;
  if (r && typeof r === "object") return JSON.stringify(r); // tuzilgan JSON → matn
  if (typeof out.description === "string") return out.description;
  return typeof out === "object" ? JSON.stringify(out) : String(out);
}

// ─── Cloudflare Workers AI chaqiruvi ───
async function runAI(env, contents, maxTokens) {
  let imageBytes = null;
  const textChunks = [];
  const messages = [];

  for (const c of contents) {
    const role = c.role === "model" ? "assistant" : "user";
    let msgText = "";
    for (const p of c.parts || []) {
      if (p.text) { textChunks.push(p.text); msgText += p.text + "\n"; }
      else if (p.inline_data?.data && !imageBytes) imageBytes = b64ToBytes(p.inline_data.data);
    }
    if (msgText.trim()) messages.push({ role, content: msgText.trim() });
  }

  const cap = Math.min(maxTokens, 2048);

  if (imageBytes) {
    // 1-bosqich: LLaVA rasmdagi ovqatlarni tavsiflaydi
    let desc = "";
    try {
      const vis = await env.AI.run(VISION_MODEL, {
        image: imageBytes,
        prompt: "List every distinct food and drink item visible in this photo. For each item, estimate the portion size (grams or count). Be specific and concise. If a dish looks like Uzbek/Central Asian cuisine (plov, lagman, manti, somsa, shashlik, etc.), name it.",
        max_tokens: 512,
      });
      desc = extractText(vis);
    } catch { /* rasm tavsifsiz davom etamiz */ }

    // 2-bosqich: kuchli matn modeli JSON + kaloriyani hisoblaydi
    const instruction = textChunks.join("\n\n");
    const out = await env.AI.run(TEXT_MODEL, {
      messages: [{
        role: "user",
        content: `${instruction}\n\nThe photo was analyzed by a vision model. Detected items:\n${desc || "(vision unavailable — infer typical items)"}\n\nNow output ONLY the JSON exactly as specified above. No extra text, no markdown fences.`,
      }],
      max_tokens: cap,
    });
    return extractText(out);
  }

  const out = await env.AI.run(TEXT_MODEL, { messages, max_tokens: cap });
  return extractText(out);
}

// ─── Firebase ID token (RS256 JWT) tekshiruvi ───
let JWKS = null, JWKS_EXP = 0;
async function getKeys() {
  const now = Date.now();
  if (JWKS && now < JWKS_EXP) return JWKS;
  const res = await fetch("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com");
  const data = await res.json();
  JWKS = {};
  for (const k of data.keys) JWKS[k.kid] = k;
  JWKS_EXP = now + 3600_000;
  return JWKS;
}

function b64urlToBytes(s) {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const bin = atob(s);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function verifyFirebaseToken(token, projectId) {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("format");
  const [h, p, sig] = parts;
  const header = JSON.parse(new TextDecoder().decode(b64urlToBytes(h)));
  const payload = JSON.parse(new TextDecoder().decode(b64urlToBytes(p)));

  const keys = await getKeys();
  const jwk = keys[header.kid];
  if (!jwk) throw new Error("kid");
  const key = await crypto.subtle.importKey(
    "jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"],
  );
  const ok = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5", key, b64urlToBytes(sig), new TextEncoder().encode(`${h}.${p}`),
  );
  if (!ok) throw new Error("imzo");

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp < now) throw new Error("muddati o'tgan");
  if (payload.aud !== projectId) throw new Error("aud");
  if (payload.iss !== `https://securetoken.google.com/${projectId}`) throw new Error("iss");
  return payload;
}

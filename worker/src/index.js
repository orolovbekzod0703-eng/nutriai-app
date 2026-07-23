/* ═══════════════════════════════════════════════════════════
   NutriAI proksi — Cloudflare Worker
   • Firebase ID token'ni tekshiradi (faqat kirgan foydalanuvchi)
   • Har foydalanuvchiga kunlik AI limiti qo'yadi (KV)
   • Cloudflare Workers AI (bepul) orqali tahlil qiladi
   ═══════════════════════════════════════════════════════════ */

const DAILY_LIMIT = 40;
const VISION_MODEL = "@cf/meta/llama-3.2-11b-vision-instruct";
const TEXT_MODEL = "@cf/meta/llama-3.1-8b-instruct";

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

  if (imageBytes) {
    const out = await env.AI.run(VISION_MODEL, {
      image: imageBytes,
      prompt: textChunks.join("\n\n"),
      max_tokens: Math.min(maxTokens, 2048),
    });
    return out.response || out.description || "";
  }

  const out = await env.AI.run(TEXT_MODEL, {
    messages,
    max_tokens: Math.min(maxTokens, 2048),
  });
  return out.response || "";
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

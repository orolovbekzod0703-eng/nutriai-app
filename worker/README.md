# NutriAI proksi (Cloudflare Worker)

Sizning Gemini kalitingizni yashirin saqlab, foydalanuvchilarga AI xizmatini beradi.
Bepul, karta kerak emas.

## Deploy qadamlari

Terminalda `worker/` papkasida:

```bash
cd worker
npm install
```

### 1) Cloudflare'ga kirish (bir marta)
```bash
npx wrangler login
```
Brauzer ochiladi → Cloudflare akkauntingiz bilan ruxsat bering (yo'q bo'lsa bepul ochiladi).

### 2) KV ombori yaratish (kunlik limit uchun)
```bash
npx wrangler kv namespace create RL
```
Chiqqan `id = "..."` qiymatini `wrangler.toml` dagi `QO_YING_KV_ID` o'rniga qo'ying.

### 3) Gemini kalitini secret sifatida qo'shish
```bash
npx wrangler secret put GEMINI_API_KEY
```
So'ralganda Gemini kalitingizni (`AIza...`) joylashtiring. **Bu kalit hech qachon kodda ko'rinmaydi.**

### 4) Deploy
```bash
npx wrangler deploy
```
Oxirida `https://nutriai-proxy.<sizning>.workers.dev` ko'rinishidagi **URL** chiqadi.
**Shu URL'ni menga yuboring** — men uni ilovaga ulab, saytni yangilayman.

## Sozlamalar
- `wrangler.toml` → `ALLOWED_ORIGIN` — faqat shu domendan so'rov qabul qilinadi (sizning sayt)
- `src/index.js` → `DAILY_LIMIT` — har foydalanuvchiga kunlik AI so'rovlari soni (hozir 30)
- Gemini bepul kvotasi hammaga birga (~1500/kun). Ko'p foydalanuvchi bo'lsa, `DAILY_LIMIT` ni pasaytiring yoki Gemini billing yoqing.

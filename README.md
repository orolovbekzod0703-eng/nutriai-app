# 🥗 NutriAI — AI ovqatlanish kuzatuvchi

Ovqatingizni suratga oling yoki matn bilan yozing — AI kaloriya va ozuqa moddalarini (BJU) hisoblab beradi. O'zbek milliy taomlari bazasi, kunlik maqsadlar, suv va vazn kuzatuvi, kalendar, yutuqlar, shaxsiy AI-dietolog va 3 til (o'zbek / rus / ingliz).

React + Vite'da qurilgan. Barcha ma'lumot **faqat brauzeringizda** (`localStorage`) saqlanadi — server yo'q.

## 🚀 Lokal ishga tushirish

```bash
npm install
npm run dev
```

Brauzerda `http://localhost:5173` ochiladi.

Ishlab chiqarish uchun build:

```bash
npm run build      # natija: dist/ papkasi
npm run preview    # build'ni lokal ko'rib chiqish
```

## 🤖 AI funksiyalari (ixtiyoriy)

Rasm/matn tahlili, dietolog-chat va kunlik xulosa **Anthropic API** orqali ishlaydi.
Ilova ichida: **Profil → Sozlamalar → «AI kaliti»** dan o'zingizning `sk-ant-...` kalitingizni kiriting.
Kalit hech qayerga yuborilmaydi — faqat sizning brauzeringizda saqlanadi va to'g'ridan-to'g'ri Anthropic'ga so'rov yuboriladi.

> AI kalitisiz ham ilovaning qolgan hamma qismi to'liq ishlaydi: taomlar bazasi, kaloriya hisobi, suv, vazn, kalendar, yutuqlar.

## 📦 GitHub Pages'ga joylash

Repozitoriyda `.github/workflows/deploy.yml` tayyor turibdi. Kodni GitHub'ga push qilgach:

1. Repo → **Settings → Pages**
2. **Source** → **GitHub Actions** ni tanlang

Har `main`/`master` branch'ga push bo'lganda sayt avtomatik build bo'lib joylanadi.

## 🛠 Texnologiyalar

- React 18
- Vite 6
- localStorage (offline saqlash)
- Anthropic Claude API (ixtiyoriy, AI tahlil uchun)

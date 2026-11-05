# Trilogiya — kurator paneli (PWA)

«Reels: Trilogiya» Google Sheet'idagi o'quvchilar kuzatuv tizimining mobil ilovasi.
Hech qanday build kerak emas — oddiy statik fayllar.

## Fayllar

| Fayl | Vazifasi |
|---|---|
| `index.html` | Ilova qobig'i |
| `styles.css` | Dizayn (yorug'/qorong'i rejim) |
| `game.js` | Gamifikatsiya: XP, darajalar, nishonlar, holat, chellenj bali |
| `app.js` | Sahifalar, kiritish, saqlash, eksport |
| `seed.js` | Google Sheet'dan olingan boshlang'ich ma'lumot (19 o'quvchi) |
| `sw.js`, `manifest.webmanifest`, `icons/` | PWA: o'rnatish va internetsiz ishlash |

## Lokal ishga tushirish

```bash
python3 -m http.server 5173
```

So'ng `http://localhost:5173` ni oching.

## Telefonga o'rnatish

PWA faqat **HTTPS** orqali o'rnatiladi. Papkani istalgan statik hostingga joylang
(Vercel, Netlify, GitHub Pages, Cloudflare Pages), keyin:

- **Android (Chrome):** «Ko'proq» → «O'rnatish» tugmasi yoki menyu → «Bosh ekranga qo'shish».
- **iPhone (Safari):** «Ulashish» → «Bosh ekranga qo'shish».

Fayllarni yangilaganda `sw.js` dagi `VERSION` ni oshiring — telefonlar yangi versiyani oladi.

## Ball tizimi (game.js → `XP`)

| Harakat | XP |
|---|---|
| Jonli dars / yozuv | +10 / +5 |
| Vazifa topshirish | +20 |
| Har bir reels · haftalik norma | +8 · +15 |
| Har bir stories liniya · norma | +4 · +10 |
| Daromad | $10 = 1 XP (haftasiga max 300) |
| Birinchi sotuv | +100 |
| Obunachi o'sishi | 20 ta = 1 XP |
| Haftalik qamrov 1K/10K/100K/1M | +15/20/25/30 |

8 daraja: Yangi → Ijodkor → Kontentchi → Blogger → Trend → Influencer → Star → Legenda.
12 ta nishon. Barcha qiymatlar xom raqamlardan har safar qayta hisoblanadi.

## Jadvaldan farqlar

- **Vazifa % va Davomat %** kursdagi 15 darsga emas, **o'tilgan darslarga** nisbatan hisoblanadi
  (jadvalda 5 vazifadan 5 tasini topshirgan ham 33% chiqardi va hech kim «Yo'lda» bo'lolmasdi).
- **Chellenj bali** ham o'tgan haftalar normasiga nisbatan.

## Ma'lumotlar

Hozircha ma'lumot qurilmaning o'zida (`localStorage`) saqlanadi. Boshqa qurilmaga o'tkazish:
«Ko'proq» → «Nusxa olish» (JSON) → boshqa qurilmada «Yuklash».

## Keyingi bosqichlar

- **AI: Reels qamrovi** — Instagram profilidagi reels'lar qamrovini AI o'qib, «Qamrov» ustuniga yozadi (UI'da «Tez kunda»).
- **Bulutli baza** — bir nechta kurator bitta bazada ishlashi uchun (Supabase/Firebase yoki Google Sheets API).

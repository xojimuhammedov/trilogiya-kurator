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
| Haftalik reels ko'rishlari 1K/10K/100K/1M | +15/20/25/30 |
| Networking: tanishuv · insayt · natija | +15 · +10 · +25 |

8 daraja: Yangi → Ijodkor → Kontentchi → Blogger → Trend → Influencer → Star → Legenda.
15 ta nishon. Barcha qiymatlar xom raqamlardan har safar qayta hisoblanadi.

## Kirish (hozircha mock)

Ilova telefon raqam bilan ochiladi, boshqa hech narsa so'ralmaydi:

- **Kurator** raqami bilan kirilsa — to'liq panel (o'quvchilar, kiritish, reyting, sozlamalar).
- **O'quvchi** raqami bilan kirilsa — faqat **o'z profili** va **reyting**. O'quvchi o'z networking daraxtiga
  tanishuv va undan olgan insaytlarini qo'shadi. Boshqalarning profilini ocha olmaydi.

Hozir hammasi frontend'da: raqamlar `seed.js` dagi mock ma'lumotdan tekshiriladi, SMS kod yo'q,
ma'lumot qurilmaning o'zida saqlanadi. Demo: kurator `90 000 00 00`, o'quvchi `90 100 00 05`.
Backend ulanganda raqamni tasdiqlash (SMS yoki Telegram) va umumiy baza qo'shiladi.

## Networking

O'quvchi profilida **Networking** bo'limi bor. Kurs davomida kim bilan tanishgani (ism, soha, kursdoshmi),
undan qanday **insayt** olgani va bu tanishuv qanday **natija** berganini (maslahat, kollab, hamkorlik, mijoz, mentor) yoziladi.

- Tanishuvlar **daraxt** ko'rinishida: «Kim orqali tanishdi» tanlansa, yangi odam o'sha tanishning ostiga shoxlanadi.
- «Ulashish» tugmasi butun daraxtni insaytlari bilan matn qilib, Telegram guruhga tashlashga tayyorlaydi.
- Nishonlar: Networker (5+ tanishuv), Ko'prik (tanish orqali tanishuv), Turli sohalar (4+ soha).
- Reytingda alohida «Networking» bo'limi.

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

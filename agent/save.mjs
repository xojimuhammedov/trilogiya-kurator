// Brauzerdan olingan natijani o'tgan haftaga yozadi.
// Ishlatish: node agent/save.mjs <akkaunt> '<collect.js natijasi JSON>'
//            node agent/save.mjs <akkaunt> --error "sabab"
// Sanani reels kodidan o'zi hisoblaydi va faqat o'tgan hafta (dushanba–yakshanba) reels'larini qo'shadi.
import { targetWeek, codeToDate, parseCount, loadData, saveData, ymd } from './lib.mjs';

const [handleArg, payload, reason] = process.argv.slice(2);
if (!handleArg || !payload) {
  console.error("Ishlatish: node agent/save.mjs <akkaunt> '<json>' | --error \"sabab\"");
  process.exit(1);
}
const handle = handleArg.replace(/^@/, '').toLowerCase();
const week = targetWeek();
const data = loadData();
data.weeks[week.key] = data.weeks[week.key] || {};
const checkedAt = new Date().toISOString();

if (payload === '--error') {
  data.weeks[week.key][handle] = { error: reason || 'noma\'lum', checkedAt };
  saveData(data);
  console.log(JSON.stringify({ handle, week: week.key, error: reason }));
  process.exit(0);
}

const input = JSON.parse(payload);
const followers = parseCount(input.followers);
const items = (input.items || [])
  .map((it) => {
    const date = codeToDate(it.code);
    return { code: it.code, date, views: parseCount(it.views ?? it.viewsText) };
  })
  .filter((it) => it.date && it.date >= week.start && it.date < week.end);

const missingViews = items.filter((it) => it.views === null || Number.isNaN(it.views)).length;
// Ko'rishlar umuman o'qilmagan bo'lsa 0 emas, null yoziladi — mini-app eski qiymatni buzmaydi
const views = items.length && missingViews === items.length ? null : items.reduce((a, it) => a + (it.views || 0), 0);

data.weeks[week.key][handle] = {
  followers,
  reels: items.length,
  views,
  items: items.map((it) => ({ code: it.code, date: ymd(it.date), views: it.views })),
  checkedAt,
};
saveData(data);

console.log(JSON.stringify({
  handle, week: week.label, followers, reels: items.length, views,
  warning: missingViews ? `${missingViews} ta reels ko'rishi o'qilmadi` : undefined,
  // Eng eski yuklangan reels ham shu hafta ichida bo'lsa — sahifani pastga aylantirib qayta yig'ish kerak
  needMore: input.items && input.items.length > 0 && (() => {
    const dates = input.items.map((it) => codeToDate(it.code)).filter(Boolean).sort((a, b) => a - b);
    return dates.length > 3 && dates[0] >= week.start;
  })(),
}, null, 1));

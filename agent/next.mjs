// Qaysi hafta va qaysi profillar navbatda ekanini chiqaradi.
// Ishlatish: node agent/next.mjs [nechta=3]
import { targetWeek, loadData, loadProfiles } from './lib.mjs';

const limit = Number(process.argv[2] || 3);
const week = targetWeek();
const done = loadData().weeks[week.key] || {};
const all = loadProfiles();
const pending = all.filter((h) => !done[h.toLowerCase()]);

console.log(JSON.stringify({
  week: week.key,
  range: week.label,
  done: all.length - pending.length,
  total: all.length,
  next: pending.slice(0, limit),
}, null, 1));

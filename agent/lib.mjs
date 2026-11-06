// Agent skriptlari uchun umumiy funksiyalar.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const DATA = join(ROOT, 'data', 'instagram.json');
export const PROFILES = join(ROOT, 'agent', 'profiles.txt');

const DAY = 864e5;
const pad = (n) => String(n).padStart(2, '0');
export const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// O'tgan to'liq hafta: dushanba 00:00 dan keyingi dushanba 00:00 gacha (mahalliy vaqt)
export function targetWeek(now = new Date()) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sinceMonday = (today.getDay() + 6) % 7;
  const start = new Date(today.getTime() - (sinceMonday + 7) * DAY);
  const end = new Date(start.getTime() + 7 * DAY);
  return { start, end, key: ymd(start), label: `${ymd(start)} — ${ymd(new Date(end.getTime() - DAY))}` };
}

// Reels havolasidagi kod (masalan DfAITR5hmXe) ichida joylangan vaqt yashiringan
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
const IG_EPOCH = 1314220021721;
export function codeToDate(code) {
  let id = 0n;
  for (const ch of code) {
    const i = ALPHABET.indexOf(ch);
    if (i < 0) return null;
    id = id * 64n + BigInt(i);
  }
  return new Date(Number(id >> 23n) + IG_EPOCH);
}

// "12,3K", "1.2M", "12 345", "1,2 mln", "15 тыс." → son
export function parseCount(text) {
  if (text === null || text === undefined) return null;
  if (typeof text === 'number') return text;
  const t = String(text).toLowerCase().replace(/ | /g, ' ').trim();
  const m = t.match(/([\d][\d\s.,]*)\s*(k|m|b|mln|ming|тыс|млн)?/);
  if (!m) return null;
  let raw = m[1].trim().replace(/\s/g, '');
  const unit = m[2];
  if (unit) {
    raw = raw.replace(',', '.');
    const mult = { k: 1e3, ming: 1e3, 'тыс': 1e3, m: 1e6, mln: 1e6, 'млн': 1e6, b: 1e9 }[unit];
    return Math.round(parseFloat(raw) * mult);
  }
  return parseInt(raw.replace(/[.,]/g, ''), 10);
}

export function loadData() { return JSON.parse(readFileSync(DATA, 'utf8')); }
export function saveData(d) { d.updatedAt = new Date().toISOString(); writeFileSync(DATA, JSON.stringify(d, null, 1) + '\n'); }
export function loadProfiles() {
  return readFileSync(PROFILES, 'utf8').split('\n').map((l) => l.trim().replace(/^@/, '')).filter((l) => l && !l.startsWith('#'));
}

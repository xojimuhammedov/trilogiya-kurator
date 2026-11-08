// Gamifikatsiya dvigateli: barcha ko'rsatkichlar xom ma'lumotdan hisoblanadi,
// hech narsa saqlanmaydi — raqam o'zgarsa XP, daraja va nishonlar o'zi yangilanadi.

const XP = {
  live: 10,          // jonli dars
  record: 5,         // yozuvni ko'rgan
  homework: 20,      // vazifa topshirildi
  video: 8,          // har bir reels/video
  videoNorm: 15,     // haftalik video normasi bajarilsa
  story: 4,          // har bir stories liniya
  storyNorm: 10,     // haftalik stories normasi bajarilsa
  usdPerXp: 10,      // har $10 daromad = 1 XP
  incomeWeekCap: 300,// bir haftada daromaddan maksimal XP
  firstSale: 100,    // birinchi sotuv bonusi
  subsPerXp: 20,     // har 20 yangi obunachi = 1 XP
  reachStep: 5,      // qamrov: 5 × (raqamdagi xonalar soni - 1)
  viewStep: 5,       // reels ko'rishlari: xuddi qamrov kabi shkala
  contact: 15,       // yangi tanishuv (networking)
  takeaway: 10,      // tanishuvdan xulosa yozilsa
  netResult: 25,     // tanishuv natija bersa (hamkorlik, mijoz, kollab...)
};

const LEVELS = [
  { min: 0, name: 'Yangi' },
  { min: 150, name: 'Ijodkor' },
  { min: 350, name: 'Kontentchi' },
  { min: 600, name: 'Blogger' },
  { min: 1000, name: 'Trend' },
  { min: 1500, name: 'Influencer' },
  { min: 2200, name: 'Star' },
  { min: 3000, name: 'Legenda' },
];

const STATUSES = {
  natijada: { label: 'Natijada', hint: 'Daromad bor — keys nomzodi' },
  yolda: { label: "Yo'lda", hint: "Daromad yo'q, vazifalar 70%+" },
  sekin: { label: 'Sekin', hint: 'Vazifalar 30–70% — kurator diqqatiga' },
  xavf: { label: 'Xavf', hint: "Vazifalar 30% dan kam — darhol aloqa" },
};

const BADGES = [
  { id: 'first_sale', icon: 'dollar', name: 'Birinchi sotuv', desc: 'Blog orqali birinchi daromad', test: (st) => st.income > 0 },
  { id: 'k1', icon: 'medal', name: '$1K klubi', desc: "Jami daromad $1 000 dan oshdi", test: (st) => st.income >= 1000 },
  { id: 'k5', icon: 'crown', name: '$5K klubi', desc: "Jami daromad $5 000 dan oshdi", test: (st) => st.income >= 5000 },
  { id: 'goal', icon: 'target', name: 'Maqsadga yetdi', desc: "Anketadagi daromad maqsadi bajarildi", test: (st, s) => num(s.goal) > 0 && st.income >= num(s.goal) },
  { id: 'streak5', icon: 'flame', name: 'Temir intizom', desc: '5 dars ketma-ket qatnashdi', test: (st) => st.bestStreak >= 5 },
  { id: 'full_att', icon: 'calendar', name: "Bir dars ham qoldirmadi", desc: "O'tilgan barcha darslarda qatnashdi", test: (st, s, c) => c.lessonsHeld >= 3 && st.attended === c.lessonsHeld },
  { id: 'hw_all', icon: 'book', name: 'Vazifa ustasi', desc: 'Berilgan barcha vazifalarni topshirdi', test: (st, s, c) => c.hwAssigned >= 3 && st.hwDone === c.hwAssigned },
  { id: 'reels4', icon: 'video', name: 'Reels mashinasi', desc: '4 hafta ketma-ket video normasi', test: (st) => st.bestVideoRun >= 4 },
  { id: 'stories3', icon: 'layers', name: 'Stories qiroli', desc: '3 hafta stories normasi bajarildi', test: (st) => st.storyNormWeeks >= 3 },
  { id: 'reach100k', icon: 'eye', name: '100K qamrov', desc: 'Bir haftada 100 000+ qamrov', test: (st) => st.maxReach >= 100000 },
  { id: 'reach1m', icon: 'zap', name: 'Million qamrov', desc: 'Bir haftada 1 000 000+ qamrov', test: (st) => st.maxReach >= 1000000 },
  { id: 'growth1k', icon: 'trending', name: '+1 000 obunachi', desc: "Boshlang'ichdan 1 000+ o'sish", test: (st) => st.growth >= 1000 },
  { id: 'networker', icon: 'network', name: 'Networker', desc: '5 ta va undan ko\'p tanishuv', test: (st) => st.network.contacts >= 5 },
  { id: 'bridge', icon: 'share', name: "Ko'prik", desc: 'Tanishi orqali yangi odam bilan tanishdi', test: (st) => st.network.depth >= 2 },
  { id: 'diverse', icon: 'sparkles', name: 'Turli sohalar', desc: '4 xil soha egasi bilan tanishdi', test: (st) => st.network.fields >= 4 },
];

function num(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = typeof v === 'number' ? v : Number(String(v).replace(/[\s$,]/g, ''));
  return Number.isFinite(n) ? n : null;
}

const has = (v) => num(v) !== null;
const sum = (arr) => arr.reduce((a, v) => a + (num(v) || 0), 0);

// Nechta dars o'tilgan / hafta to'ldirilgan — kimdadir yozuv bor oxirgi indeks bo'yicha
function lastFilled(students, keys) {
  let last = -1;
  for (const s of students) for (const k of keys) {
    (s[k] || []).forEach((v, i) => { if (has(v) && i > last) last = i; });
  }
  return last + 1;
}

function courseContext(data) {
  const active = data.students.filter((s) => !s.archived);
  return {
    settings: data.settings,
    lessonsHeld: lastFilled(active, ['att']),
    hwAssigned: lastFilled(active, ['hw']),
    weeksElapsed: lastFilled(active, ['reach', 'views', 'subs', 'income', 'video', 'stories']),
  };
}

function levelFor(xp) {
  let i = 0;
  while (i + 1 < LEVELS.length && xp >= LEVELS[i + 1].min) i++;
  const cur = LEVELS[i];
  const next = LEVELS[i + 1];
  return {
    n: i + 1,
    name: cur.name,
    min: cur.min,
    next: next ? next.min : null,
    progress: next ? (xp - cur.min) / (next.min - cur.min) : 1,
  };
}

function scaleXp(r, step) {
  const n = num(r);
  if (!n || n < 10) return 0;
  return step * Math.floor(Math.log10(n));
}

// Bir haftalik XP (video, stories, daromad, obunachi, qamrov)
function weekXp(s, w, ctx, prevSubs) {
  const st = ctx.settings;
  const v = num(s.video[w]) || 0;
  const sto = num(s.stories[w]) || 0;
  const inc = num(s.income[w]) || 0;
  const parts = {
    video: v * XP.video + (v > 0 && v >= (st.videoNorm[w] || Infinity) ? XP.videoNorm : 0),
    stories: sto * XP.story + (sto > 0 && sto >= (st.storiesNorm[w] || Infinity) ? XP.storyNorm : 0),
    income: Math.min(XP.incomeWeekCap, Math.floor(inc / XP.usdPerXp)),
    subs: 0,
    reach: scaleXp(s.reach[w], XP.reachStep),
    views: scaleXp(s.views[w], XP.viewStep),
  };
  const subs = num(s.subs[w]);
  if (subs !== null && prevSubs !== null && subs > prevSubs) {
    parts.subs = Math.floor((subs - prevSubs) / XP.subsPerXp);
  }
  parts.total = parts.video + parts.stories + parts.income + parts.subs + parts.reach + parts.views;
  return parts;
}

function studentStats(s, ctx) {
  const st = {};
  const { lessonsHeld, hwAssigned, weeksElapsed, settings } = ctx;

  // Davomat
  st.attended = 0; st.attendScore = 0;
  let run = 0; st.bestStreak = 0;
  for (let i = 0; i < lessonsHeld; i++) {
    const v = num(s.att[i]) || 0;
    if (v > 0) { st.attended++; st.attendScore += v; run++; st.bestStreak = Math.max(st.bestStreak, run); }
    else run = 0;
  }
  st.streak = run;
  st.attPct = lessonsHeld ? st.attendScore / lessonsHeld : null;

  // Vazifalar
  st.hwDone = s.hw.slice(0, hwAssigned).filter((v) => num(v) > 0).length;
  st.hwPct = hwAssigned ? st.hwDone / hwAssigned : null;

  // Haftalik raqamlar
  st.income = sum(s.income);
  const firstSaleWeek = s.income.findIndex((v) => num(v) > 0);
  st.firstSaleWeek = firstSaleWeek >= 0 ? firstSaleWeek + 1 : null;
  st.salesWeeks = s.income.filter((v) => num(v) > 0).length;

  const subsIdx = s.subs.map((v, i) => (has(v) ? i : -1)).filter((i) => i >= 0);
  st.lastSubs = subsIdx.length ? num(s.subs[subsIdx[subsIdx.length - 1]]) : num(s.startFollowers);
  st.growth = subsIdx.length && has(s.startFollowers) ? st.lastSubs - num(s.startFollowers) : null;

  const reachVals = s.reach.map(num).filter((v) => v !== null);
  st.totalReach = sum(reachVals);
  st.avgReach = reachVals.length ? st.totalReach / reachVals.length : null;
  st.maxReach = reachVals.length ? Math.max(...reachVals) : 0;
  st.totalViews = sum(s.views);

  // Chellenj bali — o'tgan haftalar normasi bo'yicha
  const videoNorm = sum(settings.videoNorm.slice(0, weeksElapsed));
  const storyNorm = sum(settings.storiesNorm.slice(0, weeksElapsed));
  st.videos = sum(s.video);
  st.storiesCount = sum(s.stories);
  st.videoPct = videoNorm ? Math.min(1, st.videos / videoNorm) : 0;
  st.storiesPct = storyNorm ? Math.min(1, st.storiesCount / storyNorm) : 0;
  st.incomePct = num(s.goal) > 0 ? Math.min(1, st.income / num(s.goal)) : 0;
  st.challenge = (st.videoPct + st.storiesPct + st.incomePct) / 3;

  let vRun = 0; st.bestVideoRun = 0; st.storyNormWeeks = 0;
  for (let w = 0; w < weeksElapsed; w++) {
    const v = num(s.video[w]) || 0;
    if (v > 0 && v >= settings.videoNorm[w]) { vRun++; st.bestVideoRun = Math.max(st.bestVideoRun, vRun); } else vRun = 0;
    const so = num(s.stories[w]) || 0;
    if (so > 0 && so >= settings.storiesNorm[w]) st.storyNormWeeks++;
  }

  // XP
  const bd = { att: 0, hw: 0, video: 0, stories: 0, income: 0, subs: 0, reach: 0, views: 0, network: 0, bonus: 0 };
  s.att.forEach((v) => { const n = num(v); if (n >= 1) bd.att += XP.live; else if (n > 0) bd.att += XP.record; });
  bd.hw = s.hw.filter((v) => num(v) > 0).length * XP.homework;
  st.weekly = [];
  let prevSubs = num(s.startFollowers);
  for (let w = 0; w < settings.weeks; w++) {
    const p = weekXp(s, w, ctx, prevSubs);
    if (has(s.subs[w])) prevSubs = num(s.subs[w]);
    st.weekly.push(p.total);
    bd.video += p.video; bd.stories += p.stories; bd.income += p.income; bd.subs += p.subs; bd.reach += p.reach; bd.views += p.views;
  }
  if (st.income > 0) bd.bonus += XP.firstSale;

  // Networking: tanishuvlar daraxti (parentId — kim orqali tanishgani)
  const net = s.network || [];
  const byId = Object.fromEntries(net.map((n) => [n.id, n]));
  const depthOf = (n, guard = 0) => (n.parentId && byId[n.parentId] && guard < 50 ? 1 + depthOf(byId[n.parentId], guard + 1) : 1);
  st.network = {
    contacts: net.length,
    fields: new Set(net.map((n) => (n.field || '').trim().toLowerCase()).filter(Boolean)).size,
    takeaways: net.filter((n) => (n.takeaway || '').trim()).length,
    results: net.filter((n) => n.result && n.result !== 'none').length,
    depth: net.reduce((m, n) => Math.max(m, depthOf(n)), 0),
  };
  bd.network = st.network.contacts * XP.contact + st.network.takeaways * XP.takeaway + st.network.results * XP.netResult;
  st.xpBreakdown = bd;
  st.xp = Object.values(bd).reduce((a, b) => a + b, 0);
  st.level = levelFor(st.xp);

  // Holat (Qo'llanmadagi qoida, foiz berilgan vazifalarga nisbatan)
  const hw = st.hwPct || 0;
  st.status = st.income > 0 ? 'natijada' : hw >= 0.7 ? 'yolda' : hw >= 0.3 ? 'sekin' : 'xavf';

  st.badges = BADGES.filter((b) => b.test(st, s, ctx)).map((b) => b.id);
  return st;
}

function computeAll(data) {
  const ctx = courseContext(data);
  const rows = data.students
    .filter((s) => !s.archived)
    .map((s) => ({ s, st: studentStats(s, ctx) }));
  // XP bo'yicha o'rin
  [...rows].sort((a, b) => b.st.xp - a.st.xp).forEach((r, i) => { r.st.rank = i + 1; });
  return { ctx, rows };
}

window.Game = { XP, LEVELS, STATUSES, BADGES, num, has, computeAll, studentStats, courseContext, levelFor };

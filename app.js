(() => {
  const G = window.Game;
  const KEY = 'trilogiya:v1';
  const PREF = 'trilogiya:prefs';
  const WEEKLY = ['reach', 'views', 'subs', 'income', 'video', 'stories'];
  const IG_SOURCE = 'https://raw.githubusercontent.com/xojimuhammedov/trilogiya-kurator/main/data/instagram.json';

  // ---------- holat ----------
  let data = load();
  let calc = G.computeAll(data);
  const ui = { filter: 'all', q: '', mode: 'att', lesson: null, hwLesson: null, week: null, metric: 'video', topCat: 'xp' };
  let installPrompt = null;

  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function normalize(d) {
    d.settings = Object.assign({ courseName: 'Kurs', lessons: 15, weeks: 12, startDate: '2026-08-31', igSource: IG_SOURCE }, d.settings);
    const { lessons, weeks } = d.settings;
    const fit = (a, n) => Array.from({ length: n }, (_, i) => (a && a[i] !== undefined ? a[i] : null));
    d.settings.videoNorm = fit(d.settings.videoNorm, weeks).map((v) => (v === null ? 3 : v));
    d.settings.storiesNorm = fit(d.settings.storiesNorm, weeks).map((v) => (v === null ? 3 : v));
    d.students.forEach((s) => {
      s.att = fit(s.att, lessons); s.hw = fit(s.hw, lessons);
      WEEKLY.forEach((k) => { s[k] = fit(s[k], weeks); });
      if (!Array.isArray(s.network)) s.network = [];
    });
    return d;
  }
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return normalize(JSON.parse(raw));
    } catch (e) { /* bo'sh yoki bloklangan */ }
    return normalize(clone(window.SEED));
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { toast('Saqlab bo\'lmadi — brauzer xotirasi yopiq'); }
  }
  function getPrefs() { try { return JSON.parse(localStorage.getItem(PREF)) || {}; } catch (e) { return {}; } }
  function setPref(k, v) { const p = getPrefs(); p[k] = v; try { localStorage.setItem(PREF, JSON.stringify(p)); } catch (e) { /* */ } }

  // O'zgarishdan keyin XP/daraja/nishon farqini ko'rsatadi
  function commit(studentId) {
    const before = studentId && calc.rows.find((r) => r.s.id === studentId);
    const prev = before && { xp: before.st.xp, lv: before.st.level.n, badges: before.st.badges.slice() };
    calc = G.computeAll(data);
    save();
    if (!prev) return;
    const now = calc.rows.find((r) => r.s.id === studentId);
    if (!now) return;
    const d = now.st.xp - prev.xp;
    const name = esc(now.s.name);
    if (now.st.level.n > prev.lv) {
      toast(`${ic('star')} ${name} — ${now.st.level.n}-daraja: <span class="xp">${now.st.level.name}</span>`, 'level');
    } else if (d) {
      toast(`<span class="xp">${d > 0 ? '+' : ''}${d} XP</span> ${name}`);
    }
    now.st.badges.filter((b) => !prev.badges.includes(b)).forEach((b) => {
      const bd = G.BADGES.find((x) => x.id === b);
      toast(`${ic(bd.icon)} Yangi nishon: ${bd.name}`, 'level');
    });
  }

  // ---------- yordamchilar ----------
  const $ = (s, el = document) => el.querySelector(s);
  function esc(s) { return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  function fmt(n) {
    if (n === null || n === undefined || n === '' || Number.isNaN(n)) return '—';
    return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }
  function money(n) { return n ? '$' + fmt(n) : '—'; }
  function compact(n) {
    if (!n) return '—';
    if (n >= 1e6) return (n / 1e6).toFixed(n >= 1e7 ? 0 : 1).replace('.', ',') + ' mln';
    if (n >= 1e4) return Math.round(n / 1e3) + 'K';
    return fmt(n);
  }
  function pct(v) { return v === null || v === undefined ? '—' : Math.round(v * 100) + '%'; }
  function initial(name) { return esc((name || '?').trim().charAt(0).toUpperCase()); }
  const MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
  function today() { const d = new Date(); return `${d.getDate()}-${MONTHS[d.getMonth()]}`; }
  function avg(arr) { const a = arr.filter((v) => v !== null && v !== undefined); return a.length ? a.reduce((x, y) => x + y, 0) / a.length : null; }
  function byId(id) { return data.students.find((s) => s.id === id); }
  function rowOf(id) { return calc.rows.find((r) => r.s.id === id); }

  const ICONS = {
    home: '<path d="M3.5 10.5 12 3.5l8.5 7V20a1 1 0 0 1-1 1H15v-6H9v6H4.5a1 1 0 0 1-1-1z"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.5 3.4-5.5 6.5-5.5s5.7 2 6.5 5.5"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.8c2 .7 3.2 2.5 3.5 5.2"/>',
    plus: '<path d="M12 6v12M6 12h12"/>',
    trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8.5 20.5h7M10 17h4"/>',
    sliders: '<path d="M4 7h9M18 7h2M4 17h3M12 17h8"/><circle cx="15.5" cy="7" r="2.3"/><circle cx="9.5" cy="17" r="2.3"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    back: '<path d="M15 5l-7 7 7 7"/>',
    chev: '<path d="m9 5 7 7-7 7"/>',
    flame: '<path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2 .8-3.3 2-4.5.2 1.6 1 2.5 2 3 0-3 0-5.5 1-8.5z"/>',
    star: '<path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>',
    dollar: '<path d="M12 3v18M16.5 7.5c-.7-1.4-2.4-2.3-4.5-2.3-2.6 0-4.5 1.3-4.5 3.3 0 4.7 9.5 2.3 9.5 7 0 2-2 3.3-4.8 3.3-2.3 0-4.1-1-4.8-2.6"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
    video: '<rect x="3" y="6" width="13" height="12" rx="3"/><path d="m16 10.5 5-3v9l-5-3"/>',
    layers: '<rect x="4" y="3" width="11" height="15" rx="2.5"/><path d="M19 7v11.5a2.5 2.5 0 0 1-2.5 2.5H9"/>',
    book: '<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M8 3v4M16 3v4M3.5 10h17M9 15l2 2 4-4"/>',
    target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r=".8"/>',
    trending: '<path d="m3 17 6-6 4 4 8-8M15 7h6v6"/>',
    sparkles: '<path d="M11 3l1.8 4.7 4.7 1.8-4.7 1.8L11 16l-1.8-4.7L4.5 9.5l4.7-1.8z"/><path d="M18.5 14.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/>',
    zap: '<path d="M13 2.5 4.5 13.5H11l-1 8 8.5-11H12z"/>',
    crown: '<path d="M3.5 8l4 3.5L12 5l4.5 6.5 4-3.5-1.5 10h-14z"/><path d="M5 20.5h14"/>',
    medal: '<circle cx="12" cy="15" r="5.5"/><path d="M8.5 10.5 6 3h4l2 4 2-4h4l-2.5 7.5"/>',
    download: '<path d="M12 4v11M7 10.5l5 5 5-5M5 20h14"/>',
    upload: '<path d="M12 16V5M7 9.5l5-5 5 5M5 20h14"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
    instagram: '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r=".6"/>',
    telegram: '<path d="m21.5 4-19 7.4 6.6 2.4 2.4 6.7 3.5-4.2 4.6 3.4z"/><path d="m9.1 13.8 7.4-5.8"/>',
    userplus: '<circle cx="10" cy="8" r="3.5"/><path d="M3.5 20c.8-3.5 3.4-5.5 6.5-5.5 1.5 0 2.9.5 4 1.3M19 14v6M16 17h6"/>',
    refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7M20 5v6h-6"/>',
    phone: '<rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
    cloud: '<path d="M7 18.5a4.5 4.5 0 0 1-.6-9A6 6 0 0 1 18 9a4.5 4.5 0 0 1-.5 9.5z"/>',
    archive: '<rect x="3" y="4" width="18" height="5" rx="1.5"/><path d="M5 9v9.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V9M10 13h4"/>',
    moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
    file: '<path d="M6 3h8l5 5v13H6z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    share: '<path d="M12 15V3.5M7.5 8 12 3.5 16.5 8"/><path d="M5 13v5.5A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5V13"/>',
    network: '<circle cx="12" cy="5" r="2.5"/><circle cx="5" cy="19" r="2.5"/><circle cx="19" cy="19" r="2.5"/><path d="M12 7.5v4M12 11.5 5 16.5M12 11.5l7 5"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  };
  function ic(name, cls = '') { return `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ''}</svg>`; }

  function statusChip(key) { return `<span class="chip-status s-${key}">${G.STATUSES[key].label}</span>`; }
  function avatar(s, st, lg = false) {
    return `<div class="avatar ${lg ? 'lg' : ''}">${initial(s.name)}<span class="lv">${st.level.n}</span></div>`;
  }
  function ring(v, label) {
    const r = 30, c = 2 * Math.PI * r, p = Math.max(0, Math.min(1, v || 0));
    return `<div><div class="ring"><svg viewBox="0 0 72 72"><circle class="track" cx="36" cy="36" r="${r}"/><circle class="val" cx="36" cy="36" r="${r}" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - p)}"/></svg><b class="num">${pct(v)}</b></div><div class="cap">${label}</div></div>`;
  }
  function bar(p, color) { return `<div class="bar"><i style="width:${Math.max(0, Math.min(1, p || 0)) * 100}%;${color ? `background:${color}` : ''}"></i></div>`; }

  // ---------- toast ----------
  function toast(html, kind = '') {
    const el = document.createElement('div');
    el.className = 'toast ' + kind;
    el.innerHTML = html;
    $('#toasts').appendChild(el);
    setTimeout(() => el.remove(), 2500);
  }

  // ---------- marshrutlash ----------
  function route() {
    const h = location.hash.replace(/^#\/?/, '');
    const [page, arg] = h.split('/');
    return { page: page || 'home', arg };
  }
  function topbar(title, sub, opts = {}) {
    $('#top').innerHTML = `
      ${opts.back ? `<a class="icon-btn" href="${opts.back}" aria-label="Orqaga">${ic('back')}</a>` : ''}
      <div class="grow"><h1>${title}</h1>${sub ? `<div class="sub">${sub}</div>` : ''}</div>
      ${opts.action || ''}`;
  }
  function tabs(page) {
    const t = [
      ['home', 'Bosh', 'home'], ['students', "O'quvchilar", 'users'], ['input', 'Kiritish', 'plus'],
      ['top', 'Reyting', 'trophy'], ['more', "Ko'proq", 'sliders'],
    ];
    const active = page === 's' ? 'students' : page;
    $('#tabs').innerHTML = t.map(([k, label, icon]) => k === 'input'
      ? `<a href="#/${k}" class="center ${active === k ? 'on' : ''}"><span class="pill">${ic(icon)}</span>${label}</a>`
      : `<a href="#/${k}" class="${active === k ? 'on' : ''}">${ic(icon)}${label}</a>`).join('');
  }
  function render(keepScroll) {
    const y = window.scrollY;
    const { page, arg } = route();
    tabs(page);
    const view = { home, students, s: () => profile(arg), input, top, more }[page] || home;
    $('#view').innerHTML = view();
    if (keepScroll) window.scrollTo(0, y);
    afterRender(page);
  }
  window.addEventListener('hashchange', () => { render(); window.scrollTo(0, 0); });

  // ---------- BOSH ----------
  function home() {
    const { ctx, rows } = calc;
    const S = data.settings;
    topbar('Bosh sahifa', `${esc(S.courseName)} · ${today()}`);
    const earners = rows.filter((r) => r.st.income > 0).length;
    const risk = rows.filter((r) => r.st.status === 'xavf');
    const income = rows.reduce((a, r) => a + r.st.income, 0);
    const weekly = Array.from({ length: S.weeks }, (_, w) => rows.reduce((a, r) => a + (G.num(r.s.income[w]) || 0), 0));
    const maxW = Math.max(1, ...weekly);
    const topW = weekly.indexOf(Math.max(...weekly));
    const counts = Object.keys(G.STATUSES).map((k) => [k, rows.filter((r) => r.st.status === k).length]);
    const w = ctx.weeksElapsed - 1;
    const hero = w >= 0 ? [...rows].sort((a, b) => b.st.weekly[w] - a.st.weekly[w])[0] : null;
    const podium = [...rows].sort((a, b) => b.st.xp - a.st.xp).slice(0, 3);

    return `<div class="stack">
      <section class="hero">
        <div class="eyebrow">Kurs jarayoni</div>
        <div class="title">${esc(S.courseName)}</div>
        <div class="meta num"><span>${Math.max(ctx.weeksElapsed, 1)}-hafta / ${S.weeks}</span><span>${ctx.lessonsHeld} / ${S.lessons} dars</span></div>
        ${bar(ctx.lessonsHeld / S.lessons)}
      </section>

      <div class="kpis">
        <div class="kpi"><div class="label">${ic('users')}O'quvchilar</div><div class="value num">${rows.length}</div></div>
        <div class="kpi"><div class="label">${ic('dollar')}Daromad qilgan</div><div class="value num">${earners}<small> / ${rows.length}</small></div></div>
        <div class="kpi"><div class="label">${ic('trending')}Guruh daromadi</div><div class="value num">${money(income)}</div></div>
        <div class="kpi"><div class="label">${ic('flame')}Xavf ostida</div><div class="value num" style="color:${risk.length ? 'var(--bad)' : 'inherit'}">${risk.length}</div></div>
      </div>

      <div class="card rings">
        ${ring(avg(rows.map((r) => r.st.hwPct)), "O'rt. vazifa")}
        ${ring(avg(rows.map((r) => r.st.attPct)), "O'rt. davomat")}
        ${ring(avg(rows.map((r) => r.st.challenge)), 'Chellenj bali')}
      </div>
    </div>

    ${hero && hero.st.weekly[w] > 0 ? `
    <div class="section-title"><h2>${w + 1}-hafta qahramoni</h2></div>
    <a class="card row" style="border-top:1px solid var(--line)" href="#/s/${hero.s.id}">
      ${avatar(hero.s, hero.st)}
      <div class="main"><div class="name">${esc(hero.s.name)}</div><div class="meta">${hero.st.level.name} · ${statusChip(hero.st.status)}</div></div>
      <div class="end"><div class="big xp num">+${hero.st.weekly[w]} XP</div><div class="faint small">shu hafta</div></div>
    </a>` : ''}

    <div class="section-title"><h2>Yetakchilar</h2><a href="#/top">Reyting →</a></div>
    <div class="card">${podiumHtml(podium, (r) => `${fmt(r.st.xp)} XP`)}</div>

    <div class="section-title"><h2>Holat</h2></div>
    <div class="card">
      <div class="dist">${counts.filter(([, c]) => c).map(([k, c]) => `<i class="s-${k}" style="flex:${c};background:var(--c)"></i>`).join('')}</div>
      <div class="legend">${counts.map(([k, c]) => `<span><i class="dot s-${k}" style="background:var(--c)"></i>${G.STATUSES[k].label}<b class="num">${c}</b></span>`).join('')}</div>
    </div>

    <div class="section-title"><h2>Haftalik daromad</h2><span class="faint small num">${money(income)}</span></div>
    <div class="card">
      <div class="bars">${weekly.map((v, i) => `<div class="col"><div class="b ${v ? (i === topW ? 'top' : 'on') : ''}" style="height:${(v / maxW) * 100}%" title="${money(v)}"></div><div class="lbl">${i + 1}</div></div>`).join('')}</div>
    </div>

    ${risk.length ? `
    <div class="section-title"><h2>Diqqat talab</h2><a href="#/students" data-act="filter" data-v="xavf">Hammasi →</a></div>
    <div class="card flush list">${risk.map((r) => studentRow(r)).join('')}</div>` : ''}`;
  }

  function podiumHtml(list, val) {
    if (!list.length) return '<div class="empty">Hali ma\'lumot yo\'q</div>';
    const order = [list[1], list[0], list[2]];
    const cls = ['p2', 'p1', 'p3'];
    const place = [2, 1, 3];
    return `<div class="podium">${order.map((r, i) => r ? `
      <a class="pod ${cls[i]}" href="#/s/${r.s.id}">
        ${avatar(r.s, r.st)}
        <div class="nm">${esc(r.s.name)}</div>
        <div class="vv num">${val(r)}</div>
        <div class="block">${place[i]}</div>
      </a>` : '<div></div>').join('')}</div>`;
  }

  function studentRow(r, end) {
    return `<a class="row" href="#/s/${r.s.id}">
      ${avatar(r.s, r.st)}
      <div class="main">
        <div class="name">${esc(r.s.name)}</div>
        <div class="meta">${r.st.level.name}${r.s.track ? ` · Trek ${esc(r.s.track)}` : ''}${r.st.streak >= 2 ? ` · <span class="streak">${ic('flame')}${r.st.streak}</span>` : ''}</div>
      </div>
      <div class="end">${end || `<div class="big num">${fmt(r.st.xp)} <span class="faint small">XP</span></div>${statusChip(r.st.status)}`}</div>
    </a>`;
  }

  // ---------- O'QUVCHILAR ----------
  function students() {
    const { rows } = calc;
    topbar("O'quvchilar", `${rows.length} ta faol o'quvchi`, { action: `<button class="icon-btn" data-act="new-student" aria-label="Qo'shish">${ic('userplus')}</button>` });
    const chip = (k, label) => {
      const c = k === 'all' ? rows.length : rows.filter((r) => r.st.status === k).length;
      return `<button class="chip ${ui.filter === k ? 'on' : ''}" data-act="filter" data-v="${k}">${label}<span class="cnt">${c}</span></button>`;
    };
    return `<div class="stack">
      <label class="search">${ic('search')}<input id="q" type="search" placeholder="Ism, telegram yoki instagram" value="${esc(ui.q)}" autocomplete="off"></label>
      <div class="chips">${chip('all', 'Hammasi')}${Object.entries(G.STATUSES).map(([k, v]) => chip(k, v.label)).join('')}</div>
      <div class="card flush list" id="slist">${studentList()}</div>
    </div>`;
  }
  function studentList() {
    const { rows } = calc;
    const q = ui.q.trim().toLowerCase();
    const list = rows.filter((r) => (ui.filter === 'all' || r.st.status === ui.filter)
      && (!q || [r.s.name, r.s.telegram, r.s.instagram, r.s.curator].join(' ').toLowerCase().includes(q)));
    return list.length ? list.map((r) => studentRow(r)).join('') : '<div class="empty">Hech kim topilmadi</div>';
  }

  // ---------- PROFIL ----------
  function profile(id) {
    const r = rowOf(id);
    if (!r) { topbar('Topilmadi', '', { back: '#/students' }); return '<div class="empty">O\'quvchi topilmadi</div>'; }
    const { s, st } = r;
    const { ctx } = calc;
    const S = data.settings;
    topbar('Profil', `${st.rank}-o'rin · ${calc.rows.length} kishidan`, {
      back: '#/students',
      action: `<button class="icon-btn" data-act="edit-student" data-id="${s.id}" aria-label="Tahrirlash">${ic('edit')}</button>`,
    });
    const lv = st.level;
    const goal = G.num(s.goal);
    const attDot = (v, i) => {
      if (i >= ctx.lessonsHeld) return '<i class="future"></i>';
      const n = G.num(v);
      return n >= 1 ? '<i class="full"></i>' : n > 0 ? '<i class="half"></i>' : '<i class="miss"></i>';
    };
    const hwDot = (v, i) => (i >= ctx.hwAssigned ? '<i class="future"></i>' : G.num(v) > 0 ? '<i class="full"></i>' : '<i class="miss"></i>');
    const weeks = Array.from({ length: Math.max(ctx.weeksElapsed, 1) }, (_, w) => w);
    const bd = st.xpBreakdown;
    const bdMax = Math.max(1, ...Object.values(bd));
    const bdRows = [['Davomat', bd.att], ['Vazifalar', bd.hw], ['Reels', bd.video], ['Stories', bd.stories], ['Daromad', bd.income], ['Birinchi sotuv bonusi', bd.bonus], ['Obunachi o\'sishi', bd.subs], ['Reels ko\'rishlari', bd.views], ['Qamrov', bd.reach], ['Networking', bd.network]];

    return `<div class="stack">
      <div class="profile-head">
        ${avatar(s, st, true)}
        <div style="min-width:0">
          <h2>${esc(s.name)}</h2>
          <div style="display:flex;gap:8px;align-items:center;margin-top:4px;flex-wrap:wrap">${statusChip(st.status)}${s.track ? `<span class="faint small">Trek ${esc(s.track)}</span>` : ''}${s.curator ? `<span class="faint small">· Kurator: ${esc(s.curator)}</span>` : ''}</div>
          <div class="links">
            ${s.instagram ? `<a class="link-chip" target="_blank" rel="noopener" href="https://instagram.com/${encodeURIComponent(s.instagram)}">${ic('instagram')}${esc(s.instagram)}</a>` : ''}
            ${s.telegram ? `<a class="link-chip" target="_blank" rel="noopener" href="https://t.me/${encodeURIComponent(s.telegram)}">${ic('telegram')}${esc(s.telegram)}</a>` : ''}
          </div>
        </div>
      </div>

      <div class="card level-card">
        <div class="level-top">
          <div class="level-num">${lv.n}</div>
          <div class="grow">
            <div class="lname">${lv.name}</div>
            <div class="small faint num"><span class="xp">${fmt(st.xp)} XP</span>${lv.next ? ` · keyingi darajaga ${fmt(lv.next - st.xp)} XP` : ' · eng yuqori daraja'}</div>
          </div>
          <span class="streak ${st.streak ? '' : 'cold'}" title="Ketma-ket darslar">${ic('flame')}${st.streak}</span>
        </div>
        ${bar(lv.progress)}
      </div>

      <div class="stat-grid">
        <div class="stat"><div class="k">Mentorlikda daromad</div><div class="v num">${money(st.income)}</div><div class="d num">${goal ? `Maqsad ${money(goal)} · ${pct(st.incomePct)}` : 'Maqsad kiritilmagan'}</div>${goal ? bar(st.incomePct, 'var(--ok)') : ''}</div>
        <div class="stat"><div class="k">Obunachilar</div><div class="v num">${fmt(st.lastSubs)}</div><div class="d num ${st.growth > 0 ? 'up' : ''}">${st.growth !== null ? (st.growth >= 0 ? '+' : '') + fmt(st.growth) + ' o\'sish' : 'Boshl. ' + fmt(G.num(s.startFollowers))}</div></div>
        <div class="stat"><div class="k">O'rtacha qamrov</div><div class="v num">${compact(st.avgReach)}</div><div class="d num">Eng yuqori ${compact(st.maxReach)}</div></div>
        <div class="stat"><div class="k">Chellenj bali</div><div class="v num">${pct(st.challenge)}</div><div class="d num">Reels ${pct(st.videoPct)} · Stories ${pct(st.storiesPct)}</div></div>
      </div>
    </div>

    <div class="section-title"><h2>Nishonlar</h2><span class="faint small num">${st.badges.length} / ${G.BADGES.length}</span></div>
    <div class="card"><div class="badges">${G.BADGES.map((b) => `<div class="badge ${st.badges.includes(b.id) ? '' : 'locked'}" title="${esc(b.desc)}"><div class="ic">${ic(st.badges.includes(b.id) ? b.icon : b.icon)}</div>${b.name}</div>`).join('')}</div></div>

    ${networkSection(s, st)}

    <div class="section-title"><h2>Davomat</h2><span class="faint small num">${st.attended} / ${ctx.lessonsHeld} · ${pct(st.attPct)}</span></div>
    <div class="card"><div class="dots">${s.att.map(attDot).join('')}</div>
      <div class="dots-legend"><span><i style="background:var(--ink)"></i>Jonli</span><span><i style="background:linear-gradient(135deg,var(--ink) 50%,var(--surface-2) 50%)"></i>Yozuv</span><span><i style="background:var(--bad-soft);box-shadow:inset 0 0 0 1.5px var(--bad)"></i>Kelmagan</span></div></div>

    <div class="section-title"><h2>Vazifalar</h2><span class="faint small num">${st.hwDone} / ${ctx.hwAssigned} · ${pct(st.hwPct)}</span></div>
    <div class="card"><div class="dots">${s.hw.map(hwDot).join('')}</div></div>

    <div class="section-title"><h2>Haftalik natijalar</h2></div>
    <div class="card flush scroll-x"><table class="wk">
      <thead><tr><th>Hafta</th><th>Reels</th><th>Stories</th><th>Ko'rish</th><th>Qamrov</th><th>Obunachi</th><th>Daromad</th><th>XP</th></tr></thead>
      <tbody>${weeks.map((w) => `<tr>
        <td>${w + 1}</td>
        <td style="color:${G.num(s.video[w]) >= S.videoNorm[w] ? 'var(--ok)' : 'inherit'}">${G.has(s.video[w]) ? fmt(G.num(s.video[w])) : '—'}<span class="faint">/${S.videoNorm[w]}</span></td>
        <td style="color:${G.num(s.stories[w]) >= S.storiesNorm[w] ? 'var(--ok)' : 'inherit'}">${G.has(s.stories[w]) ? fmt(G.num(s.stories[w])) : '—'}<span class="faint">/${S.storiesNorm[w]}</span></td>
        <td>${compact(G.num(s.views[w]))}</td>
        <td>${compact(G.num(s.reach[w]))}</td>
        <td>${G.has(s.subs[w]) ? fmt(G.num(s.subs[w])) : '—'}</td>
        <td>${money(G.num(s.income[w]))}</td>
        <td class="xp">${st.weekly[w] ? '+' + st.weekly[w] : '—'}</td></tr>`).join('')}</tbody>
    </table></div>

    <div class="section-title"><h2>XP qayerdan</h2></div>
    <div class="card xp-list">${bdRows.map(([k, v]) => `<div class="xp-item"><span class="k">${k}</span>${bar(v / bdMax)}<span class="v num">${fmt(v)}</span></div>`).join('')}</div>

    <div class="section-title"><h2>Instagram</h2></div>
    <div class="card soon">
      <div class="ic">${ic('sparkles')}</div>
      <div><div style="font-weight:800">AI agent kuzatadi</div>
      <div class="small muted" style="margin-top:4px">${s.instagram ? `Har dushanba @${esc(s.instagram)} profilidan o'tgan haftadagi reels soni, ko'rishlari va obunachilar soni o'zi yoziladi.` : "Agent ishlashi uchun anketaga Instagram akkauntini kiriting."}</div>
      <div class="small faint num" style="margin-top:6px">${igStudentNote(s)}</div></div>
    </div>`;
  }

  // ---------- KIRITISH ----------
  const METRICS = {
    video: { label: 'Reels', hint: 'Shu haftadagi reels/video soni' },
    stories: { label: 'Stories', hint: 'Shu haftadagi stories liniyalar soni' },
    views: { label: "Ko'rishlar", hint: "Shu haftada qo'yilgan reels'lar ko'rishlari · agent yozadi" },
    reach: { label: 'Qamrov', hint: 'Profil qamrovi (охват)' },
    subs: { label: 'Obunachi', hint: 'Hafta oxiridagi umumiy obunachilar' },
    income: { label: 'Daromad $', hint: 'Blog orqali kelgan daromad, $' },
  };

  function input() {
    const { ctx, rows } = calc;
    const S = data.settings;
    if (ui.lesson === null) ui.lesson = Math.min(ctx.lessonsHeld, S.lessons - 1);
    if (ui.hwLesson === null) ui.hwLesson = Math.min(ctx.hwAssigned, S.lessons - 1);
    if (ui.week === null) ui.week = Math.max(0, ctx.weeksElapsed - 1);
    const subs = { att: 'Davomat', hw: 'Vazifalar', week: 'Haftalik raqamlar' };
    topbar('Kiritish', subs[ui.mode] + ' · avtomatik saqlanadi');

    const seg = `<div class="seg">${Object.entries(subs).map(([k, v]) => `<button class="${ui.mode === k ? 'on' : ''}" data-act="mode" data-v="${k}">${k === 'week' ? 'Haftalik' : v}</button>`).join('')}</div>`;
    let tools = '', body = '';

    if (ui.mode === 'att' || ui.mode === 'hw') {
      const key = ui.mode;
      const L = key === 'att' ? ui.lesson : ui.hwLesson;
      const filled = (i) => rows.some((r) => G.has(r.s[key][i]));
      tools = `<div class="chips" data-scroll="lessons">${Array.from({ length: S.lessons }, (_, i) => `<button class="chip ${i === L ? 'on' : ''} ${filled(i) ? 'done' : ''}" data-act="lesson" data-v="${i}">${i + 1}-dars</button>`).join('')}</div>`;
      const cnt = rows.filter((r) => G.num(r.s[key][L]) > 0).length;
      tools += `<div class="summary"><span>${key === 'att' ? 'Kelganlar' : 'Topshirganlar'}: <b class="num">${cnt} / ${rows.length}</b></span>
        <button class="btn sm ghost" data-act="bulk" data-v="${key}">${key === 'att' ? 'Hammasi jonli' : 'Hammasi topshirdi'}</button></div>`;
      body = rows.map((r) => {
        const v = G.num(r.s[key][L]);
        const ctrl = key === 'att'
          ? `<div class="tri">
              <button class="${v === null || v === 0 ? 'on' : ''}" data-act="att" data-id="${r.s.id}" data-v="">Yo'q</button>
              <button class="${v > 0 && v < 1 ? 'on' : ''}" data-act="att" data-id="${r.s.id}" data-v="0.5">Yozuv</button>
              <button class="${v >= 1 ? 'on live' : ''}" data-act="att" data-id="${r.s.id}" data-v="1">Jonli</button></div>`
          : `<button class="toggle ${v > 0 ? 'on' : ''}" data-act="hw" data-id="${r.s.id}" aria-label="Topshirdi"></button>`;
        return `<div class="row"><div class="main"><div class="name">${esc(r.s.name)}</div><div class="meta num">${key === 'att' ? `${pct(r.st.attPct)} davomat` : `${r.st.hwDone}/${ctx.hwAssigned} topshirgan`}</div></div>${ctrl}</div>`;
      }).join('');
    } else {
      const W = ui.week, M = ui.metric;
      const wFilled = (w) => rows.some((r) => WEEKLY.some((k) => G.has(r.s[k][w])));
      tools = `<div class="chips" data-scroll="weeks">${Array.from({ length: S.weeks }, (_, w) => `<button class="chip ${w === W ? 'on' : ''} ${wFilled(w) ? 'done' : ''}" data-act="week" data-v="${w}">${w + 1}-hafta</button>`).join('')}</div>
        <div class="chips">${Object.entries(METRICS).map(([k, m]) => `<button class="chip ${k === M ? 'on' : ''}" data-act="metric" data-v="${k}">${m.label}</button>`).join('')}</div>
        <div class="summary"><span class="norm-note">${METRICS[M].hint}${M === 'video' ? ` · norma <b>${S.videoNorm[W]}</b>` : M === 'stories' ? ` · norma <b>${S.storiesNorm[W]}</b>` : ''}</span><span id="wsum" class="num">${weekSum(M, W)}</span></div>`;
      body = rows.map((r) => {
        const v = r.s[M][W];
        let ph = '0';
        if (M === 'subs') { const prev = r.s.subs.slice(0, W).filter(G.has).pop(); ph = fmt(G.num(prev ?? r.s.startFollowers)) || '0'; }
        const met = (M === 'video' && G.num(v) >= S.videoNorm[W]) || (M === 'stories' && G.num(v) >= S.storiesNorm[W]);
        return `<div class="row">
          <div class="main"><div class="name">${esc(r.s.name)}</div><div class="meta num" data-wxp="${r.s.id}">${r.st.weekly[W] ? `<span class="xp">+${r.st.weekly[W]} XP</span> shu hafta` : 'shu hafta XP yo\'q'}</div></div>
          <input class="num-input ${met ? 'met' : ''}" inputmode="${M === 'income' ? 'decimal' : 'numeric'}" enterkeyhint="next" data-act="num" data-id="${r.s.id}" value="${G.has(v) ? G.num(v) : ''}" placeholder="${ph === '—' ? '0' : ph}" aria-label="${esc(r.s.name)} ${METRICS[M].label}">
        </div>`;
      }).join('');
    }
    return `<div class="sticky-tools">${seg}${tools}</div><div class="card flush list">${body || '<div class="empty">O\'quvchi yo\'q</div>'}</div>`;
  }
  function weekSum(M, W) {
    const t = calc.rows.reduce((a, r) => a + (G.num(r.s[M][W]) || 0), 0);
    const n = calc.rows.filter((r) => G.has(r.s[M][W])).length;
    const v = M === 'income' ? money(t) : M === 'reach' || M === 'views' ? compact(t) : fmt(t);
    return `${n}/${calc.rows.length} · <b>${M === 'subs' ? '' : 'jami ' + v}</b>`;
  }

  // ---------- REYTING ----------
  const CATS = {
    xp: { label: 'XP', val: (st) => st.xp, show: (st) => `${fmt(st.xp)} XP`, sub: (st) => st.level.name },
    income: { label: 'Daromad', val: (st) => st.income, show: (st) => money(st.income) },
    growth: { label: "O'sish", val: (st) => st.growth || 0, show: (st) => '+' + fmt(st.growth) },
    views: { label: "Ko'rishlar", val: (st) => st.totalViews, show: (st) => compact(st.totalViews) },
    reach: { label: 'Qamrov', val: (st) => st.avgReach || 0, show: (st) => compact(st.avgReach) },
    hw: { label: 'Vazifa', val: (st) => st.hwPct || 0, show: (st) => pct(st.hwPct) },
    att: { label: 'Davomat', val: (st) => st.attPct || 0, show: (st) => pct(st.attPct) },
    network: { label: 'Networking', val: (st) => st.network.contacts, show: (st) => `${st.network.contacts} ta`, sub: (st) => `${st.network.fields} soha · ${st.network.results} natija` },
    challenge: { label: 'Chellenj', val: (st) => st.challenge || 0, show: (st) => pct(st.challenge) },
    track: { label: 'Treklar' },
  };
  function top() {
    topbar('Reyting', 'Avtomatik — har kiritishda yangilanadi');
    const chips = `<div class="chips">${Object.entries(CATS).map(([k, c]) => `<button class="chip ${ui.topCat === k ? 'on' : ''}" data-act="cat" data-v="${k}">${c.label}</button>`).join('')}</div>`;
    if (ui.topCat === 'track') return `<div class="stack">${chips}${trackBoard()}</div>`;
    const c = CATS[ui.topCat];
    const list = calc.rows.filter((r) => c.val(r.st) > 0).sort((a, b) => c.val(b.st) - c.val(a.st));
    const rest = list.slice(3);
    return `<div class="stack">${chips}
      <div class="card">${podiumHtml(list.slice(0, 3), (r) => c.show(r.st))}</div>
      ${rest.length ? `<div class="card flush list">${rest.map((r, i) => `<a class="row" href="#/s/${r.s.id}"><span class="rank num">${i + 4}</span>${avatar(r.s, r.st)}<div class="main"><div class="name">${esc(r.s.name)}</div><div class="meta">${c.sub ? c.sub(r.st) : r.st.level.name}</div></div><div class="end big num">${c.show(r.st)}</div></a>`).join('')}</div>` : ''}
      ${!list.length ? '<div class="empty">Bu ko\'rsatkich bo\'yicha hali natija yo\'q</div>' : ''}
    </div>`;
  }
  function trackBoard() {
    const groups = {};
    calc.rows.forEach((r) => { const t = r.s.track || '—'; (groups[t] = groups[t] || []).push(r); });
    const list = Object.entries(groups).filter(([t]) => t !== '—').map(([t, rs]) => ({
      t, n: rs.length, xp: avg(rs.map((r) => r.st.xp)), income: rs.reduce((a, r) => a + r.st.income, 0), hw: avg(rs.map((r) => r.st.hwPct)),
    })).sort((a, b) => b.xp - a.xp);
    const max = Math.max(1, ...list.map((g) => g.xp));
    const none = groups['—'] ? `<div class="faint small" style="padding:0 4px">Trek belgilanmagan: ${groups['—'].length} kishi</div>` : '';
    return `<div class="card flush list">${list.map((g, i) => `<div class="row" style="display:grid;gap:8px;grid-template-columns:auto 1fr auto">
        <span class="rank num ${i === 0 ? 'r1' : ''}">${i + 1}</span>
        <div class="main"><div class="name">Trek ${esc(g.t)}</div><div class="meta num">${g.n} kishi · ${money(g.income)} · vazifa ${pct(g.hw)}</div><div style="margin-top:8px">${bar(g.xp / max)}</div></div>
        <div class="end"><div class="big num">${fmt(g.xp)}</div><div class="faint small">o'rt. XP</div></div></div>`).join('')}</div>${none}`;
  }

  // ---------- KO'PROQ ----------
  function more() {
    const S = data.settings;
    const X = G.XP;
    const prefs = getPrefs();
    const archived = data.students.filter((s) => s.archived);
    const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    topbar("Ko'proq", 'Sozlamalar, ball tizimi va ma\'lumotlar');
    return `
    ${standalone ? '' : `<div class="card soon" style="border-style:solid;background:var(--surface)">
      <div class="ic">${ic('phone')}</div>
      <div style="flex:1"><div style="font-weight:800">Telefonga o'rnatish</div>
      <div class="small muted" style="margin:4px 0 10px">${isIOS ? 'Safari\'da «Ulashish» → «Bosh ekranga qo\'shish» ni bosing.' : 'Ilova bosh ekranda alohida ochiladi va internetsiz ham ishlaydi.'}</div>
      ${isIOS ? '' : `<button class="btn sm" data-act="install" ${installPrompt ? '' : 'disabled'}>${ic('download')}O'rnatish</button>`}</div></div>`}

    <div class="section-title"><h2>Kurs</h2></div>
    <div class="card stack">
      <div class="field"><label>Kurs nomi</label><input data-set="courseName" value="${esc(S.courseName)}"></div>
      <div class="field"><label>1-hafta boshlangan kun (dushanba)</label><input type="date" data-set="startDate" value="${esc(S.startDate)}"></div>
      <div class="field"><label>Mavzu</label>
        <div class="seg">${[['auto', 'Avto'], ['light', "Yorug'"], ['dark', "Qorong'i"]].map(([k, l]) => `<button class="${(prefs.theme || 'auto') === k ? 'on' : ''}" data-act="theme" data-v="${k}">${l}</button>`).join('')}</div></div>
    </div>

    <div class="section-title"><h2>Haftalik norma</h2></div>
    <div class="card flush scroll-x"><table class="wk"><thead><tr><th>Hafta</th>${S.videoNorm.map((_, i) => `<th>${i + 1}</th>`).join('')}</tr></thead><tbody>
      <tr><td>Reels</td>${S.videoNorm.map((v, i) => `<td><input class="num-input" style="width:44px;height:34px;padding:0 6px;text-align:center;font-size:14px" inputmode="numeric" data-norm="videoNorm" data-i="${i}" value="${v}"></td>`).join('')}</tr>
      <tr><td>Stories</td>${S.storiesNorm.map((v, i) => `<td><input class="num-input" style="width:44px;height:34px;padding:0 6px;text-align:center;font-size:14px" inputmode="numeric" data-norm="storiesNorm" data-i="${i}" value="${v}"></td>`).join('')}</tr>
    </tbody></table></div>

    <div class="section-title"><h2>Ball tizimi</h2></div>
    <div class="card flush rules">
      <div class="r"><span>Jonli dars / yozuvni ko'rish</span><b class="xp">+${X.live} / +${X.record} XP</b></div>
      <div class="r"><span>Vazifa topshirish</span><b class="xp">+${X.homework} XP</b></div>
      <div class="r"><span>Har bir reels · norma bajarilsa</span><b class="xp">+${X.video} · +${X.videoNorm} XP</b></div>
      <div class="r"><span>Har bir stories liniya · norma</span><b class="xp">+${X.story} · +${X.storyNorm} XP</b></div>
      <div class="r"><span>Daromad (haftasiga max ${X.incomeWeekCap} XP)</span><b class="xp">$${X.usdPerXp} = 1 XP</b></div>
      <div class="r"><span>Birinchi sotuv bonusi</span><b class="xp">+${X.firstSale} XP</b></div>
      <div class="r"><span>Obunachi o'sishi</span><b class="xp">${X.subsPerXp} ta = 1 XP</b></div>
      <div class="r"><span>Haftalik qamrov: 1K / 10K / 100K / 1M</span><b class="xp">+15 / 20 / 25 / 30</b></div>
      <div class="r"><span>Haftalik reels ko'rishlari: 1K / 10K / 100K / 1M</span><b class="xp">+15 / 20 / 25 / 30</b></div>
      <div class="r"><span>Networking: tanishuv · xulosa · natija</span><b class="xp">+${X.contact} · +${X.takeaway} · +${X.netResult}</b></div>
    </div>

    <div class="section-title"><h2>Darajalar</h2></div>
    <div class="card flush rules">${G.LEVELS.map((l, i) => `<div class="r"><span><b style="color:var(--ink)">${i + 1}</b> · ${l.name}</span><b class="num">${fmt(l.min)} XP</b></div>`).join('')}</div>

    <div class="section-title"><h2>Holat qoidasi</h2></div>
    <div class="card flush rules">${Object.entries(G.STATUSES).map(([k, v]) => `<div class="r">${statusChip(k)}<span style="text-align:right">${v.hint}</span></div>`).join('')}</div>

    <div class="section-title"><h2>Instagram agent</h2></div>
    <div class="card stack">
      <div style="display:flex;gap:14px;align-items:flex-start">
        <div class="ic" style="width:42px;height:42px;border-radius:13px;background:var(--accent-soft);color:var(--accent);display:grid;place-items:center;flex:none">${ic('sparkles')}</div>
        <div><div style="font-weight:800">Reels va obunachilar avtomatik</div>
        <div class="small muted" style="margin-top:4px">Har dushanba AI agent o'tgan haftada (dushanba–yakshanba) qo'yilgan reels'lar soni, ko'rishlari va obunachilarni yozadi.</div>
        <div class="small faint num" style="margin-top:6px">${igStatus()}</div></div>
      </div>
      <button class="btn ghost block" data-act="ig-sync">${ic('refresh')}Hozir yangilash</button>
    </div>

    <div class="section-title"><h2>Ma'lumotlar</h2></div>
    <div class="card stack">
      <div class="small muted">Ma'lumotlar shu qurilmada saqlanadi. Boshqa telefonga o'tkazish uchun nusxa oling va u yerda yuklang.</div>
      <div class="grid2">
        <button class="btn ghost" data-act="export-json">${ic('download')}Nusxa olish</button>
        <label class="btn ghost">${ic('upload')}Yuklash<input type="file" accept="application/json,.json" id="import" hidden></label>
      </div>
      <button class="btn ghost block" data-act="export-csv">${ic('file')}Excel uchun CSV</button>
      <button class="btn danger block" data-act="reset">${ic('refresh')}Jadvaldagi asl holatga qaytarish</button>
    </div>

    ${archived.length ? `<div class="section-title"><h2>Arxiv</h2></div>
    <div class="card flush list">${archived.map((s) => `<div class="row"><div class="avatar">${initial(s.name)}</div><div class="main"><div class="name">${esc(s.name)}</div></div><button class="btn sm ghost" data-act="restore" data-id="${s.id}">Qaytarish</button></div>`).join('')}</div>` : ''}

    <div class="section-title"><h2>Tez kunda</h2></div>
    <div class="stack">
      <div class="card soon"><div class="ic">${ic('cloud')}</div><div><div style="font-weight:800">Bulutli sinxronizatsiya</div><div class="small muted" style="margin-top:4px">Bir nechta kurator bitta bazada, real vaqtda ishlaydi.</div></div></div>
    </div>`;
  }

  // ---------- NETWORKING ----------
  const NET_RESULTS = {
    none: "Hali natija yo'q", advice: 'Maslahat oldi', collab: 'Kollab kontent', partner: 'Hamkorlik',
    client: 'Mijoz / sotuv', mentor: 'Mentor topdi', other: 'Boshqa natija',
  };
  const NET_FIELDS = ['Marketing', 'Dizayn', 'IT', 'Biznes', "Ta'lim", 'Moliya', 'Media', 'Savdo', 'Tibbiyot', 'Huquq', 'Fotografiya', 'Kursdosh'];
  function todayISO() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
  function netKids(s, pid) {
    return s.network.filter((n) => (n.parentId || '') === (pid || '')).sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  }

  function networkSection(s, st) {
    const N = st.network;
    const fields = {};
    s.network.forEach((n) => { const f = (n.field || '').trim(); if (f) fields[f] = (fields[f] || 0) + 1; });
    const node = (n) => {
      const ch = netKids(s, n.id);
      return `<li><button class="node" data-act="net-open" data-id="${s.id}" data-nid="${n.id}">
          <div class="node-top"><b>${esc(n.name)}</b>${n.field ? `<span class="tag soft">${esc(n.field)}</span>` : ''}</div>
          <div class="node-take ${n.takeaway ? '' : 'faint'}">${n.takeaway ? esc(n.takeaway) : 'Xulosa hali yozilmagan'}</div>
          ${n.result && n.result !== 'none' ? `<div class="node-res">${ic('check')}${NET_RESULTS[n.result] || ''}${n.resultNote ? ' · ' + esc(n.resultNote) : ''}</div>` : ''}
        </button>${ch.length ? `<ul>${ch.map(node).join('')}</ul>` : ''}</li>`;
    };
    return `
    <div class="section-title"><h2>Networking</h2>${s.network.length ? `<button data-act="net-share" data-id="${s.id}">Ulashish →</button>` : ''}</div>
    <div class="card stack">
      <div class="net-stats num">
        <div><b>${N.contacts}</b><span>Tanishuv</span></div>
        <div><b>${N.fields}</b><span>Soha</span></div>
        <div><b>${N.takeaways}</b><span>Xulosa</span></div>
        <div><b>${N.results}</b><span>Natija</span></div>
      </div>
      ${Object.keys(fields).length ? `<div class="net-fields">${Object.entries(fields).sort((a, b) => b[1] - a[1]).map(([f, c]) => `<span class="link-chip">${esc(f)}<b class="num">${c}</b></span>`).join('')}</div>` : ''}
      <div class="tree">
        <div class="tree-root">${avatar(s, st)}<div><div style="font-weight:800">${esc(s.name)}</div><div class="small faint">${N.contacts ? `${N.contacts} ta tanishuv · ${N.depth} bosqichli daraxt` : "Kurs davomida turli soha egalari bilan tanishing: kim bilan, qanday xulosa oldingiz va nima natija berdi."}</div></div></div>
        ${s.network.length ? `<ul>${netKids(s, '').map(node).join('')}</ul>` : ''}
      </div>
      <button class="btn ghost block" data-act="net-add" data-id="${s.id}">${ic('plus')}Tanishuv qo'shish</button>
    </div>`;
  }

  function netSheet(sid, nid, parentId) {
    const s = byId(sid);
    const n = nid ? s.network.find((x) => x.id === nid) : { name: '', field: '', peerId: '', parentId: parentId || '', date: todayISO(), takeaway: '', result: 'none', resultNote: '' };
    if (!n) return;
    // O'zi va o'zidan tarqalgan tanishuvlar "kim orqali" ro'yxatiga kirmaydi (aylana bo'lmasligi uchun)
    const blocked = new Set();
    if (nid) { const walk = (id) => { blocked.add(id); s.network.filter((x) => x.parentId === id).forEach((x) => walk(x.id)); }; walk(nid); }
    const parents = s.network.filter((x) => !blocked.has(x.id));
    const peers = data.students.filter((x) => x.id !== sid && !x.archived);
    const v = (k) => esc(n[k] ?? '');
    const el = document.createElement('div');
    el.className = 'overlay';
    el.innerHTML = `<form class="sheet stack">
      <div class="grab"></div>
      <h3>${nid ? 'Tanishuv' : parentId ? `${esc((s.network.find((x) => x.id === parentId) || {}).name || '')} orqali tanishuv` : 'Yangi tanishuv'}</h3>
      <div class="field"><label>Kursdoshmi?</label><select name="peerId"><option value="">Yo'q — tashqi odam</option>${peers.map((p) => `<option value="${p.id}" ${n.peerId === p.id ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</select></div>
      <div class="grid2">
        <div class="field"><label>Ism</label><input name="name" value="${v('name')}" placeholder="Dilshod Karimov"></div>
        <div class="field"><label>Soha</label><input name="field" list="net-fields" value="${v('field')}" placeholder="Marketing"></div>
        <div class="field"><label>Kim orqali tanishdi</label><select name="parentId"><option value="">O'zi bevosita</option>${parents.map((p) => `<option value="${p.id}" ${n.parentId === p.id ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</select></div>
        <div class="field"><label>Sana</label><input type="date" name="date" value="${v('date')}"></div>
      </div>
      <datalist id="net-fields">${NET_FIELDS.map((f) => `<option value="${esc(f)}">`).join('')}</datalist>
      <div class="field"><label>Qanday xulosa oldi?</label><textarea name="takeaway" placeholder="Masalan: reels'ning birinchi 3 soniyasi hal qiladi — savol bilan boshlash kerak">${v('takeaway')}</textarea></div>
      <div class="grid2">
        <div class="field"><label>Natija</label><select name="result">${Object.entries(NET_RESULTS).map(([k, l]) => `<option value="${k}" ${n.result === k ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
        <div class="field"><label>Natija haqida</label><input name="resultNote" value="${v('resultNote')}" placeholder="2 ta kollab reels"></div>
      </div>
      <button class="btn block" type="submit">Saqlash</button>
      ${nid ? `<div class="grid2">
        <button class="btn ghost" type="button" data-net="child">${ic('network')}Shu orqali</button>
        <button class="btn danger" type="button" data-net="delete">${ic('trash')}O'chirish</button></div>` : ''}
    </form>`;
    const close = () => el.remove();
    el.addEventListener('click', (e) => {
      if (e.target === el) return close();
      const b = e.target.closest('[data-net]');
      if (!b) return;
      if (b.dataset.net === 'child') { close(); netSheet(sid, null, nid); }
      if (b.dataset.net === 'delete' && confirm(`«${n.name}» bilan tanishuv o'chirilsinmi? Uning orqali tanishganlar bir bosqich yuqoriga ko'chadi.`)) {
        s.network.forEach((x) => { if (x.parentId === nid) x.parentId = n.parentId || ''; });
        s.network = s.network.filter((x) => x.id !== nid);
        commit(sid); close(); render(true);
      }
    });
    el.querySelector('[name="peerId"]').addEventListener('change', (e) => {
      const p = byId(e.target.value);
      const f = el.querySelector('form');
      if (p) { f.name.value = f.name.value || p.name; f.field.value = f.field.value || 'Kursdosh'; }
    });
    el.querySelector('form').addEventListener('submit', (e) => {
      e.preventDefault();
      const f = new FormData(e.target);
      const peer = byId(f.get('peerId'));
      const rec = {
        name: f.get('name').trim() || (peer ? peer.name : ''),
        field: f.get('field').trim() || (peer ? 'Kursdosh' : ''),
        peerId: f.get('peerId'), parentId: f.get('parentId'), date: f.get('date'),
        takeaway: f.get('takeaway').trim(), result: f.get('result'), resultNote: f.get('resultNote').trim(),
      };
      if (!rec.name) { toast('Ismni kiriting'); return; }
      if (nid) Object.assign(n, rec);
      else s.network.push(Object.assign({ id: 'n' + Date.now().toString(36) }, rec));
      commit(sid); close(); render(true);
    });
    document.body.appendChild(el);
  }

  async function shareNetwork(sid) {
    const s = byId(sid);
    const lines = [];
    const walk = (pid, depth) => netKids(s, pid).forEach((n) => {
      const res = n.result && n.result !== 'none' ? ` → ${NET_RESULTS[n.result]}${n.resultNote ? ' (' + n.resultNote + ')' : ''}` : '';
      lines.push(`${'   '.repeat(depth)}• ${n.name}${n.field ? ' — ' + n.field : ''}${n.takeaway ? ': ' + n.takeaway : ''}${res}`);
      walk(n.id, depth + 1);
    });
    walk('', 0);
    const text = `${s.name} · networking (${data.settings.courseName})\n\n${lines.join('\n')}`;
    try {
      if (navigator.share) { await navigator.share({ text }); return; }
      await navigator.clipboard.writeText(text);
      toast('Nusxalandi — Telegram guruhga tashlang');
    } catch (e) { /* foydalanuvchi bekor qildi */ }
  }

  // ---------- o'quvchi formasi ----------
  function studentSheet(id) {
    const s = id ? byId(id) : { name: '', telegram: '', instagram: '', track: '', curator: '', startFollowers: null, startReach: null, startIncome: '', goal: null };
    const v = (k) => esc(s[k] ?? '');
    const el = document.createElement('div');
    el.className = 'overlay';
    el.innerHTML = `<form class="sheet stack" id="sform">
      <div class="grab"></div>
      <h3>${id ? 'Anketani tahrirlash' : "Yangi o'quvchi"}</h3>
      <div class="field"><label>Ism familiya</label><input name="name" required value="${v('name')}" placeholder="Aziza Karimova"></div>
      <div class="grid2">
        <div class="field"><label>Telegram</label><input name="telegram" value="${v('telegram')}" placeholder="aziza_k" autocapitalize="off"></div>
        <div class="field"><label>Instagram</label><input name="instagram" value="${v('instagram')}" placeholder="aziza.style" autocapitalize="off"></div>
        <div class="field"><label>Trek</label><select name="track">${['', 'A', 'B', 'C'].map((t) => `<option value="${t}" ${s.track === t ? 'selected' : ''}>${t || '—'}</option>`).join('')}</select></div>
        <div class="field"><label>Kurator</label><input name="curator" value="${v('curator')}" placeholder="Doston"></div>
        <div class="field"><label>Boshl. obunachi</label><input name="startFollowers" inputmode="numeric" value="${v('startFollowers')}"></div>
        <div class="field"><label>Boshl. qamrov</label><input name="startReach" inputmode="numeric" value="${v('startReach')}"></div>
        <div class="field"><label>Boshl. daromad ($)</label><input name="startIncome" value="${v('startIncome')}"></div>
        <div class="field"><label>Maqsad ($)</label><input name="goal" inputmode="numeric" value="${v('goal')}"></div>
      </div>
      <button class="btn block" type="submit">Saqlash</button>
      ${id ? `<button class="btn danger block" type="button" data-act="archive" data-id="${id}">${ic('archive')}Kursdan chiqarish (arxiv)</button>` : ''}
    </form>`;
    el.addEventListener('click', (e) => { if (e.target === el) el.remove(); });
    el.querySelector('form').addEventListener('submit', (e) => {
      e.preventDefault();
      const f = new FormData(e.target);
      const n = (k) => G.num(f.get(k));
      const patch = {
        name: f.get('name').trim(), telegram: f.get('telegram').trim().replace(/^@/, ''), instagram: f.get('instagram').trim().replace(/^@/, ''),
        track: f.get('track'), curator: f.get('curator').trim(), startFollowers: n('startFollowers'), startReach: n('startReach'),
        startIncome: f.get('startIncome').trim(), goal: n('goal'),
      };
      if (!patch.name) return;
      if (id) Object.assign(byId(id), patch);
      else {
        const S = data.settings;
        const blank = (len) => Array(len).fill(null);
        const nid = 's' + Date.now().toString(36);
        data.students.push(Object.assign({ id: nid, network: [], att: blank(S.lessons), hw: blank(S.lessons), reach: blank(S.weeks), subs: blank(S.weeks), income: blank(S.weeks), video: blank(S.weeks), stories: blank(S.weeks) }, patch));
        commit();
        el.remove();
        location.hash = '#/s/' + nid;
        toast(`${esc(patch.name)} qo'shildi`);
        return;
      }
      commit();
      el.remove();
      render(true);
      toast('Saqlandi');
    });
    document.body.appendChild(el);
    if (!id) setTimeout(() => el.querySelector('input').focus(), 250);
  }

  // ---------- eksport ----------
  function download(name, text, type) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type }));
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  function csv() {
    const head = ['№', 'Ism familiya', 'Telegram', 'Instagram', 'Trek', 'Kurator', 'Boshl. obunachi', 'Maqsad ($)', 'Hozirgi obunachi', "O'sish", "O'rtacha qamrov", 'Daromad ($)', 'Vazifa %', 'Davomat %', 'Chellenj %', 'Holat', 'XP', 'Daraja', 'Nishonlar', 'Tanishuvlar'];
    const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const p = (v) => (v === null ? '' : Math.round(v * 100));
    const lines = calc.rows.map((r, i) => [i + 1, r.s.name, r.s.telegram, r.s.instagram, r.s.track, r.s.curator, r.s.startFollowers, r.s.goal, r.st.lastSubs, r.st.growth, r.st.avgReach && Math.round(r.st.avgReach), r.st.income, p(r.st.hwPct), p(r.st.attPct), p(r.st.challenge), G.STATUSES[r.st.status].label, r.st.xp, r.st.level.name, r.st.badges.length, r.st.network.contacts].map(q).join(','));
    return '﻿' + [head.map(q).join(','), ...lines].join('\n');
  }

  // ---------- Instagram agent ma'lumotlari ----------
  // Agent data/instagram.json ga yozadi: weeks["2026-11-02"]["akkaunt"] = { followers, reels, views, checkedAt }
  const DAY = 864e5;
  function weekIndex(monday) {
    const a = Date.parse(monday + 'T00:00:00');
    const b = Date.parse(data.settings.startDate + 'T00:00:00');
    return Math.round((a - b) / (7 * DAY));
  }
  function when(iso) {
    const t = new Date(iso);
    if (Number.isNaN(t.getTime())) return iso;
    const hm = `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`;
    return `${t.getDate()}-${MONTHS[t.getMonth()]}, ${hm}`;
  }
  function handleKey(h) { return String(h || '').trim().replace(/^@/, '').toLowerCase(); }
  function igStatus() {
    const m = data.igMeta;
    if (!m || !m.updatedAt) return "Hali ma'lumot kelmagan";
    return `Oxirgi yozuv: ${when(m.updatedAt)} · ${m.profiles || 0} profil`;
  }
  function igStudentNote(s) {
    const m = data.igMeta && data.igMeta.byHandle && data.igMeta.byHandle[handleKey(s.instagram)];
    return m ? `Oxirgi tekshiruv: ${when(m)}` : '';
  }
  async function syncInstagram(manual) {
    let json = null;
    for (const url of [data.settings.igSource || IG_SOURCE, 'data/instagram.json']) {
      try {
        const res = await fetch(url + (url.startsWith('http') ? '?t=' + Date.now() : ''), { cache: 'no-store' });
        if (res.ok) { json = await res.json(); break; }
      } catch (e) { /* keyingi manbani sinaymiz */ }
    }
    if (!json || !json.weeks) { if (manual) toast("Instagram ma'lumotini olib bo'lmadi"); return; }
    const byHandle = {};
    data.students.forEach((s) => { if (s.instagram) byHandle[handleKey(s.instagram)] = s; });
    let changed = 0;
    const seen = {};
    Object.entries(json.weeks).forEach(([monday, profiles]) => {
      const w = weekIndex(monday);
      if (w < 0 || w >= data.settings.weeks) return;
      Object.entries(profiles).forEach(([h, v]) => {
        const s = byHandle[handleKey(h)];
        if (!s || !v) return;
        [['video', v.reels], ['views', v.views], ['subs', v.followers]].forEach(([k, val]) => {
          if (val === null || val === undefined) return;
          if (s[k][w] !== val) { s[k][w] = val; changed++; }
        });
        seen[handleKey(h)] = v.checkedAt || monday;
      });
    });
    data.igMeta = { updatedAt: json.updatedAt, profiles: Object.keys(seen).length, byHandle: seen };
    commit();
    if (changed || manual) {
      render(true);
      toast(changed ? `Instagram: ${changed} ta raqam yangilandi` : 'Instagram: yangi raqam yo\'q');
    }
  }

  // ---------- hodisalar ----------
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-act]');
    if (!t) return;
    const act = t.dataset.act, v = t.dataset.v, id = t.dataset.id;
    switch (act) {
      case 'filter': ui.filter = v; if (route().page === 'students') { e.preventDefault(); render(true); } break;
      case 'mode': ui.mode = v; render(); break;
      case 'lesson': if (ui.mode === 'att') ui.lesson = +v; else ui.hwLesson = +v; render(true); break;
      case 'week': ui.week = +v; render(true); break;
      case 'metric': ui.metric = v; render(true); break;
      case 'cat': ui.topCat = v; render(true); break;
      case 'att': byId(id).att[ui.lesson] = v === '' ? null : +v; commit(id); render(true); break;
      case 'hw': { const s = byId(id); s.hw[ui.hwLesson] = G.num(s.hw[ui.hwLesson]) > 0 ? null : 1; commit(id); render(true); break; }
      case 'bulk': {
        const L = v === 'att' ? ui.lesson : ui.hwLesson;
        calc.rows.forEach((r) => { r.s[v][L] = 1; });
        commit(); render(true); toast(`${L + 1}-dars: hammaga belgilandi`);
        break;
      }
      case 'new-student': studentSheet(); break;
      case 'edit-student': studentSheet(id); break;
      case 'archive':
        if (confirm("O'quvchi reyting va hisoblardan chiqariladi. Ma'lumotlari arxivda qoladi.")) {
          byId(id).archived = true; commit(); document.querySelector('.overlay')?.remove(); location.hash = '#/students';
        }
        break;
      case 'ig-sync': syncInstagram(true); break;
      case 'net-add': netSheet(id, null, t.dataset.parent || ''); break;
      case 'net-open': netSheet(id, t.dataset.nid); break;
      case 'net-share': shareNetwork(id); break;
      case 'restore': delete byId(id).archived; commit(); render(true); toast('Qaytarildi'); break;
      case 'theme': setPref('theme', v); applyTheme(); render(true); break;
      case 'install': if (installPrompt) { installPrompt.prompt(); installPrompt.userChoice.finally(() => { installPrompt = null; render(true); }); } break;
      case 'export-json': download(`trilogiya-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(data, null, 1), 'application/json'); break;
      case 'export-csv': download(`trilogiya-${new Date().toISOString().slice(0, 10)}.csv`, csv(), 'text/csv'); break;
      case 'reset':
        if (confirm("Barcha kiritilgan o'zgarishlar o'chadi va Google Sheet'dagi holat tiklanadi. Davom etasizmi?")) {
          data = normalize(clone(window.SEED)); commit(); render(); toast('Asl holat tiklandi');
        }
        break;
      default: break;
    }
  });

  document.addEventListener('input', (e) => {
    if (e.target.id === 'q') {
      ui.q = e.target.value;
      $('#slist').innerHTML = studentList();
    }
  });

  document.addEventListener('change', (e) => {
    const t = e.target;
    if (t.dataset.act === 'num') {
      const s = byId(t.dataset.id);
      const raw = t.value.trim();
      const n = raw === '' ? null : G.num(raw);
      if (raw !== '' && n === null) { t.value = ''; toast('Faqat raqam kiriting'); return; }
      s[ui.metric][ui.week] = n;
      commit(s.id);
      // Fokusni yo'qotmaslik uchun faqat shu qatorni yangilaymiz
      const r = rowOf(s.id);
      const S = data.settings;
      const met = (ui.metric === 'video' && n >= S.videoNorm[ui.week]) || (ui.metric === 'stories' && n >= S.storiesNorm[ui.week]);
      t.classList.toggle('met', !!met);
      const meta = document.querySelector(`[data-wxp="${s.id}"]`);
      if (meta) meta.innerHTML = r.st.weekly[ui.week] ? `<span class="xp">+${r.st.weekly[ui.week]} XP</span> shu hafta` : 'shu hafta XP yo\'q';
      const ws = $('#wsum'); if (ws) ws.innerHTML = weekSum(ui.metric, ui.week);
    } else if (t.dataset.set) {
      data.settings[t.dataset.set] = t.value.trim() || data.settings[t.dataset.set];
      commit(); toast('Saqlandi');
      if (t.dataset.set === 'startDate') syncInstagram(false);
    } else if (t.dataset.norm) {
      const n = G.num(t.value);
      if (n === null || n < 0) { t.value = data.settings[t.dataset.norm][+t.dataset.i]; return; }
      data.settings[t.dataset.norm][+t.dataset.i] = n;
      commit(); toast('Norma yangilandi');
    } else if (t.id === 'import' && t.files[0]) {
      t.files[0].text().then((txt) => {
        const d = JSON.parse(txt);
        if (!d || !Array.isArray(d.students) || !d.settings) throw new Error('format');
        data = normalize(d); commit(); render(); toast(`Yuklandi: ${calc.rows.length} o'quvchi`);
      }).catch(() => toast("Fayl formati noto'g'ri"));
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.dataset && e.target.dataset.act === 'num') {
      e.preventDefault();
      const all = [...document.querySelectorAll('[data-act="num"]')];
      const next = all[all.indexOf(e.target) + 1];
      if (next) next.focus(); else e.target.blur();
    }
  });

  function afterRender(page) {
    // tanlangan chipni ko'rinadigan joyga suramiz
    if (page === 'input') document.querySelectorAll('.chips').forEach((c) => {
      const on = c.querySelector('.chip.on');
      if (on) c.scrollLeft = on.offsetLeft - c.clientWidth / 2 + on.clientWidth / 2;
    });
  }

  function applyTheme() {
    const t = getPrefs().theme;
    if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t;
    else delete document.documentElement.dataset.theme;
  }

  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); installPrompt = e; if (route().page === 'more') render(true); });
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }

  applyTheme();
  render();
  syncInstagram(false);
})();

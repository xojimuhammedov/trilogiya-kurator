// Brauzer sahifasida ishlatiladigan skript (javascript tool orqali).
// 1) instagram.com/<akkaunt>/ sahifasida → obunachilar soni
// 2) instagram.com/<akkaunt>/reels/ sahifasida → har bir reels kodi va ko'rishlar matni
// Natija save.mjs ga shu holicha beriladi.
(() => {
  const out = { url: location.href, loggedIn: !!document.querySelector('a[href="/direct/inbox/"], svg[aria-label="Home"], svg[aria-label="Bosh sahifa"]') };

  // Obunachilar: havola ichidagi span[title] aniq sonni saqlaydi (ekranda "15,2K" bo'lsa ham)
  const fLink = document.querySelector('a[href$="/followers/"]');
  const fTitle = (fLink && fLink.querySelector('span[title]')) || document.querySelector('header span[title]');
  out.followers = fTitle ? fTitle.getAttribute('title') : null;
  if (!out.followers) {
    const og = document.querySelector('meta[property="og:description"]');
    const m = og && og.content.match(/^([\d.,\sKkMm]+)\s+Followers/);
    out.followers = m ? m[1].trim() : null;
  }

  // Reels: har bir katakdagi havola kodi va undagi ko'rishlar soni
  const seen = new Set();
  out.items = [...document.querySelectorAll('a[href*="/reel/"]')].map((a) => {
    const code = (a.getAttribute('href').match(/\/reel\/([^/?#]+)/) || [])[1];
    if (!code || seen.has(code)) return null;
    seen.add(code);
    const texts = [...a.querySelectorAll('span')].map((s) => s.textContent.trim()).filter((t) => /\d/.test(t));
    return { code, viewsText: texts[0] || null, allText: texts.join(' | ') || null };
  }).filter(Boolean);

  out.profileMissing = /isn.t available|not available|mavjud emas/i.test(document.title + document.body.innerText.slice(0, 400));
  return out;
})();

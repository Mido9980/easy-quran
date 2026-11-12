/* ================= EASY QURAN — نور =================
   تطبيق قرآن أوف لاين: نص عثماني + ١٢ ترجمة + بحث + محفوظات */
(function () {
'use strict';

const Q = window.QURAN;
const SURAHS = Q.surahs, JUZ = Q.juz;
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

/* ---------------- التخزين ---------------- */
const LS = {
  get(k, d) { try { const v = localStorage.getItem('eq.' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('eq.' + k, JSON.stringify(v)); } catch (e) {} }
};

/* ---------------- الحالة ---------------- */
const S = {
  lang: LS.get('ui', 'ar'),
  theme: LS.get('theme', 'emerald'),
  qfs: LS.get('qfs', 30),
  tfs: LS.get('tfs', 15),
  font: LS.get('font', 'amiri'),
  tr: LS.get('tr', 'ru.kuliev'),
  showTr: LS.get('showTr', true),
  last: LS.get('last', null),
  bm: LS.get('bm', []),
  view: 'home',
  sheetAyah: null,
  installEvt: null
};
if (!window.I18N[S.lang]) S.lang = 'ar';

const t = (k) => (window.I18N[S.lang] && window.I18N[S.lang][k]) || window.I18N.en[k] || k;
const dir = () => (window.I18N[S.lang].dir === 'rtl' ? 'rtl' : 'ltr');
const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';
function num(n) {
  const s = String(n);
  if (S.lang !== 'ar') return s;
  return s.replace(/[0-9]/g, (d) => AR_DIGITS[+d]);
}
const p2 = (n) => String(n).padStart(3, '0');
function ayahsWord(n) {
  const L = S.lang;
  if (L === 'ru') { const a = n % 10, b = n % 100;
    if (a === 1 && b !== 11) return 'аят';
    if (a >= 2 && a <= 4 && !(b >= 12 && b <= 14)) return 'аята';
    return 'аятов'; }
  if (L === 'en') return n === 1 ? 'verse' : 'verses';
  if (L === 'fr') return n === 1 ? 'verset' : 'versets';
  if (L === 'de') return n === 1 ? 'Vers' : 'Verse';
  if (L === 'es') return n === 1 ? 'aleya' : 'aleyas';
  if (L === 'tr') return 'ayet';
  if (L === 'id') return 'ayat';
  if (L === 'ur') return 'آیات';
  return t('ayahs');
}
const aw = (n) => num(n) + ' ' + ayahsWord(n);

/* ---------------- أيقونات ---------------- */
const I = {
  back: '<svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>',
  home: '<svg viewBox="0 0 24 24"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.8V21h14V9.8"/><path d="M9.5 21v-6h5v6"/></svg>',
  book: '<svg viewBox="0 0 24 24"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5A2.5 2.5 0 0 1 4 20.5z"/><path d="M8.5 7h7"/></svg>',
  search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.6-3.6"/></svg>',
  mark: '<svg viewBox="0 0 24 24"><path d="M6 3h12v18l-6-4.2L6 21z"/></svg>',
  set: '<svg viewBox="0 0 24 24"><path d="M4 7h10"/><path d="M18 7h2"/><circle cx="16" cy="7" r="2"/><path d="M4 17h4"/><path d="M12 17h8"/><circle cx="10" cy="17" r="2"/></svg>',
  globe: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3.6 9h16.8M3.6 15h16.8"/><path d="M12 3c2.5 2.5 3.6 5.6 3.6 9S14.5 18.5 12 21c-2.5-2.5-3.6-5.6-3.6-9S9.5 5.5 12 3z"/></svg>',
  moon: '<svg viewBox="0 0 24 24"><path d="M21 13.2A8.5 8.5 0 1 1 10.8 3 6.6 6.6 0 0 0 21 13.2z"/></svg>',
  trans: '<svg viewBox="0 0 24 24"><path d="M4 6h9M8.5 6v-2"/><path d="M11 6c0 4-2.6 7-6.5 9"/><path d="M6 10.5c1 2.2 2.8 3.9 5 4.7"/><path d="M13.5 20l3.7-9 3.7 9"/><path d="M15.4 16.6h5"/></svg>',
  chev: '<svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>',
  chevL: '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>',
  save: '<svg viewBox="0 0 24 24"><path d="M19 21l-7-4.5L5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>',
  copy: '<svg viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2.5"/><path d="M15 6V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h1"/></svg>',
  share: '<svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="19" r="2.6"/><path d="M8.4 10.8l7.2-4.2M8.4 13.2l7.2 4.2"/></svg>',
  play: '<svg viewBox="0 0 24 24"><path d="M7 4.5v15l13-7.5z"/></svg>',
  stop: '<svg viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>',
  x: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  down: '<svg viewBox="0 0 24 24"><path d="M12 4v12"/><path d="M7 11l5 5 5-5"/><path d="M5 21h14"/></svg>',
  arrowR: '<svg viewBox="0 0 24 24"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg>',
  arrowL: '<svg viewBox="0 0 24 24"><path d="M19 12H5"/><path d="M11 6l-6 6 6 6"/></svg>',
  info: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><path d="M12 7.6h.01"/></svg>'
};

/* ---------------- أدوات ---------------- */
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('on');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove('on'), 2000);
}
function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
const pad3 = (n) => String(n).padStart(3, '0');

/* ---------------- الترجمات ---------------- */
let trCache = window.TRANSLATIONS || (window.TRANSLATIONS = {});
let trLoading = {};
function trMeta(id) { return (window.TR_LIST || []).find((x) => x.id === id); }
function loadTr(id) {
  if (!id) return Promise.resolve(null);
  if (trCache[id]) return Promise.resolve(trCache[id]);
  const m = trMeta(id);
  if (!m) return Promise.resolve(null);
  if (trLoading[id]) return trLoading[id];
  trLoading[id] = new Promise((res, rej) => {
    const sc = document.createElement('script');
    sc.src = m.file;
    sc.onload = () => { trLoading[id] = null; res(trCache[id] || null); };
    sc.onerror = () => { trLoading[id] = null; rej(new Error('tr load fail')); };
    document.head.appendChild(sc);
  });
  return trLoading[id];
}
function ayahTr(s, a) {
  const id = S.tr;
  if (!id || !trCache[id]) return '';
  const i = flatIndex(s, a);
  return trCache[id].ayahs[i] || '';
}
let indexMap = null;
function buildIndexMap() {
  indexMap = new Int32Array(115 * 300);
  let i = 0;
  for (const su of SURAHS) { indexMap[su.n * 300 + 1] = i; i += su.count; }
}
function flatIndex(s, a) {
  if (!indexMap) buildIndexMap();
  return indexMap[s * 300 + 1] + (a - 1);
}

/* ---------------- التاريخ الهجري ---------------- */
function hijriDate() {
  try {
    const loc = S.lang === 'ar' ? 'ar-SA-u-ca-islamic-umalqura' : (S.lang + '-u-ca-islamic-umalqura');
    return new Intl.DateTimeFormat(loc, { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
  } catch (e) {
    return new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
  }
}

/* ---------------- تطبيق الإعدادات على الصفحة ---------------- */
const THEME_META = { emerald: '#04120F', midnight: '#060A16', sand: '#120D08', ivory: '#F6F1E6', rose: '#160A10' };
function applyChrome() {
  document.documentElement.lang = S.lang;
  document.documentElement.dir = dir();
  document.body.dataset.theme = S.theme;
  document.body.dataset.font = S.font;
  document.documentElement.style.setProperty('--qfs', S.qfs + 'px');
  document.documentElement.style.setProperty('--tfs', S.tfs + 'px');
  const meta = $('meta[name=theme-color]');
  if (meta) meta.setAttribute('content', THEME_META[S.theme] || '#04120F');
}

/* ---------------- التنقل ---------------- */
function parseHash() {
  const h = (location.hash || '#/home').replace(/^#\/?/, '');
  const p = h.split('/').filter(Boolean);
  return { name: p[0] || 'home', a: p[1], b: p[2] };
}
function go(path) {
  if (location.hash === '#' + path) render();
  else location.hash = path;
}
function setBar(title, sub, opts) {
  $('#barTitle').textContent = title;
  $('#barSub').textContent = sub || '';
  const back = $('#backBtn');
  const o = opts || {};
  back.hidden = !o.back;
  $('#trBtn').hidden = !o.tr;
  $('#themeBtn').hidden = !!o.noTheme;
}

/* ---------------- الصفحات ---------------- */
function viewHome() {
  S.view = 'home';
  setBar(t('app'), t('tagline'), { noTheme: false });
  const last = S.last && SURAHS[S.last.s - 1] ? S.last : null;
  const su = last ? SURAHS[last.s - 1] : null;
  const pct = last ? Math.min(100, Math.round((last.a / su.count) * 100)) : 0;

  let h = '';
  h += `<div class="hero">
    <div class="hero-bism">${esc(t('bismillah'))}</div>
    <div class="hero-t">${esc(t('app'))} · ${esc(t('tagline'))}</div>
    <div class="hero-date">${esc(hijriDate())}</div>
    <div class="hero-row">
      <button class="hero-btn" id="btnContinue">${I.play}${esc(last ? t('continue_reading') : t('start_reading'))}</button>
      <button class="hero-btn ghost" id="btnSearch">${I.search}${esc(t('search'))}</button>
    </div>
  </div>`;

  if (last) {
    h += `<div class="last-card" id="lastCard">
      <div class="ring" style="--p:${pct}"><b>${num(pct)}%</b></div>
      <div class="lc-t"><span>${esc(t('last_at'))}</span><b>${esc(su.name)}</b><i>${esc(t('ayah'))} ${num(last.a)} · ${esc(t('progress'))} ${num(pct)}%</i></div>
      <span class="go">${I.chev}</span>
    </div>`;
  }

  const quick = [
    { ic: I.book, tt: t('juz'), sub: num(30), go: '#/juz' },
    { ic: I.mark, tt: t('saved'), sub: num(S.bm.length), go: '#/saved' },
    { ic: I.trans, tt: t('trans_lang'), sub: trMeta(S.tr) ? trMeta(S.tr).short : t('no_translation'), go: '#/settings' }
  ];
  h += `<div class="sec"><h2>${esc(t('quick'))}</h2></div><div class="list">`;
  quick.forEach((q) => {
    h += `<a class="srow" href="${q.go}"><span class="num">${q.ic}</span><div class="txt"><b style="font-family:var(--font-ui);font-size:14px;font-weight:600">${esc(q.tt)}</b><small>${esc(q.sub)}</small></div><span class="chev">${I.chev}</span></a>`;
  });
  h += `</div>`;

  const featured = [1, 18, 36, 55, 67, 112];
  h += `<div class="sec"><h2>${esc(t('surahs'))}</h2><a class="cnt" href="#/index">${esc(t('all_surahs'))}</a></div><div class="list">`;
  featured.forEach((n) => { h += surahRow(SURAHS[n - 1]); });
  h += `</div>`;
  h += `<p class="foot-note">${esc(t('made'))}<br>${esc(t('version'))} 1.0</p>`;

  $('#app').innerHTML = `<div class="view">${h}</div>`;
  bindHome();
}

function surahRow(su) {
  return `<a class="srow" href="#/surah/${su.n}">
    <span class="num">${num(su.n)}</span>
    <div class="txt"><b>${esc(su.name)}</b><small>${esc(su.en)} · ${esc(aw(su.count))}</small></div>
    <div class="side"><span class="chip ${su.type === 'K' ? 'mk' : ''}">${su.type === 'K' ? esc(t('meccan')) : esc(t('medinan'))}</span></div>
    <span class="chev">${I.chev}</span>
  </a>`;
}

function viewIndex(tab) {
  S.view = 'index';
  setBar(t('mushaf'), t('all_surahs'));
  let h = `<div class="seg" id="idxSeg">
    <button data-t="surah" class="${tab !== 'juz' ? 'on' : ''}">${esc(t('surahs'))}</button>
    <button data-t="juz" class="${tab === 'juz' ? 'on' : ''}">${esc(t('juz'))}</button>
  </div>`;
  if (tab === 'juz') {
    h += `<div class="list">`;
    JUZ.forEach((j) => {
      const su = SURAHS[j.surah - 1];
      h += `<a class="srow" href="#/juz/${j.n}"><span class="num">${num(j.n)}</span>
        <div class="txt"><b style="font-family:var(--font-ui);font-size:14.5px;font-weight:600">${esc(t('juz_word'))} ${num(j.n)}</b>
        <small>${esc(su.name)} · ${esc(t('ayah'))} ${num(j.ayah)}</small></div><span class="chev">${I.chev}</span></a>`;
    });
    h += `</div>`;
  } else {
    h += `<div class="list">` + SURAHS.map(surahRow).join('') + `</div>`;
  }
  h += `<p class="foot-note">${esc(t('sources'))}: tanzil.net</p>`;
  $('#app').innerHTML = `<div class="view">${h}</div>`;
  $$('#idxSeg button').forEach((b) => b.onclick = () => go(b.dataset.t === 'juz' ? '/index/juz' : '/index'));
}

function ayahHTML(s, a, text, showTr) {
  const tr = showTr ? ayahTr(s, a) : '';
  const m = trMeta(S.tr);
  let out = `<div class="ayah" data-s="${s}" data-a="${a}" id="ay-${s}-${a}">
    <div class="ayah-ar">${esc(text)}<span class="an">${num(a)}</span></div>`;
  if (tr) out += `<div class="tr ${m && m.dir === 'rtl' ? 'rtl' : 'ltr'}">${esc(tr)}</div>`;
  out += `</div>`;
  return out;
}

function viewSurah(n, focusAyah) {
  const su = SURAHS[n - 1];
  if (!su) return go('/index');
  S.view = 'surah';
  setBar(su.name, `${su.type === 'K' ? t('meccan') : t('medinan')} · ${aw(su.count)}`, { back: true, tr: true });
  $('#trBtn').classList.toggle('on', !!(S.tr && S.showTr));

  const m = trMeta(S.tr);
  let h = `<div class="read-top"><div class="rt-t">${esc(t('surah'))} <b><bdi>${esc(su.name)}</bdi></b> · ${esc(aw(su.count))}${m ? ' · ' + esc(t('added_by')) + ': <bdi>' + esc(m.short) + '</bdi>' : ''}
      <div class="progress"><i id="prog"></i></div></div>
      <button class="ibtn" id="topList" aria-label="list">${I.book}</button></div>`;

  h += `<div class="surah-head"><div class="sh-name">${esc(su.name)}</div>
    <div class="sh-meta">${esc(su.en)}${su.enT && su.enT !== su.en ? ' · ' + esc(su.enT) : ''} · ${esc(aw(su.count))}</div>
    ${su.n !== 9 && su.n !== 1 ? `<div class="sh-bis">${esc(t('bismillah'))}</div>` : ''}</div>`;

  h += `<div class="ayat" id="ayat">`;
  su.ayahs.forEach((txt, i) => { h += ayahHTML(su.n, i + 1, txt, !!(S.tr && S.showTr)); });
  h += `</div>`;

  const prev = su.n > 1 ? SURAHS[su.n - 2] : null;
  const next = su.n < 114 ? SURAHS[su.n] : null;
  h += `<div class="read-foot">
    <button id="prevS" ${prev ? '' : 'disabled style="opacity:.45"'}>${dir() === 'rtl' ? I.arrowR : I.arrowL}${esc(prev ? t('prev_surah') : '—')}</button>
    <button id="nextS" ${next ? '' : 'disabled style="opacity:.45"'}>${esc(next ? t('next_surah') : '—')}${dir() === 'rtl' ? I.arrowL : I.arrowR}</button>
  </div>
  <p class="foot-note">${esc(t('tap_ayah_hint'))}</p>`;

  $('#app').innerHTML = `<div class="view">${h}</div>`;
  bindReading(su, focusAyah);
}

function viewJuz(n) {
  const jn = +n;
  if (!jn || jn < 1 || jn > 30) return go('/juz');
  S.view = 'juz';
  setBar(`${t('juz_word')} ${num(jn)}`, t('juz_list'), { back: true, tr: true });
  $('#trBtn').classList.toggle('on', !!(S.tr && S.showTr));

  const start = JUZ[jn - 1];
  const end = jn < 30 ? JUZ[jn] : null;
  const startS = start.surah, startA = start.ayah;
  const endS = end ? end.surah : 114, endA = end ? end.ayah : SURAHS[113].count;

  let h = `<div class="surah-head"><div class="sh-name">${esc(t('juz_word'))} ${num(jn)}</div>
    <div class="sh-meta"><bdi>${esc(SURAHS[startS - 1].name)}</bdi> ${num(startA)} → <bdi>${esc(SURAHS[endS - 1].name)}</bdi> ${num(end ? endA - 1 : SURAHS[113].count)}</div></div>`;
  h += `<div class="ayat" id="ayat">`;
  for (let s = startS; s <= endS; s++) {
    const su = SURAHS[s - 1];
    const from = s === startS ? startA : 1;
    const to = s === endS ? (end ? endA - 1 : su.count) : su.count;
    if (to < from) continue;
    h += `<div class="surah-div" style="text-align:center;margin:14px 0 4px;font-family:var(--font-q);font-size:20px;color:var(--gold)">${esc(su.name)}</div>`;
    for (let a = from; a <= to; a++) h += ayahHTML(s, a, su.ayahs[a - 1], !!(S.tr && S.showTr));
  }
  h += `</div><p class="foot-note">${esc(t('tap_ayah_hint'))}</p>`;
  $('#app').innerHTML = `<div class="view">${h}</div>`;
  bindReading(null, null, true);
}

function viewSearch(q0) {
  S.view = 'search';
  setBar(t('search'), t('search_ph'));
  const q = typeof q0 === 'string' ? q0 : '';
  $('#app').innerHTML = `<div class="view">
    <div class="field">${I.search}<input id="sq" type="search" placeholder="${esc(t('search_ph'))}" value="${esc(q)}" autocomplete="off">
      <button class="clear" id="sqClear" ${q ? '' : 'hidden'}>${I.x}</button></div>
    <div id="resBox"><p class="foot-note">${esc(t('search_hint'))}</p></div>
  </div>`;
  const inp = $('#sq');
  inp.focus();
  let timer = null;
  const run = () => {
    const qq = inp.value.trim();
    $('#sqClear').hidden = !qq;
    clearTimeout(timer);
    if (qq.length < 2) { $('#resBox').innerHTML = `<p class="foot-note">${esc(t('search_hint'))}</p>`; return; }
    timer = setTimeout(() => doSearch(qq), 220);
  };
  inp.oninput = run;
  $('#sqClear').onclick = () => { inp.value = ''; run(); inp.focus(); };
  if (q) run();
  inp.onkeydown = (e) => { if (e.key === 'Enter') { clearTimeout(timer); doSearch(inp.value.trim()); } };
}

const AR_DIAC = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g;
function normAr(s) {
  return s.replace(AR_DIAC, '').replace(/[ٱأإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه')
    .replace(/[ؤئ]/g, 'ء').replace(/[^\u0621-\u064Aa-zA-Z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}
function normTr(s) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim();
}
let searchIdx = { key: '', rows: null };
function buildSearchIndex() {
  const key = 'ar|' + S.tr;
  if (searchIdx.rows && searchIdx.key === key) return searchIdx.rows;
  const rows = [];
  for (const su of SURAHS) {
    for (let i = 0; i < su.count; i++) {
      const ar = normAr(su.ayahs[i]);
      let tr = '';
      if (S.tr && trCache[S.tr]) tr = normTr(trCache[S.tr].ayahs[flatIndex(su.n, i + 1)] || '');
      rows.push({ s: su.n, a: i + 1, ar: ar, tr: tr });
    }
  }
  searchIdx = { key: key, rows: rows };
  return rows;
}
function doSearch(q) {
  const box = $('#resBox');
  if (!box) return;
  const rows = buildSearchIndex();
  const tokensAr = normAr(q).split(' ').filter((x) => x.length > 1);
  const tokensTr = normTr(q).split(' ').filter((x) => x.length > 1);
  const plain = normAr(q);
  const out = [];
  for (const r of rows) {
    let hit = false;
    if (plain && r.ar.indexOf(plain) >= 0) hit = true;
    if (!hit && tokensAr.length && tokensAr.every((tk) => r.ar.indexOf(tk) >= 0)) hit = true;
    if (!hit && tokensTr.length && r.tr && tokensTr.every((tk) => r.tr.indexOf(tk) >= 0)) hit = true;
    if (hit) { out.push(r); if (out.length >= 150) break; }
  }
  if (!out.length) {
    box.innerHTML = `<div class="empty"><div class="e-ic">${I.search}</div><b>${esc(t('no_results'))}</b><p>${esc(t('search_hint'))}</p></div>`;
    return;
  }
  let h = `<div class="sec"><h2>${esc(t('results'))}</h2><span class="cnt">${num(out.length)}</span></div>`;
  out.forEach((r) => {
    const su = SURAHS[r.s - 1];
    const arText = su.ayahs[r.a - 1];
    const trText = ayahTr(r.s, r.a);
    h += `<a class="res" href="#/surah/${r.s}/${r.a}">
      <div class="rh"><span>${esc(su.name)} · ${esc(t('ayah'))} ${num(r.a)}</span><span class="tag">${r.s}:${r.a}</span></div>
      <div class="rt">${esc(arText)}</div>
      ${trText ? `<div class="rr">${esc(trText)}</div>` : ''}
    </a>`;
  });
  box.innerHTML = h;
}

function viewSaved() {
  S.view = 'saved';
  setBar(t('saved'), `${num(S.bm.length)}`);
  if (!S.bm.length) {
    $('#app').innerHTML = `<div class="view"><div class="empty"><div class="e-ic">${I.mark}</div>
      <b>${esc(t('saved_empty'))}</b><p>${esc(t('saved_empty_h'))}</p></div></div>`;
    return;
  }
  let h = `<div class="list">`;
  S.bm.slice().reverse().forEach((bm) => {
    const su = SURAHS[bm.s - 1];
    if (!su) return;
    const tr = ayahTr(bm.s, bm.a);
    h += `<div class="saved-item">
      <div class="si-h"><b>${esc(su.name)} · ${esc(t('ayah'))} ${num(bm.a)}</b>
        <button class="x" data-rm="${bm.s}:${bm.a}" aria-label="remove">${I.x}</button></div>
      <a href="#/surah/${bm.s}/${bm.a}"><div class="si-ar">${esc(su.ayahs[bm.a - 1])}</div>
      ${tr ? `<div class="si-tr">${esc(tr)}</div>` : ''}</a>
    </div>`;
  });
  h += `</div>`;
  $('#app').innerHTML = `<div class="view">${h}</div>`;
  $$('#app [data-rm]').forEach((b) => {
    b.onclick = (e) => {
      e.preventDefault(); e.stopPropagation();
      const [s, a] = b.dataset.rm.split(':').map(Number);
      S.bm = S.bm.filter((x) => !(x.s === s && x.a === a));
      LS.set('bm', S.bm); toast(t('removed_ok')); viewSaved();
    };
  });
}

function viewSettings() {
  S.view = 'settings';
  setBar(t('settings'), t('app'), { noTheme: true });
  const langs = Object.keys(window.I18N);
  const m = trMeta(S.tr);
  let h = '';

  h += `<div class="card"><h3>${I.moon} ${esc(t('appearance'))}</h3>
    <div class="swatches" id="sw">`;
  const themes = [
    ['emerald', '#0A241E', '#D9B465'], ['midnight', '#101A32', '#9DB7F5'],
    ['sand', '#231A10', '#D9A85F'], ['ivory', '#FFFDF7', '#A9812F'], ['rose', '#28121C', '#E7B86E']
  ];
  themes.forEach((th) => {
    h += `<button class="sw ${S.theme === th[0] ? 'on' : ''}" data-th="${th[0]}" style="background:${th[1]}"><i style="background:${th[2]}"></i></button>`;
  });
  h += `</div></div>`;

  h += `<div class="card"><h3>${I.book} ${esc(t('reading_settings'))}</h3>
    <div class="row" style="margin-bottom:12px"><span class="tiny">${esc(t('font_size'))}</span>
      <input id="fs" type="range" min="22" max="46" step="1" value="${S.qfs}"><span class="v">${num(S.qfs)}</span></div>
    <div class="row" style="margin-bottom:12px"><span class="tiny">${esc(t('trans_size'))}</span>
      <input id="ts" type="range" min="12" max="22" step="1" value="${S.tfs}"><span class="v">${num(S.tfs)}</span></div>
    <div class="chips" id="fontChips">
      <button data-f="amiri" class="${S.font === 'amiri' ? 'on' : ''}">${esc(t('amiri'))}</button>
      <button data-f="system" class="${S.font === 'system' ? 'on' : ''}">${esc(t('system_font'))}</button>
    </div>
    <div class="sample" id="sample" style="font-size:${Math.min(30, S.qfs)}px">${esc(t('bismillah'))}</div>
  </div>`;

  h += `<div class="card"><h3>${I.trans} ${esc(t('trans_lang'))}</h3>
    <select class="sel" id="trSel">
      <option value="" ${!S.tr ? 'selected' : ''}>${esc(t('no_translation'))}</option>`;
  (window.TR_LIST || []).forEach((x) => {
    h += `<option value="${x.id}" ${S.tr === x.id ? 'selected' : ''}>${esc(x.name)}</option>`;
  });
  h += `</select>
    <p class="tiny" style="margin-top:10px">${m ? esc(m.name) : esc(t('no_translation'))}</p></div>`;

  h += `<div class="card"><h3>${I.globe} ${esc(t('ui_lang'))}</h3><div class="chips" id="langChips">`;
  langs.forEach((lg) => {
    h += `<button data-lg="${lg}" class="${S.lang === lg ? 'on' : ''}">${esc(window.I18N[lg].flag + ' ' + window.I18N[lg].name)}</button>`;
  });
  h += `</div></div>`;

  h += `<div class="card"><h3>${I.down} ${esc(t('install'))}</h3>
    <p class="tiny">${esc(t('install_hint'))}</p>
    <div class="badge-off" style="margin-top:10px">● ${esc(t('offline_ok'))}</div>
    <button class="btn" id="installBtn" style="margin-top:12px;${S.installEvt ? '' : 'display:none'}">${esc(t('install'))}</button>
    <button class="btn ghost warn" id="clearBtn">${esc(t('clear_data'))}</button>
  </div>`;

  h += `<div class="card"><h3>${I.info} ${esc(t('about'))}</h3>
    <p class="tiny">${esc(t('sources_text'))}</p>
    <div class="divider"></div>
    <p class="tiny" style="text-align:center">${esc(t('made'))} · ${esc(t('version'))} 1.0</p>
  </div>`;

  $('#app').innerHTML = `<div class="view">${h}</div>`;

  $$('#sw .sw').forEach((b) => b.onclick = () => { S.theme = b.dataset.th; LS.set('theme', S.theme); applyChrome(); viewSettings(); });
  $('#fs').oninput = (e) => {
    S.qfs = +e.target.value; LS.set('qfs', S.qfs); applyChrome();
    e.target.parentNode.querySelector('.v').textContent = num(S.qfs);
    $('#sample').style.fontSize = Math.min(30, S.qfs) + 'px';
  };
  $('#ts').oninput = (e) => {
    S.tfs = +e.target.value; LS.set('tfs', S.tfs); applyChrome();
    e.target.parentNode.querySelector('.v').textContent = num(S.tfs);
  };
  $$('#fontChips button').forEach((b) => b.onclick = () => {
    S.font = b.dataset.f; LS.set('font', S.font); applyChrome(); viewSettings();
  });
  $$('#langChips button').forEach((b) => b.onclick = async () => {
    S.lang = b.dataset.lg; LS.set('ui', S.lang); applyChrome();
    await ensureTranslation();
    toast(window.I18N[S.lang].name);
    render();
  });
  $('#trSel').onchange = async (e) => {
    S.tr = e.target.value; LS.set('tr', S.tr); S.showTr = !!S.tr; LS.set('showTr', S.showTr);
    searchIdx.rows = null;
    toast(t('loading_tr'));
    const ok = await ensureTranslation();
    if (!ok) toast(t('tr_fail'));
    else toast(t('offline_ok'));
    render();
  };
  $('#installBtn').onclick = async () => {
    if (!S.installEvt) return;
    S.installEvt.prompt();
    const r = await S.installEvt.userChoice;
    if (r.outcome === 'accepted') { toast(t('installed')); S.installEvt = null; viewSettings(); }
  };
  $('#clearBtn').onclick = () => {
    if (!confirm(t('clear_ask'))) return;
    S.bm = []; S.last = null; LS.set('bm', []); LS.set('last', null);
    searchIdx.rows = null;
    toast(t('cleared')); viewSettings();
  };
}

/* ---------------- ربط القراءة ---------------- */
function bindReading(su, focusAyah, isJuz) {
  const ayat = $('#ayat');
  if (!ayat) return;

  // فتح لوحة الآية
  ayat.addEventListener('click', (e) => {
    const el = e.target.closest('.ayah');
    if (!el) return;
    openAyahSheet(+el.dataset.s, +el.dataset.a);
  });

  // تمرير إلى الآية المطلوبة
  if (focusAyah) {
    const target = document.getElementById(`ay-${su ? su.n : ''}-${focusAyah}`);
    setTimeout(() => {
      if (target) {
        target.scrollIntoView({ behavior: 'auto', block: 'center' });
        target.classList.add('act');
        setTimeout(() => target.classList.remove('act'), 2400);
      }
    }, 60);
  }

  // شريط التقدم + حفظ الموضع
  const prog = $('#prog');
  let raf = null;
  const onScroll = () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = null;
      const rect = document.body.getBoundingClientRect();
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const p = total > 0 ? Math.min(100, Math.max(0, (window.scrollY / total) * 100)) : 0;
      if (prog) prog.style.width = p.toFixed(1) + '%';
      savePos();
    });
  };
  let st = null;
  const savePos = () => {
    clearTimeout(st);
    st = setTimeout(() => {
      const els = $$('.ayah', ayat);
      if (!els.length) return;
      let cur = els[0];
      for (const el of els) {
        if (el.getBoundingClientRect().top <= 160) cur = el; else break;
      }
      const s = +cur.dataset.s, a = +cur.dataset.a;
      if (!S.last || S.last.s !== s || S.last.a !== a) {
        S.last = { s: s, a: a, ts: Date.now() };
        LS.set('last', S.last);
      }
    }, 700);
  };
  window.removeEventListener('scroll', bindReading._sc || (() => {}));
  bindReading._sc = onScroll;
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const prevS = $('#prevS'), nextS = $('#nextS');
  if (prevS) prevS.onclick = () => { if (su && su.n > 1) go('/surah/' + (su.n - 1)); };
  if (nextS) nextS.onclick = () => { if (su && su.n < 114) go('/surah/' + (su.n + 1)); };
  const tl = $('#topList');
  if (tl) tl.onclick = () => go('/index');
}

/* ---------------- لوحة الآية ---------------- */
function isSaved(s, a) { return S.bm.some((x) => x.s === s && x.a === a); }
function openAyahSheet(s, a) {
  const su = SURAHS[s - 1];
  S.sheetAyah = { s: s, a: a };
  const m = trMeta(S.tr);
  const tr = ayahTr(s, a);
  $('#sheetT').textContent = `${su.name} · ${t('ayah')} ${num(a)}`;
  $('#sheetSub').textContent = `${s}:${a}`;
  const saved = isSaved(s, a);
  let body = `<div class="saved-item" style="margin-bottom:14px">
      <div class="si-ar">${esc(su.ayahs[a - 1])}</div>
      ${tr ? `<div class="si-tr ${m && m.dir === 'rtl' ? 'rtl' : ''}" style="${m && m.dir === 'rtl' ? 'text-align:right' : ''}">${esc(tr)}</div>` : ''}
    </div>`;
  body += `<button class="act" data-act="save">${I.save}${esc(saved ? t('unsave') : t('save_ayah'))}</button>`;
  body += `<button class="act" data-act="copy">${I.copy}${esc(t('copy'))}</button>`;
  body += `<button class="act" data-act="share">${I.share}${esc(t('share'))}</button>`;
  body += `<button class="act" data-act="play">${I.play}${esc(t('play'))} <span class="kbd">(${esc(t('online_only'))})</span></button>`;
  body += `<button class="act" data-act="go">${I.arrowR}${esc(t('read_from_here'))}</button>`;
  if (S.view === 'juz') body += `<button class="act" data-act="open">${I.book}${esc(t('go_to_ayah'))} · ${esc(su.name)}</button>`;
  $('#sheetBody').innerHTML = body;
  openSheet();

  $$('#sheetBody .act').forEach((b) => {
    b.onclick = () => {
      const act = b.dataset.act;
      if (act === 'save') toggleSave(s, a);
      if (act === 'copy') copyAyah(s, a);
      if (act === 'share') shareAyah(s, a);
      if (act === 'play') playAyah(s, a);
      if (act === 'go' || act === 'open') { closeSheet(); go('/surah/' + s + '/' + a); }
      if (act === 'save' || act === 'copy' || act === 'share') closeSheet();
    };
  });
}
function openSheet() { $('#sheet').classList.add('on'); $('#sheetBg').classList.add('on'); }
function closeSheet() { $('#sheet').classList.remove('on'); $('#sheetBg').classList.remove('on'); }

function toggleSave(s, a) {
  if (isSaved(s, a)) {
    S.bm = S.bm.filter((x) => !(x.s === s && x.a === a));
    toast(t('removed_ok'));
  } else {
    S.bm.push({ s: s, a: a, ts: Date.now() });
    toast(t('saved_ok'));
  }
  LS.set('bm', S.bm);
}
function ayahText(s, a) {
  const su = SURAHS[s - 1];
  const tr = ayahTr(s, a);
  return `${su.name} — ${t('ayah')} ${a}\n\n${su.ayahs[a - 1]}` + (tr ? `\n\n${tr}` : '');
}
async function copyAyah(s, a) {
  const txt = ayahText(s, a) + `\n\n${t('app')} · ${t('share_text')}\nhttps://mido9980.github.io/easy-quran/#/surah/${s}/${a}`;
  try {
    if (navigator.clipboard) await navigator.clipboard.writeText(txt);
    else {
      const ta = document.createElement('textarea');
      ta.value = txt; document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); ta.remove();
    }
    toast(t('copied'));
  } catch (e) { toast(t('copy_fail')); }
}
async function shareAyah(s, a) {
  const txt = ayahText(s, a);
  const url = `https://mido9980.github.io/easy-quran/#/surah/${s}/${a}`;
  try {
    if (navigator.share) await navigator.share({ title: t('app'), text: txt, url: url });
    else await copyAyah(s, a);
  } catch (e) { /* المستخدم أغلق المشاركة */ }
}

/* ---------------- استماع ---------------- */
let audio = null, audioAyah = null;
function playAyah(s, a) {
  if (!navigator.onLine) { toast(t('online_only')); return; }
  if (audio) { audio.pause(); audio = null; }
  $$('.ayah.playing').forEach((e) => e.classList.remove('playing'));
  const el = document.getElementById(`ay-${s}-${a}`);
  audio = new Audio(`https://everyayah.com/data/Alafasy_128kbps/${pad3(s)}${pad3(a)}.mp3`);
  audio.onended = () => {
    if (el) el.classList.remove('playing');
    audio = null;
    if (a < SURAHS[s - 1].count) playAyah(s, a + 1);
  };
  audio.onerror = () => { toast(t('online_only')); audio = null; };
  audio.play().then(() => { if (el) el.classList.add('playing'); }).catch(() => toast(t('online_only')));
}

/* ---------------- التنزيل/الترجمة ---------------- */
async function ensureTranslation() {
  if (!S.tr) return true;
  if (trCache[S.tr]) return true;
  try { await loadTr(S.tr); return !!trCache[S.tr]; }
  catch (e) { return false; }
}

/* ---------------- الرسم العام ---------------- */
function render() {
  $('#sheetCancel').textContent = t('close');
  const r = parseHash();
  if (render._h !== location.hash) { window.scrollTo(0, 0); render._h = location.hash; }

  // شريط التبويبات
  const tabMap = { home: 'home', index: 'read', surah: 'read', juz: 'read', search: 'search', saved: 'saved', settings: 'settings' };
  const active = tabMap[r.name] || 'home';
  $$('#tabbar .tab').forEach((el) => el.classList.toggle('on', el.dataset.tab === active));
  $('#searchBtn').onclick = () => go('/search');
  $('#themeBtn').onclick = () => {
    const order = ['emerald', 'midnight', 'sand', 'ivory', 'rose'];
    S.theme = order[(order.indexOf(S.theme) + 1) % order.length];
    LS.set('theme', S.theme); applyChrome();
    toast(S.theme);
  };
  $('#backBtn').onclick = () => history.length > 1 ? history.back() : go('/home');
  $('#trBtn').onclick = () => {
    S.showTr = !S.showTr; LS.set('showTr', S.showTr);
    $('#trBtn').classList.toggle('on', S.showTr);
    render();
  };

  if (r.name === 'home') viewHome();
  else if (r.name === 'index') viewIndex(r.a);
  else if (r.name === 'juz' && r.a) viewJuz(r.a);
  else if (r.name === 'juz') viewIndex('juz');
  else if (r.name === 'surah' && r.a) viewSurah(+r.a, r.b ? +r.b : null);
  else if (r.name === 'read') {
    if (S.last && SURAHS[S.last.s - 1]) go('/surah/' + S.last.s + '/' + S.last.a);
    else go('/surah/1');
  }
  else if (r.name === 'search') viewSearch(r.a || '');
  else if (r.name === 'saved') viewSaved();
  else if (r.name === 'settings') viewSettings();
  else if (r.name === 'about') viewSettings();
  else go('/home');

  // عنوان التبويبات
  const labels = { home: t('home'), read: t('mushaf'), search: t('search'), saved: t('saved'), settings: t('settings') };
  $$('#tabbar .tab').forEach((el) => { el.querySelector('i').textContent = labels[el.dataset.tab]; });
}
function bindHome() {
  const c = $('#btnContinue'); if (c) c.onclick = () => go('/read');
  const s = $('#btnSearch'); if (s) s.onclick = () => go('/search');
  const l = $('#lastCard'); if (l) l.onclick = () => go(S.last ? `/surah/${S.last.s}/${S.last.a}` : '/surah/1');
}

/* ---------------- البداية ---------------- */
async function boot() {
  const fill = $('#loadFill'), txt = $('#loadTxt');
  fill.style.width = '35%';
  applyChrome();
  $$('#tabbar .ti').forEach((el, i) => { el.innerHTML = [I.home, I.book, I.search, I.mark, I.set][i]; });
  $('#searchBtn').innerHTML = I.search;
  $('#themeBtn').innerHTML = I.moon;
  $('#backBtn').innerHTML = dir() === 'rtl' ? I.chev : I.chevL;
  $('#trBtn').innerHTML = I.trans;
  $('#sheetCancel').textContent = t('close');

  txt.textContent = t('loading_tr');
  fill.style.width = '60%';
  await ensureTranslation();
  fill.style.width = '85%';

  window.addEventListener('hashchange', () => render());
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); S.installEvt = e;
    if (S.view === 'settings') viewSettings();
  });
  window.addEventListener('appinstalled', () => { S.installEvt = null; });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  render();
  fill.style.width = '100%';
  setTimeout(() => {
    $('#splash').classList.add('off');
    const r = parseHash();
    if (r.name !== 'surah') setTimeout(() => toast(t('offline_ok')), 500);
  }, 260);
}

document.addEventListener('DOMContentLoaded', boot);
window.addEventListener('load', () => { const f = $('#loadFill'); if (f) f.style.width = '100%'; });
$('#sheetBg') && ($('#sheetBg').onclick = closeSheet);
$('#sheetCancel') && ($('#sheetCancel').onclick = closeSheet);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSheet(); });

})();

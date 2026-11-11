(() => {
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const store = {get(k, d) { try { const v = localStorage.getItem('irfan.' + k); return v == null ? d : v; } catch { return d; } }, set(k, v) { try { localStorage.setItem('irfan.' + k, v); } catch {} }};
const toast = t => { const el = $('toast'); el.textContent = t; el.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('show'), 1800); };

/* ===== palettes ===== */
const PALS = [['sunset', 'Sunset Desk', ['#94C6F5', '#FBD2BE', '#F0643A', '#3D7BFF']], ['mint', 'Mint Arcade', ['#7FDCC8', '#E3FFF4', '#00A88F', '#FF6B6B']], ['grape', 'Grape Soda', ['#B6A2F7', '#FFD1EC', '#7B4DFF', '#FF4FA0']], ['lemon', 'Lemon Pop', ['#FFD84D', '#FFF3C4', '#FF5A1F', '#2F6BFF']], ['night', 'Night Mode', ['#1B1745', '#4A2A78', '#FF3EA5', '#36E8FF']]];
const pop = $('palPop');
pop.insertAdjacentHTML('beforeend', PALS.map(([k, n, c]) => `<button type="button" data-p="${k}"><i>${c.map(x => `<s style="background:${x}"></s>`).join('')}</i>${n}</button>`).join(''));
function setPal(k, quiet) {
  document.documentElement.dataset.pal = k; store.set('pal', k);
  pop.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.p === k));
  readGameCols();
  if (!quiet) toast('Theme: ' + PALS.find(p => p[0] === k)[1]);
}
$('palBtn').addEventListener('click', e => { e.stopPropagation(); pop.hidden = !pop.hidden; $('palBtn').setAttribute('aria-expanded', !pop.hidden); });
pop.addEventListener('click', e => { const b = e.target.closest('button[data-p]'); if (b) setPal(b.dataset.p); });
document.addEventListener('click', e => { if (!pop.hidden && !pop.contains(e.target)) { pop.hidden = true; $('palBtn').setAttribute('aria-expanded', 'false'); } });

/* ===== data ===== */
const P = [
  {n: 'Skentics', m: 'SK', d: 'Jul 2025', ev: 'Vision project', c: '#FF5A36', t: 'Started as a YOLO11 skin-condition detector and grew into a real-time vision system with a vision-language model, OCR and speech on live RTSP streams.', hi: '★ 60+ FPS with YOLO11', st: ['YOLO11', 'PaliGemma 3B', 'Tesseract', 'PyTorch', 'CUDA'], lk: [['Live demo ↗', 'https://irfansirkar.github.io/skin-disease-updated/'], ['Code', 'https://github.com/irfansirkar/skin-disease-updated'], ['CNN v1', 'https://github.com/irfansirkar/skin-desease']]},
  {n: 'MediMap', m: 'MM', d: 'Aug 2024', ev: 'Expogenix 2024', c: '#3D7BFF', t: 'Multi-LLM consensus engine: aggregates answers from several models and validates them for researchers.', hi: '★ −80% manual comparison', st: ['FastAPI', 'BART', 'OpenAI/Groq/Gemini', 'AWS'], lk: [['Live demo ↗', 'https://irfansirkar.github.io/medimap/'], ['Code', 'https://github.com/irfansirkar/medimap']]},
  {n: 'Domain Clash', m: 'DC', d: 'Apr 2026', ev: 'Live event platform', c: '#C13BEA', t: 'Real-time tech quiz: players bid credits on a question before the options appear, with multipliers up to 5×.', hi: '★ Live bidding + admin dashboard', st: ['Next.js', 'TypeScript', 'Supabase', 'Framer Motion'], lk: [['Live demo ↗', 'https://irfansirkar.github.io/tech-bid/'], ['Code', 'https://github.com/irfansirkar/tech-bid']]},
  {n: 'TeachAssist', m: 'TA', d: 'Jun 2025', ev: 'SMC Expogenix & AWS Cloud', c: '#F5A300', t: 'AI study co-pilot: RAG over PDFs and docs, OCR on images, and AI-generated practice tests.', hi: '★ RAG + OCR + practice tests', st: ['Gemini', 'LangChain', 'Streamlit', 'PyPDF2'], lk: [['Live demo ↗', 'https://irfansirkar.github.io/teachassist/'], ['Code', 'https://github.com/irfansirkar/teachassist']]},
  {n: 'MediMap MM', m: 'M²', d: 'Jun 2025', ev: 'Expogenix', c: '#00B3A4', t: 'Multimodal emergency diagnostics combining text, X-rays and CT scans with an interactive chat.', hi: '★ Text + X-ray + CT', st: ['PyTorch', 'Transformers', 'BiMediX2', 'CUDA'], lk: [['Live demo ↗', 'https://irfansirkar.github.io/medimap-mm/'], ['Code', 'https://github.com/irfansirkar/medimap-mm']]},
  {n: 'Robust-3D', m: 'R3', d: 'Apr 2025', ev: 'HackRev', c: '#FF4D8D', t: 'Photo-to-3D body model fitness coach with targeted workouts, diet plans and progress tracking.', hi: '★ Lead developer', st: ['Computer Vision', '3D modelling'], lk: [['Live demo ↗', 'https://irfansirkar.github.io/3D-human-exercise-module/'], ['Code', 'https://github.com/irfansirkar/3D-human-exercise-module']]},
  {n: 'LLM Compare v2', m: 'LC', d: 'May 2025', ev: 'CSI Tech Nova', c: '#7B4DFF', t: 'Plugin-based LLM comparison engine with analytics, live validation and conflict alerts.', hi: '★ Claude 3 + Gemini', st: ['Next.js', 'FastAPI', 'PEGASUS', 'AWS'], lk: [['Live demo ↗', 'https://irfansirkar.github.io/llm-compare-v2/'], ['Code', 'https://github.com/irfansirkar/llm-compare-v2']]},
  {n: 'Stack-Farm', m: 'SF', d: 'Nov 2024', ev: 'Hackathon', c: '#2EAD5B', t: 'Early plant-disease detection from leaf photos, with a lightweight UI for farmers and field agents.', hi: '★ Built for farmers', st: ['TensorFlow', 'Streamlit', 'Image processing'], lk: [['Live demo ↗', 'https://irfansirkar.github.io/stack-farm/'], ['Code', 'https://github.com/irfansirkar/stack-farm']]},
  {n: 'Medzo', m: 'MZ', d: 'Jan 2024', ev: 'Malla Reddy Hackathon', c: '#FF8A1C', t: 'Domain-restricted AWS chatbot that gives the AWS Club precise, instant technical answers.', hi: '★ Filters non-AWS questions', st: ['Python', 'Boto3', 'LLM'], lk: [['Live demo ↗', 'https://irfansirkar.github.io/medzo/'], ['Code', 'https://github.com/irfansirkar/medzo']]},
];
const SK = [
  ['Python', 'Py', 'ml', 6], ['PyTorch', 'PT', 'ml', 2], ['TensorFlow', 'TF', 'ml', 1], ['CUDA', 'CU', 'ml', 2], ['LLM fine-tuning', 'FT', 'llm', 0],
  ['Transformers', 'Tr', 'llm', 2], ['LangChain', 'LC', 'llm', 1], ['Gemini', 'Ge', 'llm', 2], ['RAG', 'RG', 'llm', 1],
  ['YOLO11', 'YO', 'cv', 1], ['Computer Vision', 'CV', 'cv', 3], ['Tesseract OCR', 'OC', 'cv', 2],
  ['FastAPI', 'FA', 'web', 2], ['AWS', 'AW', 'web', 3], ['Next.js', 'Nx', 'web', 2], ['React', 'Re', 'web', 0], ['TypeScript', 'TS', 'web', 1], ['Supabase', 'Sb', 'web', 1], ['Streamlit', 'St', 'web', 3], ['Figma', 'Fg', 'web', 0],
];
const CAT = {all: ['All', '#141414'], ml: ['Core ML', '#FF5A36'], llm: ['LLMs', '#7B4DFF'], cv: ['Vision', '#00B3A4'], web: ['Web & Cloud', '#3D7BFF']};
const STOPS = [
  ['1-1', '2023', 'Joined MJCET', 'Started a B.E. in Artificial Intelligence & Data Science.'],
  ['1-2', 'Jan 2024', 'Medzo', 'First hackathon build: an AWS-only chatbot.'],
  ['1-3', 'Jun – Aug 2024', 'Lead Developer · Synapsify', 'Led the team at the MJCET Expo.'],
  ['2-1', 'Aug 2024', 'MediMap', 'Multi-LLM consensus engine. −80% manual comparison.'],
  ['2-2', 'Nov 2024', 'Lead Developer · Robust-3D', 'Led the CSI Hackathon team, shipped Stack-Farm too.'],
  ['2-3', 'Jan – Apr 2025', 'Tech Head · CSI-MJCET', 'Ran the technical side of the student chapter.'],
  ['3-1', 'Jun 2025', 'TeachAssist + MediMap MM', 'RAG study co-pilot and multimodal medical AI.'],
  ['3-2', 'Jul 2025', 'Skentics · two podiums', '60+ FPS vision. 3rd at AWS Cloud Ignite and SMC Expogenix.'],
  ['★', 'Apr 2026', 'Domain Clash', 'Live quiz platform with bidding. Boss stage: your team.'],
];

/* ===== stickers (original art) ===== */
const ART = {
  pad: `<svg viewBox="0 0 240 160"><path d="M62 24h116c36 0 56 26 59 62 4 42-11 66-34 66-19 0-29-15-41-31h-84c-12 16-22 31-41 31-23 0-38-24-34-66 3-36 23-62 59-62z" fill="#2B2D42"/><path d="M62 24h116c30 0 48 18 55 44-20-18-50-24-116-24S22 50 8 68c7-26 25-44 54-44z" fill="#3D405B"/><path d="M64 70h14v14h14v14H78v14H64V98H50V84h14z" fill="#121320"/><circle cx="172" cy="68" r="9" fill="#FFC93C"/><circle cx="190" cy="86" r="9" fill="#FF4D4D"/><circle cx="172" cy="104" r="9" fill="#2ED47A"/><circle cx="154" cy="86" r="9" fill="#3D7BFF"/><rect x="104" y="66" width="14" height="7" rx="3.5" fill="#8D99AE"/><rect x="124" y="66" width="14" height="7" rx="3.5" fill="#8D99AE"/><circle cx="98" cy="118" r="15" fill="#1A1B2B"/><circle cx="98" cy="118" r="9" fill="#555B7A"/><circle cx="146" cy="118" r="15" fill="#1A1B2B"/><circle cx="146" cy="118" r="9" fill="#555B7A"/></svg>`,
  hand: `<svg viewBox="0 0 160 240"><rect x="6" y="6" width="148" height="228" rx="16" fill="#E9E3D5"/><rect x="6" y="196" width="148" height="38" rx="16" fill="#D8D0BE"/><rect x="18" y="20" width="124" height="104" rx="10" fill="#4F5468"/><rect x="32" y="32" width="96" height="78" fill="#A7C957"/><g fill="#386641"><rect x="60" y="56" width="12" height="12"/><rect x="56" y="68" width="20" height="16"/><rect x="58" y="84" width="6" height="8"/><rect x="68" y="84" width="6" height="8"/><rect x="88" y="78" width="8" height="8"/><rect x="100" y="78" width="8" height="8"/><rect x="32" y="96" width="96" height="4"/></g><path d="M36 150h14v14h14v14H50v14H36v-14H22v-14h14z" fill="#2B2D42"/><circle cx="118" cy="160" r="12" fill="#B5174C"/><circle cx="96" cy="176" r="12" fill="#B5174C"/></svg>`,
  stick: `<svg viewBox="0 0 220 170"><path d="M14 92h192l-12 70H26z" fill="#1D1D26"/><path d="M14 92h192l-8 14H22z" fill="#2E2E3B"/><rect x="69" y="44" width="10" height="56" rx="4" fill="#B8BCC8"/><ellipse cx="74" cy="100" rx="22" ry="7" fill="#0F0F16"/><circle cx="74" cy="40" r="26" fill="#FF3B3B"/><circle cx="64" cy="30" r="8" fill="#FF9C9C"/><ellipse cx="136" cy="108" rx="14" ry="8" fill="#36E8FF"/><ellipse cx="166" cy="100" rx="14" ry="8" fill="#FFE14D"/><ellipse cx="190" cy="114" rx="11" ry="7" fill="#FF3EA5"/></svg>`,
  d20: `<svg viewBox="0 0 160 170"><polygon points="80,6 152,46 152,124 80,164 8,124 8,46" fill="#C2185B"/><polygon points="80,6 152,46 80,56" fill="#E91E63"/><polygon points="80,6 8,46 80,56" fill="#D81B60"/><polygon points="80,56 132,128 28,128" fill="#FF4081"/><polygon points="8,46 80,56 28,128" fill="#AD1457"/><polygon points="152,46 80,56 132,128" fill="#C2185B"/><polygon points="28,128 132,128 80,164" fill="#880E4F"/><text class="dn" x="80" y="110" text-anchor="middle" font-family="Montserrat,sans-serif" font-weight="900" font-size="34" fill="#fff">20</text></svg>`,
  coin: `<svg viewBox="0 0 120 120"><g class="coin-spin"><circle cx="60" cy="60" r="54" fill="#E8A317"/><circle cx="60" cy="56" r="52" fill="#FFC93C"/><circle cx="60" cy="56" r="40" fill="none" stroke="#E8A317" stroke-width="6"/><path d="M60 32l7 15 16 2-12 11 3 16-14-8-14 8 3-16-12-11 16-2z" fill="#FFF3B0"/></g></svg>`,
  heart: `<svg viewBox="0 0 9 8" shape-rendering="crispEdges"><path d="M1 0h2v1h1v1h1V1h1V0h2v1h1v3H8v1H7v1H6v1H5v1H4V7H3V6H2V5H1V4H0V1h1z" fill="#FF3355"/><path d="M1 1h1v1H1zM2 2h1v1H2z" fill="#FFC2CC"/></svg>`,
  crt: `<svg viewBox="0 0 200 190"><line x1="88" y1="34" x2="62" y2="4" stroke="#555" stroke-width="4" stroke-linecap="round"/><line x1="112" y1="34" x2="140" y2="6" stroke="#555" stroke-width="4" stroke-linecap="round"/><rect x="8" y="32" width="184" height="140" rx="18" fill="#C9B79C"/><rect x="22" y="46" width="122" height="98" rx="16" fill="#1B1340"/><rect x="30" y="54" width="106" height="82" rx="12" fill="#3A2C7A"/><g fill="#36E8FF"><rect x="60" y="80" width="10" height="10"/><rect x="92" y="80" width="10" height="10"/><rect x="56" y="104" width="50" height="6"/><rect x="52" y="98" width="6" height="6"/><rect x="104" y="98" width="6" height="6"/></g><circle cx="168" cy="72" r="11" fill="#7A6A52"/><circle cx="168" cy="102" r="11" fill="#7A6A52"/></svg>`,
  keys: `<svg viewBox="0 0 270 120"><rect x="4" y="8" width="262" height="106" rx="12" fill="#2B2D42"/>KEYS</svg>`,
  cart: `<svg viewBox="0 0 170 200"><path d="M10 10h150v170a10 10 0 0 1-10 10H40l-30-30z" fill="#9EA3B0"/><rect x="24" y="40" width="122" height="112" rx="6" fill="#6C4CF5"/><rect x="24" y="40" width="122" height="60" rx="6" fill="#FF3EA5"/><polygon points="24,100 146,70 146,100" fill="#FF8A3D"/><text x="85" y="128" text-anchor="middle" font-family="Silkscreen,monospace" font-size="17" font-weight="700" fill="#fff">IRFAN.EXE</text><text x="85" y="144" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9" fill="#fff">ML × GAME DEV</text></svg>`,
};
let kk = ''; [12, 12, 11, 10].forEach((n, r) => { for (let i = 0; i < n; i++) { const w = (r === 1 && i === 1) || (r === 2 && i < 3); kk += `<rect x="${14 + i * 20.5 + r * 6}" y="${18 + r * 23}" width="17" height="18" rx="3" fill="${w ? '#F0643A' : '#EDEAE2'}"/>`; } });
ART.keys = ART.keys.replace('KEYS', kk);
ART.me = `<div class="polaroid"><img src="img/irfan-hero.jpg" alt="Mohammad Irfan Sirkar in a green suit" width="440" height="550" draggable="false"><span>PLAYER 1</span></div>`;
const STK = [['pad', 7, 11, 17, -18, .35], ['keys', 68, 10, 25, 12, .5], ['me', 4, 65, 11, -7, -.1], ['hand', 18, 67, 8, 10, -.15, 'm-hide'], ['stick', 39, 74, 15, -6, .1], ['crt', 79, 60, 14, 9, -.2], ['coin', 33, 17, 5, 0, .6], ['d20', 61, 74, 6.5, 14, -.05, 'm-hide'], ['heart', 29, 86, 4.2, -8, .25]];
/* on phones the headline stacks taller, so the photo starts lower */
if (innerWidth <= 700) STK.find(s => s[0] === 'me').splice(1, 2, 3, 72);
$('stickers').innerHTML = STK.map(([k, x, y, w, r, sp, cls], j) => `<div class="par ${cls || ''}" data-sp="${sp}" style="left:${x}%;top:${y}%"><div class="bob" style="--bd:-${(j * .7).toFixed(1)}s"><div class="stk" data-k="${k}" style="--w:${w}cqw;--r:${r}deg">${ART[k]}</div></div></div>`).join('');

/* ===== hero interactions ===== */
const hero = $('hero'), st = {coins: 0, hp: 3};
const popAt = (x, y, t, col) => { const p = document.createElement('div'); p.className = 'pop'; p.textContent = t; p.style.left = x + 'px'; p.style.top = y + 'px'; if (col) p.style.color = col; hero.appendChild(p); setTimeout(() => p.remove(), 1000); };
const hud = () => { $('cn').textContent = st.coins; $('hp').textContent = '♥'.repeat(st.hp) + '♡'.repeat(3 - st.hp); $('lv').textContent = 1 + Math.floor(st.coins / 5); const h = $('hud'); h.classList.remove('bump'); void h.offsetWidth; h.classList.add('bump'); };
const fx = (el, c) => { el.classList.remove('fx-shake', 'fx-spin', 'fx-roll', 'fx-pulse'); void el.offsetWidth; el.classList.add(c); };
let zTop = 10;
hero.querySelectorAll('.par').forEach(par => {
  const el = par.querySelector('.stk'); let d = null;
  el.addEventListener('pointerdown', e => { e.preventDefault(); el.setPointerCapture(e.pointerId); const r = hero.getBoundingClientRect(); d = {sx: e.clientX, sy: e.clientY, l: parseFloat(par.style.left), t: parseFloat(par.style.top), w: r.width, h: r.height, mv: false}; el.classList.add('drag'); par.style.zIndex = ++zTop; });
  el.addEventListener('pointermove', e => { if (!d) return; const dx = e.clientX - d.sx, dy = e.clientY - d.sy; if (Math.hypot(dx, dy) > 5) d.mv = true; par.style.left = (d.l + dx / d.w * 100) + '%'; par.style.top = (d.t + dy / d.h * 100) + '%'; });
  el.addEventListener('pointerup', () => {
    if (!d) return; el.classList.remove('drag');
    if (!d.mv) {
      const r = el.getBoundingClientRect(), hr = hero.getBoundingClientRect(), x = r.left - hr.left + r.width / 2 - 30, y = r.top - hr.top;
      const k = el.dataset.k;
      if (k === 'coin') { fx(el, 'fx-spin'); st.coins++; hud(); popAt(x, y, '+1 COIN', '#E8A317'); }
      else if (k === 'd20') { fx(el, 'fx-roll'); const n = 1 + (Math.random() * 20 | 0); setTimeout(() => el.querySelector('.dn').textContent = n, 300); popAt(x, y, n === 20 ? 'CRIT! 20' : 'ROLLED ' + n, '#C2185B'); }
      else if (k === 'heart') { fx(el, 'fx-pulse'); st.hp = Math.min(3, st.hp + 1); hud(); popAt(x, y, '+1 HP', '#FF3355'); }
      else if (k === 'me') { fx(el, 'fx-pulse'); mini.jump(true); popAt(x, y, 'PLAYER 1 READY!'); }
      else if (k === 'cart') { fx(el, 'fx-shake'); mini.reset(); popAt(x, y, 'NEW GAME'); }
      else { fx(el, 'fx-shake'); mini.jump(true); popAt(x, y, 'JUMP!'); }
    }
    d = null;
  });
});

/* ===== mini game engine ===== */
let GC = {};
function readGameCols() { const cs = getComputedStyle(document.documentElement), g = n => cs.getPropertyValue(n).trim(); GC = {sky: g('--gsky'), hill: g('--ghill'), ground: g('--ink'), hero: g('--acc2'), bug: g('--acc'), coin: '#FFC93C', text: g('--ink')}; }
function makeGame(cv, W, H, cb) {
  const c = cv.getContext('2d'), G = H - 9; let s;
  const reset = () => { s = {y: G, vy: 0, obs: [], coins: [], t: 0, next: 50, cnext: 25, score: 0, flash: 0, user: -999, dead: false}; };
  reset();
  const jump = u => { if (s.y >= G - .1) s.vy = -3.3; if (u) s.user = s.t; };
  const R = (x, y, w, h, col) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); };
  function step(auto = true) {
    s.t++; const sp = 1.2 + Math.min(1.2, s.score * .05);
    if (--s.next <= 0) { s.obs.push({x: W + 4}); s.next = 42 + (Math.random() * 55 | 0); }
    if (--s.cnext <= 0) { s.coins.push({x: W + 4, y: G - 14 - (Math.random() * 12 | 0)}); s.cnext = 28 + (Math.random() * 40 | 0); }
    s.vy += .2; s.y = Math.min(G, s.y + s.vy); if (s.y >= G) s.vy = 0;
    const px = 16;
    if (auto && s.t - s.user > 180) { const o = s.obs.find(o => o.x > px && o.x - px < 15); if (o) jump(false); }
    s.obs.forEach(o => o.x -= sp); s.coins.forEach(k => k.x -= sp);
    s.obs = s.obs.filter(o => { if (o.x < -8) return false; if (o.x < px + 5 && o.x + 6 > px && s.y > G - 5) { s.flash = 14; cb.hit && cb.hit(); return false; } return true; });
    s.coins = s.coins.filter(k => { if (k.x < -6) return false; if (Math.abs(k.x - px) < 5 && Math.abs(k.y - (s.y - 5)) < 7) { s.score++; cb.coin && cb.coin(s.score); return false; } return true; });
    if (s.flash) s.flash--;
  }
  function draw() {
    const P = GC; R(0, 0, W, H, P.sky);
    const off = (s.t * .3) % 40;
    for (let i = -1; i < W / 40 + 1; i++) { const x = i * 40 - off; R(x, G - 8, 22, 9, P.hill); R(x + 5, G - 13, 12, 5, P.hill); }
    R(0, G, W, H - G, P.ground);
    for (let i = 0; i < W / 8; i++) R(((i * 10 - s.t * 1.3) % W + W) % W, G + 3, 4, 1, P.sky);
    s.coins.forEach(k => { const f = Math.floor(s.t / 8) % 2; R(k.x - (f ? 1 : 2), k.y - 2, f ? 2 : 4, 4, P.coin); });
    s.obs.forEach(o => { const l = Math.floor(s.t / 6) % 2; R(o.x, G - 4, 6, 3, P.bug); R(o.x + 1, G - 5, 4, 1, P.bug); R(o.x + (l ? 0 : 1), G - 1, 1, 1, P.text); R(o.x + (l ? 5 : 4), G - 1, 1, 1, P.text); R(o.x + 1, G - 4, 1, 1, '#fff'); });
    const run = s.y >= G && Math.floor(s.t / 5) % 2, x = 14, y = Math.round(s.y) - 8;
    if (!(s.flash && s.flash % 4 < 2)) { R(x, y, 5, 3, P.hero); R(x + 3, y + 1, 1, 1, '#fff'); R(x, y + 3, 5, 3, P.hero); R(x + (run ? 0 : 1), y + 6, 1, 2, P.text); R(x + (run ? 4 : 3), y + 6, 1, 2, P.text); }
    c.fillStyle = P.text; c.font = '7px Silkscreen, monospace'; c.textBaseline = 'top'; c.fillText('★' + s.score, 3, 2);
  }
  return {jump, reset, step, draw, get s() { return s; }};
}
readGameCols();
const mini = makeGame($('screen').querySelector('canvas'), 96, 56, {coin: () => { st.coins++; hud(); }, hit: () => { st.hp = st.hp > 1 ? st.hp - 1 : 3; hud(); }});
$('screen').addEventListener('click', () => mini.jump(true));

/* big game (manual) */
let best = +store.get('best', 0), playing = false; $('best').textContent = best;
const big = makeGame($('big'), 200, 100, {coin: n => { $('sc').textContent = n; }, hit: () => { playing = false; if (big.s.score > best) { best = big.s.score; store.set('best', best); $('best').textContent = best; toast('New best: ' + best + ' coins!'); } $('ov').textContent = 'OUCH! SCORE ' + big.s.score + ' · CLICK TO RETRY'; $('ov').style.opacity = 1; }});
const startOrJump = () => { if (!playing) { big.reset(); playing = true; $('sc').textContent = 0; $('ov').style.opacity = 0; } big.jump(true); };
$('big').addEventListener('pointerdown', e => { e.preventDefault(); startOrJump(); });
let overPlay = false; const playEl = $('play');
new IntersectionObserver(([e]) => overPlay = e.isIntersecting, {threshold: .5}).observe(playEl);
addEventListener('keydown', e => { if (e.code === 'Space' && overPlay) { e.preventDefault(); startOrJump(); } });

/* ===== About ===== */
const hlW = new Set(['ML', 'developer', 'LLM', 'computer', 'vision', 'medical', 'AI,', 'led', 'two', 'podiums', 'tiny', 'games.']);
$('words').innerHTML = $('words').textContent.split(' ').map(w => `<span class="${hlW.has(w) ? 'hw' : ''}">${esc(w)}</span>`).join(' ');
$('bars').innerHTML = [['Python', 6], ['LLMs', 5], ['Vision', 3], ['Web/Cloud', 4], ['PyTorch', 2]].map(([n, v], i) => `<div class="bar"><span>${n}</span><div class="tr"><i style="--v:${v / 9 * 100}%;--dl:${i * .12}s"></i></div><span>${v}/9</span></div>`).join('');
$('counters').innerHTML = [[9, '', 'projects shipped'], [2, '', 'podium finishes'], [60, '+', 'FPS live vision'], [80, '%', 'less manual work']].map(([v, s, l], i) => `<div class="count" data-rv style="--dl:${i * .08}s"><b data-count="${v}" data-s="${s}">${v}${s}</b><span>${l}</span></div>`).join('');

/* ===== Skills ===== */
$('tabs').innerHTML = Object.entries(CAT).map(([k, [n]], i) => `<button type="button" data-c="${k}" class="${i ? '' : 'on'}">${n}</button>`).join('');
$('inv').innerHTML = SK.map(([n, m, c, u], i) => `<div class="item" data-c="${c}" data-rv="scale" style="--c:${CAT[c][1]};--dl:${(i % 8) * .05}s"><span class="ic">${m}</span><b>${esc(n)}</b><small>${CAT[c][0]}</small>${u ? `<span class="badge">×${u}</span>` : ''}</div>`).join('');
$('tabs').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  $('tabs').querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
  $('inv').querySelectorAll('.item').forEach(it => { const show = b.dataset.c === 'all' || it.dataset.c === b.dataset.c; it.classList.toggle('hide', !show); if (show) { it.classList.remove('in'); void it.offsetWidth; it.classList.add('in'); } });
});

/* ===== Projects ===== */
$('track').innerHTML = P.map((p, i) => `<article class="pc" style="--c:${p.c}"><div class="art"><span>${String(i + 1).padStart(2, '0')} / 09 · ${esc(p.d)}</span><b>${esc(p.m)}</b></div><div class="bd"><h3>${esc(p.n)}</h3><span class="ev">${esc(p.ev)}</span><p>${esc(p.t)}</p><span class="hi">${esc(p.hi)}</span><div class="chips">${p.st.map(s => `<span>${esc(s)}</span>`).join('')}</div><div class="lk">${p.lk ? p.lk.map(([l, u]) => `<a href="${u}" target="_blank" rel="noopener">${esc(l)} ↗</a>`).join('') : '<em>Private repo · demo on request</em>'}</div></div></article>`).join('');

/* ===== Journey ===== */
$('map').insertAdjacentHTML('beforeend', STOPS.map(([n, d, t, s], i) => `<div class="ms${i === STOPS.length - 1 ? ' boss' : ''}" data-rv="${i % 2 ? 'right' : 'left'}"><span class="node">${n}</span><small>${esc(d)}</small><h4>${esc(t)}</h4><p>${esc(s)}</p></div>`).join(''));
function layoutMap() {
  const map = $('map'), mr = map.getBoundingClientRect(), pts = [...map.querySelectorAll('.ms .node')].map(n => { const r = n.getBoundingClientRect(); return [r.left - mr.left + r.width / 2, r.top - mr.top + r.height / 2]; });
  if (pts.length < 2) return;
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], my = (y0 + y1) / 2; d += ` C ${x0} ${my}, ${x1} ${my}, ${x1} ${y1}`; }
  $('road').setAttribute('d', d); $('drawP').setAttribute('d', d);
}

/* ===== Trophies ===== */
$('trophies').innerHTML = [['3rd', '#FFC93C', 'AWS Cloud Ignite', 'Jul 2025 · 3rd place'], ['3rd', '#FFC93C', 'SMC Expogenix', 'Jul 2025 · 3rd place'], ['★', '#36E8FF', 'Tech Head', 'CSI-MJCET · 2025'], ['×2', '#FF4FA0', 'Lead Developer', 'Synapsify · Robust-3D']].map(([m, col, t, s], i) => `<div class="tr-c" data-rv="rot" style="--dl:${i * .1}s"><span class="medal" style="--m:${col};--dl:-${i * .6}s">${m}</span><b>${t}</b><span>${s}</span></div>`).join('');

/* ===== Contact confetti + copy ===== */
$('confetti').innerHTML = [['coin', 6, 20, 70, -10], ['heart', 88, 16, 54, 12], ['d20', 12, 62, 70, 18], ['pad', 80, 58, 130, -14], ['stick', 4, 36, 110, 8, .7], ['crt', 86, 36, 90, 10, .7]].map(([k, x, y, s, r, o]) => `<div class="confetti" data-rv="rot" style="--x:${x}%;--y:${y}%;--s:${s}px;--r:${r}deg;${o ? 'opacity:' + o : ''}"><div class="stk" style="--w:100%;--r:0deg">${ART[k]}</div></div>`).join('');
$('copy').addEventListener('click', () => { const b = $('copy'); const ok = () => { b.textContent = 'Copied!'; setTimeout(() => b.textContent = 'Copy email', 1600); }; try { navigator.clipboard.writeText('sirkarks@gmail.com').then(ok, () => { const r = document.createRange(); r.selectNodeContents($('mail')); getSelection().removeAllRanges(); getSelection().addRange(r); }); } catch {} });

/* ===== reveal observer ===== */
function countUp(b) { const v = +b.dataset.count, s = b.dataset.s, t0 = performance.now(); const f = n => { const k = Math.min(1, (n - t0) / 1300); b.textContent = Math.round(v * (1 - Math.pow(1 - k, 3))) + s; if (k < 1) requestAnimationFrame(f); }; requestAnimationFrame(f); }
const rio = new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) return; e.target.classList.add('in'); const c = e.target.querySelector('[data-count]'); if (c && !reduce) countUp(c); rio.unobserve(e.target); }), {threshold: .15, rootMargin: '0px 0px -8% 0px'});
document.querySelectorAll('[data-rv]').forEach(el => rio.observe(el));

/* ===== scroll engine ===== */
const pars = [...hero.querySelectorAll('.par')], work = $('work'), track = $('track'), nav = $('nav');
let lastY = scrollY, vel = 0, mx = 0;
/* geometry is measured once per resize so scrolling never forces a layout */
const els = {prog: $('prog'), hl: $('hl'), pbar: $('pbar'), drawP: $('drawP'), marq: $('marq')}, words = [...$('words').children], mss = [...$('map').querySelectorAll('.ms')], secs = [...document.querySelectorAll('main > section[id]')], navA = [...document.querySelectorAll('.links a')];
const sp = pars.map(p => +p.dataset.sp);
let G = {}, lastN = -1, lastCur = null;
function sizeWork() { if (innerWidth <= 760) { work.style.height = ''; return; } work.style.height = (track.scrollWidth - innerWidth + innerHeight + 80) + 'px'; }
const pageTop = el => el.getBoundingClientRect().top + scrollY;
function measure() {
  const w = $('words'), map = $('map');
  G = {vh: innerHeight, wide: innerWidth > 760, H: document.documentElement.scrollHeight - innerHeight, hh: hero.offsetHeight,
    wT: pageTop(w), wH: w.offsetHeight, kT: pageTop(work), kH: work.offsetHeight - innerHeight, shift: track.scrollWidth - innerWidth + 40,
    mT: pageTop(map), mH: map.offsetHeight, msY: mss.map(m => m.offsetTop + m.offsetHeight / 2), sT: secs.map(pageTop), half: els.marq.scrollWidth / 2};
}
function onScroll() {
  const y = scrollY, vh = G.vh;
  els.prog.style.transform = `scaleX(${G.H ? y / G.H : 0})`;
  nav.classList.toggle('sm', y > 30);
  vel += Math.abs(y - lastY); lastY = y;
  if (!reduce && y < G.hh * 1.2) {
    for (let i = 0; i < pars.length; i++) pars[i].style.transform = `translate3d(0,${(-y * sp[i]).toFixed(1)}px,0)`;
    const k = clamp(y / G.hh, 0, 1); els.hl.style.transform = `translateY(calc(-55% + ${(y * .25).toFixed(1)}px)) scale(${1 - k * .12})`; els.hl.style.opacity = 1 - k * 1.1;
  }
  /* about words */
  const p = clamp((vh * .85 - (G.wT - y)) / (G.wH + vh * .4), 0, 1), n = Math.round(p * words.length);
  if (n !== lastN) { for (let i = 0; i < words.length; i++) words[i].classList.toggle('on', i < n); lastN = n; }
  /* pinned work */
  if (G.wide) { const k = clamp((y - G.kT) / G.kH, 0, 1); track.style.transform = `translate3d(${(-G.shift * k).toFixed(1)}px,0,0)`; els.pbar.style.transform = `scaleX(${k})`; }
  /* journey */
  const line = vh * .62 - (G.mT - y);
  els.drawP.style.strokeDashoffset = 1 - clamp(line / G.mH, 0, 1);
  for (let i = 0; i < mss.length; i++) mss[i].classList.toggle('lit', G.msY[i] < line);
  /* active nav link */
  let cur = ''; for (let i = 0; i < secs.length; i++) if (G.sT[i] - y < vh * .4) cur = secs[i].id;
  if (cur !== lastCur) { navA.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + cur)); lastCur = cur; }
}
function relayout() { sizeWork(); layoutMap(); measure(); onScroll(); }
addEventListener('scroll', onScroll, {passive: true});
let rz; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(relayout, 120); });

/* smooth wheel scrolling */
let lenis = null;
if (window.Lenis && !reduce) {
  lenis = new Lenis({lerp: .1, wheelMultiplier: 1, smoothWheel: true});
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]'); if (!a) return;
    const t = a.getAttribute('href') === '#top' ? 0 : document.querySelector(a.getAttribute('href')); if (t === null) return;
    e.preventDefault(); lenis.scrollTo(t, {duration: 1.4});
  });
}

/* ===== frame loop ===== */
let acc = 0, last = performance.now();
const heroVis = {v: true}; new IntersectionObserver(([e]) => heroVis.v = e.isIntersecting).observe(hero);
function frame(now) {
  if (lenis) lenis.raf(now);
  acc += Math.min(.1, Math.max(0, (now - last) / 1000)); last = now;
  while (acc > 1 / 60) { acc -= 1 / 60; if (!reduce) { if (heroVis.v) mini.step(); if (playing) big.step(false); } }
  if (heroVis.v) mini.draw();
  if (overPlay || playing) big.draw();
  vel *= .9; mx -= 1.2 + Math.min(vel, 80) * .15; if (G.half && -mx > G.half) mx += G.half; els.marq.style.transform = `translate3d(${mx.toFixed(1)}px,0,0)`;
  requestAnimationFrame(frame);
}

setPal(store.get('pal', 'sunset'), true);
measure();
document.fonts.ready.then(() => { relayout(); mini.draw(); big.draw(); requestAnimationFrame(frame); });
let ro; new ResizeObserver(() => { clearTimeout(ro); ro = setTimeout(() => { measure(); onScroll(); }, 100); }).observe(document.body);
})();

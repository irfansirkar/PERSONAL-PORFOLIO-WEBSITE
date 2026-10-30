/* Irfan Quest: a playable pixel-art portfolio. No build step and no image assets; everything is drawn in code. */
(() => {
'use strict';

const R = window.RESUME;
const NP = R.projects.length;
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const hash = (x, y, s = 0) => { let h = (x * 374761393 + y * 668265263 + s * 1442695041) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const touchUI = matchMedia('(pointer: coarse)').matches;
const store = {
  get(k, d) { try { const v = localStorage.getItem('irfanquest.' + k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem('irfanquest.' + k, JSON.stringify(v)); } catch {} },
};

/* ================= sound ================= */
const Snd = {
  ctx: null, on: store.get('sound', true),
  init() {
    if (!this.ctx) { try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch {} }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  },
  tone(f, d, type = 'square', v = .05, when = 0) {
    if (!this.on || !this.ctx) return;
    const c = this.ctx, o = c.createOscillator(), g = c.createGain(), t = c.currentTime + when;
    o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(g).connect(c.destination); o.start(t); o.stop(t + d + .02);
  },
  play(n) {
    const seq = (fs, d, type, v, gap) => fs.forEach((f, i) => this.tone(f, d, type, v, i * gap));
    ({
      blip: () => this.tone(620 + Math.random() * 90, .035, 'square', .02),
      pick: () => seq([523, 659, 784, 1047, 1319], .12, 'square', .045, .055),
      lvl: () => seq([392, 523, 659, 784, 1047, 784, 1047, 1319], .14, 'square', .045, .075),
      squash: () => { this.tone(220, .1, 'sawtooth', .05); this.tone(90, .16, 'square', .05, .04); },
      open: () => this.tone(880, .05, 'triangle', .06),
      close: () => this.tone(520, .05, 'triangle', .05),
      ach: () => seq([784, 988, 1175, 1568], .13, 'triangle', .07, .07),
      step: () => this.tone(110 + Math.random() * 30, .025, 'triangle', .025),
      win: () => seq([523, 659, 784, 1047, 784, 1047, 1319, 1568, 2093], .16, 'square', .045, .09),
    })[n]?.();
  },
};

/* ================= world ================= */
const TS = 16, MW = 60, MH = 44;
const G = 0, P = 1, W = 2, T = 3, F = 4, B = 5, S_ = 6, C = 7, N = 8, K = 9, X = 10, O = 11;
const SOLID = new Set([W, T, N, K, X, O]);
const map = new Uint8Array(MW * MH);
const tile = (x, y) => (x < 0 || y < 0 || x >= MW || y >= MH) ? T : map[y * MW + x];
const setT = (x, y, t) => { if (x >= 0 && y >= 0 && x < MW && y < MH) map[y * MW + x] = t; };
const rect = (x, y, w, h, t) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) setT(i, j, t); };
const solidAt = (px, py) => SOLID.has(tile(Math.floor(px / TS), Math.floor(py / TS)));

const BUILDINGS = [
  {id: 'academy', x: 23, y: 3, w: 14, h: 7, door: 29, dw: 2, label: 'ACADEMY', roof: '#B8443A', roof2: '#8E2F28', wall: '#EADBC0'},
  {id: 'guild', x: 4, y: 15, w: 9, h: 6, door: 8, dw: 1, label: 'GUILD HALL', roof: '#3F6FB5', roof2: '#2D5290', wall: '#DCCBA8'},
  {id: 'trophy', x: 48, y: 15, w: 9, h: 6, door: 52, dw: 1, label: 'TROPHIES', roof: '#D29A1E', roof2: '#A97910', wall: '#EEE4CF'},
  {id: 'shrine', x: 6, y: 31, w: 9, h: 6, door: 10, dw: 1, label: 'SKILL SHRINE', roof: '#7B4FB8', roof2: '#5B3690', wall: '#E2D6F0'},
  {id: 'post', x: 46, y: 31, w: 9, h: 6, door: 50, dw: 1, label: 'POST OFFICE', roof: '#2E8B6A', roof2: '#1F6A50', wall: '#E8E0D0'},
];

const PLAYER_PAL = {hair: '#1B1310', skin: '#B97A4F', shirt: '#3D5AFE', dark: '#2B3FCC', pants: '#23263A', extra: 'phones'};
const NPCS = [
  {id: 'byte', name: 'Byte the cat', kind: 'cat', tx: 27, ty: 24},
  {id: 'prof', name: 'Professor Ada', tx: 32, ty: 11, pal: {hair: '#D9D9D9', skin: '#E0B48A', shirt: '#3C8D5A', dark: '#2B6A42', pants: '#3A3226', extra: 'glasses'}},
  {id: 'guild', name: 'Guildmaster Rao', tx: 11, ty: 21, pal: {hair: '#3A2618', skin: '#B97A4F', shirt: '#8A5A2B', dark: '#6A4220', pants: '#2A2A33', extra: 'beard'}},
  {id: 'keeper', name: 'Keeper Noor', tx: 55, ty: 21, pal: {hair: '#1E1E2A', skin: '#C99068', shirt: '#C2402F', dark: '#962E22', pants: '#2A2A33', extra: 'crown'}},
  {id: 'sage', name: 'The Skill Sage', tx: 13, ty: 37, pal: {hair: '#5B3690', skin: '#D7A77C', shirt: '#7B4FB8', dark: '#5B3690', pants: '#5B3690', extra: 'hood'}},
  {id: 'post', name: 'Courier Zed', tx: 53, ty: 37, pal: {hair: '#2B1B12', skin: '#A8693F', shirt: '#2E8B6A', dark: '#1F6A50', pants: '#23263A', extra: 'cap'}},
];
const SPOTS = {
  medimap: [38, 4, 'east of the Academy'],
  medzo: [4, 12, 'in the north-west meadow'],
  stackfarm: [11, 27, 'somewhere in the farm fields'],
  robust3d: [40, 41, 'far south, past the lower road'],
  comparev2: [56, 28, 'in the eastern meadow'],
  teachassist: [20, 6, 'west of the Academy'],
  medimap2: [49, 7, 'on the lake island'],
  skentics: [22, 34, 'deep in the southern forest'],
  domainclash: [52, 13, 'between the lake and the Trophy Hall'],
};
const BUG_DEFS = [['nan', 14, 8], ['slime', 35, 30], ['ghost', 44, 26], ['nan', 52, 28], ['slime', 17, 40], ['ghost', 38, 14], ['nan', 6, 9]];
const BUG_NAMES = {nan: 'NaN Bug', slime: 'Overfit Slime', ghost: 'Vanishing Gradient'};

function buildMap() {
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
    const h = hash(x, y);
    map[y * MW + x] = h < .035 ? T : h < .041 ? K : h < .1 ? F : G;
  }
  rect(0, 0, MW, 2, T); rect(0, MH - 2, MW, 2, T); rect(0, 0, 2, MH, T); rect(MW - 2, 0, 2, MH, T);
  rect(41, 3, 15, 9, W); [[41, 3], [42, 3], [55, 3], [41, 11], [42, 11], [55, 11], [55, 10]].forEach(([x, y]) => setT(x, y, G));
  rect(47, 6, 4, 3, S_); rect(41, 7, 6, 1, B); rect(37, 7, 4, 1, P);
  rect(3, 24, 12, 7, N); rect(4, 25, 10, 5, C); rect(8, 24, 2, 1, P);
  for (let y = 27; y < 37; y++) for (let x = 18; x < 28; x++) setT(x, y, hash(x, y, 3) < .7 ? T : G);
  [[21, 26, 1, 6], [21, 31, 5, 1], [25, 31, 1, 4], [22, 34, 4, 1]].forEach(([x, y, w, h]) => rect(x, y, w, h, G));
  rect(29, 10, 2, 30, P); rect(8, 22, 46, 2, P); rect(8, 38, 44, 2, P); rect(25, 19, 10, 8, P); rect(29, 21, 2, 2, O);
  rect(8, 21, 2, 1, P); rect(52, 21, 2, 1, P); rect(10, 37, 2, 1, P); rect(50, 37, 2, 1, P);
  for (const b of BUILDINGS) rect(b.x, b.y, b.w, b.h, X);
  const clear = (tx, ty) => {
    for (let y = ty - 1; y <= ty + 1; y++) for (let x = tx - 1; x <= tx + 1; x++)
      if ((tile(x, y) === T || tile(x, y) === K) && x > 1 && y > 1 && x < MW - 2 && y < MH - 2) setT(x, y, G);
  };
  NPCS.forEach(n => clear(n.tx, n.ty));
  Object.values(SPOTS).forEach(([x, y]) => clear(x, y));
  BUG_DEFS.forEach(([, x, y]) => clear(x, y));
  clear(33, 24); clear(30, 25);
}

/* ================= static art (pre-rendered once) ================= */
const worldCv = document.createElement('canvas');
worldCv.width = MW * TS; worldCv.height = MH * TS;
const wc = worldCv.getContext('2d');
const box = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };

function drawGrass(x, y, tx, ty) {
  box(wc, x, y, 16, 16, '#5DA85A');
  for (let i = 0; i < 3; i++) box(wc, x + ((hash(tx, ty, i + 1) * 14) | 0), y + ((hash(tx, ty, i + 9) * 14) | 0), 1, 2, '#4C9449');
  if (hash(tx, ty, 7) < .25) box(wc, x + ((hash(tx, ty, 8) * 13) | 0), y + 12, 2, 1, '#73BD6C');
}
function drawTile(t, tx, ty) {
  const x = tx * TS, y = ty * TS, h = hash(tx, ty, 7);
  switch (t) {
    case F: {
      drawGrass(x, y, tx, ty);
      const col = ['#FFE066', '#FF8FB1', '#FFFFFF', '#B9A7F5'][(h * 4) | 0];
      [[3, 4], [10, 8], [6, 11]].forEach(([a, b], i) => { if (hash(tx, ty, 20 + i) < .75) { box(wc, x + a, y + b + 2, 1, 2, '#3E7E3B'); box(wc, x + a - 1, y + b, 3, 2, col); box(wc, x + a, y + b, 1, 1, '#FFF6C8'); } });
      break;
    }
    case P: case O: {
      box(wc, x, y, 16, 16, '#D9C089');
      for (let i = 0; i < 4; i++) box(wc, x + ((hash(tx, ty, i + 30) * 14) | 0), y + ((hash(tx, ty, i + 40) * 15) | 0), 2, 1, '#C4A86F');
      const pathy = v => v === P || v === O || v === B;
      if (!pathy(tile(tx, ty - 1))) box(wc, x, y, 16, 1, '#B89A62');
      if (!pathy(tile(tx, ty + 1))) box(wc, x, y + 15, 16, 1, '#B89A62');
      if (!pathy(tile(tx - 1, ty))) box(wc, x, y, 1, 16, '#B89A62');
      if (!pathy(tile(tx + 1, ty))) box(wc, x + 15, y, 1, 16, '#B89A62');
      break;
    }
    case W: case B:
      box(wc, x, y, 16, 16, '#3C7FD1');
      if (tile(tx, ty - 1) !== W && tile(tx, ty - 1) !== B) box(wc, x, y, 16, 2, '#A8D8FF');
      if (tile(tx, ty + 1) !== W && tile(tx, ty + 1) !== B) box(wc, x, y + 14, 16, 2, '#2F6AB4');
      if (t === B) {
        box(wc, x, y + 2, 16, 12, '#A8743E');
        for (let i = 0; i < 4; i++) box(wc, x + i * 4, y + 2, 1, 12, '#7D5229');
        box(wc, x, y + 2, 16, 1, '#C99258'); box(wc, x, y + 13, 16, 1, '#6B4423');
      }
      break;
    case S_:
      box(wc, x, y, 16, 16, '#E9D59B');
      for (let i = 0; i < 3; i++) box(wc, x + ((hash(tx, ty, i + 50) * 15) | 0), y + ((hash(tx, ty, i + 60) * 15) | 0), 1, 1, '#CDB677');
      break;
    case C:
      box(wc, x, y, 16, 16, '#7A5230');
      [2, 7, 12].forEach(r => {
        box(wc, x, y + r + 2, 16, 1, '#5E3E22');
        for (let i = 0; i < 3; i++) { const sx = x + 2 + i * 5; box(wc, sx, y + r, 1, 2, '#7BC86C'); box(wc, sx + 1, y + r, 1, 1, '#A6E29A'); }
      });
      break;
    case N:
      drawGrass(x, y, tx, ty);
      box(wc, x, y + 6, 16, 2, '#A86E37'); box(wc, x, y + 10, 16, 2, '#A86E37');
      box(wc, x + 1, y + 4, 3, 10, '#8B5A2B'); box(wc, x + 12, y + 4, 3, 10, '#8B5A2B');
      box(wc, x + 1, y + 4, 3, 1, '#C99258'); box(wc, x + 12, y + 4, 3, 1, '#C99258');
      break;
    case K:
      drawGrass(x, y, tx, ty);
      box(wc, x + 3, y + 7, 10, 6, '#8A8F9C'); box(wc, x + 4, y + 5, 8, 2, '#A3A9B7'); box(wc, x + 5, y + 6, 3, 2, '#C6CBD6'); box(wc, x + 3, y + 13, 10, 1, '#5D616C');
      break;
    case T:
      drawGrass(x, y, tx, ty);
      box(wc, x + 2, y + 14, 12, 2, 'rgba(0,0,0,.18)');
      box(wc, x + 6, y + 10, 4, 5, '#6B4423'); box(wc, x + 6, y + 10, 1, 5, '#87592F');
      box(wc, x + 3, y, 10, 1, '#2E7D3A'); box(wc, x + 2, y + 1, 12, 10, '#2E7D3A'); box(wc, x + 1, y + 3, 14, 6, '#2E7D3A');
      box(wc, x + 2, y + 9, 12, 2, '#24642E'); box(wc, x + 4, y + 2, 4, 3, '#46A055'); box(wc, x + 3, y + 3, 2, 2, '#46A055'); box(wc, x + 9, y + 5, 2, 2, '#3B9149');
      break;
    default:
      drawGrass(x, y, tx, ty);
  }
}
function drawBuilding(b) {
  const x = b.x * TS, y = b.y * TS, w = b.w * TS, h = b.h * TS, roofH = Math.ceil(b.h * .55) * TS;
  box(wc, x + 4, y + h, w, 4, 'rgba(0,0,0,.2)');
  box(wc, x, y + roofH - 4, w, h - roofH + 4, b.wall);
  for (let yy = y + roofH + 2; yy < y + h - 3; yy += 5) box(wc, x, yy, w, 1, 'rgba(0,0,0,.07)');
  box(wc, x, y + h - 3, w, 3, '#8A7860');
  for (let i = 1; i < b.w - 1; i += 3) {
    if (b.x + i + 1 >= b.door - 1 && b.x + i <= b.door + b.dw) continue;
    const wx = x + i * TS + 2, wy = y + roofH + 3;
    box(wc, wx, wy, 12, 9, '#5A4A3A'); box(wc, wx + 1, wy + 1, 10, 7, '#9FD8FF'); box(wc, wx + 1, wy + 1, 4, 2, '#E0F4FF'); box(wc, wx + 5, wy + 1, 1, 7, '#5A4A3A');
    box(wc, wx - 1, wy + 9, 14, 2, '#8A7860');
  }
  const dw = b.dw * TS - 6, dx = b.door * TS + 3;
  box(wc, dx - 1, y + h - 18, dw + 2, 18, '#4A3426'); box(wc, dx, y + h - 17, dw, 17, '#7A4E2D');
  for (let i = 3; i < dw; i += 4) box(wc, dx + i, y + h - 17, 1, 17, '#6A4226');
  box(wc, dx + dw - 4, y + h - 9, 2, 2, '#FFC94A');
  box(wc, x - 3, y, w + 6, roofH, b.roof);
  for (let r = y + 3, k = 0; r < y + roofH - 2; r += 4, k++) for (let c = x - 3 + (k % 2 ? 0 : 4); c < x + w + 3; c += 8) box(wc, c, r, 6, 1, b.roof2);
  box(wc, x - 3, y, w + 6, 2, 'rgba(255,255,255,.2)'); box(wc, x - 3, y + roofH - 3, w + 6, 3, b.roof2);
  wc.font = '8px Silkscreen, monospace'; wc.textBaseline = 'top';
  const tw = Math.ceil(wc.measureText(b.label).width), cx = (b.door + b.dw / 2) * TS, sx = Math.round(cx - tw / 2 - 5), sy = y + roofH - 4;
  box(wc, sx, sy, tw + 10, 12, '#3B2416'); box(wc, sx + 1, sy + 1, tw + 8, 10, '#C99258');
  wc.fillStyle = '#2B1A10'; wc.fillText(b.label, sx + 5, sy + 2);
}
function drawFountainBase() {
  const x = 29 * TS, y = 21 * TS;
  box(wc, x - 2, y + 2, 36, 30, '#8790A3'); box(wc, x, y, 32, 32, '#9AA3B5'); box(wc, x, y, 32, 2, '#C3CAD8');
  box(wc, x + 3, y + 4, 26, 24, '#3C7FD1'); box(wc, x + 3, y + 4, 26, 2, '#2F6AB4');
  box(wc, x + 13, y + 10, 6, 14, '#9AA3B5'); box(wc, x + 11, y + 22, 10, 3, '#8790A3');
}
function prerender() {
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) drawTile(tile(x, y), x, y);
  BUILDINGS.forEach(drawBuilding);
  drawFountainBase();
  buildMinimapBase();
}

/* ================= sprites ================= */
function drawPerson(c, x, y, pal, dir, frame, bob = 0) {
  const X = Math.round(x) - 6, Y = Math.round(y) - 16 + bob;
  const p = (a, b, w, h, col) => { c.fillStyle = col; c.fillRect(X + a, Y + b, w, h); };
  c.fillStyle = 'rgba(0,0,0,.22)'; c.fillRect(X + 2, Math.round(y) - 1, 8, 2);
  const up1 = frame === 1, up2 = frame === 3;
  p(3, 12, 2, up1 ? 2 : 3, pal.pants); p(7, 12, 2, up2 ? 2 : 3, pal.pants);
  p(3, up1 ? 14 : 15, 2, 1, '#F2F2F2'); p(7, up2 ? 14 : 15, 2, 1, '#F2F2F2');
  if (pal.extra === 'hood') p(2, 7, 8, 8, pal.shirt);
  p(2, 7, 8, 5, pal.shirt); p(2, 11, 8, 1, pal.dark);
  if (dir === 'left' || dir === 'right') { p(dir === 'left' ? 4 : 6, 8, 2, 3, pal.dark); p(dir === 'left' ? 4 : 6, 11, 2, 1, pal.skin); }
  else { p(1, 8, 1, 3, pal.shirt); p(10, 8, 1, 3, pal.shirt); p(1, 11, 1, 1, pal.skin); p(10, 11, 1, 1, pal.skin); }
  p(3, 2, 6, 5, pal.skin);
  p(2, 0, 8, 3, pal.hair);
  if (dir === 'up') p(2, 2, 8, 5, pal.hair);
  else if (dir === 'left') { p(7, 2, 3, 4, pal.hair); p(3, 4, 1, 2, '#1A1A24'); }
  else if (dir === 'right') { p(2, 2, 3, 4, pal.hair); p(8, 4, 1, 2, '#1A1A24'); }
  else { p(2, 3, 1, 2, pal.hair); p(9, 3, 1, 2, pal.hair); p(4, 4, 1, 2, '#1A1A24'); p(7, 4, 1, 2, '#1A1A24'); }
  switch (pal.extra) {
    case 'glasses': if (dir !== 'up') { if (dir === 'down') { p(3, 4, 3, 1, '#2A2A33'); p(6, 4, 3, 1, '#2A2A33'); } else p(dir === 'left' ? 2 : 7, 4, 3, 1, '#2A2A33'); } break;
    case 'beard': if (dir !== 'up') p(3, 5, 6, 3, pal.hair); break;
    case 'crown': p(3, -2, 6, 2, '#FFC94A'); p(3, -3, 1, 1, '#FFC94A'); p(5, -3, 2, 1, '#FFC94A'); p(8, -3, 1, 1, '#FFC94A'); p(5, -2, 2, 1, '#FF5D8F'); break;
    case 'hood': p(1, 0, 10, 3, pal.shirt); p(1, 3, 2, 5, pal.shirt); p(9, 3, 2, 5, pal.shirt); break;
    case 'cap': p(2, -1, 8, 2, pal.shirt); if (dir !== 'up') p(dir === 'left' ? 0 : dir === 'right' ? 8 : 2, 1, 4, 1, pal.dark); break;
    case 'phones': p(2, -1, 8, 1, '#FF5A36'); if (dir !== 'left') p(1, 2, 2, 3, '#FF5A36'); if (dir !== 'right') p(9, 2, 2, 3, '#FF5A36'); break;
  }
}
function drawCat(c, x, y, flip, t) {
  c.save(); c.translate(Math.round(x), Math.round(y)); if (flip) c.scale(-1, 1);
  const p = (a, b, w, h, col) => { c.fillStyle = col; c.fillRect(a - 6, b - 11, w, h); };
  c.fillStyle = 'rgba(0,0,0,.22)'; c.fillRect(-5, -1, 10, 2);
  const tail = Math.sin(t * 4) > 0 ? 0 : 1;
  p(0, 3 + tail, 2, 1, '#E0862C'); p(1, 4, 1, 2, '#E0862C');
  p(2, 5, 8, 4, '#F29A3A'); p(3, 6, 2, 1, '#E0862C'); p(6, 6, 2, 1, '#E0862C');
  p(3, 9, 1, 1, '#E0862C'); p(8, 9, 1, 1, '#E0862C');
  p(6, 1, 6, 5, '#F29A3A'); p(6, 0, 1, 1, '#F29A3A'); p(11, 0, 1, 1, '#F29A3A');
  const blink = (t % 3.2) < .12;
  p(8, 3, 1, blink ? 0 : 1, '#1A1A24'); p(10, 3, 1, blink ? 0 : 1, '#1A1A24'); p(9, 4, 1, 1, '#FF8FB1');
  p(6, 6, 5, 1, '#3D5AFE'); p(8, 7, 1, 1, '#FFC94A');
  c.restore();
}
function drawCrystal(c, e, t) {
  const x = Math.round(e.x), y = Math.round(e.y);
  box(c, x - 6, y + 1, 12, 3, '#8A8F9C'); box(c, x - 5, y, 10, 1, '#B8BECB'); box(c, x - 6, y + 4, 12, 1, '#5D616C');
  if (S.crystals.includes(e.id)) { box(c, x - 2, y - 1, 4, 1, '#5D616C'); return; }
  const fy = Math.round(y - 13 + Math.sin(t * 2.4 + e.i) * 2), col = e.p.color;
  c.globalAlpha = .22 + .12 * Math.sin(t * 3 + e.i);
  c.fillStyle = col; c.beginPath(); c.arc(x, fy + 4, 11, 0, 7); c.fill();
  c.globalAlpha = 1;
  [2, 4, 6, 8, 8, 6, 4, 2].forEach((w, r) => {
    box(c, x - w / 2, fy + r, w, 1, col);
    box(c, x - w / 2, fy + r, Math.max(1, w / 4), 1, 'rgba(255,255,255,.65)');
    box(c, x + w / 2 - 1, fy + r, 1, 1, 'rgba(0,0,0,.25)');
  });
  if (((t * 2 + e.i) % 2) < .15) box(c, x + 2, fy - 2, 1, 1, '#FFFFFF');
}
function drawBug(c, b, t) {
  const x = Math.round(b.x), y = Math.round(b.y), ph = t * (b.alert ? 14 : 6) + b.ph;
  c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(x - 5, y - 1, 10, 2);
  if (b.kind === 'nan') {
    const l = Math.sin(ph) > 0 ? 1 : 0;
    box(c, x - 6, y - 5 + l, 1, 2, '#2A1A1A'); box(c, x + 5, y - 5 + (1 - l), 1, 2, '#2A1A1A'); box(c, x - 6, y - 2 + (1 - l), 1, 2, '#2A1A1A'); box(c, x + 5, y - 2 + l, 1, 2, '#2A1A1A');
    box(c, x - 5, y - 7, 10, 6, '#E5484D'); box(c, x - 4, y - 8, 8, 1, '#E5484D'); box(c, x, y - 8, 1, 7, '#9E2A2F');
    box(c, x - 3, y - 6, 2, 1, '#FF9A9D'); box(c, x - 3, y - 10, 6, 2, '#2A1A1A'); box(c, x - 2, y - 10, 1, 1, '#FFF'); box(c, x + 1, y - 10, 1, 1, '#FFF');
  } else if (b.kind === 'slime') {
    const s = Math.sin(ph), w = Math.round(11 + s * 2), h = Math.round(8 - s * 1.5);
    box(c, x - w / 2, y - h, w, h, '#4ADE80'); box(c, x - w / 2 + 1, y - h - 1, w - 2, 1, '#4ADE80'); box(c, x - w / 2, y - 1, w, 1, '#2BA35C');
    box(c, x - w / 2 + 2, y - h + 1, 2, 2, '#C8FBD9'); box(c, x - 2, y - h + 3, 1, 2, '#103020'); box(c, x + 2, y - h + 3, 1, 2, '#103020');
  } else {
    c.globalAlpha = .45 + .4 * Math.abs(Math.sin(ph * .4));
    const fy = y - 3 + Math.round(Math.sin(ph * .5) * 2);
    box(c, x - 5, fy - 10, 10, 9, '#B9A7F5'); box(c, x - 4, fy - 11, 8, 1, '#B9A7F5');
    const o = Math.sin(ph) > 0 ? 0 : 1;
    box(c, x - 5, fy - 1, 2, 2 - o, '#B9A7F5'); box(c, x - 1, fy - 1, 2, 1 + o, '#B9A7F5'); box(c, x + 3, fy - 1, 2, 2 - o, '#B9A7F5');
    box(c, x - 3, fy - 8, 2, 2, '#2A1A4A'); box(c, x + 1, fy - 8, 2, 2, '#2A1A4A');
    c.globalAlpha = 1;
  }
  if (b.alert) { box(c, x - 1, y - 20, 2, 4, '#FFC94A'); box(c, x - 1, y - 15, 2, 1, '#FFC94A'); }
}
function drawBoard(c, e) {
  const x = Math.round(e.x), y = Math.round(e.y);
  c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(x - 8, y - 1, 16, 2);
  box(c, x - 6, y - 8, 2, 8, '#6B4423'); box(c, x + 4, y - 8, 2, 8, '#6B4423');
  box(c, x - 9, y - 19, 18, 12, '#8B5A2B'); box(c, x - 8, y - 18, 16, 10, '#A8743E');
  box(c, x - 7, y - 17, 5, 4, '#F2E8CF'); box(c, x - 1, y - 16, 6, 5, '#FFE7A8'); box(c, x - 6, y - 12, 4, 3, '#E0F4FF');
  box(c, x - 5, y - 18, 1, 1, '#C2402F'); box(c, x + 1, y - 17, 1, 1, '#3D5AFE');
}

/* ================= state ================= */
const fresh = () => ({xp: 0, crystals: [], talked: [], bugs: [], contact: false, ach: [], pos: null, tPlay: 0, ended: false, resumeSeen: false, started: false});
let S = Object.assign(fresh(), store.get('save', {}));
const save = () => { if (S.started) { S.pos = {x: player.x, y: player.y}; store.set('save', S); } };

// LV 10 lines up with 100%: 6 characters × 60, 9 crystals × 120, 7 bugs × 30, contact 50.
const LV = [0, 80, 200, 350, 520, 720, 940, 1160, 1420, 1700];
const levelOf = xp => { let l = 1; for (let i = 1; i < LV.length; i++) if (xp >= LV[i]) l = i + 1; return l; };

const QUESTS = [
  {id: 'byte', t: 'Meet Byte at the fountain', done: () => S.talked.includes('byte'), target: 'byte'},
  {id: 'prof', t: 'Visit the Academy (education)', done: () => S.talked.includes('prof'), target: 'prof'},
  {id: 'guild', t: 'Check in at the Guild Hall (experience)', done: () => S.talked.includes('guild'), target: 'guild'},
  {id: 'keeper', t: 'Inspect the Trophy Hall (awards)', done: () => S.talked.includes('keeper'), target: 'keeper'},
  {id: 'sage', t: 'Consult the Skill Sage (skills)', done: () => S.talked.includes('sage'), target: 'sage'},
  {id: 'crystals', t: `Collect all ${NP} Data Crystals (projects)`, done: () => S.crystals.length >= NP, prog: () => `${S.crystals.length}/${NP}`},
  {id: 'bugs', t: 'Squash all 7 bugs loose in town', done: () => S.bugs.length >= BUG_DEFS.length, prog: () => `${S.bugs.length}/${BUG_DEFS.length}`},
  {id: 'contact', t: 'Send Irfan a message at the Post Office', done: () => S.contact, target: 'post'},
];
const allDone = () => QUESTS.every(q => q.done());

const ACH = [
  ['first-crystal', 'First Crystal', 'Found your first project', () => S.crystals.length >= 1],
  ['half', 'Halfway Hoarder', `${Math.ceil(NP / 2)} of ${NP} projects found`, () => S.crystals.length >= Math.ceil(NP / 2)],
  ['all-crystals', 'Data Hoarder', 'Every project collected', () => S.crystals.length >= NP],
  ['first-bug', 'First Squash', 'Fixed your first bug', () => S.bugs.length >= 1],
  ['all-bugs', 'Zero Bugs in Prod', 'Every bug squashed', () => S.bugs.length >= BUG_DEFS.length],
  ['social', 'Networker', 'Talked to everyone in town', () => NPCS.every(n => S.talked.includes(n.id))],
  ['lv5', 'Level 5', 'Halfway to max level', () => levelOf(S.xp) >= 5],
  ['max', 'Max Level', 'Reached LV 10', () => levelOf(S.xp) >= 10],
  ['recruiter', 'Efficiency Expert', 'Opened the plain resume', () => S.resumeSeen],
  ['complete', 'Quest Complete', 'Finished 100% of Irfan Quest', () => allDone()],
  ['speed', 'Speedrunner', '100% in under 6 minutes', () => allDone() && S.tPlay < 360],
];
function checkAch() {
  for (const [id, name] of ACH.filter(a => !S.ach.includes(a[0]) && a[3]())) {
    S.ach.push(id); toast('ACHIEVEMENT UNLOCKED', name); Snd.play('ach');
  }
}

const skillUnlocked = from => from.some(id => S.crystals.includes(id) || S.talked.includes(id));
const unlockedSkills = () => R.skills.flatMap(b => b.items.filter(([, from]) => skillUnlocked(from)).map(([n]) => n));

/* ================= entities ================= */
const player = {x: 0, y: 0, dir: 'down', moving: false, anim: 0, path: null, pending: null, stepT: 0};
const npcs = NPCS.map(n => ({...n, type: 'npc', x: n.tx * TS + 8, y: n.ty * TS + 14}));
const board = {id: 'board', type: 'board', name: 'Quest board', x: 33 * TS + 8, y: 24 * TS + 14};
const crystals = R.projects.map((p, i) => ({type: 'crystal', id: p.id, p, i, x: SPOTS[p.id][0] * TS + 8, y: SPOTS[p.id][1] * TS + 12}));
let bugs = [];
const spawnBugs = () => { bugs = BUG_DEFS.map(([kind, tx, ty], i) => ({id: i, kind, x: tx * TS + 8, y: ty * TS + 12, hx: tx * TS + 8, hy: ty * TS + 12, wx: 0, wy: 0, t: 0, alert: false, dead: S.bugs.includes(i), ph: Math.random() * 6})); };
const interactables = () => [...npcs, board];
const SPAWN = {x: 30 * TS, y: 25 * TS + 10};

/* ================= particles & floating text ================= */
let parts = [], floats = [], shake = 0;
function burst(x, y, cols, n = 18, power = 70) {
  if (reduce) n = Math.min(n, 6);
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, s = power * (.4 + Math.random() * .8);
    parts.push({x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 30, life: .6 + Math.random() * .5, max: 1.1, col: cols[i % cols.length], sz: Math.random() < .3 ? 2 : 1, g: 120});
  }
}
function confetti(x, y) { burst(x, y, ['#FFC94A', '#FF5D8F', '#5B8CFF', '#4ADE80', '#B9A7F5', '#FFFFFF'], 50, 140); }
const floatText = (x, y, text, col = '#FFC94A') => floats.push({x, y, text, col, life: 1.4});

/* ================= sizing & camera ================= */
const cv = $('game'), ctx = cv.getContext('2d');
let VW = 320, VH = 180, scale = 3;
const cam = {x: 0, y: 0};
function resize() {
  const w = innerWidth, h = innerHeight;
  scale = Math.max(2, Math.floor(Math.min(w / (22 * TS), h / (13 * TS))));
  VW = Math.ceil(w / scale); VH = Math.ceil(h / scale);
  cv.width = VW; cv.height = VH; cv.style.width = VW * scale + 'px'; cv.style.height = VH * scale + 'px';
  ctx.imageSmoothingEnabled = false;
}
function camTarget(x, y) {
  return {
    x: VW >= MW * TS ? (MW * TS - VW) / 2 : clamp(x - VW / 2, 0, MW * TS - VW),
    y: VH >= MH * TS ? (MH * TS - VH) / 2 : clamp(y - VH / 2, 0, MH * TS - VH),
  };
}

/* ================= movement & pathfinding ================= */
const blocked = (x, y, r = 4) => solidAt(x - r, y - 5) || solidAt(x + r - 1, y - 5) || solidAt(x - r, y - 1) || solidAt(x + r - 1, y - 1);
function findPath(sx, sy, gx, gy) {
  const ok = (x, y) => !SOLID.has(tile(x, y));
  if (!ok(gx, gy)) {
    let best = null, bd = 1e9;
    for (let y = gy - 2; y <= gy + 2; y++) for (let x = gx - 2; x <= gx + 2; x++) if (ok(x, y)) { const d = Math.hypot(x - gx, y - gy); if (d < bd) { bd = d; best = [x, y]; } }
    if (!best) return null; [gx, gy] = best;
  }
  const prev = new Int32Array(MW * MH).fill(-1), start = sy * MW + sx, goal = gy * MW + gx, q = [start];
  prev[start] = start;
  for (let qi = 0; qi < q.length; qi++) {
    const cur = q[qi]; if (cur === goal) break;
    const cx = cur % MW, cy = (cur / MW) | 0;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = cx + dx, ny = cy + dy, ni = ny * MW + nx;
      if (ok(nx, ny) && prev[ni] === -1) { prev[ni] = cur; q.push(ni); }
    }
  }
  if (prev[goal] === -1) return null;
  const out = [];
  for (let c = goal; c !== start; c = prev[c]) out.push([(c % MW) * TS + 8, ((c / MW) | 0) * TS + 12]);
  return out.reverse();
}

const keys = {};
const stick = {active: false, x: 0, y: 0};
function updatePlayer(dt) {
  let vx = (keys.right ? 1 : 0) - (keys.left ? 1 : 0), vy = (keys.down ? 1 : 0) - (keys.up ? 1 : 0);
  if (stick.active) { vx += stick.x; vy += stick.y; }
  if (Math.hypot(vx, vy) > .15) { player.path = null; player.pending = null; }
  else if (player.path) {
    const [tx, ty] = player.path[0], dx = tx - player.x, dy = ty - player.y, d = Math.hypot(dx, dy);
    if (d < 2) { player.path.shift(); if (!player.path.length) player.path = null; }
    else { vx = dx / d; vy = dy / d; }
  }
  if (player.pending && Math.hypot(player.pending.x - player.x, player.pending.y - player.y) < 22) {
    const e = player.pending; player.pending = null; player.path = null; player.moving = false;
    face(e); interact(e); return;
  }
  const len = Math.hypot(vx, vy);
  player.moving = len > .15;
  if (!player.moving) { player.anim = 0; return; }
  vx /= Math.max(1, len); vy /= Math.max(1, len);
  const sp = 84 * dt;
  if (!blocked(player.x + vx * sp, player.y)) player.x += vx * sp;
  if (!blocked(player.x, player.y + vy * sp)) player.y += vy * sp;
  player.dir = Math.abs(vx) > Math.abs(vy) ? (vx > 0 ? 'right' : 'left') : (vy > 0 ? 'down' : 'up');
  player.anim += dt * 8;
  player.stepT -= dt;
  if (player.stepT <= 0) { player.stepT = .28; Snd.play('step'); if (!reduce && Math.random() < .5) parts.push({x: player.x, y: player.y - 1, vx: (Math.random() - .5) * 10, vy: -8, life: .35, max: .35, col: '#E8DDB5', sz: 1, g: 0}); }
}
function face(e) {
  const dx = e.x - player.x, dy = e.y - player.y;
  player.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
}

function updateBugs(dt) {
  for (const b of bugs) {
    if (b.dead) continue;
    const dx = b.x - player.x, dy = b.y - player.y, d = Math.hypot(dx, dy) || 1;
    if (d < 11 && mode === 'play') { squash(b); continue; }
    let vx, vy, sp;
    if (d < 58) { vx = dx / d; vy = dy / d; sp = 60; b.alert = true; }
    else {
      b.alert = false; b.t -= dt;
      if (b.t <= 0) { b.t = 1 + Math.random() * 2; const a = Math.random() * 6.283; [b.wx, b.wy] = Math.random() < .3 ? [0, 0] : [Math.cos(a), Math.sin(a)]; }
      const hx = b.hx - b.x, hy = b.hy - b.y, hd = Math.hypot(hx, hy);
      if (hd > TS * 6) { b.wx = hx / hd; b.wy = hy / hd; }
      vx = b.wx; vy = b.wy; sp = 22;
    }
    const m = sp * dt;
    let moved = false;
    if (!blocked(b.x + vx * m, b.y, 3)) { b.x += vx * m; moved = true; }
    if (!blocked(b.x, b.y + vy * m, 3)) { b.y += vy * m; moved = true; }
    if (!moved && b.alert) {
      const sx = -vy, sy = vx, sgn = (b.id % 2) ? 1 : -1;
      if (!blocked(b.x + sx * m * sgn, b.y + sy * m * sgn, 3)) { b.x += sx * m * sgn; b.y += sy * m * sgn; }
    }
  }
}

/* ================= game events ================= */
function gainXP(n, x, y, label) {
  const before = levelOf(S.xp);
  S.xp += n;
  floatText(x, y - 22, `+${n} XP`);
  if (label) floatText(x, y - 32, label, '#FFFFFF');
  const after = levelOf(S.xp);
  if (after > before) {
    setTimeout(() => { toast('LEVEL UP!', `LV ${after}`, 'lvl'); Snd.play('lvl'); confetti(player.x, player.y - 10); }, 350);
  }
  updateHUD(); checkAch(); save();
}
function squash(b) {
  b.dead = true; S.bugs.push(b.id);
  burst(b.x, b.y - 4, b.kind === 'nan' ? ['#E5484D', '#2A1A1A', '#FFFFFF'] : b.kind === 'slime' ? ['#4ADE80', '#C8FBD9'] : ['#B9A7F5', '#FFFFFF'], 22, 90);
  if (!reduce) shake = 4;
  Snd.play('squash');
  gainXP(30, b.x, b.y, `${BUG_NAMES[b.kind]} fixed`);
  afterAction();
}
function collect(e) {
  const before = new Set(unlockedSkills());
  S.crystals.push(e.id);
  burst(e.x, e.y - 12, [e.p.color, '#FFFFFF', '#FFC94A'], 30, 110);
  Snd.play('pick');
  gainXP(120, e.x, e.y);
  openProject(e.p, unlockedSkills().filter(s => !before.has(s)));
}
function afterAction() {
  updateHUD();
  if (paused() || S.ended || !allDone() || mode !== 'play') return;
  S.ended = true; save(); checkAch();
  confetti(player.x, player.y - 10); Snd.play('win');
  setTimeout(openEnding, 900);
}

/* ================= dialog ================= */
const Dlg = {
  open: false, pages: [], i: 0, shown: 0, acc: 0, sel: 0, onEnd: null,
  start(who, pages, onEnd) {
    this.open = true; this.pages = pages.slice(); this.i = 0; this.onEnd = onEnd || null;
    $('dialog').hidden = false; $('dlgName').textContent = who.name; drawFace(who);
    this.page(); syncTouch();
  },
  cur() { const p = this.pages[this.i]; return typeof p === 'string' ? {t: p} : p; },
  page() { this.shown = 0; this.acc = 0; this.sel = 0; $('dlgText').textContent = ''; $('dlgChoices').innerHTML = ''; $('dlgNext').hidden = true; if (reduce) this.finish(); },
  tick(dt) {
    if (!this.open) return;
    const t = this.cur().t;
    if (this.shown >= t.length) return;
    this.acc += dt * 60;
    const n = Math.min(t.length, Math.floor(this.acc));
    if (n > this.shown) { if ((n >> 1) !== (this.shown >> 1) && t[n - 1] !== ' ') Snd.play('blip'); this.shown = n; $('dlgText').textContent = t.slice(0, n); }
    if (this.shown >= t.length) this.finish();
  },
  finish() {
    const pg = this.cur(); this.shown = pg.t.length; $('dlgText').textContent = pg.t;
    if (pg.choices) {
      $('dlgChoices').innerHTML = pg.choices.map((c, k) => `<button type="button" data-k="${k}" class="${k === this.sel ? 'sel' : ''}">${esc(c.l)}</button>`).join('');
    } else $('dlgNext').hidden = false;
  },
  advance() {
    const pg = this.cur();
    if (this.shown < pg.t.length) { this.finish(); return; }
    if (pg.choices) { this.choose(this.sel); return; }
    this.next();
  },
  move(d) {
    const pg = this.cur(); if (!pg.choices || this.shown < pg.t.length) return;
    this.sel = (this.sel + d + pg.choices.length) % pg.choices.length;
    [...$('dlgChoices').children].forEach((b, k) => b.classList.toggle('sel', k === this.sel));
    Snd.play('blip');
  },
  choose(k) {
    const ch = this.cur().choices?.[k]; if (!ch) return;
    Snd.play('open');
    if (ch.close) { this.end(); ch.f && ch.f(); return; }
    const more = ch.f ? ch.f() : null;
    if (Array.isArray(more)) this.pages.splice(this.i + 1, 0, ...more);
    this.next();
  },
  next() { this.i++; if (this.i >= this.pages.length) this.end(); else this.page(); },
  end() {
    if (!this.open) return;
    this.open = false; $('dialog').hidden = true;
    const f = this.onEnd; this.onEnd = null; f && f();
    syncTouch(); afterAction();
  },
};
$('dialog').addEventListener('click', e => {
  const b = e.target.closest('button[data-k]');
  if (b) { Dlg.choose(+b.dataset.k); return; }
  Dlg.advance();
});
function drawFace(who) {
  const c = $('dlgFace').getContext('2d');
  c.clearRect(0, 0, 16, 20);
  if (who.kind === 'cat') drawCat(c, 8, 17, false, 0);
  else if (who.pal) drawPerson(c, 8, 19, who.pal, 'down', 0);
  else if (who.type === 'board') drawBoard(c, {x: 8, y: 19});
}

function nextQuestText() {
  const q = QUESTS.find(q => !q.done());
  return q ? q.t + (q.prog ? ` (${q.prog()})` : '') : 'Nothing! You finished everything.';
}
function talk(n) {
  const first = !S.talked.includes(n.id);
  const done = () => { if (!S.talked.includes(n.id)) { S.talked.push(n.id); gainXP(60, n.x, n.y, 'New friend'); } };
  let pages;
  switch (n.id) {
    case 'byte':
      pages = first ? [
        'Meow! I’m Byte, Irfan’s debugging cat. Welcome to Irfan Quest!',
        'This whole town is Irfan’s portfolio. Every building, crystal and bug tells you something about him.',
        'Move with WASD or the arrow keys, or just tap where you want to go. Press E or Space to talk to people.',
        `Glowing Data Crystals are his real projects. There are ${NP} of them, and many link to the real code. Bugs are running loose too: catch them to squash them!`,
        'Finish every quest to reach LV 10. In a hurry? Press R any time for the plain resume. No judgement. Meow.',
        {t: 'Ready?', choices: [{l: 'Let’s go!'}, {l: 'Show me the quest log', close: true, f: openQuests}]},
      ] : allDone() ? [
        'You found everything! 100%! Irfan would love to hear from you.',
        {t: 'Want to see your ending again?', choices: [{l: 'Yes please', close: true, f: openEnding}, {l: 'I’ll keep exploring'}]},
      ] : [
        `Psst. Next up: ${nextQuestText()}.`,
        `Crystals found: ${S.crystals.length}/${NP}. Purple dots on the minimap are crystals, red dots are bugs.`,
      ];
      break;
    case 'prof':
      pages = [
        'Welcome to the Academy! I keep the records on our star student, Mohammad Irfan Sirkar.',
        `He’s studying for a ${R.education.degree} at ${R.education.school}, ${R.education.years}.`,
        'He builds real-world AI: multi-LLM consensus engines, study co-pilots, medical vision models, and full-stack web apps in React and Next.js.',
        {t: 'Anything else?', choices: [
          {l: 'What’s his goal?', f: () => ['His objective: ML Developer. He likes turning fresh research into tools people can actually use.', 'He learns fast, thrives in teams, and is always exploring emerging tech.']},
          {l: 'Thanks, Professor!'},
        ]},
      ];
      break;
    case 'guild':
      pages = [
        'A visitor! The Builders’ Guild keeps a record of every contract Irfan has taken on.',
        ...R.work.map(w => `${w.role} · ${w.org}\n${w.date}`),
        'Lead developer twice and Tech Head of a student chapter. The guild approves.',
      ];
      break;
    case 'keeper':
      pages = [
        'Welcome to the Trophy Hall. Mind the shine.',
        ...R.achievements.map(a => `${a.place}: ${a.name}\n${a.date}`),
        'Two podium finishes in the same month. We’re going to need a bigger shelf.',
      ];
      break;
    case 'sage':
      pages = [
        'I am the Skill Sage. Irfan’s skills sleep inside this shrine.',
        'Every Data Crystal you collect awakens the skills that project used. A few skills I grant myself.',
        {t: `Skills awakened so far: ${unlockedSkills().length + (first ? 3 : 0)}. Open the Skill Tree?`, choices: [{l: 'Show me the Skill Tree', close: true, f: openSkills}, {l: 'Later'}]},
      ];
      break;
    case 'post':
      pages = [
        'Courier Zed, fastest legs in Hyderabad. Recruiters, collaborators and fellow hackers welcome.',
        {t: 'Got a message for Irfan?', choices: [{l: 'Get his contact details', close: true, f: openContact}, {l: 'Maybe later'}]},
      ];
      break;
  }
  Dlg.start(n, pages, done);
}
function interact(e) {
  if (e.type === 'npc') talk(e);
  else if (e.type === 'board') openQuests();
}

/* ================= panels ================= */
const Panel = {
  open: false, onClose: null,
  show(title, html, onClose) {
    this.open = true; this.onClose = onClose || null;
    $('panelTitle').textContent = title; $('panelBody').innerHTML = html; $('panel').hidden = false;
    $('panelBody').parentElement.scrollTop = 0;
    $('panelClose').focus({preventScroll: true});
    Snd.play('open'); syncTouch();
  },
  close() {
    if (!this.open) return;
    this.open = false; $('panel').hidden = true; Snd.play('close');
    const f = this.onClose; this.onClose = null; f && f();
    syncTouch(); afterAction();
  },
};
$('panelClose').addEventListener('click', () => Panel.close());
$('panel').addEventListener('click', e => { if (e.target === $('panel')) Panel.close(); });
$('panelBody').addEventListener('click', e => {
  const t = e.target.closest('[data-proj],[data-copy],[data-go]');
  if (!t) return;
  if (t.dataset.proj) openProject(R.projects.find(p => p.id === t.dataset.proj));
  else if (t.dataset.copy !== undefined) copyEmail(t);
  else if (t.dataset.go === 'reset') {
    if (t.dataset.armed) { store.set('save', null); S = fresh(); location.reload(); }
    else { t.dataset.armed = '1'; t.textContent = 'Click again to erase all progress'; }
  } else if (t.dataset.go) hudAction(t.dataset.go);
});

const chip = (s, on = false) => `<span class="chip${on ? ' on' : ''}">${esc(s)}</span>`;
const linkButtons = p => p.links?.length
  ? `<div class="links">${p.links.map(l => `<a class="btn" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`).join('')}</div>`
  : '';
function openQuests() {
  const lv = levelOf(S.xp), mins = Math.floor(S.tPlay / 60), secs = String(Math.floor(S.tPlay % 60)).padStart(2, '0');
  const done = QUESTS.filter(q => q.done()).length;
  Panel.show('Quest Log', `
    <div class="stats"><span>Level <b>${lv}</b></span><span>XP <b>${S.xp}</b></span><span>Quests <b>${done}/${QUESTS.length}</b></span><span>Time <b>${mins}:${secs}</b></span></div>
    <ul class="quests">${QUESTS.map(q => `<li class="${q.done() ? 'done' : ''}"><span class="box">${q.done() ? '✓' : ''}</span><span>${esc(q.t)}</span>${q.prog ? `<span class="prog">${q.prog()}</span>` : ''}</li>`).join('')}</ul>
    <div><p class="kicker">Achievements · ${S.ach.length}/${ACH.length}</p>
    <div class="ach">${ACH.map(([id, n, d]) => `<div class="${S.ach.includes(id) ? 'on' : ''}">${S.ach.includes(id) ? '★ ' : '☆ '}${esc(n)}<small>${esc(d)}</small></div>`).join('')}</div></div>
    <div class="reset-row"><button type="button" class="btn btn-danger" data-go="reset">Reset progress</button></div>`);
}
function openDex() {
  Panel.show(`Project Dex · ${S.crystals.length}/${NP}`, `
    <p class="muted">Each glowing Data Crystal in town is one of Irfan’s real projects. Click a found project to read it and open its code.</p>
    <div class="dex">${R.projects.map(p => S.crystals.includes(p.id)
      ? `<button type="button" data-proj="${p.id}" style="--c:${p.color}"><strong>${esc(p.name)}</strong><span>${esc(p.tagline)}</span><span>${esc(p.date)}${p.links?.length ? ' · code on GitHub' : ''}</span></button>`
      : `<button type="button" class="locked" style="--c:#3A3F6B" disabled><strong>???</strong><span>Hint: ${esc(SPOTS[p.id][2])}</span></button>`).join('')}</div>
    <p class="muted">Want them all at once? <button type="button" class="btn" data-go="resume">Open the plain resume</button></p>`);
}
function openProject(p, freshSkills) {
  const isNew = !!freshSkills;
  Panel.show(isNew ? 'Data Crystal found!' : p.name, `
    <div class="proj" style="--c:${p.color}">
      ${isNew ? `<span class="kicker">New project unlocked · +120 XP · ${S.crystals.length}/${NP}</span>` : ''}
      <h3>${esc(p.name)}</h3>
      <span class="meta">${esc(p.event)} · ${esc(p.date)}</span>
      <span class="tag">${esc(p.tagline)}</span>
      ${p.stat ? `<span class="stat">${esc(p.stat)}</span>` : ''}
      <div class="chips">${p.stack.map(s => chip(s)).join('')}</div>
      <ul>${p.points.map(s => `<li>${esc(s)}</li>`).join('')}</ul>
      ${linkButtons(p)}
    </div>
    ${isNew && freshSkills.length ? `<div class="newskills">★ Skills awakened: <b>${freshSkills.map(esc).join(', ')}</b></div>` : ''}`);
}
function openSkills() {
  const all = R.skills.flatMap(b => b.items), have = all.filter(([, f]) => skillUnlocked(f)).length;
  const label = id => R.projects.find(p => p.id === id)?.name || NPCS.find(n => n.id === id)?.name || id;
  Panel.show(`Skill Tree · ${have}/${all.length}`, `
    <p class="muted">Skills awaken as you find the projects that used them, or meet the people who vouch for them.</p>
    <div class="tree">${R.skills.map(b => `<div class="branch" style="--c:${b.color}"><h4>${esc(b.branch)}</h4>${b.items.map(([n, from]) => skillUnlocked(from)
      ? `<div class="node">${esc(n)}</div>`
      : `<div class="node locked">${esc(n)}<small>Find: ${from.slice(0, 2).map(label).map(esc).join(' or ')}</small></div>`).join('')}</div>`).join('')}</div>`);
}
function openContact() {
  const first = !S.contact;
  if (first) { S.contact = true; gainXP(50, player.x, player.y, 'Message ready'); }
  Panel.show('Post Office', `
    <div class="contact">
      <p>Irfan is open to ML developer roles, internships and hackathon teams. The fastest way to reach him:</p>
      <div class="email-row"><span class="email-text" id="emailText">${esc(R.email)}</span><button type="button" class="btn btn-primary" data-copy>Copy</button></div>
      <div class="links">
        <a class="btn" href="mailto:${esc(R.email)}?subject=${encodeURIComponent('Hello from Irfan Quest')}">Open email app</a>
        ${R.linkedin ? `<a class="btn" href="${esc(R.linkedin)}" target="_blank" rel="noopener">LinkedIn</a>` : ''}
        ${R.github ? `<a class="btn" href="${esc(R.github)}" target="_blank" rel="noopener">GitHub</a>` : ''}
        <button type="button" class="btn" data-go="resume">View resume</button>
      </div>
      <p class="muted">Based in ${esc(R.location)}.</p>
    </div>`);
}
function copyEmail(btn) {
  const ok = () => { btn.textContent = 'Copied!'; setTimeout(() => { btn.textContent = 'Copy'; }, 1600); };
  const fallback = () => { const el = $('emailText'); if (!el) return; const r = document.createRange(); r.selectNodeContents(el); const s = getSelection(); s.removeAllRanges(); s.addRange(r); btn.textContent = 'Press Ctrl+C'; };
  try { navigator.clipboard.writeText(R.email).then(ok, fallback); } catch { fallback(); }
}
function openResume() {
  S.resumeSeen = true; checkAch(); save();
  Panel.show('Resume', `
    <div class="resume">
      <div class="who"><strong>${esc(R.name)}</strong><span>${esc(R.role)} · ${esc(R.location)}</span>
        <div class="email-row" style="margin-top:8px"><span class="email-text" id="emailText">${esc(R.email)}</span><button type="button" class="btn btn-primary" data-copy>Copy</button></div>
        <span class="links">${R.linkedin ? `<a href="${esc(R.linkedin)}" target="_blank" rel="noopener">LinkedIn ↗</a>` : ''}${R.github ? `<a href="${esc(R.github)}" target="_blank" rel="noopener">GitHub ↗</a>` : ''}${R.source ? `<a href="${esc(R.source)}" target="_blank" rel="noopener">This site’s source code ↗</a>` : ''}</span>
      </div>
      <section><h3>Summary</h3><p>${esc(R.summary)}</p></section>
      <section><h3>Experience</h3>${R.work.map(w => `<div class="item"><div class="row"><strong>${esc(w.role)} · ${esc(w.org)}</strong><span>${esc(w.date)}</span></div></div>`).join('')}</section>
      <section><h3>Projects</h3>${R.projects.map(p => `<div class="item"><div class="row"><strong>${esc(p.name)}: ${esc(p.tagline)}</strong><span>${esc(p.event)} · ${esc(p.date)}</span></div><div class="chips">${p.stack.map(s => chip(s)).join('')}</div><ul>${p.points.map(s => `<li>${esc(s)}</li>`).join('')}</ul>${p.links?.length ? `<span>${p.links.map(l => `<a href="${esc(l.url)}" target="_blank" rel="noopener" style="color:var(--gold)">${esc(l.label)} ↗</a>`).join(' · ')}</span>` : ''}</div>`).join('')}</section>
      <section><h3>Skills</h3>${R.skills.map(b => `<div class="item"><strong>${esc(b.branch)}</strong><div class="chips">${b.items.map(([n]) => chip(n)).join('')}</div></div>`).join('')}</section>
      <section><h3>Achievements</h3>${R.achievements.map(a => `<div class="item"><div class="row"><strong>${esc(a.place)} · ${esc(a.name)}</strong><span>${esc(a.date)}</span></div></div>`).join('')}</section>
      <section><h3>Education</h3><div class="item"><div class="row"><strong>${esc(R.education.degree)}</strong><span>${esc(R.education.years)}</span></div><span>${esc(R.education.school)}</span></div></section>
    </div>`);
}
function openEnding() {
  const mins = Math.floor(S.tPlay / 60), secs = String(Math.floor(S.tPlay % 60)).padStart(2, '0');
  Panel.show('The End?', `
    <div class="ending">
      <span class="kicker">100% complete · LV ${levelOf(S.xp)}</span>
      <div class="big">QUEST<br>COMPLETE</div>
      <div class="stats"><span>Time <b>${mins}:${secs}</b></span><span>Projects <b>${S.crystals.length}/${NP}</b></span><span>Bugs <b>${S.bugs.length}/${BUG_DEFS.length}</b></span><span>Achievements <b>${S.ach.length}/${ACH.length}</b></span></div>
      <p style="max-width:52ch">You’ve seen everything Irfan has built so far. The next quest is the one you build together.</p>
      <div class="email-row" style="width:100%"><span class="email-text" id="emailText">${esc(R.email)}</span><button type="button" class="btn btn-primary" data-copy>Copy email</button></div>
      <button type="button" class="btn" data-go="resume">View full resume</button>
    </div>`);
}

/* ================= HUD, toasts, minimap ================= */
function updateHUD() {
  const lv = levelOf(S.xp), lo = LV[lv - 1], hi = LV[lv];
  $('hudLv').textContent = lv >= 10 ? 'LV 10 · MAX' : `LV ${lv}`;
  $('hudXp').style.width = (hi ? (S.xp - lo) / (hi - lo) * 100 : 100) + '%';
  $('hudXpText').textContent = hi ? `${S.xp} / ${hi} XP` : `${S.xp} XP`;
  $('hudC').textContent = `${S.crystals.length}/${NP}`;
  $('hudB').textContent = `${S.bugs.length}/${BUG_DEFS.length}`;
  $('objective').innerHTML = `<span><b>Next:</b>${esc(nextQuestText())}</span>`;
}
function toast(kicker, text, cls = '') {
  const el = document.createElement('div');
  el.className = 'toast ' + cls;
  el.innerHTML = `<b>${esc(kicker)}</b><span>${esc(text)}</span>`;
  $('toasts').appendChild(el);
  setTimeout(() => el.remove(), 3300);
}
const mm = $('minimap'), mmc = mm.getContext('2d'), mmBase = document.createElement('canvas');
mm.width = mmBase.width = MW * 2; mm.height = mmBase.height = MH * 2;
const MM_COL = {[G]: '#5DA85A', [F]: '#64AE5E', [P]: '#D9C089', [W]: '#3C7FD1', [T]: '#2E7D3A', [B]: '#A8743E', [S_]: '#E9D59B', [C]: '#7A5230', [N]: '#8B5A2B', [K]: '#8A8F9C', [O]: '#9AA3B5'};
function buildMinimapBase() {
  const c = mmBase.getContext('2d');
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) box(c, x * 2, y * 2, 2, 2, MM_COL[tile(x, y)] || '#000');
  BUILDINGS.forEach(b => box(c, b.x * 2, b.y * 2, b.w * 2, b.h * 2, b.roof));
}
function drawMinimap(t) {
  mmc.drawImage(mmBase, 0, 0);
  const dot = (x, y, col, s = 3) => box(mmc, Math.round(x / TS * 2 - s / 2), Math.round(y / TS * 2 - s / 2), s, s, col);
  npcs.forEach(n => { if (!S.talked.includes(n.id)) dot(n.x, n.y, '#FFC94A'); });
  crystals.forEach(c => { if (!S.crystals.includes(c.id) && Math.sin(t * 5 + c.i) > -.4) dot(c.x, c.y, '#D7C8FF'); });
  bugs.forEach(b => { if (!b.dead) dot(b.x, b.y, '#FF5D5D', 2); });
  if (Math.sin(t * 8) > -.5) dot(player.x, player.y, '#FFFFFF', 4);
  mmc.strokeStyle = 'rgba(255,255,255,.6)'; mmc.lineWidth = 1;
  mmc.strokeRect(cam.x / TS * 2 + .5, cam.y / TS * 2 + .5, VW / TS * 2, VH / TS * 2);
}

/* ================= render ================= */
let time = 0;
function render() {
  const sx = shake ? (Math.random() - .5) * shake : 0, sy = shake ? (Math.random() - .5) * shake : 0;
  const cx = Math.round(cam.x + sx), cy = Math.round(cam.y + sy);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#2E7D3A'; ctx.fillRect(0, 0, VW, VH);
  ctx.drawImage(worldCv, -cx, -cy);
  ctx.translate(-cx, -cy);

  // water shimmer
  ctx.fillStyle = 'rgba(255,255,255,.35)';
  const x0 = Math.max(0, Math.floor(cx / TS)), y0 = Math.max(0, Math.floor(cy / TS)), x1 = Math.min(MW, x0 + Math.ceil(VW / TS) + 2), y1 = Math.min(MH, y0 + Math.ceil(VH / TS) + 2);
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) if (tile(x, y) === W) {
    const o = (time * 5 + hash(x, y, 90) * 16) % 13;
    ctx.fillRect(x * TS + o, y * TS + 5 + ((hash(x, y, 91) * 6) | 0), 3, 1);
  }
  // fountain jet
  const fx = 30 * TS, fy = 21 * TS;
  for (let i = 0; i < 4; i++) { const hgt = 6 + Math.sin(time * 6 + i) * 2; box(ctx, fx - 2 + i, fy + 8 - hgt, 1, hgt, i % 2 ? '#A8D8FF' : '#E0F4FF'); }
  box(ctx, fx - 9 + Math.round(Math.sin(time * 2) * 2), fy + 14, 3, 1, 'rgba(255,255,255,.5)');

  const list = [];
  npcs.forEach(n => list.push({y: n.y, d: () => n.kind === 'cat' ? drawCat(ctx, n.x, n.y, player.x < n.x, time) : drawPerson(ctx, n.x, n.y, n.pal, faceToward(n), 0, Math.sin(time * 2 + n.tx) > .7 ? -1 : 0)}));
  list.push({y: board.y, d: () => drawBoard(ctx, board)});
  crystals.forEach(c => list.push({y: c.y, d: () => drawCrystal(ctx, c, time)}));
  bugs.forEach(b => { if (!b.dead) list.push({y: b.y, d: () => drawBug(ctx, b, time)}); });
  if (mode !== 'title') list.push({y: player.y, d: () => drawPerson(ctx, player.x, player.y, PLAYER_PAL, player.dir, player.moving ? (Math.floor(player.anim) % 4) : 0, !player.moving && Math.sin(time * 3) > .8 ? 1 : 0)});
  list.sort((a, b) => a.y - b.y).forEach(e => e.d());

  // quest markers
  npcs.forEach(n => {
    if (S.talked.includes(n.id)) return;
    const by = Math.round(n.y - (n.kind === 'cat' ? 22 : 28) + Math.sin(time * 5) * 1.5);
    box(ctx, n.x - 3, by, 7, 10, '#1A1300'); box(ctx, n.x - 2, by + 1, 5, 8, '#FFC94A'); box(ctx, n.x, by + 2, 1, 4, '#1A1300'); box(ctx, n.x, by + 7, 1, 1, '#1A1300');
  });
  // particles
  for (const p of parts) { ctx.globalAlpha = clamp(p.life / p.max * 1.4, 0, 1); box(ctx, Math.round(p.x), Math.round(p.y), p.sz, p.sz, p.col); }
  ctx.globalAlpha = 1;
  // interaction prompt
  if (mode === 'play' && !paused()) {
    const near = nearest();
    if (near) {
      const px = Math.round(near.x), py = Math.round(near.y - (near.kind === 'cat' ? 34 : 40) + (Math.sin(time * 6) > 0 ? 0 : 1));
      box(ctx, px - 6, py, 13, 11, '#000'); box(ctx, px - 5, py + 1, 11, 9, '#F2E8CF');
      ctx.font = '8px Silkscreen, monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.fillStyle = '#1A1300';
      ctx.fillText(touchUI ? 'A' : 'E', px + 1, py + 1);
    }
  }
  // floating text
  ctx.font = '8px Silkscreen, monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const f of floats) {
    const y = Math.round(f.y - (1.4 - f.life) * 18);
    ctx.globalAlpha = clamp(f.life * 1.5, 0, 1);
    ctx.fillStyle = '#000'; ctx.fillText(f.text, Math.round(f.x) + 1, y + 1);
    ctx.fillStyle = f.col; ctx.fillText(f.text, Math.round(f.x), y);
  }
  ctx.globalAlpha = 1;

  // compass toward the next character quest
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (mode === 'play') {
    const q = QUESTS.find(q => !q.done());
    const tgt = q && q.target && npcs.find(n => n.id === q.target);
    if (tgt) {
      const sx2 = tgt.x - cx, sy2 = tgt.y - 10 - cy;
      if (sx2 < 0 || sy2 < 0 || sx2 > VW || sy2 > VH) {
        const mx = VW / 2, my = VH / 2, a = Math.atan2(sy2 - my, sx2 - mx), m = 22;
        const k = Math.min((VW / 2 - m) / Math.abs(Math.cos(a) || 1e-6), (VH / 2 - m) / Math.abs(Math.sin(a) || 1e-6));
        ctx.save(); ctx.translate(Math.round(mx + Math.cos(a) * k), Math.round(my + Math.sin(a) * k)); ctx.rotate(a);
        const pulse = 1 + Math.sin(time * 6) * .15; ctx.scale(pulse, pulse);
        ctx.fillStyle = '#000'; ctx.beginPath(); ctx.moveTo(9, 0); ctx.lineTo(-6, -7); ctx.lineTo(-6, 7); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#FFC94A'; ctx.beginPath(); ctx.moveTo(7, 0); ctx.lineTo(-4, -5); ctx.lineTo(-4, 5); ctx.closePath(); ctx.fill();
        ctx.restore();
      }
    }
  }
}
function faceToward(n) {
  const dx = player.x - n.x, dy = player.y - n.y;
  if (Math.hypot(dx, dy) > 60) return 'down';
  return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
}
function nearest() {
  let best = null, bd = 24;
  for (const e of interactables()) { const d = Math.hypot(e.x - player.x, e.y - player.y); if (d < bd) { bd = d; best = e; } }
  return best;
}

/* ================= loop ================= */
let mode = 'title', last = performance.now(), saveT = 0, mmT = 0;
const paused = () => Dlg.open || Panel.open;
function update(dt) {
  updatePlayer(dt);
  updateBugs(dt);
  for (const c of crystals) if (!S.crystals.includes(c.id) && Math.hypot(c.x - player.x, c.y - player.y) < 12) { collect(c); break; }
  if (!reduce && Math.random() < dt * 3) {
    const c = crystals[(Math.random() * crystals.length) | 0];
    if (!S.crystals.includes(c.id)) parts.push({x: c.x + (Math.random() - .5) * 14, y: c.y - 10 + (Math.random() - .5) * 12, vx: 0, vy: -10, life: .8, max: .8, col: '#FFFFFF', sz: 1, g: 0});
  }
  const tgt = camTarget(player.x, player.y - 8);
  cam.x += (tgt.x - cam.x) * Math.min(1, dt * 8); cam.y += (tgt.y - cam.y) * Math.min(1, dt * 8);
  S.tPlay += dt;
  saveT += dt; if (saveT > 4) { saveT = 0; save(); }
}
function frame(now) {
  const dt = Math.min(.05, (now - last) / 1000); last = now; time += dt;
  if (mode === 'play' && !paused()) update(dt);
  else if (mode === 'title') {
    const tgt = camTarget(MW * TS / 2 + Math.cos(time * .15) * 300, MH * TS / 2 + Math.sin(time * .21) * 180);
    cam.x += (tgt.x - cam.x) * .02; cam.y += (tgt.y - cam.y) * .02;
    updateBugs(dt);
  }
  Dlg.tick(dt);
  parts = parts.filter(p => (p.life -= dt) > 0);
  for (const p of parts) { p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= .97; }
  floats = floats.filter(f => (f.life -= dt) > 0);
  shake = Math.max(0, shake - dt * 20);
  render();
  if (mode === 'play' && (mmT += dt) > .1) { mmT = 0; drawMinimap(time); }
  requestAnimationFrame(frame);
}

/* ================= input ================= */
const KEYMAP = {ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right'};
function actionKey() {
  if (Dlg.open) { Dlg.advance(); return; }
  if (Panel.open) return;
  const n = nearest(); if (n) { face(n); interact(n); }
}
function hudAction(a) {
  Snd.init();
  if (a === 'sound') { Snd.on = !Snd.on; store.set('sound', Snd.on); syncSound(); if (Snd.on) Snd.play('open'); return; }
  if (Dlg.open) return;
  const open = {quests: openQuests, dex: openDex, skills: openSkills, resume: openResume}[a];
  if (open) { if (Panel.open) { Panel.open = false; $('panel').hidden = true; } open(); }
}
addEventListener('keydown', e => {
  if (mode === 'title') {
    if ((e.key === 'Enter' || e.key === ' ') && !Panel.open && document.activeElement?.tagName !== 'BUTTON') { e.preventDefault(); start(false); }
    if (e.key === 'Escape') Panel.close();
    return;
  }
  if (e.key === 'Escape') { if (Panel.open) Panel.close(); else if (Dlg.open) Dlg.end(); return; }
  if (Panel.open) return;
  if (Dlg.open) {
    if (['Enter', ' ', 'e', 'E'].includes(e.key)) { e.preventDefault(); if (!e.repeat) Dlg.advance(); }
    else if (e.key === 'ArrowUp' || e.key === 'w') { e.preventDefault(); Dlg.move(-1); }
    else if (e.key === 'ArrowDown' || e.key === 's') { e.preventDefault(); Dlg.move(1); }
    else if (/^[1-9]$/.test(e.key)) Dlg.choose(+e.key - 1);
    return;
  }
  if (KEYMAP[e.code]) { keys[KEYMAP[e.code]] = true; e.preventDefault(); return; }
  if (e.repeat) return;
  if (e.key === 'e' || e.key === 'E' || e.key === ' ' || e.key === 'Enter') { e.preventDefault(); actionKey(); }
  const hot = {q: 'quests', i: 'dex', k: 'skills', r: 'resume', m: 'sound'}[e.key.toLowerCase()];
  if (hot) hudAction(hot);
});
addEventListener('keyup', e => { if (KEYMAP[e.code]) keys[KEYMAP[e.code]] = false; });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; });

cv.addEventListener('pointerdown', e => {
  if (mode !== 'play' || paused()) return;
  Snd.init();
  const wx = cam.x + e.clientX / scale, wy = cam.y + e.clientY / scale;
  const hit = [...interactables(), ...crystals.filter(c => !S.crystals.includes(c.id))].find(o => Math.hypot(o.x - wx, o.y - 10 - wy) < 14);
  if (hit && hit.type !== 'crystal' && Math.hypot(hit.x - player.x, hit.y - player.y) < 22) { face(hit); interact(hit); return; }
  const tx = Math.floor((hit ? hit.x : wx) / TS), ty = Math.floor((hit ? hit.y - 2 : wy) / TS);
  player.path = findPath(Math.floor(player.x / TS), Math.floor((player.y - 2) / TS), tx, ty);
  player.pending = hit && hit.type !== 'crystal' ? hit : null;
  burst(wx, wy, ['#FFFFFF', '#FFC94A'], 6, 25);
});

const stickEl = $('stick'), knob = stickEl.firstElementChild;
stickEl.addEventListener('pointerdown', e => { stickEl.setPointerCapture(e.pointerId); stick.active = true; Snd.init(); moveStick(e); });
stickEl.addEventListener('pointermove', e => { if (stick.active) moveStick(e); });
const endStick = () => { stick.active = false; stick.x = stick.y = 0; knob.style.transform = ''; };
stickEl.addEventListener('pointerup', endStick); stickEl.addEventListener('pointercancel', endStick);
function moveStick(e) {
  const r = stickEl.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2), d = Math.hypot(dx, dy), m = r.width / 2 - 10, k = Math.min(1, m / (d || 1));
  knob.style.transform = `translate(${dx * k}px,${dy * k}px)`;
  stick.x = dx / m * k; stick.y = dy / m * k;
}
$('btnA').addEventListener('pointerdown', e => { e.preventDefault(); Snd.init(); actionKey(); });
const syncTouch = () => { $('touch').hidden = !(touchUI && mode === 'play' && !paused()); if (paused()) endStick(); };
const syncSound = () => { $('btnSound').setAttribute('aria-pressed', Snd.on); $('soundLabel').textContent = Snd.on ? 'Sound on' : 'Sound off'; };
document.querySelectorAll('[data-act]').forEach(b => b.addEventListener('click', () => hudAction(b.dataset.act)));

/* ================= boot ================= */
function start(newGame) {
  Snd.init();
  if (newGame) { S = fresh(); store.set('save', null); }
  const isNew = !S.started;
  S.started = true;
  spawnBugs();
  const pos = S.pos && !blocked(S.pos.x, S.pos.y) ? S.pos : SPAWN;
  player.x = pos.x; player.y = pos.y; player.dir = 'up';
  Object.assign(cam, camTarget(player.x, player.y));
  mode = 'play';
  $('title').hidden = true; $('hud').hidden = false; $('minimap').hidden = false;
  if (Panel.open) Panel.close();
  updateHUD(); syncTouch(); save(); cv.focus({preventScroll: true});
  if (isNew) setTimeout(() => { const byte = npcs[0]; face(byte); talk(byte); }, 500);
  else toast('WELCOME BACK', `LV ${levelOf(S.xp)} · ${S.crystals.length}/${NP} crystals`);
}
$('btnStart').addEventListener('click', () => start(false));
$('btnNew').addEventListener('click', () => start(true));
$('btnSkip').addEventListener('click', () => { Snd.init(); openResume(); });
if (S.started) { $('btnStart').textContent = '▶ Continue'; $('btnNew').hidden = false; }

buildMap();
spawnBugs();
prerender();
document.fonts?.load('8px Silkscreen').then(prerender).catch(() => {});
const pc = $('portrait').getContext('2d'); drawPerson(pc, 8, 19, PLAYER_PAL, 'down', 0);
addEventListener('resize', resize); resize();
Object.assign(cam, camTarget(MW * TS / 2, MH * TS / 2));
player.x = SPAWN.x; player.y = SPAWN.y;
syncSound(); updateHUD();
requestAnimationFrame(frame);
})();

(() => {
'use strict';

/* ───────── constants ───────── */
const W = 1056, H = 680, SC = 1.5;           // stage size (css px) and canvas resolution multiplier
const $ = (s, r = document) => r.querySelector(s);
const stage = $('#stage'), overlay = $('#overlay'), selbox = $('#selbox'), cursor = $('#cursor'), book = $('#book');
overlay.width = W * SC; overlay.height = H * SC;
const octx = overlay.getContext('2d'); octx.setTransform(SC, 0, 0, SC, 0, 0);

const I = {
  select: '<path d="M5 3l14 7.5-6.2 1.8L10.5 19z"/>',
  text: '<path d="M5 7V4h14v3M12 4v16M9 20h6"/>',
  pen: '<path d="M12 19l7-7 3 3-7 7zM18 13l-1.5-7.5L2 2l3.5 14.5L13 18zM2 2l7.6 7.6"/><circle cx="11" cy="11" r="2"/>',
  pencil: '<path d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5zM15 5l4 4"/>',
  brush: '<path d="M18.4 2.6L14 7l-1.6-1.6a2 2 0 00-2.8 0L8 7l9 9 1.6-1.6a2 2 0 000-2.8L17 10l4.4-4.4a2.1 2.1 0 10-3-3zM9 8c-2 3-4 3.5-7 4l8 10c2-1 6-5 6-7M14.5 17.5L4.5 15"/>',
  calli: '<path d="M20.2 12.2a6 6 0 00-8.5-8.5L5 10.5V19h8.5zM16 8L2 22M17.5 15H9"/>',
  marker: '<path d="M15 4l5 5-9 9H6v-5zM12 7l5 5M3 21h9"/>',
  highlighter: '<path d="M9 11l-6 6v3h9l3-3M22 12l-4.6 4.6a2 2 0 01-2.8 0l-5.2-5.2a2 2 0 010-2.8L14 4"/>',
  spray: '<path d="M3 3h.01M7 5h.01M11 7h.01M3 7h.01M7 9h.01M3 11h.01"/><rect x="15" y="5" width="4" height="4"/><path d="M19 9l2 2v10a1 1 0 01-1 1h-6a1 1 0 01-1-1V11l2-2M13 14h8M13 19h8"/>',
  eraser: '<path d="M7 21l-4.3-4.3a2.4 2.4 0 010-3.4l9.6-9.6a2.4 2.4 0 013.4 0l5.6 5.6a2.4 2.4 0 010 3.4L13 21M22 21H7M5 11l9 9"/>',
  shapes: '<path d="M8.3 10a.7.7 0 01-.6-1.1L11.4 3a.7.7 0 011.2 0l3.7 5.9a.7.7 0 01-.6 1.1z"/><rect x="3" y="14" width="7" height="7" rx="1"/><circle cx="17.5" cy="17.5" r="3.5"/>',
  sticker: '<path d="M15.5 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V8.5zM14 3v4a2 2 0 002 2h4M8 13h.01M16 13h.01M10 16s.8 1 2 1c1.3 0 2-1 2-1"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-3.1-3.1a2 2 0 00-2.8 0L6 21"/>',
  video: '<path d="M16 13l5.2 3.5a.5.5 0 00.8-.4V7.9a.5.5 0 00-.8-.4L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
  music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  layers: '<path d="M12 2l10 5-10 5L2 7zM2 12l10 5 10-5M2 17l10 5 10-5"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  eyeoff: '<path d="M3 3l18 18M10.6 5.1A10 10 0 0112 5c6.5 0 10 7 10 7a17 17 0 01-3 3.9M6.6 6.6A16.500 16.500 0 002 12s3.500 7 10 7a9.700 9.700 0 004.400-1"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/>',
  unlock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 017.500-2"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15M10 11v6M14 11v6"/>',
  copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 012-2h10"/>',
  up: '<path d="M12 19V5M5 12l7-7 7 7"/>',
  down: '<path d="M12 5v14M5 12l7 7 7-7"/>',
  undo: '<path d="M9 14L4 9l5-5M4 9h10a6 6 0 010 12h-3"/>',
  redo: '<path d="M15 14l5-5-5-5M20 9H10a6 6 0 000 12h3"/>',
  download: '<path d="M12 3v12M7 10l5 5 5-5M4 21h16"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  bold: '<path d="M7 5h6a3.500 3.500 0 010 7H7zM7 12h7a3.500 3.500 0 010 7H7z"/>',
  italic: '<path d="M19 4h-9M14 20H5M15 4L9 20"/>',
  underline: '<path d="M6 4v6a6 6 0 0012 0V4M4 20h16"/>',
  left: '<path d="M4 6h16M4 12h10M4 18h13"/>',
  center: '<path d="M4 6h16M7 12h10M5 18h14"/>',
  right: '<path d="M4 6h16M10 12h10M7 18h13"/>',
};
Object.assign(I, {
  sound: '<path d="M11 5L6 9H3v6h3l5 4zM15.500 8.500a5 5 0 010 7M18.500 5.500a9 9 0 010 13"/>',
  mute: '<path d="M11 5L6 9H3v6h3l5 4zM22 9l-6 6M16 9l6 6"/>',
  look: '<circle cx="13.500" cy="6.500" r="1"/><circle cx="17.500" cy="10.500" r="1"/><circle cx="8.500" cy="7.500" r="1"/><circle cx="6.500" cy="12.500" r="1"/><path d="M12 2a10 10 0 100 20c1 0 1.700-.800 1.700-1.700 0-.400-.200-.800-.400-1.100-.300-.300-.400-.700-.400-1.100a1.600 1.600 0 011.600-1.600H16a6 6 0 006-6c0-4.700-4.500-8.500-10-8.500z"/>',
  caret: '<path d="M6 9l6 6 6-6"/>', panel: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M15 4v16"/>',
});
const ic = n => `<svg class="ic" viewBox="0 0 24 24">${I[n]}</svg>`;

const TOOLS = [
  ['select', 'Select & move', 'select', 'v'], ['text', 'Text', 'text', 't'],
  ['pen', 'Pen', 'pen', 'p'], ['pencil', 'Pencil', 'pencil', 'n'],
  ['brush', 'Paint brush', 'brush', 'b'], ['calli', 'Calligraphy pen', 'calli', 'c'],
  ['marker', 'Marker', 'marker', 'm'], ['highlighter', 'Highlighter', 'highlighter', 'h'],
  ['spray', 'Spray', 'spray', 'a'], ['eraser', 'Eraser', 'eraser', 'e'],
  ['shapes', 'Shapes', 'shapes', 's'], ['stickers', 'Stickers & tape', 'sticker', 'k'],
  ['image', 'Upload image', 'image', 'i'], ['video', 'Upload video', 'video', ''],
  ['music', 'Upload music', 'music', ''], ['layers', 'Layers', 'layers', 'l'],
];
const BR = {
  pen: { size: 3, opacity: 1, max: 20, color: '#2b2b33' },
  pencil: { size: 2.5, opacity: .85, max: 12, color: '#4a5361' },
  brush: { size: 12, opacity: 1, max: 50, color: '#4d96ff' },
  calli: { size: 10, opacity: 1, max: 40, color: '#2b2b33' },
  marker: { size: 14, opacity: .9, max: 50, color: '#ff7aa2' },
  highlighter: { size: 22, opacity: .45, max: 60, color: '#ffe14d' },
  spray: { size: 30, opacity: .9, max: 90, color: '#9b5de5' },
  eraser: { size: 24, opacity: 1, max: 100, color: '#ffffff' },
};
const S = { color: '#2b2b33', font: 'Caveat', fsize: 34, bold: false, italic: false, underline: false, align: 'left',
  kind: 'rect', fill: '#bfe0ff', stroke: '#2b2b33', sw: 2 };
const PAL = ['#2b2b33', '#ffffff', '#ff5a5f', '#ff9f43', '#ffe14d', '#6bcb77', '#4d96ff', '#9b5de5', '#ff7aa2', '#8d6e63', '#bfe0ff'];

// [family, hasBoldWeight]
const G_FONTS = [['Caveat', 1], ['Kalam', 1], ['Patrick Hand', 0], ['Indie Flower', 0], ['Shadows Into Light', 0], ['Gloria Hallelujah', 0],
  ['Homemade Apple', 0], ['Reenie Beanie', 0], ['Permanent Marker', 0], ['Amatic SC', 1], ['Dancing Script', 1], ['Pacifico', 0],
  ['Sacramento', 0], ['Great Vibes', 0], ['Lobster', 0], ['Playfair Display', 1], ['DM Serif Display', 0], ['Abril Fatface', 0],
  ['Cormorant Garamond', 1], ['Lora', 1], ['Merriweather', 1], ['Inter', 1], ['Poppins', 1], ['Montserrat', 1], ['Nunito', 1],
  ['Quicksand', 1], ['Raleway', 1], ['Fredoka', 1], ['Comfortaa', 1], ['Space Grotesk', 1], ['Bricolage Grotesque', 1],
  ['Archivo Narrow', 1], ['Oswald', 1], ['Bebas Neue', 0], ['Special Elite', 0], ['Courier Prime', 1]];
// fonts installed on this Mac (~/Library/Fonts) — referenced by family name
let sysFonts = ['Satoshi', 'Agrandir', 'BDO Grotesk', 'Chronicle Display', 'Butler Stencil', 'Arome Display', 'Harmera', 'Hart', 'Qlassy',
  'Vion Modern', 'Fiori Dorati', 'Sauce Tomato', 'Flanky', 'Flanky Outline', 'Flanky 3D Extrude', 'Monigue DEMO', 'Quizlo DEMO',
  'Chunko Bold Demo', 'Industrial736 BT', 'Liberation Sans', 'Liberation Serif'];
document.head.append(Object.assign(document.createElement('link'), { rel: 'stylesheet',
  href: 'https://fonts.googleapis.com/css2?' + G_FONTS.map(([f, b]) => 'family=' + f.replace(/ /g, '+') + (b ? ':wght@400;700' : '')).join('&') + '&display=swap' }));

const STICKERS = {
  'Cute': '🌼 🌸 🌷 🍀 ⭐ ✨ 🌙 ☁️ 🌈 ☀️ 🦋 🐝 🐱 🐶 🧸 🎀 💌 💖'.split(' '),
  'Life': '☕ 🍰 🍓 🍋 🍜 🎧 📷 ✈️ 🏖️ 🏡 📚 🎬 🎨 🎂 🎉 💡 📌 ✅'.split(' '),
  'Mood': '😊 🥰 😌 😴 🥲 😤 🤩 😎 🫶 👍 💪 🔥'.split(' '),
};
const TAPES = [
  'repeating-linear-gradient(45deg,#ffc2d4 0 8px,#ffe0ea 8px 16px)',
  'radial-gradient(#fff 2.2px,transparent 2.6px) 0 0/12px 12px,#a9d6ff',
  'repeating-linear-gradient(90deg,#c9f2d6 0 10px,#e9fbef 10px 20px)',
  'linear-gradient(#fff 1px,transparent 1px) 0 0/10px 10px,linear-gradient(90deg,#fff 1px,transparent 1px) 0 0/10px 10px,#ffe58a',
  'repeating-linear-gradient(-45deg,#d9c9ff 0 6px,#efe7ff 6px 12px)',
  'linear-gradient(#e3c9a4,#d9bb92)',
];
const SHAPES = [['rect', 'Rectangle'], ['round', 'Rounded'], ['ellipse', 'Ellipse'], ['triangle', 'Triangle'], ['diamond', 'Diamond'],
  ['star', 'Star'], ['heart', 'Heart'], ['bubble', 'Speech bubble'], ['line', 'Line'], ['arrow', 'Arrow']];
const KEEP_RATIO = new Set(['text', 'sticker', 'image', 'video', 'audio']);

/* ───────── helpers ───────── */
function mk(tag, props = {}, ...kids) {
  const e = document.createElement(tag);
  for (const k in props) {
    const v = props[k];
    if (k === 'class') e.className = v; else if (k === 'style') e.style.cssText = v;
    else if (k === 'html') e.innerHTML = v; else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else if (v !== false && v != null) e.setAttribute(k, v);
  }
  for (const c of kids.flat()) if (c != null) e.append(c);
  return e;
}
const uid = () => Math.random().toString(36).slice(2, 9);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rotv = (v, a) => ({ x: v.x * Math.cos(a) - v.y * Math.sin(a), y: v.x * Math.sin(a) + v.y * Math.cos(a) });
function pt(e) { const r = stage.getBoundingClientRect(); return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height }; }
function copyCanvas(c) { const n = document.createElement('canvas'); n.width = c.width; n.height = c.height; n.getContext('2d').drawImage(c, 0, 0); return n; }
let toastT; function toast(m, ms = 2200) { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toastT); if (ms) toastT = setTimeout(() => t.classList.remove('show'), ms); }
const typing = () => { const a = document.activeElement; return a && (a.isContentEditable || /INPUT|TEXTAREA/.test(a.tagName) && a.type !== 'range'); };

function shapePath(k, w, h) {
  switch (k) {
    case 'round': { const r = Math.min(w, h) * .22; return `M${r} 0H${w - r}Q${w} 0 ${w} ${r}V${h - r}Q${w} ${h} ${w - r} ${h}H${r}Q0 ${h} 0 ${h - r}V${r}Q0 0 ${r} 0Z`; }
    case 'ellipse': return `M0 ${h / 2}A${w / 2} ${h / 2} 0 1 0 ${w} ${h / 2}A${w / 2} ${h / 2} 0 1 0 0 ${h / 2}Z`;
    case 'triangle': return `M${w / 2} 0L${w} ${h}H0Z`;
    case 'diamond': return `M${w / 2} 0L${w} ${h / 2}L${w / 2} ${h}L0 ${h / 2}Z`;
    case 'star': { let d = ''; for (let i = 0; i < 10; i++) { const r = i % 2 ? .22 : .52, a = -Math.PI / 2 + i * Math.PI / 5; d += (i ? 'L' : 'M') + (w * (.5 + r * Math.cos(a))).toFixed(1) + ' ' + (h * (.53 + r * Math.sin(a))).toFixed(1); } return d + 'Z'; }
    case 'heart': return `M${w / 2} ${h * .28}C${w * .5} ${h * .1} ${w * .35} 0 ${w * .22} 0C${w * .08} 0 0 ${h * .12} 0 ${h * .3}C0 ${h * .58} ${w * .3} ${h * .78} ${w / 2} ${h}C${w * .7} ${h * .78} ${w} ${h * .58} ${w} ${h * .3}C${w} ${h * .12} ${w * .92} 0 ${w * .78} 0C${w * .65} 0 ${w * .5} ${h * .1} ${w / 2} ${h * .28}Z`;
    case 'bubble': { const b = h * .78, r = Math.min(w, b) * .22; return `M${r} 0H${w - r}Q${w} 0 ${w} ${r}V${b - r}Q${w} ${b} ${w - r} ${b}H${w * .42}L${w * .2} ${h}L${w * .24} ${b}H${r}Q0 ${b} 0 ${b - r}V${r}Q0 0 ${r} 0Z`; }
    case 'line': return `M0 ${h / 2}H${w}`;
    case 'arrow': { const a = Math.min(h / 2, w * .4); return `M0 ${h / 2}H${w}M${w - a} ${h / 2 - a * .8}L${w} ${h / 2}L${w - a} ${h / 2 + a * .8}`; }
    default: return `M0 0H${w}V${h}H0Z`;
  }
}
const isLine = k => k === 'line' || k === 'arrow';

/* ───────── state ───────── */
let layers = [];              // bottom → top
let selId = null, tool = 'select';
let hist = [], hi = -1;
let spreads = [null], cur = 0;
const sel = () => layers.find(l => l.id === selId);
const fontCss = f => `"${f}", "Satoshi", sans-serif`;

/* ───────── layer DOM ───────── */
function mount(l) {
  let el;
  if (l.type === 'draw') {
    el = mk('canvas', { class: 'draw' }); el.width = W * SC; el.height = H * SC;
    if (l.snap) el.getContext('2d').drawImage(l.snap, 0, 0);
  } else {
    el = mk('div', { class: 'obj ' + l.type, 'data-id': l.id });
    const play = () => mk('button', { class: 'playbtn', html: '<svg class="pl" viewBox="0 0 24 24"><path d="M7 4l13 8-13 8z"/></svg><svg class="pa" viewBox="0 0 24 24"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>' });
    const wire = m => { m.onplay = () => el.classList.add('playing'); m.onpause = m.onended = () => el.classList.remove('playing'); };
    if (l.type === 'text') { const tx = mk('div', { class: 'tx' }); tx.textContent = l.text; tx.addEventListener('blur', () => endEdit(l)); el.append(tx); }
    else if (l.type === 'sticker') el.textContent = l.char;
    else if (l.type === 'shape') el.innerHTML = '<svg><path/></svg>';
    else if (l.type === 'image') { el.append(mk('img', { src: l.src, draggable: 'false' })); if (l.stk) el.classList.add('stk'); }
    else if (l.type === 'video') { const v = mk('video', { src: l.src, playsinline: '', loop: '', preload: 'metadata' }); wire(v); el.append(v, play()); }
    else if (l.type === 'audio') {
      const a = mk('audio', { src: l.src, preload: 'metadata' }), bar = mk('i'); wire(a);
      a.ontimeupdate = () => bar.style.width = (a.currentTime / (a.duration || 1) * 100) + '%';
      el.append(a, mk('div', { class: 'disc' }), mk('div', { class: 'meta' }, mk('b', {}, l.name), mk('div', { class: 'bar' }, bar)), play());
    }
  }
  l.el = el; stage.append(el); render(l);
}
function render(l) {
  const s = l.el.style, i = layers.indexOf(l);
  s.zIndex = i + 1; s.opacity = l.opacity; s.display = l.visible ? '' : 'none';
  if (l.type === 'draw') return;
  s.pointerEvents = l.locked ? 'none' : '';
  s.left = l.x + 'px'; s.top = l.y + 'px'; s.width = l.w + 'px'; s.transform = `rotate(${l.rot}deg)`;
  if (l.type !== 'text') s.height = l.h + 'px';
  if (l.type === 'text') {
    s.fontFamily = fontCss(l.font); s.fontSize = l.fsize + 'px'; s.color = l.color; s.fontWeight = l.bold ? 700 : 400;
    s.fontStyle = l.italic ? 'italic' : 'normal'; s.textDecoration = l.underline ? 'underline' : 'none'; s.textAlign = l.align;
  } else if (l.type === 'sticker') s.fontSize = l.h * .82 + 'px';
  else if (l.type === 'tape') s.background = TAPES[l.pat];
  else if (l.type === 'shape') {
    const p = l.el.querySelector('path'); p.setAttribute('d', shapePath(l.kind, l.w, l.h));
    p.setAttribute('fill', isLine(l.kind) ? 'none' : l.fill); p.setAttribute('stroke', isLine(l.kind) && l.stroke === 'none' ? '#2b2b33' : l.stroke);
    p.setAttribute('stroke-width', l.sw); p.setAttribute('stroke-linejoin', 'round'); p.setAttribute('stroke-linecap', 'round');
  }
}
const geom = l => ({ x: l.x, y: l.y, w: l.w, h: l.type === 'text' ? l.el.offsetHeight : l.h });
function restack() { layers.forEach(render); }

function updateSel() {
  const l = sel();
  if (!l || l.type === 'draw' || !l.visible || l.el.classList.contains('editing')) { selbox.hidden = true; return; }
  const g = geom(l); selbox.hidden = false;
  Object.assign(selbox.style, { left: g.x + 'px', top: g.y + 'px', width: g.w + 'px', height: g.h + 'px', transform: `rotate(${l.rot}deg)` });
}

/* ───────── history / spreads ───────── */
const snap = () => ({ selId, layers: layers.map(({ el, ...d }) => ({ ...d })) });
function restore(st) {
  layers.forEach(l => l.el.remove());
  layers = st.layers.map(d => ({ ...d })); layers.forEach(mount);
  selId = layers.some(l => l.id === st.selId) ? st.selId : null;
  refresh(true);
}
function commit() { hist.splice(hi + 1); hist.push(snap()); if (hist.length > 30) hist.shift(); hi = hist.length - 1; refresh(); }
function undo() { if (hi > 0) restore(hist[--hi]); }
function redo() { if (hi < hist.length - 1) restore(hist[++hi]); }
function refresh(props) {
  updateSel(); renderLayers(); if (props) renderProps();
  $('#undoBtn').disabled = hi <= 0; $('#redoBtn').disabled = hi >= hist.length - 1;
  $('#spreadLabel').textContent = `Pages ${cur * 2 + 1}–${cur * 2 + 2} of ${spreads.length * 2}`;
  $('#pnL').textContent = cur * 2 + 1; $('#pnR').textContent = cur * 2 + 2;
  $('#prevSpread').disabled = cur === 0;
}
function gotoSpread(n) {
  spreads[cur] = snap(); cur = n;
  restore({ layers: [], ...spreads[cur], selId: null });
  hist = [snap()]; hi = 0; refresh(true);
}

/* ───────── layer ops ───────── */
const NAMES = { draw: 'Drawing', text: 'Text', sticker: 'Sticker', tape: 'Washi tape', shape: 'Shape', image: 'Image', video: 'Video', audio: 'Music' };
let placeN = 0;
function add(d, at, quiet) {
  const l = { id: uid(), visible: true, locked: false, opacity: 1, rot: 0, name: NAMES[d.type], ...d };
  if (l.type !== 'draw' && l.x == null) {
    const c = at || { x: W * (fly.className === 'library' && !fly.hidden ? .74 : .25) + (placeN % 5) * 18, y: H * .5 + (placeN++ % 5) * 18 };
    l.x = c.x - l.w / 2; l.y = c.y - (l.h || 40) / 2;
  }
  layers.push(l); mount(l);
  if (!quiet) { selId = l.id; if (l.type !== 'draw' && tool !== 'select') setTool('select'); commit(); renderProps(); }
  return l;
}
function removeLayer(l) { if (!l) return; l.el.remove(); layers = layers.filter(x => x !== l); if (selId === l.id) selId = null; restack(); commit(); renderProps(); }
function duplicate(l) {
  if (!l) return; const { el, ...d } = l;
  const n = { ...d, id: uid(), name: l.name + ' copy' };
  if (l.type === 'draw') n.snap = copyCanvas(l.el); else { n.x += 18; n.y += 18; }
  layers.splice(layers.indexOf(l) + 1, 0, n); mount(n); restack(); selId = n.id; commit(); renderProps();
}
function moveLayer(l, to) { const i = layers.indexOf(l); to = clamp(to, 0, layers.length - 1); if (!l || i === to) return; layers.splice(i, 1); layers.splice(to, 0, l); restack(); commit(); }
function select(id) {
  if (selId === id) return; selId = id; const l = sel();
  if (l?.type === 'text') for (const k of ['color', 'font', 'fsize', 'bold', 'italic', 'underline', 'align']) S[k] = l[k];
  if (l?.type === 'shape') for (const k of ['kind', 'fill', 'stroke', 'sw']) S[k] = l[k];
  refresh(true);
}

/* ───────── tools ───────── */
let lastBrush = 'pen', propsLocked = false;
const isBrush = t => BR[t] && t !== 'eraser';
function setTool(t) {
  closeFly();
  if (t === 'image') return $('#fImage').click();
  if (t === 'video') return $('#fVideo').click();
  if (t === 'music') return $('#fAudio').click();
  if (t === 'layers') { const c = $('#layersCard'); c.hidden = !c.hidden; $('[data-tool=layers]').classList.toggle('on', !c.hidden); return updateSide(); }
  if (t === 'lock') {
    propsLocked = !propsLocked; const b = $('[data-tool=lock]'); b.classList.toggle('on', propsLocked); b.innerHTML = ic(propsLocked ? 'lock' : 'panel');
    toast(propsLocked ? 'Properties hidden — just write' : 'Properties show when you pick a tool or select something'); return renderProps();
  }
  const group = t === 'draw'; if (group) t = lastBrush;
  const lib = t === 'stickers'; if (lib) t = 'select';
  tool = t; if (isBrush(t)) { lastBrush = t; $('[data-tool=draw]').innerHTML = ic(TOOLS.find(x => x[0] === t)[2]) + '<svg class="ic car" viewBox="0 0 24 24">' + I.caret + '</svg>'; }
  const active = lib ? 'stickers' : isBrush(t) ? 'draw' : t;
  document.querySelectorAll('.tool').forEach(b => { if (!['layers', 'lock'].includes(b.dataset.tool)) b.classList.toggle('on', b.dataset.tool === active); });
  stage.dataset.mode = BR[t] ? 'draw' : t === 'shapes' ? 'shape' : t;
  if (BR[t] && sel() && sel().type !== 'draw') selId = null;
  cursor.style.display = 'none';
  refresh(true);
  if (lib) openFly('stickers'); else if (t === 'shapes') openFly('shapes'); else if (group) openFly('draw');
}
function updateSide() { const side = $('.side'); side.hidden = props.hidden && $('#layersCard').hidden; fit(); }

/* brushes — every stroke is painted opaque on the overlay canvas, then merged into the layer with the tool's opacity */
let stroke = null;
function drawTarget(create) {
  const s = sel(); if (s?.type === 'draw' && s.visible && !s.locked) return s;
  const top = layers[layers.length - 1]; if (top?.type === 'draw' && top.visible && !top.locked) return top;
  if (!create) return [...layers].reverse().find(l => l.type === 'draw' && l.visible && !l.locked);
  return add({ type: 'draw', name: 'Drawing ' + (layers.filter(l => l.type === 'draw').length + 1) }, null, true);
}
function nib(c, a, b, size, ang) {            // flat-nib segment (calligraphy / highlighter)
  const n = { x: Math.cos(ang) * size / 2, y: Math.sin(ang) * size / 2 };
  c.beginPath(); c.moveTo(a.x - n.x, a.y - n.y); c.lineTo(a.x + n.x, a.y + n.y); c.lineTo(b.x + n.x, b.y + n.y); c.lineTo(b.x - n.x, b.y - n.y); c.closePath(); c.fill(); c.stroke();
}
function sprayAt(c, p, size) { for (let i = 0; i < size * .9; i++) { const r = size / 2 * Math.sqrt(Math.random()), a = Math.random() * 6.283; c.fillRect(p.x + r * Math.cos(a), p.y + r * Math.sin(a), 1.1, 1.1); } }
function startStroke(p) {
  const t = BR[tool]; let c = octx, layer = null;
  if (tool === 'eraser') {
    layer = drawTarget(false); if (!layer) return toast('Nothing to erase — the eraser works on drawing layers');
    c = layer.el.getContext('2d'); c.save(); c.setTransform(SC, 0, 0, SC, 0, 0); c.globalCompositeOperation = 'destination-out';
  } else {
    octx.clearRect(0, 0, W, H); overlay.style.opacity = t.opacity; overlay.style.mixBlendMode = tool === 'highlighter' ? 'multiply' : 'normal';
    overlay.style.zIndex = 9000;
  }
  c.fillStyle = c.strokeStyle = tool === 'eraser' ? '#000' : t.color; c.lineCap = c.lineJoin = 'round'; c.globalAlpha = 1;
  stroke = { c, layer, last: p, mid: p, lw: t.size, moved: false };
  if (tool === 'spray') sprayAt(c, p, t.size);
}
function moveStroke(p) {
  const s = stroke, c = s.c, t = BR[tool], a = s.last, d = Math.hypot(p.x - a.x, p.y - a.y);
  if (d < .7) return;
  const mid = { x: (a.x + p.x) / 2, y: (a.y + p.y) / 2 };
  const seg = lw => { c.lineWidth = lw; c.beginPath(); c.moveTo(s.mid.x, s.mid.y); c.quadraticCurveTo(a.x, a.y, mid.x, mid.y); c.stroke(); };
  if (tool === 'pencil') { c.globalAlpha = .55; for (let i = 0; i < 2; i++) { c.save(); c.translate((Math.random() - .5) * 1.2, (Math.random() - .5) * 1.2); seg(Math.max(.8, t.size * .6)); c.restore(); } c.globalAlpha = 1; }
  else if (tool === 'brush') { s.lw += (t.size * clamp(1.35 - d / 26, .3, 1.2) - s.lw) * .3; seg(s.lw); }
  else if (tool === 'calli') { c.lineWidth = 1; nib(c, a, p, t.size, -Math.PI / 4); }
  else if (tool === 'highlighter') { c.lineWidth = 1; nib(c, a, p, t.size, Math.PI * .44); }
  else if (tool === 'spray') sprayAt(c, p, t.size);
  else seg(t.size);
  s.last = p; s.mid = mid; s.moved = true;
}
function endStroke() {
  const s = stroke, t = BR[tool], c = s.c; stroke = null;
  if (!s.moved && tool !== 'spray') {           // a single tap leaves a dot
    if (tool === 'calli' || tool === 'highlighter') { c.lineWidth = 1; nib(c, s.last, { x: s.last.x + 1.5, y: s.last.y }, t.size, tool === 'calli' ? -Math.PI / 4 : Math.PI * .44); }
    else { c.beginPath(); c.arc(s.last.x, s.last.y, Math.max(.6, t.size / 2), 0, 6.283); c.fill(); }
  } else if (s.moved && !['calli', 'highlighter', 'spray', 'pencil'].includes(tool)) { c.lineWidth = tool === 'brush' ? s.lw : t.size; c.beginPath(); c.moveTo(s.mid.x, s.mid.y); c.lineTo(s.last.x, s.last.y); c.stroke(); }
  let L = s.layer;
  if (tool === 'eraser') c.restore();
  else {
    L = drawTarget(true); const lc = L.el.getContext('2d');
    lc.save(); lc.globalAlpha = t.opacity; lc.globalCompositeOperation = tool === 'highlighter' ? 'multiply' : 'source-over'; lc.drawImage(overlay, 0, 0); lc.restore();
    octx.clearRect(0, 0, W, H);
  }
  L.snap = copyCanvas(L.el); selId = L.id; commit();
}

/* ───────── pointer handling ───────── */
let drag = null;
function track(move, up) {
  const mv = e => { for (const ev of (e.getCoalescedEvents?.().length ? e.getCoalescedEvents() : [e])) move(pt(ev), e); };
  const end = e => { removeEventListener('pointermove', mv); removeEventListener('pointerup', end); removeEventListener('pointercancel', end); up && up(pt(e), e); };
  addEventListener('pointermove', mv); addEventListener('pointerup', end); addEventListener('pointercancel', end);
}
stage.addEventListener('pointerdown', e => {
  if (e.button !== 0) return;
  const p = pt(e), objEl = e.target.closest('.obj'), l = objEl && layers.find(x => x.id === objEl.dataset.id);
  if (objEl?.classList.contains('editing')) return;                 // let the caret work
  if (typing()) document.activeElement.blur();

  if (BR[tool]) { e.preventDefault(); startStroke(p); if (stroke) track(moveStroke, endStroke); return; }

  if (tool === 'shapes') {
    e.preventDefault();
    const line = isLine(S.kind), n = add({ type: 'shape', kind: S.kind, fill: S.fill, stroke: S.stroke, sw: S.sw, x: p.x, y: p.y, w: 1, h: line ? 24 : 1,
      name: SHAPES.find(s => s[0] === S.kind)[1] }, null, true);
    track((q, ev) => {
      if (line) { const len = Math.hypot(q.x - p.x, q.y - p.y); n.w = Math.max(1, len); n.x = (p.x + q.x) / 2 - n.w / 2; n.y = (p.y + q.y) / 2 - 12; n.rot = Math.atan2(q.y - p.y, q.x - p.x) * 180 / Math.PI; }
      else { let w = Math.abs(q.x - p.x), h = Math.abs(q.y - p.y); if (ev.shiftKey) w = h = Math.max(w, h); n.w = Math.max(1, w); n.h = Math.max(1, h); n.x = q.x < p.x ? p.x - n.w : p.x; n.y = q.y < p.y ? p.y - n.h : p.y; }
      render(n);
    }, () => {
      if (n.w < 8 && (line || n.h < 8)) { n.w = line ? 160 : 130; n.h = line ? 24 : 130; n.rot = 0; n.x = p.x - n.w / 2; n.y = p.y - n.h / 2; render(n); }
      selId = n.id; setTool('select'); commit();
    });
    return;
  }

  if (tool === 'text') {
    if (l?.type === 'text') { select(l.id); return startEdit(l); }
    e.preventDefault();
    const n = add({ type: 'text', text: '', x: p.x, y: p.y - S.fsize * .6, w: Math.min(300, W - p.x - 12), color: S.color, font: S.font, fsize: S.fsize,
      bold: S.bold, italic: S.italic, underline: S.underline, align: S.align }, null, true);
    selId = n.id; refresh(true); startEdit(n); return;
  }

  // select tool
  if (e.target.closest('.playbtn')) { const m = objEl.querySelector('video,audio'); m.paused ? m.play() : m.pause(); select(l.id); return; }
  if (!l) { select(null); return; }
  e.preventDefault(); select(l.id);
  const o = { x: l.x, y: l.y }; let moved = false;
  track(q => { if (!moved && Math.hypot(q.x - p.x, q.y - p.y) < 3) return; moved = true; const g = geom(l); l.x = clamp(o.x + q.x - p.x, -g.w / 2, W - g.w / 2); l.y = clamp(o.y + q.y - p.y, -g.h / 2, H - g.h / 2); render(l); updateSel(); },
    () => moved && commit());
});
stage.addEventListener('dblclick', e => { const o = e.target.closest('.obj.text'); if (o && tool === 'select') startEdit(layers.find(x => x.id === o.dataset.id)); });
stage.addEventListener('pointermove', e => {
  if (!BR[tool]) return; const p = pt(e), s = BR[tool].size;
  Object.assign(cursor.style, { display: 'block', width: s + 'px', height: s + 'px', left: p.x - s / 2 + 'px', top: p.y - s / 2 + 'px' });
});
stage.addEventListener('pointerleave', () => cursor.style.display = 'none');

// resize / rotate handles
selbox.addEventListener('pointerdown', e => {
  const hd = e.target.dataset.h, l = sel(); if (!hd || !l) return;
  e.preventDefault(); e.stopPropagation();
  const g = geom(l), rot = l.rot * Math.PI / 180, c = { x: g.x + g.w / 2, y: g.y + g.h / 2 };
  if (hd === 'rot') {
    track((q, ev) => { let a = Math.atan2(q.y - c.y, q.x - c.x) * 180 / Math.PI + 90; if (ev.shiftKey) a = Math.round(a / 15) * 15; l.rot = a; render(l); updateSel(); }, commit);
    return;
  }
  const [sx, sy] = hd.split(',').map(Number), fs0 = l.fsize;
  const off = rotv({ x: -sx * g.w / 2, y: -sy * g.h / 2 }, rot), A = { x: c.x + off.x, y: c.y + off.y };   // fixed opposite corner
  track((q, ev) => {
    const v = rotv({ x: q.x - A.x, y: q.y - A.y }, -rot);
    let w = Math.max(14, sx * v.x), h = Math.max(14, sy * v.y);
    if (KEEP_RATIO.has(l.type) || ev.shiftKey) { const s = Math.max(w / g.w, h / g.h); w = g.w * s; h = g.h * s; if (l.type === 'text') l.fsize = Math.max(6, fs0 * s); }
    const o2 = rotv({ x: sx * w / 2, y: sy * h / 2 }, rot);
    l.x = A.x + o2.x - w / 2; l.y = A.y + o2.y - h / 2; l.w = w; if (l.type !== 'text') l.h = h;
    render(l); updateSel();
  }, () => { if (l.type === 'text') { S.fsize = l.fsize; renderProps(); } commit(); });
});

/* text editing */
function startEdit(l) {
  const tx = l.el.firstChild; l.el.classList.add('editing');
  try { tx.contentEditable = 'plaintext-only'; } catch { tx.contentEditable = 'true'; }
  tx.focus(); const r = document.createRange(); r.selectNodeContents(tx); const s = getSelection(); s.removeAllRanges(); s.addRange(r);
  updateSel();
}
function endEdit(l) {
  const tx = l.el.firstChild; if (!l.el.classList.contains('editing')) return;
  tx.contentEditable = 'false'; l.el.classList.remove('editing');
  const t = tx.innerText.replace(/\n+$/, '');
  if (!t.trim()) { if (layers.includes(l)) { l.el.remove(); layers = layers.filter(x => x !== l); if (selId === l.id) selId = null; restack(); if (l.text) commit(); else refresh(true); } return; }
  if (t !== l.text) { l.text = t; l.name = t.slice(0, 22); commit(); } else updateSel();
}

/* uploads */
function addFile(f, at) {
  const src = URL.createObjectURL(f), name = f.name.replace(/\.[^.]+$/, '');
  if (f.type.startsWith('image/')) { const im = new Image(); im.onload = () => { const s = Math.min(1, 300 / Math.max(im.width, im.height)); add({ type: 'image', name, src, w: im.width * s, h: im.height * s }, at); }; im.src = src; }
  else if (f.type.startsWith('video/')) { const v = document.createElement('video'); v.onloadedmetadata = () => { const s = Math.min(1, 340 / Math.max(v.videoWidth, v.videoHeight)); add({ type: 'video', name, src, w: v.videoWidth * s, h: v.videoHeight * s }, at); }; v.onerror = () => toast('This video format is not supported by the browser'); v.src = src; }
  else if (f.type.startsWith('audio/')) add({ type: 'audio', name, src, w: 270, h: 76 }, at);
  else toast('Unsupported file: ' + f.name);
}
for (const id of ['fImage', 'fVideo', 'fAudio']) $('#' + id).addEventListener('change', e => { [...e.target.files].forEach(f => addFile(f)); e.target.value = ''; });
stage.addEventListener('dragover', e => e.preventDefault());
stage.addEventListener('drop', e => { e.preventDefault(); const p = pt(e);
  const k = e.dataTransfer.getData('text/x-stk'); if (k) { const it = ALL_STK[k]; if (it) addStk(it, p); return; } [...e.dataTransfer.files].forEach((f, i) => addFile(f, { x: p.x + i * 20, y: p.y + i * 20 })); });
addEventListener('paste', e => { if (typing()) return; [...(e.clipboardData?.files || [])].forEach(f => addFile(f)); });

/* ───────── flyouts: shapes + sticker library ───────── */
const LIB = window.STICKER_LIB || [];
const ALL_STK = Object.fromEntries(LIB.flatMap(c => c.items).map(it => [it.src, it]));
const LIB_SIZE = { notes: 230, papers: 260, pins: 90, clips: 100, buttons: 62, seals: 84, devices: 250, stationery: 120, collage: 130, alphabet: 46 };
const LIB_HINT = { notes: 'Add a note, then use the Text tool to write on it.', devices: 'Screens are see-through — drop a photo in and move its layer below the device.',
  papers: 'Use as a background: resize it, then send it backward in Layers.', alphabet: 'Spell a word with beads, or click single letters.' };
let libCat = 'notes', recent = [];
function addStk(it, at) {
  const s = (LIB_SIZE[it.cat] || 120) / Math.max(it.w, it.h);
  recent = [it, ...recent.filter(r => r !== it)].slice(0, 20);
  return add({ type: 'image', stk: true, name: it.name, src: it.src, w: it.w * s, h: it.h * s }, at);
}
function spell(word) {
  const beads = LIB.find(c => c.id === 'alphabet')?.items || [], chars = [...word.toUpperCase()].slice(0, 24);
  let x = Math.max(40, W * .25 - chars.length * 20), n = 0;
  for (const ch of chars) { const it = beads[ch.charCodeAt(0) - 65]; if (it) { addStk(it, { x, y: H * .5 + (n % 2 ? 3 : -3) }); n++; } x += 40; }
  if (!n) toast('Type letters A–Z');
}
const fly = $('#flyout');
function closeFly() { fly.hidden = true; }
function stkBtn(it) {
  return mk('button', { class: 'stk', title: it.name, draggable: 'true', onclick: () => addStk(it),
    ondragstart: e => { e.dataTransfer.setData('text/x-stk', it.src); e.dataTransfer.effectAllowed = 'copy'; } },
    mk('img', { src: it.src, loading: 'lazy', draggable: 'false', alt: it.name }));
}
function buildLibrary() {
  const rail = mk('div', { class: 'rail' }), pane = mk('div', { class: 'pane' });
  const cats = [...(recent.length ? [{ id: 'recent', name: 'Recently used', items: recent }] : []), ...LIB,
    { id: 'emoji', name: 'Emoji', glyph: '😊', count: Object.values(STICKERS).flat().length }, { id: 'tape', name: 'Washi tape', glyph: '🎀', count: TAPES.length }];
  if (!cats.some(c => c.id === libCat)) libCat = cats[0].id;
  const show = id => {
    libCat = id; const c = cats.find(c => c.id === id); pane.innerHTML = ''; pane.scrollTop = 0;
    [...rail.children].forEach(b => b.classList.toggle('on', b.dataset.id === id));
    pane.append(mk('div', { class: 'panehead' }, mk('b', {}, c.name), mk('span', {}, 'Click to add · or drag onto the page')));
    if (LIB_HINT[id]) pane.append(mk('p', { class: 'hint' }, LIB_HINT[id]));
    if (id === 'alphabet') {
      const inp = mk('input', { class: 'fontsearch', placeholder: 'Spell a word…', maxlength: 24, onkeydown: e => { e.stopPropagation(); if (e.key === 'Enter') { spell(inp.value); inp.value = ''; } } });
      pane.append(mk('div', { class: 'spell' }, inp, mk('button', { class: 'primary', onclick: () => { spell(inp.value); inp.value = ''; } }, 'Add')));
    }
    if (id === 'emoji') for (const g in STICKERS) pane.append(mk('h4', {}, g), mk('div', { class: 'grid emo' }, STICKERS[g].map(ch =>
      mk('button', { onclick: () => add({ type: 'sticker', char: ch, w: 72, h: 72, name: 'Sticker ' + ch }) }, ch))));
    else if (id === 'tape') pane.append(mk('div', { class: 'tapes' }, TAPES.map((bg, i) =>
      mk('button', { style: 'background:' + bg, onclick: () => add({ type: 'tape', pat: i, w: 170, h: 30, rot: -4 }) }))));
    else pane.append(mk('div', { class: 'grid stks' + (['notes', 'papers', 'devices'].includes(id) ? ' big' : '') }, c.items.map(stkBtn)));
  };
  cats.forEach(c => rail.append(mk('button', { 'data-id': c.id, onclick: () => show(c.id) },
    c.glyph ? mk('i', {}, c.glyph) : c.id === 'recent' ? mk('i', {}, '🕘') : mk('img', { src: c.items[c.id === 'alphabet' ? 0 : Math.min(2, c.items.length - 1)].src, alt: '' }),
    mk('span', {}, c.name), mk('em', {}, c.count ?? c.items.length))));
  show(libCat);
  return [rail, pane];
}
function openFly(kind) {
  fly.innerHTML = ''; fly.hidden = false; fly.className = kind === 'stickers' ? 'library' : '';
  if (kind === 'draw') {} else if (kind === 'shapes') {
    fly.append(mk('h4', {}, 'Shapes — pick one, then drag on the page'), mk('div', { class: 'grid' }, SHAPES.map(([k, n]) =>
      mk('button', { title: n, class: S.kind === k ? 'on' : '', html: `<svg viewBox="-2 -2 28 28"><path d="${shapePath(k, 24, 24)}" ${isLine(k) ? 'fill="none"' : ''}/></svg>`,
        onclick: () => { S.kind = k; closeFly(); renderProps(); } }))));
  } else fly.append(mk('div', { class: 'libhead' }, mk('h3', {}, 'Sticker library'), mk('button', { class: 'mini', title: 'Close', onclick: closeFly }, '✕')), mk('div', { class: 'libbody' }, buildLibrary()));
  if (kind === 'draw') { fly.className = 'brushes'; fly.innerHTML = ''; fly.append(mk('h4', {}, 'Pens & brushes'), ...TOOLS.filter(t => isBrush(t[0])).map(([id, label, icon, key]) =>
    mk('button', { class: 'brow' + (tool === id ? ' on' : ''), onclick: () => setTool(id) }, mk('span', { html: ic(icon) }), label, mk('kbd', {}, key.toUpperCase())))); }
  const r = $(`[data-tool=${kind}]`).getBoundingClientRect();
  fly.style.left = (kind === 'stickers' ? 16 : clamp(r.left + r.width / 2 - fly.offsetWidth / 2, 12, innerWidth - fly.offsetWidth - 12)) + 'px';
}
addEventListener('pointerdown', e => { if (!fly.hidden && fly.className !== 'library' && !fly.contains(e.target) && !e.target.closest('.tool')) closeFly(); }, true);

/* ───────── properties panel ───────── */
const props = $('#props');
function setP(k, v, done) {                      // update default + the selected text/shape
  S[k] = v; const l = sel(), keys = l?.type === 'text' ? ['color', 'font', 'fsize', 'bold', 'italic', 'underline', 'align'] : l?.type === 'shape' ? ['kind', 'fill', 'stroke', 'sw'] : [];
  if (keys.includes(k)) { l[k] = v; render(l); updateSel(); if (done) commit(); }
}
function swatches(get, set, none) {
  const row = mk('div', { class: 'swatches' });
  const mark = () => [...row.children].forEach(b => b.classList.toggle('on', b.dataset.c === get()));
  const pick = mk('input', { type: 'color', value: /^#/.test(get()) ? get() : '#000000', oninput: e => { set(e.target.value); mark(); }, onchange: e => set(e.target.value, true) });
  if (none) row.append(mk('button', { class: 'none', 'data-c': 'none', title: 'None', onclick: () => { set('none', true); mark(); } }));
  PAL.forEach(c => row.append(mk('button', { style: 'background:' + c, 'data-c': c, onclick: () => { set(c, true); mark(); } })));
  row.append(mk('label', { title: 'Custom colour' }, pick)); mark(); return row;
}
function slider(label, min, max, step, get, set, fmt = v => v) {
  const out = mk('output', {}, fmt(get()));
  return mk('label', { class: 'row' }, mk('span', {}, label),
    mk('input', { type: 'range', min, max, step, value: get(), oninput: e => { set(+e.target.value); out.textContent = fmt(+e.target.value); }, onchange: e => set(+e.target.value, true) }), out);
}
const pct = v => Math.round(v * 100) + '%';
function toggles(defs) {
  return mk('div', { class: 'btnrow' }, defs.map(([icon, title, on, fn]) => mk('button', { class: 'mini' + (on() ? ' on' : ''), title, html: ic(icon), onclick: () => { fn(); renderProps(); } })));
}
function fontPicker() {
  const list = mk('div', { class: 'fontlist' });
  const fill = (q = '') => {
    list.innerHTML = '';
    for (const [grp, fonts] of [['My system fonts', sysFonts], ['Google Fonts', G_FONTS.map(f => f[0])]]) {
      const m = fonts.filter(f => f.toLowerCase().includes(q)); if (!m.length) continue;
      list.append(mk('div', { class: 'fgrp' }, grp), ...m.map(f => mk('button', { class: 'fitem' + (S.font === f ? ' on' : ''), style: `font-family:${fontCss(f)}`,
        onclick: e => { list.querySelector('.on')?.classList.remove('on'); e.currentTarget.classList.add('on'); setP('font', f, true); document.fonts.load(`20px "${f}"`).then(updateSel); } }, f)));
    }
  };
  fill();
  const search = mk('input', { class: 'fontsearch', placeholder: 'Search fonts…', oninput: e => fill(e.target.value.trim().toLowerCase()) });
  const more = mk('button', { class: 'linkbtn', onclick: async () => {
    if (!window.queryLocalFonts) return toast('Your browser can’t list system fonts — try Chrome or Edge');
    try { const fams = [...new Set((await queryLocalFonts()).map(f => f.family))]; sysFonts = [...new Set([...sysFonts, ...fams])].sort(); fill(search.value.trim().toLowerCase()); toast(fams.length + ' system fonts loaded'); }
    catch { toast('Permission to read system fonts was not granted'); }
  } }, '+ Load every font installed on this computer');
  return [search, list, more];
}
function renderProps() {
  const l = sel(), T = BR[tool]; props.innerHTML = '';
  props.hidden = propsLocked || !(T || tool === 'text' || tool === 'shapes' || (l && l.type !== 'draw')); updateSide();
  if (props.hidden) return;
  const head = t => props.append(mk('div', { class: 'cardhead' }, mk('h3', {}, t)));
  const sub = t => mk('div', { class: 'sub' }, t);
  if (T) {
    head(TOOLS.find(t => t[0] === tool)[1]);
    const dot = mk('i'), upd = () => { const s = Math.min(T.size, 58); dot.style.cssText = `width:${s}px;height:${s}px;background:${tool === 'eraser' ? '#fff;box-shadow:0 0 0 1px #9aa5b3' : T.color};opacity:${T.opacity}`; cursor.style.display = 'none'; };
    upd(); props.append(mk('div', { class: 'preview' }, dot));
    if (tool !== 'eraser') props.append(sub('Colour'), swatches(() => T.color, c => { T.color = c; upd(); }));
    props.append(slider('Size', 1, T.max, .5, () => T.size, v => { T.size = v; upd(); }, v => v + 'px'));
    if (tool !== 'eraser') props.append(slider('Opacity', .05, 1, .05, () => T.opacity, v => { T.opacity = v; upd(); }, pct));
  } else if (tool === 'text' || l?.type === 'text') {
    head('Text'); props.append(...fontPicker(),
      slider('Size', 8, 160, 1, () => Math.round(S.fsize), (v, d) => setP('fsize', v, d), v => v + 'px'),
      toggles([['bold', 'Bold', () => S.bold, () => setP('bold', !S.bold, true)], ['italic', 'Italic', () => S.italic, () => setP('italic', !S.italic, true)],
        ['underline', 'Underline', () => S.underline, () => setP('underline', !S.underline, true)],
        ['left', 'Align left', () => S.align === 'left', () => setP('align', 'left', true)], ['center', 'Align centre', () => S.align === 'center', () => setP('align', 'center', true)],
        ['right', 'Align right', () => S.align === 'right', () => setP('align', 'right', true)]]),
      sub('Colour'), swatches(() => S.color, (c, d) => setP('color', c, d)));
    if (!l) props.append(mk('p', { class: 'hint', style: 'margin-top:10px' }, 'Click anywhere on the page to start typing.'));
  } else if (tool === 'shapes' || l?.type === 'shape') {
    head('Shape');
    props.append(sub('Fill'), swatches(() => S.fill, (c, d) => setP('fill', c, d), true), sub('Outline'), swatches(() => S.stroke, (c, d) => setP('stroke', c, d), true),
      slider('Thickness', 0, 20, .5, () => S.sw, (v, d) => setP('sw', v, d), v => v + 'px'));
    if (!l) props.append(mk('p', { class: 'hint', style: 'margin-top:10px' }, 'Drag on the page to draw. Hold Shift for equal sides.'));
  } else if (l && l.type !== 'draw') head(NAMES[l.type]);


  if (l && l.type !== 'draw' && !T) props.append(
    slider('Rotate', -180, 180, 1, () => Math.round(((l.rot + 180) % 360 + 360) % 360 - 180), (v, d) => { l.rot = v; render(l); updateSel(); d && commit(); }, v => v + '°'),
    mk('div', { class: 'btnrow' }, mk('button', { class: 'mini', title: 'Duplicate (⌘D)', html: ic('copy'), onclick: () => duplicate(l) }),
      mk('button', { class: 'mini', title: 'Delete', html: ic('trash'), onclick: () => removeLayer(l) })));
}

/* ───────── layers panel ───────── */
const TH = { draw: 'brush', text: 'text', shape: 'shapes', image: 'image', video: 'video', audio: 'music', tape: 'sticker' };
let dragId = null;
function renderLayers() {
  const list = $('#layerList'); list.innerHTML = '';
  if (!layers.length) list.append(mk('p', { class: 'hint', style: 'padding:6px' }, 'No layers yet.'));
  [...layers].reverse().forEach(l => {
    const nm = mk('span', { class: 'nm' }, l.name);
    nm.addEventListener('dblclick', () => { nm.contentEditable = 'true'; nm.focus(); getSelection().selectAllChildren(nm); });
    nm.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); nm.blur(); } e.stopPropagation(); });
    nm.addEventListener('blur', () => { if (nm.contentEditable !== 'true') return; nm.contentEditable = 'false'; const v = nm.textContent.trim(); if (v && v !== l.name) { l.name = v; commit(); } else nm.textContent = l.name; });
    const row = mk('div', { class: 'lrow' + (l.id === selId ? ' on' : ''), draggable: 'true',
      onclick: e => { if (!e.target.closest('.mini') && nm.contentEditable !== 'true') { if (BR[tool] && l.type !== 'draw') setTool('select'); select(l.id); } },
      ondragstart: () => dragId = l.id, ondragover: e => { e.preventDefault(); row.classList.add('over'); }, ondragleave: () => row.classList.remove('over'),
      ondrop: e => { e.preventDefault(); const d = layers.find(x => x.id === dragId); if (d && d !== l) { layers.splice(layers.indexOf(d), 1); layers.splice(layers.indexOf(l) + 1, 0, d); restack(); commit(); } } },
      mk('span', { class: 'th', html: l.type === 'sticker' ? l.char : l.stk ? `<img src="${l.src}">` : ic(TH[l.type]) }), nm,
      mk('button', { class: 'mini' + (l.locked ? '' : ' off'), title: l.locked ? 'Unlock' : 'Lock', html: ic(l.locked ? 'lock' : 'unlock'), onclick: () => { l.locked = !l.locked; render(l); commit(); } }),
      mk('button', { class: 'mini' + (l.visible ? '' : ' off'), title: l.visible ? 'Hide' : 'Show', html: ic(l.visible ? 'eye' : 'eyeoff'), onclick: () => { l.visible = !l.visible; render(l); commit(); } }));
    list.append(row);
  });
  const s = sel(), op = $('#layerOp'); op.disabled = !s; op.value = s ? s.opacity : 1; $('#layerOpV').textContent = pct(s ? s.opacity : 1);
}
$('#layerOp').addEventListener('input', e => { const l = sel(); if (l) { l.opacity = +e.target.value; render(l); $('#layerOpV').textContent = pct(l.opacity); } });
$('#layerOp').addEventListener('change', () => sel() && commit());
$('#layerBtns').append(
  mk('button', { class: 'mini', title: 'Bring forward', html: ic('up'), onclick: () => { const l = sel(); l && moveLayer(l, layers.indexOf(l) + 1); } }),
  mk('button', { class: 'mini', title: 'Send backward', html: ic('down'), onclick: () => { const l = sel(); l && moveLayer(l, layers.indexOf(l) - 1); } }),
  mk('button', { class: 'mini', title: 'Duplicate layer', html: ic('copy'), onclick: () => duplicate(sel()) }),
  mk('button', { class: 'mini', title: 'Delete layer', html: ic('trash'), onclick: () => removeLayer(sel()) }));
$('#addDraw').innerHTML = ic('plus');
$('#addDraw').onclick = () => { const l = add({ type: 'draw', name: 'Drawing ' + (layers.filter(x => x.type === 'draw').length + 1) }, null, true); selId = l.id; commit(); };

/* ───────── export: PNG · SVG · GIF · MP4, one spread or many ───────── */
const TAPE_FLAT = ['#ffd0de', '#a9d6ff', '#d6f6e0', '#ffe58a', '#e3d7ff', '#dec29a'];
const mctx = document.createElement('canvas').getContext('2d');
const fontStr = l => `${l.italic ? 'italic ' : ''}${l.bold ? 700 : 400} ${l.fsize}px ${fontCss(l.font)}`;
function wrapLines(l, w) {
  mctx.font = fontStr(l); const out = [];
  for (const para of l.text.split('\n')) { let line = ''; for (const word of para.split(' ')) { const t = line ? line + ' ' + word : word; if (line && mctx.measureText(t).width > w) { out.push(line); line = word; } else line = t; } out.push(line); }
  return out;
}
function drawSpread(x) {
  x.save(); x.fillStyle = '#fcf9f1'; x.fillRect(0, 0, W, H); x.strokeStyle = x.fillStyle = '#e2ebf4'; x.lineWidth = 1;
  const paper = book.dataset.paper;
  if (paper === 'lined') for (let y = 103.5; y < H; y += 32) { x.beginPath(); x.moveTo(0, y); x.lineTo(W, y); x.stroke(); }
  if (paper === 'grid') { for (let y = .5; y < H; y += 24) { x.beginPath(); x.moveTo(0, y); x.lineTo(W, y); x.stroke(); } for (let i = .5; i < W; i += 24) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, H); x.stroke(); } }
  if (paper === 'dotted') { x.fillStyle = '#cdd9e6'; for (let y = 11; y < H; y += 22) for (let i = 11; i < W; i += 22) { x.beginPath(); x.arc(i, y, 1.2, 0, 6.3); x.fill(); } }
  const sp = x.createLinearGradient(W / 2 - 40, 0, W / 2 + 40, 0); sp.addColorStop(0, 'rgba(40,30,10,0)'); sp.addColorStop(.5, 'rgba(40,30,10,.16)'); sp.addColorStop(1, 'rgba(40,30,10,0)');
  x.fillStyle = sp; x.fillRect(W / 2 - 40, 0, 80, H);
  for (const l of layers) {
    if (!l.visible) continue; x.save(); x.globalAlpha = l.opacity;
    if (l.type === 'draw') { x.drawImage(l.el, 0, 0, W, H); x.restore(); continue; }
    const g = geom(l); x.translate(g.x + g.w / 2, g.y + g.h / 2); x.rotate(l.rot * Math.PI / 180); x.translate(-g.w / 2, -g.h / 2);
    if (l.type === 'image' || l.type === 'video') { try { x.drawImage(l.el.firstChild, 0, 0, g.w, g.h); } catch {} }
    else if (l.type === 'sticker') { x.font = `${g.h * .82}px "Apple Color Emoji","Segoe UI Emoji",sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(l.char, g.w / 2, g.h / 2 + g.h * .05); }
    else if (l.type === 'tape') { x.globalAlpha *= .9; x.fillStyle = TAPE_FLAT[l.pat]; x.fillRect(0, 0, g.w, g.h); }
    else if (l.type === 'shape') { const p = new Path2D(shapePath(l.kind, g.w, g.h)); x.lineJoin = x.lineCap = 'round'; if (!isLine(l.kind) && l.fill !== 'none') { x.fillStyle = l.fill; x.fill(p); } if (l.stroke !== 'none' && l.sw > 0) { x.strokeStyle = l.stroke; x.lineWidth = l.sw; x.stroke(p); } }
    else if (l.type === 'audio') { x.fillStyle = '#fff'; x.strokeStyle = '#e6edf5'; x.beginPath(); x.roundRect(0, 0, g.w, g.h, 16); x.fill(); x.stroke(); x.fillStyle = '#2b2b33'; x.font = '500 13px Satoshi,sans-serif'; x.textBaseline = 'middle'; x.fillText('♪  ' + l.name, 18, g.h / 2, g.w - 36); }
    else if (l.type === 'text') {
      x.font = fontStr(l); x.fillStyle = l.color; x.textBaseline = 'middle'; x.textAlign = l.align;
      const lh = l.fsize * 1.25, ax = l.align === 'center' ? g.w / 2 : l.align === 'right' ? g.w : 0;
      wrapLines(l, g.w).forEach((t, i) => x.fillText(t, ax, lh / 2 + i * lh));
    }
    x.restore();
  }
  x.restore();
}
function spreadCanvas(k) { const c = document.createElement('canvas'); c.width = Math.round(W * k); c.height = Math.round(H * k); const x = c.getContext('2d'); x.scale(c.width / W, c.height / H); drawSpread(x); return c; }
const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function elURL(el, w, h) { const k = Math.min(3, 900 / Math.max(w, h)), c = document.createElement('canvas'); c.width = Math.max(1, w * k); c.height = Math.max(1, h * k); try { c.getContext('2d').drawImage(el, 0, 0, c.width, c.height); return c.toDataURL('image/png'); } catch { return ''; } }
function spreadSVG() {
  let o = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#fcf9f1"/>`;
  const paper = book.dataset.paper;
  if (paper === 'lined') { o += '<g stroke="#e2ebf4">'; for (let y = 103.5; y < H; y += 32) o += `<path d="M0 ${y}H${W}"/>`; o += '</g>'; }
  if (paper === 'grid') { o += '<g stroke="#e2ebf4">'; for (let y = .5; y < H; y += 24) o += `<path d="M0 ${y}H${W}"/>`; for (let i = .5; i < W; i += 24) o += `<path d="M${i} 0V${H}"/>`; o += '</g>'; }
  if (paper === 'dotted') { o += '<g fill="#cdd9e6">'; for (let y = 11; y < H; y += 22) for (let i = 11; i < W; i += 22) o += `<circle cx="${i}" cy="${y}" r="1.2"/>`; o += '</g>'; }
  o += `<path d="M${W / 2} 0V${H}" stroke="#d9d2c0"/>`;
  for (const l of layers) {
    if (!l.visible) continue;
    if (l.type === 'draw') { o += `<image href="${l.el.toDataURL('image/png')}" width="${W}" height="${H}" opacity="${l.opacity}"/>`; continue; }
    const g = geom(l), f = n => +n.toFixed(2);
    o += `<g opacity="${l.opacity}" transform="translate(${f(g.x + g.w / 2)} ${f(g.y + g.h / 2)}) rotate(${f(l.rot)}) translate(${f(-g.w / 2)} ${f(-g.h / 2)})">`;
    if (l.type === 'image' || l.type === 'video') o += `<image href="${elURL(l.el.firstChild, g.w, g.h)}" width="${f(g.w)}" height="${f(g.h)}" preserveAspectRatio="none"/>`;
    else if (l.type === 'sticker') o += `<text x="${f(g.w / 2)}" y="${f(g.h / 2)}" font-size="${f(g.h * .82)}" text-anchor="middle" dominant-baseline="central">${esc(l.char)}</text>`;
    else if (l.type === 'tape') o += `<rect width="${f(g.w)}" height="${f(g.h)}" fill="${TAPE_FLAT[l.pat]}" opacity=".9"/>`;
    else if (l.type === 'shape') o += `<path d="${shapePath(l.kind, g.w, g.h)}" fill="${isLine(l.kind) ? 'none' : l.fill}" stroke="${l.stroke}" stroke-width="${l.sw}" stroke-linejoin="round" stroke-linecap="round"/>`;
    else if (l.type === 'audio') o += `<rect width="${g.w}" height="${g.h}" rx="16" fill="#fff" stroke="#e6edf5"/><text x="18" y="${g.h / 2}" font-family="Satoshi,sans-serif" font-size="13" dominant-baseline="central">♪  ${esc(l.name)}</text>`;
    else if (l.type === 'text') {
      const lh = l.fsize * 1.25, ax = l.align === 'center' ? g.w / 2 : l.align === 'right' ? g.w : 0, anchor = { left: 'start', center: 'middle', right: 'end' }[l.align];
      o += `<text font-family="${esc(fontCss(l.font))}" font-size="${f(l.fsize)}" fill="${l.color}" font-weight="${l.bold ? 700 : 400}" font-style="${l.italic ? 'italic' : 'normal'}"${l.underline ? ' text-decoration="underline"' : ''} text-anchor="${anchor}" dominant-baseline="central" xml:space="preserve">`
        + wrapLines(l, g.w).map((t, i) => `<tspan x="${f(ax)}" y="${f(lh / 2 + i * lh)}">${esc(t)}</tspan>`).join('') + '</text>';
    }
    o += '</g>';
  }
  return o + '</svg>';
}
// tiny store-only ZIP so several pages arrive as one download
const crc32 = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return b => { let c = ~0; for (let i = 0; i < b.length; i++) c = t[(c ^ b[i]) & 255] ^ (c >>> 8); return ~c >>> 0; }; })();
function zip(files) {
  const enc = new TextEncoder(), parts = [], cen = []; let off = 0, cs = 0;
  for (const f of files) {
    const nm = enc.encode(f.name), crc = crc32(f.data), n = f.data.length, h = new DataView(new ArrayBuffer(30)), c = new DataView(new ArrayBuffer(46));
    h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x800, true); h.setUint16(12, 33, true); h.setUint32(14, crc, true); h.setUint32(18, n, true); h.setUint32(22, n, true); h.setUint16(26, nm.length, true);
    c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x800, true); c.setUint16(14, 33, true); c.setUint32(16, crc, true); c.setUint32(20, n, true); c.setUint32(24, n, true); c.setUint16(28, nm.length, true); c.setUint32(42, off, true);
    parts.push(h, nm, f.data); cen.push(c, nm); off += 30 + nm.length + n; cs += 46 + nm.length;
  }
  const e = new DataView(new ArrayBuffer(22)); e.setUint32(0, 0x06054b50, true); e.setUint16(8, files.length, true); e.setUint16(10, files.length, true); e.setUint32(12, cs, true); e.setUint32(16, off, true);
  return new Blob([...parts, ...cen, e], { type: 'application/zip' });
}
// GIF89a encoder: fixed 6×7×6 palette, Floyd–Steinberg dither, LZW
function gifEncode(frames, w, h) {
  const out = [], u16 = v => out.push(v & 255, v >> 8), RL = [0, 51, 102, 153, 204, 255], GL = [0, 43, 85, 128, 170, 213, 255];
  out.push(...[...'GIF89a'].map(c => c.charCodeAt(0))); u16(w); u16(h); out.push(0xF7, 0, 0);
  for (let i = 0; i < 256; i++) i < 252 ? out.push(RL[i / 42 | 0], GL[(i / 6 | 0) % 7], RL[i % 6]) : out.push(0, 0, 0);
  out.push(0x21, 0xFF, 11, ...[...'NETSCAPE2.0'].map(c => c.charCodeAt(0)), 3, 1, 0, 0, 0);
  for (const [img, delay] of frames) {
    const d = img.data, n = w * h, idx = new Uint8Array(n), er = new Float32Array((w + 2) * 3), nx = new Float32Array((w + 2) * 3);
    for (let y = 0, p = 0; y < h; y++) {
      nx.fill(0);
      for (let xx = 0; xx < w; xx++, p++) {
        const e = (xx + 1) * 3, r = clamp(d[p * 4] + er[e], 0, 255), g = clamp(d[p * 4 + 1] + er[e + 1], 0, 255), b = clamp(d[p * 4 + 2] + er[e + 2], 0, 255);
        const ri = Math.round(r / 51), gi = Math.round(g / 42.5), bi = Math.round(b / 51); idx[p] = ri * 42 + gi * 6 + bi;
        const q = [r - RL[ri], g - GL[gi], b - RL[bi]];
        for (let k = 0; k < 3; k++) { er[e + 3 + k] += q[k] * .4375; nx[e - 3 + k] += q[k] * .1875; nx[e + k] += q[k] * .3125; nx[e + 3 + k] += q[k] * .0625; }
      }
      er.set(nx);
    }
    out.push(0x21, 0xF9, 4, 0); u16(delay); out.push(0, 0, 0x2C); u16(0); u16(0); u16(w); u16(h); out.push(0, 8);
    let size = 9, next = 258, acc = 0, bits = 0, dict = new Map(), sub = [];
    const emit = c => { acc |= c << bits; bits += size; while (bits >= 8) { sub.push(acc & 255); acc >>>= 8; bits -= 8; if (sub.length === 255) { out.push(255); for (const v of sub) out.push(v); sub = []; } } };
    emit(256); let pre = idx[0];
    for (let i = 1; i < n; i++) {
      const k = idx[i], key = pre << 8 | k, v = dict.get(key);
      if (v !== undefined) pre = v;
      else { emit(pre); if (next < 4096) { dict.set(key, next++); if (next > (1 << size) && size < 12) size++; } else { emit(256); dict = new Map(); size = 9; next = 258; } pre = k; }
    }
    emit(pre); emit(257); if (bits > 0) sub.push(acc & 255); if (sub.length) { out.push(sub.length); for (const v of sub) out.push(v); } out.push(0);
  }
  out.push(0x3B); return new Blob([new Uint8Array(out)], { type: 'image/gif' });
}
function save(blob, name) { const a = mk('a', { href: URL.createObjectURL(blob), download: name }); document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function showSpread(i) {
  if (i !== cur) gotoSpread(i);
  await Promise.all([...stage.querySelectorAll('img')].map(im => im.decode().catch(() => {})));
  await Promise.all([...stage.querySelectorAll('video')].map(v => v.readyState >= 2 ? 0 : Promise.race([new Promise(r => v.addEventListener('loadeddata', r, { once: true })), sleep(2500)])));
  await document.fonts.ready;
}
const pagesName = i => `${i * 2 + 1}-${i * 2 + 2}`;
async function runExport(fmt, list) {
  closePop(); select(null); if (typing()) document.activeElement.blur();
  const home = cur; list = [...list].sort((a, b) => a - b); toast('Exporting…', 0);
  try {
    if (fmt === 'png' || fmt === 'svg') {
      const files = [];
      for (const i of list) {
        await showSpread(i);
        const blob = fmt === 'png' ? await new Promise(r => spreadCanvas(2).toBlob(r, 'image/png')) : new Blob([spreadSVG()], { type: 'image/svg+xml' });
        files.push({ name: `mb-diary-pages-${pagesName(i)}.${fmt}`, blob });
      }
      if (files.length === 1) save(files[0].blob, files[0].name);
      else { for (const f of files) f.data = new Uint8Array(await f.blob.arrayBuffer()); save(zip(files), 'mb-diary-pages.zip'); }
    } else if (fmt === 'gif') {
      const k = .7, w = Math.round(W * k), h = Math.round(H * k), frames = [];
      const grab = () => spreadCanvas(k).getContext('2d').getImageData(0, 0, w, h);
      for (const i of list) {
        await showSpread(i);
        const vids = [...stage.querySelectorAll('video')].filter(v => isFinite(v.duration) && v.duration > 0);
        if (!vids.length) { frames.push([grab(), list.length > 1 ? 160 : 300]); continue; }
        const dur = Math.min(4, Math.max(...vids.map(v => v.duration))), n = Math.ceil(dur * 8);
        for (let f = 0; f < n; f++) {
          await Promise.all(vids.map(v => new Promise(r => { v.addEventListener('seeked', r, { once: true }); v.currentTime = (f / 8) % v.duration; setTimeout(r, 600); })));
          frames.push([grab(), 12]); toast(`Rendering GIF… pages ${pagesName(i)}, frame ${f + 1}/${n}`, 0);
        }
      }
      await sleep(30); save(gifEncode(frames, w, h), list.length > 1 ? 'mb-diary.gif' : `mb-diary-pages-${pagesName(list[0])}.gif`);
    } else {
      const mime = ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm'].find(m => window.MediaRecorder && MediaRecorder.isTypeSupported(m));
      if (!mime) return toast('This browser cannot record video — try Chrome, Edge or Safari');
      const c = document.createElement('canvas'); c.width = 1320; c.height = 850; const x = c.getContext('2d'); x.scale(1.25, 1.25);
      actx = actx || new AudioContext(); await actx.resume();
      const dest = actx.createMediaStreamDestination(), stream = c.captureStream(30); dest.stream.getAudioTracks().forEach(t => stream.addTrack(t));
      const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 6e6 }), chunks = []; rec.ondataavailable = e => e.data.size && chunks.push(e.data);
      const done = new Promise(r => rec.onstop = r); await showSpread(list[0]); drawSpread(x); rec.start();
      for (const i of list) {
        await showSpread(i);
        const media = [...stage.querySelectorAll('video,audio')]; let dur = 3;
        for (const m of media) { if (isFinite(m.duration)) dur = Math.max(dur, Math.min(m.duration, 20)); try { const n = actx.createMediaElementSource(m); n.connect(dest); n.connect(actx.destination); } catch {} m.currentTime = 0; m.play().catch(() => {}); }
        const t0 = performance.now();
        await new Promise(res => { const tick = () => { drawSpread(x); const t = (performance.now() - t0) / 1000; toast(`Recording pages ${pagesName(i)}… ${Math.min(dur, t).toFixed(0)}/${dur.toFixed(0)}s — keep this tab open`, 0); t < dur ? requestAnimationFrame(tick) : res(); }; tick(); });
        media.forEach(m => m.pause());
      }
      rec.stop(); await done; const mp4 = mime.includes('mp4');
      save(new Blob(chunks, { type: mime.split(';')[0] }), 'mb-diary.' + (mp4 ? 'mp4' : 'webm')); if (!mp4) { if (cur !== home) gotoSpread(home); return toast('Saved as WebM — this browser cannot write MP4', 4000); }
    }
    toast('Export saved');
  } catch (err) { console.error(err); toast('Export failed: ' + err.message, 4000); }
  finally { if (cur !== home) gotoSpread(home); }
}

/* ───────── chrome wiring ───────── */
const card = $('#toolcard');
const BAR = ['select', 'text', 'draw', 'eraser', '|', 'shapes', 'stickers', 'image', 'video', 'music', '|', 'layers', 'lock'];
const EXTRA = { draw: ['Pens & brushes', 'pen', ''], lock: ['Hide properties (just write)', 'panel', ''] };
BAR.forEach(id => {
  if (id === '|') return card.append(mk('i', { class: 'sep' }));
  const t = TOOLS.find(t => t[0] === id), [label, icon, key] = t ? t.slice(1) : EXTRA[id];
  card.append(mk('button', { class: 'tool', 'data-tool': id, 'data-tip': label + (key ? '  ·  ' + key.toUpperCase() : ''), 'aria-label': label,
    html: ic(icon) + (id === 'draw' ? '<svg class="ic car" viewBox="0 0 24 24">' + I.caret + '</svg>' : ''), onclick: () => setTool(id) }));
});
$('#undoBtn').innerHTML = ic('undo'); $('#redoBtn').innerHTML = ic('redo'); $('#exportBtn').innerHTML = ic('download') + 'Export';
$('#undoBtn').onclick = undo; $('#redoBtn').onclick = redo;

/* popovers under the top bar */
const pop = $('#pop'); let popFor = null;
function closePop() { pop.hidden = true; popFor = null; }
function openPop(anchor, build) {
  if (popFor === anchor) return closePop();
  pop.innerHTML = ''; pop.hidden = false; popFor = anchor; build(pop);
  const r = anchor.getBoundingClientRect(); pop.style.right = Math.max(12, innerWidth - r.right) + 'px';
}
addEventListener('pointerdown', e => { if (!pop.hidden && !pop.contains(e.target) && !e.target.closest('.actions')) closePop(); }, true);

/* desk background + paper */
const chk = c => `linear-gradient(${c} 50%,transparent 50%) 0 0/36px 36px,linear-gradient(90deg,${c} 50%,transparent 50%) 0 0/36px 36px,#fff`;
const BGS = [['Blue check', chk('rgba(108,180,245,.13)')], ['Pink check', chk('rgba(245,130,170,.14)')], ['Sage check', chk('rgba(110,175,120,.16)')], ['Butter check', chk('rgba(240,195,70,.18)')],
  ['Dots', 'radial-gradient(#cfe0f2 1.6px,transparent 2px) 0 0/22px 22px,#fbfdff'],
  ['Graph', 'linear-gradient(#e3edf7 1px,transparent 1px) 0 0/24px 24px,linear-gradient(90deg,#e3edf7 1px,transparent 1px) 0 0/24px 24px,#fff'],
  ['Wooden desk', 'repeating-linear-gradient(90deg,rgba(90,55,25,.10) 0 2px,transparent 2px 9px),repeating-linear-gradient(90deg,rgba(60,35,15,.12) 0 140px,rgba(120,80,45,.05) 140px 280px),linear-gradient(#c9a27a,#b88d63)'],
  ['Kraft', '#d9c3a3'], ['Blush', 'linear-gradient(135deg,#ffe3ec,#e6f0ff)'], ['Mint', 'linear-gradient(135deg,#e2f7ec,#eef4ff)'],
  ['Night', 'radial-gradient(#fff 1px,transparent 1.5px) 0 0/90px 90px,radial-gradient(#fff 1px,transparent 1.5px) 45px 30px/130px 130px,linear-gradient(#1c2340,#2d2a55)'], ['Plain', '#ffffff']];
let bgName = 'Blue check';
function setBg(name, css) { bgName = name; document.body.style.background = css; try { name === 'Your image' ? localStorage.removeItem('mb-bg') : localStorage.setItem('mb-bg', name); } catch {} }
try { const b = BGS.find(b => b[0] === localStorage.getItem('mb-bg')); if (b) setBg(...b); } catch {}
const bgFile = mk('input', { type: 'file', accept: 'image/*', hidden: '', onchange: e => { const f = e.target.files[0]; if (f) setBg('Your image', `url("${URL.createObjectURL(f)}") center/cover fixed`); closePop(); } });
document.body.append(bgFile);
$('#lookBtn').innerHTML = ic('look');
$('#lookBtn').onclick = e => openPop(e.currentTarget, p => {
  const grid = mk('div', { class: 'bggrid' }, BGS.map(([n, css]) => mk('button', { title: n, class: bgName === n ? 'on' : '', style: 'background:' + css, onclick: ev => { setBg(n, css); grid.querySelector('.on')?.classList.remove('on'); ev.currentTarget.classList.add('on'); } })),
    mk('button', { class: 'up', title: 'Use your own image', html: ic('image'), onclick: () => bgFile.click() }));
  const seg = mk('div', { class: 'seg' }, ['lined', 'dotted', 'grid', 'blank'].map(k => mk('button', { class: book.dataset.paper === k ? 'on' : '', onclick: ev => { book.dataset.paper = k; seg.querySelector('.on')?.classList.remove('on'); ev.currentTarget.classList.add('on'); } }, k[0].toUpperCase() + k.slice(1))));
  p.append(mk('h4', {}, 'Desk background'), grid, mk('p', { class: 'hint' }, 'The last tile uploads your own picture.'), mk('h4', {}, 'Paper'), seg);
});

/* ambience */
let actx;
const AMB = { on: false, kind: 'Soft chimes', vol: .5, stop: null, file: null };
function noiseSrc() { const n = actx.sampleRate * 3, b = actx.createBuffer(1, n, actx.sampleRate), d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; const s = actx.createBufferSource(); s.buffer = b; s.loop = true; s.start(); return s; }
function ambStart() {
  ambStop(); actx = actx || new AudioContext(); actx.resume();
  const out = actx.createGain(); out.gain.value = AMB.vol; out.connect(actx.destination); AMB.out = out; const kill = [() => out.disconnect()];
  if (AMB.kind === 'My music' && AMB.file) { const a = new Audio(AMB.file); a.loop = true; a.volume = AMB.vol; a.play(); AMB.audio = a; kill.push(() => { a.pause(); AMB.audio = null; }); }
  else if (AMB.kind === 'Rain') { const s = noiseSrc(), hp = actx.createBiquadFilter(), lp = actx.createBiquadFilter(), g = actx.createGain(); hp.type = 'highpass'; hp.frequency.value = 900; lp.type = 'lowpass'; lp.frequency.value = 7000; g.gain.value = .22; s.connect(hp).connect(lp).connect(g).connect(out); kill.push(() => s.stop()); }
  else if (AMB.kind === 'Ocean waves') { const s = noiseSrc(), lp = actx.createBiquadFilter(), g = actx.createGain(), lfo = actx.createOscillator(), lg = actx.createGain(); lp.type = 'lowpass'; lp.frequency.value = 520; g.gain.value = .45; lfo.frequency.value = .11; lg.gain.value = .35; lfo.connect(lg).connect(g.gain); lfo.start(); s.connect(lp).connect(g).connect(out); kill.push(() => { s.stop(); lfo.stop(); }); }
  else {
    const dl = actx.createDelay(1), fb = actx.createGain(); dl.delayTime.value = .42; fb.gain.value = .38; dl.connect(fb).connect(dl); dl.connect(out);
    const scale = [261.63, 293.66, 329.63, 392, 440, 523.25, 587.33, 659.25, 783.99];
    const note = () => { const o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime; o.type = Math.random() < .5 ? 'sine' : 'triangle'; o.frequency.value = scale[Math.random() * scale.length | 0] / (Math.random() < .3 ? 2 : 1);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.16, t + .03); g.gain.exponentialRampToValueAtTime(.0005, t + 3.5); o.connect(g); g.connect(out); g.connect(dl); o.start(t); o.stop(t + 3.6); };
    note(); const iv = setInterval(() => Math.random() < .8 && note(), 1100); kill.push(() => clearInterval(iv));
  }
  AMB.stop = () => kill.forEach(f => { try { f(); } catch {} }); AMB.on = true; ambUI();
}
function ambStop() { AMB.stop?.(); AMB.stop = null; AMB.on = false; ambUI(); }
function ambUI() { const b = $('#ambBtn'); b.innerHTML = ic(AMB.on ? 'sound' : 'mute'); b.classList.toggle('live', AMB.on); b.title = AMB.on ? 'Pause ambience' : 'Play ambience'; }
const ambFile = mk('input', { type: 'file', accept: 'audio/*', hidden: '', onchange: e => { const f = e.target.files[0]; if (f) { AMB.file = URL.createObjectURL(f); AMB.kind = 'My music'; ambStart(); closePop(); } } });
document.body.append(ambFile); ambUI(); $('#ambMore').innerHTML = ic('caret');
$('#ambBtn').onclick = () => AMB.on ? ambStop() : ambStart();
$('#ambMore').onclick = e => openPop(e.currentTarget, p => {
  p.append(mk('h4', {}, 'Ambience'), ...['Soft chimes', 'Rain', 'Ocean waves'].map(k => mk('button', { class: 'prow' + (AMB.kind === k ? ' on' : ''), onclick: () => { AMB.kind = k; ambStart(); closePop(); } }, k)),
    mk('button', { class: 'prow' + (AMB.kind === 'My music' ? ' on' : ''), onclick: () => ambFile.click() }, 'My own music…'),
    mk('label', { class: 'row' }, mk('span', {}, 'Volume'), mk('input', { type: 'range', min: 0, max: 1, step: .01, value: AMB.vol, oninput: ev => { AMB.vol = +ev.target.value; if (AMB.out) AMB.out.gain.value = AMB.vol; if (AMB.audio) AMB.audio.volume = AMB.vol; } })));
});

/* export menu */
const EXP = { fmt: 'png', pages: new Set() };
const FMT = { png: ['PNG', 'Sharp image of each spread. Several spreads download together as one .zip.'], svg: ['SVG', 'Editable vector file; text stays text. Several spreads download as one .zip.'],
  gif: ['GIF', 'Animated: flips through the chosen spreads, and videos on the page play (no sound).'], mp4: ['MP4', 'Video with sound: records each spread while its videos and music play.'] };
$('#exportBtn').onclick = e => { EXP.pages = new Set([cur]); openPop(e.currentTarget, buildExport); };
function buildExport(p) {
  p.innerHTML = '';
  const note = mk('p', { class: 'hint' }, FMT[EXP.fmt][1]);
  const seg = mk('div', { class: 'seg wide' }, Object.keys(FMT).map(k => mk('button', { class: EXP.fmt === k ? 'on' : '', onclick: () => { EXP.fmt = k; buildExport(p); } }, FMT[k][0])));
  const chips = mk('div', { class: 'chips' }, spreads.map((_, i) => mk('button', { class: EXP.pages.has(i) ? 'on' : '', onclick: () => { EXP.pages.has(i) ? EXP.pages.delete(i) : EXP.pages.add(i); buildExport(p); } }, `${i * 2 + 1}–${i * 2 + 2}`)));
  const quick = mk('div', { class: 'quick' }, mk('button', { class: 'linkbtn', onclick: () => { EXP.pages = new Set(spreads.map((_, i) => i)); buildExport(p); } }, 'All pages'),
    mk('button', { class: 'linkbtn', onclick: () => { EXP.pages = new Set([cur]); buildExport(p); } }, 'Only open pages'));
  const n = EXP.pages.size;
  p.append(mk('h4', {}, 'Format'), seg, note, mk('h4', {}, 'Pages'), chips, quick,
    mk('button', { class: 'primary full', disabled: n ? null : '', html: ic('download') + (n ? `Download ${n} spread${n > 1 ? 's' : ''} as ${FMT[EXP.fmt][0]}` : 'Pick at least one spread'), onclick: () => n && runExport(EXP.fmt, EXP.pages) }));
}

/* page turning — the outgoing page is cloned onto a 3D leaf that swings over the spine; driven by JS so it can follow a drag */
let flipping = false;
function flipSound() {
  try {
    actx = actx || new AudioContext(); const d = .42, n = actx.sampleRate * d | 0, buf = actx.createBuffer(1, n, actx.sampleRate), ch = buf.getChannelData(0);
    for (let i = 0; i < n; i++) { const t = i / n; ch[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * t) ** 2 * (.5 + .5 * Math.random()); }
    const src = actx.createBufferSource(), f = actx.createBiquadFilter(), g = actx.createGain(); src.buffer = buf;
    f.type = 'bandpass'; f.Q.value = .7; f.frequency.setValueAtTime(700, actx.currentTime); f.frequency.exponentialRampToValueAtTime(3400, actx.currentTime + d);
    g.gain.value = .1; src.connect(f).connect(g).connect(actx.destination); src.start();
  } catch {}
}
function face(side, cls) {
  const st = stage.cloneNode(true), src = stage.querySelectorAll('canvas.draw');
  st.removeAttribute('id'); st.className = 'stageclone'; st.querySelectorAll('#overlay,#cursor').forEach(e => e.remove());
  st.querySelectorAll('canvas.draw').forEach((cv, i) => cv.getContext('2d').drawImage(src[i], 0, 0));
  st.style.left = side === 'left' ? '0' : -W / 2 + 'px';
  return mk('div', { class: 'face ' + cls }, $('.paper .page.' + side).cloneNode(true), st, mk('div', { class: 'shade' }));
}
function buildFlip(n, dir) {
  if (typing()) document.activeElement.blur();
  closeFly(); select(null); flipping = true;
  const home = cur, stay = dir > 0 ? 'left' : 'right', turn = dir > 0 ? 'right' : 'left';
  const still = face(stay, 'static ' + stay), front = face(turn, 'front');
  gotoSpread(n);
  const leaf = mk('div', { class: 'leaf ' + (dir > 0 ? 'next' : 'prev') }, front, face(stay, 'back'));
  const wrap = mk('div', { class: 'flipwrap' }, still, mk('div', { class: 'cast ' + turn }), mk('div', { class: 'cast land ' + stay }), leaf);
  book.append(wrap);
  const f = { wrap, leaf, dir, home, p: 0 }; setFlip(f, 0); return f;
}
function setFlip(f, p) {
  f.p = p; const s = f.dir > 0 ? -1 : 1;
  f.leaf.style.transform = `rotateY(${180 * p * s}deg) skewY(${Math.sin(Math.PI * p) * 2.2 * s}deg)`; f.wrap.style.setProperty('--p', p);
}
function settle(f, to, ms) {            // animate the leaf to fully turned (1) or back down (0)
  const from = f.p, t0 = performance.now(); ms = Math.max(160, ms * Math.abs(to - from));
  const step = now => {
    const t = Math.min(1, (now - t0) / ms), e = t < .5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2; setFlip(f, from + (to - from) * e);
    if (t < 1) return requestAnimationFrame(step);
    f.wrap.remove(); flipping = false;
    if (!to) { gotoSpread(f.home); if (f.created) { spreads.pop(); refresh(); } }
  };
  requestAnimationFrame(step);
}
function flipTo(n, dir) {
  if (flipping || n < 0) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { closeFly(); select(null); return gotoSpread(n); }
  flipSound(); settle(buildFlip(n, dir), 1, 1000);
}
function grabPage(e, dir, tap) {           // drag a page edge or corner across the spine to turn it
  if (flipping || e.button || cur + dir < 0) return;
  e.preventDefault(); const p0 = pt(e); let f = null, lastX = p0.x, v = 0;
  track(q => {
    if (!f) {
      if ((p0.x - q.x) * dir < 6) return;
      const created = dir > 0 && cur === spreads.length - 1; if (created) spreads.push(null);
      f = buildFlip(cur + dir, dir); f.created = created; book.classList.add('grabbing');
    }
    v = q.x - lastX; lastX = q.x; setFlip(f, clamp((p0.x - q.x) * dir / (2 * Math.abs(p0.x - W / 2)), 0, 1));
  }, () => {
    book.classList.remove('grabbing');
    if (!f) return tap && (dir > 0 ? nextPage() : flipTo(cur - 1, -1));
    const go = v * dir < -3 ? true : v * dir > 3 ? false : f.p > .5; if (go) flipSound(); settle(f, go ? 1 : 0, 700);
  });
}
const nextPage = () => { if (cur === spreads.length - 1) spreads.push(null); flipTo(cur + 1, 1); };
$('#prevSpread').onclick = () => flipTo(cur - 1, -1); $('#nextSpread').onclick = nextPage;
$('#addSpread').onclick = () => { spreads.splice(cur + 1, 0, null); flipTo(cur + 1, 1); };
for (const [cls, dir] of [['prev', -1], ['next', 1]]) book.append(
  mk('div', { class: 'edge ' + cls, title: 'Drag across to turn the page', onpointerdown: e => grabPage(e, dir, false) }),
  mk('button', { class: 'corner ' + cls, title: dir > 0 ? 'Click or drag to turn the page' : 'Click or drag to turn back', 'aria-label': dir > 0 ? 'Next pages' : 'Previous pages', onpointerdown: e => grabPage(e, dir, true) }));

addEventListener('keydown', e => {
  if (typing()) { if (e.key === 'Escape') document.activeElement.blur(); return; }
  const mod = e.metaKey || e.ctrlKey, l = sel(), k = e.key.toLowerCase();
  if (mod && k === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); }
  else if (mod && k === 'y') { e.preventDefault(); redo(); }
  else if (mod && k === 'd') { e.preventDefault(); duplicate(l); }
  else if ((e.key === 'Delete' || e.key === 'Backspace') && l) { e.preventDefault(); removeLayer(l); }
  else if (e.key === 'Escape') { closeFly(); select(null); }
  else if (e.key === 'PageDown') { e.preventDefault(); nextPage(); }
  else if (e.key === 'PageUp') { e.preventDefault(); flipTo(cur - 1, -1); }
  else if (e.key.startsWith('Arrow') && l && l.type !== 'draw') { e.preventDefault(); const d = e.shiftKey ? 10 : 1; l.x += (k === 'arrowright') * d - (k === 'arrowleft') * d; l.y += (k === 'arrowdown') * d - (k === 'arrowup') * d; render(l); commit(); }
  else if (!mod && !e.altKey) { const t = TOOLS.find(t => t[3] === k); if (t) setTool(t[0]); }
});

function fit() { const m = $('#main').getBoundingClientRect(); book.style.transform = `translateY(-36px) scale(${Math.min((m.width - 56) / 1084, (m.height - 118) / 708, 1.3)})`; }
addEventListener('resize', fit); fit();

/* ───────── starter page ───────── */
const now = new Date();
$('#dWeek').textContent = now.toLocaleDateString('en', { weekday: 'long' });
$('#dDate').textContent = now.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' });

const d0 = add({ type: 'draw', name: 'Drawing 1' }, null, true), dc = d0.el.getContext('2d');
dc.setTransform(SC, 0, 0, SC, 0, 0); dc.globalAlpha = .45; dc.fillStyle = '#ffe14d'; dc.fillRect(64, 132, 250, 24);
dc.globalAlpha = 1; dc.strokeStyle = '#ff7aa2'; dc.lineWidth = 3; dc.lineCap = 'round'; dc.beginPath(); dc.moveTo(600, 196);
for (let i = 0; i < 9; i++) dc.quadraticCurveTo(615 + i * 30, i % 2 ? 204 : 186, 630 + i * 30, 196); dc.stroke();
dc.setTransform(1, 0, 0, 1, 0, 0); d0.snap = copyCanvas(d0.el);
const base = { color: '#2b2b33', bold: false, italic: false, underline: false, align: 'left' };
add({ type: 'text', ...base, text: 'Dear diary,', name: 'Dear diary,', font: 'Caveat', fsize: 52, bold: true, x: 66, y: 104, w: 300 }, null, true);
add({ type: 'text', ...base, text: 'Today I slowed down to hear the flowers bloom and feel the gentle touch of the breeze.', name: 'Today I slowed down…', font: 'Kalam', fsize: 22, color: '#4a5361', x: 66, y: 190, w: 380 }, null, true);
const stk = (cat, i, x, y, size, rot = 0) => { const it = LIB.find(c => c.id === cat)?.items[i]; if (!it) return; const k = size / Math.max(it.w, it.h);
  add({ type: 'image', stk: true, name: it.name, src: it.src, x, y, w: it.w * k, h: it.h * k, rot }, null, true); };
add({ type: 'shape', kind: 'rect', name: 'Sky (photo goes here)', fill: '#bfe0ff', stroke: 'none', sw: 0, x: 150, y: 372, w: 150, h: 122, rot: -4 }, null, true);
add({ type: 'sticker', char: '☁️', name: 'Sticker ☁️', x: 176, y: 380, w: 70, h: 70, rot: -4 }, null, true);
add({ type: 'sticker', char: '🌼', name: 'Sticker 🌼', x: 232, y: 420, w: 60, h: 60, rot: 6 }, null, true);
stk('devices', 1, 120, 340, 280, -4);
stk('seals', 11, 390, 520, 78, 8);
stk('clips', 6, 400, 300, 70, 14);
stk('notes', 7, 580, 150, 300, 3);
add({ type: 'text', ...base, text: 'things that made\nme smile today', name: 'things that made me smile', font: 'Caveat', fsize: 30, bold: true, align: 'center', x: 628, y: 250, w: 200, rot: 3 }, null, true);
stk('notes', 2, 760, 400, 190, -5);
add({ type: 'text', ...base, text: 'call mum ♡\nwater the plants', name: 'call mum', font: 'Kalam', fsize: 19, x: 782, y: 462, w: 150, rot: -5 }, null, true);
stk('pins', 11, 596, 440, 84, -8);
stk('buttons', 13, 700, 520, 56, 0);
stk('buttons', 1, 650, 560, 50, 12);
stk('stationery', 11, 880, 70, 120, 10);
'SMILE'.split('').forEach((ch, i) => stk('alphabet', ch.charCodeAt(0) - 65, 580 + i * 40, 86 + (i % 2 ? 4 : -2), 46, i % 2 ? 5 : -5));
restack();
hist = [snap()]; hi = 0;
setTool('select');
document.fonts.ready.then(updateSel);
})();

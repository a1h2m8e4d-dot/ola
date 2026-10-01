/* =====================================================
   ✏️ EDIT HERE — everything you may want to change
   ===================================================== */
const CONFIG = {
  // Her name / nickname — replaces every {name} below
  name: "علا",

  // Birthday song (put your mp3 at this path)
  audioSrc: "assets/birthday-song.mp3",
  audioMissingNote: "ضيفي ملف الأغنية في assets/birthday-song.mp3 🎵",

  // Shown the moment the gift opens
  openingTitle: "كل سنة وانتي طيبة يا {name} ❤️🎂",

  // Teddy bear
  bearIntro: "كل سنة و انتي طيبة ي نونة 😂❤",

  // ✉️ BIRTHDAY MESSAGE — each item is one paragraph. Add / remove freely.
  message: [
    "يارب السنة الجديدة تكون مليانة فرحة ونجاح وضحكة حلوة زي ضحكتك.",
    "وأتمنى تفضلي دايمًا مبسوطة ومحققة كل اللي نفسك فيه."
  ],

  // Cake scene
  afterWish: "اتمنيتي؟ ✨ يارب تتحقق كلها",

  // 🌙 FINAL SCENE — shown one after another
  finalLines: [
    "Happy Birthday 🎂",
    "يا {name} ❤️",
    "ودي كانت هديتك الصغيرة... 🎁",
    "كل سنة و انتي طيبة ي نونة😉❤️"
  ],

  // Balloon colors (JS-generated balloons)
  balloonColors: ["#ff8fb1", "#ffe27a", "#d9c8ff", "#7fd6c2", "#ffb28a", "#8fd3ff"]
};
/* ===================== end of editable area ===================== */

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const fill = t => t.replaceAll("{name}", CONFIG.name);
const rnd = (a, b) => a + Math.random() * (b - a);

/* Reveal text word-by-word (animating whole words keeps Arabic letters joined) */
function reveal(el, text, step = 150) {
  el.textContent = "";
  const words = fill(text).split(" ");
  words.forEach((w, i) => {
    const s = document.createElement("span");
    s.className = "w";
    s.textContent = w + "\u00A0";
    s.style.transitionDelay = i * step + "ms";
    el.appendChild(s);
  });
  void el.offsetWidth;
  el.querySelectorAll(".w").forEach(s => s.classList.add("in"));
  return sleep(words.length * step + 450);
}

/* Scenes */
function go(id) {
  $$(".scene").forEach(s => s.classList.toggle("on", s.id === id));
}

/* ---------- Audio ---------- */
const audio = new Audio(CONFIG.audioSrc);
audio.loop = true;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("on");
  setTimeout(() => t.classList.remove("on"), 4000);
}
function playSong() {
  // Called from a click, so browsers allow it. Graceful fallback if file is missing.
  audio.play().catch(() => { toast(CONFIG.audioMissingNote); $("#playBtn").textContent = "▶"; });
}
$("#playBtn").onclick = () => {
  if (audio.paused) { playSong(); $("#playBtn").textContent = "⏸"; }
  else { audio.pause(); $("#playBtn").textContent = "▶"; }
};
$("#muteBtn").onclick = () => {
  audio.muted = !audio.muted;
  $("#muteBtn").textContent = audio.muted ? "🔇" : "🔊";
};

/* ---------- Background decor + parallax ---------- */
const bg = $("#bg");
const decor = ["♥", "★", "✦", "♥", "✿", "★"], tints = ["#ff8fb1", "#ffe27a", "#d9c8ff", "#7fd6c2"];
for (let i = 0; i < 22; i++) {
  const e = document.createElement("i");
  e.textContent = decor[i % decor.length];
  e.style.cssText = `left:${rnd(0, 100)}%;top:${rnd(0, 100)}%;font-size:${rnd(14, 34)}px;color:${tints[i % 4]};--t:${rnd(6, 11)}s;--dl:${-rnd(0, 8)}s`;
  bg.appendChild(e);
}
addEventListener("pointermove", e => {
  bg.style.transform = `translate(${(e.clientX / innerWidth - .5) * 18}px,${(e.clientY / innerHeight - .5) * 18}px)`;
});

/* ---------- Confetti (canvas) ---------- */
const cv = $("#confetti"), cx = cv.getContext("2d");
let bits = [], running = false;
function fit() { cv.width = innerWidth; cv.height = innerHeight; }
addEventListener("resize", fit); fit();
function burst(n = 150) {
  for (let i = 0; i < n; i++) {
    const a = rnd(0, Math.PI * 2), v = rnd(5, 15);
    bits.push({ x: innerWidth / 2, y: innerHeight * .42, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 6,
      s: rnd(6, 11), r: rnd(0, 6), vr: rnd(-.3, .3), c: CONFIG.balloonColors[i % 6], life: rnd(110, 190), round: i % 3 === 0 });
  }
  if (!running) { running = true; requestAnimationFrame(tick); }
}
function tick() {
  cx.clearRect(0, 0, cv.width, cv.height);
  bits = bits.filter(b => b.life-- > 0 && b.y < innerHeight + 20);
  for (const b of bits) {
    b.vy += .3; b.vx *= .985; b.x += b.vx; b.y += b.vy; b.r += b.vr;
    cx.save(); cx.translate(b.x, b.y); cx.rotate(b.r); cx.fillStyle = b.c;
    cx.globalAlpha = Math.min(1, b.life / 40);
    if (b.round) { cx.beginPath(); cx.arc(0, 0, b.s / 2, 0, 7); cx.fill(); }
    else cx.fillRect(-b.s / 2, -b.s / 4, b.s, b.s / 2);
    cx.restore();
  }
  if (bits.length) requestAnimationFrame(tick); else running = false;
}

/* ---------- Balloons & sparkles ---------- */
function balloons(n) {
  for (let i = 0; i < n; i++) {
    const b = document.createElement("div");
    b.className = "balloon";
    b.style.cssText = `left:${rnd(2, 92)}%;--c:${CONFIG.balloonColors[i % 6]};--t:${rnd(5, 9)}s;--r:${rnd(-12, 12)}deg;animation-delay:${rnd(0, 1.2)}s`;
    $("#balloons").appendChild(b);
    setTimeout(() => b.remove(), 11000);
  }
}
function sparkle(n = 14) {
  for (let i = 0; i < n; i++) {
    const s = document.createElement("span");
    s.className = "spark";
    s.textContent = i % 3 ? "★" : "♥";
    s.style.cssText = `left:${rnd(4, 94)}%;top:${rnd(6, 90)}%;font-size:${rnd(16, 36)}px;animation-delay:${rnd(0, 1)}s`;
    if (i % 3 === 0) s.style.color = "#ff8fb1";
    $("#sparkles").appendChild(s);
    setTimeout(() => s.remove(), 4000);
  }
}

/* ---------- STORY ---------- */
// 1) Open the gift
$("#open").onclick = async () => {
  const gift = $("#gift");
  $("#open").disabled = true;
  document.body.classList.add("opened");
  playSong();                                   // starts ONLY after this click
  $("#music").classList.add("show");
  gift.classList.add("shake");
  await sleep(750);
  gift.classList.remove("shake");
  gift.classList.add("open");                   // lid flies open
  await sleep(250);
  balloons(14); burst(170); sparkle(16);
  setTimeout(() => burst(90), 700);
  await reveal($("#wish-title"), CONFIG.openingTitle, 220);
  $("#next1").classList.remove("hide");
};

// 2) Bear + message
$("#next1").onclick = async () => {
  go("s-story");
  const box = $("#msg"); box.textContent = "";
  await sleep(700);
  await reveal($("#bear-intro"), CONFIG.bearIntro, 170);
  for (const line of CONFIG.message) {
    const p = document.createElement("p"); box.appendChild(p);
    await reveal(p, line, 110);
  }
  $("#next2").classList.remove("hide");
};

// 3) Cake
$("#next2").onclick = () => go("s-cake");
let blown = false;
async function blow() {
  if (blown) return; blown = true;
  $("#blowBtn").classList.add("hide");
  for (const f of $$(".flame")) { f.classList.add("out"); await sleep(650); }
  $("#dim").classList.add("on");
  await sleep(1300);
  $("#dim").classList.remove("on");
  sparkle(26); burst(220);
  reveal($("#wish-text"), CONFIG.afterWish, 160);
  await sleep(4200);
  finale();
}
$("#blowBtn").onclick = blow;
$("#cake").onclick = blow;

// 4) Final scene
async function finale() {
  go("s-final");
  const sc = $("#s-final");
  for (let i = 0; i < 40; i++) {
    const s = document.createElement("span");
    s.className = "tw"; s.textContent = i % 4 ? "✦" : "★";
    s.style.cssText = `left:${rnd(0, 97)}%;top:${rnd(0, 95)}%;font-size:${rnd(8, 20)}px;--t:${rnd(2, 5)}s;--dl:${-rnd(0, 4)}s;opacity:${rnd(.5, 1)}`;
    sc.prepend(s);
  }
  balloons(8);
  await sleep(900);
  const ids = ["#f1", "#f2", "#f3", "#f4"];
  for (let i = 0; i < ids.length; i++) {
    const el = $(ids[i]); el.classList.add("show");
    if (i === 0) burst(120);
    await reveal(el, CONFIG.finalLines[i], 170);
    await sleep(500);
  }
  sparkle(20);
}

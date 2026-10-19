const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const fine = matchMedia('(hover:hover)').matches;
requestAnimationFrame(() => document.body.classList.add('ready'));

// ---------- Nav, menu e progresso ----------
const nav = $('#nav'), burger = $('#burger'), links = $('#nav-links'), prog = $('#progress');
const closeMenu = () => { links.classList.remove('open'); burger.setAttribute('aria-expanded', false); document.body.classList.remove('menu-open'); };
burger.addEventListener('click', () => {
  const open = links.classList.toggle('open');
  burger.setAttribute('aria-expanded', open);
  burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  document.body.classList.toggle('menu-open', open);
});
addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
addEventListener('resize', () => { if (innerWidth > 680) closeMenu(); });
$$('a', links).forEach(a => a.addEventListener('click', closeMenu));

const rail = $('#rail-fill'), steps = $('#steps');
function onScroll() {
  const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
  nav.classList.toggle('scrolled', y > 30);
  prog.style.transform = `scaleX(${h ? y / h : 0})`;
  const sr = steps.getBoundingClientRect();
  rail.style.height = (Math.min(1, Math.max(0, (innerHeight * .6 - sr.top) / sr.height)) * 100) + '%';
}
addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ---------- Reveal + contadores ----------
function runCounters(list) {
  list.forEach(el => {
    if (el.dataset.done) return; el.dataset.done = 1;
    const end = +el.dataset.count, t0 = performance.now();
    const tick = t => { const k = Math.min(1, (t - t0) / 1600); el.textContent = Math.round(end * (1 - Math.pow(1 - k, 4))); if (k < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  });
}
setTimeout(() => runCounters($$('.sub-hero [data-count]')), 600);
const io = new IntersectionObserver(entries => entries.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add('in'); io.unobserve(e.target);
}), { threshold: .12 });
$$('.reveal').forEach((el, i) => { el.style.transitionDelay = (i % 3) * 90 + 'ms'; io.observe(el); });

// ---------- Cursor, spotlight e magnético ----------
const cur = $('#cursor'), curLabel = $('#cursor-label');
if (fine) {
  let x = 0, y = 0, cx = 0, cy = 0;
  addEventListener('mousemove', e => { x = e.clientX; y = e.clientY; cur.classList.add('on'); });
  (function loop() { cx += (x - cx) * .2; cy += (y - cy) * .2; cur.style.transform = `translate(${cx}px,${cy}px)`; requestAnimationFrame(loop); })();
  $$('a,button,summary,video').forEach(el => {
    el.addEventListener('mouseenter', () => cur.classList.add('hover'));
    el.addEventListener('mouseleave', () => cur.classList.remove('hover'));
  });
  $$('.magnetic').forEach(b => {
    b.addEventListener('mousemove', e => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .25}px,${(e.clientY - r.top - r.height / 2) * .35}px)`; });
    b.addEventListener('mouseleave', () => { b.style.transform = ''; });
  });
}
const hero = $('.sub-hero'), spot = $('#spot');
hero.addEventListener('mousemove', e => { const r = hero.getBoundingClientRect(); spot.style.transform = `translate(${e.clientX - r.left}px,${e.clientY - r.top}px) translate(-50%,-50%)`; });
$$('.spotlight').forEach(c => c.addEventListener('mousemove', e => {
  const r = c.getBoundingClientRect();
  c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px');
}));

// ---------- Filtro dos erros ----------
const chips = $$('.chipbtn'), errs = $$('.err');
chips.forEach(ch => ch.addEventListener('click', () => {
  chips.forEach(c => c.classList.toggle('on', c === ch));
  errs.forEach(card => {
    const show = ch.dataset.f === 'all' || card.dataset.cat === ch.dataset.f;
    card.classList.toggle('hide', !show);
    if (show) card.classList.add('in');
  });
}));

// ---------- Vídeos dos bastidores: sincronização e pausa de música ----------
const vids = $$('.vframe video');
vids.forEach(v => {
  v.addEventListener('play', () => {
    // Pausa os outros vídeos
    vids.forEach(other => {
      if (other !== v && !other.paused) other.pause();
    });
    // Pausa a música de fundo para ouvir o vídeo com nitidez
    if (typeof audio !== 'undefined' && !audio.paused) {
      audio.pause();
      setUI(false);
    }
  });
});

// ---------- Música: continua de onde ficou na página anterior ----------
const mBtn = $('#music-btn'), mLabel = $('#music-label');
const audio = new Audio('musica.mp3');
audio.loop = true; audio.volume = .35; audio.preload = 'metadata';
const saved = JSON.parse(sessionStorage.getItem('ovk-music') || '{}');
let wantPlay = saved.on !== false, started = false;
function setUI(on) {
  mBtn.classList.toggle('on', on);
  mBtn.setAttribute('aria-pressed', on);
  mBtn.setAttribute('aria-label', on ? 'Desligar música de fundo' : 'Ligar música de fundo');
  mLabel.textContent = on ? 'A tocar' : 'Ligar som';
}
function play() {
  if (!started) { audio.currentTime = saved.t || 0; started = true; }
  audio.play().then(() => setUI(true)).catch(() => setUI(false));
}
audio.addEventListener('loadedmetadata', () => { mBtn.hidden = false; setUI(false); if (saved.on) play(); });
audio.addEventListener('error', () => { mBtn.hidden = true; });
mBtn.addEventListener('click', e => { e.stopPropagation(); wantPlay = !mBtn.classList.contains('on'); if (wantPlay) play(); else { audio.pause(); setUI(false); } });
const first = e => {
  if (e.target.closest && e.target.closest('#music-btn')) return;
  if (mBtn.hidden) return;
  ['pointerdown', 'keydown', 'touchend'].forEach(t => removeEventListener(t, first));
  if (wantPlay && !started && saved.on) play();
};
['pointerdown', 'keydown', 'touchend'].forEach(t => addEventListener(t, first));
addEventListener('pagehide', () => sessionStorage.setItem('ovk-music', JSON.stringify({ on: mBtn.classList.contains('on'), t: audio.currentTime })));

$('#year').textContent = new Date().getFullYear();

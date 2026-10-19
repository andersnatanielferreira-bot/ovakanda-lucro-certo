// Defina aqui o contacto real da empresa para receber os pedidos.
const CONTACT_WHATSAPP = "244946415906"; // ex.: "244923000000" (indicativo + número, sem + nem espaços)
const CONTACT_EMAIL = "";    // ex.: "geral@lucrocerto.ao"

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const fmt = n => 'Kz ' + Math.round(n).toLocaleString('pt-PT').replace(/\u00a0/g, '.');
const fine = matchMedia('(hover:hover)').matches;

// ---------- Loader ----------
document.body.classList.add('loading');
(function loader() {
  const num = $('#loader-num'), bar = $('#loader-bar'), el = $('#loader');
  let p = 0;
  const t = setInterval(() => {
    p = Math.min(100, p + 3 + Math.random() * 7);
    num.textContent = Math.floor(p); bar.style.width = p + '%';
    if (p >= 100) {
      clearInterval(t);
      setTimeout(() => {
        el.classList.add('done');
        document.body.classList.remove('loading');
        document.body.classList.add('ready');
        runCounters($$('.hero [data-count]'));
      }, 250);
    }
  }, 45);
})();

// ---------- Nav + progress ----------
const nav = $('#nav'), burger = $('#burger'), links = $('#nav-links'), prog = $('#progress');
burger.addEventListener('click', () => {
  const open = links.classList.toggle('open');
  burger.setAttribute('aria-expanded', open);
  burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  document.body.classList.toggle('menu-open', open);
});
const closeMenu = () => { links.classList.remove('open'); burger.setAttribute('aria-expanded', false); document.body.classList.remove('menu-open'); };
addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
addEventListener('resize', () => { if (innerWidth > 680) closeMenu(); });
$$('a', links).forEach(a => a.addEventListener('click', closeMenu));

// ---------- Scrub text ----------
const scrub = $('#scrub');
scrub.innerHTML = scrub.textContent.trim().split(/\s+/).map(w => `<span class="w">${w}</span>`).join(' ');
const words = $$('.w', scrub);

const rail = $('#rail-fill'), steps = $('#steps');
function onScroll() {
  const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
  nav.classList.toggle('scrolled', y > 30);
  prog.style.transform = `scaleX(${h ? y / h : 0})`;

  const r = scrub.getBoundingClientRect();
  const pr = Math.min(1, Math.max(0, (innerHeight * .8 - r.top) / (r.height + innerHeight * .25)));
  const upto = Math.floor(pr * words.length * 1.05);
  words.forEach((w, i) => w.classList.toggle('on', i < upto));

  const sr = steps.getBoundingClientRect();
  const sp = Math.min(1, Math.max(0, (innerHeight * .6 - sr.top) / sr.height));
  rail.style.height = (sp * 100) + '%';
}
addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ---------- Reveal + counters ----------
function runCounters(list) {
  list.forEach(el => {
    if (el.dataset.done) return; el.dataset.done = 1;
    const end = +el.dataset.count, dur = 1800, t0 = performance.now();
    const tick = t => {
      const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 4);
      el.textContent = Math.round(end * e).toLocaleString('pt-PT').replace(/\u00a0/g, '.');
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    runCounters($$('[data-count]', e.target));
    io.unobserve(e.target);
  });
}, { threshold: .15 });
$$('.reveal').forEach((el, i) => { el.style.transitionDelay = (i % 4) * 90 + 'ms'; io.observe(el); });

// ---------- Custom cursor ----------
const cur = $('#cursor'), curLabel = $('#cursor-label');
if (fine) {
  let x = 0, y = 0, cx = 0, cy = 0;
  addEventListener('mousemove', e => { x = e.clientX; y = e.clientY; cur.classList.add('on'); });
  (function loop() { cx += (x - cx) * .2; cy += (y - cy) * .2; cur.style.transform = `translate(${cx}px,${cy}px)`; requestAnimationFrame(loop); })();
  $$('a,button,summary,input,select,textarea').forEach(el => {
    el.addEventListener('mouseenter', () => {
      const l = el.dataset.cursor;
      if (l) { curLabel.textContent = l; cur.classList.add('big'); } else cur.classList.add('hover');
    });
    el.addEventListener('mouseleave', () => cur.classList.remove('big', 'hover'));
  });
}

// ---------- Hero spotlight + tilt ----------
const hero = $('#inicio'), spot = $('#spot'), dash = $('#dash');
hero.addEventListener('mousemove', e => {
  const r = hero.getBoundingClientRect();
  spot.style.transform = `translate(${e.clientX - r.left}px,${e.clientY - r.top}px) translate(-50%,-50%)`;
  if (!fine) return;
  const d = $('#tilt-wrap').getBoundingClientRect();
  const nx = (e.clientX - (d.left + d.width / 2)) / innerWidth;
  const ny = (e.clientY - (d.top + d.height / 2)) / innerHeight;
  dash.style.transform = `rotateY(${nx * 18}deg) rotateX(${-ny * 18}deg)`;
});
hero.addEventListener('mouseleave', () => { dash.style.transform = ''; });

// ---------- Card spotlight ----------
$$('.spotlight').forEach(c => c.addEventListener('mousemove', e => {
  const r = c.getBoundingClientRect();
  c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
  c.style.setProperty('--my', (e.clientY - r.top) + 'px');
}));

// ---------- Magnetic buttons ----------
if (fine) $$('.magnetic').forEach(b => {
  b.addEventListener('mousemove', e => {
    const r = b.getBoundingClientRect();
    b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .25}px,${(e.clientY - r.top - r.height / 2) * .35}px)`;
  });
  b.addEventListener('mouseleave', () => { b.style.transform = ''; });
});

// ---------- Simulador ----------
const sFat = $('#s-fat'), sCusto = $('#s-custo');
function sim() {
  const fat = +sFat.value, c = +sCusto.value;
  const lucro = fat * (1 - c / 100), margem = 100 - c;
  [sFat, sCusto].forEach(r => r.style.setProperty('--p', ((r.value - r.min) / (r.max - r.min) * 100) + '%'));
  $('#o-fat').textContent = fmt(fat);
  $('#o-custo').textContent = c + '%';
  $('#o-lucro').textContent = fmt(lucro);
  $('#o-iva').textContent = fmt(fat * .14);
  $('#o-margem').textContent = margem + '%';
  $('#gauge-arc').setAttribute('stroke-dasharray', `${Math.max(0, Math.min(100, margem * 2))} 100`);
  const v = $('#o-verdict'), cta = $('#sim-cta');
  let pkg, txt, bad = false;
  if (margem <= 0) { pkg = 'Gestão Organizada'; txt = 'Atenção: está a trabalhar sem lucro. Precisa de controlar custos e preços já.'; bad = true; }
  else if (margem < 15) { pkg = 'Gestão Organizada'; txt = 'Margem apertada. Recomendamos o pacote Gestão Organizada para saber onde está o dinheiro.'; bad = true; }
  else if (margem < 35) { pkg = 'Fiscal Seguro'; txt = 'Boa base. Com enquadramento fiscal claro protege o que ganha. Sugerimos Fiscal Seguro.'; }
  else { pkg = 'Negócio Vivo'; txt = 'Margem saudável! Com acompanhamento mensal (Negócio Vivo) pode escalar com segurança.'; }
  v.textContent = txt; v.classList.toggle('bad', bad);
  cta.dataset.pkg = pkg;
}
[sFat, sCusto].forEach(r => r.addEventListener('input', sim));
sim();

// ---------- Pacotes → formulário ----------
$$('[data-pkg]').forEach(b => b.addEventListener('click', () => { $('#pacote').value = b.dataset.pkg; }));

// ---------- Contacto ----------
const form = $('#contact-form'), msg = $('#form-msg');
const waBig = $('#wa-big'), waFloat = $('#wa-float');
if (CONTACT_WHATSAPP) {
  const href = `https://wa.me/${CONTACT_WHATSAPP}?text=${encodeURIComponent('Olá! Gostaria de falar com a Ovakanda Lucro Certo.')}`;
  [waBig, waFloat].forEach(a => { a.href = href; a.target = '_blank'; a.rel = 'noopener'; });
}
form.addEventListener('submit', e => {
  e.preventDefault();
  const nome = form.nome.value.trim();
  if (!nome) { msg.style.color = '#e08a6b'; msg.textContent = 'Por favor, indique o seu nome.'; return; }
  const texto = `Olá, sou ${nome}. Pacote de interesse: ${form.pacote.value}. Telefone: ${form.telefone.value || '-'}. ${form.mensagem.value}`;
  msg.style.color = 'var(--dourado)';
  if (CONTACT_WHATSAPP) {
    window.open(`https://wa.me/${CONTACT_WHATSAPP}?text=${encodeURIComponent(texto)}`, '_blank');
    msg.textContent = 'A abrir o WhatsApp para enviar o seu pedido…';
  } else if (CONTACT_EMAIL) {
    location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Pedido - Ovakanda Lucro Certo')}&body=${encodeURIComponent(texto)}`;
    msg.textContent = 'A abrir o seu email para enviar o pedido…';
  } else {
    msg.textContent = 'Obrigado, ' + nome + '! Pedido registado. Entraremos em contacto em breve.';
  }
  form.reset();
});

// ---------- Música de fundo (ficheiro local: musica.mp3) ----------
const MUSIC_START = 0;   // segundos onde a música começa (use 0 se cortou o ficheiro)
const MUSIC_VOLUME = 0.35;
const mBtn = $('#music-btn'), mLabel = $('#music-label');
const audio = new Audio('musica.mp3');
audio.loop = true; audio.volume = MUSIC_VOLUME; audio.preload = 'metadata';
let wantPlay = true, started = false;
function setMusicUI(on) {
  mBtn.classList.toggle('on', on);
  mBtn.setAttribute('aria-pressed', on);
  mBtn.setAttribute('aria-label', on ? 'Desligar música de fundo' : 'Ligar música de fundo');
  mLabel.textContent = on ? 'A tocar' : 'Ligar som';
}
audio.addEventListener('loadedmetadata', () => {
  if (MUSIC_START >= audio.duration) MUSIC_START_USED = 0;
  mBtn.hidden = false; setMusicUI(false);
});
audio.addEventListener('error', () => { mBtn.hidden = true; });
let MUSIC_START_USED = MUSIC_START;
// Ao chegar ao fim, volta ao ponto inicial em vez de ao zero
audio.addEventListener('ended', () => { audio.currentTime = MUSIC_START_USED; audio.play(); });
function playMusic() {
  if (!started) { audio.currentTime = MUSIC_START_USED; started = true; }
  audio.play().then(() => setMusicUI(true)).catch(() => setMusicUI(false));
}
function pauseMusic() { audio.pause(); setMusicUI(false); }
mBtn.addEventListener('click', e => { e.stopPropagation(); wantPlay = !mBtn.classList.contains('on'); wantPlay ? playMusic() : pauseMusic(); });
// Os browsers só permitem áudio após uma interação: arranca no primeiro toque/clique.
const firstGesture = e => {
  if (e.target.closest && e.target.closest('#music-btn')) return;
  if (mBtn.hidden) return;
  ['pointerdown', 'keydown', 'touchend'].forEach(t => removeEventListener(t, firstGesture));
  if (wantPlay && !started) playMusic();
};
['pointerdown', 'keydown', 'touchend'].forEach(t => addEventListener(t, firstGesture));
addEventListener('pagehide', () => sessionStorage.setItem('ovk-music', JSON.stringify({ on: mBtn.classList.contains('on'), t: audio.currentTime })));

// ---------- Vídeos dos bastidores: sincronização e pausa de música ----------
const vids = $$('.vframe video');
vids.forEach(v => {
  v.addEventListener('play', () => {
    vids.forEach(other => { if (other !== v && !other.paused) other.pause(); });
    if (typeof audio !== 'undefined' && !audio.paused) {
      audio.pause();
      setMusicUI(false);
    }
  });
});

$('#year').textContent = new Date().getFullYear();

/* Sodiqjon Maxamadjanov — portfolio behaviour. Plain JS, no dependencies. */
(() => {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const root = document.documentElement;
  const I = window.I18N, PR = window.PROJECTS, QALAM = window.QALAM;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const EMAIL = 'panda281106@gmail.com';

  let lang = I[root.lang] ? root.lang : 'en';
  const t = (k) => (I[lang] && I[lang][k] !== undefined ? I[lang][k] : I.en[k] !== undefined ? I.en[k] : k);

  /* ------------------------------------------------------------------ toast */
  let toastTimer;
  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
  }

  /* ------------------------------------------------------------------ view-transition helper */
  function transition(update, cls) {
    if (!document.startViewTransition || reduce) { update(); return Promise.resolve(); }
    if (cls) root.classList.add(cls);
    const vt = document.startViewTransition(update);
    vt.finished.finally(() => cls && root.classList.remove(cls));
    return vt.ready ? vt.ready.catch(() => {}) : Promise.resolve();
  }

  /* ------------------------------------------------------------------ i18n */
  function applyI18n() {
    root.lang = lang;
    document.title = t('meta.title');
    const md = $('meta[name="description"]'); if (md) md.content = t('meta.desc');
    $$('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
    $$('[data-i18n-html]').forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
    $$('[data-i18n-ph]').forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
    $$('[data-i18n-aria]').forEach((el) => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
    $$('.lang-seg [data-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    renderWork();
    if ($('#projDlg').open && openKey) fillDialog(openKey);
    $$('[data-count-projects]').forEach((el) => { el.textContent = PR.length + 1; });
  }
  function setLang(l) {
    if (!I[l] || l === lang) return;
    lang = l;
    try { localStorage.setItem('lang', l); } catch (e) {}
    transition(applyI18n, 'vt-fade');
  }

  /* ------------------------------------------------------------------ theme */
  function toggleTheme(e) {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    const set = () => { root.dataset.theme = next; };
    try { localStorage.setItem('theme', next); } catch (err) {}
    if (!document.startViewTransition || reduce) return set();
    const r0 = (e.currentTarget || e.target).getBoundingClientRect();
    const x = r0.left + r0.width / 2, y = r0.top + r0.height / 2;
    const rad = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const vt = document.startViewTransition(set);
    vt.ready.then(() => {
      root.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${rad}px at ${x}px ${y}px)`] },
        { duration: 650, easing: 'cubic-bezier(.2,.8,.2,1)', pseudoElement: '::view-transition-new(root)' });
    }).catch(() => {});
  }

  /* ------------------------------------------------------------------ marquee */
  (function marquee() {
    const items = ['Flutter', 'Dart', 'Kotlin', 'Jetpack Compose', 'Android', 'REST API', 'WebSocket', 'SQLite', 'Hive', 'Firebase FCM', 'Python', 'Java', 'C++', 'Google Play'];
    const html = items.map((s) => `<span>${s}</span>`).join('');
    $('#marquee').innerHTML = html + html;
  })();

  /* ------------------------------------------------------------------ work grid */
  function mediaHTML(p) {
    const m = p.media;
    if (m.kind === 'fan') return `<div class="fan ${m.imgs.length === 2 ? 'two' : ''}">${m.imgs.map((n) => `<img src="assets/projects/${n}.webp" alt="" loading="lazy" decoding="async">`).join('')}</div>`;
    if (m.kind === 'single') return `<div class="single"><img src="assets/projects/${m.imgs[0]}.webp" alt="" loading="lazy" decoding="async"></div>`;
    return `<div class="vid"><img src="${p.poster}" alt="" loading="lazy" decoding="async"></div><span class="play"><i class="fa-solid fa-play"></i></span>`;
  }
  function renderWork() {
    const g = $('#workGrid');
    g.innerHTML = PR.map((p, i) => `
      <div class="wcard reveal" role="button" tabindex="0" style="--hue:${p.hue};--d:${(i % 3) * 0.08}s" data-open="${p.key}" aria-label="${t('work.view')}: ${t('p.' + p.key + '.t')}">
        <span class="warrow"><i class="fa-solid fa-arrow-up-right-from-square"></i></span>
        <div class="media">${mediaHTML(p)}</div>
        <div class="wmeta">
          <span class="wnum">${p.num} / ${String(PR.length).padStart(2, '0')}</span>
          <h3>${t('p.' + p.key + '.t')}</h3>
          <p>${t('p.' + p.key + '.s')}</p>
          <ul class="tags">${p.tags.map((x) => `<li>${x}</li>`).join('')}</ul>
        </div>
      </div>`).join('');
    $$('.reveal', g).forEach(observeReveal);
  }

  /* ------------------------------------------------------------------ project dialog */
  const dlg = $('#projDlg');
  let openKey = null;
  function fillDialog(key) {
    const p = key === 'qalam' ? QALAM : PR.find((x) => x.key === key);
    if (!p) return;
    const gal = $('#pdGallery');
    dlg.style.setProperty('--hue', p.hue || '#0a84ff');
    if (p.video) gal.innerHTML = `<video src="${p.video}" poster="${p.poster}" controls playsinline loop preload="metadata"></video>`;
    else gal.innerHTML = p.shots.map((s) => `<img src="assets/${key === 'qalam' ? 'qalam' : 'projects'}/${s}.webp" alt="" decoding="async">`).join('');
    $('#pdNum').textContent = key === 'qalam' ? 'Google Play' : `${p.num} / ${String(PR.length).padStart(2, '0')}`;
    $('#pdTitle').textContent = t(`p.${key}.t`);
    $('#pdTags').innerHTML = (p.tags || p.techs.slice(0, 3)).map((x) => `<li>${x}</li>`).join('');
    $('#pdDesc').textContent = t(`p.${key}.d`);
    $('#pdFeat').innerHTML = t(`p.${key}.f`).map((f) => `<li>${f}</li>`).join('');
    $('#pdStack').innerHTML = p.techs.map((x) => `<li>${x}</li>`).join('');
    const note = $('#pdNote');
    if (p.note) { note.hidden = false; note.textContent = t(`p.${key}.n`); } else { note.hidden = true; }
    const act = $('#pdActions');
    act.innerHTML = '';
    if (p.play) act.innerHTML = `<a class="btn btn-primary" href="${window.PLAY_URL}" target="_blank" rel="noopener"><i class="fa-brands fa-google-play"></i>${t('qalam.play')}</a>`;
    if (p.github) act.innerHTML += `<a class="btn btn-ghost" href="${p.github}" target="_blank" rel="noopener"><i class="fa-brands fa-github"></i>${t('work.gh')}</a>`;
  }
  function openProject(key) {
    openKey = key;
    fillDialog(key);
    dlg.showModal();
    root.classList.add('lock');
    $('#pdGallery').scrollLeft = 0;
  }
  dlg.addEventListener('close', () => { openKey = null; root.classList.remove('lock'); const v = $('video', dlg); if (v) v.pause(); });
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });

  const certDlg = $('#certDlg');
  certDlg.addEventListener('close', () => root.classList.remove('lock'));
  certDlg.addEventListener('click', (e) => { if (e.target === certDlg || e.target.id === 'certImg') certDlg.close(); });

  $$('[data-close]').forEach((b) => b.addEventListener('click', () => b.closest('dialog').close()));
  document.addEventListener('click', (e) => {
    const o = e.target.closest('[data-open]');
    if (o) { e.preventDefault(); openProject(o.dataset.open); return; }
    const c = e.target.closest('[data-cert]');
    if (c) {
      const n = c.dataset.cert;
      $('#certImg').src = `assets/certs/${n}.webp`;
      $('#certImg').alt = c.querySelector('b').textContent;
      certDlg.showModal(); root.classList.add('lock');
    }
  });
  document.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('.wcard')) { e.preventDefault(); openProject(e.target.dataset.open); }
  });

  /* ------------------------------------------------------------------ reveal + counters */
  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); revealIO.unobserve(en.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  function observeReveal(el) { revealIO.observe(el); }
  $$('.reveal').forEach(observeReveal);
  // staggered delays inside grids
  [['.bento', 70], ['.svc-grid', 60], ['.certs', 90], ['.hero-copy', 85]].forEach(([sel, step]) => {
    $$(`${sel} > .reveal`).forEach((el, i) => el.style.setProperty('--d', `${(sel === '.hero-copy' ? 0.45 : 0) + (i % (sel === '.svc-grid' ? 4 : 12)) * step / 1000}s`));
  });
  $('.portrait').style.setProperty('--d', '.35s');

  function countUp(el) {
    const target = el.hasAttribute('data-count-projects') ? PR.length + 1 : +el.dataset.count;
    if (reduce || !target) { el.textContent = target; return; }
    const t0 = performance.now(), dur = 1400;
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * e);
      if (p < 1) requestAnimationFrame(tick);
    };
    el.textContent = '0';
    requestAnimationFrame(tick);
  }
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { countUp(en.target); countIO.unobserve(en.target); } });
  }, { threshold: 0.6 });
  $$('[data-count], [data-count-projects]').forEach((el) => countIO.observe(el));

  /* ------------------------------------------------------------------ scroll: progress + spy */
  const bar = $('.progress i');
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const h = root.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${h > 0 ? Math.min(1, scrollY / h) : 0})`;
      ticking = false;
    });
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      $$('.links a').forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  ['about', 'qalam', 'work', 'journey', 'services', 'contact'].forEach((id) => { const s = document.getElementById(id); if (s) spy.observe(s); });

  /* ------------------------------------------------------------------ nav: menu, language, theme */
  const menuBtn = $('#menuBtn'), sheet = $('#sheet');
  function closeMenu() { sheet.hidden = true; menuBtn.setAttribute('aria-expanded', 'false'); }
  menuBtn.addEventListener('click', () => {
    const open = sheet.hidden;
    sheet.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
  });
  sheet.addEventListener('click', (e) => { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
  document.addEventListener('click', (e) => { if (!sheet.hidden && !e.target.closest('.nav-wrap')) closeMenu(); });
  $('#themeBtn').addEventListener('click', toggleTheme);
  $$('.lang-seg [data-lang]').forEach((b) => b.addEventListener('click', () => setLang(b.dataset.lang)));

  /* ------------------------------------------------------------------ pointer effects (mouse only) */
  if (fine && !reduce) {
    document.addEventListener('pointermove', (e) => {
      const s = e.target.closest && e.target.closest('.spot');
      if (s) { const r = s.getBoundingClientRect(); s.style.setProperty('--mx', `${e.clientX - r.left}px`); s.style.setProperty('--my', `${e.clientY - r.top}px`); }
    }, { passive: true });

    $$('.magnet').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px, ${(e.clientY - r.top - r.height / 2) * 0.28}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });

    const tilt = $('.tilt'), frame = $('.portrait-frame');
    if (tilt) {
      tilt.addEventListener('pointermove', (e) => {
        const r = tilt.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        frame.style.setProperty('--ry', `${px * 9}deg`); frame.style.setProperty('--rx', `${-py * 9}deg`);
      });
      tilt.addEventListener('pointerleave', () => { frame.style.setProperty('--ry', '0deg'); frame.style.setProperty('--rx', '0deg'); });
    }
  }

  /* ------------------------------------------------------------------ Qalam style demo */
  const demo = $('#demo'), seg = $('#styleSeg');
  const styles = ['glass', 'clay', 'neu', 'skeu'];
  let userPicked = false, auto;
  function setStyle(s) {
    demo.className = `demo s-${s}`;
    $$('button', seg).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.style === s)));
  }
  seg.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-style]');
    if (!b) return;
    userPicked = true; clearInterval(auto); setStyle(b.dataset.style);
  });
  new IntersectionObserver((en) => {
    if (reduce || userPicked) return;
    clearInterval(auto);
    if (en[0].isIntersecting) {
      auto = setInterval(() => {
        const cur = styles.indexOf(demo.className.replace('demo s-', ''));
        setStyle(styles[(cur + 1) % styles.length]);
      }, 3200);
    }
  }, { threshold: 0.4 }).observe(demo);

  /* ------------------------------------------------------------------ contact */
  $('#copyMail').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(EMAIL); }
    catch (e) { const ta = document.createElement('textarea'); ta.value = EMAIL; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (x) {} ta.remove(); }
    toast(t('contact.copied'));
  });
  $('#form').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target, v = (n) => f.elements[n].value.trim();
    if (!v('name') || !v('email') || !v('subject') || !v('message')) { toast(t('form.fill')); return; }
    const body = `${v('message')}\n\n— ${v('name')} (${v('email')})`;
    toast(t('form.open'));
    location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(v('subject'))}&body=${encodeURIComponent(body)}`;
  });

  /* ------------------------------------------------------------------ boot */
  applyI18n();
})();

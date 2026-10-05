/**
 * Tawan Tapianthong - portfolio UI.
 * Theme, navigation, scroll reveals, 3D tilt cards, the skill globe, the projects
 * (featured cards, project grid, filter, dialog), the AI colorizer lab and the contact form.
 * The WebGL hero scene lives in scene.js.
 */
(function () {
  'use strict';

  const root = document.documentElement;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const pad = (n) => String(n).padStart(2, '0');
  const esc = (s) =>
    String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initNav();
    initMobileMenu();
    initProjects();
    initReveals();
    initHero();
    initSpotlight();
    $$('[data-tilt]').forEach((el) => attachTilt(el, 7));
    initSkillGlobe();
    initColorizer();
    initContactForm();
    initCopy();
    const year = $('[data-year]');
    if (year) year.textContent = new Date().getFullYear();
  });

  /* ------------------------------------------------------------------
   * Theme
   * ---------------------------------------------------------------- */
  function initTheme() {
    const btn = $('#theme-toggle');
    const meta = $('meta[name="theme-color"]');
    const apply = (theme, persist) => {
      root.setAttribute('data-theme', theme);
      if (meta) meta.setAttribute('content', theme === 'dark' ? '#0a0a0a' : '#ebebeb');
      if (btn) {
        btn.setAttribute('aria-pressed', String(theme === 'dark'));
        btn.setAttribute('aria-label', theme === 'dark' ? 'เปลี่ยนเป็นโหมดสว่าง' : 'เปลี่ยนเป็นโหมดมืด');
      }
      if (persist) {
        try {
          localStorage.setItem('zp-theme', theme);
        } catch (e) {
          /* storage unavailable: theme still applies for this visit */
        }
      }
      document.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
    };
    apply(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light', false);
    btn?.addEventListener('click', () => apply(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark', true));
  }

  /* ------------------------------------------------------------------
   * Navigation: frosted bar on scroll, progress hairline, scroll spy
   * ---------------------------------------------------------------- */
  function initNav() {
    const nav = $('[data-nav]');
    if (!nav) return;
    const bar = $('.nav__progress', nav);
    let ticking = false;
    const update = () => {
      ticking = false;
      const y = window.scrollY;
      nav.classList.toggle('is-scrolled', y > 24);
      const max = document.documentElement.scrollHeight - innerHeight;
      bar?.style.setProperty('--progress', max > 0 ? (y / max).toFixed(4) : '0');
    };
    addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(update);
        }
      },
      { passive: true }
    );
    update();

    const links = $$('.nav__links a');
    const byId = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((a) => a.removeAttribute('aria-current'));
          byId.get(entry.target.id)?.setAttribute('aria-current', 'true');
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    $$('main section[id]').forEach((s) => spy.observe(s));
  }

  function initMobileMenu() {
    const nav = $('[data-nav]');
    const menu = $('#mobile-menu');
    const btn = $('.nav__burger');
    if (!nav || !menu || !btn) return;

    const setOpen = (open) => {
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'ปิดเมนู' : 'เปิดเมนู');
      nav.classList.toggle('is-open', open);
      root.style.overflow = open ? 'hidden' : '';
      if (open) {
        menu.hidden = false;
        requestAnimationFrame(() => menu.classList.add('is-open'));
      } else {
        menu.classList.remove('is-open');
        setTimeout(() => {
          if (!menu.classList.contains('is-open')) menu.hidden = true;
        }, 700);
      }
    };

    btn.addEventListener('click', () => setOpen(btn.getAttribute('aria-expanded') !== 'true'));
    menu.addEventListener('click', (e) => {
      if (e.target.closest('a')) setOpen(false);
    });
    addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        btn.focus();
      }
    });
    matchMedia('(min-width: 1021px)').addEventListener('change', (e) => {
      if (e.matches) setOpen(false);
    });
  }

  /* ------------------------------------------------------------------
   * Scroll reveals (siblings stagger in)
   * ---------------------------------------------------------------- */
  let revealObserver;
  function initReveals() {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      $$('[data-reveal]').forEach((el) => el.classList.add('is-in'));
      return;
    }
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          revealObserver.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );
    observeReveals(document);
    // Printing never scrolls elements into view, so show everything first.
    addEventListener('beforeprint', () => $$('[data-reveal]').forEach((el) => el.classList.add('is-in')));
  }

  function observeReveals(scope) {
    const els = $$('[data-reveal]:not(.is-in)', scope);
    els.forEach((el) => {
      const siblings = Array.from(el.parentElement?.children || []).filter((c) => c.hasAttribute('data-reveal'));
      const i = Math.min(siblings.indexOf(el), 6);
      if (i > 0 && !el.style.getPropertyValue('--d')) el.style.setProperty('--d', `${i * 0.07}s`);
      if (revealObserver) revealObserver.observe(el);
      else el.classList.add('is-in');
    });
  }

  /* ------------------------------------------------------------------
   * Hero: masked headline, one-off scramble
   * ---------------------------------------------------------------- */
  function initHero() {
    const hero = $('.hero');
    if (!hero) return;
    const title = $('.hero__title', hero);
    title?.setAttribute('aria-label', 'Tawan Tapianthong');
    $$('[data-line]', hero).forEach((line, i) => line.style.setProperty('--d', `${0.1 + i * 0.12}s`));

    const start = () => {
      hero.classList.add('is-ready');
      $$('[data-reveal]', hero).forEach((el) => el.classList.add('is-in'));
      if (!reduceMotion) {
        const scrambleEl = $('[data-scramble]', hero);
        if (scrambleEl) setTimeout(() => scramble(scrambleEl, scrambleEl.textContent, 1100), 700);
      }
    };
    const fontsReady = document.fonts?.ready ?? Promise.resolve();
    Promise.race([fontsReady, new Promise((r) => setTimeout(r, 900))]).then(() => requestAnimationFrame(start));
  }

  function scramble(el, text, duration) {
    const chars = '!<>-_\\/[]{}=+*^?#';
    const frames = Math.round((duration / 1000) * 60);
    const queue = Array.from(text, (to) => {
      const startAt = Math.floor(Math.random() * frames * 0.4);
      return { to, startAt, endAt: startAt + Math.floor(Math.random() * frames * 0.6) + 6, ch: '' };
    });
    let frame = 0;
    const tick = () => {
      let out = '';
      let done = 0;
      for (const q of queue) {
        if (frame >= q.endAt) {
          done++;
          out += esc(q.to);
        } else if (frame >= q.startAt) {
          if (!q.ch || Math.random() < 0.3) q.ch = chars[Math.floor(Math.random() * chars.length)];
          out += `<span class="dud">${esc(q.ch)}</span>`;
        } else {
          out += esc(q.to);
        }
      }
      el.innerHTML = out;
      frame++;
      if (done < queue.length) requestAnimationFrame(tick);
      else el.textContent = text;
    };
    tick();
  }

  /* ------------------------------------------------------------------
   * Pointer effects: spotlight panels + 3D tilt
   * ---------------------------------------------------------------- */
  function initSpotlight() {
    if (!finePointer) return;
    document.addEventListener(
      'pointermove',
      (e) => {
        const el = e.target.closest?.('.spotlight');
        if (!el) return;
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${e.clientX - r.left}px`);
        el.style.setProperty('--my', `${e.clientY - r.top}px`);
      },
      { passive: true }
    );
  }

  function attachTilt(el, max = 8) {
    if (!finePointer || reduceMotion) return;
    let raf = 0;
    el.addEventListener('pointerenter', () => el.classList.add('is-tilting'));
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty('--ry', `${((px - 0.5) * max * 2).toFixed(2)}deg`);
        el.style.setProperty('--rx', `${((0.5 - py) * max * 1.5).toFixed(2)}deg`);
        el.style.setProperty('--gx', `${(px * 100).toFixed(1)}%`);
        el.style.setProperty('--gy', `${(py * 100).toFixed(1)}%`);
      });
    });
    el.addEventListener('pointerleave', () => {
      cancelAnimationFrame(raf);
      el.classList.remove('is-tilting');
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--ry', '0deg');
    });
  }

  /* ------------------------------------------------------------------
   * Skill globe: the skill chips arranged on a rotating 3D sphere
   * ---------------------------------------------------------------- */
  function initSkillGlobe() {
    const host = $('[data-skill-sphere]');
    if (!host) return;
    const globe = host.parentElement;
    const chips = $$('.skill-chip');
    const golden = Math.PI * (3 - Math.sqrt(5));
    const n = chips.length;
    const items = chips.map((chip, i) => {
      const el = document.createElement('span');
      el.className = 'orb-item';
      el.innerHTML = chip.innerHTML;
      host.appendChild(el);
      const y = 1 - (i / (n - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const phi = i * golden;
      return { el, x: Math.cos(phi) * r, y, z: Math.sin(phi) * r };
    });

    let rotX = -0.25;
    let rotY = 0;
    let velX = 0;
    let velY = reduceMotion ? 0 : 0.0035;
    const autoVel = velY;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let visible = false;
    let raf = 0;

    const render = () => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      const R = Math.min(w, h) * 0.37;
      const cy = Math.cos(rotY);
      const sy = Math.sin(rotY);
      const cx = Math.cos(rotX);
      const sx = Math.sin(rotX);
      for (const it of items) {
        const x1 = it.x * cy + it.z * sy;
        const z1 = -it.x * sy + it.z * cy;
        const y2 = it.y * cx - z1 * sx;
        const z2 = it.y * sx + z1 * cx;
        const depth = (z2 + 1) / 2;
        const scale = 0.6 + depth * 0.45;
        it.el.style.transform = `translate(-50%, -50%) translate3d(${(x1 * R).toFixed(1)}px, ${(y2 * R).toFixed(1)}px, 0) scale(${scale.toFixed(3)})`;
        it.el.style.opacity = (0.2 + depth * 0.8).toFixed(3);
        it.el.style.zIndex = String(Math.round(depth * 100));
        it.el.style.filter = depth < 0.35 ? 'blur(1px)' : '';
      }
    };

    const loop = () => {
      raf = 0;
      if (!dragging) {
        velY += (autoVel - velY) * 0.02;
        velX *= 0.95;
      }
      rotY += velY;
      rotX = Math.max(-1.1, Math.min(1.1, rotX + velX));
      render();
      if (visible && !reduceMotion) raf = requestAnimationFrame(loop);
    };

    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(loop);
    }).observe(globe);

    globe.addEventListener('pointerdown', (e) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      globe.setPointerCapture(e.pointerId);
    });
    globe.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      velY = (e.clientX - lastX) * 0.005;
      velX = (e.clientY - lastY) * -0.004;
      lastX = e.clientX;
      lastY = e.clientY;
      if (reduceMotion) {
        rotY += velY;
        rotX = Math.max(-1.1, Math.min(1.1, rotX + velX));
        render();
      }
    });
    const end = () => {
      dragging = false;
    };
    globe.addEventListener('pointerup', end);
    globe.addEventListener('pointercancel', end);
    addEventListener('resize', render);
    render();
  }

  /* ------------------------------------------------------------------
   * Projects: featured cards, one grid of uniform cards, filter, dialog
   * ---------------------------------------------------------------- */
  const checkList = (items) =>
    (items || []).map((f) => `<li><i class="fa-solid fa-check" aria-hidden="true"></i>${esc(f)}</li>`).join('');
  const badgeList = (items) => (items || []).map((b) => `<span class="award">${esc(b)}</span>`).join('');

  /* ------------------------------------------------------------------
   * Zeptek 3D visuals: the scene bundle (vendor/zeptek-scenes.js, built from
   * the Zeptek site) loads once the projects come near the viewport.
   * ---------------------------------------------------------------- */
  // A still frame of each scene (img/zeptek/3d-<visual>.jpg): shown while the scene loads,
  // and instead of the live scene on phones.
  const visualStill = (p) => `img/zeptek/3d-${p.visual}.jpg`;
  const visualPlaceholder = (p) =>
    `<img src="${esc(visualStill(p))}" alt="" loading="lazy" decoding="async" /><span class="visual__loading mono">กำลังโหลด 3D</span>`;
  const phone = matchMedia('(max-width: 680px)');

  function mountVisuals() {
    const els = $$('[data-visual]');
    if (!els.length) return;
    const live = new Map(); // element -> unmount()
    let scenes = null;
    let started = false;
    const load = () => scenes || (scenes = import('./vendor/zeptek-scenes.js'));
    // Phones keep a still image in the compact project rows; computers get the live scene.
    const wantsStill = (el) => phone.matches && !!el.closest('.card');
    els.forEach((el) => (el.dataset.placeholder = el.innerHTML));

    const sync = () => {
      els.forEach((el) => {
        const still = wantsStill(el);
        el.classList.toggle('is-still', still);
        if (still) {
          el.dataset.openProject = el.closest('[data-project]').dataset.project;
          if (live.has(el)) {
            live.get(el)();
            live.delete(el);
            el.innerHTML = el.dataset.placeholder;
          }
          return;
        }
        delete el.dataset.openProject;
        if (!started || live.has(el)) return;
        load()
          .then((m) => {
            if (!live.has(el) && !wantsStill(el)) live.set(el, m.mount(el, el.dataset.visual));
          })
          .catch(() => el.classList.add('is-failed'));
      });
    };

    // The scene bundle loads once the projects come near the viewport.
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        started = true;
        sync();
      },
      { rootMargin: '100% 0px' }
    );
    els.forEach((el) => io.observe(el));
    phone.addEventListener('change', sync);
    sync();
  }

  function initProjects() {
    const projects = window.PORTFOLIO_PROJECTS || [];
    const cats = window.PORTFOLIO_CATEGORIES || [];
    const featuredEl = $('#project-featured');
    const grid = $('#project-grid');
    const bar = $('#projects-filter');
    if (!grid || !projects.length) return;

    const catLabel = Object.fromEntries(cats.map((c) => [c.id, c.label]));
    const mainCat = (p) => catLabel[(p.cats || [])[0]] || '';
    const featured = projects.filter((p) => p.featured);

    /* ---- Featured: three equal cards ---- */
    if (featuredEl) {
      featuredEl.innerHTML = featured
        .map(
          (p) => `
          <article class="feature" data-reveal>
            ${
              p.visual
                ? `<div class="feature__media feature__media--3d" data-visual="${esc(p.visual)}">${visualPlaceholder(p)}</div>`
                : `<button type="button" class="feature__media" data-open-project="${esc(p.id)}"${p.youtube ? ' data-open-play="true"' : ''}
                    aria-label="${p.youtube ? 'เล่นวิดีโอ' : 'ดูรายละเอียด'} ${esc(p.title)}">
                    <img src="${esc(p.cover)}" alt="" loading="lazy" decoding="async" />
                    ${p.youtube ? '<span class="feature__play" aria-hidden="true"><i class="fa-solid fa-play"></i></span>' : ''}
                  </button>`
            }
            <div class="feature__body">
              <p class="mono feature__org"><span class="dot dot--cyan"></span>${esc(mainCat(p))}</p>
              <h3 class="feature__title">${esc(p.title)}</h3>
              <p class="feature__kicker">${esc(p.kicker)}</p>
              <p class="feature__summary">${esc(p.summary)}</p>
              <div class="awards">${badgeList(p.badges)}</div>
              <div class="feature__actions">
                <button type="button" class="btn btn--ink btn--sm" data-open-project="${esc(p.id)}">ดูรายละเอียด <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></button>
                ${p.youtube ? `<button type="button" class="btn btn--ghost btn--sm" data-open-project="${esc(p.id)}" data-open-play="true"><i class="fa-solid fa-play" aria-hidden="true"></i> วิดีโอ</button>` : ''}
              </div>
            </div>
          </article>`
        )
        .join('');
      $$('.feature', featuredEl).forEach((el) => {
        if (!$('[data-visual]', el)) attachTilt(el, 3);
      });
    }

    /* ---- Uniform cards ---- */
    const card = (p) => {
      const chips = `
        ${p.badges?.length ? `<span class="card__award">${esc(p.badges[0])}</span>` : ''}
        ${!p.visual && (p.youtube || p.clip) ? '<span class="card__play" aria-hidden="true"><i class="fa-solid fa-play"></i></span>' : ''}`;
      // A live 3D visual needs its own pointer input, so only the text part opens the dialog.
      const media = p.visual
        ? `<div class="card__media card__media--3d" data-visual="${esc(p.visual)}">${visualPlaceholder(p)}</div>${chips}`
        : `<button type="button" class="card__media" data-open-project="${esc(p.id)}" tabindex="-1" aria-hidden="true">
             <img src="${esc(p.cover)}" alt="" loading="lazy" decoding="async" />${chips}
           </button>`;
      return `
      <article class="card${p.visual ? ' card--3d' : ''}" data-project="${esc(p.id)}" data-cats="${esc((p.cats || []).join(','))}"${p.featured ? ' data-featured' : ''} data-reveal>
        ${media}
        <button type="button" class="card__open" data-open-project="${esc(p.id)}" aria-haspopup="dialog">
          <span class="card__body">
            <span class="mono card__cat">${esc(mainCat(p))}</span>
            <span class="card__title">${esc(p.title)}</span>
            <span class="card__kicker">${esc(p.kicker)}</span>
          </span>
          <span class="card__foot">
            <span class="mono">ดูรายละเอียด</span>
            <span class="card__arrow" aria-hidden="true"><i class="fa-solid fa-arrow-right"></i></span>
          </span>
        </button>
        ${p.visual ? '' : '<span class="tilt__glare" aria-hidden="true"></span>'}
      </article>`;
    };

    grid.innerHTML = projects.map(card).join('');
    const cards = $$('.card', grid);
    cards.filter((el) => !el.classList.contains('card--3d')).forEach((el) => attachTilt(el, 4));
    mountVisuals();

    const total = $('[data-grid-count]');
    let current = 'all';
    const apply = (value, animate) => {
      const v = cats.some((c) => c.id === value) ? value : 'all';
      current = v;
      $$('.filter__btn', bar || document).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === v)));
      let shown = 0;
      cards.forEach((el) => {
        // "All" leaves the featured projects to the cards above; a category shows every match.
        const show = v === 'all' ? !el.hasAttribute('data-featured') : el.dataset.cats.split(',').includes(v);
        el.hidden = !show;
        if (!show) return;
        shown++;
        if (animate && !reduceMotion) {
          el.classList.remove('is-in');
          el.style.setProperty('--d', `${Math.min(shown, 8) * 0.03}s`);
          requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('is-in')));
        }
      });
      const all = shown;
      if (total) total.textContent = v === 'all' ? `อีก ${all} โปรเจกต์` : `${catLabel[v]} · ${all} โปรเจกต์`;
    };

    if (bar) {
      bar.innerHTML = cats
        .map((c) => {
          const n = c.id === 'all' ? projects.length : projects.filter((p) => (p.cats || []).includes(c.id)).length;
          if (!n) return '';
          return `<button type="button" class="filter__btn" data-filter="${esc(c.id)}" aria-pressed="false">${esc(c.label)}<span class="filter__count">${pad(n)}</span></button>`;
        })
        .join('');
      bar.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-filter]');
        if (btn) apply(btn.dataset.filter, true);
      });
    }
    const m = location.hash.match(/cat=([a-z]+)/i);
    apply(m ? m[1].toLowerCase() : 'all', false);

    /* ---- Dialog wiring ---- */
    const dialog = initProjectDialog(projects, () => {
      const shown = cards.filter((el) => !el.hidden).map((el) => el.dataset.project);
      const lead = current === 'all' ? featured.map((p) => p.id) : [];
      return [...lead, ...shown];
    });
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-open-project]');
      if (trigger) dialog.open(trigger.dataset.openProject, trigger, { play: trigger.dataset.openPlay === 'true' });
    });

    const fromHash = () => {
      const hash = location.hash.match(/project=([a-z0-9-]+)/i);
      if (hash && projects.some((p) => p.id === hash[1])) dialog.open(hash[1]);
    };
    addEventListener('hashchange', fromHash);
    fromHash();
  }

  function initProjectDialog(projects, getOrder) {
    const dlg = $('#project-dialog');
    const media = $('#sheet-media');
    const el = {
      kicker: $('#sheet-kicker'),
      title: $('#sheet-title'),
      badges: $('#sheet-badges'),
      summary: $('#sheet-summary'),
      body: $('#sheet-body'),
      features: $('#sheet-features'),
      steps: $('#sheet-steps'),
      stepsLabel: $('#sheet-steps-label'),
      links: $('#sheet-links'),
      count: $('#sheet-count'),
    };
    let current = null;
    let slides = [];
    let slide = 0;
    let returnFocus = null;

    const order = () => {
      const list = getOrder ? getOrder() : [];
      return list.length ? list : projects.map((p) => p.id);
    };

    const renderSlide = () => {
      const viewer = $('.viewer', media);
      if (!viewer) return;
      $$('video', viewer).forEach((v) => v.pause());
      const s = slides[slide];
      let node;
      if (s.type === 'youtube' && s.play) {
        node = document.createElement('iframe');
        node.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(s.id)}?autoplay=1&rel=0&playsinline=1`;
        node.title = `${el.title.textContent} - วิดีโอ`;
        node.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
        node.allowFullscreen = true;
        node.loading = 'lazy';
      } else if (s.type === 'youtube') {
        // Poster first: the YouTube player only loads when asked for.
        node = document.createElement('button');
        node.type = 'button';
        node.className = 'viewer__poster';
        node.dataset.playYoutube = '';
        node.setAttribute('aria-label', 'เล่นวิดีโอ');
        node.innerHTML = `<img src="${esc(s.poster)}" alt="" /><span class="poster__play" aria-hidden="true"><i class="fa-solid fa-play"></i></span>`;
      } else if (s.type === 'video') {
        node = document.createElement('video');
        node.controls = true;
        node.playsInline = true;
        node.autoplay = true;
        node.preload = 'metadata';
        node.poster = s.poster || '';
        node.src = s.src;
      } else {
        node = document.createElement('img');
        node.src = s.src;
        node.alt = `${el.title.textContent} - ภาพที่ ${slide + 1}`;
        node.decoding = 'async';
      }
      viewer.replaceChildren(node);
      if (slides.length > 1) {
        viewer.insertAdjacentHTML(
          'beforeend',
          `<span class="viewer__count mono">${pad(slide + 1)} / ${pad(slides.length)}</span>
           <span class="viewer__nav">
             <button type="button" class="icon-btn icon-btn--light" data-slide="-1" aria-label="ภาพก่อนหน้า"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i></button>
             <button type="button" class="icon-btn icon-btn--light" data-slide="1" aria-label="ภาพถัดไป"><i class="fa-solid fa-arrow-right" aria-hidden="true"></i></button>
           </span>`
        );
      }
      $$('.thumb', media).forEach((t, i) => t.setAttribute('aria-current', String(i === slide)));
      $$('.thumb', media)[slide]?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    };

    const goSlide = (i) => {
      slides.forEach((s) => (s.play = false));
      slide = (i + slides.length) % slides.length;
      renderSlide();
    };

    const fill = (p, opts = {}) => {
      const list = order();
      const i = list.indexOf(p.id);
      el.kicker.textContent = p.kicker || '';
      el.title.textContent = p.title;
      el.badges.innerHTML = badgeList(p.badges);
      el.badges.hidden = !p.badges?.length;
      el.summary.textContent = p.summary || '';
      el.body.innerHTML = p.body || '';
      el.features.innerHTML = checkList(p.features);
      if (el.steps) {
        el.steps.innerHTML = (p.steps || [])
          .map(([t, b], k) => `<li><span class="mono">${pad(k + 1)} · ${esc(t)}</span><p>${esc(b)}</p></li>`)
          .join('');
        el.steps.hidden = el.stepsLabel.hidden = !p.steps?.length;
      }
      const links = [...(p.links || [])];
      el.links.innerHTML = links
        .map((l) => {
          const internal = l.href.startsWith('#');
          return `<a class="btn ${internal ? 'btn--ink' : 'btn--ghost'} btn--sm" href="${esc(l.href)}"${internal ? ' data-sheet-close' : ' target="_blank" rel="noopener noreferrer"'}>${esc(l.label)} <i class="fa-solid ${internal ? 'fa-arrow-right' : 'fa-arrow-up-right-from-square'}" aria-hidden="true"></i></a>`;
        })
        .join('');
      el.count.textContent = i >= 0 ? `${pad(i + 1)} / ${pad(list.length)}` : '';

      slides = [];
      if (p.youtube) slides.push({ type: 'youtube', id: p.youtube.id, poster: p.youtube.poster || p.cover });
      if (p.clip) slides.push({ type: 'video', src: p.clip, poster: p.cover });
      const gallery = p.gallery && p.gallery.length ? p.gallery : [p.cover];
      gallery.forEach((src) => {
        if (!slides.some((s) => s.poster === src && s.type === 'youtube')) slides.push({ type: 'image', src });
      });
      slide = 0;
      if (opts.play && slides[0] && slides[0].type === 'youtube') slides[0].play = true;

      media.innerHTML =
        '<div class="viewer"></div>' +
        (slides.length > 1
          ? `<div class="thumbs" aria-label="เลือกภาพ">${slides
              .map((s, k) => {
                const thumb = s.type === 'image' ? s.src : s.poster;
                const play = s.type === 'image' ? '' : '<span class="thumb__play"><i class="fa-solid fa-play" aria-hidden="true"></i></span>';
                return `<button type="button" class="thumb" data-thumb="${k}" aria-label="ภาพที่ ${k + 1}"><img src="${esc(thumb)}" alt="" loading="lazy" />${play}</button>`;
              })
              .join('')}</div>`
          : '');
      renderSlide();
      $('.sheet__info', dlg).scrollTop = 0;
      $('.sheet__inner', dlg).scrollTop = 0;
    };

    const open = (id, trigger, opts) => {
      const p = projects.find((x) => x.id === id);
      if (!p || !dlg) return;
      current = p;
      fill(p, opts);
      if (!dlg.open) {
        returnFocus = trigger || document.activeElement;
        dlg.showModal();
        root.style.overflow = 'hidden';
      }
      history.replaceState(null, '', `#project=${p.id}`);
    };

    const close = () => {
      if (dlg.open) dlg.close();
    };

    const step = (dir) => {
      const list = order();
      const cur = list.indexOf(current?.id);
      open(list[(cur + dir + list.length) % list.length]);
    };

    dlg.addEventListener('close', () => {
      $$('video', media).forEach((v) => v.pause());
      media.innerHTML = '';
      root.style.overflow = '';
      if (/project=/.test(location.hash)) history.replaceState(null, '', location.pathname + location.search);
      if (returnFocus && document.contains(returnFocus)) returnFocus.focus({ preventScroll: true });
    });
    dlg.addEventListener('click', (e) => {
      if (e.target === dlg) return close();
      if (e.target.closest('[data-sheet-close]')) return close();
      if (e.target.closest('[data-play-youtube]')) {
        slides[slide].play = true;
        renderSlide();
        return;
      }
      const s = e.target.closest('[data-slide]');
      if (s) goSlide(slide + Number(s.dataset.slide));
      const t = e.target.closest('[data-thumb]');
      if (t) goSlide(Number(t.dataset.thumb));
      if (e.target.closest('[data-sheet-prev]')) step(-1);
      if (e.target.closest('[data-sheet-next]')) step(1);
    });
    dlg.addEventListener('keydown', (e) => {
      if (e.target.matches('video, input, textarea, iframe')) return;
      if (e.key === 'ArrowRight' && slides.length > 1) goSlide(slide + 1);
      if (e.key === 'ArrowLeft' && slides.length > 1) goSlide(slide - 1);
    });

    return { open, close };
  }

  /* ------------------------------------------------------------------
   * AI Lab: colorizer with before/after comparison
   * ---------------------------------------------------------------- */
  function initColorizer() {
    const API_BASE = 'https://tawannn-ai-color.hf.space';
    const MAX_UPLOAD_PX = 2048;

    const drop = $('#color-dropzone');
    const fileInput = $('#color-file');
    const pickBtn = $('#pick-file');
    const runBtn = $('#run-colorize');
    const clearBtn = $('#clear-colorize');
    const dlBtn = $('#download-colorize');
    const inputImg = $('#color-input-preview');
    const beforeImg = $('#color-before');
    const outputImg = $('#color-output-preview');
    const compare = $('#color-compare');
    const range = $('#compare-range');
    const statusEl = $('#color-status');
    const stateEl = $('[data-lab-state]');
    if (!drop || !fileInput || !runBtn || !inputImg || !outputImg || !compare) return;

    let currentFile = null;
    let outputUrl = null;

    const setState = (label, mode = '') => {
      if (!stateEl) return;
      stateEl.classList.remove('is-busy', 'is-error');
      if (mode) stateEl.classList.add(mode);
      stateEl.lastChild.textContent = label;
    };
    const setStatus = (msg, isError = false) => {
      statusEl.textContent = msg || '';
      statusEl.classList.toggle('is-error', isError);
    };
    const updateButtons = () => {
      runBtn.disabled = !currentFile;
      clearBtn.disabled = !currentFile && !outputImg.getAttribute('src');
    };

    const fileToDataURL = (file) =>
      new Promise((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = () => resolve(fr.result);
        fr.onerror = reject;
        fr.readAsDataURL(file);
      });

    // Downscale large photos on the client so uploads stay fast.
    async function downscale(file) {
      const img = new Image();
      img.src = await fileToDataURL(file);
      await img.decode();
      const long = Math.max(img.naturalWidth, img.naturalHeight);
      if (long <= MAX_UPLOAD_PX) return file;
      const k = MAX_UPLOAD_PX / long;
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.naturalWidth * k);
      canvas.height = Math.round(img.naturalHeight * k);
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const type = file.type && file.type.startsWith('image/') ? file.type : 'image/png';
      const blob = await new Promise((res) => canvas.toBlob(res, type, 0.92));
      return new File([blob], file.name.replace(/\.\w+$/, '') + '_scaled.' + (type.split('/')[1] || 'png'), { type });
    }

    const resetResult = () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      outputUrl = null;
      outputImg.removeAttribute('src');
      beforeImg.removeAttribute('src');
      compare.classList.remove('has-result');
      range.disabled = true;
      dlBtn.hidden = true;
      dlBtn.removeAttribute('href');
    };

    const pick = async (file) => {
      if (!file) return;
      if (!file.type || !file.type.startsWith('image/')) {
        setStatus('ไฟล์ไม่รองรับ กรุณาเลือกภาพ .jpg .png .webp', true);
        setState('Error', 'is-error');
        return;
      }
      currentFile = file;
      resetResult();
      inputImg.src = await fileToDataURL(file);
      drop.classList.add('has-image');
      setStatus('พร้อมลงสี กดปุ่ม "ลงสี" ได้เลย');
      setState('Ready');
      updateButtons();
    };

    const run = async () => {
      if (!currentFile) return;
      runBtn.disabled = true;
      runBtn.classList.add('is-loading');
      setState('Processing', 'is-busy');
      setStatus('กำลังลงสีภาพ อาจใช้เวลาสักครู่ถ้าเซิร์ฟเวอร์เพิ่งตื่น');
      try {
        const send = await downscale(currentFile);
        const form = new FormData();
        form.append('file', send, send.name);
        const res = await fetch(`${API_BASE}/api/colorize`, { method: 'POST', body: form });
        if (!res.ok) throw new Error(`ลงสีไม่สำเร็จ (HTTP ${res.status})`);
        const blob = await res.blob();
        if (outputUrl) URL.revokeObjectURL(outputUrl);
        outputUrl = URL.createObjectURL(blob);
        beforeImg.src = inputImg.src;
        outputImg.src = outputUrl;
        compare.classList.add('has-result');
        range.disabled = false;
        range.value = 50;
        compare.style.setProperty('--pos', '50%');
        dlBtn.href = outputUrl;
        dlBtn.hidden = false;
        setStatus('เสร็จแล้ว ลากแถบบนภาพผลลัพธ์เพื่อเทียบก่อนและหลัง');
        setState('Done');
      } catch (err) {
        setStatus(err && err.message ? err.message : String(err), true);
        setState('Error', 'is-error');
      } finally {
        runBtn.classList.remove('is-loading');
        updateButtons();
      }
    };

    const clear = () => {
      resetResult();
      currentFile = null;
      fileInput.value = '';
      inputImg.removeAttribute('src');
      drop.classList.remove('has-image');
      setStatus('ล้างแล้ว เลือกรูปหรือลากมาวางได้เลย');
      setState('Ready');
      updateButtons();
      drop.focus();
    };

    pickBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => pick(e.target.files && e.target.files[0]));
    drop.addEventListener('click', () => fileInput.click());
    drop.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        fileInput.click();
      }
    });
    ['dragenter', 'dragover'].forEach((t) =>
      drop.addEventListener(t, (e) => {
        e.preventDefault();
        drop.classList.add('is-dragover');
      })
    );
    ['dragleave', 'drop'].forEach((t) =>
      drop.addEventListener(t, (e) => {
        e.preventDefault();
        drop.classList.remove('is-dragover');
      })
    );
    drop.addEventListener('drop', (e) => pick(e.dataTransfer && e.dataTransfer.files[0]));
    range.addEventListener('input', () => compare.style.setProperty('--pos', `${range.value}%`));
    runBtn.addEventListener('click', run);
    clearBtn.addEventListener('click', clear);

    setStatus('พร้อมใช้งาน เลือกรูปหรือลากมาวาง');
    updateButtons();
  }

  /* ------------------------------------------------------------------
   * Contact form (Formspree)
   * ---------------------------------------------------------------- */
  function initContactForm() {
    const form = $('form.console');
    if (!form) return;
    const btn = $('button[type="submit"]', form);
    const status = $('.form-status', form);
    const fields = {
      name: $('[name="name"]', form),
      email: $('[name="email"]', form),
      message: $('[name="message"]', form),
    };
    const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    const setStatus = (text, ok) => {
      status.textContent = text;
      status.classList.toggle('ok', !!ok);
      status.classList.toggle('err', !ok && !!text);
    };

    Object.values(fields).forEach((f) =>
      f.addEventListener('input', () => {
        f.classList.remove('is-invalid');
        f.removeAttribute('aria-invalid');
      })
    );

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      setStatus('');
      const invalid = [];
      if (!fields.name.value.trim()) invalid.push(fields.name);
      if (!isEmail(fields.email.value.trim())) invalid.push(fields.email);
      if (!fields.message.value.trim()) invalid.push(fields.message);
      invalid.forEach((f) => {
        f.classList.add('is-invalid');
        f.setAttribute('aria-invalid', 'true');
      });
      if (invalid.length) {
        setStatus('กรุณากรอกข้อมูลให้ครบ และตรวจอีเมลอีกครั้ง');
        invalid[0].focus();
        return;
      }

      btn.classList.add('is-loading');
      btn.disabled = true;
      try {
        const res = await fetch(form.action, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: new FormData(form),
        });
        if (res.ok) {
          form.reset();
          setStatus('ส่งข้อความเรียบร้อย ขอบคุณครับ', true);
        } else {
          const data = await res.json().catch(() => ({}));
          setStatus(data?.errors?.[0]?.message || 'ส่งไม่สำเร็จ โปรดลองใหม่อีกครั้ง');
        }
      } catch (err) {
        setStatus('เครือข่ายขัดข้อง ตรวจการเชื่อมต่อแล้วลองใหม่');
      } finally {
        btn.classList.remove('is-loading');
        btn.disabled = false;
      }
    });
  }

  /* ------------------------------------------------------------------
   * Copy to clipboard + toast
   * ---------------------------------------------------------------- */
  function initCopy() {
    const toast = $('#toast');
    let timer = 0;
    const show = (msg) => {
      if (!toast) return;
      toast.textContent = msg;
      toast.classList.add('is-shown');
      clearTimeout(timer);
      timer = setTimeout(() => toast.classList.remove('is-shown'), 1800);
    };
    document.addEventListener('click', async (e) => {
      const btn = e.target.closest('[data-copy], [data-copy-text]');
      if (!btn) return;
      const text = btn.dataset.copyText || $(btn.dataset.copy)?.textContent.replace(/\s+/g, ' ').trim();
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        show('คัดลอกแล้ว');
      } catch (err) {
        show('คัดลอกไม่สำเร็จ');
      }
    });
  }
})();

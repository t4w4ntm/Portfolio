// ================= THEME =================
(function initTheme() {
  const root = document.documentElement;
  const toggleBtn = document.getElementById('theme-toggle');

  // อ่านธีมที่เคยเลือกไว้ หรือ fallback ตาม OS
  const saved = localStorage.getItem('theme');
  const osPrefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  const initialTheme = saved || (osPrefersLight ? 'light' : 'dark');

  setTheme(initialTheme);
  updateToggleA11y(initialTheme);

  toggleBtn?.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theme', next);
    updateToggleA11y(next);
    reloadParticles?.();
  });

  function setTheme(theme) { root.setAttribute('data-theme', theme); }
  function updateToggleA11y(theme) {
    if (!toggleBtn) return;
    toggleBtn.setAttribute('aria-pressed', String(theme === 'light'));
    toggleBtn.title = theme === 'light' ? 'สลับเป็น Dark' : 'สลับเป็น Light';
  }
})();

// ================= tsParticles (responsive + theme-aware) =================
let particlesLoaded = false;

function loadParticles() {
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const theme = document.documentElement.getAttribute('data-theme') || 'dark';
  const particleCount = prefersReducedMotion ? 0 : (isMobile ? 45 : 120);

  if (particleCount <= 0) {
    // ปิดเอฟเฟกต์ทั้งหมดถ้าผู้ใช้ลด Motion
    (tsParticles.dom() || []).forEach(i => i.destroy());
    particlesLoaded = false;
    return;
  }

  // อ่านสีพื้นหลังจาก CSS variables ให้ตรงธีม
  const bg = getComputedStyle(document.documentElement)
    .getPropertyValue('--background-color').trim() || (theme === 'light' ? '#f7f9fc' : '#000010');

  // ====== CONFIG A: DARK (จุด/ดวงดาว) ======
  const starfieldOptions = {
    background: { color: { value: bg } },
    fpsLimit: 60,
    particles: {
      number: { value: particleCount, density: { enable: true, area: 900 } },
      color: { value: '#ffffff' },
      shape: { type: 'circle' },
      opacity: { value: 0.45, random: true },
      size: { value: { min: 1, max: 2.5 } },
      move: {
        enable: true,
        speed: isMobile ? 0.7 : 1,
        direction: 'none',
        straight: false,
        outModes: { default: 'out' }
      }
    },
    interactivity: {
      events: {
        onHover: { enable: !prefersReducedMotion, mode: 'repulse' },
        onClick: { enable: !prefersReducedMotion, mode: 'push' },
        resize: true
      },
      modes: { repulse: { distance: 100, duration: 0.35 }, push: { quantity: 4 } }
    },
    detectRetina: true
  };

  // ====== CONFIG B: LIGHT (PIXEL RAIN) ======
  const pixelRainOptions = {
    background: { color: { value: bg } },
    fpsLimit: 60,
    particles: {
      number: { value: particleCount, density: { enable: true, area: 900 } },
      // โทนฟ้า/เทา ให้ดูละมุนบนพื้นสว่าง
      color: { value: ['#0a84ff', '#4fc3ff', '#8fd3ff', '#b6c2d0'] },
      shape: { type: 'square' },
      opacity: {
        value: { min: 0.35, max: 0.35 }
      },
      size: {
        // ขนาดพิกเซล 2–6px แล้วแต่เครื่อง/จอ
        value: { min: isMobile ? 4 : 4, max: isMobile ? 4 : 6 }
      },
      move: {
        enable: true,
        speed: 1,         // ความเร็วคงที่
        random: false,    // ปิดการสุ่มความเร็ว
        direction: "bottom", // ให้ตกลงด้านล่างเหมือนฝน
        straight: true,   // ให้เคลื่อนที่เป็นเส้นตรง
        out_mode: "out",
        bounce: false
      }
      ,
      // ปิด links/ชนกัน เพื่อให้ลื่นสุดๆ
      links: { enable: false },
      collisions: { enable: false }
    },
    interactivity: {
      events: {
        // light theme ไม่ต้อง repulse ให้ฝนตกอย่างเดียว
        onHover: { enable: false },
        onClick: { enable: false },
        resize: true
      }
    },
    detectRetina: true
  };

  const options = theme === 'light' ? pixelRainOptions : starfieldOptions;

  // เคลียร์อันเก่าแล้วโหลดใหม่
  (tsParticles.dom() || []).forEach(instance => instance.destroy());
  tsParticles.load('tsparticles', options).then(() => { particlesLoaded = true; });
}

function reloadParticles() {
  (tsParticles.dom() || []).forEach(instance => instance.destroy());
  particlesLoaded = false;
  loadParticles();
}

window.addEventListener('load', loadParticles);

// เรียกใช้เมื่อ DOM พร้อม
document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const prefersLight = window.matchMedia?.('(prefers-color-scheme: light)').matches;
  const saved = localStorage.getItem('theme') || (prefersLight ? 'light' : 'dark');
  applyTheme(saved);
  updateThemedIcons();      // อัปเดตรูปตามธีมตอนโหลด

  // ปุ่มสลับธีม (ถ้ามี)
  const toggle = document.getElementById('theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const next = body.classList.contains('light-theme') ? 'dark' : 'light';
      applyTheme(next);
      updateThemedIcons();  // อัปเดตรูปหลังสลับ
    });
  }

  // กันกระพริบ: preload ทั้งสองไฟล์
  ['img/Canva_White.png', 'img/Canva_Black.png'].forEach(src => {
    const i = new Image(); i.src = src;
  });
});

// ใส่/เอา class ตามธีม + เก็บค่า
function applyTheme(theme) {
  document.body.classList.toggle('light-theme', theme === 'light');
  localStorage.setItem('theme', theme);
}

// เปลี่ยน src ให้ทุก .themed-icon ตามธีมปัจจุบัน
function updateThemedIcons() {
  const isLight = document.body.classList.contains('light-theme');
  document.querySelectorAll('.themed-icon').forEach(img => {
    const target = isLight ? img.dataset.lightSrc : img.dataset.darkSrc;
    if (img.getAttribute('src') !== target) {
      img.setAttribute('src', target);
    }
  });
}

// ================= DOMContentLoaded behaviors =================
document.addEventListener('DOMContentLoaded', () => {
  // --- Mobile nav toggle ---
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
    // close on link click (mobile)
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        if (navLinks.classList.contains('open')) {
          navLinks.classList.remove('open');
          navToggle.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }
  // --- Ripple on buttons inside colorizer controls ---
  const czControls = document.querySelector('.cz-controls');
  if (czControls) {
    czControls.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('pointerdown', (e) => {
        if (btn.disabled) return;
        // สร้าง ripple
        const r = document.createElement('span');
        r.className = 'ripple';
        // ตำแหน่งคลิกสัมพัทธ์ปุ่ม
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        r.style.left = `${x}px`;
        r.style.top = `${y}px`;
        // ลบเมื่อจบแอนิเมชัน
        r.addEventListener('animationend', () => r.remove());
        btn.appendChild(r);
      });
    });
  }

  // --- Modal Logic ---
  const modal = document.getElementById('project-modal');
  const projectCards = document.querySelectorAll('.project-card');
  const closeModalButton = document.querySelector('.close-button');
  const modalTitle = document.getElementById('modal-title');
  const modalDescription = document.getElementById('modal-description');
  const modalImage = document.getElementById('modal-img');
  const experienceItems = document.querySelectorAll('.experience-item');

  // === 3D Tilt on hover for Experience ===
  const enableTilt = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (enableTilt) {
    experienceItems.forEach((item) => {
      const inner = item.querySelector('.experience-card-inner');
      if (!inner) return;

      const maxRotate = 10; // องศาสูงสุดที่จะเอียง

      const onMove = (e) => {
        // ถ้าการ์ดถูกพลิกอยู่ (is-flipped) จะไม่เอียง เพื่อไม่ชนกับเอฟเฟกต์
        if (item.classList.contains('is-flipped')) return;

        const rect = item.getBoundingClientRect();
        const relX = (e.clientX - rect.left) / rect.width;   // 0..1
        const relY = (e.clientY - rect.top) / rect.height;   // 0..1

        const rotY = (relX - 0.5) * (maxRotate * 2); // ซ้าย/ขวา
        const rotX = -(relY - 0.5) * (maxRotate * 2); // บน/ล่าง

        inner.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(12px)`;
      };

      const onLeave = () => { inner.style.transform = ''; };

      item.addEventListener('mousemove', onMove);
      item.addEventListener('mouseleave', onLeave);

      item.addEventListener('click', () => { inner.style.transform = ''; });
    });
  }

  experienceItems.forEach(item => {
    if (item.classList.contains('no-flip')) return;
    const toggle = () => item.classList.toggle('is-flipped');
    item.addEventListener('click', toggle);
    item.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
  });

  projectCards.forEach(card => {
    card.addEventListener('click', () => {
      const title = card.getAttribute('data-title');
      const description = card.getAttribute('data-description');
      const imageUrl = card.getAttribute('data-image');
      modalTitle.textContent = title || '';
      modalDescription.innerHTML = description; // ใช้ innerHTML แทน textContent

      modalImage.src = imageUrl || '';
      modalImage.alt = title ? `ภาพโปรเจกต์: ${title}` : 'ภาพโปรเจกต์';
      modal.style.display = 'block';
    });
  });

  const closeModal = () => { modal.style.display = 'none'; };
  if (closeModalButton) closeModalButton.addEventListener('click', closeModal);
  window.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });

  // --- Scroll Animations ---
  const sections = document.querySelectorAll('.content-section');
  const timelineContainer = document.querySelector('.timeline-container');
  const timelineItems = document.querySelectorAll('.experience-item');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.classList.contains('featured-project')) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  sections.forEach(section => sectionObserver.observe(section));

  if (timelineContainer) {
    let lastY = 0;
    const timelineObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const currentY = entry.boundingClientRect.y;
        if (entry.isIntersecting) {
          timelineContainer.classList.add('is-visible');
          timelineItems.forEach((item, index) => { setTimeout(() => item.classList.add('is-visible'), index * 200); });
        } else {
          if (currentY > lastY) {
            timelineContainer.classList.remove('is-visible');
            timelineItems.forEach(item => item.classList.remove('is-visible'));
          }
        }
        lastY = currentY;
      });
    }, { threshold: 0.2 });
    timelineObserver.observe(timelineContainer);
  }

  // Featured project reveal
  const observerOptions = { root: null, rootMargin: '0px', threshold: 0.1 };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
  }, observerOptions);
  document.querySelectorAll('.featured-project').forEach(el => observer.observe(el));
});

// --- Thesis Project Slideshow ---
const slideshow = document.querySelector('.thesis-image-slideshow');
if (slideshow) {
  const wrapper = slideshow.querySelector('.slides-wrapper');
  const slides = slideshow.querySelectorAll('.slide');
  const prevButton = slideshow.querySelector('.prev-slide');
  const nextButton = slideshow.querySelector('.next-slide');
  const dotsContainer = slideshow.querySelector('.slide-dots');

  let currentIndex = 0;
  const totalSlides = slides.length;

  for (let i = 0; i < totalSlides; i++) {
    const dot = document.createElement('span');
    dot.classList.add('dot');
    dot.addEventListener('click', () => { goToSlide(i); });
    dotsContainer.appendChild(dot);
  }
  const dots = dotsContainer.querySelectorAll('.dot');

  function goToSlide(index) {
    if (index >= totalSlides) index = 0;
    else if (index < 0) index = totalSlides - 1;
    wrapper.style.transform = `translateX(-${index * 100}%)`;
    currentIndex = index;
    updateDots();
  }
  function updateDots() {
    dots.forEach((dot, idx) => dot.classList.toggle('active', idx === currentIndex));
  }
  nextButton.addEventListener('click', () => goToSlide(currentIndex + 1));
  prevButton.addEventListener('click', () => goToSlide(currentIndex - 1));
  if (totalSlides > 0) goToSlide(0);
}

// ====== Text Scramble Effect ======
class TextScrambler {
  constructor(el, finalText) {
    this.el = el;
    this.chars = '!<>-_\\/[]{}—=+*^?#________';
    this.update = this.update.bind(this);
    this.finalText = finalText;
  }

  setText(newText, durationMs = 1000) {
    const oldText = this.el.textContent;
    const length = Math.max(oldText.length, newText.length);
    const promise = new Promise(resolve => this.resolve = resolve);
    this.queue = [];

    const totalFrames = Math.floor((durationMs / 1000) * 60); // คำนวณจาก duration

    for (let i = 0; i < length; i++) {
      const from = oldText[i] || '';
      const to = newText[i] || '';
      const start = Math.floor(Math.random() * totalFrames * 0.3);
      const end = start + Math.floor(Math.random() * totalFrames * 0.7);
      this.queue.push({ from, to, start, end, char: '' });
    }

    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.totalFrames = totalFrames;
    this.update();
    return promise;
  }

  update() {
    let output = '';
    let complete = 0;
    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end, char } = this.queue[i];
      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.randomChar();
          this.queue[i].char = char;
        }
        output += `<span class="dud">${char}</span>`;
      } else {
        output += from;
      }
    }
    this.el.innerHTML = output;
    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    }
  }

  randomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
  }
}

// ====== Apply to .highlight ======
document.addEventListener("DOMContentLoaded", () => {
    const firstNameEl = document.getElementById("firstname-scramble");
    const lastNameEl = document.getElementById("lastname-scramble");

    if (!firstNameEl || !lastNameEl) return;

    const firstNameScrambler = new TextScrambler(firstNameEl);
    const lastNameScrambler = new TextScrambler(lastNameEl);

    const scrambleAll = () => {
        firstNameScrambler.setText("TAWAN", 1000);
        lastNameScrambler.setText("TAPIANTHONG", 1000);
    };

    scrambleAll(); // ทำครั้งแรก
    setInterval(scrambleAll, 7000); // ทำซ้ำทุก 7 วินาที
});

// ================= AI Image Colorizer (stable upload once) =================
document.addEventListener('DOMContentLoaded', () => {
  const cz = {
    input: document.getElementById('cz-input'),
    dropzone: document.getElementById('cz-dropzone'),
    btnColorize: document.getElementById('cz-colorize'),
    btnDownload: document.getElementById('cz-download'),
    btnReset: document.getElementById('cz-reset'),
    canvasBefore: document.getElementById('cz-canvas-before'),
    canvasAfter: document.getElementById('cz-canvas-after'),
    slider: document.getElementById('cz-slider'),
    status: document.getElementById('cz-status'),
    statusText: document.getElementById('cz-status-text'),
  };
  if (!cz.input) return;

  const SIZE = 256;
  let session = null;
  let lastOutputImageData = null;

  // ---------- helpers ----------
  const setStatus = (msg, spinning = true) => {
    cz.status.style.visibility = msg ? 'visible' : 'hidden';
    cz.statusText.textContent = msg || '';
    const spin = cz.status.querySelector('.fa-spinner');
    if (spin) spin.style.display = spinning ? 'inline-block' : 'none';
  };
  const enableControls = (hasImage, hasResult) => {
    cz.btnColorize.disabled = !hasImage;
    cz.btnReset.disabled = !(hasImage || hasResult);
    cz.btnDownload.disabled = !hasResult;
  };
  const setReveal = v => {
    cz.canvasAfter.style.setProperty('--reveal', v + '%');
    const stackEl = document.getElementById('cz-stack');
    if (stackEl) stackEl.style.setProperty('--reveal', v + '%');
  };
  const setRevealCenter = () => { cz.slider.value = 50; setReveal(50); };

  // ---------- ONNX model ----------
  let pendingFile = null; // เก็บไฟล์ถ้าโมเดลยังโหลดไม่เสร็จ

  (async () => {
    try {
      setStatus('กำลังโหลดโมเดล…', true);
      session = await ort.InferenceSession.create('models/pix2pix_colorizer_256.onnx', {
        executionProviders: ['wasm'],
        graphOptimizationLevel: 'all',
      });
      setStatus('โมเดลพร้อมใช้งาน ✔️', false);

      // ถ้ามีไฟล์ค้างอยู่จากตอนที่โมเดลยังโหลดไม่เสร็จ ให้ประมวลผลทันที
      if (pendingFile) {
        handleFile(pendingFile);
        pendingFile = null;
      }
    } catch (e) {
      console.error(e);
      setStatus('โหลดโมเดลไม่สำเร็จ', false);
    }
  })();
  // --- dropzone / file input: ล้างค่าให้เป๊ะทุกทาง ---
  cz.dropzone.addEventListener('drop', e => {
    e.preventDefault();
    cz.dropzone.classList.remove('dragover');
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      if (!session) {
        pendingFile = file; // เก็บไฟล์ไว้ก่อน
      } else {
        handleFile(file);
      }
    }
  });
  // เคลียร์ค่าทันทีที่ผู้ใช้คลิกเปิด dialog (กันกรณี browser cache state)
  cz.input.addEventListener('click', () => {
    cz.input.value = '';
  });

  // handle drop (เหมือนเดิม)
  cz.dropzone.addEventListener('dragover', e => { e.preventDefault(); cz.dropzone.classList.add('dragover'); });
  cz.dropzone.addEventListener('dragleave', () => cz.dropzone.classList.remove('dragover'));
  cz.dropzone.addEventListener('drop', e => {
    e.preventDefault(); cz.dropzone.classList.remove('dragover');
    const file = e.dataTransfer?.files?.[0];
    if (file) handleFile(file);
  });

  // change: อ่านไฟล์แล้ว “ค่อยเคลียร์” อีกครั้ง (เผื่อบาง browser)
  cz.input.addEventListener('change', e => {
    const file = e.target.files?.[0];
    if (file) {
      if (!session) {
        pendingFile = file; // เก็บไฟล์ไว้ก่อน
      } else {
        handleFile(file);
      }
    }
    setTimeout(() => { cz.input.value = ''; }, 0);
  });
  // ---------- read & draw once (robust) ----------
  async function handleFile(file) {
    try {
      setStatus('กำลังเตรียมรูป…', true);
      const bmp = await fileToBitmap(file);            // decode ครั้งเดียวจบ
      drawBitmapCover(bmp, cz.canvasBefore, SIZE, SIZE);
      if ('close' in bmp) bmp.close?.();
      // clear after
      const ctxA = cz.canvasAfter.getContext('2d');
      ctxA.clearRect(0, 0, SIZE, SIZE);
      lastOutputImageData = null;
      setRevealCenter();
      setStatus('พร้อมลงสี', false);
      enableControls(true, false);
    } catch (err) {
      console.error(err);
      setStatus('โหลดภาพไม่สำเร็จ', false);
      enableControls(false, false);
    }
  }

  function fileToBitmap(file) {
    return (window.createImageBitmap ? createImageBitmap(file) :
      new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => { resolve(img); URL.revokeObjectURL(url); };
        img.onerror = e => { reject(e); URL.revokeObjectURL(url); };
        img.src = url;
      })
    );
  }


  function drawBitmapCover(bitmap, canvas, w, h) {
    const ctx = canvas.getContext('2d');
    const ratio = Math.max(w / bitmap.width, h / bitmap.height);
    const nw = Math.round(bitmap.width * ratio);
    const nh = Math.round(bitmap.height * ratio);
    const dx = Math.floor((w - nw) / 2);
    const dy = Math.floor((h - nh) / 2);
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(bitmap, dx, dy, nw, nh);
  }

  // ---------- slider ----------
  cz.slider.addEventListener('input', e => setReveal(e.target.value));

  // ---------- colorize ----------
  const srgbToLinear = c => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const linearToSrgb = c => (c <= 0.0031308 ? 12.92 * c : 1.055 * (c ** (1 / 2.4)) - 0.055);
  function rgb2lab(r, g, b) {
    let R = srgbToLinear(r / 255), G = srgbToLinear(g / 255), B = srgbToLinear(b / 255);
    let X = R * 0.4124564 + G * 0.3575761 + B * 0.1804375, Y = R * 0.2126729 + G * 0.7151522 + B * 0.072175, Z = R * 0.0193339 + G * 0.119192 + B * 0.9503041;
    X /= 0.95047; Y /= 1.0; Z /= 1.08883; const f = t => t > 0.008856 ? Math.cbrt(t) : (7.787 * t + 16 / 116);
    const fx = f(X), fy = f(Y), fz = f(Z); return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
  }
  function lab2rgb(L, a, b) {
    const fy = (L + 16) / 116, fx = fy + (a / 500), fz = fy - (b / 200);
    const inv = t => { const t3 = t * t * t; return t3 > 0.008856 ? t3 : (t - 16 / 116) / 7.787; };
    let X = 0.95047 * inv(fx), Y = inv(fy), Z = 1.08883 * inv(fz);
    let R = 3.2404542 * X - 1.5371385 * Y - 0.4985314 * Z, G = -0.969266 * X + 1.8760108 * Y + 0.041556 * Z, B = 0.0556434 * X - 0.2040259 * Y + 1.0572252 * Z;
    R = linearToSrgb(Math.max(0, Math.min(1, R))); G = linearToSrgb(Math.max(0, Math.min(1, G))); B = linearToSrgb(Math.max(0, Math.min(1, B)));
    return [Math.round(R * 255), Math.round(G * 255), Math.round(B * 255)];
  }

  cz.btnColorize.addEventListener('click', async () => {
    if (!session) { setStatus('ยังโหลดโมเดลไม่เสร็จ', false); return; }
    setStatus('กำลังประมวลผล…', true);
    enableControls(false, false);

    const ctx = cz.canvasBefore.getContext('2d');
    const imgData = ctx.getImageData(0, 0, SIZE, SIZE).data;

    const input = new Float32Array(SIZE * SIZE);
    for (let i = 0, p = 0; i < imgData.length; i += 4, p++) {
      const [L] = rgb2lab(imgData[i], imgData[i + 1], imgData[i + 2]);
      input[p] = (L / 50.0) - 1.0;
    }
    const tensor = new ort.Tensor('float32', input, [1, 1, SIZE, SIZE]);

    try {
      const out = await session.run({ input_l: tensor });
      const ab = out.output_ab.data; // [1,2,H,W]

      const ctxA = cz.canvasAfter.getContext('2d');
      const outImg = ctxA.createImageData(SIZE, SIZE);
      let idx = 0;
      for (let p = 0; p < SIZE * SIZE; p++) {
        const L = (input[p] + 1.0) * 50.0;
        const a = ab[p] * 128.0;
        const b = ab[p + SIZE * SIZE] * 128.0;
        const [r, g, bRGB] = lab2rgb(L, a, b);
        outImg.data[idx++] = r; outImg.data[idx++] = g; outImg.data[idx++] = bRGB; outImg.data[idx++] = 255;
      }
      ctxA.putImageData(outImg, 0, 0);
      lastOutputImageData = outImg;

      setRevealCenter();
      setStatus('เสร็จแล้ว — ปรับสไลเดอร์เพื่อเปรียบเทียบ หรือดาวน์โหลด', false);
      enableControls(true, true);
    } catch (err) {
      console.error(err);
      setStatus('ประมวลผลไม่สำเร็จ', false);
      enableControls(true, false);
    }
  });

  // ---------- download/reset ----------
  cz.btnDownload.addEventListener('click', () => {
    if (!lastOutputImageData) return;
    const a = document.createElement('a');
    a.download = 'colorized.png';
    a.href = cz.canvasAfter.toDataURL('image/png');
    a.click();
  });

  cz.btnReset.addEventListener('click', () => {
    cz.canvasBefore.getContext('2d').clearRect(0, 0, SIZE, SIZE);
    cz.canvasAfter.getContext('2d').clearRect(0, 0, SIZE, SIZE);
    lastOutputImageData = null;
    setRevealCenter();
    setStatus('');
    enableControls(false, false);
    // เผื่อผู้ใช้เลือกไฟล์เดิมทันทีหลังล้าง
    cz.input.value = '';
  });
  
  // init
  enableControls(false, false);
  setRevealCenter();
});

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.contact-form');
  const statusEl = form ? form.querySelector('.form-status') : null;

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // ตรวจสอบว่าทุกช่องถูกกรอกแล้ว
    const name = form.querySelector('input[name="name"]').value.trim();
    const email = form.querySelector('input[name="email"]').value.trim();
    const message = form.querySelector('textarea[name="message"]').value.trim();

    if (!name || !email || !message) {
      statusEl.textContent = 'กรุณากรอกข้อมูลให้ครบทุกช่องก่อนส่ง';
      statusEl.style.color = 'red';
      return;
    }

    statusEl.textContent = 'กำลังส่ง...';
    statusEl.style.color = '';

    try {
      const data = new FormData(form);
      const res = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        statusEl.textContent = 'ส่งเรียบร้อย ขอบคุณครับ!';
        statusEl.style.color = 'limegreen';
        form.reset();
      } else {
        const err = await res.json().catch(() => ({}));
        statusEl.textContent = err.errors?.[0]?.message || 'ส่งไม่สำเร็จ ลองอีกครั้ง';
        statusEl.style.color = 'red';
      }
    } catch (err) {
      statusEl.textContent = 'เครือข่ายมีปัญหา ลองใหม่อีกครั้ง';
      statusEl.style.color = 'red';
    }
  });
});

const modal = document.getElementById('project-modal');
const projectCards = document.querySelectorAll('.project-card');
const closeModalButton = document.querySelector('.close-button');

const modalTitle = document.getElementById('modal-title');
const modalDescription = document.getElementById('modal-description');
const modalMedia = document.getElementById('modal-media');

projectCards.forEach(card => {
  card.addEventListener('click', () => {
    const title = card.getAttribute('data-title') || '';
    const description = card.getAttribute('data-description') || '';
    const clipUrl = card.getAttribute('data-clip') || '';
    const imageUrl = card.getAttribute('data-image') || '';
    const pdfUrl = card.getAttribute('data-pdf') || '';
    const figmaUrl = card.getAttribute('data-figma') || '';  // <- ใหม่

    modalTitle.textContent = title;
    modalDescription.innerHTML = description;
    modalMedia.innerHTML = '';
    document.querySelector('.modal-actions')?.remove(); // ล้างปุ่มเก่า

    // สื่อ: คลิป > รูป
    if (clipUrl) {
     const isYT = /youtu\.be\/|youtube\.com\/watch\?v=/.test(clipUrl);
  if (isYT) {
    const id = clipUrl
      .replace(/^.*youtu\.be\//, '')
      .replace(/^.*v=([^&]+).*$/, '$1')
      .replace(/&.*$/, '');
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
    iframe.allowFullscreen = true;
    modalMedia.appendChild(iframe);
  } else {
    const v = document.createElement('video');
    v.controls = true; v.autoplay = true; v.playsInline = true; v.preload = 'metadata';
    const s = document.createElement('source');
    s.src = clipUrl; s.type = 'video/mp4';
    v.appendChild(s);
    modalMedia.appendChild(v);
  }
      
    } else if (imageUrl) {
      const img = document.createElement('img');
      img.src = imageUrl; img.alt = title || 'Project Image';
      img.style.width = '100%'; img.style.height = 'auto';
      modalMedia.appendChild(img);
    }

    // ปุ่มลิงก์เสริม (Figma / PDF)
    if (figmaUrl || pdfUrl) {
      const actions = document.createElement('div');
      actions.className = 'modal-actions';

      if (figmaUrl) {
        actions.insertAdjacentHTML('beforeend', `
          <a href="${figmaUrl}" class="btn btn-primary" target="_blank" rel="noopener">
            เปิดบน Figma
          </a>
        `);
      }
      if (pdfUrl) {
        actions.insertAdjacentHTML('beforeend', `
          <a href="${pdfUrl}" class="btn btn-secondary" target="_blank" rel="noopener">
            View PDF
          </a>
         
        `);
      }
      modalDescription.insertAdjacentElement('afterend', actions);
    }

    modal.style.display = 'block';
  });
});

function closeModal() {
  modal.style.display = 'none';
  modalMedia.innerHTML = '';
  document.querySelector('.modal-actions')?.remove();
}

closeModalButton?.addEventListener('click', closeModal);
window.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

// Publications Section Only (JS)
(function() {
  const section = document.getElementById('publications');
  if (!section) return;

  // --- Search filter ---
  const input = section.querySelector('#pub-search');
  const items = Array.from(section.querySelectorAll('.pub-item'));
  const empty = section.querySelector('.pub-empty');

  function normalize(s) { return (s || '').toLowerCase().normalize('NFKD'); }
  function itemText(el) {
    return [
      el.querySelector('.pub-title')?.textContent,
      el.querySelector('.pub-authors')?.textContent,
      el.querySelector('.pub-venue')?.textContent,
      el.querySelector('.pub-year')?.textContent,
      el.querySelector('.pub-type')?.textContent
    ].join(' ');
  }

  input?.addEventListener('input', () => {
    const q = normalize(input.value.trim());
    let shown = 0;
    items.forEach(li => {
      const hit = normalize(itemText(li)).includes(q);
      li.hidden = !hit;
      if (hit) shown++;
    });
    empty.hidden = shown !== 0;
  });

  // --- Copy citation ---
  section.addEventListener('click', async (e) => {
    const btn = e.target.closest('.btn-copy-cite');
    if (!btn) return;
    const item = btn.closest('.pub-item');
    const citeEl = item?.querySelector('.pub-cite');
    const text = citeEl ? citeEl.textContent.replace(/^\s*Citation \(APA\)\s*/i, '').trim() : '';
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      btn.textContent = 'Copied ✔';
      setTimeout(() => { btn.textContent = 'Copy Citation'; }, 1200);
    } catch (_) {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
      btn.textContent = 'Copied ✔';
      setTimeout(() => { btn.textContent = 'Copy Citation'; }, 1200);
    }
  });
})();

// Publications viewer logic (no PDF controls)
(function(){
  const art = document.querySelector('.pub-split');
  if (!art) return;
  const btn = art.querySelector('.btn-copy-cite');
  btn?.addEventListener('click', async ()=>{
    const citeText = art.querySelector('.pub-cite')?.innerText.replace(/^\s*Citation \(APA\)\s*/i,'').trim();
    if (!citeText) return;
    try { await navigator.clipboard.writeText(citeText); btn.textContent='Copied ✔'; setTimeout(()=>btn.textContent='Copy Citation', 1200);} catch{}
  });
})();


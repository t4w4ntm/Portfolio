/**
 * @file Main script for Tawan's portfolio.
 * Handles theme switching, particle effects, navigation, modals, animations,
 * and form submissions.
 * @author Tawan Tapianthong
 */

// ===================================================================
// INITIALIZATION
// ===================================================================
document.addEventListener('DOMContentLoaded', () => {
  initializeTheme();
  initializeNavigation();
  initializeExperienceCards();
  initializeProjectModal();
  initializeScrollAnimations();
  initializeThesisSlideshow();
  initializeTextScramble();
  // initializeContactForm();
  initializePublicationViewer();
  initializeProjectFilter();
  initializeAiColorization(); // เพิ่มฟังก์ชันใหม่
});

window.addEventListener('load', () => {
  // ซ่อน Preloader หลังจากทุกอย่างโหลดเสร็จ
  handlePreloader();
  // โหลด particles ทีหลังเพื่อไม่ให้ block content
  initParticles();
  // โหลดโมเดล 3D
  initializeFloatingModel();
});

// ===================================================================
// PRELOADER
// ===================================================================
function handlePreloader() {
  const preloader = document.getElementById('preloader');
  if (preloader) {
    preloader.classList.add('loaded');
  }
}


// ===================================================================
// THEME SWITCHER
// ===================================================================
function initializeTheme() {
  const root = document.documentElement;
  const toggleBtn = document.getElementById('theme-toggle');

  const setTheme = (theme) => {
    root.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    if (toggleBtn) {
      toggleBtn.setAttribute('aria-pressed', String(theme === 'light'));
      toggleBtn.title = theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode';
    }
    // Update any theme-dependent icons
    document.querySelectorAll('.themed-icon').forEach(img => {
      const targetSrc = theme === 'light' ? img.dataset.lightSrc : img.dataset.darkSrc;
      if (img.src !== targetSrc) {
        img.src = targetSrc;
      }
    });
  };

  const savedTheme = localStorage.getItem('theme');
  const osPrefersLight = window.matchMedia?.('(prefers-color-scheme: light)').matches;
  const initialTheme = savedTheme || (osPrefersLight ? 'light' : 'dark');

  setTheme(initialTheme);

  toggleBtn?.addEventListener('click', () => {
    const newTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    // Reload particles to match the new theme background
    if (window.reloadParticles) {
      window.reloadParticles();
    }
  });
}


// ===================================================================
// TSPARTICLES BACKGROUND
// ===================================================================
/**
 * Initialize tsParticles background (supports both dark and light themes, reduced-motion aware)
 * - 50 particles with connecting lines
 * - Dark theme: white particles
 * - Light theme: blue particles that match the theme colors
 * - Speed 1, interactive hover/click effects
 * - Auto-disabled for reduced-motion preference
 */
function initParticles() {
  try {
    // ตรวจสอบ reduced-motion preference
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    // ตรวจสอบว่า tsParticles พร้อมใช้งาน
    if (typeof tsParticles === 'undefined') {
      console.warn('tsParticles library not loaded');
      return;
    }

    // ป้องกันการโหลดซ้ำ
    if (window.__particlesInitialized) {
      return;
    }
    window.__particlesInitialized = true;

    // ตรวจสอบธีมปัจจุบัน
    const theme = document.documentElement.getAttribute('data-theme') || 'dark';
    
    // กำหนดสีตามธีม
    let particleColor, linkColor, particleOpacity, linkOpacity;
    
    if (theme === 'light') {
      // Light theme: ใช้สีน้ำเงิน-ฟ้าที่เข้ากับธีม
      particleColor = ['#0858d7', '#0a84ff', '#4fc3ff', '#2563eb']; // เฉดสีน้ำเงิน-ฟ้า
      linkColor = '#0858d7'; // สีหลักของธีม light
      particleOpacity = 0.7;
      linkOpacity = 0.15; // ลดความเข้มเล็กน้อยเพื่อไม่ให้เด่นเกินไปบนพื้นขาว
    } else {
      // Dark theme: ใช้สีขาวเหมือนเดิม
      particleColor = '#ffffff';
      linkColor = '#ffffff';
      particleOpacity = 0.6;
      linkOpacity = 0.2;
    }

    // กำหนดค่าเอฟเฟกต์อนุภาค
    const particlesConfig = {
      fpsLimit: 60,
      detectRetina: true,
      background: {
        color: 'transparent'
      },
      particles: {
        number: {
          value: 50,
          density: {
            enable: true,
            area: 800
          }
        },
        color: {
          value: particleColor
        },
        shape: {
          type: 'circle'
        },
        opacity: {
          value: particleOpacity,
          random: false
        },
        size: {
          value: { min: 1, max: 3 },
          random: true
        },
        links: {
          enable: true,
          distance: 120,
          color: linkColor,
          opacity: linkOpacity,
          width: 1
        },
        move: {
          enable: true,
          speed: 1,
          direction: 'none',
          random: false,
          straight: false,
          outModes: {
            default: 'out'
          },
          attract: {
            enable: false
          }
        }
      },
      interactivity: {
        detectsOn: 'window',
        events: {
          onHover: {
            enable: true,
            mode: 'repulse'
          },
          onClick: {
            enable: true,
            mode: 'push'
          },
          resize: true
        },
        modes: {
          repulse: {
            distance: 120,
            duration: 0.4
          },
          push: {
            quantity: 4
          }
        }
      }
    };

    // โหลด particles
    tsParticles.load('tsparticles', particlesConfig);
    
  } catch (error) {
    console.error('Error initializing particles:', error);
  }
}

// ฟังก์ชันสำหรับรีโหลด particles เมื่อเปลี่ยนธีม
window.reloadParticles = () => {
  // ทำลาย particles ที่มีอยู่
  if (window.tsParticles?.dom().length) {
    window.tsParticles.dom().forEach(instance => instance.destroy());
  }
  
  // รีเซ็ตสถานะและโหลดใหม่
  window.__particlesInitialized = false;
  initParticles();
};


// ===================================================================
// NAVIGATION
// ===================================================================
function initializeNavigation() {
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (!navToggle || !navLinks) return;

  const toggleMenu = () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  };

  navToggle.addEventListener('click', toggleMenu);

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      if (navLinks.classList.contains('open')) {
        toggleMenu();
      }
    });
  });
}

// ===================================================================
// INTERACTIVE CARDS (Experience Section)
// ===================================================================
// เดสก์ท็อป/มือถือ: คลิก = พลิกทันที (toggle), โฮเวอร์ = เอียงตามเมาส์ (เฉพาะตอนยังไม่พลิก)
function initializeExperienceCards() {
  const items = document.querySelectorAll('.experience-item');
  if (!items.length) return;

  const supportsHover = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

  items.forEach(item => {
    const inner = item.querySelector('.experience-card-inner');
    if (!inner) return;

    let flipped = false;

    // === 3D Flip Behavior (ทั้งเดสก์ท็อปและมือถือ) ===
    // ----- Tilt on hover (เฉพาะยังไม่พลิก) -----
    const onMove = (e) => {
      if (!supportsHover || flipped) return;
      const rect = item.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;   // 0..1
      const py = (e.clientY - rect.top) / rect.height;  // 0..1
      const rY = (px - 0.5) * 20;   // ซ้าย(-) ขวา(+)
      const rX = -(py - 0.5) * 12;  // บน(+) ล่าง(-)
      inner.style.transform = `rotateX(${rX}deg) rotateY(${rY}deg) translateZ(12px)`;
    };

    const onLeave = () => {
      if (flipped) return;          // ขณะพลิก ปล่อยให้สไตล์ของการพลิกคุมอยู่
      inner.style.transform = '';    // กลับสู่ค่าปกติ (ไม่ทับ CSS อื่น)
    };

    // ----- Flip toggle (คลิก/คีย์บอร์ด) -----
    const toggleFlip = () => {
      flipped = !flipped;
      item.classList.toggle('is-flipped', flipped);

      if (flipped) {
        // บังคับให้ "หมุน 180°" ด้วย inline style เพื่อชนะ :hover/กฎอื่น -> พลิกทันที
        inner.style.transform = 'rotateY(180deg)';
      } else {
        // เลิกพลิก → คืนสิทธิ์ให้เอียงตามเมาส์อีกครั้ง
        inner.style.transform = '';
      }
    };

    // Mouse / keyboard events
    item.addEventListener('click', (e) => { e.preventDefault(); toggleFlip(); });
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleFlip(); }
    });

    // tilt events (เฉพาะอุปกรณ์ที่มี hover จริง)
    if (supportsHover) {
      item.addEventListener('mousemove', onMove);
      item.addEventListener('mouseleave', onLeave);
    }
  });
}



// ===================================================================
// PROJECT MODAL (รองรับแกลเลอรี/สไลด์ในโมดัล)
// ===================================================================
function initializeProjectModal() {
  const modal = document.getElementById('project-modal');
  const projectCards = document.querySelectorAll('.project-card');
  const closeModalButton = modal?.querySelector('.close-button');
  const modalTitle = document.getElementById('modal-title');
  const modalDescription = document.getElementById('modal-description');
  const modalMedia = document.getElementById('modal-media');

  // --- START: Added for a11y and UX improvements ---
  const mainContent = document.querySelector('main');
  const navContent = document.querySelector('nav');
  // --- END: Added for a11y and UX improvements ---

  if (!modal || projectCards.length === 0 || !closeModalButton) return;

  const closeModal = () => {
    modal.style.display = 'none';
    modalMedia.innerHTML = ''; // ล้างเพื่อหยุดวิดีโอ/เอา element ออก
    const oldActions = document.querySelector('.modal-actions');
    if (oldActions) oldActions.remove();

    // --- START: Restore background accessibility and scrolling ---
    mainContent?.setAttribute('aria-hidden', 'false');
    navContent?.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = '';
    // --- END: Restore background accessibility and scrolling ---
  };

  projectCards.forEach(card => {
    card.addEventListener('click', () => {
      const title = card.dataset.title || '';
      const description = card.dataset.description || '';
      const clipUrl = card.dataset.clip || '';
      const imageUrl = card.dataset.image || '';
      const figmaUrl = card.dataset.figma || '';
      const pdfUrl = card.getAttribute('data-pdf') || '';
      const galleryAttr = card.dataset.gallery || '';

      // 1) เคลียร์ของเก่า
      modalMedia.innerHTML = '';
      const oldActions = document.querySelector('.modal-actions');
      if (oldActions) oldActions.remove();

      // 2) ใส่ข้อมูลใหม่
      modalTitle.textContent = title;
      modalDescription.innerHTML = description;
      
      // (ส่วนโค้ดจัดการ tech-stack icons บน cover)
      let modalTech = modal.querySelector('#modal-tech');
      if (!modalTech) {
        modalTech = document.createElement('div');
        modalTech.id = 'modal-tech';
        modalTech.className = 'modal-tech';
        modalTitle.insertAdjacentElement('afterend', modalTech);
      }
      modalTech.innerHTML = '';
      const tempDesc = document.createElement('div');
      tempDesc.innerHTML = description;
      const icons = tempDesc.querySelector('.tech-icons');
      if (icons) {
        modalTech.appendChild(icons.cloneNode(true));
        const dup = modalDescription.querySelector('.tech-icons');
        if (dup) dup.remove();
      }


      // 3) รวมสไลด์
      let slides = [];
      if (clipUrl) slides.push({ type: 'video', src: clipUrl });
      const gallery = galleryAttr ? galleryAttr.split(',').map(s => s.trim()).filter(Boolean) : [];
      if (gallery.length) {
        slides = slides.concat(gallery.map(src => ({ type: 'image', src })));
      } else if (imageUrl) {
        slides.push({ type: 'image', src: imageUrl });
      }

      // 4) แสดงผล
      if (slides.length > 1) {
        buildModalSlideshow(modalMedia, slides);
      } else if (slides.length === 1) {
        const s = slides[0];
        if (s.type === 'video') {
          const video = document.createElement('video');
          video.controls = video.autoplay = video.playsInline = true;
          video.preload = 'metadata';
          video.innerHTML = `<source src="${s.src}" type="video/mp4">`;
          modalMedia.appendChild(video);
        } else {
          const img = document.createElement('img');
          img.src = s.src;
          img.alt = title || 'Project image';
          modalMedia.appendChild(img);
        }
      }

      // 5) ปุ่ม action
      if (figmaUrl || pdfUrl) {
        const actions = document.createElement('div');
        actions.className = 'modal-actions';
        if (figmaUrl) {
          actions.innerHTML += `<a href="${figmaUrl}" class="btn btn-primary" target="_blank" rel="noopener">Open in Figma</a>`;
        }
        if (pdfUrl) {
          actions.innerHTML += `<a href="${pdfUrl}" class="btn btn-secondary" target="_blank" rel="noopener">View PDF</a>`;
        }
        modalDescription.insertAdjacentElement('afterend', actions);
      }
      
      // 6) เปิดโมดัล
      modal.style.display = 'block';
      
      // --- START: Hide background for a11y and prevent scrolling ---
      mainContent?.setAttribute('aria-hidden', 'true');
      navContent?.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = 'hidden';
      // --- END: Hide background for a11y and prevent scrolling ---
      
      // Focus on the modal or its first focusable element for accessibility
      const firstFocusable = modal.querySelector('button, a, [tabindex]:not([tabindex="-1"])');
      (firstFocusable || modal).focus();
    });
  });

  closeModalButton.addEventListener('click', closeModal);

  window.addEventListener('click', (event) => {
    if (event.target === modal) closeModal();
  });

  // --- START: Enhanced Keyboard Controls for Modal ---
  window.addEventListener('keydown', (e) => {
    if (modal.style.display !== 'block') return; // Do nothing if modal is hidden

    // 1. Escape key to close
    if (e.key === 'Escape') {
      closeModal();
    }

    // 2. Arrow keys for slideshow navigation
    const prevBtn = modal.querySelector('.prev-slide');
    const nextBtn = modal.querySelector('.next-slide');
    if (e.key === 'ArrowLeft' && prevBtn) {
      e.preventDefault(); // Prevent browser horizontal scroll
      prevBtn.click();
    }
    if (e.key === 'ArrowRight' && nextBtn) {
      e.preventDefault(); // Prevent browser horizontal scroll
      nextBtn.click();
    }

    // 3. Tab key for focus trapping
    if (e.key === 'Tab') {
      const focusables = Array.from(modal.querySelectorAll(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      ));
      if (focusables.length === 0) return;

      const firstElement = focusables[0];
      const lastElement = focusables[focusables.length - 1];
      
      if (e.shiftKey) { // Shift + Tab
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else { // Tab
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    }
  });
  // --- END: Enhanced Keyboard Controls for Modal ---
}

// ตัวช่วยสร้างสไลด์ในโมดัล (ใช้คลาสสไลด์ที่มีอยู่แล้ว)
function buildModalSlideshow(container, slides) {
  const wrapper = document.createElement('div');
  wrapper.className = 'slides-wrapper';

  slides.forEach((s, i) => {
    const slide = document.createElement('div');
    slide.className = 'slide';
    if (s.type === 'video') {
      const video = document.createElement('video');
      video.controls = true;
      video.playsInline = true;
      video.preload = 'metadata';
      video.innerHTML = `<source src="${s.src}" type="video/mp4">`;
      slide.appendChild(video);
    } else {
      const img = document.createElement('img');
      img.src = s.src;
      img.alt = `สไลด์ที่ ${i + 1}`;
      slide.appendChild(img);
    }
    wrapper.appendChild(slide);
  });

  const prevBtn = document.createElement('button');
  prevBtn.className = 'slide-arrow prev-slide';
  prevBtn.setAttribute('aria-label', 'ก่อนหน้า');
  prevBtn.innerHTML = '&#10094;';

  const nextBtn = document.createElement('button');
  nextBtn.className = 'slide-arrow next-slide';
  nextBtn.setAttribute('aria-label', 'ถัดไป');
  nextBtn.innerHTML = '&#10095;';

  const dots = document.createElement('div');
  dots.className = 'slide-dots';

  container.appendChild(wrapper);
  container.appendChild(prevBtn);
  container.appendChild(nextBtn);
  container.appendChild(dots);

  let current = 0;
  const dotEls = slides.map((_, i) => {
    const d = document.createElement('button');
    d.className = 'dot';
    d.setAttribute('aria-label', `ไปสไลด์ที่ ${i + 1}`);
    d.addEventListener('click', () => goTo(i));
    dots.appendChild(d);
    return d;
  });

  const update = () => {
    wrapper.style.transform = `translateX(-${current * 100}%)`;
    dotEls.forEach((d, i) => d.classList.toggle('active', i === current));
  };

  const goTo = (i) => {
    current = (i + slides.length) % slides.length;
    update();
  };

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  // รองรับปัดซ้าย/ขวาบนมือถือ
  let startX = null;
  wrapper.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  wrapper.addEventListener('touchend', e => {
    if (startX == null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 30) (dx < 0 ? nextBtn : prevBtn).click();
    startX = null;
  }, { passive: true });

  update();
}


// ===================================================================
// SCROLL-TRIGGERED ANIMATIONS
// ===================================================================
function initializeScrollAnimations() {
  const observerOptions = { threshold: 0.1 };
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target); // Animate only once
      }
    });
  }, observerOptions);

  document.querySelectorAll('.content-section, .featured-project').forEach(el => observer.observe(el));
}

// ===================================================================
// THESIS SLIDESHOW
// ===================================================================
function initializeThesisSlideshow() {
  const slideshow = document.querySelector('.thesis-image-slideshow');
  if (!slideshow) return;

  const wrapper = slideshow.querySelector('.slides-wrapper');
  const slides = slideshow.querySelectorAll('.slide');
  const prevButton = slideshow.querySelector('.prev-slide');
  const nextButton = slideshow.querySelector('.next-slide');
  const dotsContainer = slideshow.querySelector('.slide-dots');
  const totalSlides = slides.length;

  if (totalSlides <= 1) {
    prevButton.style.display = 'none';
    nextButton.style.display = 'none';
    dotsContainer.style.display = 'none';
    return;
  }

  let currentIndex = 0;
  let dots = [];

  for (let i = 0; i < totalSlides; i++) {
    const dot = document.createElement('button');
    dot.className = 'dot';
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
    dots.push(dot);
  }

  const updateDots = () => {
    dots.forEach((dot, idx) => dot.classList.toggle('active', idx === currentIndex));
  };

  const goToSlide = (index) => {
    currentIndex = (index + totalSlides) % totalSlides;
    wrapper.style.transform = `translateX(-${currentIndex * 100}%)`;
    updateDots();
  };

  nextButton.addEventListener('click', () => goToSlide(currentIndex + 1));
  prevButton.addEventListener('click', () => goToSlide(currentIndex - 1));

  // --- Swipe (mobile) ---
  let startX = null;
  const SWIPE_THRESHOLD = 30;

  // touch
  wrapper.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  wrapper.addEventListener('touchend', e => {
    if (startX == null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > SWIPE_THRESHOLD) {
      goToSlide(currentIndex + (dx < 0 ? 1 : -1));
    }
    startX = null;
  }, { passive: true });

  // pointer (รองรับ stylus/นิ้ว ในบางเบราว์เซอร์)
  let pointerDown = false;
  wrapper.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'mouse') { pointerDown = true; startX = e.clientX; }
  });
  wrapper.addEventListener('pointerup', e => {
    if (!pointerDown || startX == null) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > SWIPE_THRESHOLD) {
      goToSlide(currentIndex + (dx < 0 ? 1 : -1));
    }
    pointerDown = false;
    startX = null;
  });

  // ป้องกันลากรูป
  wrapper.querySelectorAll('img').forEach(img => {
    img.addEventListener('dragstart', ev => ev.preventDefault());
  });

  goToSlide(0);
}


// ===================================================================
// HERO TEXT SCRAMBLE EFFECT
// ===================================================================
class TextScrambler {
  constructor(el) {
    this.el = el;
    this.chars = '!<>-_\\/[]{}—=+*^?#_';
    this.update = this.update.bind(this);
  }

  setText(newText, durationMs = 1000) {
    const oldText = this.el.textContent;
    const length = Math.max(oldText.length, newText.length);
    this.queue = [];

    const totalFrames = Math.floor((durationMs / 1000) * 60);

    for (let i = 0; i < length; i++) {
      const from = oldText[i] || '';
      const to = newText[i] || '';
      const start = Math.floor(Math.random() * totalFrames * 0.3);
      const end = start + Math.floor(Math.random() * totalFrames * 0.7);
      this.queue.push({ from, to, start, end, char: '' });
    }

    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    return new Promise(resolve => {
      this.resolve = resolve;
      this.update();
    });
  }

  update() {
    let output = '';
    let complete = 0;
    for (const item of this.queue) {
      if (this.frame >= item.end) {
        complete++;
        output += item.to;
      } else if (this.frame >= item.start) {
        if (!item.char || Math.random() < 0.28) {
          item.char = this.chars[Math.floor(Math.random() * this.chars.length)];
        }
        output += `<span class="dud">${item.char}</span>`;
      } else {
        output += item.from;
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
}

function initializeTextScramble() {
  const firstNameEl = document.getElementById("firstname-scramble");
  const lastNameEl = document.getElementById("lastname-scramble");

  if (!firstNameEl || !lastNameEl) return;

  const firstNameScrambler = new TextScrambler(firstNameEl);
  const lastNameScrambler = new TextScrambler(lastNameEl);

  const scrambleAll = () => {
    firstNameScrambler.setText("TAWAN", 1000);
    lastNameScrambler.setText("TAPIANTHONG", 1000);
  };

  scrambleAll();
  setInterval(scrambleAll, 7000);
}


// ===================================================================
// CONTACT FORM SUBMISSION
// ===================================================================
function initializeContactForm() {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  const statusEl = form.querySelector('.form-status');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(form);

    if (!data.get('name').trim() || !data.get('email').trim() || !data.get('message').trim()) {
      statusEl.textContent = 'Please fill out all fields.';
      statusEl.style.color = 'red';
      return;
    }

    statusEl.textContent = 'Sending...';
    statusEl.style.color = 'var(--muted-text)';

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        statusEl.textContent = 'Message sent successfully. Thank you!';
        statusEl.style.color = 'limegreen';
        form.reset();
      } else {
        const errorData = await response.json();
        statusEl.textContent = errorData.errors?.[0]?.message || 'Failed to send message.';
        statusEl.style.color = 'red';
      }
    } catch (error) {
      statusEl.textContent = 'A network error occurred. Please try again.';
      statusEl.style.color = 'red';
    }
  });
}

// ===================================================================
// PUBLICATION VIEWER LOGIC
// ===================================================================
function initializePublicationViewer() {
  const pubArticle = document.querySelector('.pub-split');
  if (!pubArticle) return;

  const btn = pubArticle.querySelector('.btn-copy-cite');
  btn?.addEventListener('click', async () => {
    const citationElement = pubArticle.querySelector('.pub-cite');
    const citationText = citationElement?.innerText.replace(/^\s*Citation \(APA\)\s*/i, '').trim();

    if (!citationText) return;

    try {
      await navigator.clipboard.writeText(citationText);
      const originalText = btn.textContent;
      btn.textContent = 'Copied ✔';
      setTimeout(() => { btn.textContent = originalText; }, 1500);
    } catch (err) {
      console.error('Failed to copy citation:', err);
      // Fallback could be implemented here if needed
    }
  });
}


// กัน Ctrl + wheel ที่เป็น "zoom out"
window.addEventListener('wheel', (e) => {
  // ส่วนใหญ่เบราว์เซอร์จะตั้ง ctrlKey=true เมื่อ pinch/zoom บน trackpad
  if (e.ctrlKey && e.deltaY > 0) { // deltaY > 0 = ย่อ/ซูมออก
    e.preventDefault();
  }
}, { passive: false });

// กันคีย์ลัดซูมออก (Ctrl + '-' หรือ Ctrl + '0' รีเซ็ตซูม)
window.addEventListener('keydown', (e) => {
  if (!e.ctrlKey) return;
  const k = e.key.toLowerCase();
  // อนุญาตเฉพาะ Ctrl + '+' (zoom in), บล็อค Ctrl + '-' และ Ctrl + '0'
  if (k === '-' || k === '_' || k === '0') {
    e.preventDefault();
  }
});

window.addEventListener('wheel', (e) => {
  // ส่วนใหญ่เบราว์เซอร์จะตั้ง ctrlKey=true เมื่อ pinch/zoom บน trackpad
  if (e.ctrlKey && e.deltaY < 0) { // deltaY > 0 = ย่อ/ซูมออก
    e.preventDefault();
  }
}, { passive: false });

// กันคีย์ลัดซูมออก (Ctrl + '-' หรือ Ctrl + '0' รีเซ็ตซูม)
window.addEventListener('keydown', (e) => {
  if (!e.ctrlKey) return;
  const k = e.key.toLowerCase();
  // อนุญาตเฉพาะ Ctrl + '+' (zoom in), บล็อค Ctrl + '-' และ Ctrl + '0'
  if (k === '+' || k === '_' || k === '1') {
    e.preventDefault();
  }
});

// กัน pinch-zoom ออกบน mobile (บางเคส)
let lastDist = null;
window.addEventListener('touchmove', (e) => {
  if (e.touches && e.touches.length === 2) {
    const [t1, t2] = e.touches;
    const dx = t1.pageX - t2.pageX;
    const dy = t1.pageY - t2.pageY;
    const dist = Math.hypot(dx, dy);
    if (lastDist && dist < lastDist) {
      // ระยะนิ้วลดลง = แนวโน้มซูมออก → บล็อค
      e.preventDefault();
    }
    lastDist = dist;
  }
}, { passive: false });

window.addEventListener('touchend', () => { lastDist = null; });

function initializeProjectFilter() {
  const bar = document.getElementById('projects-filter');
  const cards = Array.from(document.querySelectorAll('#projects .project-card'));
  if (!bar || cards.length === 0) return;

  const setActive = (btn) => {
    bar.querySelectorAll('.filter-btn').forEach(b => {
      const active = b === btn;
      b.classList.toggle('is-active', active);
      b.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  };

  const applyFilter = (value) => {
    const v = (value || 'all').toLowerCase();
    cards.forEach(card => {
      const cats = (card.dataset.cats || '').toLowerCase().split(',').map(s => s.trim());
      const show = v === 'all' || cats.includes(v);
      card.hidden = !show;      // ใช้ hidden ให้แค่นเลย์เอาต์ได้พอดี
    });
  };

  // คลิกปุ่ม
  bar.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-filter]');
    if (!btn) return;
    setActive(btn);
    applyFilter(btn.dataset.filter);
  });

  // เริ่มต้น: 'all' หรืออ่านจาก hash เช่น #cat=ai
  const m = location.hash.match(/cat=([a-z]+)/i);
  const start = m ? m[1].toLowerCase() : 'all';
  const startBtn = bar.querySelector(`[data-filter="${start}"]`) || bar.querySelector('[data-filter="all"]');
  setActive(startBtn);
  applyFilter(start);
}

// ===================================================================
// LIGHTWEIGHT ANALYTICS & SMALL SECURITY WINS
// ===================================================================
function initializeSmallSecurity() {
  // Add rel=noopener,noreferrer to all external links that open in a new tab
  document.querySelectorAll('a[target="_blank"]').forEach(a => {
    const rel = (a.getAttribute('rel') || '').toLowerCase();
    if (!rel.includes('noopener')) a.setAttribute('rel', (rel + ' noopener').trim());
    if (!rel.includes('noreferrer')) a.setAttribute('rel', (rel + ' noreferrer').trim());
    // A little referrer hygiene
    if (!a.hasAttribute('referrerpolicy')) a.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
  });
}

function initializeImageDecodingHints() {
  // Help the browser parallelize image decoding
  document.querySelectorAll('img').forEach(img => {
    if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
    // Lazy images are low-priority fetches
    if (img.loading === 'lazy' && !img.hasAttribute('fetchpriority')) {
      img.setAttribute('fetchpriority', 'low');
    }
  });
}

// Deep-link: #project=<slug> to open modal directly; update hash when opening
function slugify(str) {
  return String(str).toLowerCase().normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function initializeProjectDeepLink() {
  const cards = Array.from(document.querySelectorAll('#projects .project-card'));
  const titleToCard = new Map(cards.map(c => [slugify(c.dataset.title || ''), c]));

  function openByHash() {
    const m = location.hash.match(/project=([a-z0-9\-]+)/i);
    if (!m) return;
    const slug = m[1];
    const card = titleToCard.get(slug);
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }
  }
  window.addEventListener('hashchange', () => {
    // Close modal if hash cleared
    if (!/#/.test(location.hash)) {
      const modal = document.getElementById('project-modal');
      if (modal && modal.style.display === 'block') {
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) closeBtn.click();
      }
    } else {
      openByHash();
    }
  });

  // Hook into modal open to update hash
  document.addEventListener('open-project-modal', (e) => {
    const title = e.detail && e.detail.title ? e.detail.title : '';
    const slug = slugify(title);
    if (slug) history.replaceState(null, '', `#project=${slug}`);
  });
  // Hook into modal close to clear hash
  document.addEventListener('close-project-modal', () => {
    if (/project=/.test(location.hash)) {
      history.replaceState(null, '', location.pathname + location.search);
    }
  });

  // If URL already has hash, try to open that project on load
  openByHash();
}

// Optional PWA: register service worker if present at /sw.js (safe no-op if missing)
function tryRegisterSW() {
  if ('serviceWorker' in navigator) {
    fetch('sw.js', { method: 'HEAD' }).then(res => {
      if (res.ok) navigator.serviceWorker.register('sw.js').catch(() => {});
    }).catch(() => {});
  }
}

// Minimal Web Vitals-ish measurement (LCP, CLS, FID) + simple event analytics
function initializeAnalytics() {
  const storeKey = 'portfolio_metrics_v1';
  const metrics = JSON.parse(localStorage.getItem(storeKey) || '{}');

  // LCP
  try {
    const po = new PerformanceObserver((list) => {
      const last = list.getEntries().pop();
      if (last) {
        metrics.LCP = Math.round(last.startTime);
        localStorage.setItem(storeKey, JSON.stringify(metrics));
        console.log('[Metrics] LCP:', metrics.LCP, 'ms');
      }
    });
    po.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch {}

  // CLS
  try {
    let cls = 0;
    const po = new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        if (!e.hadRecentInput) cls += e.value;
      }
      metrics.CLS = Number(cls.toFixed(4));
      localStorage.setItem(storeKey, JSON.stringify(metrics));
    });
    po.observe({ type: 'layout-shift', buffered: true });
  } catch {}

  // FID (first input delay)
  try {
    const po = new PerformanceObserver((list) => {
      const first = list.getEntries()[0];
      if (first) {
        metrics.FID = Math.round(first.processingStart - first.startTime);
        localStorage.setItem(storeKey, JSON.stringify(metrics));
        console.log('[Metrics] FID:', metrics.FID, 'ms');
      }
    });
    po.observe({ type: 'first-input', buffered: true });
  } catch {}

  // Track filter usage & modal opens
  const bar = document.getElementById('projects-filter');
  if (bar) {
    bar.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-filter]');
      if (!btn) return;
      metrics.filters = metrics.filters || {};
      metrics.filters[btn.dataset.filter] = (metrics.filters[btn.dataset.filter] || 0) + 1;
      localStorage.setItem(storeKey, JSON.stringify(metrics));
    });
  }
  document.addEventListener('open-project-modal', (e) => {
    const title = e.detail && e.detail.title;
    metrics.modals = metrics.modals || {};
    if (title) metrics.modals[title] = (metrics.modals[title] || 0) + 1;
    localStorage.setItem(storeKey, JSON.stringify(metrics));
  });
}

// Hook our additions into existing init sequence
(function () {
  // Run after the main DOMContentLoaded initializers (queue microtask)
  queueMicrotask(() => {
    try {
      initializeSmallSecurity();
      initializeImageDecodingHints();
      initializeProjectDeepLink();
      initializeAnalytics();
      tryRegisterSW();
    } catch (e) { console.warn('Enhancements init failed:', e); }
  });
})();

// ===================================================================
// Lightweight Analytics, Security headers for links, PWA opt-in, Deep-link
// ===================================================================
function initializeSmallSecurity() {
  document.querySelectorAll('a[target="_blank"]').forEach(a => {
    const rel = (a.getAttribute('rel') || '').toLowerCase();
    if (!rel.includes('noopener')) a.setAttribute('rel', (rel + ' noopener').trim());
    if (!rel.includes('noreferrer')) a.setAttribute('rel', (rel + ' noreferrer').trim());
    if (!a.hasAttribute('referrerpolicy')) a.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
  });
}
function initializeImageDecodingHints() {
  document.querySelectorAll('img').forEach(img => {
    if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
    if (img.loading === 'lazy' && !img.hasAttribute('fetchpriority')) img.setAttribute('fetchpriority', 'low');
  });
}
// Deep-link handling for project modal
function slugify(str) {
  return String(str).toLowerCase().normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
function initializeProjectDeepLink() {
  const cards = Array.from(document.querySelectorAll('#projects .project-card'));
  const titleToCard = new Map(cards.map(c => [slugify(c.dataset.title || ''), c]));
  function openByHash() {
    const m = location.hash.match(/project=([a-z0-9\-]+)/i);
    if (!m) return;
    const card = titleToCard.get(m[1]);
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }
  }
  window.addEventListener('hashchange', () => {
    if (!/#/.test(location.hash)) {
      const modal = document.getElementById('project-modal');
      if (modal && modal.style.display === 'block') {
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) closeBtn.click();
      }
    } else openByHash();
  });
  document.addEventListener('open-project-modal', (e) => {
    const title = e.detail && e.detail.title ? e.detail.title : '';
    const slug = slugify(title);
    if (slug) history.replaceState(null, '', `#project=${slug}`);
  });
  document.addEventListener('close-project-modal', () => {
    if (/project=/.test(location.hash)) history.replaceState(null, '', location.pathname + location.search);
  });
  openByHash();
}
// Register SW if available
function tryRegisterSW() {
  if ('serviceWorker' in navigator) {
    fetch('sw.js', { method: 'HEAD' }).then(res => {
      if (res.ok) navigator.serviceWorker.register('sw.js').catch(()=>{});
    }).catch(()=>{});
  }
}
// Minimal metrics: LCP/CLS/FID and UI events
function initializeAnalytics() {
  const storeKey = 'portfolio_metrics_v1';
  const metrics = JSON.parse(localStorage.getItem(storeKey) || '{}');
  try {
    const po = new PerformanceObserver((list)=>{
      const last = list.getEntries().pop();
      if (last) { metrics.LCP = Math.round(last.startTime); localStorage.setItem(storeKey, JSON.stringify(metrics)); }
    });
    po.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch {}
  try {
    let cls = 0;
    const po = new PerformanceObserver((list)=>{
      for (const e of list.getEntries()) if (!e.hadRecentInput) cls += e.value;
      metrics.CLS = Number(cls.toFixed(4));
      localStorage.setItem(storeKey, JSON.stringify(metrics));
    });
    po.observe({ type: 'layout-shift', buffered: true });
  } catch {}
  try {
    const po = new PerformanceObserver((list)=>{
      const first = list.getEntries()[0];
      if (first) { metrics.FID = Math.round(first.processingStart - first.startTime); localStorage.setItem(storeKey, JSON.stringify(metrics)); }
    });
    po.observe({ type: 'first-input', buffered: true });
  } catch {}
  const bar = document.getElementById('projects-filter');
  if (bar) {
    bar.addEventListener('click', (e)=>{
      const btn = e.target.closest('button[data-filter]');
      if (!btn) return;
      metrics.filters = metrics.filters || {};
      metrics.filters[btn.dataset.filter] = (metrics.filters[btn.dataset.filter] || 0) + 1;
      localStorage.setItem(storeKey, JSON.stringify(metrics));
    });
  }
  document.addEventListener('open-project-modal', (e)=>{
    const title = e.detail && e.detail.title;
    metrics.modals = metrics.modals || {};
    if (title) metrics.modals[title] = (metrics.modals[title] || 0) + 1;
    localStorage.setItem(storeKey, JSON.stringify(metrics));
  });
}
// Keyboard close & focus trap for modal (a11y)
function enhanceModalA11y() {
  const modal = document.getElementById('project-modal');
  if (!modal) return;
  const trap = (e) => {
    if (e.key === 'Escape') {
      const closeBtn = modal.querySelector('.modal-close'); 
      if (closeBtn) closeBtn.click();
    }
    if (e.key === 'Tab') {
      const focusables = modal.querySelectorAll('a, button, textarea, input, [tabindex]:not([tabindex="-1"])');
      if (!focusables.length) return;
      const first = focusables[0], last = focusables[focusables.length-1];
      if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
      else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
    }
  };
  modal.addEventListener('keydown', trap);
  document.addEventListener('open-project-modal', ()=>{
    const first = modal.querySelector('button, a, [tabindex]'); 
    (first || modal).focus({preventScroll:true});
  });
}

// Hook 
queueMicrotask(()=>{
  try {
    initializeSmallSecurity();
    initializeImageDecodingHints();
    initializeProjectDeepLink();
    initializeAnalytics();
    tryRegisterSW();
    enhanceModalA11y();
  } catch(e){ console.warn('Enhancements init failed', e); }
});

// ===== Contact form submit (Formspree) =====
(function initContactForm(){
  const form = document.querySelector('form.contact-form');
  if (!form) return;

  const btn = form.querySelector('button[type="submit"]');
  const statusEl = form.querySelector('.form-status');
  const nameEl = form.querySelector('input[name="name"]');
  const emailEl = form.querySelector('input[name="email"]');
  const msgEl = form.querySelector('textarea[name="message"]');

  // helper: แสดงสถานะ
  const setStatus = (text, ok=false) => {
    statusEl.textContent = text;
    statusEl.classList.remove('ok','err');
    statusEl.classList.add(ok ? 'ok' : 'err');
  };

  // helper: ตรวจค่าขั้นพื้นฐาน
  const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  // live remove error style เมื่อพิมพ์
  [nameEl, emailEl, msgEl].forEach(el=>{
    el.addEventListener('input', ()=> el.classList.remove('is-invalid'));
  });

  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    statusEl.textContent = '';

    // validate
    let hasError = false;
    if (!nameEl.value.trim()){ nameEl.classList.add('is-invalid'); hasError = true; }
    if (!isEmail(emailEl.value.trim())){ emailEl.classList.add('is-invalid'); hasError = true; }
    if (!msgEl.value.trim()){ msgEl.classList.add('is-invalid'); hasError = true; }

    if (hasError){
      setStatus('กรุณากรอกข้อมูลให้ครบถ้วนและตรวจสอบอีเมลอีกครั้ง');
      return;
    }

    // ส่ง
    btn.classList.add('is-loading');
    btn.disabled = true;

    try{
      const res = await fetch(form.action, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form)
      });

      if (res.ok){
        form.reset();
        setStatus('ส่งข้อความเรียบร้อย ขอบคุณครับ 🙏', true);
      }else{
        const data = await res.json().catch(()=> ({}));
        const msg = data?.errors?.[0]?.message || 'ส่งไม่สำเร็จ โปรดลองใหม่อีกครั้งภายหลัง';
        setStatus(msg);
      }
    }catch(err){
      setStatus('เครือข่ายขัดข้อง โปรดตรวจการเชื่อมต่ออินเทอร์เน็ตแล้วลองใหม่');
    }finally{
      btn.classList.remove('is-loading');
      btn.disabled = false;
    }
  });
})();

// === ฟังก์ชันใหม่ ===
function initializeAiColorization() {
  // === เปลี่ยนเป็น URL ของ Space/Backend คุณ ===
  const API_BASE = "https://tawannn-ai-color.hf.space"; // <— แก้ให้ตรงของคุณถ้าจำเป็น

  // อ้างอิง element
  const dropzone = document.getElementById('color-dropzone');
  const fileInput = document.getElementById('color-file');
  const pickBtn = document.getElementById('pick-file');
  const runBtn = document.getElementById('run-colorize');
  const clearBtn = document.getElementById('clear-colorize');
  const inputImg = document.getElementById('color-input-preview');
  const outputImg = document.getElementById('color-output-preview');
  const statusEl = document.getElementById('color-status');

  if (!dropzone || !fileInput || !pickBtn || !runBtn || !inputImg || !outputImg || !statusEl) {
    console.warn('[AI Colorization] Missing DOM elements. Skipping init.');
    return;
  }

  // ===== Config ฝั่ง client =====
  const MAX_UPLOAD_PX = 2048;     // ลดด้านยาวสุดให้ไม่เกินค่านี้ (0 = ปิด)
  const ACCEPT_TYPES = ['image/jpeg','image/png','image/webp','image/bmp'];

  let currentFile = null;
  let outputObjectUrl = null; 

  // ===== Helpers =====
  const setStatus = (msg, isError=false) => {
    statusEl.textContent = msg || '';
    statusEl.style.color = isError ? '#ff7b7b' : 'var(--muted-text)';
  };

  const isAcceptType = (file) => {
    if (!file || !file.type) return false;
    return ACCEPT_TYPES.includes(file.type) || file.type.startsWith('image/');
  };

  const fileToDataURL = (file) => new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result);
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });

  // ลดขนาดภาพด้วย canvas (คงสัดส่วน) เพื่ออัปโหลดเร็วขึ้น
  async function downscaleIfNeeded(file, maxPx = MAX_UPLOAD_PX) {
    if (!maxPx || maxPx <= 0) return file; // ปิดฟีเจอร์
    const imgURL = await fileToDataURL(file);
    const img = new Image();
    img.src = imgURL;
    await img.decode();

    const { naturalWidth: w, naturalHeight: h } = img;
    const longSide = Math.max(w, h);
    if (longSide <= maxPx) return file; // ไม่ต้องลด

    const scale = maxPx / longSide;
    const tw = Math.round(w * scale);
    const th = Math.round(h * scale);

    const canvas = document.createElement('canvas');
    canvas.width = tw;
    canvas.height = th;
    const ctx = canvas.getContext('2d');
    // ค่า imageSmoothing ช่วยให้คมขึ้นตอนย่อ
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, tw, th);

    // ใช้ชนิดไฟล์เดิมถ้าเป็น jpeg/png/webp; เดฟอลต์เป็น image/png
    const mime = file.type && file.type.startsWith('image/') ? file.type : 'image/png';
    const blob = await new Promise((res) => canvas.toBlob(res, mime, 0.92));
    return new File([blob], file.name.replace(/\.(\w+)$/i, '') + '_scaled.' + (mime.split('/')[1] || 'png'), { type: mime });
  }

  function enableRun(enabled) {
    runBtn.disabled = !enabled;
    runBtn.ariaDisabled = (!enabled).toString();
  }
  function updateClearState() {
    const hasSomething = !!currentFile || !!inputImg.getAttribute('src') || !!outputImg.getAttribute('src');
    clearBtn.disabled = !hasSomething;
    clearBtn.ariaDisabled = (!hasSomething).toString();
  }
function previewFile(file) {
  fileToDataURL(file).then((dataUrl) => {
    inputImg.src = dataUrl;
    dropzone.classList.add('has-image');  
    updateClearState();
  });
}

  async function handlePickedFile(file) {
    if (!file) return;
    if (!isAcceptType(file)) {
      setStatus('ไฟล์ไม่รองรับ กรุณาเลือกภาพ (.jpg .png .webp .bmp)', true);
      enableRun(false);
      return;
    }
    currentFile = file;
    previewFile(file);
    enableRun(true);
    setStatus('');
    // เคลียร์ผลลัพธ์เดิม
    outputImg.removeAttribute('src');
  }

 async function doColorize() {
  if (!currentFile) return;
  try {
    enableRun(false);
    setStatus('กำลังลงสีภาพ…');

    const fileToSend = await downscaleIfNeeded(currentFile);

    const form = new FormData();
    form.append('file', fileToSend, fileToSend.name);

    const resp = await fetch(`${API_BASE}/api/colorize`, { method: 'POST', body: form });
    if (!resp.ok) throw new Error(`ลงสีไม่สำเร็จ (HTTP ${resp.status})`);

    const blob = await resp.blob();

    // ใช้ URL (พิมพ์ใหญ่) และไม่ใช้ชื่อแปร url เพื่อตัดปัญหา scope
    if (outputObjectUrl) URL.revokeObjectURL(outputObjectUrl);
    const URL_API = (window.URL || window.webkitURL);
    outputObjectUrl = URL_API.createObjectURL(blob);

    outputImg.src = outputObjectUrl;
    setStatus('เสร็จแล้ว ✓');
  } catch (err) {
    console.error(err);
    setStatus((err && err.message) ? err.message : String(err), true);
  } finally {
    enableRun(true);
    updateClearState();
  }
}

  function clearSelection() {
    if (outputObjectUrl) { URL.revokeObjectURL(outputObjectUrl); outputObjectUrl = null; }
    inputImg.removeAttribute('src');
    outputImg.removeAttribute('src');
    fileInput.value = '';
    currentFile = null;
    enableRun(false);
    setStatus('เคลียร์แล้ว • เลือกรูปหรือลากมาวาง');
    dropzone.classList.remove('has-image');
    updateClearState();
    dropzone?.focus();
  }
  // ===== Events =====
  // ปุ่มเลือกไฟล์
  pickBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    const f = e.target.files && e.target.files[0];
    handlePickedFile(f);
  });

  // ลาก-วาง
const stopDefaults = (e) => { e.preventDefault(); e.stopPropagation(); };
['dragenter','dragover','dragleave','drop'].forEach(ev =>
  dropzone.addEventListener(ev, stopDefaults)
);
['dragenter','dragover'].forEach(ev =>
  dropzone.addEventListener(ev, () => dropzone.classList.add('is-dragover'))
);
['dragleave','drop'].forEach(ev =>
  dropzone.addEventListener(ev, () => dropzone.classList.remove('is-dragover'))
);

  dropzone.addEventListener('click', () => fileInput.click());
  dropzone.addEventListener('keypress', (e) => { if (e.key === 'Enter' || e.key === ' ') fileInput.click(); });
  dropzone.addEventListener('drop', (e) => {
    const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    handlePickedFile(f);
  });

  // ปุ่ม “ลงสี”
  runBtn.addEventListener('click', doColorize);
  clearBtn.addEventListener('click', clearSelection); 

  // เริ่มต้น
  enableRun(false);
  setStatus('พร้อมใช้งาน • เลือกรูปหรือลากมาวาง');
  updateClearState();
}

// ===================================================================
// 3D FLOATING MODEL IN NAVBAR
// ===================================================================
function initializeFloatingModel() {
  // ตรวจสอบว่า Three.js โหลดแล้วหรือยัง
  if (typeof THREE === 'undefined') {
    console.warn('Three.js not loaded, skipping 3D model');
    return;
  }

  const container = document.getElementById('navbar-model');
  if (!container) return;

  // สร้าง scene, camera, renderer
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 100); // ลด FOV และปรับ near/far plane
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  
  renderer.setSize(40, 40); // ย่อขนาด renderer ลงตาม
  renderer.setClearColor(0x000000, 0); // โปร่งใส
  container.appendChild(renderer.domElement);

  // เพิ่มแสงให้สว่างขึ้นและดู soft
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.5); // ambient ขาวจ้า
  scene.add(ambientLight);

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x222233, 1.2); // แสงฟ้าขาวด้านบน+น้ำเงินด้านล่าง
  hemiLight.position.set(0, 2, 0);
  scene.add(hemiLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
  directionalLight.position.set(2, 4, 2);
  directionalLight.castShadow = false;
  scene.add(directionalLight);

  // เพิ่ม rim light เล็กน้อย (ขอบสว่าง)
  const rimLight = new THREE.DirectionalLight(0xffffff, 0.7);
  rimLight.position.set(-2, 2, 2);
  scene.add(rimLight);

  // ตัวแปรสำหรับโมเดลและแอนิเมชัน
  let model = null;
  let mixer = null; // สำหรับ animation mixer
  const clock = new THREE.Clock();
  
  // ตัวแปรสำหรับระบบหยุด-หมุนกลับ
  let walkState = 'walking'; // 'walking', 'pausing', 'turning'
  let pauseStartTime = 0;
  let currentDirection = 1; // 1 = ไปขวา, -1 = ไปซ้าย
  
  // โหลดโมเดล .glb
  const loader = new THREE.GLTFLoader();
  loader.load(
    'model.glb',
    function(gltf) {
      model = gltf.scene;
      
      // ปรับขนาดโมเดลให้เล็กลงมาก (สำหรับ navbar)
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 0.023 / maxDim; // ขนาดที่เหมาะสมมากขึ้น
      model.scale.set(scale, scale, scale);
      
      // วางตำแหน่งให้อยู่ตรงกลาง viewport และเลื่อนลงมา
      const center = box.getCenter(new THREE.Vector3());
      const baseY = (-center.y * scale) - 1; // เก็บตำแหน่ง Y base ไว้
      model.position.set(-center.x * scale, baseY, -center.z * scale);
      model.userData.baseY = baseY; // เก็บค่า base Y ไว้ใช้ใน animate
      
      // จัดการ animations ถ้ามี
      if (gltf.animations && gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(model);
        
        // เก็บ actions ไว้เพื่อควบคุม
        model.userData.walkAction = null;
        model.userData.idleAction = null;
        
        gltf.animations.forEach((clip) => {
          const action = mixer.clipAction(clip);
          
          // แยกประเภท animation ตามชื่อ
          if (clip.name.toLowerCase().includes('walk') || clip.name.toLowerCase().includes('run')) {
            model.userData.walkAction = action;
          } else if (clip.name.toLowerCase().includes('idle')) {
            model.userData.idleAction = action;
          } else {
            // ถ้าไม่รู้ประเภท ให้เป็น walk action
            if (!model.userData.walkAction) {
              model.userData.walkAction = action;
            }
          }
        });
        
        // เล่น idle เป็นเริ่มต้น
        if (model.userData.idleAction) {
          model.userData.idleAction.play();
        } else if (model.userData.walkAction) {
          model.userData.walkAction.play();
          model.userData.walkAction.paused = true; // หยุดไว้ก่อน
        }
        
        console.log('Found', gltf.animations.length, 'animations in model');
      }
      
      scene.add(model);
      console.log('3D Navbar Model loaded successfully');
    },
    function(progress) {
      console.log('Loading navbar model progress:', (progress.loaded / progress.total * 100) + '%');
    },
    function(error) {
      console.error('Error loading navbar 3D model:', error);
    }
  );

  // วางกล้อง
  camera.position.set(0, 0, 3); // ย้ายกล้องออกไปไกลขึ้น

  // ฟังก์ชันแอนิเมชัน
  function animate() {
    requestAnimationFrame(animate);
    
    const deltaTime = clock.getDelta();
    
    if (model) {
      const elapsedTime = clock.getElapsedTime();
      
      // อัปเดต animation mixer ถ้ามี
      if (mixer) {
        mixer.update(deltaTime);
      }
      
      // แอนิเมชันเดินซ้าย-ขวาแถวๆ ชื่อ (ขยับ container) - ขยายให้เดินออกนอกจอ
      const walkRange = 150; // ขยายระยะให้เดินออกนอกจอได้
      const walkSpeed = 0.4;  // ลดความเร็วให้ดูสบายตา
      const walkPosition = Math.sin(elapsedTime * walkSpeed) * walkRange;
      container.style.right = (-50 + walkPosition) + 'px';
      
      // คำนวณความเร็วและทิศทางการเคลื่อนที่
      const velocity = Math.cos(elapsedTime * walkSpeed) * walkSpeed; 
      // อนุพันธ์ของ sin
      
      // กำหนดขอบเขตที่มองเห็น: -200px ถึง +200px (นอกจอแล้ว)
      const screenBounds = 200; 
      const isOutOfScreen = Math.abs(-50 + walkPosition) > screenBounds;
      const isMoving = Math.abs(velocity) > 0.02; // ลด threshold ให้ไวขึ้น
      
      // ควบคุม animation ตามการเคลื่อนที่
      if (model.userData.walkAction && model.userData.idleAction) {
        if (!isOutOfScreen && isMoving) {
          // ยังอยู่ในจอและเคลื่อนที่ = เล่น walk animation
          if (!model.userData.walkAction.isRunning()) {
            if (model.userData.idleAction.isRunning()) {
              model.userData.idleAction.fadeOut(0.3);
            }
            model.userData.walkAction.reset().fadeIn(0.3).play();
          }
          // ใช้ค่าคงที่สำหรับ animation speed
          model.userData.walkAction.setEffectiveTimeScale(1.0);
        } else {
          // นอกจอหรือหยุด = เล่น idle animation
          if (!model.userData.idleAction.isRunning()) {
            if (model.userData.walkAction.isRunning()) {
              model.userData.walkAction.fadeOut(0.3);
            }
            model.userData.idleAction.reset().fadeIn(0.3).play();
          }
        }
      } else if (model.userData.walkAction) {
        // ถ้ามีแค่ walk animation
        if (!isOutOfScreen && isMoving) {
          model.userData.walkAction.paused = false;
          model.userData.walkAction.setEffectiveTimeScale(1.0); // ใช้ความเร็วปกติ
        } else {
          model.userData.walkAction.paused = true;
        }
      }
      
      // หมุนตัวโมเดลตามทิศทางความเร็ว (ไม่ใช่ตำแหน่ง)
      let targetRotationY = model.rotation.y; // เก็บค่าเดิมไว้
      
      if (isOutOfScreen) {
        // เมื่อออกนอกจอ ให้คงทิศทางเดิม
        // ไม่เปลี่ยนทิศทาง
      } else if (velocity > 0.05) {
        targetRotationY = -Math.PI/2; // เคลื่อนที่ไปขวา = หันขวา
      } else if (velocity < -0.05) {
        targetRotationY = Math.PI/2;  // เคลื่อนที่ไปซ้าย = หันซ้าย
      }
      // ถ้า velocity ใกล้ 0 และไม่ออกนอกจอ = คงทิศทางเดิมไว้
      
      // ใช้ lerp เพื่อให้การหมุนนุ่มนวล (ช้าลงเพื่อไม่ให้กระต่าย)
      model.rotation.y += (targetRotationY - model.rotation.y) * 0.05;
      
      // ลดการเคลื่อนไหวเพิ่มเติม (ให้ animation ของโมเดลเด่นขึ้น) + รักษาตำแหน่งลงมา
      const baseY = model.userData.baseY || 0; // ใช้ตำแหน่ง base Y
      model.position.y = baseY + Math.sin(elapsedTime * 2) * 0.05; 
      // รวมกับการกระดกขึ้น-ลง
      
      // ลดการเอียงลง
      model.rotation.x = Math.sin(elapsedTime * 1.5) * 0.02;
      model.rotation.z = Math.sin(elapsedTime * 1) * 0.01;
    }
    
    renderer.render(scene, camera);
  }

  // เริ่มแอนิเมชัน
  animate();

  // ซ่อนโมเดลในมือถือ
  function handleMobileVisibility() {
    const isMobile = window.innerWidth <= 768;
    container.style.display = isMobile ? 'none' : 'block';
  }

  handleMobileVisibility();
  window.addEventListener('resize', handleMobileVisibility);
}
// ===== Experience: flip + tilt + keyboard =====
function initializeExperienceCards() {
  const items = document.querySelectorAll('.experience-item');

  const supportsHover = matchMedia('(hover: hover)').matches;
  const reduceMotion  = matchMedia('(prefers-reduced-motion: reduce)').matches;

  items.forEach((item) => {
    const inner = item.querySelector('.experience-card-inner');

    // ป้องกันคลิกลิงก์/ปุ่มภายในการ์ดแล้วการ์ดพลิก
    item.addEventListener('click', (e) => {
      const actionable = e.target.closest('a, button, input, textarea, select, label');
      if (actionable) return;
      inner.classList.toggle('is-flipped');
    });

    // กด Enter/Space เพื่อพลิก (focus อยู่ที่การ์ด)
    item.addEventListener('keydown', (e) => {
      const key = e.key || e.code;
      if (key === 'Enter' || key === ' ') {
        const actionable = e.target.closest('a, button, input, textarea, select, label');
        if (actionable) return;
        e.preventDefault();
        inner.classList.toggle('is-flipped');
      }
    });

    // Tilt effect (เฉพาะอุปกรณ์ที่มี hover และไม่ลด motion)
    if (supportsHover && !reduceMotion) {
      const setTilt = (rx, ry) => {
        inner.style.setProperty('--rx', `${rx.toFixed(2)}deg`);
        inner.style.setProperty('--ry', `${ry.toFixed(2)}deg`);
      };

      item.addEventListener('mousemove', (e) => {
        const rect = item.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;   // 0..1
        const py = (e.clientY - rect.top)  / rect.height;  // 0..1
        const max = 8; // องศาสูงสุด
        const ry = (px - 0.5) * (max * 2);  // ซ้าย/ขวา
        const rx = (0.5 - py) * (max * 2);  // บน/ล่าง
        setTilt(rx, ry);
      });

      item.addEventListener('mouseleave', () => setTilt(0, 0));
    }
  });
}

// เรียกใช้งานเมื่อ DOM พร้อม
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeExperienceCards, { once: true });
} else {
  initializeExperienceCards();
}

// ===== Copy Citation to Clipboard + Toast =====
(function(){
  const toast = document.querySelector('#copy-toast');
  function showToast(msg){
    if(!toast) return;
    toast.textContent = msg; toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 1600);
  }
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.copy-btn'); if(!btn) return;
    const targetSel = btn.getAttribute('data-copy'); const node = document.querySelector(targetSel);
    if (!node) return;
    navigator.clipboard.writeText(node.textContent.trim()).then(() => showToast('Copied!'));
  });
})();

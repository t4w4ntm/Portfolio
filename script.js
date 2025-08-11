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
  initializeContactForm();
  initializePublicationViewer();
});

window.addEventListener('load', () => {
  // Load particles after all other content to avoid blocking
  loadParticles();
});


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
let particlesLoaded = false;

function loadParticles() {
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const theme = document.documentElement.getAttribute('data-theme') || 'dark';
  const particleCount = prefersReducedMotion ? 0 : (isMobile ? 45 : 120);

  if (particleCount <= 0 || typeof tsParticles === 'undefined') {
    (window.tsParticles?.dom() || []).forEach(i => i.destroy());
    particlesLoaded = false;
    return;
  }

  const bg = getComputedStyle(document.documentElement).getPropertyValue('--background-color').trim();

  const starfieldOptions = {
    background: { color: { value: bg } },
    fpsLimit: 60,
    particles: {
      number: { value: particleCount, density: { enable: true, area: 900 } },
      color: { value: '#ffffff' },
      shape: { type: 'circle' },
      opacity: { value: 0.45, random: true },
      size: { value: { min: 1, max: 2.5 } },
      move: { enable: true, speed: isMobile ? 0.7 : 1, direction: 'none', straight: false, outModes: { default: 'out' } }
    },
    interactivity: {
      events: { onHover: { enable: !prefersReducedMotion, mode: 'repulse' }, onClick: { enable: !prefersReducedMotion, mode: 'push' } },
      modes: { repulse: { distance: 100, duration: 0.35 }, push: { quantity: 4 } }
    },
    detectRetina: true
  };

  const pixelRainOptions = {
    background: { color: { value: bg } },
    fpsLimit: 60,
    particles: {
      number: { value: particleCount, density: { enable: true, area: 900 } },
      color: { value: ['#0a84ff', '#4fc3ff', '#8fd3ff', '#b6c2d0'] },
      shape: { type: 'square' },
      opacity: { value: { min: 0.35, max: 0.35 } },
      size: { value: { min: 4, max: 6 } },
      move: { enable: true, speed: 1, random: false, direction: "bottom", straight: true, out_mode: "out", bounce: false },
      links: { enable: false },
      collisions: { enable: false }
    },
    interactivity: { events: { onHover: { enable: false }, onClick: { enable: false } } },
    detectRetina: true
  };

  const options = theme === 'light' ? pixelRainOptions : starfieldOptions;
  tsParticles.load('tsparticles', options).then(() => { particlesLoaded = true; });
}

// Expose reload function to be called by theme switcher
window.reloadParticles = () => {
  (window.tsParticles?.dom() || []).forEach(instance => instance.destroy());
  particlesLoaded = false;
  loadParticles();
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
function initializeExperienceCards() {
  const experienceItems = document.querySelectorAll('.experience-item');
  const enableTilt = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  experienceItems.forEach(item => {
    const inner = item.querySelector('.experience-card-inner');
    if (!inner) return;

    // Card flip on click/enter
    const toggleFlip = () => item.classList.toggle('is-flipped');
    item.addEventListener('click', toggleFlip);
    item.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleFlip();
      }
    });

    // 3D tilt effect on hover (if not reduced motion)
    if (enableTilt) {
      const maxRotate = 10;
      item.addEventListener('mousemove', (e) => {
        if (item.classList.contains('is-flipped')) return;
        const rect = item.getBoundingClientRect();
        const relX = (e.clientX - rect.left) / rect.width;
        const relY = (e.clientY - rect.top) / rect.height;
        const rotY = (relX - 0.5) * (maxRotate * 2);
        const rotX = -(relY - 0.5) * (maxRotate * 2);
        inner.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(12px)`;
      });

      const resetTransform = () => { inner.style.transform = ''; };
      item.addEventListener('mouseleave', resetTransform);
      item.addEventListener('click', resetTransform); // Reset tilt when flipping
    }
  });
}


// ===================================================================
// PROJECT MODAL
// ===================================================================
function initializeProjectModal() {
  const modal = document.getElementById('project-modal');
  const projectCards = document.querySelectorAll('.project-card');
  const closeModalButton = modal?.querySelector('.close-button');
  const modalTitle = document.getElementById('modal-title');
  const modalDescription = document.getElementById('modal-description');
  const modalMedia = document.getElementById('modal-media');

  if (!modal || projectCards.length === 0 || !closeModalButton) return;

  const closeModal = () => {
    modal.style.display = 'none';
    modalMedia.innerHTML = ''; // Clear media to stop video/audio
    const oldActions = document.querySelector('.modal-actions');
    if (oldActions) oldActions.remove();
  };

  projectCards.forEach(card => {
    card.addEventListener('click', () => {
      const title = card.dataset.title || '';
      const description = card.dataset.description || '';
      const clipUrl = card.dataset.clip || '';
      const imageUrl = card.dataset.image || '';
      const figmaUrl = card.dataset.figma || '';
      const pdfUrl = card.getAttribute('data-pdf') || ''; // From publications

      // 1. Clear previous content
      modalMedia.innerHTML = '';
      const oldActions = document.querySelector('.modal-actions');
      if (oldActions) oldActions.remove();

      // 2. Populate new content
      modalTitle.textContent = title;
      modalDescription.innerHTML = description;

      // 3. Set media (Video > Image)
      if (clipUrl) {
        const video = document.createElement('video');
        video.controls = video.autoplay = video.playsInline = true;
        video.preload = 'metadata';
        video.innerHTML = `<source src="${clipUrl}" type="video/mp4">`;
        modalMedia.appendChild(video);
      } else if (imageUrl) {
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = title;
        modalMedia.appendChild(img);
      }

      // 4. Create action buttons if links exist
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

      // 5. Show modal
      modal.style.display = 'block';
    });
  });

  closeModalButton.addEventListener('click', closeModal);
  window.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });
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

  // Timeline-specific animation
  const timelineContainer = document.querySelector('.timeline-container');
  if (timelineContainer) {
    const timelineObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          timelineContainer.classList.add('is-visible');
          document.querySelectorAll('.experience-item').forEach((item, index) => {
            setTimeout(() => item.classList.add('is-visible'), index * 200);
          });
        }
      });
    }, { threshold: 0.2 });
    timelineObserver.observe(timelineContainer);
  }
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
    const dot = document.createElement('button'); // Use button for accessibility
    dot.className = 'dot';
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
    dots.push(dot);
  }

  const updateDots = () => {
    dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === currentIndex);
    });
  };

  const goToSlide = (index) => {
    currentIndex = (index + totalSlides) % totalSlides; // Loop around
    wrapper.style.transform = `translateX(-${currentIndex * 100}%)`;
    updateDots();
  };

  nextButton.addEventListener('click', () => goToSlide(currentIndex + 1));
  prevButton.addEventListener('click', () => goToSlide(currentIndex - 1));

  goToSlide(0); // Initialize first slide
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

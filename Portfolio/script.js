/**
 * PORTFOLIO SCRIPT — Vera Cruz, Michael C.
 * Sections: Loader · Theme · Nav · Hero Canvas · Typewriter
 *           Scroll Progress · Active Nav · Skill Bars
 *           Project Filters · Form Validation · AOS
 */

/* ─── WAIT FOR DOM ────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

  /* ─────────────────────────────────────────
     1. LOADING SCREEN
  ───────────────────────────────────────── */
  const loader = document.getElementById('loader');
  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('hidden');
      document.body.style.overflow = '';
      // Trigger AOS after loader hides
      AOS.refresh();
    }, 800);
  });
  document.body.style.overflow = 'hidden';

  /* ─────────────────────────────────────────
     2. DARK / LIGHT THEME TOGGLE
  ───────────────────────────────────────── */
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon   = document.getElementById('theme-icon');
  const htmlEl      = document.documentElement;

  // Persist across sessions
  const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
  applyTheme(savedTheme);

  themeToggle.addEventListener('click', () => {
    const current = htmlEl.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });

  function applyTheme(theme) {
    htmlEl.setAttribute('data-theme', theme);
    localStorage.setItem('portfolio-theme', theme);
    themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  }

  /* ─────────────────────────────────────────
     3. SCROLL PROGRESS BAR
  ───────────────────────────────────────── */
  const progressBar = document.getElementById('scroll-progress');

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress  = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = `${progress}%`;
  }, { passive: true });

  /* ─────────────────────────────────────────
     4. STICKY NAVBAR
  ───────────────────────────────────────── */
  const navbar = document.getElementById('navbar');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  /* ─────────────────────────────────────────
     5. MOBILE HAMBURGER MENU
  ───────────────────────────────────────── */
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('nav-links');

  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('active', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
  });

  // Close menu on nav link click
  navLinks.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('active');
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target)) {
      navLinks.classList.remove('open');
      hamburger.classList.remove('active');
    }
  });

  /* ─────────────────────────────────────────
     6. ACTIVE NAV LINK ON SCROLL
  ───────────────────────────────────────── */
  const sections  = document.querySelectorAll('section[id]');
  const navItems  = document.querySelectorAll('.nav__link');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navItems.forEach(item => item.classList.remove('active'));
        const active = document.querySelector(`.nav__link[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.35, rootMargin: '-80px 0px -30% 0px' });

  sections.forEach(s => sectionObserver.observe(s));

  /* ─────────────────────────────────────────
     7. HERO CANVAS — ANIMATED DOT GRID
  ───────────────────────────────────────── */
  const canvas = document.getElementById('hero-canvas');
  const ctx    = canvas.getContext('2d');
  let dots     = [];
  let mouse    = { x: -999, y: -999 };
  let animId;

  function resizeCanvas() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    buildDots();
  }

  function buildDots() {
    dots = [];
    const spacing = 40;
    const cols = Math.floor(canvas.width  / spacing) + 1;
    const rows = Math.floor(canvas.height / spacing) + 1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        dots.push({
          x: c * spacing + 20,
          y: r * spacing + 20,
          baseX: c * spacing + 20,
          baseY: r * spacing + 20,
          r: 1.5,
        });
      }
    }
  }

  function getThemeColor(alpha) {
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    return isDark
      ? `rgba(124, 106, 247, ${alpha})`
      : `rgba(100, 90, 200, ${alpha})`;
  }

  function animateDots() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const influence = 100;

    dots.forEach(dot => {
      const dx = mouse.x - dot.baseX;
      const dy = mouse.y - dot.baseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const factor = Math.max(0, 1 - dist / influence);

      // Gentle float animation
      const time = Date.now() / 2000;
      dot.x = dot.baseX + Math.sin(time + dot.baseX * 0.01) * 3;
      dot.y = dot.baseY + Math.cos(time + dot.baseY * 0.01) * 3;

      // Mouse repulsion
      if (dist < influence) {
        dot.x -= (dx / dist) * factor * 20;
        dot.y -= (dy / dist) * factor * 20;
      }

      const alpha = 0.12 + factor * 0.5;
      const radius = dot.r + factor * 2;

      ctx.beginPath();
      ctx.arc(dot.x, dot.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = getThemeColor(alpha);
      ctx.fill();
    });

    animId = requestAnimationFrame(animateDots);
  }

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  canvas.addEventListener('mouseleave', () => {
    mouse.x = -999; mouse.y = -999;
  });

  // Touch support for mobile
  canvas.addEventListener('touchmove', (e) => {
    const rect  = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    mouse.x = touch.clientX - rect.left;
    mouse.y = touch.clientY - rect.top;
  }, { passive: true });

  const ro = new ResizeObserver(resizeCanvas);
  ro.observe(canvas);
  resizeCanvas();
  animateDots();

  /* ─────────────────────────────────────────
     8. TYPEWRITER EFFECT
  ───────────────────────────────────────── */
  const roles = [
    'Full-Stack Developer',
    'UI/UX Enthusiast',
    'Open Source Contributor',
    'Creative Problem Solver',
  ];

  const typeTarget = document.getElementById('typewriter');
  let roleIndex = 0, charIndex = 0, deleting = false;

  function type() {
    const current = roles[roleIndex];
    if (!deleting) {
      typeTarget.textContent = current.slice(0, charIndex + 1);
      charIndex++;
      if (charIndex === current.length) {
        deleting = true;
        setTimeout(type, 1600); // Pause at full word
        return;
      }
    } else {
      typeTarget.textContent = current.slice(0, charIndex - 1);
      charIndex--;
      if (charIndex === 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
      }
    }
    setTimeout(type, deleting ? 60 : 90);
  }
  setTimeout(type, 1200);

  /* ─────────────────────────────────────────
     9. SKILL BAR ANIMATION
  ───────────────────────────────────────── */
  const skillBars = document.querySelectorAll('.skill-bar__fill');

  const barObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.dataset.width, 10);
        entry.target.style.width = `${target}%`;
        barObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  skillBars.forEach(bar => barObserver.observe(bar));

  /* ─────────────────────────────────────────
     10. PROJECT FILTER
  ───────────────────────────────────────── */
  const filterBtns   = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      projectCards.forEach(card => {
        const category = card.dataset.category;
        const show = filter === 'all' || category === filter;

        if (show) {
          card.classList.remove('hidden');
          card.style.animation = 'fadeInCard 0.4s ease forwards';
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  // Add fadeInCard keyframe dynamically
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeInCard {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);

  /* ─────────────────────────────────────────
     11. CONTACT FORM VALIDATION
  ───────────────────────────────────────── */
  const form       = document.getElementById('contact-form');
  const btnText    = document.getElementById('btn-text');
  const btnLoading = document.getElementById('btn-loading');
  const formSuccess = document.getElementById('form-success');

  function validateField(id, message, testFn) {
    const field = document.getElementById(id);
    const error = document.getElementById(`${id}-error`);
    if (!testFn(field.value.trim())) {
      field.classList.add('error');
      error.textContent = message;
      return false;
    }
    field.classList.remove('error');
    error.textContent = '';
    return true;
  }

  // Live validation on blur
  const fields = ['name', 'email', 'subject', 'message'];
  fields.forEach(id => {
    document.getElementById(id)?.addEventListener('blur', () => validateForm(true));
    document.getElementById(id)?.addEventListener('input', () => {
      document.getElementById(id).classList.remove('error');
      document.getElementById(`${id}-error`).textContent = '';
    });
  });

  function validateForm(silent = false) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const v1 = validateField('name',    'Please enter your name.',          v => v.length >= 2);
    const v2 = validateField('email',   'Please enter a valid email.',      v => emailRegex.test(v));
    const v3 = validateField('subject', 'Please enter a subject.',          v => v.length >= 3);
    const v4 = validateField('message', 'Please write at least 10 characters.', v => v.length >= 10);
    return v1 && v2 && v3 && v4;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Simulate async send
    btnText.style.display    = 'none';
    btnLoading.style.display = 'inline-flex';
    form.querySelector('#submit-btn').disabled = true;

    await new Promise(res => setTimeout(res, 1800));

    btnText.style.display    = 'inline-flex';
    btnLoading.style.display = 'none';
    form.querySelector('#submit-btn').disabled = false;
    formSuccess.style.display = 'flex';
    form.reset();

    setTimeout(() => { formSuccess.style.display = 'none'; }, 5000);
  });

  /* ─────────────────────────────────────────
     12. AOS INIT
  ───────────────────────────────────────── */
  AOS.init({
    duration: 700,
    once: true,
    offset: 60,
    easing: 'ease-out-cubic',
  });

  /* ─────────────────────────────────────────
     13. SMOOTH SCROLL for anchor links
         (Polyfill for browsers without native support)
  ───────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ─────────────────────────────────────────
     14. KEYBOARD FOCUS ACCESSIBILITY
  ───────────────────────────────────────── */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      navLinks.classList.remove('open');
      hamburger.classList.remove('active');
    }
  });

  console.log('%c⚡ Portfolio loaded — Alex Rivera', 'color:#f5a623;font-weight:bold;font-size:14px;font-family:JetBrains Mono,monospace;');
});

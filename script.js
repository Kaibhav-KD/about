/* ============================================================
   UPFIN — script.js
   Features:
   - Animated particle canvas (network dots)
   - Custom cursor glow
   - Mouse parallax (hero float cards)
   - Scroll reveal (IntersectionObserver)
   - Animated counters
   - Navbar scroll state
   - Hero headline word reveal
   - Marquee duplication (seamless loop)
   - Sticky hover cursor enlarge on interactive elements
============================================================ */

(function () {
  'use strict';

  /* ——————————————————————————————————————
     1. CURSOR GLOW
  —————————————————————————————————————— */
  const cursor = document.getElementById('cursorGlow');
  let mouseX = 0, mouseY = 0;
  let curX = 0, curY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  const interactiveEls = 'a, button, .btn, .mission-card, .step-card, .team-card, .bento-card, .vision-item, .tl-content, .testi-card, .stat-block, .nav-cta';
  document.querySelectorAll(interactiveEls).forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
  });

  function animateCursor() {
    curX += (mouseX - curX) * 0.18;
    curY += (mouseY - curY) * 0.18;
    if (cursor) {
      cursor.style.left = curX + 'px';
      cursor.style.top  = curY + 'px';
    }
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  /* ——————————————————————————————————————
     2. PARTICLE CANVAS
  —————————————————————————————————————— */
  const canvas  = document.getElementById('particleCanvas');
  const ctx     = canvas.getContext('2d');
  let W, H;
  let particles = [];
  const PARTICLE_COUNT = 35;
  const CONNECT_DIST   = 90;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', () => { resize(); });

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.r  = Math.random() * 2 + 0.8;
      this.alpha = Math.random() * 0.5 + 0.2;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < -10) this.x = W + 10;
      if (this.x > W + 10) this.x = -10;
      if (this.y < -10) this.y = H + 10;
      if (this.y > H + 10) this.y = -10;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(139,92,246,${this.alpha})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

  function drawParticles() {
    ctx.clearRect(0, 0, W, H);

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECT_DIST) {
          const opacity = (1 - dist / CONNECT_DIST) * 0.25;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(139,92,246,${opacity})`;
          ctx.lineWidth   = 0.7;
          ctx.stroke();
        }
      }
    }

    // Draw & update particles
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(drawParticles);
  }
  drawParticles();

  /* ——————————————————————————————————————
     3. MOUSE PARALLAX (FLOAT CARDS)
  —————————————————————————————————————— */
  const floatCards = document.querySelectorAll('.float-card');
  let rafPending = false;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(() => {
        // Parallax cards
        const cx = window.innerWidth  / 2;
        const cy = window.innerHeight / 2;
        const dx = (e.clientX - cx) / cx;
        const dy = (e.clientY - cy) / cy;
        floatCards.forEach(card => {
          const depth = parseFloat(card.dataset.depth) || 0.2;
          const tx = dx * depth * 28;
          const ty = dy * depth * 20;
          card.style.transform = card.classList.contains('fc-3')
            ? `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px))`
            : `translate(${tx}px, ${ty}px)`;
        });
        rafPending = false;
      });
    }
  });

  /* ——————————————————————————————————————
     4. NAVBAR SCROLL STATE
  —————————————————————————————————————— */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) navbar.classList.add('scrolled');
    else                      navbar.classList.remove('scrolled');
  }, { passive: true });

  /* ——————————————————————————————————————
     4b. HAMBURGER MENU
  —————————————————————————————————————— */
  const hamburger  = document.getElementById('hamburger');
  const navLinks   = document.getElementById('navLinks');
  const navOverlay = document.getElementById('navOverlay');

  function openMenu() {
    hamburger.classList.add('open');
    navLinks.classList.add('open');
    navOverlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    navOverlay.classList.remove('visible');
    document.body.style.overflow = '';
  }

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.contains('open') ? closeMenu() : openMenu();
    });
  }
  if (navOverlay) navOverlay.addEventListener('click', closeMenu);

  // Close menu on any nav link click
  document.querySelectorAll('.nav-mobile-link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });


  /* ——————————————————————————————————————
     5. HERO HEADLINE WORD REVEAL
  —————————————————————————————————————— */
  const words = document.querySelectorAll('.reveal-word');
  words.forEach((word, i) => {
    setTimeout(() => word.classList.add('shown'), 300 + i * 180);
  });

  /* ——————————————————————————————————————
     6. SCROLL REVEAL (IntersectionObserver)
  —————————————————————————————————————— */
  const revealEls = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.dataset.delay || '0', 10);
        setTimeout(() => entry.target.classList.add('revealed'), delay);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));

  /* ——————————————————————————————————————
     7. ANIMATED COUNTERS
  —————————————————————————————————————— */
  const countEls = document.querySelectorAll('.count-num');

  function animateCounter(el) {
    const target   = parseFloat(el.dataset.target);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const suffix   = el.dataset.suffix || '';
    const duration = 2000;
    const start    = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current  = eased * target;
      el.textContent = current.toFixed(decimals) + (progress === 1 ? suffix : '');
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  countEls.forEach(el => counterObserver.observe(el));

  /* ——————————————————————————————————————
     8. MARQUEE DUPLICATION (seamless)
  —————————————————————————————————————— */
  const marqueeTrack = document.getElementById('marqueeTrack');
  if (marqueeTrack) {
    // Duplicate children for seamless scroll
    const children = Array.from(marqueeTrack.children);
    children.forEach(child => {
      const clone = child.cloneNode(true);
      marqueeTrack.appendChild(clone);
    });
  }

  /* ——————————————————————————————————————
     9. GLASS BLUR MORPH TRANSITIONS
        (add class as sections approach)
  —————————————————————————————————————— */
  const sections = document.querySelectorAll('section');
  const morphObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.filter  = 'blur(0px)';
      }
    });
  }, { threshold: 0.05 });

  sections.forEach(sec => {
    sec.style.opacity    = '1';
    sec.style.transition = 'opacity 0.6s ease, filter 0.6s ease';
    morphObserver.observe(sec);
  });

  /* ——————————————————————————————————————
     10. BENTO CARDS — INNER GLOW ON HOVER
  —————————————————————————————————————— */
  document.querySelectorAll('.bento-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x    = e.clientX - rect.left;
      const y    = e.clientY - rect.top;
      card.style.background = `
        radial-gradient(300px circle at ${x}px ${y}px,
          rgba(139,92,246,0.07), transparent 60%),
        rgba(13,38,64,0.55)
      `;
    });
    card.addEventListener('mouseleave', () => {
      card.style.background = '';
    });
  });

  /* ——————————————————————————————————————
     11. MISSION CARDS — TILT ON HOVER
  —————————————————————————————————————— */
  document.querySelectorAll('.mission-card, .step-card, .team-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect   = card.getBoundingClientRect();
      const cx     = rect.left + rect.width  / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = (e.clientX - cx) / (rect.width  / 2);
      const dy     = (e.clientY - cy) / (rect.height / 2);
      const rotX   = -dy * 6;
      const rotY   =  dx * 6;
      card.style.transform = `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-8px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

})();



// Seawind Solution - script.js

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Page loader
const pageLoader = document.getElementById("pageLoader");
window.addEventListener("load", () => {
  document.body.classList.add("loaded");
  if (pageLoader) {
    setTimeout(() => pageLoader.classList.add("hidden"), prefersReducedMotion ? 0 : 600);
  }

  // Transform all buttons into premium liquid gooey buttons dynamically!
  const targetButtons = document.querySelectorAll(
    ".btn-primary, .btn-outline, .btn-ghost, .btn-nav"
  );
  targetButtons.forEach(btn => {
    if (btn.querySelector(".liquid-bg") || btn.classList.contains("btn-liquid")) {
      return;
    }

    const btnText = btn.innerHTML;
    btn.innerHTML = `
      <span>${btnText}</span>
      <div class="liquid-bg">
        <div class="btn-base"></div>
        <span class="bubble"></span>
        <span class="bubble"></span>
        <span class="bubble"></span>
        <span class="bubble"></span>
      </div>
    `;

    btn.classList.add("btn-liquid");
    if (btn.classList.contains("btn-primary") || btn.classList.contains("btn-nav")) {
      btn.classList.add("btn-liquid--primary");
    } else {
      btn.classList.add("btn-liquid--outline");
    }
  });
});

// Scroll progress
const scrollProgress = document.getElementById("scrollProgress");
window.addEventListener("scroll", () => {
  if (!scrollProgress) return;
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  scrollProgress.style.width = docHeight > 0 ? `${(scrollTop / docHeight) * 100}%` : "0%";
}, { passive: true });

// Cursor glow
const cursorGlow = document.getElementById("cursorGlow");
let mouseX = 0, mouseY = 0, glowX = 0, glowY = 0;

document.addEventListener("mousemove", e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

function animateGlow() {
  if (cursorGlow && !prefersReducedMotion) {
    glowX += (mouseX - glowX) * 0.12;
    glowY += (mouseY - glowY) * 0.12;
    cursorGlow.style.left = glowX + "px";
    cursorGlow.style.top = glowY + "px";
  } else if (cursorGlow) {
    cursorGlow.style.left = mouseX + "px";
    cursorGlow.style.top = mouseY + "px";
  }
  requestAnimationFrame(animateGlow);
}
animateGlow();

// Nav scroll
const nav = document.getElementById("nav");
window.addEventListener("scroll", () => {
  nav.classList.toggle("scrolled", window.scrollY > 50);
}, { passive: true });

// Reveal on scroll (staggered)
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const delay = parseInt(entry.target.dataset.delay || 0, 10);
      setTimeout(() => entry.target.classList.add("visible"), delay);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.04, rootMargin: "0px 0px -10px 0px" });

document.querySelectorAll(".reveal, .stagger-children").forEach(el => revealObserver.observe(el));

// Add stagger to grids
document.querySelectorAll(".services-gallery, .awards-grid, .plans-grid, .tech-panels").forEach(el => {
  if (!el.classList.contains("stagger-children")) {
    el.classList.add("stagger-children");
    revealObserver.observe(el);
  }
});

// Counter animation (eased)
function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }

function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = prefersReducedMotion ? 0 : 2200;
  const start = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    el.textContent = Math.floor(easeOutQuart(progress) * target);
    if (progress < 1) requestAnimationFrame(tick);
    else el.textContent = target;
  }
  if (duration === 0) el.textContent = target;
  else requestAnimationFrame(tick);
}

const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll(".stat-num").forEach(animateCounter);
      statObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll(".why-cards").forEach(el => statObserver.observe(el));

// Particle canvas
const canvas = document.getElementById("particleCanvas");
if (canvas) {
  const ctx = canvas.getContext("2d");
  let particles = [];

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.speedY = (Math.random() - 0.5) * 0.4;
      this.opacity = Math.random() * 0.5 + 0.1;
      this.color = Math.random() > 0.5 ? "0,85,204" : "0,200,255";
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color},${this.opacity})`;
      ctx.fill();
    }
  }

  const count = prefersReducedMotion ? 40 : 120;
  for (let i = 0; i < count; i++) particles.push(new Particle());

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    if (!prefersReducedMotion) {
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach(p2 => {
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(0,85,204,${0.1 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
    }
    requestAnimationFrame(animateParticles);
  }
  animateParticles();
}

// Parallax orbs on scroll
if (!prefersReducedMotion) {
  const orbs = document.querySelectorAll(".orb");
  window.addEventListener("scroll", () => {
    const y = window.scrollY * 0.15;
    orbs.forEach((orb, i) => {
      orb.style.transform = `translateY(${y * (i + 1) * 0.3}px)`;
    });
  }, { passive: true });
}

// 3D tilt on cards
document.querySelectorAll(".tilt-card, .tech-card").forEach(card => {
  if (prefersReducedMotion) return;
  card.addEventListener("mousemove", e => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(800px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateY(-8px)`;
    
    // Parallax effect on the logo inside tech-card
    const logo = card.querySelector('.tech-logo');
    if (logo) {
      logo.style.transform = `translateZ(30px) scale(1.1) translateX(${x * 10}px) translateY(${y * 10}px)`;
    }
  });
  card.addEventListener("mouseleave", () => {
    card.style.transform = "";
    const logo = card.querySelector('.tech-logo');
    if (logo) logo.style.transform = "";
  });
});

// Tech tabs
const tabBtns = document.querySelectorAll(".tab-btn");
const tabPanels = document.querySelectorAll(".tech-panel");
tabBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    tabBtns.forEach(b => b.classList.remove("active"));
    tabPanels.forEach(p => {
      p.classList.remove("active");
      p.querySelectorAll(".tech-card").forEach(c => {
        c.style.animation = "none";
        c.offsetHeight;
        c.style.animation = "";
      });
    });
    btn.classList.add("active");
    const panel = document.getElementById("tab-" + btn.dataset.tab);
    panel.classList.add("active");
  });
});

// Spotlight tracking on plan feature items
document.querySelectorAll(".plan-features li").forEach(li => {
  if (prefersReducedMotion) return;
  li.addEventListener("mousemove", e => {
    const rect = li.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    li.style.setProperty("--mouse-x", `${x}px`);
    li.style.setProperty("--mouse-y", `${y}px`);
  });
});

// Services Filter
const filterBtns = document.querySelectorAll(".filter-btn");
const galleryItems = document.querySelectorAll(".gallery-item");
filterBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    filterBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const filter = btn.dataset.filter;
    galleryItems.forEach(item => {
      if (item.dataset.category === filter) {
        item.style.display = "flex";
        item.style.animation = "none";
        item.offsetHeight;
        item.style.animation = "scaleIn 0.45s var(--ease-out-expo) forwards";
      } else {
        item.style.display = "none";
      }
    });
  });
});

// Hamburger menu
const hamburger = document.getElementById("hamburger");
const navLinks = document.querySelector(".nav-links");
hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("active");
  const open = hamburger.classList.contains("active");
  navLinks.style.display = open ? "flex" : "";
  if (open) {
    navLinks.style.flexDirection = "column";
    navLinks.style.position = "absolute";
    navLinks.style.top = "70px";
    navLinks.style.left = "0";
    navLinks.style.right = "0";
    navLinks.style.background = "rgba(4,4,15,0.97)";
    navLinks.style.padding = "24px";
    navLinks.style.borderBottom = "1px solid rgba(255,255,255,0.07)";
    navLinks.style.backdropFilter = "blur(20px)";
    navLinks.style.gap = "20px";
    navLinks.style.animation = "panelIn 0.35s var(--ease-out-expo)";
  }
});

// CTA Form Orbs Tracking
const ctaSection = document.querySelector('.cta-section');
const ctaOrb1 = document.querySelector('.cta-orb-1');
const ctaOrb2 = document.querySelector('.cta-orb-2');

if (ctaSection && ctaOrb1 && ctaOrb2 && !prefersReducedMotion) {
  ctaSection.addEventListener('mousemove', e => {
    const rect = ctaSection.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    ctaOrb1.style.setProperty('--orb-x', `${x * 0.2}px`);
    ctaOrb1.style.setProperty('--orb-y', `${y * 0.2}px`);
    
    ctaOrb2.style.setProperty('--orb-x', `${-x * 0.15}px`);
    ctaOrb2.style.setProperty('--orb-y', `${-y * 0.15}px`);
  });
  
  ctaSection.addEventListener('mouseleave', () => {
    ctaOrb1.style.setProperty('--orb-x', `0px`);
    ctaOrb1.style.setProperty('--orb-y', `0px`);
    ctaOrb2.style.setProperty('--orb-x', `0px`);
    ctaOrb2.style.setProperty('--orb-y', `0px`);
  });
}

// Why Choose Section Orbs Tracking
const whySection = document.querySelector('.why-choose-inner');
const whyOrb1 = document.querySelector('.why-orb-1');
const whyOrb2 = document.querySelector('.why-orb-2');

if (whySection && whyOrb1 && whyOrb2 && !prefersReducedMotion) {
  whySection.addEventListener('mousemove', e => {
    const rect = whySection.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    whyOrb1.style.setProperty('--orb-x', `${x * 0.2}px`);
    whyOrb1.style.setProperty('--orb-y', `${y * 0.2}px`);
    
    whyOrb2.style.setProperty('--orb-x', `${-x * 0.15}px`);
    whyOrb2.style.setProperty('--orb-y', `${-y * 0.15}px`);
  });
  
  whySection.addEventListener('mouseleave', () => {
    whyOrb1.style.setProperty('--orb-x', `0px`);
    whyOrb1.style.setProperty('--orb-y', `0px`);
    whyOrb2.style.setProperty('--orb-x', `0px`);
    whyOrb2.style.setProperty('--orb-y', `0px`);
  });
}

// Form submit with Text Animation
document.getElementById("ctaForm").addEventListener("submit", e => {
  e.preventDefault();
  const btn = document.getElementById("ctaSubmitBtn");
  if (!btn || btn.classList.contains("is-success")) return;

  btn.classList.add("is-success");
  
  setTimeout(() => {
    btn.classList.remove("is-success");
  }, 3500);
});

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener("click", e => {
    const href = link.getAttribute("href");
    if (href === "#") return;
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
    if (window.innerWidth < 768) {
      navLinks.style.display = "";
      hamburger.classList.remove("active");
    }
  });
});

// Hero Slider
const heroSlider = document.getElementById("heroMainSlider");
if (heroSlider) {
  const heroSlides = heroSlider.querySelectorAll(".hero-slide");
  const heroDotsContainer = document.getElementById("heroDots");
  let currentHeroSlide = 0;
  let heroAutoplay;
  const totalHeroSlides = heroSlides.length;

  for (let i = 0; i < totalHeroSlides; i++) {
    const dot = document.createElement("button");
    dot.className = "hero-dot" + (i === 0 ? " active" : "");
    dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
    dot.addEventListener("click", () => goHeroSlide(i));
    heroDotsContainer.appendChild(dot);
  }

  function resetSlideAnimations(slide) {
    const content = slide.querySelector(".hero-slide-content");
    const right = slide.querySelector(".hero-slide-right");
    if (content) {
      content.querySelectorAll("*").forEach(el => {
        el.style.animation = "none";
        el.offsetHeight;
        el.style.animation = "";
      });
    }
    if (right) {
      right.style.transition = "none";
      right.offsetHeight;
      right.style.transition = "";
    }
  }

  function goHeroSlide(index) {
    heroSlides[currentHeroSlide].classList.remove("active");
    resetSlideAnimations(heroSlides[currentHeroSlide]);

    currentHeroSlide = (index + totalHeroSlides) % totalHeroSlides;
    heroSlides[currentHeroSlide].classList.add("active");
    resetSlideAnimations(heroSlides[currentHeroSlide]);

    heroSlider.style.transform = `translateX(-${currentHeroSlide * 100}%)`;
    document.querySelectorAll(".hero-dot").forEach((d, i) => {
      d.classList.toggle("active", i === currentHeroSlide);
    });
  }

  function startAutoplay() {
    clearInterval(heroAutoplay);
    if (!prefersReducedMotion) {
      heroAutoplay = setInterval(() => goHeroSlide(currentHeroSlide + 1), 6000);
    }
  }

  document.getElementById("heroPrev").addEventListener("click", () => {
    goHeroSlide(currentHeroSlide - 1);
    startAutoplay();
  });
  document.getElementById("heroNext").addEventListener("click", () => {
    goHeroSlide(currentHeroSlide + 1);
    startAutoplay();
  });

  heroSlider.parentElement.addEventListener("mouseenter", () => clearInterval(heroAutoplay));
  heroSlider.parentElement.addEventListener("mouseleave", startAutoplay);
  startAutoplay();
}

document.querySelectorAll(".reveal-left, .reveal-right").forEach(el => revealObserver.observe(el));

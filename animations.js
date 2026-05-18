// Creative animations — Seawind Solution
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // Cursor ring
  const ring = document.getElementById("cursorRing");
  let rx = 0, ry = 0, rgx = 0, rgy = 0;
  document.addEventListener("mousemove", e => { rx = e.clientX; ry = e.clientY; });
  function moveRing() {
    if (ring) {
      rgx += (rx - rgx) * 0.18;
      rgy += (ry - rgy) * 0.18;
      ring.style.left = rgx + "px";
      ring.style.top = rgy + "px";
    }
    requestAnimationFrame(moveRing);
  }
  moveRing();

  document.querySelectorAll("a, button, .tilt-card, .service-card").forEach(el => {
    el.addEventListener("mouseenter", () => ring?.classList.add("hovering"));
    el.addEventListener("mouseleave", () => ring?.classList.remove("hovering"));
  });

  // Magnetic buttons
  document.querySelectorAll(".btn-primary, .btn-nav, .btn-outline").forEach(btn => {
    btn.addEventListener("mousemove", e => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.2;
      const y = (e.clientY - r.top - r.height / 2) * 0.2;
      btn.style.transform = `translate(${x}px, ${y}px)`;
    });
    btn.addEventListener("mouseleave", () => { btn.style.transform = ""; });
  });

  // Ripple on click
  document.querySelectorAll(".btn-primary, .btn-nav, .btn-outline").forEach(btn => {
    btn.classList.add("ripple-host");
    btn.addEventListener("click", function (e) {
      const ripple = document.createElement("span");
      ripple.className = "ripple";
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = size + "px";
      ripple.style.left = e.clientX - rect.left - size / 2 + "px";
      ripple.style.top = e.clientY - rect.top - size / 2 + "px";
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });

  // Split heading reveal (skip if h2 has styled child spans like gradient-text)
  document.querySelectorAll(".section-header h2").forEach(h2 => {
    if (h2.querySelector(".split-char, .gradient-text, span, br")) return;
    h2.classList.add("split-heading");
    const text = h2.textContent;
    h2.textContent = "";
    let i = 0;
    text.split(" ").forEach((word, wi) => {
      const line = document.createElement("span");
      line.className = "split-line";
      word.split("").forEach(ch => {
        const span = document.createElement("span");
        span.className = "split-char";
        span.textContent = ch;
        span.style.setProperty("--i", i++);
        line.appendChild(span);
      });
      h2.appendChild(line);
      if (wi < text.split(" ").length - 1) {
        const space = document.createElement("span");
        space.className = "split-char";
        space.textContent = "\u00a0";
        space.style.setProperty("--i", i++);
        h2.appendChild(space);
      }
    });
  });

  const animObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      animObs.unobserve(entry.target);
    });
  }, { threshold: 0.04 });

  document.querySelectorAll(".split-heading, .clip-reveal, .blur-in").forEach(el => animObs.observe(el));

  document.querySelectorAll(".service-card, .award-card, .tech-card, .testimonial-card").forEach((el, i) => {
    el.classList.add("blur-in");
    el.style.transitionDelay = (i % 6) * 0.06 + "s";
    animObs.observe(el);
  });

  document.querySelectorAll(".section-header").forEach(h => animObs.observe(h));

  // Parallax on scroll
  const parallaxEls = document.querySelectorAll("[data-parallax], .hero-img-frame, .award-card");
  parallaxEls.forEach(el => el.setAttribute("data-parallax", el.getAttribute("data-parallax") || "0.08"));

  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    document.querySelectorAll("[data-parallax]").forEach(el => {
      const speed = parseFloat(el.dataset.parallax) || 0.05;
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.style.transform = `translateY(${y * speed * 0.15}px)`;
      }
    });
  }, { passive: true });

  // Tech tab sliding indicator
  const techTabs = document.querySelector(".tech-tabs");
  if (techTabs) {
    const indicator = document.createElement("div");
    indicator.className = "tab-indicator";
    techTabs.style.position = "relative";
    techTabs.insertBefore(indicator, techTabs.firstChild);
    function moveIndicator() {
      const active = techTabs.querySelector(".tab-btn.active");
      if (!active) return;
      indicator.style.left = active.offsetLeft + "px";
      indicator.style.width = active.offsetWidth + "px";
      indicator.style.height = active.offsetHeight + "px";
      indicator.style.top = active.offsetTop + "px";
    }
    moveIndicator();
    techTabs.querySelectorAll(".tab-btn").forEach(btn => btn.addEventListener("click", () => setTimeout(moveIndicator, 10)));
    window.addEventListener("resize", moveIndicator);
  }
})();

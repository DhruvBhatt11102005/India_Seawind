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

  // Magnetic links and social icons
  document.querySelectorAll(".nav-links a:not(.btn-nav), .social-links a").forEach(link => {
    link.addEventListener("mousemove", e => {
      const r = link.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.3;
      const y = (e.clientY - r.top - r.height / 2) * 0.3;
      link.style.transform = `translate(${x}px, ${y}px)`;
    });
    link.addEventListener("mouseleave", () => {
      link.style.transform = "";
    });
  });



  // Split heading reveal (recursive, supports spans, gradient-text, etc.)
  function splitTextElement(element, state = { index: 0 }) {
    if (element.classList.contains("gradient-text")) {
      element.classList.add("split-char");
      element.style.setProperty("--i", state.index++);
      element.style.display = "inline-block";
      return;
    }

    const nodes = Array.from(element.childNodes);
    element.innerHTML = "";
    
    nodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent;
        const fragment = document.createDocumentFragment();
        
        const words = text.split(" ");
        words.forEach((word, wi) => {
          if (word.length > 0) {
            const wordSpan = document.createElement("span");
            wordSpan.className = "split-line";
            wordSpan.style.display = "inline-block";
            
            word.split("").forEach(ch => {
              const chSpan = document.createElement("span");
              chSpan.className = "split-char";
              chSpan.textContent = ch;
              chSpan.style.setProperty("--i", state.index++);
              wordSpan.appendChild(chSpan);
            });
            fragment.appendChild(wordSpan);
          }
          
          if (wi < words.length - 1) {
            const spaceSpan = document.createElement("span");
            spaceSpan.className = "split-char";
            spaceSpan.textContent = "\u00a0";
            spaceSpan.style.setProperty("--i", state.index++);
            fragment.appendChild(spaceSpan);
          }
        });
        element.appendChild(fragment);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        splitTextElement(node, state);
        element.appendChild(node);
      }
    });
  }

  document.querySelectorAll(".section-header h2").forEach(h2 => {
    if (h2.querySelector(".split-char")) return;
    h2.classList.add("split-heading");
    splitTextElement(h2);
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

  // Inject spotlight glows for card hovers
  document.querySelectorAll(".tilt-card, .service-card, .plan-card, .pricing-card, .award-card").forEach(card => {
    if (card.querySelector(".spotlight-wrap")) return;
    const wrap = document.createElement("div");
    wrap.className = "spotlight-wrap";
    wrap.style.position = "absolute";
    wrap.style.inset = "0";
    wrap.style.overflow = "hidden";
    wrap.style.borderRadius = "inherit";
    wrap.style.zIndex = "0";
    wrap.style.pointerEvents = "none";
    
    const glow = document.createElement("span");
    glow.className = "spotlight-glow";
    wrap.appendChild(glow);
    card.appendChild(wrap);
    
    card.addEventListener("mousemove", e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      glow.style.left = `${x}px`;
      glow.style.top = `${y}px`;
    });
  });
})();

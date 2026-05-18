/**
 * Seawind Background — Animated Ocean Canvas + Video Controller
 * Deep ocean waves + wind spray particles + bioluminescent glow
 * Tuned to the site's dark navy palette (#03060f, #0055cc, #00c8ff)
 */

/* ══════════════════════════════════════════
   VIDEO BACKGROUND CONTROLLER
   - Fades in video smoothly once it can play
   - Hides canvas animation when video is active
   - Falls back to canvas if video fails / missing
══════════════════════════════════════════ */
(function () {
  'use strict';

  const video   = document.getElementById('bg-video');
  const canvas  = document.getElementById('seawind-canvas');
  const body    = document.body;

  if (!video) return;

  function onVideoReady() {
    video.classList.add('loaded');          // CSS fade-in
    body.classList.add('video-playing');    // hides canvas via CSS
  }

  function onVideoError() {
    // Video missing or failed — canvas stays visible as fallback
    video.closest('.video-bg-wrap').style.display = 'none';
    if (canvas) canvas.style.opacity = '0.92';
    console.info('[SeawindBG] Video not found — using canvas fallback.');
  }

  if (video.readyState >= 2) {
    // Already buffered enough to play
    onVideoReady();
  } else {
    video.addEventListener('canplay', onVideoReady, { once: true });
    video.addEventListener('error',    onVideoError, { once: true });

    // If video takes >15s to start, fall back to canvas
    const fallbackTimer = setTimeout(() => {
      if (!body.classList.contains('video-playing')) onVideoError();
    }, 15000);

    video.addEventListener('canplay', () => clearTimeout(fallbackTimer), { once: true });
  }

  // Pause video when tab hidden (save resources), resume on return
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) video.pause();
    else video.play().catch(() => {});
  });
})();

(function () {
  'use strict';

  const canvas = document.getElementById('seawind-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, dpr;

  /* ── Resize ── */
  function resize() {
    dpr = window.devicePixelRatio || 1;
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    ctx.scale(dpr, dpr);
  }
  window.addEventListener('resize', resize);
  resize();

  /* ── Time ── */
  let t = 0;

  /* ══════════════════════════════════════════
     WAVE LAYERS
  ══════════════════════════════════════════ */
  const waves = [
    // { yRatio, amplitude, speed, wavelength, color, alpha }
    { yRatio: 0.82, amp: 28,  speed: 0.0007, wl: 0.012,  color: '#001855', alpha: 1.0  },
    { yRatio: 0.80, amp: 22,  speed: 0.0009, wl: 0.0145, color: '#002c7a', alpha: 0.85 },
    { yRatio: 0.77, amp: 18,  speed: 0.0012, wl: 0.016,  color: '#003fa3', alpha: 0.75 },
    { yRatio: 0.74, amp: 14,  speed: 0.0016, wl: 0.019,  color: '#0055cc', alpha: 0.60 },
    { yRatio: 0.71, amp: 10,  speed: 0.0021, wl: 0.022,  color: '#1a7fff', alpha: 0.40 },
    { yRatio: 0.68, amp:  7,  speed: 0.0028, wl: 0.026,  color: '#00c8ff', alpha: 0.22 },
    { yRatio: 0.65, amp:  5,  speed: 0.0035, wl: 0.032,  color: '#40e0ff', alpha: 0.12 },
  ];

  function getWaveY(wave, x, time) {
    return wave.yRatio * H
      + Math.sin(x * wave.wl + time * wave.speed * 60000) * wave.amp
      + Math.sin(x * wave.wl * 1.7 + time * wave.speed * 60000 * 0.8 + 1.3) * wave.amp * 0.4;
  }

  function drawWaves() {
    // Deep ocean gradient fill (below all waves)
    const oceanGrad = ctx.createLinearGradient(0, H * 0.60, 0, H);
    oceanGrad.addColorStop(0,   'rgba(0,18,60,0.0)');
    oceanGrad.addColorStop(0.2, 'rgba(0,18,60,0.7)');
    oceanGrad.addColorStop(1,   'rgba(0,8,30,1.0)');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, W, H);

    waves.forEach(wave => {
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (let x = 0; x <= W; x += 3) {
        const y = getWaveY(wave, x, t);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.lineTo(W, H);
      ctx.lineTo(0, H);
      ctx.closePath();

      // Wave face gradient
      const waveGrad = ctx.createLinearGradient(0, wave.yRatio * H - wave.amp, 0, H);
      waveGrad.addColorStop(0,   hexToRgba(wave.color, wave.alpha * 0.6));
      waveGrad.addColorStop(0.4, hexToRgba(wave.color, wave.alpha));
      waveGrad.addColorStop(1,   hexToRgba(wave.color, wave.alpha * 1.2 > 1 ? 1 : wave.alpha * 1.2));
      ctx.fillStyle = waveGrad;
      ctx.fill();
    });
  }

  /* ══════════════════════════════════════════
     FOAM CRESTS (white shimmer on wave tops)
  ══════════════════════════════════════════ */
  function drawFoam() {
    const topWaves = waves.slice(3);
    topWaves.forEach(wave => {
      ctx.beginPath();
      for (let x = 0; x <= W; x += 4) {
        const y = getWaveY(wave, x, t);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(180,230,255,${wave.alpha * 0.35})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  }

  /* ══════════════════════════════════════════
     BIOLUMINESCENT GLOW BLOBS
  ══════════════════════════════════════════ */
  const glowBlobs = Array.from({ length: 6 }, (_, i) => ({
    x: Math.random() * W,
    y: H * (0.70 + Math.random() * 0.28),
    r: 60 + Math.random() * 100,
    phase: Math.random() * Math.PI * 2,
    speed: 0.0003 + Math.random() * 0.0004,
    color: i % 2 === 0 ? '#00c8ff' : '#1a7fff',
  }));

  function drawGlow() {
    glowBlobs.forEach(b => {
      const pulse = 0.5 + 0.5 * Math.sin(t * b.speed * 60000 + b.phase);
      const alpha = 0.04 + pulse * 0.06;
      const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r * (0.8 + pulse * 0.5));
      g.addColorStop(0,   hexToRgba(b.color, alpha));
      g.addColorStop(0.5, hexToRgba(b.color, alpha * 0.4));
      g.addColorStop(1,   'transparent');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r * (0.8 + pulse * 0.5), 0, Math.PI * 2);
      ctx.fill();

      // Slowly drift blobs horizontally with wave
      b.x += Math.sin(t * 0.00015 + b.phase) * 0.15;
      if (b.x < -b.r) b.x = W + b.r;
      if (b.x > W + b.r) b.x = -b.r;
    });
  }

  /* ══════════════════════════════════════════
     WIND PARTICLES (spray & mist)
  ══════════════════════════════════════════ */
  const PARTICLE_COUNT = 220;
  const particles = [];

  function spawnParticle(p) {
    const waveIdx = Math.floor(Math.random() * 3) + 3; // top wave layers
    const wave = waves[waveIdx];
    const x = Math.random() * W;
    const waveY = getWaveY(wave, x, t);
    p.x     = x;
    p.y     = waveY - Math.random() * 12;
    p.vx    = 1.2 + Math.random() * 2.8;       // wind blows right
    p.vy    = -(0.2 + Math.random() * 1.2);    // initially upward
    p.alpha = 0.5 + Math.random() * 0.5;
    p.fade  = 0.008 + Math.random() * 0.014;
    p.size  = 0.8 + Math.random() * 2.2;
    p.color = Math.random() > 0.4 ? '#b0e8ff' : '#ffffff';
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const p = {};
    spawnParticle(p);
    // Stagger so they don't all appear at once
    p.alpha *= Math.random();
    particles.push(p);
  }

  function drawParticles() {
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = hexToRgba(p.color, p.alpha);
      ctx.fill();

      // Motion trail
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - p.vx * 3, p.y - p.vy * 2);
      ctx.strokeStyle = hexToRgba(p.color, p.alpha * 0.25);
      ctx.lineWidth = p.size * 0.6;
      ctx.stroke();

      // Physics
      p.x  += p.vx;
      p.y  += p.vy;
      p.vy += 0.018; // gravity
      p.vx *= 0.997; // slight drag
      p.alpha -= p.fade;

      if (p.alpha <= 0 || p.x > W + 20 || p.y > H) {
        spawnParticle(p);
      }
    });
  }

  /* ══════════════════════════════════════════
     HORIZON HAZE  (atmospheric depth)
  ══════════════════════════════════════════ */
  function drawHorizon() {
    const horizonY = H * 0.62;
    const hazeGrad = ctx.createLinearGradient(0, horizonY - 40, 0, horizonY + 80);
    hazeGrad.addColorStop(0,   'rgba(0,200,255,0.00)');
    hazeGrad.addColorStop(0.4, 'rgba(0,85,204,0.07)');
    hazeGrad.addColorStop(0.7, 'rgba(0,200,255,0.05)');
    hazeGrad.addColorStop(1,   'rgba(0,200,255,0.00)');
    ctx.fillStyle = hazeGrad;
    ctx.fillRect(0, horizonY - 40, W, 120);
  }

  /* ══════════════════════════════════════════
     SHOOTING STAR STREAKS (occasional)
  ══════════════════════════════════════════ */
  const streaks = [];
  function spawnStreak() {
    streaks.push({
      x: Math.random() * W * 0.8,
      y: H * (0.05 + Math.random() * 0.25),
      len: 80 + Math.random() * 140,
      alpha: 0.8,
      fade: 0.012,
    });
  }
  // Spawn a streak occasionally
  let lastStreak = 0;

  function drawStreaks() {
    for (let i = streaks.length - 1; i >= 0; i--) {
      const s = streaks[i];
      const g = ctx.createLinearGradient(s.x, s.y, s.x + s.len, s.y + s.len * 0.3);
      g.addColorStop(0, `rgba(0,200,255,${s.alpha})`);
      g.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x + s.len, s.y + s.len * 0.3);
      ctx.strokeStyle = g;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      s.alpha -= s.fade;
      if (s.alpha <= 0) streaks.splice(i, 1);
    }
  }

  /* ══════════════════════════════════════════
     SKY GRADIENT (top of canvas)
  ══════════════════════════════════════════ */
  function drawSky() {
    const skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.68);
    skyGrad.addColorStop(0,    '#020810');
    skyGrad.addColorStop(0.35, '#030c1c');
    skyGrad.addColorStop(0.65, '#04122b');
    skyGrad.addColorStop(1,    'rgba(0,22,70,0)');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H * 0.68);

    // Moonlight bloom top-left
    const moonGrad = ctx.createRadialGradient(W * 0.15, H * 0.08, 0, W * 0.15, H * 0.08, H * 0.35);
    moonGrad.addColorStop(0,   'rgba(0,200,255,0.05)');
    moonGrad.addColorStop(0.5, 'rgba(0,85,204,0.03)');
    moonGrad.addColorStop(1,   'transparent');
    ctx.fillStyle = moonGrad;
    ctx.fillRect(0, 0, W, H);
  }

  /* ══════════════════════════════════════════
     STAR FIELD (subtle, upper portion)
  ══════════════════════════════════════════ */
  const stars = Array.from({ length: 180 }, () => ({
    x: Math.random() * W,
    y: Math.random() * H * 0.60,
    r: 0.4 + Math.random() * 1.1,
    alpha: 0.3 + Math.random() * 0.6,
    twinklePhase: Math.random() * Math.PI * 2,
    twinkleSpeed: 0.0008 + Math.random() * 0.0015,
  }));

  function drawStars() {
    stars.forEach(s => {
      const twinkle = 0.7 + 0.3 * Math.sin(t * s.twinkleSpeed * 60000 + s.twinklePhase);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,230,255,${s.alpha * twinkle})`;
      ctx.fill();
    });
  }

  /* ══════════════════════════════════════════
     LIGHT REFLECTION on ocean surface
  ══════════════════════════════════════════ */
  function drawReflection() {
    // Moonlight column reflection
    const reflX = W * 0.18;
    const reflW = 60;
    const reflGrad = ctx.createLinearGradient(0, H * 0.63, 0, H);
    reflGrad.addColorStop(0,   'rgba(0,200,255,0.15)');
    reflGrad.addColorStop(0.3, 'rgba(0,200,255,0.08)');
    reflGrad.addColorStop(1,   'rgba(0,200,255,0.00)');
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    // Wobble the reflection with waves
    const wobble = Math.sin(t * 0.0008 * 60000) * 20;
    ctx.beginPath();
    ctx.moveTo(reflX - reflW + wobble, H * 0.63);
    ctx.bezierCurveTo(reflX - reflW * 2 + wobble, H * 0.75, reflX + reflW * 2 + wobble, H * 0.85, reflX - reflW + wobble, H);
    ctx.bezierCurveTo(reflX + reflW * 2 + wobble, H * 0.85, reflX - reflW * 2 + wobble, H * 0.75, reflX + reflW + wobble, H * 0.63);
    ctx.closePath();
    ctx.fillStyle = reflGrad;
    ctx.fill();
    ctx.restore();
  }

  /* ══════════════════════════════════════════
     SITE CONTENT MASK (fade canvas above hero)
  ══════════════════════════════════════════ */
  function drawContentMask() {
    // Vignette edges
    const vignL = ctx.createLinearGradient(0, 0, 80, 0);
    vignL.addColorStop(0, 'rgba(2,6,16,0.55)');
    vignL.addColorStop(1, 'transparent');
    ctx.fillStyle = vignL;
    ctx.fillRect(0, 0, 80, H);

    const vignR = ctx.createLinearGradient(W - 80, 0, W, 0);
    vignR.addColorStop(0, 'transparent');
    vignR.addColorStop(1, 'rgba(2,6,16,0.55)');
    ctx.fillStyle = vignR;
    ctx.fillRect(W - 80, 0, 80, H);
  }

  /* ══════════════════════════════════════════
     RENDER LOOP
  ══════════════════════════════════════════ */
  let lastTime = 0;
  function render(now) {
    const delta = now - lastTime;
    lastTime = now;
    t = now;

    ctx.clearRect(0, 0, W, H);

    drawSky();
    drawStars();
    drawHorizon();
    drawGlow();
    drawWaves();
    drawFoam();
    drawReflection();
    drawParticles();

    // Occasional shooting streaks every 5–12 s
    if (now - lastStreak > 5000 + Math.random() * 7000) {
      spawnStreak();
      lastStreak = now;
    }
    drawStreaks();
    drawContentMask();

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

  /* ══════════════════════════════════════════
     UTILITY
  ══════════════════════════════════════════ */
  function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${Math.min(1, Math.max(0, alpha))})`;
  }

})();

// Subtle floating particles for the About section.
// Concentrated above and below the video center (avoiding the middle
// where the video content lives), giving an atmospheric dust/stardust feel.

export function initAboutParticles(canvas) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return { start() {}, stop() {} };

  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  let w, h;
  let running = false;
  let rafId = 0;

  const PARTICLE_COUNT = 60;
  const particles = [];

  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // Spawn particles in the top 30% and bottom 30% of the viewport
  // (avoids the central video area)
  function spawnParticle(init) {
    const inTop = Math.random() < 0.5;
    const yZone = inTop
      ? Math.random() * 0.32              // top 32%
      : 0.68 + Math.random() * 0.32;      // bottom 32%

    return {
      x: Math.random() * w,
      y: init ? yZone * h : (inTop ? -4 : h + 4),
      vy: inTop ? 0.08 + Math.random() * 0.18 : -(0.08 + Math.random() * 0.18),
      vx: (Math.random() - 0.5) * 0.3,
      r: 0.6 + Math.random() * 1.4,
      alpha: 0.15 + Math.random() * 0.35,
      drift: (Math.random() - 0.5) * 0.0015,
      life: init ? Math.random() : 0,
      maxLife: 0.7 + Math.random() * 0.3,
      hue: 250 + Math.random() * 30,      // violet-blue range
    };
  }

  function init() {
    particles.length = 0;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(spawnParticle(true));
    }
  }

  function tick() {
    if (!running) return;
    ctx.clearRect(0, 0, w, h);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.life += 0.002;

      if (p.life > p.maxLife) {
        particles[i] = spawnParticle(false);
        continue;
      }

      p.x += p.vx;
      p.y += p.vy;
      p.vx += p.drift;

      // Fade in/out over life
      const lifePct = p.life / p.maxLife;
      let fade;
      if (lifePct < 0.15) fade = lifePct / 0.15;
      else if (lifePct > 0.75) fade = (1 - lifePct) / 0.25;
      else fade = 1;

      const a = p.alpha * fade;
      if (a <= 0) continue;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 60%, 78%, ${a})`;
      ctx.fill();

      // Subtle glow
      if (p.r > 1.0) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 55%, 70%, ${a * 0.12})`;
        ctx.fill();
      }
    }

    rafId = requestAnimationFrame(tick);
  }

  resize();
  init();
  window.addEventListener('resize', resize);

  return {
    start() {
      if (running) return;
      running = true;
      rafId = requestAnimationFrame(tick);
    },
    stop() {
      running = false;
      cancelAnimationFrame(rafId);
    },
  };
}

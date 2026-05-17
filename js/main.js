import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { runIntro } from './intro/index.js';
import { initAboutParticles } from './about-particles.js';
import { initSkillsTiles } from './skills-tiles.js';

gsap.registerPlugin(ScrollTrigger);

// ─── Lenis Smooth Scroll ───
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  orientation: 'vertical',
  smoothWheel: true,
});

lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

// ─── Black Hole Visibility Toggle ───
const heroBlackHole = document.getElementById('heroBlackHole');
if (heroBlackHole) {
  // Add visible class immediately to start animations
  setTimeout(() => {
    heroBlackHole.classList.add('hero-black-hole-visible');
  }, 500);
}

// Ensure video plays
const bhVideo = document.getElementById('bhVideo');
if (bhVideo) {
  bhVideo.play().catch(() => {});
}

// ─── About Section Ambient Video (looped with 2s pause between plays) ───
const aboutVideo = document.getElementById('aboutVideo');
const aboutVideoWrap = document.getElementById('aboutVideoWrap');
if (aboutVideo) {
  aboutVideo.play().catch(() => {});
  aboutVideo.addEventListener('ended', () => {
    setTimeout(() => {
      aboutVideo.currentTime = 0;
      aboutVideo.play().catch(() => {});
    }, 2000);
  });
}

// ─── About Section Particles ───
const aboutParticlesCanvas = document.getElementById('aboutParticles');
let aboutParticlesSys = null;
if (aboutParticlesCanvas) {
  aboutParticlesSys = initAboutParticles(aboutParticlesCanvas);
  aboutParticlesSys.start();
}

// ─── Skills Interactive Tiles ───
const tilesGrid = document.getElementById('tilesGrid');
const tilesIndicator = document.getElementById('tilesIndicator');
const tilesIndicatorText = document.getElementById('tilesIndicatorText');
if (tilesGrid) {
  initSkillsTiles({
    gridEl: tilesGrid,
    indicatorEl: tilesIndicator,
    labelEl: tilesIndicatorText,
  });
}

// ─── Custom Cursor (Disabled per user request) ───
const cursorEl = document.getElementById('cursor');
if (cursorEl) {
  cursorEl.style.display = 'none';
}

// ─── DOM refs used by reveal sequence ───
const loaderEl = document.getElementById('loader');
const topNav = document.getElementById('topNav');
const sideNav = document.getElementById('sideNav');
const bottomBar = document.getElementById('bottomBar');
const scrollTrack = document.getElementById('scrollTrack');
const scrollTrackFill = document.getElementById('scrollTrackFill');

// Legacy block-loader is replaced by the cinematic intro — hide it immediately
if (loaderEl) loaderEl.style.display = 'none';

// Pre-state for hero pieces (intro-active CSS adds blur; reveal clears it)
gsap.set('.hero-black-hole', { opacity: 0 });
// Glass panel is persistent — show it immediately (no animation delay)
gsap.set('.hero-glass-panel', { opacity: 1, y: 0 });

// Start the cinematic intro; revealHero() fires on 'intro-complete'
document.addEventListener('intro-complete', () => {
  revealHero();
}, { once: true });

runIntro();

// ─── Hero Reveal ───
function revealHero() {
  topNav.classList.add('visible');
  sideNav.classList.add('visible');
  bottomBar.classList.add('visible');
  scrollTrack.classList.add('visible');

  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

  // Blur-to-sharp on text elements (glass panel already visible)
  gsap.set(['.hero-badge', '.hero-title', '.hero-subtitle'], { filter: 'blur(10px)' });
  tl.to(['.hero-badge', '.hero-title', '.hero-subtitle'], {
    filter: 'blur(0px)',
    duration: 1.4,
    ease: 'power3.out',
  }, 0);

  // Title text animates first
  tl.to('.hero-badge', { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, 0);
  tl.to('.hero-title .line-inner', { y: 0, duration: 1.3, stagger: 0.15 }, 0.2);
  tl.to('.hero-subtitle', { opacity: 1, y: 0, duration: 1.0, ease: 'power2.out' }, 0.5);

  // Video animates in alongside the text (slightly delayed)
  tl.to('.hero-black-hole', { opacity: 1, duration: 1.8, ease: 'power2.out' }, 0.3);

  // Fluid reveal for the word "thought" — morph from turbulent fluid form into crisp letters
  const thoughtChars = document.querySelectorAll('.thought-char');
  thoughtChars.forEach((char, i) => {
    const displaceEl = document.querySelector(`#fluidText${i} feDisplacementMap`);
    const turbEl = document.querySelector(`#fluidText${i} feTurbulence`);
    if (!displaceEl || !turbEl) return;
    const proxy = { scale: 140, freq: 0.022 };
    tl.to(char, { opacity: 1, duration: 0.9, ease: 'power2.out' }, `-=${i === 0 ? 0.7 : 0.85}`);
    tl.to(proxy, {
      scale: 0,
      freq: 0.008,
      duration: 1.4,
      ease: 'power3.out',
      onUpdate: () => {
        displaceEl.setAttribute('scale', proxy.scale);
        turbEl.setAttribute('baseFrequency', proxy.freq);
      },
    }, '<');
  });

  tl.to('.hero-glass-panel', { opacity: 1, y: 0, duration: 1.2 }, '-=0.6');

  ScrollTrigger.refresh(true);
}

// ─── Character Split for Headlines ───
document.querySelectorAll('.reveal-chars').forEach((headline) => {
  const html = headline.innerHTML;
  const parts = html.split(/(<[^>]+>|\s+)/);
  let wrapped = '';
  parts.forEach((part) => {
    if (part.match(/^</) || part.match(/^\s+$/)) {
      wrapped += part;
    } else if (part.trim()) {
      const chars = part.split('');
      wrapped += '<span class="word">' +
        chars.map((c) => `<span class="char"><span class="char-inner">${c}</span></span>`).join('') +
        '</span> ';
    }
  });
  headline.innerHTML = wrapped;
});

// ─── Scroll-Driven Camera + Progress ───
const scrollContainer = document.getElementById('scroll-container');

ScrollTrigger.create({
  trigger: scrollContainer,
  start: 'top top',
  end: 'bottom bottom',
  scrub: 1,
  onUpdate: (self) => {
    // Update scroll progress bar
    if (scrollTrackFill) {
      scrollTrackFill.style.height = (self.progress * 100) + '%';
    }
  },
});

// ─── Section Overlay Reveal/Hide ───
const sections = document.querySelectorAll('.scroll-section');

sections.forEach((section, i) => {
  const overlay = section.querySelector('.section-overlay');
  if (!overlay) return;

  if (i === 0) {
    // Hero — fade out on scroll + crossfade hero black hole → about video
    ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress;
        const fadeOut = 1 - p * 3;
        overlay.style.opacity = Math.max(0, fadeOut);
        overlay.style.visibility = fadeOut > 0 ? 'visible' : 'hidden';

        const glassPanel = document.querySelector('.hero-glass-panel');
        if (glassPanel) {
          glassPanel.style.opacity = Math.max(0, fadeOut);
          glassPanel.style.visibility = fadeOut > 0 ? 'visible' : 'hidden';
        }

        // Hero black hole: 1 → 0 across first ~55% of hero scroll
        if (heroBlackHole) {
          heroBlackHole.style.opacity = Math.max(0, 1 - p / 0.55);
        }
        // About video: 0 → 1 across last ~55% (overlap creates a brief dark moment)
        if (aboutVideoWrap) {
          aboutVideoWrap.style.opacity = Math.max(0, Math.min(1, (p - 0.45) / 0.55));
        }
      },
    });
  } else {
    // Other sections — fade in, hold, fade out
    ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress;
        let alpha;
        if (p < 0.12) alpha = p / 0.12;
        else if (p > 0.78) alpha = (1 - p) / 0.22;
        else alpha = 1;
        alpha = Math.max(0, Math.min(1, alpha));

        overlay.style.opacity = alpha;
        overlay.style.visibility = alpha > 0 ? 'visible' : 'hidden';

        // About video: stay at 1 through about, fade out at the end (heading to work)
        if (i === 1 && aboutVideoWrap) {
          const vAlpha = p > 0.78 ? Math.max(0, 1 - (p - 0.78) / 0.22) : 1;
          aboutVideoWrap.style.opacity = vAlpha;
        }

        // Trigger reveal animations
        if (p > 0.08 && !section.dataset.revealed) {
          section.dataset.revealed = 'true';
          revealSectionContent(overlay, i === 1);
        }
        if (p < 0.04 && section.dataset.revealed) {
          section.dataset.revealed = '';
          hideSectionContent(overlay, i === 1);
        }
      },
    });
  }
});

let aboutRevealTl = null;

function revealSectionContent(overlay, isAbout) {
  const chars = overlay.querySelectorAll('.char-inner');

  if (isAbout && chars.length) {
    // GSAP char-variation-1: skewX + blur + brightness stagger
    aboutRevealTl = gsap.timeline();
    aboutRevealTl.fromTo(chars, {
      skewX: -30,
      filter: 'blur(10px) brightness(0%)',
      willChange: 'filter, transform',
      opacity: 1,
    }, {
      skewX: 0,
      filter: 'blur(0px) brightness(100%)',
      opacity: 1,
      duration: 0.5,
      stagger: 0.05,
      ease: 'none',
    });
    // Mark them revealed so CSS doesn't interfere
    chars.forEach((c) => c.classList.add('revealed'));
  } else {
    chars.forEach((char, i) => {
      setTimeout(() => char.classList.add('revealed'), i * 18);
    });
  }

  const texts = overlay.querySelectorAll('.reveal-text');
  texts.forEach((el, i) => {
    setTimeout(() => el.classList.add('revealed'), isAbout ? 600 + i * 150 : 300 + i * 150);
  });

  const cards = overlay.querySelectorAll('.work-card');
  cards.forEach((el, i) => {
    setTimeout(() => el.classList.add('revealed'), 150 + i * 70);
  });

  const groups = overlay.querySelectorAll('.skill-group');
  groups.forEach((el, i) => {
    setTimeout(() => el.classList.add('revealed'), 150 + i * 120);
  });

  const tilesStage = overlay.querySelector('.tiles-stage');
  if (tilesStage) setTimeout(() => tilesStage.classList.add('revealed'), 250);

  const entries = overlay.querySelectorAll('.exp-entry');
  entries.forEach((el, i) => {
    setTimeout(() => el.classList.add('revealed'), 150 + i * 180);
  });

  const email = overlay.querySelector('.contact-email');
  if (email) setTimeout(() => email.classList.add('revealed'), 350);

  const links = overlay.querySelector('.contact-links');
  if (links) setTimeout(() => links.classList.add('revealed'), 500);
}

function hideSectionContent(overlay, isAbout) {
  if (isAbout && aboutRevealTl) {
    aboutRevealTl.kill();
    aboutRevealTl = null;
    overlay.querySelectorAll('.char-inner').forEach((el) => {
      el.classList.remove('revealed');
      gsap.set(el, { clearProps: 'all' });
    });
  } else {
    overlay.querySelectorAll('.char-inner').forEach((el) => el.classList.remove('revealed'));
  }
  overlay.querySelectorAll('.reveal-text, .work-card, .skill-group, .tiles-stage, .exp-entry, .contact-email, .contact-links').forEach((el) => el.classList.remove('revealed'));
}

// ─── Side Nav Active State ───
sections.forEach((section, i) => {
  ScrollTrigger.create({
    trigger: section,
    start: 'top center',
    end: 'bottom center',
    onEnter: () => setActiveNav(i),
    onEnterBack: () => setActiveNav(i),
  });
});

function setActiveNav(index) {
  document.querySelectorAll('.side-nav-item').forEach((item, i) => {
    item.classList.toggle('active', i === index);
  });
}

// Side nav click navigation
document.querySelectorAll('.side-nav-item').forEach((item) => {
  item.addEventListener('click', () => {
    const idx = parseInt(item.dataset.section);
    const target = sections[idx];
    if (target) lenis.scrollTo(target, { offset: 0, duration: 1.5 });
  });
});


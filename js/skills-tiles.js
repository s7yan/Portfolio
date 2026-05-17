// Interactive tile grid for the Skills section.
// Renders a skewed grid of small tiles whose backgrounds flash random colors
// on hover, with floating logo tiles that reveal a cursor-tracking label.
//
// Vanilla port of the Reflect-style tiles background pattern, adapted to
// vanilla JS + plain CSS (no React, no Tailwind).

const NUM_COLS = 15;
const COLORS = ['#7B5BFF', '#22D3EE', '#F472B6', '#FBBF24', '#34D399'];

// Logo tiles, clustered around the center of the (NUM_COLS * 2) sub-grid.
// Center of the 30-col virtual grid is (15, 15). The "Explore" label sits
// dead-center so we leave a small gap around rows 13-16, cols 13-17.
const LOGOS = [
  // ── top row ──
  { left:  9, top:  8, w: 3, h: 3, src: '/logos/googlegemini.svg', label: 'Google AI Studio' },
  { left: 14, top:  7, w: 3, h: 3, src: '/logos/claude.svg',       label: 'Claude' },
  { left: 19, top:  8, w: 3, h: 3, src: '/logos/chatgpt.svg',      label: 'ChatGPT' },

  // ── upper-middle band ──
  { left:  5, top: 11, w: 3, h: 3, src: '/logos/antigravity.svg',  label: 'Google Antigravity' },
  { left: 10, top: 12, w: 3, h: 4, src: '/logos/figma.svg',        label: 'Figma' },
  { left: 19, top: 12, w: 3, h: 3, src: '/logos/adobe.svg',        label: 'Adobe Suite' },
  { left: 24, top: 11, w: 3, h: 3, src: '/logos/spline.svg',       label: 'Spline' },

  // ── lower-middle band (below the "Explore" label) ──
  { left:  4, top: 17, w: 3, h: 3, src: '/logos/photoshop.svg',    label: 'Photoshop' },
  { left:  9, top: 18, w: 3, h: 3, src: '/logos/illustrator.svg',  label: 'Illustrator' },
  { left: 14, top: 19, w: 4, h: 3, src: '/logos/unity.svg',        label: 'Unity' },
  { left: 20, top: 18, w: 3, h: 3, src: '/logos/aftereffects.svg', label: 'After Effects' },
  { left: 24, top: 19, w: 3, h: 3, src: '/logos/protopie.svg',     label: 'ProtoPie' },
];

export function initSkillsTiles({ gridEl, indicatorEl, labelEl }) {
  if (!gridEl) return;

  // ─── Build the static tile background ───
  const totalTiles = NUM_COLS * NUM_COLS;
  const frag = document.createDocumentFragment();

  for (let i = 0; i < totalTiles; i++) {
    const cell = document.createElement('div');
    cell.className = 'tile-cell';

    // Crosshair SVG in the cell center
    cell.innerHTML =
      '<svg class="tile-cross" viewBox="0 0 114 113" aria-hidden="true">' +
        '<path d="M57.5 0L57.5 113M0.5 56H113.5" stroke="currentColor" stroke-width="3"/>' +
      '</svg>';

    // 4 sub-tiles inside each cell (the actual hover targets)
    for (let j = 0; j < 4; j++) {
      const sub = document.createElement('div');
      sub.className = 'tile-sub';
      cell.appendChild(sub);
    }
    frag.appendChild(cell);
  }
  gridEl.appendChild(frag);

  // ─── Add the logo tiles on top ───
  const totalCols = NUM_COLS * 2;
  LOGOS.forEach((logo) => {
    const tile = document.createElement('div');
    tile.className = 'tile-logo';
    tile.dataset.label = logo.label;
    tile.style.left = (logo.left  / totalCols) * 100 + '%';
    tile.style.top  = (logo.top   / totalCols) * 100 + '%';
    tile.style.width = (logo.w    / totalCols) * 100 + '%';
    tile.style.aspectRatio = `${logo.w} / ${logo.h}`;

    const img = document.createElement('img');
    img.src = logo.src;
    img.alt = logo.label;
    img.loading = 'lazy';
    img.draggable = false;
    tile.appendChild(img);

    gridEl.appendChild(tile);
  });

  // ─── Sub-tile hover: random color flash, slow fade out ───
  gridEl.addEventListener('pointerover', (e) => {
    const t = e.target;
    if (!t.classList || !t.classList.contains('tile-sub')) return;
    t.style.transitionDuration = '0ms';
    t.style.backgroundColor = COLORS[Math.floor(Math.random() * COLORS.length)];
  });
  gridEl.addEventListener('pointerout', (e) => {
    const t = e.target;
    if (!t.classList || !t.classList.contains('tile-sub')) return;
    t.style.transitionDuration = '1000ms';
    t.style.backgroundColor = 'transparent';
  });

  // ─── Logo hover: cursor-tracking label ───
  let lastLabel = '';
  let rafId = 0;
  let targetX = 0, targetY = 0;
  let curX = 0,    curY = 0;
  let active = false;

  const animateLabel = () => {
    // ease toward target
    curX += (targetX - curX) * 0.18;
    curY += (targetY - curY) * 0.18;
    if (indicatorEl) {
      indicatorEl.style.transform =
        `translate(${curX}px, calc(-100% + ${curY}px))`;
    }
    if (active || Math.abs(targetX - curX) > 0.5 || Math.abs(targetY - curY) > 0.5) {
      rafId = requestAnimationFrame(animateLabel);
    } else {
      rafId = 0;
    }
  };

  gridEl.addEventListener('pointermove', (e) => {
    const tile = e.target.closest('.tile-logo');
    if (!tile) return;
    const label = tile.dataset.label;
    if (label && label !== lastLabel) {
      lastLabel = label;
      if (labelEl) labelEl.textContent = label;
    }
    targetX = e.clientX;
    targetY = e.clientY;
    if (!active) {
      active = true;
      if (indicatorEl) indicatorEl.classList.add('visible');
    }
    if (!rafId) rafId = requestAnimationFrame(animateLabel);
  });

  gridEl.addEventListener('pointerleave', () => {
    active = false;
    if (indicatorEl) indicatorEl.classList.remove('visible');
  });

  // Hide indicator if pointer leaves any logo tile
  gridEl.querySelectorAll('.tile-logo').forEach((tile) => {
    tile.addEventListener('pointerleave', () => {
      active = false;
      if (indicatorEl) indicatorEl.classList.remove('visible');
    });
  });
}

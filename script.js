/* ============================================================
   HAPPY BIRTHDAY — INTERACTIVE 3D BOOK
   script.js — organised into small, single-purpose functions.
   ============================================================ */

(function () {
  'use strict';

  /* ---------- DOM references ---------- */
  const book          = document.getElementById('book');
  const hint          = document.getElementById('hint');
  const petalLayer    = document.getElementById('petalLayer');
  const bokehLayer    = document.getElementById('bokehLayer');
  const sparkleLeft   = document.getElementById('sparkleFieldLeft');
  const sparkleRight  = document.getElementById('sparkleFieldRight');
  const frontCover    = document.getElementById('frontCover');
  const messageLines  = document.querySelectorAll('.message-line');

  /* Guards against the open animation firing more than once. */
  let isAnimating = false;
  let hasOpened = false;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ==========================================================
     1. AMBIENT BACKGROUND — floating petals
     ========================================================== */
  function createPetal() {
    const petal = document.createElement('div');
    petal.className = 'petal';

    const size = 10 + Math.random() * 14;
    const startLeft = Math.random() * 100;
    const duration = 12 + Math.random() * 10;
    const delay = Math.random() * -20; // negative delay staggers initial positions
    const drift = (Math.random() * 160 - 80).toFixed(0) + 'px';
    const isBlue = Math.random() > 0.5;

    petal.style.left = startLeft + 'vw';
    petal.style.animationDuration = duration + 's';
    petal.style.animationDelay = delay + 's';
    petal.style.setProperty('--drift', drift);

    // simple petal silhouette drawn with SVG, tinted per-instance
    petal.innerHTML =
      '<svg width="' + size + '" height="' + size * 1.2 + '" viewBox="0 0 20 24">' +
      '<path d="M10 0 C18 4 18 16 10 24 C2 16 2 4 10 0 Z" fill="' +
      (isBlue ? '#BEDDEF' : '#FFFFFF') + '" opacity="0.9"/></svg>';

    petalLayer.appendChild(petal);
  }

  function initPetals(count) {
    for (let i = 0; i < count; i++) createPetal();
  }

  /* ---------- 2. AMBIENT BACKGROUND — bokeh lights ---------- */
  function createBokeh() {
    const dot = document.createElement('div');
    dot.className = 'bokeh';

    const size = 20 + Math.random() * 50;
    dot.style.width = size + 'px';
    dot.style.height = size + 'px';
    dot.style.left = Math.random() * 100 + 'vw';
    dot.style.top = Math.random() * 100 + 'vh';
    dot.style.animationDuration = (6 + Math.random() * 8) + 's';
    dot.style.animationDelay = (Math.random() * -10) + 's';
    dot.style.setProperty('--bokeh-op', (0.2 + Math.random() * 0.4).toFixed(2));

    bokehLayer.appendChild(dot);
  }

  function initBokeh(count) {
    for (let i = 0; i < count; i++) createBokeh();
  }

  /* ==========================================================
     3. SPARKLE BURST — the "magical glow" during the reveal delay
     ========================================================== */
  function spawnSparkle(container) {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    sparkle.style.left = (10 + Math.random() * 80) + '%';
    sparkle.style.top = (10 + Math.random() * 80) + '%';
    sparkle.style.animationDelay = (Math.random() * 0.3) + 's';
    container.appendChild(sparkle);

    // clean up after the animation completes so the DOM doesn't grow forever
    sparkle.addEventListener('animationend', () => sparkle.remove());
  }

  function runSparkleBurst(durationMs) {
    if (reducedMotion) return;
    const interval = setInterval(() => {
      spawnSparkle(sparkleLeft);
      spawnSparkle(sparkleRight);
    }, 140);

    setTimeout(() => clearInterval(interval), durationMs);
  }

  /* ==========================================================
     4. STAGGERED MESSAGE REVEAL
     ========================================================== */
  function revealMessage() {
    messageLines.forEach((line, index) => {
      line.style.transitionDelay = (index * 0.18) + 's';
    });
    book.classList.add('is-revealed');
  }

  /* ==========================================================
     5. BOOK OPEN SEQUENCE (with re-entrancy guard)
     ========================================================== */
  function openBook() {
    if (isAnimating || hasOpened) return; // prevent replay while running / after done
    isAnimating = true;
    hasOpened = true;

    book.classList.add('is-open');
    if (hint) hint.classList.add('is-hidden');

    // Wait for the cover's rotation transition to finish before
    // starting the "magical glow" delay + message reveal.
    const onCoverTransitionEnd = (event) => {
      if (event.target !== frontCover || event.propertyName !== 'transform') return;
      frontCover.removeEventListener('transitionend', onCoverTransitionEnd);

      runSparkleBurst(1100);

      // ~1 second pause with sparkles before the birthday message appears
      setTimeout(() => {
        revealMessage();
        isAnimating = false;
      }, 1000);
    };

    frontCover.addEventListener('transitionend', onCoverTransitionEnd);

    // Fallback in case transitionend doesn't fire (e.g. reduced motion)
    if (reducedMotion) {
      setTimeout(() => {
        revealMessage();
        isAnimating = false;
      }, 50);
    }
  }

  /* ==========================================================
     6. EVENT WIRING — click, touch, keyboard
     ========================================================== */
  function initInteractions() {
    book.addEventListener('click', openBook);

    book.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openBook();
      }
    });

    // touch devices already receive 'click' via tap, but this keeps
    // the tap responsive and avoids any ghost-click delay
    book.addEventListener(
      'touchend',
      (e) => {
        e.preventDefault();
        openBook();
      },
      { passive: false }
    );
  }

  /* ==========================================================
     INIT
     ========================================================== */
  function init() {
    initPetals(16);
    initBokeh(14);
    initInteractions();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
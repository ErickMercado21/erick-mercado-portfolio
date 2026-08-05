/* ============================================================
   erickmercado.com — shared behaviour for every page.
   Vanilla. No dependencies, nothing to break, nothing to update.
   All motion is progressive enhancement: content is fully
   readable if this file never loads.
   ============================================================ */

(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- footer year -------------------------------------- */
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---- mark the current nav item ------------------------ */
  var page = document.body.getAttribute('data-page');
  if (page) {
    var links = document.querySelectorAll('[data-nav]');
    for (var i = 0; i < links.length; i++) {
      if (links[i].getAttribute('data-nav') === page) {
        links[i].setAttribute('aria-current', 'page');
      }
    }
  }

  /* ---- scroll reveal ------------------------------------ *
   * Tag things automatically so no page markup has to change
   * when you add a section. Grids get a stagger so their cards
   * arrive in sequence instead of all at once.
   * ------------------------------------------------------- */
  if (!reduce && 'IntersectionObserver' in window) {

    var singles = document.querySelectorAll(
      '.band > .eyebrow, .band > h2, .band > p, .bridge, .entry, .prose > h2, .sidecar'
    );
    var grids = document.querySelectorAll('.pair, .principles, .readout, .meta');

    for (var s = 0; s < singles.length; s++) singles[s].classList.add('reveal');
    for (var g = 0; g < grids.length; g++) grids[g].classList.add('reveal-stagger');

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    document.querySelectorAll('.reveal, .reveal-stagger').forEach(function (el) {
      io.observe(el);
    });
  }

  /* ---- hero parallax + fade ----------------------------- *
   * The hero scales down and fades as it scrolls away, so the
   * first section feels like it rises over it. Cheap: transform
   * and opacity only, batched into requestAnimationFrame.
   * ------------------------------------------------------- */
  var hero = document.querySelector('.hero');
  if (hero && !reduce) {
    var ticking = false;

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        var h = hero.offsetHeight || 1;
        var p = Math.min(y / h, 1);           // 0 → 1 across the hero
        hero.style.transform = 'scale(' + (1 - p * 0.06).toFixed(4) + ')';
        hero.style.opacity = (1 - p * 0.85).toFixed(3);
        ticking = false;
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---- the signal trace --------------------------------- *
   * Noise on the left, a clean resolved signal on the right.
   * Drop <svg class="trace"> with a #sig path on any page.
   * ------------------------------------------------------- */
  var path = document.getElementById('sig');
  if (!path) return;

  var W = 1200, MID = 80, t = 0, running = true;

  function build(time) {
    var pts = [], N = 240;
    for (var i = 0; i <= N; i++) {
      var x = (i / N) * W;
      var settle = i / N;          // 0 = noise, 1 = resolved
      var noise = 1 - settle;

      var carrier = Math.sin(i * 0.11 + time) * 26 * (0.35 + settle * 0.65);
      var jitter = (Math.sin(i * 1.7 + time * 2.3) + Math.sin(i * 3.1 - time * 1.4)) * 13 * noise * noise;
      var drift = Math.sin(i * 0.02 - time * 0.4) * 9 * noise;

      pts.push(x.toFixed(1) + ',' + (MID + carrier + jitter + drift).toFixed(1));
    }
    return 'M' + pts.join(' L');
  }

  path.setAttribute('d', build(0));
  if (reduce) return;

  function frame() {
    if (!running) return;
    t += 0.016;
    path.setAttribute('d', build(t));
    requestAnimationFrame(frame);
  }

  document.addEventListener('visibilitychange', function () {
    running = !document.hidden;
    if (running) requestAnimationFrame(frame);
  });

  requestAnimationFrame(frame);
})();
